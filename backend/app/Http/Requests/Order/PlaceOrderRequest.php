<?php

namespace App\Http\Requests\Order;

use Illuminate\Foundation\Http\FormRequest;

class PlaceOrderRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'address_id'     => ['required', 'exists:addresses,id'],
            'coupon_code'    => ['nullable', 'string', 'exists:coupons,code'],
            'payment_method' => ['required', 'string', 'in:stripe,cod'],
            'notes'          => ['nullable', 'string', 'max:500'],
        ];
    }
}
