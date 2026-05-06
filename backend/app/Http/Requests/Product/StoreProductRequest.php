<?php

namespace App\Http\Requests\Product;

use Illuminate\Foundation\Http\FormRequest;

class StoreProductRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'name'                        => ['required', 'string', 'max:255'],
            'description'                 => ['nullable', 'string'],
            'short_description'           => ['nullable', 'string', 'max:500'],
            'price'                       => ['required', 'numeric', 'min:0'],
            'compare_price'               => ['nullable', 'numeric', 'min:0'],
            'cost_price'                  => ['nullable', 'numeric', 'min:0'],
            'stock'                       => ['required', 'integer', 'min:0'],
            'sku'                         => ['required', 'string', 'unique:products,sku'],
            'category_id'                 => ['nullable', 'exists:categories,id'],
            'status'                      => ['in:active,inactive,draft'],
            'featured'                    => ['boolean'],
            'weight'                      => ['nullable', 'numeric', 'min:0'],
            'attributes'                  => ['nullable', 'array'],
            'attributes.*.name'           => ['required_with:attributes', 'string'],
            'attributes.*.value'          => ['required_with:attributes', 'string'],
            'attributes.*.price_modifier' => ['nullable', 'numeric'],
            'attributes.*.stock'          => ['nullable', 'integer', 'min:0'],
        ];
    }
}
