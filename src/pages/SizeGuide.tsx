const sizeRows = [
  { uk: "XS", bustIn: "31–32", bustCm: "80–83", waistIn: "25–26", waistCm: "63–66", hipsIn: "34–36", hipsCm: "88–91" },
  { uk: "S", bustIn: "33–34", bustCm: "84–87", waistIn: "26–27", waistCm: "67–70", hipsIn: "36–37", hipsCm: "92–95" },
  { uk: "M", bustIn: "35–36", bustCm: "88–91", waistIn: "28–29", waistCm: "71–74", hipsIn: "38–39", hipsCm: "96–99" },
  { uk: "L", bustIn: "36–37", bustCm: "92–95", waistIn: "29–31", waistCm: "75–78", hipsIn: "39–40", hipsCm: "100–103" },
  { uk: "XL", bustIn: "38–39", bustCm: "96–99", waistIn: "31–32", waistCm: "79–82", hipsIn: "41–42", hipsCm: "104–107" },
  { uk: "XXL", bustIn: "39–40", bustCm: "100–103", waistIn: "33–34", waistCm: "83–86", hipsIn: "42–44", hipsCm: "108–111" },
];

const measureSteps = [
  { label: "Bust", body: "Measure around the fullest part of your chest." },
  { label: "Waist", body: "Measure around your natural waistline." },
  { label: "Hips", body: "Measure around the fullest part of your hips." },
  { label: "Length", body: "For lehengas, measured from waist to hem." },
];

const garmentGuides = [
  {
    title: "Lehenga",
    items: [
      "Blouse: bust, waist, shoulder, sleeve length, blouse length",
      "Skirt: waist, hip, length (waist to hem), flare",
    ],
  },
  {
    title: "Saree",
    items: [
      "Length and width of the drape",
      "Blouse measurements, if included",
      "Whether fall and pico are already attached",
    ],
  },
  {
    title: "Salwar Kameez",
    items: [
      "Kameez: bust, waist, hip, length",
      "Salwar: waist and length",
      "Dupatta included: yes or no",
    ],
  },
  {
    title: "Anarkali",
    items: [
      "Bust, waist, full length",
      "Flare at the hem",
    ],
  },
  {
    title: "Sherwani",
    items: [
      "Chest, shoulder, sleeve length, full length",
      "Trouser: waist and length",
    ],
  },
];

const waistTypes = [
  {
    name: "Elastic",
    description: "Gives 1–2 inches of give around the waist. Best for ready-to-wear salwars and lehenga skirts that need to fit a range of sizes.",
  },
  {
    name: "Drawstring (naada)",
    description: "A fabric cord that lets you tighten or loosen the fit. Common on lehenga skirts and very flexible, but check the maximum waist it can open to.",
  },
  {
    name: "Fixed hook-and-eye",
    description: "A set closure with almost no give. The listed waist measurement must match yours closely, or the piece will need alteration.",
  },
  {
    name: "Zip",
    description: "A structured closure with no stretch. Make sure the waist and hip measurements are at or slightly larger than yours for a comfortable fit.",
  },
];

