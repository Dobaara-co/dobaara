import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import heroBg from "@/assets/hero-bg.jpg";

type Audience = "buyer" | "seller";

const COPY: Record<Audience, { success: string }> = {
  buyer: { success: "You're on the list. We'll be in touch soon." },
  seller: {
    success:
      "You're on the list. We'll reach out with everything you need to start selling.",
  },
};

const Waitlist = () => {
  const [audience, setAudience] = useState<Audience | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "done" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const formRef = useRef<HTMLDivElement>(null);

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
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedFirst = firstName.trim();
    const trimmedLast = lastName.trim();
    if (!trimmedFirst || trimmedFirst.length > 100) {
      setErrorMsg("Please enter a valid first name.");
      return;
    }
    if (!trimmedLast || trimmedLast.length > 100) {
      setErrorMsg("Please enter a valid last name.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail) || trimmedEmail.length > 255) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }
    setStatus("submitting");
    setErrorMsg("");
    const { error } = await supabase
      .from("waitlist" as never)
      .insert({
        email: trimmedEmail,
        type: audience,
        first_name: trimmedFirst,
        last_name: trimmedLast,
        name: `${trimmedFirst} ${trimmedLast}`,
      } as never);
    if (error) {
      setStatus("error");
      setErrorMsg("Something went wrong. Please try again.");
      return;
    }
    setStatus("done");
  };

  return (
    <div className="min-h-screen bg-background">
      <section className="relative overflow-hidden min-h-screen flex items-center">
        <div className="absolute inset-0">
          <img
            src={heroBg}
            alt=""
            className="h-full w-full object-cover"
            width={1920}
            height={1080}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/80 to-background/40" />
        </div>

        <div className="container relative py-16 md:py-24">
          {/* Wordmark */}
          <div className="text-center mb-10">
            <h1 className="font-display text-2xl sm:text-3xl tracking-[0.35em] uppercase text-primary">
              Dobaara
            </h1>
            <div className="mx-auto mt-3 h-px w-16 bg-gold/60" />
          </div>

          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-4xl md:text-6xl font-bold leading-tight tracking-tight text-primary font-display">
              Pre-loved South Asian fashion,{" "}
              <span className="text-gradient-gold italic">finally with a home.</span>
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-lg mx-auto">
              We're building the UK's first marketplace for South Asian occasion wear.
              Be first to know when we launch.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button
                variant="hero"
                size="lg"
                className={`font-bold ${audience === "buyer" ? "ring-2 ring-primary ring-offset-2" : ""}`}
                onClick={() => openForm("buyer")}
              >
                I want to buy
              </Button>
              <Button
                variant="heroOutline"
                size="lg"
                className={`font-bold ${audience === "seller" ? "ring-2 ring-primary ring-offset-2" : ""}`}
                onClick={() => openForm("seller")}
              >
                I want to sell
              </Button>
            </div>

            <div ref={formRef} className="w-full mt-8 max-w-md mx-auto">
              {audience && status !== "done" && (
                <form
                  onSubmit={handleSubmit}
                  className="w-full flex flex-col gap-3 animate-in fade-in duration-300"
                >
                  <label htmlFor="waitlist-first-name" className="sr-only">
                    First name
                  </label>
                  <input
                    id="waitlist-first-name"
                    type="text"
                    required
                    autoComplete="given-name"
                    placeholder="First name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full rounded-md px-5 py-4 text-base bg-card/90 backdrop-blur border border-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                  <label htmlFor="waitlist-last-name" className="sr-only">
                    Last name
                  </label>
                  <input
                    id="waitlist-last-name"
                    type="text"
                    required
                    autoComplete="family-name"
                    placeholder="Last name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full rounded-md px-5 py-4 text-base bg-card/90 backdrop-blur border border-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
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
                    className="w-full rounded-md px-5 py-4 text-base bg-card/90 backdrop-blur border border-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                  <Button
                    type="submit"
                    variant="hero"
                    size="lg"
                    disabled={status === "submitting"}
                    className="w-full font-bold"
                  >
                    {status === "submitting" ? "Joining…" : "Join the waitlist"}
                  </Button>
                  {errorMsg && (
                    <p className="text-sm text-center text-destructive">{errorMsg}</p>
                  )}
                  <p className="text-xs text-center text-muted-foreground">
                    Joining as {audience === "buyer" ? "a buyer" : "a seller"}.
                  </p>
                </form>
              )}

              {status === "done" && audience && (
                <div className="w-full text-center px-2 py-6 animate-in fade-in duration-500">
                  <p className="font-display text-xl sm:text-2xl leading-snug text-primary">
                    {COPY[audience].success}
                  </p>
                  <div className="mx-auto mt-4 h-px w-12 bg-gold/60" />
                </div>
              )}
            </div>

            <p className="mt-10 text-xs tracking-[0.2em] uppercase text-muted-foreground">
              Launching soon in the UK 🇬🇧
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Waitlist;
