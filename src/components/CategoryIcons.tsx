import { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

// Hand-drawn fashion-illustration aesthetic — thin, elegant line work.
// Uses currentColor so consumers can tint with text-primary / text-gold.
const base = {
  width: 40,
  height: 40,
  viewBox: "0 0 64 64",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.1,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

/* ---------- Garment icons ---------- */

// Lehenga — fitted choli + bell-shaped ghagra with scalloped hem and dupatta drape
export const LehengaIcon = (props: IconProps) => (
  <svg {...base} {...props}>
    {/* neck + choli */}
    <path d="M26 9c2 2 4 3 6 3s4-1 6-3" />
    <path d="M26 9c-2 2-3 4-3 7v6h18v-6c0-3-1-5-3-7" />
    <path d="M23 22h18" />
    {/* waist band */}
    <path d="M22 24h20l-1 4H23z" />
    {/* skirt */}
    <path d="M23 28C18 36 14 46 12 56" />
    <path d="M41 28c5 8 9 18 11 28" />
    {/* scalloped hem */}
    <path d="M12 56c2-2 4-2 5 0s4 2 5 0 4-2 5 0 4 2 5 0 4-2 5 0 4 2 5 0 4-2 5 0" />
    {/* dupatta drape */}
    <path d="M41 14c4 1 7 4 9 8" strokeDasharray="1 2" />
    {/* embroidery hint */}
    <path d="M28 36l4 6 4-6" opacity=".6" />
  </svg>
);

// Saree — figure draped: blouse + pleated front + pallu over the shoulder
export const SareeIcon = (props: IconProps) => (
  <svg {...base} {...props}>
    {/* blouse */}
    <path d="M24 12c2 2 5 3 8 3s6-1 8-3" />
    <path d="M24 12c-1 2-2 5-2 8h20c0-3-1-6-2-8" />
    {/* midriff gap */}
    <path d="M24 22c-1 1-1 2-1 3" />
    <path d="M40 22c1 1 1 2 1 3" />
    {/* pleated front skirt */}
    <path d="M22 26c-2 8-3 18-3 30h26c0-12-1-22-3-30" />
    {/* vertical pleats */}
    <path d="M26 30v26" opacity=".7" />
    <path d="M30 30v26" opacity=".7" />
    <path d="M34 30v26" opacity=".7" />
    <path d="M38 30v26" opacity=".7" />
    {/* pallu draped over left shoulder, falling down side */}
    <path d="M40 14c4 0 7 2 9 5l-2 4" />
    <path d="M47 23c-1 6-3 14-2 26" />
    <path d="M47 23l4 1" opacity=".6" />
    {/* hem */}
    <path d="M19 56h26" />
  </svg>
);

// Salwar Kameez — long kameez tunic + tapered salwar trousers + dupatta
export const SalwarIcon = (props: IconProps) => (
  <svg {...base} {...props}>
    <path d="M26 10c2 2 4 3 6 3s4-1 6-3" />
    <path d="M25 10c-3 1-5 3-7 7l4 5-2 22h24l-2-22 4-5c-2-4-4-6-7-7" />
    {/* side slits */}
    <path d="M22 36v8" opacity=".5" />
    <path d="M42 36v8" opacity=".5" />
    {/* salwar trousers */}
    <path d="M20 44h24" />
    <path d="M22 44l-1 12h8l1-9" />
    <path d="M42 44l1 12h-8l-1-9" />
    {/* dupatta scarf across */}
    <path d="M18 18c4 2 9 3 14 3s10-1 14-3" strokeDasharray="1 2" opacity=".7" />
  </svg>
);

// Anarkali — fitted bodice flowing into a wide floor-length frock
export const AnarkaliIcon = (props: IconProps) => (
  <svg {...base} {...props}>
    <path d="M26 10c2 2 4 3 6 3s4-1 6-3" />
    {/* fitted bodice */}
    <path d="M25 10c-2 1-3 3-3 6l-2 8" />
    <path d="M39 10c2 1 3 3 3 6l2 8" />
    <path d="M22 24h20" />
    {/* flowing A-line skirt */}
    <path d="M22 24c-4 10-7 22-9 32" />
    <path d="M42 24c4 10 7 22 9 32" />
    {/* scalloped hem */}
    <path d="M13 56c2-2 4-2 5 0s4 2 5 0 4-2 5 0 4 2 5 0 4-2 5 0 4 2 5 0" />
    {/* embroidery panels */}
    <path d="M28 32v18" opacity=".5" />
    <path d="M36 32v18" opacity=".5" />
    <path d="M32 28v22" opacity=".5" />
  </svg>
);

// Sherwani — long structured menswear coat with stand collar & button placket
export const SherwaniIcon = (props: IconProps) => (
  <svg {...base} {...props}>
    {/* stand collar */}
    <path d="M27 10h10v3h-10z" />
    <path d="M32 13l-4 3 4 3 4-3z" />
    {/* coat body */}
    <path d="M28 16c-4 1-7 3-9 7l4 5-3 28h24l-3-28 4-5c-2-4-5-6-9-7" />
    {/* center placket */}
    <path d="M32 19v37" />
    {/* buttons */}
    <circle cx="32" cy="24" r=".7" fill="currentColor" />
    <circle cx="32" cy="30" r=".7" fill="currentColor" />
    <circle cx="32" cy="36" r=".7" fill="currentColor" />
    <circle cx="32" cy="42" r=".7" fill="currentColor" />
    <circle cx="32" cy="48" r=".7" fill="currentColor" />
    {/* hem */}
    <path d="M20 56h24" />
  </svg>
);

// Dupatta — flowing rectangular shawl with embroidered ends
export const DupattaIcon = (props: IconProps) => (
  <svg {...base} {...props}>
    <path d="M10 18c6-3 14-4 22-4s16 1 22 4" />
    <path d="M10 18c2 8 5 18 8 30" />
    <path d="M54 18c-2 8-5 18-8 30" />
    {/* drape curves */}
    <path d="M18 48c8 4 20 4 28 0" />
    {/* embroidered border */}
    <path d="M14 30c10 4 26 4 36 0" opacity=".6" strokeDasharray="1 2" />
    {/* tassels */}
    <path d="M18 48v4M22 50v4M26 51v4M32 52v4M38 51v4M42 50v4M46 48v4" opacity=".7" />
  </svg>
);

// Accessories — necklace + earring set (jewellery)
export const AccessoriesIcon = (props: IconProps) => (
  <svg {...base} {...props}>
    {/* necklace chain */}
    <path d="M16 18c4 10 12 16 16 16s12-6 16-16" />
    {/* pendant */}
    <path d="M32 34l-2 4 2 4 2-4z" />
    <circle cx="32" cy="42" r="1" fill="currentColor" />
    {/* small beads */}
    <circle cx="22" cy="24" r=".8" fill="currentColor" />
    <circle cx="27" cy="29" r=".8" fill="currentColor" />
    <circle cx="37" cy="29" r=".8" fill="currentColor" />
    <circle cx="42" cy="24" r=".8" fill="currentColor" />
    {/* earrings */}
    <circle cx="14" cy="14" r="1.2" />
    <path d="M14 15v4l-2 2 2 2 2-2z" />
    <circle cx="50" cy="14" r="1.2" />
    <path d="M50 15v4l-2 2 2 2 2-2z" />
  </svg>
);

/* ---------- UI icons (sketch style) ---------- */

export const SketchLockIcon = (props: IconProps) => (
  <svg {...base} {...props}>
    <path d="M20 28v-4a12 12 0 0124 0v4" />
    <path d="M16 28h32v26H16z" />
    <circle cx="32" cy="40" r="3" />
    <path d="M32 43v5" />
  </svg>
);

export const SketchVerifiedIcon = (props: IconProps) => (
  <svg {...base} {...props}>
    <path d="M32 6l5 4 6-1 2 6 6 2-1 6 4 5-4 5 1 6-6 2-2 6-6-1-5 4-5-4-6 1-2-6-6-2 1-6-4-5 4-5-1-6 6-2 2-6 6 1z" />
    <path d="M24 33l6 6 12-14" />
  </svg>
);

export const SketchTruckIcon = (props: IconProps) => (
  <svg {...base} {...props}>
    <path d="M6 18h30v22H6z" />
    <path d="M36 26h12l6 8v6H36z" />
    <circle cx="18" cy="46" r="4" />
    <circle cx="44" cy="46" r="4" />
    <path d="M40 32h10" opacity=".6" />
  </svg>
);

export const SketchArrowRight = (props: IconProps) => (
  <svg {...base} {...props}>
    <path d="M10 32h44" />
    <path d="M44 20l12 12-12 12" />
  </svg>
);

export const SketchSparkle = (props: IconProps) => (
  <svg {...base} {...props}>
    <path d="M32 8c2 10 4 12 14 14-10 2-12 4-14 14-2-10-4-12-14-14 10-2 12-4 14-14z" />
    <path d="M50 36c1 5 2 6 7 7-5 1-6 2-7 7-1-5-2-6-7-7 5-1 6-2 7-7z" opacity=".7" />
  </svg>
);

export const SketchHeartIcon = (props: IconProps) => (
  <svg {...base} {...props}>
    <path d="M32 54s-18-10-18-24a10 10 0 0118-6 10 10 0 0118 6c0 14-18 24-18 24z" />
  </svg>
);

export const SketchBagIcon = (props: IconProps) => (
  <svg {...base} {...props}>
    <path d="M14 22h36l-3 32H17z" />
    <path d="M22 22a10 10 0 0120 0" />
    <path d="M22 30v4M42 30v4" opacity=".6" />
  </svg>
);

export const SketchTagIcon = (props: IconProps) => (
  <svg {...base} {...props}>
    <path d="M8 32V8h24l24 24-24 24z" />
    <circle cx="20" cy="20" r="3" />
  </svg>
);

/* ---------- Eco / sustainability icons ---------- */

export const SketchDropletIcon = (props: IconProps) => (
  <svg {...base} {...props}>
    <path d="M32 8c-8 12-14 20-14 28a14 14 0 0028 0c0-8-6-16-14-28z" />
    <path d="M24 38a8 8 0 006 8" opacity=".6" />
  </svg>
);

export const SketchLeafIcon = (props: IconProps) => (
  <svg {...base} {...props}>
    <path d="M12 52C12 28 28 12 52 12c0 24-16 40-40 40z" />
    <path d="M12 52C24 40 36 28 50 14" opacity=".6" />
    <path d="M22 42l6-6M28 44l8-8M34 46l10-10" opacity=".4" />
  </svg>
);

export const SketchHomeHeartIcon = (props: IconProps) => (
  <svg {...base} {...props}>
    <path d="M10 30L32 10l22 20" />
    <path d="M14 28v26h36V28" />
    <path d="M32 46s-8-5-8-12a5 5 0 018-3 5 5 0 018 3c0 7-8 12-8 12z" />
  </svg>
);
