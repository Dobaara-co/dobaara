import { useState } from "react";
import { Ruler, ChevronDown, ChevronUp } from "lucide-react";

// ── data ──────────────────────────────────────────────────────────────────────

const sizeRows = [
  { uk: "XS",  bustIn: "31–32", bustCm: "80–83",   waistIn: "25–26", waistCm: "63–66",   hipsIn: "34–36", hipsCm: "88–91"   },
  { uk: "S",   bustIn: "33–34", bustCm: "84–87",   waistIn: "26–27", waistCm: "67–70",   hipsIn: "36–37", hipsCm: "92–95"   },
  { uk: "M",   bustIn: "35–36", bustCm: "88–91",   waistIn: "28–29", waistCm: "71–74",   hipsIn: "38–39", hipsCm: "96–99"   },
  { uk: "L",   bustIn: "36–37", bustCm: "92–95",   waistIn: "29–31", waistCm: "75–78",   hipsIn: "39–40", hipsCm: "100–103" },
  { uk: "XL",  bustIn: "38–39", bustCm: "96–99",   waistIn: "31–32", waistCm: "79–82",   hipsIn: "41–42", hipsCm: "104–107" },
  { uk: "XXL", bustIn: "39–40", bustCm: "100–103", waistIn: "33–34", waistCm: "83–86",   hipsIn: "42–44", hipsCm: "108–111" },
];

const garmentGuides = [
  {
    title: "Lehenga",
    colour: "border-[hsl(var(--gold))]/30",
    blouse: [
      { step: "Bust", how: "Lay the blouse flat. Measure straight across the chest at the widest point, then double that number." },
      { step: "Waist", how: "Measure across the narrowest part of the torso, then double." },
      { step: "Length", how: "Measure from the shoulder seam (or the base of the neck at centre back) straight down to the hemline." },
      { step: "Shoulder", how: "Measure seam to seam along the top of the blouse with the garment lying flat." },
      { step: "Sleeve length", how: "Measure from the shoulder seam to the edge of the cuff." },
      { step: "Margin", how: "Turn inside out. At the side seam, measure the width of the folded seam allowance. Multiply by 2 (two seams)." },
    ],
    skirt: [
      { step: "Waist", how: "For a fixed waist, measure all the way around the inside of the waistband. For elastic/drawstring, measure fully open." },
      { step: "Length", how: "Measure from the top of the waistband straight down to the hemline." },
      { step: "Flare / ghera", how: "Lay the skirt flat and measure across the very bottom edge, then double." },
      { step: "Margin", how: "Same as the blouse — turn inside out and measure the folded side seam." },
    ],
  },
  {
    title: "Saree",
    colour: "border-[hsl(var(--terracotta))]/30",
    drape: [
      { step: "Length", how: "Stretch the saree out fully and measure end to end. Most sarees are 5.5–6.3 m." },
      { step: "Width", how: "Measure straight across the saree at its widest point." },
    ],
    blouseNote: "If a blouse is included, measure it the same way as a lehenga blouse above.",
  },
  {
    title: "Salwar Kameez",
    colour: "border-[hsl(var(--mocha))]/30",
    kameez: [
      { step: "Bust", how: "Lay flat, measure across the chest at the widest point, then double." },
      { step: "Waist", how: "Measure across the narrowest torso point, then double." },
      { step: "Hip", how: "Measure across the widest hip/seat area of the kameez, then double." },
      { step: "Length", how: "Measure from the highest shoulder point down to the hemline." },
      { step: "Shoulder", how: "Seam to seam across the top with the garment flat." },
      { step: "Sleeve length", how: "Shoulder seam to cuff edge." },
      { step: "Margin", how: "Turn inside out, measure the folded side seam width × 2." },
    ],
    salwar: [
      { step: "Waist", how: "Measure all the way around the inside of the waistband." },
      { step: "Length", how: "Measure from the top of the waistband to the hem." },
    ],
  },
  {
    title: "Anarkali",
    colour: "border-[hsl(var(--gold))]/30",
    body: [
      { step: "Bust", how: "Lay flat, measure across chest at the widest point, then double." },
      { step: "Waist", how: "Measure across the narrowest torso point, then double." },
      { step: "Full length", how: "Measure from the highest shoulder point all the way to the hemline." },
      { step: "Flare", how: "Lay flat and measure across the bottom of the skirt portion, then double." },
      { step: "Shoulder / sleeve", how: "Same as lehenga blouse." },
      { step: "Margin", how: "Turn inside out, folded seam width × 2 at the widest point." },
    ],
  },
  {
    title: "Sherwani",
    colour: "border-[hsl(var(--stone-warm))]/30",
    sherwani: [
      { step: "Chest", how: "Lay flat, measure across the chest at the widest point, then double." },
      { step: "Full length", how: "Measure from collar/shoulder base down to the hemline." },
      { step: "Shoulder", how: "Seam to seam across the top, garment lying flat." },
      { step: "Sleeve length", how: "Shoulder seam to cuff edge." },
      { step: "Margin", how: "Turn inside out, folded seam width × 2." },
    ],
    trousers: [
      { step: "Waist", how: "Measure all the way around the inside of the waistband." },
      { step: "Length", how: "Top of waistband to hem." },
    ],
  },
];

