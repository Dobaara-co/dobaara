import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";

type Audience = "buyer" | "seller";

const COPY: Record<Audience, { cta: string; success: string }> = {
  buyer: {
    cta: "I want to buy",
    success: "You're on the list. We'll be in touch soon.",
  },
  seller: {
    cta: "I want to sell",
    success:
      "You're on the list. We'll reach out with everything you need to start selling.",
  },
};

const Waitlist = () => {
  const [audience, setAudience] = useState<Audience | null>(null);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "done" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const formRef = useRef<HTMLDivElement>(null);

  // Lightweight SEO for the standalone landing page
  useEffect(() => {
    const prevTitle = document.title;
    document.title = "Dobaara — Pre-loved South Asian fashion, finally with a home.";

    const setMeta = (name: string, content: string) => {
      let el = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute("name", name);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };
    setMeta(
      "description",
      "Dobaara is the UK's first marketplace for pre-loved South Asian occasion wear. Join the waitlist."
    );
    setMeta("viewport", "width=device-width, initial-scale=1, viewport-fit=cover");
    return () => {
      document.title = prevTitle;
    };
  }, []);

  const openForm = (a: Audience) => {
    setAudience(a);
    setStatus("idle");
    setErrorMsg("");
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 50);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!audience) return;
    const trimmed = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed) || trimmed.length > 255) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }
    setStatus("submitting");
    setErrorMsg("");
    const { error } = await supabase
      .from("waitlist" as never)
      .insert({ email: trimmed, type: audience } as never);
    if (error) {
      setStatus("error");
      setErrorMsg("Something went wrong. Please try again.");
      return;
    }
    setStatus("done");
  };

  return (
    <div
      className="min-h-screen w-full flex flex-col items-center justify-between px-6 py-10 sm:py-14"
      style={{
        backgroundColor: "#FDF6EE",
        color: "#2C2218",
        fontFamily:
          "ui-sans-serif, system-ui, -apple-system, 'Helvetica Neue', Arial, sans-serif",
      }}
    >
      {/* Wordmark */}
      <header className="w-full text-center pt-2">
        <h1
          className="text-2xl sm:text-3xl tracking-[0.35em] uppercase"
          style={{ fontFamily: "Georgia, 'Playfair Display', serif", color: "#2C2218" }}
        >
          Dobaara
        </h1>
        <div
          className="mx-auto mt-3 h-px w-16"
          style={{ backgroundColor: "#C9972B", opacity: 0.6 }}
        />
      </header>

      {/* Hero */}
      <main className="w-full max-w-xl mx-auto flex-1 flex flex-col items-center justify-center text-center py-12">
        <h2
          className="text-[2rem] leading-[1.15] sm:text-5xl sm:leading-tight font-normal"
          style={{ fontFamily: "Georgia, 'Playfair Display', serif", color: "#2C2218" }}
        >
          Pre-loved South Asian fashion,
          <br />
          <em style={{ color: "#C9972B", fontStyle: "italic" }}>finally with a home.</em>
        </h2>

        <p
          className="mt-6 text-base sm:text-lg leading-relaxed max-w-md"
          style={{ color: "#2C2218", opacity: 0.8 }}
        >
          We're building the UK's first marketplace for South Asian occasion wear.
          Be first to know when we launch.
        </p>

        {/* CTAs */}
        <div className="mt-10 w-full grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => openForm("buyer")}
            className="w-full rounded-full py-4 px-6 text-base font-medium tracking-wide transition-transform active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
            style={{
              backgroundColor: "#E8B4A0",
              color: "#2C2218",
              boxShadow: audience === "buyer" ? "0 0 0 2px #2C2218 inset" : undefined,
            }}
          >
            I want to buy
          </button>
          <button
            type="button"
            onClick={() => openForm("seller")}
            className="w-full rounded-full py-4 px-6 text-base font-medium tracking-wide transition-transform active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
            style={{
              backgroundColor: "#C9972B",
              color: "#FDF6EE",
              boxShadow: audience === "seller" ? "0 0 0 2px #2C2218 inset" : undefined,
            }}
          >
            I want to sell
          </button>
        </div>

        {/* Email capture */}
        <div ref={formRef} className="w-full mt-6 min-h-[1px]">
          {audience && status !== "done" && (
            <form
              onSubmit={handleSubmit}
              className="w-full flex flex-col gap-3 animate-in fade-in duration-300"
            >
              <label htmlFor="waitlist-email" className="sr-only">
                Email address
              </label>
              <input
                id="waitlist-email"
                type="email"
                required
                autoComplete="email"
                inputMode="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-full px-5 py-4 text-base focus:outline-none"
                style={{
                  backgroundColor: "#FFFFFF",
                  border: "1px solid rgba(44,34,24,0.2)",
                  color: "#2C2218",
                }}
              />
              <button
                type="submit"
                disabled={status === "submitting"}
                className="w-full rounded-full py-4 px-6 text-base font-medium tracking-wide transition-opacity disabled:opacity-60"
                style={{ backgroundColor: "#2C2218", color: "#FDF6EE" }}
              >
                {status === "submitting" ? "Joining…" : "Join the waitlist"}
              </button>
              {errorMsg && (
                <p className="text-sm text-center" style={{ color: "#8a2f1f" }}>
                  {errorMsg}
                </p>
              )}
              <p className="text-xs text-center" style={{ color: "#2C2218", opacity: 0.55 }}>
                Joining as {audience === "buyer" ? "a buyer" : "a seller"}.
              </p>
            </form>
          )}

          {status === "done" && audience && (
            <div
              className="w-full text-center px-2 py-6 animate-in fade-in duration-500"
              style={{ fontFamily: "Georgia, 'Playfair Display', serif" }}
            >
              <p className="text-xl sm:text-2xl leading-snug" style={{ color: "#2C2218" }}>
                {COPY[audience].success}
              </p>
              <div
                className="mx-auto mt-4 h-px w-12"
                style={{ backgroundColor: "#C9972B", opacity: 0.6 }}
              />
            </div>
          )}
        </div>
      </main>

      <footer className="w-full text-center pb-2">
        <p className="text-xs tracking-[0.2em] uppercase" style={{ color: "#2C2218", opacity: 0.6 }}>
          Launching soon in the UK 🇬🇧
        </p>
      </footer>
    </div>
  );
};

export default Waitlist;
