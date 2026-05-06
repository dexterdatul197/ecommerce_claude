<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Coupon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CouponController extends Controller
{
    public function validateCoupon(Request $request): JsonResponse
    {
        $data = $request->validate([
            'code'     => ['required', 'string'],
            'subtotal' => ['required', 'numeric', 'min:0'],
        ]);

        $coupon = Coupon::where('code', strtoupper($data['code']))->first();

        if (! $coupon || ! $coupon->isValid()) {
            return response()->json(['message' => 'Invalid or expired coupon code.'], 422);
        }

        $discount = $coupon->calculateDiscount($data['subtotal']);

        if ($discount === 0.0 && $coupon->min_order_amount) {
            return response()->json([
                'message' => "Minimum order amount is \${$coupon->min_order_amount} for this coupon.",
            ], 422);
        }

        return response()->json([
            'data' => [
                'code'             => $coupon->code,
                'type'             => $coupon->type,
                'value'            => $coupon->value,
                'discount_amount'  => $discount,
                'min_order_amount' => $coupon->min_order_amount,
            ],
        ]);
    }
}
