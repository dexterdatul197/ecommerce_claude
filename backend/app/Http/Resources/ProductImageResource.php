<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductImageResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $url = str_starts_with($this->url, 'http')
            ? $this->url
            : \Illuminate\Support\Facades\Storage::disk('public')->url($this->url);

        return [
            'id'         => $this->id,
            'url'        => $url,
            'alt'        => $this->alt,
            'sort_order' => $this->sort_order,
        ];
    }
}
