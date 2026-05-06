<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\CartItemResource;
use App\Models\CartItem;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CartController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $items = CartItem::with(['product.images', 'attribute'])
            ->where('user_id', $request->user()->id)
            ->get();

        $subtotal = $items->sum(fn($item) => $item->total_price);

        return response()->json([
            'data'     => CartItemResource::collection($items),
            'subtotal' => round($subtotal, 2),
            'count'    => $items->sum('quantity'),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'product_id'   => ['required', 'exists:products,id'],
            'attribute_id' => ['nullable', 'exists:product_attributes,id'],
            'quantity'     => ['required', 'integer', 'min:1'],
        ]);

        $product = Product::findOrFail($data['product_id']);

        if ($product->status !== 'active') {
            return response()->json(['message' => 'Product is not available.'], 422);
        }

        $existing = CartItem::where('user_id', $request->user()->id)
            ->where('product_id', $data['product_id'])
            ->where('attribute_id', $data['attribute_id'] ?? null)
            ->first();

        if ($existing) {
            $existing->increment('quantity', $data['quantity']);
            $item = $existing->load(['product.images', 'attribute']);
        } else {
            $item = CartItem::create([
                'user_id'      => $request->user()->id,
                'product_id'   => $data['product_id'],
                'attribute_id' => $data['attribute_id'] ?? null,
                'quantity'     => $data['quantity'],
            ])->load(['product.images', 'attribute']);
        }

        return response()->json([
            'data'    => new CartItemResource($item),
            'message' => 'Item added to cart.',
        ], 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $data = $request->validate([
            'quantity' => ['required', 'integer', 'min:1'],
        ]);

        $item = CartItem::where('user_id', $request->user()->id)->findOrFail($id);
        $item->update(['quantity' => $data['quantity']]);

        return response()->json([
            'data'    => new CartItemResource($item->load(['product.images', 'attribute'])),
            'message' => 'Cart updated.',
        ]);
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        CartItem::where('user_id', $request->user()->id)->findOrFail($id)->delete();

        return response()->json(['message' => 'Item removed from cart.']);
    }

    public function clear(Request $request): JsonResponse
    {
        CartItem::where('user_id', $request->user()->id)->delete();

        return response()->json(['message' => 'Cart cleared.']);
    }
}
