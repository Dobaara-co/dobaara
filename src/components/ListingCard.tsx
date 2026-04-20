import { Link } from "react-router-dom";
import { type Listing, formatPrice, conditionColors, conditionLabels, getSeller } from "@/data/seedData";
import { useState } from "react";
import { SketchHeartIcon, SketchVerifiedIcon } from "@/components/CategoryIcons";

const ListingCard = ({ listing }: { listing: Listing }) => {
  const [saved, setSaved] = useState(false);
  const seller = getSeller(listing.sellerId);
  const discount = listing.originalPrice
    ? Math.round(((listing.originalPrice - listing.price) / listing.originalPrice) * 100)
    : null;

  return (
    <Link to={`/listing/${listing.id}`} className="group block">
      <div className="relative overflow-hidden rounded-lg bg-card border border-border transition-all duration-300 group-hover:shadow-lg group-hover:-translate-y-1">
        {/* Image */}
        <div className="relative aspect-[3/4] overflow-hidden bg-muted">
          <img
            src={listing.images[listing.primaryImageIndex]}
            alt={listing.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />

          {/* VIP Badge */}
          {listing.isVipVerified && (
            <div className="absolute top-2 left-2 flex items-center gap-1 rounded-full bg-gold px-2.5 py-1 text-xs font-semibold text-accent-foreground shadow-sm">
              <SketchVerifiedIcon className="h-3 w-3" />
              Verified
            </div>
          )}

          {/* Save button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              setSaved(!saved);
            }}
            className="absolute top-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-card/85 backdrop-blur-sm transition-colors hover:bg-card"
            aria-label="Save listing"
          >
            <SketchHeartIcon
              className={`h-4 w-4 transition-colors ${saved ? "fill-terracotta text-terracotta" : "text-muted-foreground"}`}
            />
          </button>

          {/* Discount badge — terracotta */}
          {discount && discount > 20 && (
            <div className="absolute bottom-2 left-2 rounded-full bg-terracotta px-2 py-0.5 text-xs font-semibold text-terracotta-foreground">
              Save {discount}%
            </div>
          )}
        </div>

        {/* Details — minimal: title, seller, price, condition + size */}
        <div className="p-3">
          <p className="truncate text-sm font-semibold text-foreground">{listing.title}</p>
          {seller && (
            <p className="mt-0.5 text-xs text-muted-foreground truncate">@{seller.username}</p>
          )}

          <div className="mt-2 flex items-center gap-2">
            <span className="text-base font-bold text-primary">{formatPrice(listing.price)}</span>
            {listing.originalPrice && (
              <span className="text-xs text-muted-foreground line-through">{formatPrice(listing.originalPrice)}</span>
            )}
          </div>

          <div className="mt-2 flex items-center gap-2">
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${conditionColors[listing.condition]}`}>
              {conditionLabels[listing.condition]}
            </span>
            <span className="text-xs text-muted-foreground">Size {listing.sizeLabel}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ListingCard;
