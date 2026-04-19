import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { listings, categoryLabels, conditionLabels } from "@/data/seedData";
import ListingCard from "@/components/ListingCard";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { SlidersHorizontal, X } from "lucide-react";

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
  const isMobile = useIsMobile();
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

      <div className="flex items-center justify-between mb-4 gap-2">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowFilters(true)}>
            <SlidersHorizontal className="h-4 w-4 mr-1.5" strokeWidth={1.5} /> Filters {activeFilters > 0 && `(${activeFilters})`}
          </Button>
          <p className="text-sm text-muted-foreground hidden sm:block">{filtered.length} listings</p>
        </div>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="rounded-md border border-input bg-background px-3 py-1.5 text-sm"
        >
          {sortOptions.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>

      <div className="flex gap-6">
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

      {/* Filter drawer: left on desktop, bottom sheet on mobile */}
      <Sheet open={showFilters} onOpenChange={setShowFilters}>
        <SheetContent
          side={isMobile ? "bottom" : "left"}
          className={isMobile ? "h-[85vh] rounded-t-2xl p-0 flex flex-col" : "w-full sm:max-w-md p-0 flex flex-col"}
        >
          <SheetHeader className="border-b border-border p-4">
            <SheetTitle className="text-left">Filters</SheetTitle>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto">{filtersContent}</div>
          <div className="border-t border-border bg-background p-4">
            <Button className="w-full" onClick={() => setShowFilters(false)}>
              Apply filters · {filtered.length} results
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default Browse;
