export default function ReturnsPage() {
  return (
    <div className="container max-w-3xl py-16">
      <h1 className="text-3xl font-bold mb-2">Returns &amp; Refunds</h1>
      <p className="text-muted-foreground mb-10">Last updated: January 2025</p>

      <div className="space-y-8 text-sm text-muted-foreground leading-relaxed">
        <section>
          <h2 className="text-base font-semibold text-foreground mb-2">Return Window</h2>
          <p>You may return most items within 30 days of delivery for a full refund, provided they are unused and in original packaging.</p>
        </section>
        <section>
          <h2 className="text-base font-semibold text-foreground mb-2">How to Return</h2>
          <ol className="list-decimal list-inside space-y-1">
            <li>Go to My Orders and locate the order.</li>
            <li>Contact us via the Contact Us page with your order number and reason for return.</li>
            <li>Ship the item back using the label we provide.</li>
            <li>Refund is issued within 5–7 business days of receiving the return.</li>
          </ol>
        </section>
        <section>
          <h2 className="text-base font-semibold text-foreground mb-2">Non-Returnable Items</h2>
          <p>Digital products, opened consumables, and items marked as final sale cannot be returned.</p>
        </section>
        <section>
          <h2 className="text-base font-semibold text-foreground mb-2">Damaged or Wrong Items</h2>
          <p>If you received a damaged or incorrect item, contact us within 7 days of delivery and we will arrange a replacement or full refund at no cost.</p>
        </section>
      </div>
    </div>
  )
}
