<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                => $this->id,
            'name'              => $this->name,
            'slug'              => $this->slug,
            'description'       => $this->description,
            'short_description' => $this->short_description,
            'price'             => $this->price,
            'compare_price'     => $this->compare_price,
            'cost_price'        => $this->when($request->user()?->isAdmin(), $this->cost_price),
            'stock'             => $this->stock,
            'sku'               => $this->sku,
            'featured'          => $this->featured,
            'status'            => $this->status,
            'weight'            => $this->weight,
            'average_rating'    => $this->average_rating,
            'reviews_count'     => $this->reviews_count,
            'category'          => new CategoryResource($this->whenLoaded('category')),
            'images'            => ProductImageResource::collection($this->whenLoaded('images')),
            'attributes'        => ProductAttributeResource::collection($this->whenLoaded('attributes')),
        ];
    }
}
