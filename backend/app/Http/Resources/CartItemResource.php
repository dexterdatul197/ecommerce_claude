<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CartItemResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'          => $this->id,
            'quantity'    => $this->quantity,
            'unit_price'  => $this->unit_price,
            'total_price' => $this->total_price,
            'product'     => [
                'id'            => $this->product->id,
                'name'          => $this->product->name,
                'slug'          => $this->product->slug,
                'sku'           => $this->product->sku,
                'stock'         => $this->product->stock,
                'primary_image' => $this->product->images->first()?->url,
            ],
            'attribute'   => $this->attribute_id ? [
                'id'    => $this->attribute->id,
                'name'  => $this->attribute->name,
                'value' => $this->attribute->value,
            ] : null,
        ];
    }
}
