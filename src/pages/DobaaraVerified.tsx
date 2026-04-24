import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase, sendEmail } from "@/lib/supabase";
import verifiedBanner from "@/assets/dobaara-verified-banner.jpeg";
import { SketchSparkle, SketchArrowRight, SketchVerifiedIcon } from "@/components/CategoryIcons";

const ITEM_TYPES = ["Lehenga", "Saree", "Salwar Kameez", "Sherwani", "Anarkali", "Other"] as const;

const submissionSchema = z.object({
  full_name: z.string().trim().nonempty("Name is required").max(100),
  email: z.string().trim().email("Invalid email").max(255),
  item_type: z.enum(ITEM_TYPES, { errorMap: () => ({ message: "Please choose an item type" }) }),
  designer_brand: z.string().trim().max(100).optional(),
  estimated_value: z
    .number({ invalid_type_error: "Estimated value must be a number" })
    .min(80, "Minimum item value is £80")
    .max(50000, "Please contact us directly for items above £50,000"),
  description: z.string().trim().max(1000).optional(),
});

const steps = [
  {
    n: "1",
    title: "Submit",
    body: "Tell us about your item and upload a few photos. We'll confirm it's eligible within 48 hours.",
  },
  {
    n: "2",
    title: "Send",
    body: "We provide a pre-paid shipping label. Drop it at any Post Office or collection point.",
  },
  {
    n: "3",
    title: "We handle everything",
    body: "Professional photography, authentication, listing, packaging, and dispatch. You receive 75% of the sale price.",
  },
];

function vipNotificationHtml(data: {
  full_name: string;
  email: string;
  item_type: string;
  designer_brand?: string;
  estimated_value: number;
  description?: string;
}) {
  const valueGbp = `£${data.estimated_value.toLocaleString("en-GB")}`;
  return `
    <div style="font-family:sans-serif;background:#FAF7F2;padding:32px">
      <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e8ddd0">
        <div style="background:#8B5E3C;padding:24px 32px">
          <h1 style="margin:0;color:#fff;font-size:22px;letter-spacing:0.08em">DOBAARA</h1>
          <p style="margin:4px 0 0;color:#f5e6d3;font-size:13px">New Dobaara Verified submission</p>
        </div>
        <div style="padding:28px 32px;color:#3d2b1f">
          <table style="width:100%;border-collapse:collapse;font-size:14px">
            <tr><td style="padding:8px 0;color:#8B5E3C;font-weight:600;width:140px">Full name</td><td style="padding:8px 0">${data.full_name}</td></tr>
            <tr><td style="padding:8px 0;color:#8B5E3C;font-weight:600">Email</td><td style="padding:8px 0"><a href="mailto:${data.email}" style="color:#8B5E3C">${data.email}</a></td></tr>
            <tr><td style="padding:8px 0;color:#8B5E3C;font-weight:600">Item type</td><td style="padding:8px 0">${data.item_type}</td></tr>
            <tr><td style="padding:8px 0;color:#8B5E3C;font-weight:600">Designer / brand</td><td style="padding:8px 0">${data.designer_brand ?? "—"}</td></tr>
            <tr><td style="padding:8px 0;color:#8B5E3C;font-weight:600">Estimated value</td><td style="padding:8px 0;font-weight:600">${valueGbp}</td></tr>
            <tr><td style="padding:8px 0;color:#8B5E3C;font-weight:600;vertical-align:top">Description</td><td style="padding:8px 0;white-space:pre-wrap">${data.description ?? "—"}</td></tr>
          </table>
        </div>
        <div style="background:#f9f4ef;padding:16px 32px;font-size:12px;color:#999;border-top:1px solid #e8ddd0">
          Dobaara · dobaara.co
        </div>
      </div>
    </div>
  `;
}

