import { Heart, Search, Menu, X, MessageCircle, User, ShoppingBag, Home, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();

  // Fetch unread message count
  useEffect(() => {
    if (!user) {
      setUnreadCount(0);
      return;
    }
    let cancelled = false;
    const fetchUnread = async () => {
      const { count } = await supabase
        .from("messages")
        .select("*", { count: "exact", head: true })
        .eq("recipient_id", user.id)
        .eq("is_read", false);
      if (!cancelled) setUnreadCount(count ?? 0);
    };
    fetchUnread();

    const channel = supabase
      .channel("nav-unread-messages")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "messages", filter: `recipient_id=eq.${user.id}` },
        () => fetchUnread()
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Focus + Escape for search
  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSearchOpen(false);
    };
    if (searchOpen) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [searchOpen]);

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;
    navigate(`/browse?search=${encodeURIComponent(q)}`);
    setSearchOpen(false);
    setSearchQuery("");
  };

  const handleSaved = () => {
    if (!user) return navigate("/auth");
    navigate("/account#saved");
  };

  const handleMessages = () => {
    if (!user) return navigate("/auth");
    navigate("/messages");
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const initials =
    (profile?.full_name || profile?.username || user?.email || "?")
      .split(" ")
      .map((s) => s[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

  return (
    <>
      {/* Desktop navbar */}
      <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="font-display text-2xl font-bold text-primary tracking-tight">
            Dobaara
          </Link>

          <div className="hidden md:flex items-center gap-7">
            <Link to="/browse" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Browse
            </Link>
            <Link to="/how-it-works" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              How It Works
            </Link>
            <Link to="/dobaara-verified" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Dobaara Verified
            </Link>
            <Link to="/size-guide" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Size Guide
            </Link>
            <Link to="/contact" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Contact
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Button variant="ghost" size="icon" className="text-muted-foreground" onClick={() => setSearchOpen(true)} aria-label="Search">
              <Search className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-muted-foreground" onClick={handleSaved} aria-label="Saved">
              <Heart className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="relative text-muted-foreground" onClick={handleMessages} aria-label="Messages">
              <MessageCircle className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold text-destructive-foreground">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Button>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-muted-foreground" aria-label="Account">
                    <Avatar className="h-7 w-7">
                      {profile?.avatar_url && <AvatarImage src={profile.avatar_url} alt={profile?.username || ""} />}
                      <AvatarFallback className="text-xs bg-primary/10 text-primary">{initials}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => navigate("/account")}>My Account</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/account#listings")}>My Listings</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/sell")}>Sell an item</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>Sign out</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="ghost" size="icon" className="text-muted-foreground" onClick={() => navigate("/auth")} aria-label="Sign in">
                <User className="h-5 w-5" />
              </Button>
            )}

            <Link to="/sell">
              <Button variant="pill" size="sm">Start Selling</Button>
            </Link>
          </div>

          <div className="flex md:hidden items-center gap-2">
            <Button variant="ghost" size="icon" className="text-muted-foreground" onClick={() => setSearchOpen(true)}>
              <Search className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-muted-foreground" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Search overlay */}
        {searchOpen && (
          <div className="absolute inset-x-0 top-0 z-50 border-b border-border bg-background animate-fade-in">
            <form onSubmit={submitSearch} className="container flex h-16 items-center gap-3">
              <Search className="h-5 w-5 text-muted-foreground" />
              <Input
                ref={searchInputRef}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search lehengas, sarees, designers..."
                className="flex-1 border-0 shadow-none focus-visible:ring-0 text-base"
              />
              <Button type="button" variant="ghost" size="icon" onClick={() => setSearchOpen(false)} aria-label="Close search">
                <X className="h-5 w-5" />
              </Button>
            </form>
          </div>
        )}

        {mobileOpen && (
          <div className="md:hidden border-t border-border bg-background px-4 pb-4 pt-2 animate-fade-in">
            <div className="flex flex-col gap-3">
              <Link to="/browse" className="text-sm font-medium py-2" onClick={() => setMobileOpen(false)}>Browse</Link>
              <Link to="/how-it-works" className="text-sm font-medium py-2" onClick={() => setMobileOpen(false)}>How It Works</Link>
              <Link to="/dobaara-verified" className="text-sm font-medium py-2" onClick={() => setMobileOpen(false)}>Dobaara Verified</Link>
              <Link to="/size-guide" className="text-sm font-medium py-2" onClick={() => setMobileOpen(false)}>Size Guide</Link>
              <Link to="/selling-guide" className="text-sm font-medium py-2" onClick={() => setMobileOpen(false)}>Selling Guide</Link>
              <Link to="/faq" className="text-sm font-medium py-2" onClick={() => setMobileOpen(false)}>FAQ</Link>
              <Link to="/contact" className="text-sm font-medium py-2" onClick={() => setMobileOpen(false)}>Contact</Link>
              {user ? (
                <button onClick={() => { setMobileOpen(false); handleSignOut(); }} className="text-sm font-medium py-2 text-left">
                  Sign out
                </button>
              ) : (
                <Link to="/auth" className="text-sm font-medium py-2" onClick={() => setMobileOpen(false)}>Sign in</Link>
              )}
              <Link to="/sell" onClick={() => setMobileOpen(false)}>
                <Button variant="pill" className="w-full">Start Selling</Button>
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Mobile bottom tab bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background md:hidden">
        <div className="flex items-center justify-around py-2">
          {[
            { to: "/", icon: Home, label: "Home" },
            { to: "/browse", icon: ShoppingBag, label: "Browse" },
            { to: "/sell", icon: Tag, label: "Sell" },
            { to: "/messages", icon: MessageCircle, label: "Messages", badge: unreadCount },
            { to: "/account", icon: User, label: "Account" },
          ].map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`relative flex flex-col items-center gap-0.5 px-3 py-1 text-xs transition-colors ${
                location.pathname === item.to ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <item.icon className="h-5 w-5" />
              {"badge" in item && item.badge && item.badge > 0 ? (
                <span className="absolute top-0 right-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold text-destructive-foreground">
                  {item.badge > 9 ? "9+" : item.badge}
                </span>
              ) : null}
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
};

export default Navbar;
