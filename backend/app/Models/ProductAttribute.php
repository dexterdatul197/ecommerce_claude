<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProductAttribute extends Model
{
    protected $fillable = [
        'product_id',
        'name',
        'value',
        'price_modifier',
        'stock',
    ];

    protected function casts(): array
    {
        return [
            'price_modifier' => 'decimal:2',
        ];
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