const DobaaraVerified = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const formRef = useRef<HTMLDivElement>(null);

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [photos, setPhotos] = useState<File[]>([]);
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    item_type: "" as (typeof ITEM_TYPES)[number] | "",
    designer_brand: "",
    estimated_value: "",
    description: "",
  });

  function scrollToForm() {
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []).slice(0, 5);
    setPhotos(files);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    const parsed = submissionSchema.safeParse({
      full_name: form.full_name,
      email: form.email,
      item_type: form.item_type,
      designer_brand: form.designer_brand || undefined,
      estimated_value: form.estimated_value === "" ? NaN : Number(form.estimated_value),
      description: form.description || undefined,
    });

    if (!parsed.success) {
      const first = parsed.error.issues[0];
      toast({
        title: "Please check the form",
        description: first?.message ?? "Some fields are invalid.",
        variant: "destructive",
      });
      setSubmitting(false);
      return;
    }

    // Optional photo upload to Supabase storage (best-effort)
    const photoUrls: string[] = [];
    for (const file of photos) {
      const path = `vip-submissions/${crypto.randomUUID()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from("listing-images")
        .upload(path, file, { upsert: false });
      if (!uploadError) {
        const { data } = supabase.storage.from("listing-images").getPublicUrl(path);
        photoUrls.push(data.publicUrl);
      }
    }

    const { error } = await supabase.from("vip_submissions").insert({
      full_name: parsed.data.full_name,
      email: parsed.data.email,
      item_type: parsed.data.item_type,
      designer_brand: parsed.data.designer_brand ?? null,
      estimated_value: Math.round(parsed.data.estimated_value * 100), // store in pence
      description: parsed.data.description ?? null,
      photo_urls: photoUrls,
    });

    setSubmitting(false);

    if (error) {
      toast({
        title: "Could not submit",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    const notificationEmail = import.meta.env.VITE_RESEND_NOTIFICATION_EMAIL ?? "info@dobaara.co";
    sendEmail({
      to: notificationEmail,
      subject: `New Dobaara Verified submission — ${parsed.data.item_type}`,
      html: vipNotificationHtml(parsed.data),
    });

    setSuccess(true);
    setForm({
      full_name: "",
      email: "",
      item_type: "",
      designer_brand: "",
      estimated_value: "",
      description: "",
    });
    setPhotos([]);
  }

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="container py-14 md:py-20">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-gold/15 px-3 py-1 text-xs font-mono tracking-[0.18em] text-gold uppercase mb-5">
                <SketchSparkle className="h-3.5 w-3.5" /> Concierge Service
              </div>
              <h1 className="font-display text-4xl md:text-5xl font-bold text-primary tracking-tight">
                Dobaara <span className="italic text-gradient-gold">Verified.</span>
              </h1>
              <p className="mt-3 text-lg md:text-xl text-foreground/85 font-display italic">
                Let us do everything for you.
              </p>
              <p className="mt-4 text-base text-muted-foreground leading-relaxed max-w-md">
                Send us your item. We authenticate, professionally photograph, list,
                and ship it. You sit back and get paid.
              </p>
              <div className="mt-6">
                <Button variant="gold" size="lg" className="font-bold" onClick={scrollToForm}>
                  <SketchSparkle className="h-4 w-4" /> Submit an Item
                  <SketchArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="relative rounded-2xl overflow-hidden border border-gold/30 shadow-sm">
              <img
                src={verifiedBanner}
                alt="Dobaara Verified — we photograph, verify and ship"
                className="block w-full h-auto"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-y border-border bg-card py-14 md:py-16">
        <div className="container">
          <h2 className="font-display text-2xl md:text-3xl font-semibold text-primary text-center mb-10">
            How it works
          </h2>
          <div className="grid md:grid-cols-3 gap-5 md:gap-6 max-w-4xl mx-auto">
            {steps.map((s) => (
              <div
                key={s.n}
                className="rounded-2xl border border-gold/20 bg-background p-6 text-center shadow-sm"
              >
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-gold text-accent-foreground font-bold mb-4">
                  {s.n}
                </div>
                <h3 className="font-display text-lg font-semibold text-primary">{s.title}</h3>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What we accept + Pricing */}
      <section className="container py-14 md:py-16">
        <div className="grid md:grid-cols-2 gap-6 md:gap-8 max-w-4xl mx-auto">
          <div className="rounded-2xl border border-border bg-secondary/40 p-6 md:p-7">
            <h3 className="font-display text-xl font-semibold text-primary mb-4">
              What we accept
            </h3>
            <ul className="space-y-2.5 text-sm text-foreground/85">
              {[
                "Minimum item value £80",
                "All categories: lehengas, sarees, salwar kameez, sherwanis, anarkalis",
                "Condition: Very Good or Excellent only",
                "Designer and non-designer both welcome",
              ].map((line) => (
                <li key={line} className="flex gap-2">
                  <SketchVerifiedIcon className="h-4 w-4 text-gold mt-0.5 shrink-0" />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-gold/30 bg-[hsl(var(--gold-light))]/60 p-6 md:p-7">
            <h3 className="font-display text-xl font-semibold text-primary mb-4">Pricing</h3>
            <p className="font-display text-2xl md:text-3xl font-bold text-primary">
              We charge 25% commission.
            </p>
            <p className="font-display italic text-lg text-gradient-gold mt-1">
              You keep 75%.
            </p>
            <div className="mt-4 rounded-xl bg-background/80 border border-gold/20 px-4 py-3">
              <p className="text-xs font-mono uppercase tracking-[0.18em] text-muted-foreground">
                Example
              </p>
              <p className="text-sm mt-1">
                A <span className="font-semibold">£400 lehenga</span> →{" "}
                <span className="font-semibold text-primary">you receive £300</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Submission form */}
      <section ref={formRef} className="container py-14 md:py-16">
        <div className="max-w-2xl mx-auto rounded-2xl border border-border bg-card p-6 md:p-8 shadow-sm">
          <h2 className="font-display text-2xl md:text-3xl font-semibold text-primary text-center mb-2">
            Submit your item
          </h2>
          <p className="text-center text-muted-foreground mb-8">
            Takes 2 minutes. We respond within 48 hours.
          </p>

          {success ? (
            <div className="text-center py-10">
              <div className="mx-auto h-14 w-14 rounded-full bg-[hsl(var(--gold-light))] flex items-center justify-center mb-4">
                <SketchVerifiedIcon className="h-7 w-7 text-gold" />
              </div>
              <p className="font-display text-xl font-semibold text-primary">Thank you!</p>
              <p className="text-sm text-muted-foreground mt-2 max-w-sm mx-auto">
                We'll review your submission and be in touch within 48 hours.
              </p>
              <div className="mt-6 flex gap-3 justify-center">
                <Button variant="outline" onClick={() => setSuccess(false)}>
                  Submit another
                </Button>
                <Button variant="hero" onClick={() => navigate("/")}>
                  Back home
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="full_name">Full name</Label>
                  <Input
                    id="full_name"
                    required
                    maxLength={100}
                    value={form.full_name}
                    onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email address</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    maxLength={255}
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="item_type">Item type</Label>
                  <Select
                    value={form.item_type}
                    onValueChange={(v) =>
                      setForm({ ...form, item_type: v as (typeof ITEM_TYPES)[number] })
                    }
                  >
                    <SelectTrigger id="item_type">
                      <SelectValue placeholder="Select item type" />
                    </SelectTrigger>
                    <SelectContent>
                      {ITEM_TYPES.map((t) => (
                        <SelectItem key={t} value={t}>
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="designer_brand">Designer / brand</Label>
                  <Input
                    id="designer_brand"
                    placeholder="e.g. Sabyasachi (optional)"
                    maxLength={100}
                    value={form.designer_brand}
                    onChange={(e) => setForm({ ...form, designer_brand: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="estimated_value">Estimated value (£)</Label>
                <Input
                  id="estimated_value"
                  type="number"
                  min={80}
                  step={1}
                  required
                  value={form.estimated_value}
                  onChange={(e) => setForm({ ...form, estimated_value: e.target.value })}
                />
                <p className="text-xs text-muted-foreground mt-1">Minimum £80.</p>
              </div>

              <div>
                <Label htmlFor="description">Brief description</Label>
                <Textarea
                  id="description"
                  rows={4}
                  maxLength={1000}
                  placeholder="Fabric, occasion worn, any flaws…"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="photos">Upload up to 5 photos</Label>
                <Input
                  id="photos"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handlePhotoChange}
                />
                {photos.length > 0 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {photos.length} photo{photos.length === 1 ? "" : "s"} selected
                  </p>
                )}
              </div>

              <Button type="submit" variant="gold" size="lg" className="w-full font-bold" disabled={submitting}>
                {submitting ? "Submitting…" : "Submit for review"}
              </Button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
};

export default DobaaraVerified;