const heightGuide = [
  { height: "5'0\" – 5'2\"", length: "38–40 inches" },
  { height: "5'3\" – 5'5\"", length: "40–42 inches" },
  { height: "5'6\" – 5'8\"", length: "42–44 inches" },
  { height: "5'9\" – 5'11\"", length: "44–46 inches" },
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
          South Asian Size <span className="italic text-gradient-gold">Guide</span>
        </h1>
        <p className="mt-4 text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
          South Asian clothing sizing varies significantly between designers and regions.
          Always check measurements before buying.
        </p>
      </section>

      {/* Why South Asian sizing is different */}
      <section className="container pb-12">
        <div className="max-w-3xl mx-auto rounded-2xl border border-gold/20 bg-card p-6 md:p-8">
          <h2 className="font-display text-2xl md:text-3xl font-semibold text-primary mb-4">
            Why South Asian sizing is different
          </h2>
          <div className="space-y-3 text-base text-foreground/85 leading-relaxed">
            <p>
              Most South Asian occasion wear is tailored, not sized off-the-rack. A label that says “Medium” can mean wildly different things depending on the boutique, the cutter, and whether the piece was made in the UK, India, or Pakistan.
            </p>
            <p>
              Many garments also have seam allowance — extra fabric folded inside the seams — which means the size label often does not reflect the actual fit. A piece can usually be taken in, but it can only be let out if there is margin to work with.
            </p>
            <p className="font-medium text-primary">
              Always read the measurements, not the label.
            </p>
          </div>
        </div>
      </section>

      {/* Understanding margin */}
      <section className="container py-12">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-display text-2xl md:text-3xl font-semibold text-primary mb-4">
            Understanding margin
          </h2>
          <div className="space-y-3 text-base text-foreground/85 leading-relaxed">
            <p>
              <span className="font-medium text-primary">Margin</span> is the seam allowance built into a garment — the extra fabric folded inside the seams that a tailor can let out. On a blouse, this is typically 1–3 inches.
            </p>
            <p>
              A piece with generous margin fits a wider range of body measurements and is far easier to alter. If a measurement is only slightly smaller than yours, margin can make the difference between a piece that fits and one that does not.
            </p>
            <p className="font-medium text-primary">
              This is the single most important thing to check before buying.
            </p>
          </div>
        </div>
      </section>

      {/* How to measure yourself */}
      <section className="container py-12">
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

      {/* How to measure each garment type */}
      <section className="container py-12">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-display text-2xl md:text-3xl font-semibold text-primary text-center mb-8">
            How to measure each garment type
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {garmentGuides.map((g) => (
              <div
                key={g.title}
                className="rounded-2xl border border-gold/20 bg-card p-5 md:p-6"
              >
                <h3 className="font-display text-xl font-semibold text-primary mb-3">
                  {g.title}
                </h3>
                <ul className="space-y-2">
                  {g.items.map((item, i) => (
                    <li key={i} className="flex gap-2 text-sm text-foreground/85 leading-relaxed">
                      <span className="mt-1.5 inline-block h-1.5 w-1.5 rounded-full bg-gold shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Waist types */}
      <section className="container py-12">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-display text-2xl md:text-3xl font-semibold text-primary mb-6">
            Waist types
          </h2>
          <div className="space-y-4">
            {waistTypes.map((w) => (
              <div
                key={w.name}
                className="rounded-2xl border border-border bg-card p-5 md:p-6"
              >
                <h3 className="font-display text-lg font-semibold text-primary mb-2">
                  {w.name}
                </h3>
                <p className="text-sm text-foreground/85 leading-relaxed">
                  {w.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Height and lehenga length */}
      <section className="container py-12">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-display text-2xl md:text-3xl font-semibold text-primary mb-4">
            Height and lehenga length
          </h2>
          <p className="text-base text-foreground/85 leading-relaxed mb-6">
            Lehenga length is fixed and cannot easily be lengthened — it can usually only be shortened. Check the listed waist-to-hem measurement against your height before buying.
          </p>
          <div className="overflow-hidden rounded-2xl border border-border bg-card">
            <table className="w-full text-sm">
              <thead className="bg-secondary/60 text-foreground">
                <tr>
                  <th className="text-left px-4 py-3 font-display font-semibold">Height</th>
                  <th className="text-left px-4 py-3 font-display font-semibold">Suggested lehenga length</th>
                </tr>
              </thead>
              <tbody>
                {heightGuide.map((row, i) => (
                  <tr
                    key={row.height}
                    className={i !== heightGuide.length - 1 ? "border-b border-border" : ""}
                  >
                    <td className="px-4 py-3 font-semibold text-primary">{row.height}</td>
                    <td className="px-4 py-3 text-foreground/85">{row.length}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Conversion table */}
      <section className="container py-12">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-display text-2xl md:text-3xl font-semibold text-primary text-center mb-6">
            Conversion table
          </h2>
          <p className="text-center text-sm text-muted-foreground mb-6">
            Measurements shown in inches first, then centimetres.
          </p>
          <div className="overflow-hidden rounded-2xl border border-border bg-card">
            <table className="w-full text-sm">
              <thead className="bg-secondary/60 text-foreground">
                <tr>
                  <th className="text-left px-4 py-3 font-display font-semibold">UK Size</th>
                  <th className="text-left px-4 py-3 font-display font-semibold">Bust</th>
                  <th className="text-left px-4 py-3 font-display font-semibold">Waist</th>
                  <th className="text-left px-4 py-3 font-display font-semibold">Hips</th>
                </tr>
              </thead>
              <tbody>
                {sizeRows.map((r, i) => (
                  <tr
                    key={r.uk}
                    className={i !== sizeRows.length - 1 ? "border-b border-border" : ""}
                  >
                    <td className="px-4 py-3 font-semibold text-primary">{r.uk}</td>
                    <td className="px-4 py-3 text-foreground/85">
                      {r.bustIn}" <span className="text-muted-foreground">({r.bustCm} cm)</span>
                    </td>
                    <td className="px-4 py-3 text-foreground/85">
                      {r.waistIn}" <span className="text-muted-foreground">({r.waistCm} cm)</span>
                    </td>
                    <td className="px-4 py-3 text-foreground/85">
                      {r.hipsIn}" <span className="text-muted-foreground">({r.hipsCm} cm)</span>
                    </td>
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
