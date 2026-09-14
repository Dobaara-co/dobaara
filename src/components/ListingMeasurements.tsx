import { Link } from "react-router-dom";
import { Ruler, Scissors, CheckCircle2, AlertTriangle, HelpCircle, MoveHorizontal, ArrowUpDown } from "lucide-react";
import type { Listing } from "@/data/seedData";
import { useMyMeasurements } from "@/hooks/useMyMeasurements";
import { useAuth } from "@/contexts/AuthContext";

const toIn = (cm: number) => Math.round((cm / 2.54) * 10) / 10;
const both = (cm?: number) => (cm ? `${toIn(cm)}" / ${Math.round(cm)} cm` : null);

const stitchingLabels: Record<string, string> = {
  stitched: "Stitched",
  semi_stitched: "Semi-stitched",
  unstitched: "Unstitched",
};

const waistLabels: Record<string, string> = {
  elastic: "Elastic waist",
  drawstring: "Drawstring (naada)",
  fixed: "Fixed hook-and-eye",
  zip: "Zip waist",
};

interface Row { label: string; cm?: number }
interface Group { title: string; rows: Row[]; marginCm?: number }

function buildGroups(listing: Listing): Group[] {
  const c = (listing.category || "").toLowerCase();
  const groups: Group[] = [];

  const topTitle = c.includes("lehenga")
    ? "Blouse"
    : c.includes("saree") || c.includes("sari")
    ? "Blouse"
    : c.includes("salwar") || c.includes("kameez") || c.includes("anarkali")
    ? "Kameez"
    : c.includes("sherwani") || c.includes("kurta")
    ? "Sherwani"
    : "Garment";

  const topRows: Row[] = [
    { label: "Bust / chest", cm: listing.blouseBustCm ?? listing.bustCm },
    { label: "Waist", cm: listing.blouseWaistCm ?? (groupsHasBottom(c) ? undefined : listing.waistCm) },
    { label: "Shoulder", cm: listing.shoulderCm },
    { label: "Sleeve length", cm: listing.sleeveLengthCm },
    { label: "Length", cm: listing.blouseLengthCm ?? (groupsHasBottom(c) ? undefined : listing.lengthCm) },
  ].filter((r) => !!r.cm);

  if (topRows.length) {
    groups.push({ title: topTitle, rows: topRows, marginCm: listing.blouseMarginCm ?? listing.marginCm });
  }

  const bottomTitle = c.includes("lehenga")
    ? "Skirt"
    : c.includes("salwar") || c.includes("kameez")
    ? "Salwar"
    : c.includes("sherwani")
    ? "Trousers"
    : c.includes("saree") || c.includes("sari")
    ? "Saree"
    : "Fit";

  const bottomRows: Row[] = [
    { label: "Waist", cm: listing.skirtWaistCm ?? (topRows.some((r) => r.label === "Waist") ? undefined : listing.waistCm) },
    { label: "Hips", cm: listing.hipsCm },
    { label: "Length", cm: listing.skirtLengthCm ?? (topRows.some((r) => r.label === "Length") ? undefined : listing.lengthCm) },
    { label: "Flare (ghera)", cm: listing.skirtFlareCm },
  ].filter((r) => !!r.cm);

  if (bottomRows.length) {
    groups.push({ title: bottomTitle, rows: bottomRows, marginCm: listing.skirtMarginCm ?? listing.marginCm });
  }

  return groups;
}

function groupsHasBottom(c: string) {
  return c.includes("lehenga") || c.includes("salwar") || c.includes("kameez") || c.includes("sherwani");
}

type FitState = "fits" | "alteration" | "unlikely";

function assessFit(listing: Listing, me: { bustCm?: number; waistCm?: number; hipsCm?: number }) {
  const checks: { label: string; state: FitState }[] = [];
  const compare = (label: string, mine?: number, garment?: number, margin?: number) => {
    if (!mine || !garment) return;
    if (mine <= garment) checks.push({ label, state: "fits" });
    else if (margin && mine <= garment + margin) checks.push({ label, state: "alteration" });
    else checks.push({ label, state: "unlikely" });
  };
  const topMargin = listing.blouseMarginCm ?? listing.marginCm;
  const bottomMargin = listing.skirtMarginCm ?? listing.marginCm;
  compare("Bust", me.bustCm, listing.blouseBustCm ?? listing.bustCm, topMargin);
  compare("Waist", me.waistCm, listing.skirtWaistCm ?? listing.waistCm ?? listing.blouseWaistCm, bottomMargin);
  compare("Hips", me.hipsCm, listing.hipsCm, bottomMargin);
  if (!checks.length) return null;
  const state: FitState = checks.some((c) => c.state === "unlikely")
    ? "unlikely"
    : checks.some((c) => c.state === "alteration")
    ? "alteration"
    : "fits";
  return { state, checks };
}

