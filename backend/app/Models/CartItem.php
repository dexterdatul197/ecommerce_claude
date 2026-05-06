<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CartItem extends Model
{
    protected $fillable = [
        'user_id',
        'product_id',
        'attribute_id',
        'quantity',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class)->withDefault();
    }

    public function attribute()
    {
        return $this->belongsTo(ProductAttribute::class, 'attribute_id')->withDefault();
    }

    public function getUnitPriceAttribute(): float
    {
        $base = (float) $this->product->price;
        $modifier = $this->attribute_id ? (float) ($this->attribute->price_modifier ?? 0) : 0;
        return $base + $modifier;
    }

    public function getTotalPriceAttribute(): float
    {
        return $this->unit_price * $this->quantity;
    }
}
