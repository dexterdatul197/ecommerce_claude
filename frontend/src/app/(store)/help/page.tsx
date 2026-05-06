export default function HelpPage() {
  return (
    <div className="container max-w-3xl py-16">
      <h1 className="text-3xl font-bold mb-2">Help Center</h1>
      <p className="text-muted-foreground mb-10">Find answers to common questions below.</p>

      <div className="space-y-8">
        {[
          { q: 'How do I track my order?', a: 'Log in to your account and visit My Orders. Each order shows its current status — Pending, Processing, Shipped, or Delivered.' },
          { q: 'Can I cancel my order?', a: 'Orders can be cancelled while they are in Pending or Processing status. Go to My Orders, open the order, and click Cancel.' },
          { q: 'How do I apply a coupon?', a: 'Add items to your cart, then enter your coupon code in the cart page before proceeding to checkout.' },
          { q: 'What payment methods do you accept?', a: 'We accept Cash on Delivery (COD) and credit/debit cards via Stripe.' },
          { q: 'How do I leave a review?', a: 'After receiving your order, navigate to the product page and submit a rating and review. Reviews are published after approval.' },
        ].map(({ q, a }) => (
          <div key={q} className="border-b pb-6">
            <h2 className="font-semibold mb-2">{q}</h2>
            <p className="text-muted-foreground text-sm">{a}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
