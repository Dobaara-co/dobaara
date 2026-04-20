import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import ListingCard from "@/components/ListingCard";
import { listings, categoryLabels } from "@/data/seedData";
import heroBg from "@/assets/hero-bg.jpg";
import taraCream from "@/assets/tara-cream.jpg";
import taraBlush from "@/assets/tara-blush.jpg";
import taraTeal from "@/assets/tara-teal.jpg";
import taraBeige from "@/assets/tara-beige.jpg";
import verifiedPhotograph from "@/assets/verified-photograph.jpg";
import verifiedVerify from "@/assets/verified-verify.jpg";
import verifiedShip from "@/assets/verified-ship.jpg";
import {
  LehengaIcon,
  SareeIcon,
  SalwarIcon,
  AnarkaliIcon,
  SherwaniIcon,
  DupattaIcon,
  AccessoriesIcon,
  SketchLockIcon,
  SketchVerifiedIcon,
  SketchTruckIcon,
  SketchArrowRight,
  SketchSparkle,
  SketchBagIcon,
  SketchTagIcon,
  SketchDropletIcon,
  SketchLeafIcon,
  SketchHomeHeartIcon,
} from "@/components/CategoryIcons";

const categories = [
  { key: "lehenga", Icon: LehengaIcon },
  { key: "saree", Icon: SareeIcon },
  { key: "salwar_kameez", Icon: SalwarIcon },
  { key: "anarkali", Icon: AnarkaliIcon },
  { key: "sherwani", Icon: SherwaniIcon },
  { key: "dupatta", Icon: DupattaIcon },
  { key: "accessories", Icon: AccessoriesIcon },
];

const taraImages = [taraCream, taraBlush, taraTeal, taraBeige];

const verifiedSteps = [
  { title: "Photograph", img: verifiedPhotograph },
  { title: "Verify", img: verifiedVerify },
  { title: "Ship", img: verifiedShip },
];

const sustainabilityStats = [
  { Icon: SketchDropletIcon, value: "85%", label: "less water vs making new" },
  { Icon: SketchLeafIcon, value: "120kg", label: "CO₂ saved per lehenga" },
  { Icon: SketchHomeHeartIcon, value: "1,200+", label: "outfits rehomed" },
];

const Index = () => {
  const recentListings = listings
    .filter((l) => l.isActive && !l.isSold)
    .slice(0, 4)
    .map((l, i) => ({ ...l, images: [taraImages[i % taraImages.length]] }));

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

      {/* Categories */}
      <section className="container py-12">
        <h2 className="text-2xl font-bold text-center mb-6">Shop by Category</h2>
        <div className="grid grid-cols-3 md:grid-cols-7 gap-3">
          {categories.map((cat) => (
            <Link
              key={cat.key}
              to={`/browse?category=${cat.key}`}
              className="group flex flex-col items-center gap-3 rounded-xl border border-border bg-card p-5 transition-all hover:shadow-md hover:-translate-y-0.5 hover:border-gold/40"
            >
              <cat.Icon className="h-10 w-10 text-primary/80 group-hover:text-primary transition-colors" />
              <span className="text-xs font-medium text-center tracking-wide">{categoryLabels[cat.key]}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Dobaara Verified — three-image triptych */}
      <section className="container">
        <div className="rounded-2xl bg-gradient-to-r from-gold-light to-secondary border border-gold/20 p-8 md:p-12">
          <div className="text-center mb-8">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-gold/20 px-3 py-1 text-xs font-semibold text-primary mb-4">
              <SketchSparkle className="h-3.5 w-3.5" /> Dobaara Verified
            </span>
            <h2 className="text-2xl md:text-3xl font-bold">We photograph, verify and ship for you.</h2>
            <p className="mt-2 text-muted-foreground max-w-md mx-auto">
              Premium items, professionally presented. Send us your piece and we handle everything.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 md:gap-6 mb-8">
            {verifiedSteps.map((s) => (
              <figure key={s.title} className="text-center">
                <div className="relative aspect-square overflow-hidden rounded-xl border border-gold/20">
                  <img
                    src={s.img}
                    alt={s.title}
                    loading="lazy"
                    width={800}
                    height={800}
                    className="h-full w-full object-cover opacity-80"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-gold/10 to-chai/20" />
                </div>
                <figcaption className="mt-3 font-display text-base md:text-xl font-semibold text-primary">
                  {s.title}
                </figcaption>
              </figure>
            ))}
          </div>

          <div className="text-center">
            <Link to="/dobaara-verified" className="inline-block">
              <Button variant="gold" size="lg" className="font-bold">
                <SketchSparkle className="h-4 w-4" /> Submit an Item
                <SketchArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {recentListings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
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
