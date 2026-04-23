import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import ListingCard from "@/components/ListingCard";
import { useListings } from "@/hooks/useListings";
import heroBg from "@/assets/hero-bg.jpg";
import taraCream from "@/assets/tara-cream.jpg";
import taraBlush from "@/assets/tara-blush.jpg";
import taraTeal from "@/assets/tara-teal.jpg";
import taraBeige from "@/assets/tara-beige.jpg";
import verifiedBanner from "@/assets/dobaara-verified-banner.jpeg";
import catLehenga from "@/assets/cat-lehenga.jpg";
import catSalwar from "@/assets/cat-salwar.jpg";
import catSaree from "@/assets/cat-saree.jpg";
import catAnarkali from "@/assets/cat-anarkali.jpg";
import {
  SketchLockIcon,
  SketchVerifiedIcon,
  SketchTruckIcon,
  SketchArrowRight,
  SketchSparkle,
  SketchBagIcon,
  SketchTagIcon,
  SketchDropletIcon,
  SketchGlobeLeafIcon,
  SketchHandNeedleIcon,
  SketchDressHangerIcon,
} from "@/components/CategoryIcons";

const categories = [
  { key: "lehenga", label: "Lehenga", img: catLehenga },
  { key: "salwar_kameez", label: "Salwar Kameez", img: catSalwar },
  { key: "saree", label: "Saree", img: catSaree },
  { key: "anarkali", label: "Anarkali", img: catAnarkali },
];

const taraImages = [taraCream, taraBlush, taraTeal, taraBeige];

const sustainabilityStats = [
  {
    Icon: SketchGlobeLeafIcon,
    headline: "Up to 30%",
    label: "Less environmental impact",
    body: "Extending the life of an outfit significantly reduces its environmental footprint.",
  },
  {
    Icon: SketchDropletIcon,
    headline: "2,700 litres",
    label: "Of water",
    body: "That's what it can take to produce a single garment.",
  },
  {
    Icon: SketchHandNeedleIcon,
    headline: "Weeks of craftsmanship",
    label: "Time, skill & heritage",
    body: "Many pieces are hand-finished and made to be worn more than once.",
  },
  {
    Icon: SketchDressHangerIcon,
    headline: "Worn once or twice",
    label: "Too good to waste",
    body: "Most occasion outfits spend their life sitting in storage.",
  },
];

