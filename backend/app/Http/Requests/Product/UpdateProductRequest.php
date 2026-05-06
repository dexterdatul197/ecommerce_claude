<?php

namespace App\Http\Requests\Product;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateProductRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'name'              => ['sometimes', 'string', 'max:255'],
            'description'       => ['nullable', 'string'],
            'short_description' => ['nullable', 'string', 'max:500'],
            'price'             => ['sometimes', 'numeric', 'min:0'],
            'compare_price'     => ['nullable', 'numeric', 'min:0'],
            'cost_price'        => ['nullable', 'numeric', 'min:0'],
            'stock'             => ['sometimes', 'integer', 'min:0'],
            'sku'               => ['sometimes', 'string', Rule::unique('products', 'sku')->ignore($this->route('product'))],
            'category_id'       => ['nullable', 'exists:categories,id'],
            'status'            => ['sometimes', 'in:active,inactive,draft'],
            'featured'          => ['sometimes', 'boolean'],
            'weight'            => ['nullable', 'numeric', 'min:0'],
        ];
    }
}
