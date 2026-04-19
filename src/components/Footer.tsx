const columns = [
  {
    title: "Dobaara",
    links: ["About us", "Sustainability", "Press", "Advertising", "Accessibility"],
  },
  {
    title: "Discover",
    links: ["How it works", "Item Verification", "Mobile apps", "Infoboard"],
  },
  {
    title: "Help",
    links: ["Help Centre", "Selling", "Buying", "Trust and Safety"],
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
                <li key={link}>
                  <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {link}
                  </a>
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
