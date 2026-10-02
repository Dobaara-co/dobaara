import { ReactNode } from "react";
import { Link } from "react-router-dom";

type Section = { title: string; body: ReactNode };
type Part = { heading: string; intro?: ReactNode; sections: Section[] };

const MailLink = () => (
  <a href="mailto:info@dobaara.co" className="text-gold hover:underline">
    info@dobaara.co
  </a>
);

const parts: Part[] = [
  {
    heading: "Part A — Marketplace purchases (peer-to-peer)",
    intro: (
      <p>
        Most items on Dobaara are sold by individual sellers, not by Dobaara itself. For these purchases,
        Dobaara facilitates the transaction but is not the seller.
      </p>
    ),
    sections: [
      {
        title: "Buyer protection",
        body: (
          <>
            <p>You may request a return if:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>The item is significantly not as described</li>
              <li>The item has undisclosed damage or flaws</li>
              <li>The wrong item was sent</li>
              <li>The item is counterfeit</li>
            </ul>
          </>
        ),
      },
      {
        title: "How to raise a return",
        body: (
          <p>
            Contact <MailLink /> within 48 hours of delivery. Include your order number, photos of the issue,
            and a description of the problem.
          </p>
        ),
      },
      {
        title: "Your payment is held until delivery is confirmed",
        body: (
          <p>
            We don't release payment to the seller until you've received your item, giving you a window to
            flag a problem before funds are released.
          </p>
        ),
      },
      {
        title: "Change of mind",
        body: (
          <p>
            Marketplace purchases are between you and the individual seller. Change of mind is not eligible
            for a refund under this policy. If an item doesn't fit or isn't quite what you expected, message
            the seller directly — some may agree to a return at their own discretion, but this isn't
            guaranteed and isn't covered by Dobaara's buyer protection. We encourage buyers to message
            sellers with questions before purchasing.
          </p>
        ),
      },
      {
        title: "Return shipping",
        body: (
          <ul className="list-disc pl-5 space-y-2">
            <li>Seller error (wrong item, not as described): seller covers return postage</li>
            <li>Buyer's change of mind, if the seller agrees to accept a return: buyer covers return postage</li>
          </ul>
        ),
      },
      {
        title: "Refunds",
        body: (
          <p>Approved refunds are processed within 5–10 business days to your original payment method.</p>
        ),
      },
    ],
  },
  {
    heading: "Part B — Dobaara Verified purchases",
    intro: (
      <p>
        Dobaara Verified items are sourced, authenticated, photographed, listed and dispatched by Dobaara
        directly. For these purchases, Dobaara is the seller, and UK consumer law gives you stronger
        statutory rights than a marketplace purchase.
      </p>
    ),
    sections: [
      {
        title: "Your right to cancel",
        body: (
          <p>
            Under the Consumer Contracts Regulations 2013, you have the right to cancel your order within
            14 days of receiving your item, for any reason, without needing to give an explanation.
          </p>
        ),
      },
      {
        title: "Cancellation period",
        body: (
          <p>
            Your 14-day period starts the day after you (or someone you nominate) receives the item. You
            have a further 14 days after telling us you want to cancel to send the item back to us.
          </p>
        ),
      },
      {
        title: "How to cancel",
        body: (
          <>
            <p>
              Email <MailLink /> with your order number and a clear statement that you wish to cancel, or
              use the model cancellation form below.
            </p>
            <div className="border border-border rounded-lg p-5 bg-muted/30">
              <p className="font-display font-semibold text-primary mb-3">Model Cancellation Form</p>
              <p className="text-sm text-muted-foreground mb-3">
                (complete and return this form only if you wish to cancel the contract)
              </p>
              <div className="text-sm space-y-1.5 text-foreground/85">
                <p>To Dobaara Ltd, info@dobaara.co:</p>
                <p>I/We hereby give notice that I/We cancel my/our contract of sale of the following goods:</p>
                <p>Ordered on / received on:</p>
                <p>Name of consumer(s):</p>
                <p>Address of consumer(s):</p>
                <p>Signature of consumer(s) (only if this form is notified on paper):</p>
                <p>Date:</p>
              </div>
            </div>
          </>
        ),
      },
      {
        title: "Condition of returned items",
        body: (
          <p>
            The item should be returned in the condition you received it, with tags and any authentication
            documentation attached. You're liable for any reduction in value caused by handling beyond
            what's needed to establish the item's nature and condition.
          </p>
        ),
      },
      {
        title: "Return shipping",
        body: (
          <p>
            If you cancel under this right, you're responsible for the cost of returning the item to us. If
            the item is faulty, not as described, or counterfeit (see section 7 below), we'll cover return
            postage instead.
          </p>
        ),
      },
      {
        title: "Refunds",
        body: (
          <p>
            We'll refund you within 14 days of receiving the returned item (or evidence you've sent it, if
            earlier), to your original payment method, including standard delivery costs you paid.
          </p>
        ),
      },
      {
        title: "Faulty, damaged, not as described, or counterfeit items",
        body: (
          <p>
            Separately from your cancellation right above, if a Verified item is faulty, damaged, not as
            described, or counterfeit, contact <MailLink /> within 48 hours of delivery with your order
            number and photos. This is in addition to, not instead of, your 14-day cancellation right in
            sections 1–6 above.
          </p>
        ),
      },
    ],
  },
];

const Returns = () => (
  <div className="min-h-screen pb-20 md:pb-0 bg-background">
    <section className="container py-16 md:py-20 max-w-3xl">
      <p className="font-mono text-xs tracking-[0.2em] text-gold uppercase mb-4">Last updated: October 2026</p>
      <h1 className="font-display text-4xl md:text-5xl font-bold text-primary tracking-tight mb-6">
        Returns & Refunds Policy
      </h1>
      <div className="flex items-center gap-3 mb-6">
        <span className="h-px w-10 bg-gold/50" />
        <span className="text-gold text-sm">◆</span>
        <span className="h-px w-10 bg-gold/50" />
      </div>
      <p className="text-base text-foreground/85 mb-12">This policy has two parts, depending on how you bought your item.</p>

      {parts.map((part) => (
        <div key={part.heading} className="mb-14">
          <h2 className="font-display text-3xl font-semibold text-primary mb-5">{part.heading}</h2>
          {part.intro && <div className="text-base text-foreground/85 leading-relaxed mb-6">{part.intro}</div>}
          <div className="space-y-10">
            {part.sections.map((s, i) => (
              <section key={i}>
                <h3 className="font-display text-2xl md:text-3xl font-semibold text-primary mb-4">
                  {i + 1}. {s.title}
                </h3>
                <div className="text-base text-foreground/85 leading-relaxed space-y-3">{s.body}</div>
              </section>
            ))}
          </div>
        </div>
      ))}

      <section>
        <h2 className="font-display text-2xl md:text-3xl font-semibold text-primary mb-4">Contact</h2>
        <p className="text-base text-foreground/85">
          <MailLink />
        </p>
      </section>
    </section>
  </div>
);

export default Returns;
