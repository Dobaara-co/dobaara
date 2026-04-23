import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  SketchBagIcon,
  SketchTagIcon,
  SketchSparkle,
  SketchArrowRight,
} from "@/components/CategoryIcons";

const buyerSteps = [
  {
    n: "1",
    title: "Browse",
    body: "Search thousands of pre-loved South Asian outfits by category, size, occasion, condition and designer.",
  },
  {
    n: "2",
    title: "Buy with confidence",
    body: "Every seller is verified. Secure checkout powered by Stripe. Your payment is protected.",
  },
  {
    n: "3",
    title: "Receive & love",
    body: "Items are shipped with tracked postage. Leave a review and help build community trust.",
  },
];

const sellerSteps = [
  {
    n: "1",
    title: "List your item",
    body: "Create a listing in minutes. Add photos, measurements, price and condition. It's free to list.",
  },
  {
    n: "2",
    title: "Sell to the right buyers",
    body: "Your item reaches buyers who actually understand South Asian fashion. No more explaining what a lehenga is.",
  },
  {
    n: "3",
    title: "Get paid securely",
    body: "When your item sells, Dobaara transfers your earnings directly to your bank account within 7 days.",
  },
];

const fees = [
  { label: "Listing fee", value: "Free" },
  { label: "Standard commission", value: "10% on sale price" },
  { label: "Founding Seller commission", value: "8% (first 500 sellers)" },
  { label: "Dobaara Verified", value: "25% (we do everything)" },
];

const StepList = ({ steps, accent }: { steps: typeof buyerSteps; accent: "primary" | "gold" }) => (
  <div className="space-y-5">
    {steps.map((s) => (
      <div key={s.n} className="flex gap-4 items-start">
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
            accent === "primary"
              ? "bg-primary text-primary-foreground"
              : "bg-gold text-accent-foreground"
          }`}
        >
          {s.n}
        </div>
        <div>
          <p className="font-display text-base font-semibold text-foreground">{s.title}</p>
          <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{s.body}</p>
        </div>
      </div>
    ))}
  </div>
);

const HowItWorks = () => {
  return (
    <div className="min-h-screen pb-20 md:pb-0">
      {/* Hero */}
      <section className="container py-14 md:py-20 text-center">
        <p className="font-mono text-xs tracking-[0.2em] text-gold uppercase mb-4">The Process</p>
        <h1 className="font-display text-4xl md:text-5xl font-bold text-primary tracking-tight">
          How Dobaara <span className="italic text-gradient-gold">works.</span>
        </h1>
        <p className="mt-4 text-base md:text-lg text-muted-foreground max-w-xl mx-auto">
          Whether you're buying or selling, we've made it as simple as possible.
        </p>
      </section>

      {/* Buyers / Sellers */}
      <section className="container pb-12">
        <div className="grid md:grid-cols-2 gap-6 md:gap-8 relative">
          {/* Buyers */}
          <div className="rounded-2xl border border-border bg-secondary/40 p-6 md:p-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                <SketchBagIcon className="h-5 w-5" />
              </div>
              <p className="font-mono text-xs tracking-[0.2em] text-muted-foreground">FOR BUYERS</p>
            </div>
            <h2 className="font-display text-xl md:text-2xl font-semibold text-primary mb-5">
              Browse, buy, wear again.
            </h2>
            <StepList steps={buyerSteps} accent="primary" />
            <Link to="/browse" className="mt-6 inline-block">
              <Button variant="hero" size="lg" className="font-bold">
                <SketchBagIcon className="h-4 w-4" /> Start Browsing
              </Button>
            </Link>
          </div>

          <div className="hidden md:block absolute left-1/2 top-4 bottom-4 w-px bg-border -translate-x-1/2 pointer-events-none" />

          {/* Sellers */}
          <div className="rounded-2xl border border-border bg-[hsl(var(--gold-light))]/50 p-6 md:p-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gold/15 text-gold">
                <SketchTagIcon className="h-5 w-5" />
              </div>
              <p className="font-mono text-xs tracking-[0.2em] text-muted-foreground">FOR SELLERS</p>
            </div>
            <h2 className="font-display text-xl md:text-2xl font-semibold text-primary mb-5">
              List, sell, get paid.
            </h2>
            <StepList steps={sellerSteps} accent="gold" />
            <Link to="/sell" className="mt-6 inline-block">
              <Button variant="gold" size="lg" className="font-bold">
                <SketchTagIcon className="h-4 w-4" /> Start Selling
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Dobaara Verified callout */}
      <section className="container py-10">
        <div className="rounded-2xl border border-gold/30 bg-gradient-to-br from-[hsl(var(--gold-light))]/60 to-secondary/30 p-8 md:p-10 text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-gold text-accent-foreground mb-4">
            <SketchSparkle className="h-6 w-6" />
          </div>
          <h2 className="font-display text-2xl md:text-3xl font-semibold text-primary">
            Want us to do it for you?
          </h2>
          <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
            With Dobaara Verified, you send us your item and we handle photography,
            authentication, listing and shipping. You sit back and get paid.
          </p>
          <Link to="/dobaara-verified" className="mt-5 inline-block">
            <Button variant="gold" size="lg" className="font-bold">
              Learn more <SketchArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Fees */}
      <section className="container py-14 md:py-16">
        <div className="max-w-2xl mx-auto">
          <h2 className="font-display text-2xl md:text-3xl font-semibold text-primary text-center mb-3">
            Fees
          </h2>
          <p className="text-center text-muted-foreground mb-8">Simple, honest pricing.</p>
          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            {fees.map((f, i) => (
              <div
                key={f.label}
                className={`flex items-center justify-between px-5 md:px-6 py-4 ${
                  i !== fees.length - 1 ? "border-b border-border" : ""
                }`}
              >
                <span className="text-sm md:text-base text-foreground">{f.label}</span>
                <span className="text-sm md:text-base font-semibold text-primary">{f.value}</span>
              </div>
            ))}
          </div>
          <p className="text-center text-xs text-muted-foreground mt-4">
            Postage is paid by the buyer at checkout.
          </p>
        </div>
      </section>
    </div>
  );
};

export default HowItWorks;
