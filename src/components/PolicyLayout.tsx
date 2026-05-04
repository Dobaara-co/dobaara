import { ReactNode } from "react";

type Section = { title: string; body: ReactNode };

interface PolicyLayoutProps {
  title: string;
  lastUpdated: string;
  sections: Section[];
}

const PolicyLayout = ({ title, lastUpdated, sections }: PolicyLayoutProps) => (
  <div className="min-h-screen pb-20 md:pb-0 bg-background">
    <section className="container py-16 md:py-20 max-w-3xl">
      <p className="font-mono text-xs tracking-[0.2em] text-gold uppercase mb-4">
        Last updated: {lastUpdated}
      </p>
      <h1 className="font-display text-4xl md:text-5xl font-bold text-primary tracking-tight mb-6">
        {title}
      </h1>
      <div className="flex items-center gap-3 mb-10">
        <span className="h-px w-10 bg-gold/50" />
        <span className="text-gold text-sm">◆</span>
        <span className="h-px w-10 bg-gold/50" />
      </div>
      <div className="space-y-10">
        {sections.map((s, i) => (
          <section key={i}>
            <h2 className="font-display text-2xl md:text-3xl font-semibold text-primary mb-4">
              {i + 1}. {s.title}
            </h2>
            <div className="text-base text-foreground/85 leading-relaxed space-y-3">
              {s.body}
            </div>
          </section>
        ))}
      </div>
    </section>
  </div>
);

export default PolicyLayout;
