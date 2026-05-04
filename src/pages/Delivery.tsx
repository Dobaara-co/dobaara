import PolicyLayout from "@/components/PolicyLayout";

const Delivery = () => (
  <PolicyLayout
    title="Delivery Information"
    lastUpdated="May 2025"
    sections={[
      {
        title: "How delivery works on Dobaara",
        body: (
          <p>
            Dobaara is a peer-to-peer marketplace. Items are shipped directly from sellers to buyers. Delivery
            timescales depend on the individual seller.
          </p>
        ),
      },
      {
        title: "Dispatch timeframe",
        body: (
          <p>
            Sellers are required to dispatch within 3 days of a confirmed sale. You will receive tracking
            information once your item is dispatched.
          </p>
        ),
      },
      {
        title: "Delivery services used",
        body: (
          <>
            <p>Sellers on Dobaara typically use:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Royal Mail Tracked 24 or Tracked 48</li>
              <li>Evri (formerly Hermes)</li>
              <li>DPD</li>
            </ul>
          </>
        ),
      },
      {
        title: "Delivery timeframes (estimated)",
        body: (
          <ul className="list-disc pl-5 space-y-2">
            <li>Royal Mail Tracked 48: 2–3 working days</li>
            <li>Royal Mail Tracked 24: next working day</li>
            <li>Evri: 2–4 working days</li>
            <li>DPD: next working day</li>
          </ul>
        ),
      },
      {
        title: "Delivery costs",
        body: (
          <p>
            Delivery costs are set by the seller and shown clearly on each listing before purchase. Some
            sellers offer free postage.
          </p>
        ),
      },
      {
        title: "International delivery",
        body: (
          <p>
            Some sellers offer international shipping. International delivery times and costs vary by
            destination and carrier. Import duties may apply and are the buyer's responsibility.
          </p>
        ),
      },
      {
        title: "Lost or delayed items",
        body: (
          <p>
            If your item hasn't arrived within 10 days of the estimated delivery date, contact us at{" "}
            <a href="mailto:info@dobaara.co" className="text-gold hover:underline">
              info@dobaara.co
            </a>{" "}
            with your order number.
          </p>
        ),
      },
      {
        title: "Dobaara Verified delivery",
        body: (
          <p>
            Dobaara Verified items are dispatched by our team using Royal Mail Special Delivery or DPD, with
            full tracking and insurance.
          </p>
        ),
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

export default Delivery;
