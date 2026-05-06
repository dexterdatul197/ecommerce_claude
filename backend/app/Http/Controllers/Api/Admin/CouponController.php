<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Coupon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CouponController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $coupons = Coupon::withCount('orders')
            ->when($request->filled('is_active'), fn($q) => $q->where('is_active', $request->boolean('is_active')))
            ->latest()
            ->paginate(20);

        return response()->json([
            'data' => $coupons->items(),
            'meta' => ['total' => $coupons->total(), 'last_page' => $coupons->lastPage()],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'code'             => ['required', 'string', 'max:50', 'unique:coupons,code'],
            'type'             => ['required', 'in:percentage,fixed'],
            'value'            => ['required', 'numeric', 'min:0'],
            'min_order_amount' => ['nullable', 'numeric', 'min:0'],
            'max_uses'         => ['nullable', 'integer', 'min:1'],
            'expires_at'       => ['nullable', 'date', 'after:now'],
            'is_active'        => ['boolean'],
        ]);

        $data['code'] = strtoupper($data['code']);
        $coupon = Coupon::create($data);

        return response()->json(['data' => $coupon, 'message' => 'Coupon created.'], 201);
    }

    public function show(int $id): JsonResponse
    {
        return response()->json(['data' => Coupon::withCount('orders')->findOrFail($id)]);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $coupon = Coupon::findOrFail($id);

        $data = $request->validate([
            'type'             => ['sometimes', 'in:percentage,fixed'],
            'value'            => ['sometimes', 'numeric', 'min:0'],
            'min_order_amount' => ['nullable', 'numeric', 'min:0'],
            'max_uses'         => ['nullable', 'integer', 'min:1'],
            'expires_at'       => ['nullable', 'date'],
            'is_active'        => ['sometimes', 'boolean'],
        ]);

        $coupon->update($data);

        return response()->json(['data' => $coupon, 'message' => 'Coupon updated.']);
    }

    public function destroy(int $id): JsonResponse
    {
        Coupon::findOrFail($id)->delete();

        return response()->json(['message' => 'Coupon deleted.']);
    }
}