const ListingMeasurements = ({ listing }: { listing: Listing }) => {
  const { user } = useAuth();
  const { data: me } = useMyMeasurements();
  const groups = buildGroups(listing);

  const hasAnything =
    groups.length ||
    listing.stitchingStatus ||
    listing.waistType ||
    listing.heightMinCm ||
    listing.alterationNotes;

  if (!hasAnything) return null;

  const fit = me ? assessFit(listing, me) : null;
  const marginTop = listing.blouseMarginCm ?? listing.marginCm;
  const marginBottom = listing.skirtMarginCm;

  const fitStyles: Record<FitState, string> = {
    fits: "border-success/40 bg-success/10 text-success",
    alteration: "border-accent/50 bg-accent/10 text-accent-foreground",
    unlikely: "border-border bg-muted text-muted-foreground",
  };
  const fitCopy: Record<FitState, string> = {
    fits: "Should fit you",
    alteration: "Fits with alteration",
    unlikely: "May not fit",
  };

  return (
    <div className="mt-5 space-y-4">
      {/* Will this fit me? */}
      <div className="rounded-lg border border-border p-4">
        <h3 className="flex items-center gap-2 text-sm font-semibold">
          <Ruler className="h-4 w-4 text-muted-foreground" /> Will this fit me?
        </h3>

        {!user || !me ? (
          <div className="mt-2 text-sm text-muted-foreground">
            <p>Add your measurements to see if this piece will fit you.</p>
            <Link
              to={user ? "/account" : "/auth"}
              className="mt-2 inline-block font-medium text-primary underline underline-offset-4"
            >
              {user ? "Add your measurements" : "Sign in to add measurements"}
            </Link>
          </div>
        ) : !fit ? (
          <p className="mt-2 text-sm text-muted-foreground">
            Not enough measurements on this listing to compare.
          </p>
        ) : (
          <div className="mt-3">
            <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-semibold ${fitStyles[fit.state]}`}>
              {fit.state === "fits" ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : fit.state === "alteration" ? (
                <AlertTriangle className="h-4 w-4" />
              ) : (
                <HelpCircle className="h-4 w-4" />
              )}
              {fitCopy[fit.state]}
            </div>
            <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
              {fit.checks.map((c) => (
                <li key={c.label}>
                  <span className="font-medium text-foreground">{c.label}:</span> {fitCopy[c.state].toLowerCase()}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Measurements */}
      <div className="rounded-lg border border-border p-4">
        <h3 className="text-sm font-semibold">Measurements</h3>
        <p className="mt-1 text-xs text-muted-foreground">Shown in inches first, then centimetres.</p>

        <div className="mt-3 space-y-4">
          {groups.map((g) => (
            <div key={g.title}>
              <p className="font-mono text-xs uppercase tracking-wider text-accent">{g.title}</p>
              <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                {g.rows.map((r) => (
                  <div key={r.label}>
                    <span className="text-muted-foreground">{r.label}:</span> {both(r.cm)}
                  </div>
                ))}
              </div>
              {g.marginCm ? (
                <div className="mt-2 inline-flex items-center gap-2 rounded-full border border-accent/50 bg-accent/10 px-3 py-1 text-xs font-semibold">
                  <MoveHorizontal className="h-3.5 w-3.5 text-accent" />
                  {g.title}: {toIn(g.marginCm)} inches margin — can be let out
                </div>
              ) : null}
            </div>
          ))}
        </div>

        {/* Badges */}
        <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold">
          {listing.stitchingStatus && stitchingLabels[listing.stitchingStatus] && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1">
              <Scissors className="h-3.5 w-3.5 text-muted-foreground" />
              {stitchingLabels[listing.stitchingStatus]}
            </span>
          )}
          {listing.waistType && waistLabels[listing.waistType] && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1">
              <MoveHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
              {waistLabels[listing.waistType]}
            </span>
          )}
          {(listing.heightMinCm || listing.heightMaxCm) && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1">
              <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />
              Best for{" "}
              {listing.heightMinCm && listing.heightMaxCm
                ? `${toIn(listing.heightMinCm)}"–${toIn(listing.heightMaxCm)}" (${Math.round(listing.heightMinCm)}–${Math.round(listing.heightMaxCm)} cm)`
                : both(listing.heightMinCm ?? listing.heightMaxCm)}
            </span>
          )}
        </div>

        {listing.alterationNotes && (
          <div className="mt-4 rounded-lg bg-secondary p-3">
            <p className="font-mono text-xs uppercase tracking-wider text-accent">Alterations</p>
            <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{listing.alterationNotes}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ListingMeasurements;