const waistTypes = [
  {
    name: "Elastic",
    badge: "Most flexible",
    description:
      "Stretches 2–4 inches beyond the listed waist measurement. Great for ready-to-wear salwars and lehenga skirts. The listed measurement is the resting size — the actual maximum is usually the listed figure plus the full stretch.",
  },
  {
    name: "Drawstring (naada)",
    badge: "Adjustable",
    description:
      "A fabric cord that cinches the waist. Very forgiving across a range of sizes, but check the fully-open waist measurement. It can be tightened easily; it cannot be loosened beyond fully open.",
  },
  {
    name: "Fixed hook-and-eye",
    badge: "No give",
    description:
      "A set closure with almost no stretch. The listed waist measurement must be at or slightly above yours for a comfortable fit, or the piece will need alteration.",
  },
  {
    name: "Zip",
    badge: "Structured",
    description:
      "No stretch whatsoever. Make sure both waist and hip measurements meet or slightly exceed yours — there is no room for error without alteration.",
  },
];

const heightGuide = [
  { height: "Under 5'2\"",   cm: "Under 157 cm",  length: "38–40 inches / 97–102 cm" },
  { height: "5'2\" – 5'4\"", cm: "157–163 cm",    length: "40–42 inches / 102–107 cm" },
  { height: "5'5\" – 5'7\"", cm: "164–170 cm",    length: "42–44 inches / 107–112 cm" },
  { height: "5'8\" – 5'10\"",cm: "171–178 cm",    length: "44–46 inches / 112–117 cm" },
  { height: "Over 5'10\"",   cm: "Over 178 cm",   length: "46+ inches / 117+ cm" },
];

const buyerSteps = [
  { label: "Bust",   body: "Wear a non-padded bra or nothing. Measure around the fullest part of your chest, keeping the tape parallel to the floor." },
  { label: "Waist",  body: "Measure around your natural waist — the narrowest part, usually just above your navel." },
  { label: "Hips",   body: "Stand with feet together. Measure around the fullest part of your hips and seat." },
  { label: "Height", body: "Stand barefoot against a wall. Mark the top of your head and measure to the floor." },
];

const tips = [
  "When in doubt, size up — most South Asian garments can be taken in.",
  "Custom-stitched pieces: always check the actual measurements, not the size label.",
  "Heavily embellished lehengas are less stretchy — check the waist measurement carefully.",
  "Blouse measurements matter most. A perfect skirt fit means nothing if the blouse doesn't close.",
  "A listed margin of even 1 inch transforms a 'unlikely' fit into 'fits with alteration'.",
  "If no margin is listed, contact the seller and ask before buying.",
];

// ── sub-components ────────────────────────────────────────────────────────────

