<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ReviewResource;
use App\Models\Product;
use App\Models\Review;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    public function index(Request $request, int $id): JsonResponse
    {
        $product = Product::findOrFail($id);

        $reviews = Review::with('user')
            ->where('product_id', $product->id)
            ->where('status', 'approved')
            ->latest()
            ->paginate(10);

        $summary = [
            'average' => round($product->reviews()->avg('rating') ?? 0, 1),
            'total'   => $product->reviews()->count(),
            'breakdown' => Review::where('product_id', $id)
                ->where('status', 'approved')
                ->selectRaw('rating, COUNT(*) as count')
                ->groupBy('rating')
                ->pluck('count', 'rating'),
        ];

        return response()->json([
            'data'    => ReviewResource::collection($reviews),
            'summary' => $summary,
            'meta'    => ['total' => $reviews->total(), 'last_page' => $reviews->lastPage()],
        ]);
    }

    public function store(Request $request, int $id): JsonResponse
    {
        $product = Product::active()->findOrFail($id);

        $hasPurchased = $request->user()
            ->orders()
            ->whereNotIn('status', ['cancelled'])
            ->whereHas('items', fn($q) => $q->where('product_id', $id))
            ->exists();

        if (! $hasPurchased) {
            return response()->json(['message' => 'You can only review products you have purchased and received.'], 403);
        }

        $alreadyReviewed = Review::where('user_id', $request->user()->id)
            ->where('product_id', $id)
            ->exists();

        if ($alreadyReviewed) {
            return response()->json(['message' => 'You have already reviewed this product.'], 422);
        }

        $data = $request->validate([
            'rating' => ['required', 'integer', 'min:1', 'max:5'],
            'title'  => ['nullable', 'string', 'max:255'],
            'body'   => ['required', 'string', 'min:10'],
        ]);

        $review = Review::create([
            'user_id'    => $request->user()->id,
            'product_id' => $id,
            ...$data,
        ]);

        return response()->json([
            'data'    => new ReviewResource($review->load('user')),
            'message' => 'Review submitted and pending approval.',
        ], 201);
    }
}
