<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\ReviewResource;
use App\Models\Review;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $reviews = Review::with(['user', 'product'])
            ->when($request->filled('status'), fn($q) => $q->where('status', $request->status))
            ->when($request->filled('product_id'), fn($q) => $q->where('product_id', $request->product_id))
            ->latest()
            ->paginate(20);

        return response()->json([
            'data' => ReviewResource::collection($reviews),
            'meta' => ['total' => $reviews->total(), 'last_page' => $reviews->lastPage()],
        ]);
    }

    public function updateStatus(Request $request, int $id): JsonResponse
    {
        $data   = $request->validate(['status' => ['required', 'in:approved,rejected,pending']]);
        $review = Review::findOrFail($id);
        $review->update($data);

        return response()->json([
            'data'    => new ReviewResource($review->load('user')),
            'message' => "Review {$data['status']}.",
        ]);
    }

    public function destroy(int $id): JsonResponse
    {
        Review::findOrFail($id)->delete();

        return response()->json(['message' => 'Review deleted.']);
    }
}
