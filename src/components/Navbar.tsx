import { Heart, Search, Menu, X, MessageCircle, User, ShoppingBag, Home, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";
import { useState } from "react";

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  return (
    <>
      {/* Desktop navbar */}
      <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="font-display text-2xl font-bold text-primary tracking-tight">
            Dobaara
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link to="/browse" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Browse
            </Link>
            <Link to="/how-it-works" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              How It Works
            </Link>
            <Link to="/dobaara-verified" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Dobaara Verified
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Button variant="ghost" size="icon" className="text-muted-foreground">
              <Search className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-muted-foreground">
              <Heart className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-muted-foreground">
              <MessageCircle className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-muted-foreground">
              <User className="h-5 w-5" />
            </Button>
            <Link to="/sell">
              <Button variant="pill" size="sm">Start Selling</Button>
            </Link>
          </div>

          <div className="flex md:hidden items-center gap-2">
            <Button variant="ghost" size="icon" className="text-muted-foreground">
              <Search className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-muted-foreground" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {mobileOpen && (
          <div className="md:hidden border-t border-border bg-background px-4 pb-4 pt-2 animate-fade-in">
            <div className="flex flex-col gap-3">
              <Link to="/browse" className="text-sm font-medium py-2" onClick={() => setMobileOpen(false)}>Browse</Link>
              <Link to="/how-it-works" className="text-sm font-medium py-2" onClick={() => setMobileOpen(false)}>How It Works</Link>
              <Link to="/dobaara-verified" className="text-sm font-medium py-2" onClick={() => setMobileOpen(false)}>Dobaara Verified</Link>
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
            { to: "/messages", icon: MessageCircle, label: "Messages" },
            { to: "/account", icon: User, label: "Account" },
          ].map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 text-xs transition-colors ${
                location.pathname === item.to ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
};

export default Navbar;
