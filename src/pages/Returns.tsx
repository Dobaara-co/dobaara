import PolicyLayout from "@/components/PolicyLayout";

const Returns = () => (
  <PolicyLayout
    title="Returns & Refunds Policy"
    lastUpdated="May 2025"
    sections={[
      {
        title: "Our returns policy",
        body: (
          <>
            <p>Dobaara operates a buyer protection policy. You may request a return if:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>The item is significantly not as described</li>
              <li>The item has undisclosed damage or flaws</li>
              <li>The wrong item was sent</li>
              <li>The item is counterfeit</li>
            </ul>
          </>
        ),
      },
      {
        title: "How to raise a return",
        body: (
          <p>
            Contact{" "}
            <a href="mailto:info@dobaara.co" className="text-gold hover:underline">
              info@dobaara.co
            </a>{" "}
            within 48 hours of delivery. Include: your order number, photos of the issue, description of the
            problem.
          </p>
        ),
      },
      {
        title: "Return timeframe",
        body: <p>Returns must be raised within 48 hours of the delivery date shown on your tracking.</p>,
      },
      {
        title: "Return shipping",
        body: (
          <>
            <p>If the return is approved:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>For seller error (wrong item, not as described): seller covers return postage</li>
              <li>For buyer's change of mind: buyer covers return postage (at seller's discretion)</li>
            </ul>
          </>
        ),
      },
      {
        title: "Refunds",
        body: (
          <p>
            Approved refunds are processed within 5–10 business days to your original payment method.
          </p>
        ),
      },
      {
        title: "Change of mind",
        body: (
          <p>
            Dobaara is a peer-to-peer marketplace. Change of mind returns are at the seller's discretion. We
            encourage buyers to message sellers before purchasing if they have any questions.
          </p>
        ),
      },
      {
        title: "Dobaara Verified items",
        body: (
          <p>
            All Dobaara Verified items are authenticated by our team before listing. Returns on Verified items
            follow the same process above.
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

export default Returns;
