import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase, sendEmail } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

function welcomeEmailHtml(firstName: string) {
  return `
  <div style="font-family:Georgia,'Times New Roman',serif;background:#FAF7F0;padding:40px 16px">
    <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #E4DACB;border-radius:12px;overflow:hidden">

      <div style="padding:36px 32px 28px;text-align:center;border-bottom:1px solid #EFE7DA">
        <img src="https://www.dobaara.co/assets/dobaara-logo-email.png"
             alt="Dobaara" width="180"
             style="display:block;margin:0 auto;max-width:180px;height:auto" />
        <p style="margin:14px 0 0;color:#8B5E3C;font-size:12px;letter-spacing:0.14em;text-transform:uppercase">
          South Asian fashion, reimagined
        </p>
      </div>

      <div style="padding:36px 32px;text-align:center;color:#1A1A1A">
        <h1 style="margin:0 0 14px;font-family:Georgia,serif;font-size:26px;font-weight:400;color:#8B5E3C">
          Welcome to Dobaara, ${firstName}
        </h1>
        <p style="margin:0 0 28px;font-family:'DM Sans',Helvetica,Arial,sans-serif;font-size:15px;line-height:1.7;color:#4A4A4A">
          You have joined a community giving beautiful outfits a second life.
          Browse what is listed, or put your own pieces up for sale.
        </p>

        <a href="https://www.dobaara.co/browse"
           style="display:inline-block;background:#8B5E3C;color:#ffffff;text-decoration:none;
                  padding:13px 26px;border-radius:8px;font-family:'DM Sans',Helvetica,Arial,sans-serif;
                  font-size:14px;font-weight:600;margin:0 4px 10px">
          Browse listings
        </a>
        <a href="https://www.dobaara.co/sell"
           style="display:inline-block;background:#ffffff;color:#8B5E3C;text-decoration:none;
                  border:1px solid #C9A84C;padding:12px 26px;border-radius:8px;
                  font-family:'DM Sans',Helvetica,Arial,sans-serif;font-size:14px;font-weight:600;margin:0 4px 10px">
          List your first item
        </a>
      </div>

      <div style="background:#FAF7F0;padding:18px 32px;text-align:center;border-top:1px solid #EFE7DA;
                  font-family:'DM Sans',Helvetica,Arial,sans-serif;font-size:12px;color:#8A8A8A">
        © 2026 Dobaara ·
        <a href="https://www.dobaara.co" style="color:#8B5E3C;text-decoration:none">dobaara.co</a>
      </div>

    </div>
  </div>`;
}

type Status = "loading" | "session" | "needs_login" | "error";

const DiamondDivider = () => (
  <div className="flex items-center justify-center gap-3 my-8">
    <span className="h-px w-16 bg-[#C9A84C]/40" />
    <span className="block h-2 w-2 rotate-45 bg-[#C9A84C]" />
    <span className="h-px w-16 bg-[#C9A84C]/40" />
  </div>
);

const AuthConfirm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [status, setStatus] = useState<Status>("loading");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      try {
        const hash = window.location.hash.startsWith("#")
          ? window.location.hash.slice(1)
          : "";
        const hashParams = new URLSearchParams(hash);
        const queryParams = new URLSearchParams(window.location.search);

        const errorDescription =
          hashParams.get("error_description") || queryParams.get("error_description");
        if (errorDescription) {
          if (!cancelled) {
            setErrorMsg(errorDescription);
            setStatus("error");
          }
          return;
        }

        // Handle PKCE/OTP style: ?token_hash=...&type=...
        const token_hash = queryParams.get("token_hash");
        const type = queryParams.get("type");
        if (token_hash && type) {
          const { error } = await supabase.auth.verifyOtp({
            token_hash,
            type: type as "signup" | "email" | "recovery" | "invite" | "magiclink",
          });
          if (error) throw error;
        }

        // Hash style (#access_token=...) is auto-consumed by supabase-js; just read session
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;

        if (cancelled) return;

        if (data.session) {
          setEmail(data.session.user.email ?? "");
          // Send welcome email only on the actual confirmation page load (token_hash present)
          if (token_hash) {
            const firstName = (data.session.user.user_metadata?.first_name as string | undefined) ?? "there";
            sendEmail({
              to: data.session.user.email ?? "",
              subject: "Welcome to Dobaara",
              html: welcomeEmailHtml(firstName),
            });
          }
          setStatus("session");
        } else {
          // No session established — most likely user clicked confirmation link in a different browser
          setStatus("needs_login");
        }
      } catch (err) {
        if (cancelled) return;
        setErrorMsg(err instanceof Error ? err.message : "Verification failed");
        setStatus("error");
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (user && status === "needs_login") {
      setEmail(user.email ?? "");
      setStatus("session");
    }
  }, [user, status]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setSubmitting(false);
    if (error) {
      toast({ title: "Sign in failed", description: error.message, variant: "destructive" });
      return;
    }
    setStatus("session");
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#FAF7F2] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        {status === "loading" && (
          <div className="text-center">
            <div className="mx-auto h-10 w-10 animate-pulse rounded-full bg-[#C9A84C]/30" />
            <p className="mt-4 text-sm text-[#8B5E3C]/70">Confirming your email…</p>
          </div>
        )}

        {status === "error" && (
          <div className="text-center">
            <h1 className="font-display text-3xl text-[#8B5E3C] mb-3">Verification failed</h1>
            <p className="text-sm text-[#5a3e2b] mb-6">
              {errorMsg || "The confirmation link is invalid or has expired."}
            </p>
            <Link to="/auth">
              <Button className="bg-[#8B5E3C] hover:bg-[#754c2e] text-white">
                Back to sign in
              </Button>
            </Link>
          </div>
        )}

        {(status === "session" || status === "needs_login") && (
          <div className="text-center">
            {/* Sketch-style check */}
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border-2 border-[#7A9B6E]/60 bg-[#7A9B6E]/10">
              <Check className="h-10 w-10 text-[#7A9B6E]" strokeWidth={1.75} />
            </div>

            <h1 className="font-display text-4xl text-[#8B5E3C]">Email confirmed!</h1>
            <p className="mt-3 text-[#5a3e2b] font-body">
              Welcome to Dobaara. Your account is ready.
            </p>

            <DiamondDivider />

            {status === "session" ? (
              <div className="space-y-3">
                <p className="font-display italic text-lg text-[#8B5E3C]">You're signed in!</p>
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <Button
                    className="flex-1 bg-[#8B5E3C] hover:bg-[#754c2e] text-white"
                    onClick={() => navigate("/browse")}
                  >
                    Browse listings
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 border-[#C9A84C] text-[#8B5E3C] hover:bg-[#C9A84C]/10"
                    onClick={() => navigate("/sell")}
                  >
                    Start selling
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSignIn} className="space-y-4 text-left">
                <div>
                  <Label htmlFor="email" className="text-[#8B5E3C] text-xs uppercase tracking-wider">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="mt-1 bg-white border-[#C9A84C]/30 focus-visible:ring-[#8B5E3C]"
                  />
                </div>
                <div>
                  <Label htmlFor="password" className="text-[#8B5E3C] text-xs uppercase tracking-wider">
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="mt-1 bg-white border-[#C9A84C]/30 focus-visible:ring-[#8B5E3C]"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-[#8B5E3C] hover:bg-[#754c2e] text-white"
                >
                  {submitting ? "Signing in…" : "Sign in to Dobaara"}
                </Button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthConfirm;
