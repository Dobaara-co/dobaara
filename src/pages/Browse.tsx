import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { listings, categoryLabels, conditionLabels } from "@/data/seedData";
import ListingCard from "@/components/ListingCard";
import { Button } from "@/components/ui/button";
import { SlidersHorizontal, X, ChevronDown } from "lucide-react";

const occasions = ["wedding", "eid", "diwali", "mehendi", "sangeet", "casual", "party"];
const sizes = ["XS", "S", "M", "L", "XL", "XXL", "Free Size", "Custom"];
const sortOptions = [
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "most_saved", label: "Most Saved" },
];

const Browse = () => {
  const [searchParams] = useSearchParams();
  const initialCategory = searchParams.get("category");
  const [selectedCategories, setSelectedCategories] = useState<string[]>(initialCategory ? [initialCategory] : []);
  const [selectedOccasions, setSelectedOccasions] = useState<string[]>([]);
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [sort, setSort] = useState("newest");
  const [showFilters, setShowFilters] = useState(false);
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  const toggle = (arr: string[], val: string, setter: (v: string[]) => void) => {
    setter(arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val]);
  };

  const filtered = useMemo(() => {
    let result = listings.filter((l) => l.isActive && !l.isSold);
    if (selectedCategories.length) result = result.filter((l) => selectedCategories.includes(l.category));
    if (selectedOccasions.length) result = result.filter((l) => selectedOccasions.includes(l.occasion));
    if (selectedConditions.length) result = result.filter((l) => selectedConditions.includes(l.condition));
    if (selectedSizes.length) result = result.filter((l) => selectedSizes.includes(l.sizeLabel));
    if (verifiedOnly) result = result.filter((l) => l.isVipVerified);

    switch (sort) {
      case "price_asc": return [...result].sort((a, b) => a.price - b.price);
      case "price_desc": return [...result].sort((a, b) => b.price - a.price);
      case "most_saved": return [...result].sort((a, b) => b.savesCount - a.savesCount);
      default: return [...result].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
  }, [selectedCategories, selectedOccasions, selectedConditions, selectedSizes, sort, verifiedOnly]);

  const activeFilters = selectedCategories.length + selectedOccasions.length + selectedConditions.length + selectedSizes.length + (verifiedOnly ? 1 : 0);

  const clearAll = () => {
    setSelectedCategories([]);
    setSelectedOccasions([]);
    setSelectedConditions([]);
    setSelectedSizes([]);
    setVerifiedOnly(false);
  };

  const FilterSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="mb-5">
      <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">{title}</h4>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );

  const Chip = ({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) => (
    <button
      onClick={onClick}
      className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${
        active ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
      }`}
    >
      {children}
    </button>
  );

  const filtersContent = (
    <div className="p-4">
      <FilterSection title="Category">
        {Object.entries(categoryLabels).map(([key, label]) => (
          <Chip key={key} active={selectedCategories.includes(key)} onClick={() => toggle(selectedCategories, key, setSelectedCategories)}>
            {label}
          </Chip>
        ))}
      </FilterSection>
      <FilterSection title="Occasion">
        {occasions.map((o) => (
          <Chip key={o} active={selectedOccasions.includes(o)} onClick={() => toggle(selectedOccasions, o, setSelectedOccasions)}>
            {o.charAt(0).toUpperCase() + o.slice(1)}
          </Chip>
        ))}
      </FilterSection>
      <FilterSection title="Condition">
        {Object.entries(conditionLabels).map(([key, label]) => (
          <Chip key={key} active={selectedConditions.includes(key)} onClick={() => toggle(selectedConditions, key, setSelectedConditions)}>
            {label}
          </Chip>
        ))}
      </FilterSection>
      <FilterSection title="Size">
        {sizes.map((s) => (
          <Chip key={s} active={selectedSizes.includes(s)} onClick={() => toggle(selectedSizes, s, setSelectedSizes)}>
            {s}
          </Chip>
        ))}
      </FilterSection>
      <div className="mb-5">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={verifiedOnly} onChange={() => setVerifiedOnly(!verifiedOnly)} className="rounded" />
          <span className="text-sm font-medium">Dobaara Verified only</span>
        </label>
      </div>
      {activeFilters > 0 && (
        <Button variant="ghost" size="sm" onClick={clearAll} className="text-destructive">
          Clear all filters
        </Button>
      )}
    </div>
  );

  return (
    <div className="container py-6 pb-24 md:pb-6">
      <h1 className="text-3xl font-bold mb-6">Browse</h1>

      {/* Active filters */}
      {activeFilters > 0 && (
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {selectedCategories.map((c) => (
            <span key={c} className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
              {categoryLabels[c]} <X className="h-3 w-3 cursor-pointer" onClick={() => toggle(selectedCategories, c, setSelectedCategories)} />
            </span>
          ))}
          {activeFilters > 1 && (
            <button onClick={clearAll} className="text-xs text-destructive hover:underline">Clear all</button>
          )}
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted-foreground">Showing {filtered.length} listings</p>
        <div className="flex items-center gap-2">
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="rounded-md border border-input bg-background px-3 py-1.5 text-sm"
          >
            {sortOptions.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
          <Button variant="outline" size="sm" className="md:hidden" onClick={() => setShowFilters(true)}>
            <SlidersHorizontal className="h-4 w-4 mr-1" /> Filters {activeFilters > 0 && `(${activeFilters})`}
          </Button>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Desktop sidebar */}
        <aside className="hidden md:block w-64 shrink-0">
          <div className="sticky top-20 rounded-lg border border-border bg-card">
            <div className="p-4 border-b border-border">
              <h3 className="font-semibold text-sm">Filters</h3>
            </div>
            {filtersContent}
          </div>
        </aside>

        {/* Grid */}
        <div className="flex-1">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
          {filtered.length === 0 && (
            <div className="text-center py-20">
              <p className="text-lg font-semibold">No listings found</p>
              <p className="text-sm text-muted-foreground mt-1">Try adjusting your filters</p>
              <Button variant="outline" className="mt-4" onClick={clearAll}>Clear filters</Button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile filter sheet */}
      {showFilters && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-foreground/50" onClick={() => setShowFilters(false)} />
          <div className="absolute bottom-0 left-0 right-0 max-h-[80vh] overflow-y-auto rounded-t-2xl bg-background animate-fade-in">
            <div className="sticky top-0 flex items-center justify-between border-b border-border bg-background p-4">
              <h3 className="font-semibold">Filters</h3>
              <Button variant="ghost" size="icon" onClick={() => setShowFilters(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            {filtersContent}
            <div className="sticky bottom-0 border-t border-border bg-background p-4">
              <Button className="w-full" onClick={() => setShowFilters(false)}>
                Show {filtered.length} results
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Browse;
