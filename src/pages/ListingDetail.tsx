import { useParams, Link } from "react-router-dom";
import { listings, getSeller, formatPrice, conditionColors, conditionLabels, categoryLabels } from "@/data/seedData";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, Share2, Award, Star, MapPin, Shield, Package, ArrowLeft } from "lucide-react";
import ListingCard from "@/components/ListingCard";
import { useState } from "react";

const ListingDetail = () => {
  const { id } = useParams();
  const listing = listings.find((l) => l.id === id);
  const [saved, setSaved] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);

  if (!listing) {
    return (
      <div className="container py-20 text-center">
        <p className="text-lg font-semibold">Listing not found</p>
        <Link to="/browse"><Button variant="outline" className="mt-4">Back to Browse</Button></Link>
      </div>
    );
  }

  const seller = getSeller(listing.sellerId);
  const discount = listing.originalPrice
    ? Math.round(((listing.originalPrice - listing.price) / listing.originalPrice) * 100)
    : null;

  const moreBySeller = listings.filter((l) => l.sellerId === listing.sellerId && l.id !== listing.id && l.isActive).slice(0, 4);
  const similar = listings.filter((l) => l.category === listing.category && l.id !== listing.id && l.isActive).slice(0, 4);

  const shareOnWhatsApp = () => {
    const text = encodeURIComponent(`Check out this ${listing.title} on Dobaara — ${formatPrice(listing.price)} 👗 ${window.location.href}`);
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  return (
    <div className="container py-6 pb-24 md:pb-6">
      <Link to="/browse" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="h-4 w-4" /> Back to Browse
      </Link>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Images */}
        <div>
          <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-muted">
            <img
              src={listing.images[selectedImage]}
              alt={listing.title}
              className="h-full w-full object-cover"
            />
            {listing.isVipVerified && (
              <div className="absolute top-3 left-3 flex items-center gap-1 rounded-full bg-gold px-3 py-1.5 text-sm font-semibold text-accent-foreground shadow">
                <Award className="h-4 w-4" /> Dobaara Verified
              </div>
            )}
          </div>
          {listing.images.length > 1 && (
            <div className="mt-3 flex gap-2 overflow-x-auto">
              {listing.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`h-16 w-16 shrink-0 overflow-hidden rounded-md border-2 transition-colors ${
                    i === selectedImage ? "border-primary" : "border-border"
                  }`}
                >
                  <img src={img} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground">
              {categoryLabels[listing.category]}
            </span>
            <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground capitalize">
              {listing.occasion}
            </span>
          </div>

          <h1 className="text-2xl md:text-3xl font-bold">{listing.title}</h1>

          <div className="mt-3 flex items-baseline gap-3">
            <span className="text-3xl font-bold text-primary">{formatPrice(listing.price)}</span>
            {listing.originalPrice && (
              <>
                <span className="text-lg text-muted-foreground line-through">{formatPrice(listing.originalPrice)}</span>
                {discount && (
                  <span className="rounded-full bg-success px-2.5 py-0.5 text-xs font-semibold text-success-foreground">
                    Save {discount}%
                  </span>
                )}
              </>
            )}
          </div>

          <div className="mt-3 flex items-center gap-2">
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${conditionColors[listing.condition]}`}>
              {conditionLabels[listing.condition]}
            </span>
            <span className="text-sm text-muted-foreground">·</span>
            <span className="text-sm text-muted-foreground">{listing.designerBrand}</span>
            <span className="text-sm text-muted-foreground">·</span>
            <span className="text-sm text-muted-foreground">Size {listing.sizeLabel}</span>
          </div>

          {/* Measurements */}
          {(listing.bustCm || listing.waistCm || listing.hipsCm || listing.lengthCm) && (
            <div className="mt-5 rounded-lg border border-border p-4">
              <h3 className="text-sm font-semibold mb-2">Measurements</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {listing.bustCm && <div><span className="text-muted-foreground">Bust:</span> {listing.bustCm} cm</div>}
                {listing.waistCm && <div><span className="text-muted-foreground">Waist:</span> {listing.waistCm} cm</div>}
                {listing.hipsCm && <div><span className="text-muted-foreground">Hips:</span> {listing.hipsCm} cm</div>}
                {listing.lengthCm && <div><span className="text-muted-foreground">Length:</span> {listing.lengthCm} cm</div>}
              </div>
            </div>
          )}

          <p className="mt-5 text-sm text-muted-foreground leading-relaxed">{listing.description}</p>

          {/* Postage */}
          <div className="mt-5 flex items-center gap-2 text-sm">
            <Package className="h-4 w-4 text-muted-foreground" />
            {listing.freePostage ? (
              <span className="font-medium text-success">Free postage</span>
            ) : (
              <span className="text-muted-foreground">Postage: {formatPrice(listing.postagePrice)}</span>
            )}
            <span className="text-muted-foreground">· Ships from {listing.shipsFrom}</span>
          </div>

          {/* Actions */}
          <div className="mt-6 flex flex-col gap-3">
            <Button variant="hero" size="lg" className="w-full">Buy Now — {formatPrice(listing.price + (listing.freePostage ? 0 : listing.postagePrice))}</Button>
            <div className="flex gap-3">
              <Button variant="heroOutline" size="lg" className="flex-1">
                <MessageCircle className="h-4 w-4 mr-1" /> Make an Offer
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => setSaved(!saved)}
                className={saved ? "text-destructive border-destructive" : ""}
              >
                <Heart className={`h-4 w-4 ${saved ? "fill-destructive" : ""}`} />
                <span className="ml-1">{listing.savesCount + (saved ? 1 : 0)}</span>
              </Button>
            </div>
            <div className="flex gap-3">
              <Button variant="ghost" size="sm" onClick={shareOnWhatsApp} className="text-muted-foreground">
                <Share2 className="h-4 w-4 mr-1" /> Share on WhatsApp
              </Button>
            </div>
          </div>

          <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Shield className="h-3.5 w-3.5" /> Secured by Stripe · Buyer protection included
          </div>

          {/* Seller card */}
          {seller && (
            <div className="mt-6 rounded-lg border border-border p-4">
              <div className="flex items-center gap-3">
                <img src={seller.avatarUrl} alt={seller.fullName} className="h-12 w-12 rounded-full object-cover" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Link to={`/@${seller.username}`} className="font-semibold text-sm hover:underline">
                      {seller.fullName}
                    </Link>
                    {seller.isFoundingSeller && (
                      <span className="rounded-full bg-gold/20 px-2 py-0.5 text-[10px] font-semibold text-primary">Founding Seller</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                    <span className="flex items-center gap-0.5"><Star className="h-3 w-3 fill-gold text-gold" /> {seller.averageRating}</span>
                    <span>· {seller.totalSalesCount} sales</span>
                    <span className="flex items-center gap-0.5"><MapPin className="h-3 w-3" /> {seller.location}</span>
                  </div>
                </div>
              </div>
              <div className="mt-3 flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <MessageCircle className="h-3.5 w-3.5 mr-1" /> Message Seller
                </Button>
                <Link to={`/@${seller.username}`} className="flex-1">
                  <Button variant="ghost" size="sm" className="w-full">View Shop</Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* More from seller */}
      {moreBySeller.length > 0 && (
        <section className="mt-12">
          <h2 className="text-xl font-bold mb-4">More from {seller?.fullName}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {moreBySeller.map((l) => <ListingCard key={l.id} listing={l} />)}
          </div>
        </section>
      )}

      {/* Similar */}
      {similar.length > 0 && (
        <section className="mt-12">
          <h2 className="text-xl font-bold mb-4">Similar Listings</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {similar.map((l) => <ListingCard key={l.id} listing={l} />)}
          </div>
        </section>
      )}
    </div>
  );
};

export default ListingDetail;
