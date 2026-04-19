import { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

const base = {
  width: 40,
  height: 40,
  viewBox: "0 0 48 48",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.25,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

// Lehenga — fitted bodice flaring into a wide skirt with delicate hem detail
export const LehengaIcon = (props: IconProps) => (
  <svg {...base} {...props}>
    <path d="M19 8c1.5 1.5 3.5 1.5 5 0" />
    <path d="M19 8c-.6 2-1 4-1 6l-7 30h26l-7-30c0-2-.4-4-1-6" />
    <path d="M18 14h12" />
    <path d="M11 38h26" />
    <path d="M14 42c1.5-1 3-1 4 0s3 1 4 0 3-1 4 0 3 1 4 0 3-1 4 0" />
  </svg>
);

// Saree — draped fabric with pleats over the shoulder
export const SareeIcon = (props: IconProps) => (
  <svg {...base} {...props}>
    <path d="M16 6c2 2 4 3 8 3s6-1 8-3" />
    <path d="M16 6c-2 4-3 8-3 14v22h22V20c0-6-1-10-3-14" />
    <path d="M22 12c2 8 2 18-2 30" />
    <path d="M26 14c-1 6 0 16 4 28" />
    <path d="M13 42h22" />
  </svg>
);

// Salwar Kameez — long tunic with two narrow trouser legs
export const SalwarIcon = (props: IconProps) => (
  <svg {...base} {...props}>
    <path d="M19 7c1.5 1.5 3.5 1.5 5 0" />
    <path d="M18 7c-3 1-5 3-6 6l3 4-2 16h22l-2-16 3-4c-1-3-3-5-6-6" />
    <path d="M15 33h18" />
    <path d="M17 33l-1 9h6l1-9" />
    <path d="M31 33l1 9h-6l-1-9" />
  </svg>
);

// Anarkali — fitted top with floor-length flowing skirt
export const AnarkaliIcon = (props: IconProps) => (
  <svg {...base} {...props}>
    <path d="M19 7c1.5 1.5 3.5 1.5 5 0" />
    <path d="M19 7c-2 1-3 3-3 5l-1 6" />
    <path d="M29 7c2 1 3 3 3 5l1 6" />
    <path d="M15 18c-2 8-4 16-5 24h28c-1-8-3-16-5-24" />
    <path d="M19 7v35" />
    <path d="M29 7v35" />
    <path d="M10 42h28" />
  </svg>
);

// Sherwani — long structured menswear coat with collar and buttons
export const SherwaniIcon = (props: IconProps) => (
  <svg {...base} {...props}>
    <path d="M18 7l6 4 6-4" />
    <path d="M18 7c-3 1-6 3-7 6l3 5-2 24h20l-2-24 3-5c-1-3-4-5-7-6" />
    <path d="M24 11v31" />
    <circle cx="24" cy="18" r=".6" fill="currentColor" />
    <circle cx="24" cy="24" r=".6" fill="currentColor" />
    <circle cx="24" cy="30" r=".6" fill="currentColor" />
    <circle cx="24" cy="36" r=".6" fill="currentColor" />
  </svg>
);
