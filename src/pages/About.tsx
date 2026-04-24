import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import heroBg from "@/assets/hero-bg.jpg";
import { SketchVerifiedIcon, SketchHeartIcon, SketchLeafIcon } from "@/components/CategoryIcons";

const pillars = [
  {
    Icon: SketchHeartIcon,
    title: "Community first",
    body: "Built by South Asian women, for South Asian women. We understand the pieces, the occasions, and the culture.",
  },
  {
    Icon: SketchLeafIcon,
    title: "Circular fashion",
    body: "Every resale keeps a garment out of landfill and reduces the need for new production.",
  },
  {
    Icon: SketchVerifiedIcon,
    title: "Trust at every step",
    body: "Verified sellers, secure payments, and the Dobaara Verified concierge service for premium pieces.",
  },
];

const About = () => {
  return (
    <div className="min-h-screen pb-20 md:pb-0">
      {/* Hero */}
      <section className="relative overflow-hidden min-h-[420px] flex items-center">
        <div className="absolute inset-0">
          <img src={heroBg} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/85 to-background/50" />
        </div>
        <div className="container relative py-20 md:py-28">
          <div className="max-w-2xl">
            <p className="font-mono text-xs tracking-[0.2em] text-gold uppercase mb-4">About Dobaara</p>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tight text-primary">
              We built the marketplace we{" "}
              <span className="italic text-gradient-gold">always needed.</span>
            </h1>
            <p className="mt-5 text-base md:text-lg text-muted-foreground max-w-xl leading-relaxed">
              Dobaara was born from a simple truth — South Asian wardrobes are full of beautiful,
              expensive outfits worn once or twice, with nowhere to go.
            </p>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="container py-16 md:py-20">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3 justify-center mb-6">
            <span className="h-px w-10 bg-gold/50" />
            <span className="text-gold text-sm">◆</span>
            <span className="h-px w-10 bg-gold/50" />
          </div>
          <h2 className="font-display text-3xl md:text-4xl font-semibold text-primary text-center mb-8">
            Our Story
          </h2>
          <div className="space-y-5 text-base md:text-lg text-foreground/85 leading-relaxed">
            <p>
              Dobaara was founded by a husband and wife who noticed the same thing in their own
              home — and in the homes of every family around them. A wedding lehenga worth £600,
              worn once, gathering dust. A sangeet outfit with nowhere to go. We built Dobaara
              because the community deserved better than Facebook groups and generic resale
              platforms that don't understand what a lehenga even is.
            </p>
            <p>
              Our name means <span className="italic text-primary">"again"</span> in Urdu and Hindi.
              Every listing on Dobaara is a chance for a beautiful piece to find its next moment.
            </p>
          </div>
        </div>
      </section>

      {/* Mission pillars */}
      <section className="bg-card border-y border-border py-16 md:py-20">
        <div className="container">
          <h2 className="font-display text-3xl md:text-4xl font-semibold text-primary text-center mb-3">
            Our Mission
          </h2>
          <p className="text-center text-muted-foreground max-w-xl mx-auto mb-12">
            Three things we hold ourselves to, every single day.
          </p>
          <div className="grid md:grid-cols-3 gap-5 md:gap-6">
            {pillars.map((p) => (
              <div
                key={p.title}
                className="rounded-2xl border border-gold/20 bg-background p-6 md:p-7 shadow-sm"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[hsl(var(--gold-light))] mb-4">
                  <p.Icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-display text-xl font-semibold text-primary mb-2">
                  {p.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Closing line */}
      <section className="container py-16 md:py-20">
        <div className="max-w-2xl mx-auto text-center">
          <div className="flex items-center gap-3 justify-center mb-6">
            <span className="h-px w-10 bg-gold/50" />
            <span className="text-gold text-sm">◆</span>
            <span className="h-px w-10 bg-gold/50" />
          </div>
          <p className="font-display italic text-2xl md:text-3xl text-primary leading-relaxed">
            Built in the UK. For the community, by the community.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/browse">
              <Button variant="hero" size="lg" className="font-bold">Shop Now</Button>
            </Link>
            <Link to="/sell">
              <Button variant="heroOutline" size="lg" className="font-bold">Start Selling</Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
