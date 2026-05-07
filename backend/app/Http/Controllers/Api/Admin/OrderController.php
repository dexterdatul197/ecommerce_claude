<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $orders = Order::with(['user', 'items', 'coupon'])
            ->when($request->filled('status'), fn($q) => $q->where('status', $request->status))
            ->when($request->filled('payment_status'), fn($q) => $q->where('payment_status', $request->payment_status))
            ->when($request->filled('search'), fn($q) =>
                $q->whereHas('user', fn($u) => $u->where('name', 'like', "%{$request->search}%")
                    ->orWhere('email', 'like', "%{$request->search}%"))
                  ->orWhere('id', $request->search)
            )
            ->latest()
            ->paginate($request->get('per_page', 20));

        return response()->json([
            'data' => OrderResource::collection($orders),
            'meta' => ['total' => $orders->total(), 'last_page' => $orders->lastPage()],
        ]);
    }

    public function show(int $id): JsonResponse
    {
        $order = Order::with(['user', 'items.product', 'coupon'])->findOrFail($id);

        return response()->json(['data' => new OrderResource($order)]);
    }

    public function bulkUpdateStatus(Request $request): JsonResponse
    {
        $data = $request->validate([
            'ids'    => ['required', 'array'],
            'ids.*'  => ['integer'],
            'status' => ['required', 'in:pending,processing,shipped,delivered,cancelled'],
        ]);

        Order::whereIn('id', $data['ids'])->update(['status' => $data['status']]);

        return response()->json(['message' => 'Orders updated.', 'count' => count($data['ids'])]);
    }

    public function updateStatus(Request $request, int $id): JsonResponse
    {
        $data  = $request->validate([
            'status'         => ['required', 'in:pending,processing,shipped,delivered,cancelled'],
            'payment_status' => ['sometimes', 'in:pending,paid,failed,refunded'],
        ]);

        $order = Order::findOrFail($id);
        $order->update($data);

        return response()->json([
            'data'    => new OrderResource($order->fresh(['user', 'items', 'coupon'])),
            'message' => 'Order status updated.',
        ]);
    }
}
