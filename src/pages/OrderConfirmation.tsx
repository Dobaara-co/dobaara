import { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { Package, Bell, Truck, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";

type OrderWithListing = {
  id: string;
  amount: number;
  status: string;
  created_at: string;
  listing: {
    id: string;
    title: string;
    images: string[];
  } | null;
};

const DiamondDivider = () => (
  <div className="flex items-center justify-center gap-3 my-6">
    <span className="h-px w-12 bg-[#C9A84C]/40" />
    <span className="block h-2 w-2 rotate-45 bg-[#C9A84C]" />
    <span className="h-px w-12 bg-[#C9A84C]/40" />
  </div>
);

const AnimatedCheck = () => (
  <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full border-2 border-[#7A9B6E]/60 bg-[#7A9B6E]/10">
    <svg viewBox="0 0 52 52" className="h-14 w-14">
      <circle
        cx="26"
        cy="26"
        r="24"
        fill="none"
        stroke="#7A9B6E"
        strokeWidth="1.5"
        strokeDasharray="160"
        strokeDashoffset="160"
        style={{ animation: "dash-circle 0.7s ease-out forwards" }}
      />
      <path
        fill="none"
        stroke="#7A9B6E"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M14 27 l8 8 l16 -18"
        strokeDasharray="48"
        strokeDashoffset="48"
        style={{ animation: "dash-check 0.5s 0.6s ease-out forwards" }}
      />
      <style>{`
        @keyframes dash-circle { to { stroke-dashoffset: 0; } }
        @keyframes dash-check  { to { stroke-dashoffset: 0; } }
      `}</style>
    </svg>
  </div>
);

const formatGbp = (pence: number) => `£${(pence / 100).toFixed(2)}`;

const OrderConfirmation = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const [searchParams] = useSearchParams();
  const isSuccess = searchParams.get("success") === "true";

  const [order, setOrder] = useState<OrderWithListing | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const fetchOrder = async () => {
      if (!orderId) {
        setLoading(false);
        return;
      }
      const { data } = await supabase
        .from("orders")
        .select("id, amount, status, created_at, listing:listings(id, title, images)")
        .eq("id", orderId)
        .maybeSingle();
      if (!cancelled) {
        setOrder(data as unknown as OrderWithListing | null);
        setLoading(false);
      }
    };
    fetchOrder();
    return () => {
      cancelled = true;
    };
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-[#FAF7F2] flex items-center justify-center">
        <div className="h-10 w-10 animate-pulse rounded-full bg-[#C9A84C]/30" />
      </div>
    );
  }

  if (!isSuccess || !order) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-[#FAF7F2] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <h1 className="font-display text-3xl text-[#8B5E3C] mb-3">Order not found</h1>
          <p className="text-[#5a3e2b] mb-6">
            We couldn't find this order. It may have expired or the link is incorrect.
          </p>
          <Link to="/browse">
            <Button className="bg-[#8B5E3C] hover:bg-[#754c2e] text-white">
              Back to browse
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const thumbnail = order.listing?.images?.[0];
  const reference = order.id.slice(0, 8).toUpperCase();

  const steps = [
    { icon: Bell, title: "Seller notified", desc: "The seller has received your order and will prepare your item." },
    { icon: Truck, title: "Item dispatched", desc: "You'll receive tracking details once your item is on its way." },
    { icon: Star, title: "Leave a review", desc: "Once received, share your experience to help the community." },
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#FAF7F2] px-4 py-12 md:py-16">
      <div className="max-w-2xl mx-auto">
        {/* Hero */}
        <div className="text-center">
          <AnimatedCheck />
          <h1 className="font-display text-4xl md:text-5xl text-[#8B5E3C]">Payment successful!</h1>
          <p className="mt-4 text-[#5a3e2b] font-body leading-relaxed">
            Thank you for your purchase. The seller has been notified and will dispatch your item within 3 days.
          </p>
        </div>

        <DiamondDivider />

        {/* Order summary card */}
        <div className="bg-[#FDFBF7] border border-[#C9A84C]/30 rounded-2xl p-5 md:p-6 shadow-sm">
          <div className="flex gap-4 items-start">
            {thumbnail ? (
              <img
                src={thumbnail}
                alt={order.listing?.title}
                className="h-20 w-20 md:h-24 md:w-24 rounded-lg object-cover border border-[#C9A84C]/20"
              />
            ) : (
              <div className="h-20 w-20 md:h-24 md:w-24 rounded-lg bg-[#C9A84C]/10" />
            )}
            <div className="flex-1 min-w-0">
              <h2 className="font-display text-xl text-[#8B5E3C] truncate">
                {order.listing?.title ?? "Listing"}
              </h2>
              <p className="mt-1 font-body text-2xl text-[#3d2b1f] font-semibold">
                {formatGbp(order.amount)}
              </p>
              <span className="inline-block mt-2 text-xs font-medium px-3 py-1 rounded-full bg-[#7A9B6E]/15 text-[#5a7a50] uppercase tracking-wider">
                Payment confirmed
              </span>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-[#C9A84C]/20 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-sm">
            <div className="font-mono text-xs uppercase text-[#8B5E3C]/70 tracking-wider">
              Ref · {reference}
            </div>
            <div className="flex items-center gap-2 text-[#5a3e2b]">
              <Package className="h-4 w-4 text-[#C9A84C]" strokeWidth={1.75} />
              <span>Dispatched within 3 days</span>
            </div>
          </div>
        </div>

        {/* What happens next */}
        <div className="mt-10">
          <h3 className="font-display text-2xl text-[#8B5E3C] text-center mb-6">
            What happens next
          </h3>
          <ol className="space-y-4">
            {steps.map((step, i) => (
              <li
                key={step.title}
                className="flex gap-4 bg-white/50 border border-[#C9A84C]/20 rounded-xl p-4"
              >
                <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full bg-[#8B5E3C]/10 text-[#8B5E3C] font-display text-lg">
                  {i + 1}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <step.icon className="h-4 w-4 text-[#C9A84C]" strokeWidth={1.75} />
                    <h4 className="font-display text-lg text-[#8B5E3C]">{step.title}</h4>
                  </div>
                  <p className="mt-1 text-sm text-[#5a3e2b] font-body leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        {/* CTAs */}
        <div className="mt-10 flex flex-col sm:flex-row gap-3">
          <Link to="/browse" className="flex-1">
            <Button
              variant="outline"
              className="w-full border-[#8B5E3C] text-[#8B5E3C] hover:bg-[#8B5E3C]/5"
            >
              Continue browsing
            </Button>
          </Link>
          <Link to="/account" className="flex-1">
            <Button className="w-full bg-[#8B5E3C] hover:bg-[#754c2e] text-white">
              View my account
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;
