<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Confirmed</title>
  <style>
    body { margin: 0; padding: 0; background: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #111827; }
    .wrapper { max-width: 600px; margin: 32px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 4px rgba(0,0,0,.08); }
    .header { background: linear-gradient(135deg, #4f46e5, #1d4ed8); padding: 40px 32px; text-align: center; color: white; }
    .header h1 { margin: 0; font-size: 24px; font-weight: 700; }
    .header p { margin: 8px 0 0; opacity: .85; font-size: 15px; }
    .body { padding: 32px; }
    .order-meta { background: #f9fafb; border-radius: 8px; padding: 16px 20px; margin-bottom: 24px; display: flex; justify-content: space-between; flex-wrap: wrap; gap: 12px; }
    .order-meta span { font-size: 13px; color: #6b7280; }
    .order-meta strong { display: block; font-size: 15px; color: #111827; margin-top: 2px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
    table th { text-align: left; font-size: 12px; font-weight: 600; text-transform: uppercase; color: #9ca3af; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
    table td { padding: 12px 0; font-size: 14px; border-bottom: 1px solid #f3f4f6; vertical-align: top; }
    .totals { background: #f9fafb; border-radius: 8px; padding: 16px 20px; }
    .totals-row { display: flex; justify-content: space-between; font-size: 14px; padding: 4px 0; }
    .totals-row.total { font-size: 16px; font-weight: 700; padding-top: 12px; margin-top: 8px; border-top: 1px solid #e5e7eb; }
    .section-title { font-size: 15px; font-weight: 600; margin: 24px 0 12px; }
    .address { font-size: 14px; color: #374151; line-height: 1.6; }
    .btn { display: inline-block; margin-top: 28px; padding: 12px 28px; background: #4f46e5; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px; }
    .footer { padding: 20px 32px; text-align: center; font-size: 12px; color: #9ca3af; border-top: 1px solid #f3f4f6; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1>✓ Order Confirmed!</h1>
      <p>Thanks for shopping with ShopNext</p>
    </div>

    <div class="body">
      <p style="font-size:15px;">Hi {{ $order->user->name ?? 'there' }},</p>
      <p style="font-size:14px;color:#6b7280;">We've received your order and it's now being processed. Here's a summary:</p>

      <div class="order-meta">
        <div>
          <span>Order Number</span>
          <strong>{{ $order->order_number }}</strong>
        </div>
        <div>
          <span>Date</span>
          <strong>{{ $order->created_at->format('M j, Y') }}</strong>
        </div>
        <div>
          <span>Payment</span>
          <strong>{{ $order->payment_method === 'cod' ? 'Cash on Delivery' : 'Credit Card' }}</strong>
        </div>
        <div>
          <span>Status</span>
          <strong style="text-transform:capitalize;">{{ $order->status }}</strong>
        </div>
      </div>

      <p class="section-title">Items Ordered</p>
      <table>
        <thead>
          <tr>
            <th>Product</th>
            <th style="text-align:center;">Qty</th>
            <th style="text-align:right;">Price</th>
          </tr>
        </thead>
        <tbody>
          @foreach($order->items as $item)
          <tr>
            <td>
              <strong>{{ $item->product_name }}</strong>
              <div style="font-size:12px;color:#9ca3af;">SKU: {{ $item->product_sku }}</div>
            </td>
            <td style="text-align:center;">{{ $item->quantity }}</td>
            <td style="text-align:right;">${{ number_format($item->total_price, 2) }}</td>
          </tr>
          @endforeach
        </tbody>
      </table>

      <div class="totals">
        <div class="totals-row"><span>Subtotal</span><span>${{ number_format($order->subtotal, 2) }}</span></div>
        @if($order->discount_amount > 0)
        <div class="totals-row" style="color:#16a34a;"><span>Discount</span><span>−${{ number_format($order->discount_amount, 2) }}</span></div>
        @endif
        <div class="totals-row"><span>Shipping</span><span>${{ number_format($order->shipping_amount, 2) }}</span></div>
        <div class="totals-row"><span>Tax</span><span>${{ number_format($order->tax_amount, 2) }}</span></div>
        <div class="totals-row total"><span>Total</span><span>${{ number_format($order->total, 2) }}</span></div>
      </div>

      <p class="section-title">Shipping To</p>
      <div class="address">
        <strong>{{ $order->shipping_name }}</strong><br>
        {{ $order->shipping_address['line1'] }}
        @if(!empty($order->shipping_address['line2']))<br>{{ $order->shipping_address['line2'] }}@endif<br>
        {{ $order->shipping_address['city'] }}, {{ $order->shipping_address['state'] }} {{ $order->shipping_address['zip'] }}<br>
        {{ $order->shipping_phone }}
      </div>

      <div style="text-align:center;">
        <a href="{{ rtrim(env('FRONTEND_URL', 'http://localhost:3000'), '/') }}/orders/{{ $order->id }}" class="btn">
          View Order Details
        </a>
      </div>
    </div>

    <div class="footer">
      <p>© {{ date('Y') }} ShopNext. All rights reserved.</p>
      <p>This email was sent because you placed an order on ShopNext.</p>
    </div>
  </div>
</body>
</html>
