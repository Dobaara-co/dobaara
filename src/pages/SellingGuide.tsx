import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { SketchTagIcon, SketchArrowRight } from "@/components/CategoryIcons";

const sections = [
  {
    id: "photos",
    title: "Photography tips",
    bullets: [
      "Use natural light — near a window is perfect",
      "Lay flat on a clean white or neutral background, OR hang on a plain wall",
      "Photograph front, back, detail shots (embroidery, neckline, hem), and any wear marks",
      "Upload at least 5 photos — listings with more photos sell 3x faster",
      "Make sure images are in focus and well-lit",
    ],
  },
  {
    id: "pricing",
    title: "Pricing guide",
    bullets: [
      "Research what similar items have sold for on Dobaara",
      "A good starting point: 25–40% of the original retail price for Very Good condition",
      "Designer pieces (Sabyasachi, Manish Malhotra etc) hold value better — you can price at 40–60%",
      "Excellent condition commands a premium — mention it prominently in your description",
      "Free postage increases buyer conversion significantly",
    ],
  },
  {
    id: "description",
    title: "Writing your description",
    bullets: [
      "Mention how many times worn",
      "Note any alterations made",
      "List what's included (dupatta, blouse, belt etc)",
      "Describe the fabric and weight",
      "Be honest about any flaws — it builds trust and reduces returns",
    ],
  },
  {
    id: "measurements",
    title: "Measurements",
    bullets: [
      "Always fill in all measurements — bust, waist, hips, length",
      "Measure the garment flat, not yourself",
      "Buyers in South Asian fashion know their measurements — accurate sizing = faster sales",
    ],
  },
];

const SellingGuide = () => {
  return (
    <div className="min-h-screen pb-20 md:pb-0">
      <section className="container py-14 md:py-20 text-center">
        <p className="font-mono text-xs tracking-[0.2em] text-gold uppercase mb-4">Seller Tips</p>
        <h1 className="font-display text-4xl md:text-5xl font-bold text-primary tracking-tight">
          How to sell <span className="italic text-gradient-gold">faster</span> on Dobaara
        </h1>
        <p className="mt-4 text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
          Tips from our team to help your listings stand out and sell quickly.
        </p>
      </section>

      <section className="container pb-12">
        <div className="max-w-3xl mx-auto">
          <Accordion type="multiple" defaultValue={sections.map((s) => s.id)} className="space-y-3">
            {sections.map((s) => (
              <AccordionItem
                key={s.id}
                value={s.id}
                className="rounded-2xl border border-border bg-card px-5"
              >
                <AccordionTrigger className="text-left font-display text-lg font-semibold text-primary hover:no-underline">
                  {s.title}
                </AccordionTrigger>
                <AccordionContent>
                  <ul className="space-y-2.5 pb-2">
                    {s.bullets.map((b) => (
                      <li key={b} className="flex gap-3 text-sm text-foreground/85 leading-relaxed">
                        <span className="mt-1.5 inline-block h-1.5 w-1.5 rounded-full bg-gold shrink-0" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      <section className="container py-12">
        <div className="rounded-2xl border border-gold/30 bg-[hsl(var(--gold-light))]/60 p-8 md:p-10 text-center max-w-2xl mx-auto">
          <h2 className="font-display text-2xl md:text-3xl font-semibold text-primary">
            Ready to list?
          </h2>
          <p className="mt-2 text-muted-foreground">
            It takes minutes, and it's free.
          </p>
          <Link to="/sell" className="mt-5 inline-block">
            <Button variant="gold" size="lg" className="font-bold">
              <SketchTagIcon className="h-4 w-4" /> Start Selling
              <SketchArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default SellingGuide;
