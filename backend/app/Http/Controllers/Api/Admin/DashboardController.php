<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Review;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function badges(): JsonResponse
    {
        return response()->json([
            'data' => [
                'pending_orders'  => Order::where('status', 'pending')->count(),
                'pending_reviews' => Review::where('status', 'pending')->count(),
            ],
        ]);
    }

    public function index(Request $request): JsonResponse
    {
        $period = $request->get('period', '12m');

        $since = match ($period) {
            '7d'  => now()->subDays(7),
            '30d' => now()->subDays(30),
            default => now()->subYear(),
        };

        $groupFormat = match ($period) {
            '7d', '30d' => '%Y-%m-%d',
            default     => '%Y-%m',
        };

        $revenue = Order::where('payment_status', 'paid')->sum('total');

        $revenueByPeriod = Order::where('payment_status', 'paid')
            ->where('created_at', '>=', $since)
            ->selectRaw("DATE_FORMAT(created_at, '{$groupFormat}') as month, SUM(total) as revenue, COUNT(*) as orders")
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        $ordersByStatus = Order::selectRaw('status, COUNT(*) as count')
            ->groupBy('status')
            ->pluck('count', 'status');

        $lowStockProducts = Product::where('stock', '<=', 5)
            ->where('status', 'active')
            ->select('id', 'name', 'sku', 'stock')
            ->orderBy('stock')
            ->limit(10)
            ->get();

        $topProducts = OrderItem::join('orders', 'order_items.order_id', '=', 'orders.id')
            ->where('orders.payment_status', 'paid')
            ->where('orders.created_at', '>=', $since)
            ->selectRaw('product_id, product_name, SUM(total_price) as total_revenue, SUM(quantity) as units_sold')
            ->groupBy('product_id', 'product_name')
            ->orderByDesc('total_revenue')
            ->limit(5)
            ->get();

        $revenueByCategory = OrderItem::join('orders', 'order_items.order_id', '=', 'orders.id')
            ->join('products', 'order_items.product_id', '=', 'products.id')
            ->join('categories', 'products.category_id', '=', 'categories.id')
            ->where('orders.payment_status', 'paid')
            ->where('orders.created_at', '>=', $since)
            ->selectRaw('categories.name as category, SUM(order_items.total_price) as revenue')
            ->groupBy('categories.id', 'categories.name')
            ->orderByDesc('revenue')
            ->get();

        return response()->json([
            'data' => [
                'stats' => [
                    'total_revenue'    => round($revenue, 2),
                    'total_orders'     => Order::count(),
                    'total_customers'  => User::where('role', 'customer')->count(),
                    'total_products'   => Product::where('status', 'active')->count(),
                    'pending_orders'   => Order::where('status', 'pending')->count(),
                    'pending_reviews'  => Review::where('status', 'pending')->count(),
                ],
                'revenue_by_month'    => $revenueByPeriod,
                'orders_by_status'    => $ordersByStatus,
                'low_stock'           => $lowStockProducts,
                'top_products'        => $topProducts,
                'revenue_by_category' => $revenueByCategory,
            ],
        ]);
    }
}
