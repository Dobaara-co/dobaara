import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Lock, BadgeCheck, Truck, MoveRight } from "lucide-react";
import ListingCard from "@/components/ListingCard";
import { listings, categoryLabels } from "@/data/seedData";
import heroBg from "@/assets/hero-bg.jpg";

const categories = [
  { key: "lehenga", emoji: "👗" },
  { key: "saree", emoji: "🧣" },
  { key: "salwar_kameez", emoji: "👘" },
  { key: "anarkali", emoji: "✨" },
  { key: "sherwani", emoji: "🤵" },
];

const Index = () => {
  const recentListings = listings.filter((l) => l.isActive && !l.isSold).slice(0, 8);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden min-h-[500px] md:min-h-[600px] flex items-center">
        <div className="absolute inset-0">
          <img src={heroBg} alt="" className="h-full w-full object-cover" width={1920} height={1080} />
          <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/80 to-background/40" />
        </div>
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23C9A84C' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
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
                <Button variant="hero" size="lg">Shop Now</Button>
              </Link>
              <Link to="/sell">
                <Button variant="heroOutline" size="lg">Start Selling</Button>
              </Link>
            </div>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-5 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5"><Lock className="h-3.5 w-3.5" strokeWidth={1.5} /> Secure Payments</span>
              <span className="flex items-center gap-1.5"><BadgeCheck className="h-3.5 w-3.5" strokeWidth={1.5} /> Verified Sellers</span>
              <span className="flex items-center gap-1.5"><Truck className="h-3.5 w-3.5" strokeWidth={1.5} /> Tracked Postage</span>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="container py-12">
        <h2 className="text-2xl font-bold text-center mb-6">Shop by Category</h2>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {categories.map((cat) => (
            <Link
              key={cat.key}
              to={`/browse?category=${cat.key}`}
              className="flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-4 transition-all hover:shadow-md hover:-translate-y-0.5"
            >
              <span className="text-3xl">{cat.emoji}</span>
              <span className="text-xs font-medium text-center">{categoryLabels[cat.key]}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Dobaara Verified banner */}
      <section className="container">
        <div className="rounded-2xl bg-gradient-to-r from-gold-light to-secondary border border-gold/20 p-8 md:p-12 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-gold/20 px-3 py-1 text-xs font-semibold text-primary mb-4">
            ✦ Dobaara Verified
          </span>
          <h2 className="text-2xl md:text-3xl font-bold">We photograph, verify and ship for you.</h2>
          <p className="mt-2 text-muted-foreground max-w-md mx-auto">
            Premium items, professionally presented. Send us your piece and we handle everything.
          </p>
          <Link to="/dobaara-verified" className="mt-6 inline-block">
            <Button variant="gold" size="lg">Submit an Item <ArrowRight className="h-4 w-4 ml-1" /></Button>
          </Link>
        </div>
      </section>

      {/* New Listings */}
      <section className="container py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">New Arrivals</h2>
          <Link to="/browse" className="text-sm font-medium text-primary hover:underline flex items-center gap-1">
            View all <ArrowRight className="h-3.5 w-3.5" />
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
        <div className="grid md:grid-cols-2 gap-12">
          <div>
            <h3 className="font-display text-lg font-semibold mb-4 text-primary">For Sellers</h3>
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
          <div>
            <h3 className="font-display text-lg font-semibold mb-4 text-primary">For Buyers</h3>
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

      {/* Community stats */}
      <section className="border-y border-border bg-card py-10">
        <div className="container flex flex-wrap items-center justify-center gap-8 md:gap-16 text-center">
          {[
            { value: "2,400+", label: "Listings" },
            { value: "380+", label: "Sellers" },
            { value: "1,200+", label: "Happy Buyers" },
          ].map((stat) => (
            <div key={stat.label}>
              <p className="font-display text-3xl font-bold text-primary">{stat.value}</p>
              <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Index;
