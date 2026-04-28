import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

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