function StepList({ steps }: { steps: { step: string; how: string }[] }) {
  return (
    <ul className="space-y-3">
      {steps.map(({ step, how }) => (
        <li key={step} className="grid grid-cols-[7rem_1fr] gap-3 text-sm">
          <span className="font-mono text-xs uppercase tracking-wider text-gold pt-0.5">{step}</span>
          <span className="text-foreground/80 leading-relaxed">{how}</span>
        </li>
      ))}
    </ul>
  );
}

function Accordion({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-2xl border border-gold/20 bg-card overflow-hidden">
      <button
        type="button"
        className="flex w-full items-center justify-between px-5 py-4 text-left"
        onClick={() => setOpen((o) => !o)}
      >
        <span className="font-display text-lg font-semibold text-primary">{title}</span>
        {open ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
        )}
      </button>
      {open && <div className="px-5 pb-5 pt-1 space-y-5">{children}</div>}
    </div>
  );
}

// ── page ─────────────────────────────────────────────────────────────────────

const SizeGuide = () => {
  return (
    <div className="min-h-screen pb-20 md:pb-0">

      {/* Hero */}
      <section className="container py-14 md:py-20 text-center">
        <p className="font-mono text-xs tracking-[0.2em] text-gold uppercase mb-4">Sizing</p>
        <h1 className="font-display text-4xl md:text-5xl font-bold text-primary tracking-tight">
          South Asian Size <span className="italic text-gradient-gold">Guide</span>
        </h1>
        <p className="mt-4 text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
          South Asian clothing sizing varies widely between designers and regions.
          Always check measurements — not labels — before buying or listing.
        </p>
      </section>

      {/* Why SA sizing is different */}
      <section className="container pb-12">
        <div className="max-w-3xl mx-auto rounded-2xl border border-gold/20 bg-card p-6 md:p-8">
          <h2 className="font-display text-2xl md:text-3xl font-semibold text-primary mb-4">
            Why South Asian sizing is different
          </h2>
          <div className="space-y-3 text-base text-foreground/85 leading-relaxed">
            <p>
              Most South Asian occasion wear is tailored, not sized off-the-rack. A label that says "Medium" can mean very different things depending on the boutique, the cutter, and whether the piece was made in the UK, India, or Pakistan.
            </p>
            <p>
              Many garments also have seam allowance — extra fabric folded inside the seams — which means the size label often does not reflect the actual fit. A piece can usually be taken in, but it can only be let out if there is margin to work with.
            </p>
            <p className="font-semibold text-primary">
              Always read the measurements, not the label.
            </p>
          </div>
        </div>
      </section>

      {/* Understanding margin — expanded */}
      <section className="container py-12">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-display text-2xl md:text-3xl font-semibold text-primary mb-6">
            Understanding margin
          </h2>
          <div className="grid md:grid-cols-2 gap-6 items-start">
            <div className="space-y-3 text-base text-foreground/85 leading-relaxed">
              <p>
                <span className="font-semibold text-primary">Margin</span> (also called seam allowance) is the strip of extra fabric folded inside the side seams. A tailor can unpick the seam, release that fabric, and let the garment out.
              </p>
              <p>
                A blouse with 2 inches of margin on each side seam has <span className="font-semibold">4 inches total</span> that can be released. That transforms a piece that is slightly too small into one that fits perfectly after a minor alteration.
              </p>
              <p className="font-semibold text-primary">
                Without margin, the only option is to take in — you cannot add fabric that was never there.
              </p>
            </div>
            {/* margin SVG illustration */}
            <div className="rounded-2xl border border-gold/20 bg-card p-5 flex flex-col items-center gap-3">
              <p className="text-xs font-mono uppercase tracking-wider text-gold">How to find margin</p>
              <svg
                viewBox="0 0 160 100"
                className="w-full max-w-[220px]"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                {/* fabric body */}
                <rect x="20" y="20" width="120" height="60" rx="4" className="stroke-border fill-secondary/60" strokeWidth="1.5" />
                {/* seam fold on left */}
                <line x1="38" y1="20" x2="38" y2="80" stroke="hsl(var(--gold))" strokeWidth="2" strokeDasharray="4 2" />
                {/* seam fold on right */}
                <line x1="122" y1="20" x2="122" y2="80" stroke="hsl(var(--gold))" strokeWidth="2" strokeDasharray="4 2" />
                {/* arrows for left margin */}
                <line x1="20" y1="50" x2="38" y2="50" stroke="hsl(var(--gold))" strokeWidth="1.5" />
                <polygon points="20,47 20,53 14,50" fill="hsl(var(--gold))" stroke="none" />
                <polygon points="38,47 38,53 44,50" fill="hsl(var(--gold))" stroke="none" />
                <text x="25" y="46" fontSize="7" fill="hsl(var(--gold))" stroke="none" fontFamily="monospace">Margin</text>
                {/* stitch dots along seam */}
                {[28,36,44,52,60,68,76].map((y) => (
                  <circle key={y} cx="38" cy={y} r="1.2" fill="hsl(var(--gold))" stroke="none" />
                ))}
                {[28,36,44,52,60,68,76].map((y) => (
                  <circle key={y} cx="122" cy={y} r="1.2" fill="hsl(var(--gold))" stroke="none" />
                ))}
              </svg>
              <ol className="text-xs text-foreground/75 leading-relaxed space-y-1.5 self-start">
                <li className="flex gap-2"><span className="font-semibold text-gold shrink-0">1.</span> Turn the garment inside out.</li>
                <li className="flex gap-2"><span className="font-semibold text-gold shrink-0">2.</span> Find the side seam — a line of stitching with folded fabric on each side.</li>
                <li className="flex gap-2"><span className="font-semibold text-gold shrink-0">3.</span> Measure the width of the folded seam allowance from the stitching to the raw edge.</li>
                <li className="flex gap-2"><span className="font-semibold text-gold shrink-0">4.</span> There are two side seams, so multiply by 2 for total available margin.</li>
              </ol>
            </div>
          </div>
        </div>
      </section>

      {/* How to measure a garment (sellers) */}
      <section className="container py-12">
        <div className="max-w-3xl mx-auto">
          <div className="mb-2">
            <p className="font-mono text-xs tracking-[0.18em] text-gold uppercase mb-1">For sellers</p>
            <h2 className="font-display text-2xl md:text-3xl font-semibold text-primary">
              How to measure your garment
            </h2>
          </div>
          <p className="text-base text-foreground/85 leading-relaxed mb-6">
            Lay the garment flat on a clean surface. For circumference measurements (bust, waist, hips) measure across the flat garment and <span className="font-semibold">double the result</span>. For lengths and widths, measure in a straight line.
          </p>

          <div className="space-y-3">
            {garmentGuides.map((guide) => (
              <Accordion key={guide.title} title={guide.title}>
                {guide.title === "Lehenga" && (
                  <>
                    <div>
                      <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-3">Blouse</p>
                      <StepList steps={guide.blouse} />
                    </div>
                    <div>
                      <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-3">Skirt</p>
                      <StepList steps={guide.skirt} />
                    </div>
                  </>
                )}
                {guide.title === "Saree" && (
                  <>
                    <div>
                      <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-3">Drape</p>
                      <StepList steps={guide.drape} />
                    </div>
                    <p className="text-sm text-foreground/75 italic">{guide.blouseNote}</p>
                  </>
                )}
                {guide.title === "Salwar Kameez" && (
                  <>
                    <div>
                      <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-3">Kameez</p>
                      <StepList steps={guide.kameez} />
                    </div>
                    <div>
                      <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-3">Salwar</p>
                      <StepList steps={guide.salwar} />
                    </div>
                  </>
                )}
                {guide.title === "Anarkali" && (
                  <StepList steps={guide.body} />
                )}
                {guide.title === "Sherwani" && (
                  <>
                    <div>
                      <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-3">Sherwani</p>
                      <StepList steps={guide.sherwani} />
                    </div>
                    <div>
                      <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-3">Trousers / Churidar</p>
                      <StepList steps={guide.trousers} />
                    </div>
                  </>
                )}
              </Accordion>
            ))}
          </div>
        </div>
      </section>

      {/* How to measure yourself (buyers) */}
      <section className="container py-12">
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-6 md:gap-10 items-start">
          {/* figure SVG */}
          <div className="rounded-2xl border border-gold/20 bg-card p-6 flex flex-col items-center">
            <p className="font-mono text-xs tracking-[0.18em] text-gold uppercase mb-4">For buyers</p>
            <svg
              viewBox="0 0 160 240"
              className="w-36 h-56 text-primary"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="80" cy="28" r="14" />
              <path d="M60 48c-6 4-10 12-12 22l-6 30 14 4-2 22 16 4-4 60h28l-4-60 16-4-2-22 14-4-6-30c-2-10-6-18-12-22" />
              <line x1="46" y1="84" x2="114" y2="84" stroke="hsl(var(--gold))" strokeDasharray="3 3" strokeWidth="1.5" />
              <text x="118" y="87" fontSize="7.5" fill="hsl(var(--gold))" stroke="none">Bust</text>
              <line x1="50" y1="116" x2="110" y2="116" stroke="hsl(var(--gold))" strokeDasharray="3 3" strokeWidth="1.5" />
              <text x="114" y="119" fontSize="7.5" fill="hsl(var(--gold))" stroke="none">Waist</text>
              <line x1="46" y1="146" x2="114" y2="146" stroke="hsl(var(--gold))" strokeDasharray="3 3" strokeWidth="1.5" />
              <text x="118" y="149" fontSize="7.5" fill="hsl(var(--gold))" stroke="none">Hips</text>
              <line x1="28" y1="28" x2="28" y2="206" stroke="hsl(var(--gold))" strokeDasharray="3 3" strokeWidth="1.5" />
              <text x="5" y="120" fontSize="7.5" fill="hsl(var(--gold))" stroke="none" transform="rotate(-90 28 120) translate(-28 -120)">Height</text>
            </svg>
          </div>

          <div>
            <h2 className="font-display text-2xl font-semibold text-primary mb-5">
              How to measure yourself
            </h2>
            <ul className="space-y-5">
              {buyerSteps.map((m) => (
                <li key={m.label} className="flex gap-3">
                  <span className="font-mono text-xs tracking-[0.18em] uppercase text-gold w-14 mt-0.5 shrink-0">
                    {m.label}
                  </span>
                  <span className="text-sm text-foreground/85 leading-relaxed">{m.body}</span>
                </li>
              ))}
            </ul>
            <p className="mt-5 text-xs text-muted-foreground">
              Save your measurements in <span className="font-medium text-primary">Account → My measurements</span> to see instant fit predictions on every listing.
            </p>
          </div>
        </div>
      </section>

      {/* Waist types */}
      <section className="container py-12">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-display text-2xl md:text-3xl font-semibold text-primary mb-6">
            Waist types explained
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {waistTypes.map((w) => (
              <div key={w.name} className="rounded-2xl border border-border bg-card p-5">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-display text-base font-semibold text-primary">{w.name}</h3>
                  <span className="rounded-full bg-secondary px-2 py-0.5 text-xs text-muted-foreground">
                    {w.badge}
                  </span>
                </div>
                <p className="text-sm text-foreground/80 leading-relaxed">{w.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Height and length */}
      <section className="container py-12">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-display text-2xl md:text-3xl font-semibold text-primary mb-3">
            Height and garment length
          </h2>
          <p className="text-base text-foreground/85 leading-relaxed mb-6">
            Lehenga skirts, anarkalis, and sherwanis have a fixed hemline that can be shortened but not lengthened. Check the listed waist-to-hem measurement against your height before buying.
          </p>
          <div className="overflow-hidden rounded-2xl border border-border bg-card">
            <table className="w-full text-sm">
              <thead className="bg-secondary/60 text-foreground">
                <tr>
                  <th className="text-left px-4 py-3 font-display font-semibold">Height</th>
                  <th className="text-left px-4 py-3 font-display font-semibold hidden sm:table-cell">Approx. (cm)</th>
                  <th className="text-left px-4 py-3 font-display font-semibold">Suggested skirt length</th>
                </tr>
              </thead>
              <tbody>
                {heightGuide.map((row, i) => (
                  <tr
                    key={row.height}
                    className={i !== heightGuide.length - 1 ? "border-b border-border" : ""}
                  >
                    <td className="px-4 py-3 font-semibold text-primary">{row.height}</td>
                    <td className="px-4 py-3 text-foreground/70 hidden sm:table-cell">{row.cm}</td>
                    <td className="px-4 py-3 text-foreground/85">{row.length}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* UK size conversion */}
      <section className="container py-12">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-display text-2xl md:text-3xl font-semibold text-primary text-center mb-2">
            UK size conversion
          </h2>
          <p className="text-center text-sm text-muted-foreground mb-6">
            Use as a rough guide only — always check the actual garment measurements listed.
          </p>
          <div className="overflow-hidden rounded-2xl border border-border bg-card">
            <table className="w-full text-sm">
              <thead className="bg-secondary/60 text-foreground">
                <tr>
                  <th className="text-left px-4 py-3 font-display font-semibold">UK</th>
                  <th className="text-left px-4 py-3 font-display font-semibold">Bust</th>
                  <th className="text-left px-4 py-3 font-display font-semibold">Waist</th>
                  <th className="text-left px-4 py-3 font-display font-semibold">Hips</th>
                </tr>
              </thead>
              <tbody>
                {sizeRows.map((r, i) => (
                  <tr key={r.uk} className={i !== sizeRows.length - 1 ? "border-b border-border" : ""}>
                    <td className="px-4 py-3 font-semibold text-primary">{r.uk}</td>
                    <td className="px-4 py-3 text-foreground/85">
                      {r.bustIn}" <span className="text-muted-foreground">/ {r.bustCm} cm</span>
                    </td>
                    <td className="px-4 py-3 text-foreground/85">
                      {r.waistIn}" <span className="text-muted-foreground">/ {r.waistCm} cm</span>
                    </td>
                    <td className="px-4 py-3 text-foreground/85">
                      {r.hipsIn}" <span className="text-muted-foreground">/ {r.hipsCm} cm</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Quick cm → inches reference */}
      <section className="container py-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-display text-lg font-semibold text-primary mb-3 flex items-center gap-2">
            <Ruler className="h-4 w-4 text-gold" /> Quick cm / inches reference
          </h2>
          <div className="overflow-hidden rounded-2xl border border-border bg-card">
            <table className="w-full text-sm">
              <thead className="bg-secondary/60">
                <tr>
                  {[20,25,30,35,40,45,50,55,60,65,70,75,80,85,90,95,100,110,120].map((cm) => (
                    <th key={cm} className="px-2 py-2 text-center font-mono text-xs text-muted-foreground font-normal">{cm}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  {[20,25,30,35,40,45,50,55,60,65,70,75,80,85,90,95,100,110,120].map((cm) => (
                    <td key={cm} className="px-2 py-2 text-center font-mono text-xs text-foreground/85">
                      {(cm / 2.54).toFixed(1)}"
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
            <p className="px-4 pb-3 text-xs text-muted-foreground">cm (top row) → inches (bottom row)</p>
          </div>
        </div>
      </section>

      {/* Tips */}
      <section className="container py-14">
        <div className="max-w-2xl mx-auto rounded-2xl border border-gold/20 bg-[hsl(var(--gold-light))]/40 p-6 md:p-8">
          <h2 className="font-display text-xl font-semibold text-primary mb-4">Tips for a good fit</h2>
          <ul className="space-y-3">
            {tips.map((t) => (
              <li key={t} className="flex gap-3 text-sm text-foreground/85 leading-relaxed">
                <span className="mt-1.5 inline-block h-1.5 w-1.5 rounded-full bg-gold shrink-0" />
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

    </div>
  );
};

export default SizeGuide;
