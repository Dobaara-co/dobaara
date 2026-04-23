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

      {/* Sustainability stats */}
      <section className="border-y border-border bg-card py-10">
        <div className="container">
          <p className="text-center font-mono text-xs tracking-[0.2em] text-muted-foreground mb-6">
            EVERY RESALE MATTERS
          </p>
          <div className="flex flex-wrap items-start justify-center gap-10 md:gap-20 text-center">
            {sustainabilityStats.map((stat) => (
              <div key={stat.label} className="flex flex-col items-center max-w-[180px]">
                <stat.Icon className="h-7 w-7 text-gold mb-3" />
                <p className="font-display text-3xl font-bold text-primary">{stat.value}</p>
                <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
