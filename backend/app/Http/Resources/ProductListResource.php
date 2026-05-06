<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductListResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                => $this->id,
            'name'              => $this->name,
            'slug'              => $this->slug,
            'short_description' => $this->short_description,
            'price'             => $this->price,
            'compare_price'     => $this->compare_price,
            'stock'             => $this->stock,
            'sku'               => $this->sku,
            'featured'          => $this->featured,
            'status'            => $this->status,
            'average_rating'    => $this->average_rating,
            'reviews_count'     => $this->reviews_count,
            'category'          => new CategoryResource($this->whenLoaded('category')),
            'primary_image'     => $this->images->first()?->url,
        ];
    }
}
