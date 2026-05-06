<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use App\Models\Review;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index(): JsonResponse
    {
        $revenue = Order::where('payment_status', 'paid')->sum('total');

        $revenueByMonth = Order::where('payment_status', 'paid')
            ->where('created_at', '>=', now()->subYear())
            ->selectRaw('DATE_FORMAT(created_at, "%Y-%m") as month, SUM(total) as revenue, COUNT(*) as orders')
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
                'revenue_by_month' => $revenueByMonth,
                'orders_by_status' => $ordersByStatus,
                'low_stock'        => $lowStockProducts,
            ],
        ]);
    }
}
