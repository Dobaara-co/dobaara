import { Link } from "react-router-dom";
import { Instagram } from "lucide-react";

const Footer = () => (
  <footer className="border-t border-border bg-card mt-16 pb-20 md:pb-0">
    <div className="container py-12">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        <div className="col-span-2 md:col-span-1">
          <Link to="/" className="font-display text-2xl font-bold text-primary">Dobaara</Link>
          <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
            The marketplace for pre-loved South Asian fashion in the UK. Give your clothes a second life.
          </p>
          <div className="flex gap-3 mt-4">
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors"><Instagram className="h-5 w-5" /></a>
          </div>
        </div>

        <div>
          <h4 className="font-body font-semibold text-sm mb-3">Explore</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/browse" className="hover:text-foreground transition-colors">Browse</Link></li>
            <li><Link to="/how-it-works" className="hover:text-foreground transition-colors">How It Works</Link></li>
            <li><Link to="/dobaara-verified" className="hover:text-foreground transition-colors">Dobaara Verified</Link></li>
            <li><Link to="/sell" className="hover:text-foreground transition-colors">Start Selling</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-body font-semibold text-sm mb-3">Help</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/selling-guide" className="hover:text-foreground transition-colors">Selling Guide</Link></li>
            <li><Link to="/size-guide" className="hover:text-foreground transition-colors">Size Guide</Link></li>
            <li><Link to="/faq" className="hover:text-foreground transition-colors">FAQ</Link></li>
            <li><Link to="/contact" className="hover:text-foreground transition-colors">Contact</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-body font-semibold text-sm mb-3">Company</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/about" className="hover:text-foreground transition-colors">About</Link></li>
          </ul>
        </div>
      </div>

      <div className="mt-10 pt-6 border-t border-border text-center text-xs text-muted-foreground">
        © 2025 Dobaara. Made with love for the community.
      </div>
    </div>
  </footer>
);

export default Footer;
