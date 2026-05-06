<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Order\PlaceOrderRequest;
use App\Http\Resources\OrderResource;
use App\Models\Address;
use App\Models\CartItem;
use App\Models\Coupon;
use App\Models\Order;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Stripe\StripeClient;

class OrderController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $orders = Order::where('user_id', $request->user()->id)
            ->with(['items', 'coupon'])
            ->latest()
            ->paginate(15);

        return response()->json([
            'data' => OrderResource::collection($orders),
            'meta' => ['total' => $orders->total(), 'last_page' => $orders->lastPage()],
        ]);
    }

    public function show(Request $request, int $id): JsonResponse
    {
        $order = Order::where('user_id', $request->user()->id)
            ->with(['items', 'coupon'])
            ->findOrFail($id);

        return response()->json(['data' => new OrderResource($order)]);
    }

    public function store(PlaceOrderRequest $request): JsonResponse
    {
        $user    = $request->user();
        $address = Address::where('user_id', $user->id)->findOrFail($request->address_id);
        $items   = CartItem::with(['product', 'attribute'])->where('user_id', $user->id)->get();

        if ($items->isEmpty()) {
            return response()->json(['message' => 'Your cart is empty.'], 422);
        }

        // Validate stock for all items
        foreach ($items as $item) {
            if ($item->product->stock < $item->quantity) {
                return response()->json([
                    'message' => "Insufficient stock for \"{$item->product->name}\".",
                ], 422);
            }
        }

        $subtotal       = $items->sum(fn($i) => $i->total_price);
        $discountAmount = 0;
        $coupon         = null;

        if ($request->filled('coupon_code')) {
            $coupon = Coupon::where('code', $request->coupon_code)->first();
            if ($coupon && $coupon->isValid()) {
                $discountAmount = $coupon->calculateDiscount($subtotal);
            }
        }

        $shippingAmount = 5.00;
        $taxAmount      = round(($subtotal - $discountAmount) * 0.08, 2);
        $total          = round($subtotal - $discountAmount + $shippingAmount + $taxAmount, 2);

        $order = DB::transaction(function () use (
            $user, $address, $items, $subtotal, $discountAmount,
            $shippingAmount, $taxAmount, $total, $coupon, $request
        ) {
            $order = Order::create([
                'user_id'          => $user->id,
                'coupon_id'        => $coupon?->id,
                'status'           => 'pending',
                'payment_status'   => 'pending',
                'subtotal'         => $subtotal,
                'discount_amount'  => $discountAmount,
                'shipping_amount'  => $shippingAmount,
                'tax_amount'       => $taxAmount,
                'total'            => $total,
                'payment_method'   => $request->payment_method,
                'shipping_name'    => $address->name,
                'shipping_phone'   => $address->phone,
                'shipping_address' => [
                    'line1'   => $address->line1,
                    'line2'   => $address->line2,
                    'city'    => $address->city,
                    'state'   => $address->state,
                    'zip'     => $address->zip,
                    'country' => $address->country,
                ],
                'notes' => $request->notes,
            ]);

            foreach ($items as $item) {
                $order->items()->create([
                    'product_id'       => $item->product_id,
                    'product_name'     => $item->product->name,
                    'product_sku'      => $item->product->sku,
                    'quantity'         => $item->quantity,
                    'unit_price'       => $item->unit_price,
                    'total_price'      => $item->total_price,
                    'product_snapshot' => [
                        'name'          => $item->product->name,
                        'sku'           => $item->product->sku,
                        'price'         => $item->product->price,
                        'primary_image' => $item->product->images->first()?->url,
                    ],
                ]);

                $item->product->decrement('stock', $item->quantity);
            }

            if ($coupon) {
                $coupon->increment('used_count');
            }

            CartItem::where('user_id', $user->id)->delete();

            return $order;
        });

        return response()->json([
            'data'    => new OrderResource($order->load(['items', 'coupon'])),
            'message' => 'Order placed successfully.',
        ], 201);
    }

    public function cancel(Request $request, int $id): JsonResponse
    {
        $order = Order::where('user_id', $request->user()->id)->findOrFail($id);

        if (! $order->canCancel()) {
            return response()->json(['message' => 'This order cannot be cancelled.'], 422);
        }

        DB::transaction(function () use ($order) {
            foreach ($order->items as $item) {
                if ($item->product_id) {
                    $item->product->increment('stock', $item->quantity);
                }
            }
            $order->update(['status' => 'cancelled']);
        });

        return response()->json(['message' => 'Order cancelled successfully.']);
    }

    public function createPaymentIntent(Request $request): JsonResponse
    {
        $request->validate(['order_id' => ['required', 'exists:orders,id']]);

        $order = Order::where('user_id', $request->user()->id)->findOrFail($request->order_id);

        $stripe = new StripeClient(config('services.stripe.secret'));

        $intent = $stripe->paymentIntents->create([
            'amount'   => (int) ($order->total * 100),
            'currency' => 'usd',
            'metadata' => ['order_id' => $order->id],
        ]);

        $order->update(['payment_intent_id' => $intent->id]);

        return response()->json(['client_secret' => $intent->client_secret]);
    }

    public function confirmPayment(Request $request, int $orderId): JsonResponse
    {
        $order = Order::where('user_id', $request->user()->id)->findOrFail($orderId);

        $stripe = new StripeClient(config('services.stripe.secret'));
        $intent = $stripe->paymentIntents->retrieve($order->payment_intent_id);

        if ($intent->status === 'succeeded') {
            $order->update([
                'payment_status' => 'paid',
                'status'         => 'processing',
            ]);
            return response()->json(['message' => 'Payment confirmed.']);
        }

        return response()->json(['message' => 'Payment not completed yet.'], 422);
    }
}
