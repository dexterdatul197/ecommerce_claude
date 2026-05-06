export default function ShippingPolicyPage() {
  return (
    <div className="container max-w-3xl py-16">
      <h1 className="text-3xl font-bold mb-2">Shipping Policy</h1>
      <p className="text-muted-foreground mb-10">Last updated: January 2025</p>

      <div className="space-y-8 text-sm text-muted-foreground leading-relaxed">
        <section>
          <h2 className="text-base font-semibold text-foreground mb-2">Processing Time</h2>
          <p>Orders are processed within 1–2 business days after payment confirmation. Orders placed on weekends or public holidays are processed the next business day.</p>
        </section>
        <section>
          <h2 className="text-base font-semibold text-foreground mb-2">Shipping Rates</h2>
          <p>A flat shipping fee of $5.00 applies to all orders. Orders over $50 qualify for free standard shipping.</p>
        </section>
        <section>
          <h2 className="text-base font-semibold text-foreground mb-2">Delivery Times</h2>
          <p>Standard delivery takes 2–5 business days depending on your location. Expedited options may be available at checkout.</p>
        </section>
        <section>
          <h2 className="text-base font-semibold text-foreground mb-2">Tracking</h2>
          <p>Once your order ships, you can track its status in My Orders. You will also receive an email notification when the status changes.</p>
        </section>
        <section>
          <h2 className="text-base font-semibold text-foreground mb-2">International Shipping</h2>
          <p>We currently ship within the United States only. International shipping is not available at this time.</p>
        </section>
      </div>
    </div>
  )
}
