import { useState } from "react";
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
import { SketchVerifiedIcon } from "@/components/CategoryIcons";

const SUBJECTS = [
  "General enquiry",
  "Buying",
  "Selling",
  "Dobaara Verified",
  "Press",
  "Other",
] as const;

const contactSchema = z.object({
  name: z.string().trim().nonempty("Name is required").max(100),
  email: z.string().trim().email("Invalid email").max(255),
  subject: z.enum(SUBJECTS, { errorMap: () => ({ message: "Please choose a subject" }) }),
  message: z.string().trim().nonempty("Message is required").max(2000),
});

function contactNotificationHtml(data: {
  name: string;
  email: string;
  subject: string;
  message: string;
}) {
  const timestamp = new Date().toLocaleString("en-GB", { timeZone: "Europe/London" });
  return `
    <div style="font-family:sans-serif;background:#FAF7F2;padding:32px">
      <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e8ddd0">
        <div style="background:#8B5E3C;padding:24px 32px">
          <h1 style="margin:0;color:#fff;font-size:22px;letter-spacing:0.08em">DOBAARA</h1>
          <p style="margin:4px 0 0;color:#f5e6d3;font-size:13px">New contact form submission</p>
        </div>
        <div style="padding:28px 32px;color:#3d2b1f">
          <table style="width:100%;border-collapse:collapse;font-size:14px">
            <tr><td style="padding:8px 0;color:#8B5E3C;font-weight:600;width:120px">Name</td><td style="padding:8px 0">${data.name}</td></tr>
            <tr><td style="padding:8px 0;color:#8B5E3C;font-weight:600">Email</td><td style="padding:8px 0"><a href="mailto:${data.email}" style="color:#8B5E3C">${data.email}</a></td></tr>
            <tr><td style="padding:8px 0;color:#8B5E3C;font-weight:600">Subject</td><td style="padding:8px 0">${data.subject}</td></tr>
            <tr><td style="padding:8px 0;color:#8B5E3C;font-weight:600;vertical-align:top">Message</td><td style="padding:8px 0;white-space:pre-wrap">${data.message}</td></tr>
            <tr><td style="padding:8px 0;color:#8B5E3C;font-weight:600">Submitted</td><td style="padding:8px 0;color:#888">${timestamp}</td></tr>
          </table>
        </div>
        <div style="background:#f9f4ef;padding:16px 32px;font-size:12px;color:#999;border-top:1px solid #e8ddd0">
          Dobaara · dobaara.co
        </div>
      </div>
    </div>
  `;
}

const Contact = () => {
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "" as (typeof SUBJECTS)[number] | "",
    message: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    const parsed = contactSchema.safeParse(form);
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

    const { error } = await supabase.from("contact_submissions").insert({
      name: parsed.data.name,
      email: parsed.data.email,
      subject: parsed.data.subject,
      message: parsed.data.message,
    });

    setSubmitting(false);

    if (error) {
      toast({
        title: "Could not send",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    // Fire-and-forget notification email — don't block the success state
    const notificationEmail = import.meta.env.VITE_RESEND_NOTIFICATION_EMAIL ?? "info@dobaara.co";
    sendEmail({
      to: notificationEmail,
      subject: "New Dobaara contact form submission",
      html: contactNotificationHtml(parsed.data),
    });

    setSuccess(true);
    setForm({ name: "", email: "", subject: "", message: "" });
  }

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      <section className="container py-14 md:py-20 text-center">
        <p className="font-mono text-xs tracking-[0.2em] text-gold uppercase mb-4">Contact</p>
        <h1 className="font-display text-4xl md:text-5xl font-bold text-primary tracking-tight">
          Get in <span className="italic text-gradient-gold">touch.</span>
        </h1>
        <p className="mt-4 text-base md:text-lg text-muted-foreground">
          We'd love to hear from you.
        </p>
      </section>

      <section className="container pb-20">
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 max-w-5xl mx-auto">
          {/* Left: details */}
          <div className="rounded-2xl border border-gold/20 bg-[hsl(var(--gold-light))]/40 p-6 md:p-8">
            <h2 className="font-display text-xl md:text-2xl font-semibold text-primary mb-5">
              Reach us directly
            </h2>
            <div className="space-y-4 text-sm">
              <div>
                <p className="font-mono text-xs tracking-[0.18em] uppercase text-gold mb-1">Email</p>
                <a
                  href="mailto:info@dobaara.co"
                  className="text-foreground hover:text-primary transition-colors"
                >
                  info@dobaara.co
                </a>
              </div>
              <div>
                <p className="font-mono text-xs tracking-[0.18em] uppercase text-gold mb-1">Instagram</p>
                <a
                  href="https://www.instagram.com/dobaara.co"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-foreground hover:text-primary transition-colors"
                >
                  @dobaara.co
                </a>
              </div>
              <div>
                <p className="font-mono text-xs tracking-[0.18em] uppercase text-gold mb-1">TikTok</p>
                <a
                  href="https://www.tiktok.com/@dobaara.co"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-foreground hover:text-primary transition-colors"
                >
                  @dobaara.co
                </a>
              </div>
            </div>
            <div className="mt-6 pt-6 border-t border-gold/20 space-y-2 text-sm text-muted-foreground">
              <p>We aim to respond within 24 hours.</p>
              <p>
                For order issues, please include your order number in your message.
              </p>
            </div>
          </div>

          {/* Right: form */}
          <div className="rounded-2xl border border-border bg-card p-6 md:p-8 shadow-sm">
            {success ? (
              <div className="text-center py-10">
                <div className="mx-auto h-14 w-14 rounded-full bg-[hsl(var(--gold-light))] flex items-center justify-center mb-4">
                  <SketchVerifiedIcon className="h-7 w-7 text-gold" />
                </div>
                <p className="font-display text-xl font-semibold text-primary">
                  Thank you for your message.
                </p>
                <p className="text-sm text-muted-foreground mt-2 max-w-sm mx-auto">
                  We'll be in touch within 24 hours.
                </p>
                <Button
                  variant="outline"
                  className="mt-6"
                  onClick={() => setSuccess(false)}
                >
                  Send another
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    required
                    maxLength={100}
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    maxLength={255}
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Select
                    value={form.subject}
                    onValueChange={(v) =>
                      setForm({ ...form, subject: v as (typeof SUBJECTS)[number] })
                    }
                  >
                    <SelectTrigger id="subject">
                      <SelectValue placeholder="Choose a subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {SUBJECTS.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    rows={6}
                    required
                    maxLength={2000}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                  />
                </div>
                <Button type="submit" variant="hero" size="lg" className="w-full font-bold" disabled={submitting}>
                  {submitting ? "Sending…" : "Send message"}
                </Button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
