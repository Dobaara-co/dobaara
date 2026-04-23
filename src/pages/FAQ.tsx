import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

type QA = { q: string; a: string };

const groups: { id: string; title: string; items: QA[] }[] = [
  {
    id: "buying",
    title: "Buying",
    items: [
      {
        q: "Is it safe to buy on Dobaara?",
        a: "Yes. All payments are processed securely through Stripe. Your payment is held until the item is confirmed delivered.",
      },
      {
        q: "What if my item doesn't arrive?",
        a: "All items are sent with tracked postage. If your item doesn't arrive, contact us at hello@dobaara.co and we'll investigate.",
      },
      {
        q: "Can I return an item?",
        a: "We recommend messaging the seller before purchasing if you have questions. Returns are at the seller's discretion unless the item was significantly not as described.",
      },
      {
        q: "How do I know the item is as described?",
        a: "Sellers are required to accurately describe condition and upload real photos. Dobaara Verified items are authenticated by our team.",
      },
    ],
  },
  {
    id: "selling",
    title: "Selling",
    items: [
      {
        q: "How much does it cost to sell?",
        a: "Listing is free. We charge 10% commission when your item sells (8% for Founding Sellers).",
      },
      {
        q: "When do I get paid?",
        a: "Payouts are processed within 7 days of the buyer confirming delivery.",
      },
      {
        q: "How do I become a Founding Seller?",
        a: "The first 500 sellers on Dobaara receive Founding Seller status — 8% commission for life and a permanent badge on your profile.",
      },
      {
        q: "What can I sell on Dobaara?",
        a: "Any pre-loved South Asian occasion wear — lehengas, sarees, salwar kameez, anarkalis, sherwanis, dupattas, and accessories.",
      },
    ],
  },
  {
    id: "verified",
    title: "Dobaara Verified",
    items: [
      {
        q: "What is Dobaara Verified?",
        a: "Our premium concierge service. You send us your item, we photograph, authenticate, list and ship it professionally. We charge 25% commission.",
      },
      {
        q: "What condition do items need to be for Dobaara Verified?",
        a: "Very Good or Excellent condition, with a minimum listing value of £80.",
      },
    ],
  },
];

const FAQ = () => {
  return (
    <div className="min-h-screen pb-20 md:pb-0">
      <section className="container py-14 md:py-20 text-center">
        <p className="font-mono text-xs tracking-[0.2em] text-gold uppercase mb-4">Help</p>
        <h1 className="font-display text-4xl md:text-5xl font-bold text-primary tracking-tight">
          Frequently Asked <span className="italic text-gradient-gold">Questions</span>
        </h1>
        <p className="mt-4 text-base md:text-lg text-muted-foreground max-w-xl mx-auto">
          Everything you need to know about buying, selling and Dobaara Verified.
        </p>
      </section>

      <section className="container pb-20">
        <div className="max-w-3xl mx-auto space-y-10">
          {groups.map((g) => (
            <div key={g.id}>
              <h2 className="font-display text-xl md:text-2xl font-semibold text-primary mb-4">
                {g.title}
              </h2>
              <Accordion type="single" collapsible className="space-y-3">
                {g.items.map((qa, idx) => (
                  <AccordionItem
                    key={qa.q}
                    value={`${g.id}-${idx}`}
                    className="rounded-2xl border border-border bg-card px-5"
                  >
                    <AccordionTrigger className="text-left font-medium text-foreground hover:no-underline">
                      {qa.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-sm text-foreground/85 leading-relaxed pb-4">
                      {qa.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default FAQ;
