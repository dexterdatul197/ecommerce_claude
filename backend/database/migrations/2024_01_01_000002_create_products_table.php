<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->longText('description')->nullable();
            $table->text('short_description')->nullable();
            $table->decimal('price', 10, 2);
            $table->decimal('compare_price', 10, 2)->nullable();
            $table->decimal('cost_price', 10, 2)->nullable();
            $table->unsignedInteger('stock')->default(0);
            $table->string('sku')->unique();
            $table->foreignId('category_id')->nullable()->constrained()->nullOnDelete();
            $table->enum('status', ['active', 'inactive', 'draft'])->default('draft');
            $table->boolean('featured')->default(false);
            $table->decimal('weight', 8, 2)->nullable();
            $table->fullText(['name', 'description', 'short_description']);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