const Index = () => {
  const { data: recentListings = [], isLoading } = useListings({ limit: 8, sort: "newest" });

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden min-h-[500px] md:min-h-[600px] flex items-center">
        <div className="absolute inset-0">
          <img src={heroBg} alt="" className="h-full w-full object-cover" width={1920} height={1080} />
          <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/80 to-background/40" />
        </div>
        <div className="container relative py-20 md:py-32">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold leading-tight tracking-tight">
              Give your lehenga a{" "}
              <span className="text-gradient-gold italic">second life.</span>
            </h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-lg mx-auto">
              The marketplace for pre-loved South Asian fashion in the UK. Buy and sell lehengas, sarees, sherwanis and more.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link to="/browse">
                <Button variant="hero" size="lg" className="font-bold">
                  <SketchBagIcon className="h-4 w-4" /> Shop Now
                </Button>
              </Link>
              <Link to="/sell">
                <Button variant="heroOutline" size="lg" className="font-bold">
                  <SketchTagIcon className="h-4 w-4" /> Start Selling
                </Button>
              </Link>
            </div>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-5 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5"><SketchLockIcon className="h-4 w-4 text-primary" /> Secure Payments</span>
              <span className="flex items-center gap-1.5"><SketchVerifiedIcon className="h-4 w-4 text-primary" /> Verified Sellers</span>
              <span className="flex items-center gap-1.5"><SketchTruckIcon className="h-4 w-4 text-primary" /> Tracked Postage</span>
            </div>
          </div>
        </div>
      </section>

      {/* Shop by Category */}
      <section className="container py-12">
        <div className="flex items-center justify-center gap-4 mb-8">
          <span className="h-px w-12 bg-gold/50" />
          <span className="text-gold text-sm">◆</span>
          <h2 className="font-display text-2xl md:text-3xl font-semibold tracking-[0.15em] text-primary uppercase">
            Shop by Category
          </h2>
          <span className="text-gold text-sm">◆</span>
          <span className="h-px w-12 bg-gold/50" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.key}
              to={`/browse?category=${cat.key}`}
              className="group block overflow-hidden rounded-2xl border border-primary/20 bg-secondary/30 transition-all hover:shadow-lg hover:-translate-y-1 hover:border-primary/40"
            >
              <div className="aspect-[3/5] overflow-hidden bg-secondary/40">
                <img
                  src={cat.img}
                  alt={cat.label}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Dobaara Verified — reference banner */}
      <section className="container">
        <div className="text-center mb-6">
          <h2 className="font-display text-2xl md:text-3xl font-semibold text-primary">
            Dobaara Verified
          </h2>
          <p className="mt-2 text-muted-foreground max-w-md mx-auto">
            We photograph, authenticate and ship — so you don't have to.
          </p>
        </div>
        <div className="overflow-hidden rounded-2xl border border-gold/20">
          <img
            src={verifiedBanner}
            alt="Dobaara Verified — we photograph, verify and ship"
            loading="lazy"
            className="block w-full h-auto"
          />
        </div>
        <div className="text-center mt-6">
          <Link to="/dobaara-verified" className="inline-block">
            <Button variant="gold" size="lg" className="font-bold">
              <SketchSparkle className="h-4 w-4" /> Submit an Item
              <SketchArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* New Listings */}
      <section className="container py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">New Arrivals</h2>
          <Link to="/browse" className="text-sm font-medium text-primary hover:underline flex items-center gap-1.5">
            View all <SketchArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] rounded-xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {recentListings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </section>

      {/* How it works */}
      <section className="container py-12">
        <h2 className="text-2xl font-bold text-center mb-10">How It Works</h2>
        <div className="grid md:grid-cols-2 gap-6 md:gap-8 relative">
          {/* Sellers */}
          <div className="rounded-2xl border border-border bg-secondary/40 p-6 md:p-8">
            <p className="font-mono text-xs tracking-[0.2em] text-muted-foreground mb-4">FOR SELLERS</p>
            <h3 className="font-display text-lg font-semibold mb-5 text-primary">List, sell, get paid.</h3>
            <div className="space-y-4">
              {[
                { step: "1", title: "List in minutes", desc: "Upload photos, add details and set your price." },
                { step: "2", title: "Sell to people who get it", desc: "Our community understands the value of South Asian fashion." },
                { step: "3", title: "Get paid securely", desc: "Funds go straight to your bank account via Stripe." },
              ].map((item) => (
                <div key={item.step} className="flex gap-4 items-start">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                    {item.step}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{item.title}</p>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Divider line — vertical on desktop, horizontal on mobile is implicit via gap */}
          <div className="hidden md:block absolute left-1/2 top-4 bottom-4 w-px bg-border -translate-x-1/2 pointer-events-none" />

          {/* Buyers */}
          <div className="rounded-2xl border border-border bg-gold-light/40 p-6 md:p-8">
            <p className="font-mono text-xs tracking-[0.2em] text-muted-foreground mb-4">FOR BUYERS</p>
            <h3 className="font-display text-lg font-semibold mb-5 text-primary">Browse, buy, wear again.</h3>
            <div className="space-y-4">
              {[
                { step: "1", title: "Browse thousands of pieces", desc: "From lehengas to sherwanis — every category covered." },
                { step: "2", title: "Buy with confidence", desc: "Verified sellers, secure payments, tracked postage." },
                { step: "3", title: "Wear it again", desc: "Beautiful outfits at a fraction of the original price." },
              ].map((item) => (
                <div key={item.step} className="flex gap-4 items-start">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gold text-accent-foreground text-sm font-bold">
                    {item.step}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{item.title}</p>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Sustainability — A second life makes a real difference */}
      <section className="relative overflow-hidden border-y border-border bg-[hsl(var(--cream))] py-16 md:py-20">
        {/* Decorative botanical corners */}
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute top-0 left-0 h-40 w-40 text-gold/30 md:h-56 md:w-56"
          viewBox="0 0 200 200"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          strokeLinecap="round"
        >
          <path d="M10 10c20 10 40 30 50 60" />
          <path d="M30 10c5 15 5 30 0 45" opacity=".6" />
          <path d="M60 20c10 5 18 15 22 30" opacity=".7" />
          <path d="M20 40c10-2 22 0 32 8" opacity=".6" />
          <circle cx="50" cy="80" r="6" opacity=".5" />
          <path d="M44 80c2-4 8-6 12 0" opacity=".5" />
          <path d="M50 74v12M44 80h12" opacity=".4" />
        </svg>
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute top-0 right-0 h-40 w-40 -scale-x-100 text-gold/30 md:h-56 md:w-56"
          viewBox="0 0 200 200"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          strokeLinecap="round"
        >
          <path d="M10 10c20 10 40 30 50 60" />
          <path d="M30 10c5 15 5 30 0 45" opacity=".6" />
          <path d="M60 20c10 5 18 15 22 30" opacity=".7" />
          <path d="M20 40c10-2 22 0 32 8" opacity=".6" />
          <path d="M70 50c8 4 14 12 18 22" opacity=".5" />
        </svg>

        <div className="container relative">
          {/* Heading */}
          <div className="text-center max-w-2xl mx-auto mb-3">
            <h2 className="font-display text-3xl md:text-5xl font-bold leading-tight tracking-tight text-primary">
              A second life makes
              <br />
              <span className="italic font-medium text-gradient-gold">a real difference.</span>
            </h2>
            <div className="flex items-center justify-center gap-2 mt-4 mb-4 text-gold">
              <span className="h-px w-10 bg-gold/50" />
              <span className="text-xs">◆</span>
              <span className="h-px w-10 bg-gold/50" />
            </div>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
              South Asian outfits are crafted with time, skill and so many resources.
              Wearing them again means less waste — and more stories carried forward.
            </p>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5 mt-10">
            {sustainabilityStats.map((stat) => (
              <div
                key={stat.label}
                className="flex flex-col items-center text-center rounded-2xl border border-gold/20 bg-card/60 backdrop-blur-sm p-6 shadow-sm"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[hsl(var(--gold-light))] mb-4">
                  <stat.Icon className="h-8 w-8 text-primary" />
                </div>
                <p className="font-display text-xl md:text-2xl font-bold text-primary leading-tight">
                  {stat.headline}
                </p>
                <p className="font-mono text-[10px] tracking-[0.18em] uppercase text-gold mt-2">
                  {stat.label}
                </p>
                <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
                  {stat.body}
                </p>
              </div>
            ))}
          </div>

          {/* Bottom banner */}
          <div className="relative overflow-hidden mt-10 rounded-2xl bg-[hsl(var(--gold-light))]/60 border border-gold/20 px-6 py-8 md:px-10 md:py-10 text-center">
            <p className="text-sm md:text-base text-foreground/80">
              Reselling keeps beautiful pieces in circulation — and out of landfill.
            </p>
            <p className="font-display italic text-lg md:text-xl text-gradient-gold mt-2">
              Every outfit deserves more than one moment.
            </p>
            <p className="font-display font-bold text-base md:text-lg text-primary mt-1">
              That's the dobaara way.
            </p>
          </div>

          {/* Trust badges */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 md:gap-10 text-xs md:text-sm text-muted-foreground">
            <span className="flex items-center gap-2">
              <SketchLockIcon className="h-4 w-4 text-primary" /> Secure Payments
            </span>
            <span className="flex items-center gap-2">
              <SketchVerifiedIcon className="h-4 w-4 text-primary" /> Verified Sellers
            </span>
            <span className="flex items-center gap-2">
              <SketchTruckIcon className="h-4 w-4 text-primary" /> Tracked Delivery
            </span>
          </div>

          {/* Source credit */}
          <p className="mt-5 text-center text-[11px] text-muted-foreground/70">
            Sources: WRAP UK, UNEP, Ellen MacArthur Foundation
          </p>
        </div>
      </section>
    </div>
  );
};

export default Index;
