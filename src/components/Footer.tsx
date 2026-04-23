import { Link } from "react-router-dom";

type FooterLink = { label: string; to: string };

const columns: { title: string; links: FooterLink[] }[] = [
  {
    title: "Dobaara",
    links: [
      { label: "About us", to: "/about" },
      { label: "Sustainability", to: "/about" },
      { label: "Press", to: "#" },
      { label: "Contact", to: "/contact" },
      { label: "Accessibility", to: "#" },
    ],
  },
  {
    title: "Discover",
    links: [
      { label: "How it works", to: "/how-it-works" },
      { label: "Item Verification", to: "/dobaara-verified" },
      { label: "Size Guide", to: "/size-guide" },
      { label: "Selling Guide", to: "/selling-guide" },
    ],
  },
  {
    title: "Help",
    links: [
      { label: "Help Centre", to: "/faq" },
      { label: "FAQ", to: "/faq" },
      { label: "Selling", to: "/selling-guide" },
      { label: "Buying", to: "/how-it-works" },
      { label: "Trust and Safety", to: "/faq" },
    ],
  },
];

const Footer = () => (
  <footer className="border-t border-border mt-16 pb-20 md:pb-0">
    <div className="container py-14">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-16">
        {columns.map((col) => (
          <div key={col.title}>
            <h4 className="font-display text-base font-semibold text-foreground mb-4">{col.title}</h4>
            <ul className="space-y-2.5">
              {col.links.map((link) => (
                <li key={link.label}>
                  {link.to.startsWith("/") ? (
                    <Link
                      to={link.to}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  ) : (
                    <a
                      href={link.to}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-12 pt-6 border-t border-border text-xs text-muted-foreground">
        © 2025 Dobaara. Made with love for the community.
      </div>
    </div>
  </footer>
);

export default Footer;
