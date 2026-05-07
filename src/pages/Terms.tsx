import PolicyLayout from "@/components/PolicyLayout";

const Terms = () => (
  <PolicyLayout
    title="Terms & Conditions"
    lastUpdated="May 2025"
    sections={[
      {
        title: "About Dobaara",
        body: (
          <p>
            Dobaara is a peer-to-peer marketplace. We connect buyers and sellers but are not a party to
            transactions between them.
          </p>
        ),
      },
      {
        title: "Eligibility",
        body: <p>You must be 18 or over to use Dobaara. By registering you confirm you are 18+.</p>,
      },
      {
        title: "Seller responsibilities",
        body: (
          <ul className="list-disc pl-5 space-y-2">
            <li>Items must be accurately described and photographed</li>
            <li>Sellers must dispatch within 3 days of sale</li>
            <li>Items must be as described — condition, measurements, and authenticity must be accurate</li>
            <li>Sellers are responsible for safe packaging</li>
            <li>Counterfeit or replica designer items are strictly prohibited and will result in permanent account ban</li>
          </ul>
        ),
      },
      {
        title: "Buyer responsibilities",
        body: (
          <ul className="list-disc pl-5 space-y-2">
            <li>Payment must be made through Dobaara's checkout</li>
            <li>Buyers must report issues within 48 hours of delivery</li>
            <li>Off-platform transactions are prohibited and remove all buyer protection</li>
          </ul>
        ),
      },
      {
        title: "Fees and payments",
        body: (
          <ul className="list-disc pl-5 space-y-2">
            <li>Listing is free</li>
            <li>Dobaara charges a commission on completed sales: 10% standard, 8% Founding Sellers, 25% Dobaara Verified</li>
            <li>Payouts are processed within 7 days of delivery confirmation</li>
          </ul>
        ),
      },
      {
        title: "Prohibited items",
        body: (
          <ul className="list-disc pl-5 space-y-2">
            <li>Counterfeit or replica items</li>
            <li>Items not related to South Asian fashion</li>
            <li>Items that are unsanitary or unsafe</li>
            <li>Items previously sold elsewhere that are no longer available</li>
          </ul>
        ),
      },
      {
        title: "Dispute resolution",
        body: (
          <p>
            Raise disputes within 48 hours of delivery at{" "}
            <a href="mailto:info@dobaara.co" className="text-gold hover:underline">
              info@dobaara.co
            </a>
            . We aim to resolve all disputes within 5 business days.
          </p>
        ),
      },
      {
        title: "Limitation of liability",
        body: (
          <p>
            Dobaara is not liable for the quality, safety or legality of items listed. Our maximum liability is
            limited to the transaction value.
          </p>
        ),
      },
      {
        title: "Governing law",
        body: <p>These terms are governed by the laws of England and Wales.</p>,
      },
      {
        title: "Contact",
        body: (
          <p>
            <a href="mailto:info@dobaara.co" className="text-gold hover:underline">
              info@dobaara.co
            </a>
          </p>
        ),
      },
    ]}
  />
);

export default Terms;
