const sizeRows = [
  { uk: "XS", bust: "80–83", waist: "63–66", hips: "88–91" },
  { uk: "S", bust: "84–87", waist: "67–70", hips: "92–95" },
  { uk: "M", bust: "88–91", waist: "71–74", hips: "96–99" },
  { uk: "L", bust: "92–95", waist: "75–78", hips: "100–103" },
  { uk: "XL", bust: "96–99", waist: "79–82", hips: "104–107" },
  { uk: "XXL", bust: "100–103", waist: "83–86", hips: "108–111" },
];

const measureSteps = [
  { label: "Bust", body: "Measure around the fullest part of your chest." },
  { label: "Waist", body: "Measure around your natural waistline." },
  { label: "Hips", body: "Measure around the fullest part of your hips." },
  { label: "Length", body: "For lehengas, measured from waist to hem." },
];

const tips = [
  "When in doubt, size up — most South Asian garments can be taken in.",
  "Custom-stitched pieces: always check the actual measurements listed, not the size label.",
  "Heavily embellished lehengas are often less stretchy — check waist measurement carefully.",
  "Blouse measurements are the most important part of a lehenga set.",
];

const SizeGuide = () => {
  return (
    <div className="min-h-screen pb-20 md:pb-0">
      <section className="container py-14 md:py-20 text-center">
        <p className="font-mono text-xs tracking-[0.2em] text-gold uppercase mb-4">Sizing</p>
        <h1 className="font-display text-4xl md:text-5xl font-bold text-primary tracking-tight">
          Size <span className="italic text-gradient-gold">Guide</span>
        </h1>
        <p className="mt-4 text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
          South Asian clothing sizing varies significantly between designers and regions.
          Always check measurements before buying.
        </p>
      </section>

      <section className="container pb-12">
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-6 md:gap-8 items-start">
          {/* Diagram placeholder */}
          <div className="rounded-2xl border border-gold/20 bg-card p-6 md:p-8 flex flex-col items-center">
            <svg
              viewBox="0 0 160 240"
              className="w-40 h-60 text-primary"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              {/* head */}
              <circle cx="80" cy="28" r="14" />
              {/* body silhouette */}
              <path d="M60 48c-6 4-10 12-12 22l-6 30 14 4-2 22 16 4-4 60h28l-4-60 16-4-2-22 14-4-6-30c-2-10-6-18-12-22" />
              {/* bust line */}
              <line x1="46" y1="84" x2="114" y2="84" stroke="hsl(var(--gold))" strokeDasharray="3 3" />
              <text x="120" y="86" fontSize="8" fill="hsl(var(--gold))" stroke="none">Bust</text>
              {/* waist line */}
              <line x1="50" y1="116" x2="110" y2="116" stroke="hsl(var(--gold))" strokeDasharray="3 3" />
              <text x="116" y="118" fontSize="8" fill="hsl(var(--gold))" stroke="none">Waist</text>
              {/* hip line */}
              <line x1="46" y1="146" x2="114" y2="146" stroke="hsl(var(--gold))" strokeDasharray="3 3" />
              <text x="120" y="148" fontSize="8" fill="hsl(var(--gold))" stroke="none">Hips</text>
              {/* length */}
              <line x1="30" y1="116" x2="30" y2="206" stroke="hsl(var(--gold))" strokeDasharray="3 3" />
              <text x="6" y="164" fontSize="8" fill="hsl(var(--gold))" stroke="none">Length</text>
            </svg>
          </div>

          <div>
            <h2 className="font-display text-2xl font-semibold text-primary mb-5">
              How to measure yourself
            </h2>
            <ul className="space-y-4">
              {measureSteps.map((m) => (
                <li key={m.label} className="flex gap-3">
                  <span className="font-mono text-xs tracking-[0.18em] uppercase text-gold w-16 mt-0.5 shrink-0">
                    {m.label}
                  </span>
                  <span className="text-sm text-foreground/85 leading-relaxed">{m.body}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Conversion table */}
      <section className="container py-12">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-display text-2xl md:text-3xl font-semibold text-primary text-center mb-6">
            Conversion table
          </h2>
          <div className="overflow-hidden rounded-2xl border border-border bg-card">
            <table className="w-full text-sm">
              <thead className="bg-secondary/60 text-foreground">
                <tr>
                  <th className="text-left px-4 py-3 font-display font-semibold">UK Size</th>
                  <th className="text-left px-4 py-3 font-display font-semibold">Bust (cm)</th>
                  <th className="text-left px-4 py-3 font-display font-semibold">Waist (cm)</th>
                  <th className="text-left px-4 py-3 font-display font-semibold">Hips (cm)</th>
                </tr>
              </thead>
              <tbody>
                {sizeRows.map((r, i) => (
                  <tr
                    key={r.uk}
                    className={i !== sizeRows.length - 1 ? "border-b border-border" : ""}
                  >
                    <td className="px-4 py-3 font-semibold text-primary">{r.uk}</td>
                    <td className="px-4 py-3 text-foreground/85">{r.bust}</td>
                    <td className="px-4 py-3 text-foreground/85">{r.waist}</td>
                    <td className="px-4 py-3 text-foreground/85">{r.hips}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Tips */}
      <section className="container py-14">
        <div className="max-w-2xl mx-auto rounded-2xl border border-gold/20 bg-[hsl(var(--gold-light))]/40 p-6 md:p-8">
          <h2 className="font-display text-xl font-semibold text-primary mb-4">Tips</h2>
          <ul className="space-y-2.5">
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
