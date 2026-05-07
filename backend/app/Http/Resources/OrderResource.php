<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'               => $this->id,
            'order_number'     => $this->order_number,
            'status'           => $this->status,
            'subtotal'         => $this->subtotal,
            'discount_amount'  => $this->discount_amount,
            'shipping_amount'  => $this->shipping_amount,
            'tax_amount'       => $this->tax_amount,
            'total'            => $this->total,
            'payment_status'   => $this->payment_status,
            'payment_method'   => $this->payment_method,
            'shipping_name'    => $this->shipping_name,
            'shipping_phone'   => $this->shipping_phone,
            'shipping_address' => $this->shipping_address,
            'notes'            => $this->notes,
            'created_at'       => $this->created_at,
            'coupon'           => $this->whenLoaded('coupon', fn() => [
                'code'  => $this->coupon->code,
                'type'  => $this->coupon->type,
                'value' => $this->coupon->value,
            ]),
            'items'            => OrderItemResource::collection($this->whenLoaded('items')),
        ];
    }
}
