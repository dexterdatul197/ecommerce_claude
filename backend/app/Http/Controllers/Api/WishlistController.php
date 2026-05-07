<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductListResource;
use App\Models\Product;
use App\Models\Wishlist;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WishlistController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $items = Wishlist::with(['product.images', 'product.category'])
            ->where('user_id', $request->user()->id)
            ->latest()
            ->get();

        return response()->json([
            'data'        => $items->map(fn($w) => [
                'id'         => $w->id,
                'product_id' => $w->product_id,
                'product'    => $w->product ? new ProductListResource($w->product) : null,
            ]),
            'product_ids' => $items->pluck('product_id'),
        ]);
    }

    public function store(Request $request, int $productId): JsonResponse
    {
        Product::active()->findOrFail($productId);

        Wishlist::firstOrCreate([
            'user_id'    => $request->user()->id,
            'product_id' => $productId,
        ]);

        return response()->json(['message' => 'Added to wishlist.'], 201);
    }

    public function destroy(Request $request, int $productId): JsonResponse
    {
        Wishlist::where('user_id', $request->user()->id)
            ->where('product_id', $productId)
            ->delete();

        return response()->json(['message' => 'Removed from wishlist.']);
    }
}
