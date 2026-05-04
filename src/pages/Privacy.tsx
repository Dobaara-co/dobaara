import PolicyLayout from "@/components/PolicyLayout";

const Privacy = () => (
  <PolicyLayout
    title="Privacy Policy"
    lastUpdated="May 2025"
    sections={[
      {
        title: "Who we are",
        body: (
          <>
            <p>
              Dobaara is a marketplace for pre-loved South Asian fashion, operated by Dobaara Ltd, United Kingdom.
            </p>
            <p>
              Contact:{" "}
              <a href="mailto:info@dobaara.co" className="text-gold hover:underline">
                info@dobaara.co
              </a>{" "}
              | dobaara.co
            </p>
          </>
        ),
      },
      {
        title: "What data we collect",
        body: (
          <ul className="list-disc pl-5 space-y-2">
            <li>Account information: name, email, username, location when you register</li>
            <li>Listing data: photos, descriptions, measurements, prices you submit</li>
            <li>Payment data: processed by Stripe — we never store card details</li>
            <li>Usage data: pages visited, searches, items saved</li>
            <li>Communications: messages between buyers and sellers</li>
            <li>Device data: IP address, browser type, device type</li>
          </ul>
        ),
      },
      {
        title: "How we use your data",
        body: (
          <ul className="list-disc pl-5 space-y-2">
            <li>To operate your account and the marketplace</li>
            <li>To process payments via Stripe Connect</li>
            <li>To send transactional emails (order confirmations, messages, sale notifications)</li>
            <li>To improve the platform</li>
            <li>To comply with legal obligations</li>
          </ul>
        ),
      },
      {
        title: "Who we share data with",
        body: (
          <ul className="list-disc pl-5 space-y-2">
            <li>Stripe: payment processing and seller payouts</li>
            <li>Supabase: secure database and authentication</li>
            <li>Resend: transactional email delivery</li>
            <li>We never sell your personal data to third parties</li>
          </ul>
        ),
      },
      {
        title: "Your rights (UK GDPR)",
        body: (
          <>
            <p>
              You have the right to: access your data, correct inaccurate data, delete your account and data,
              object to processing, data portability.
            </p>
            <p>
              To exercise these rights:{" "}
              <a href="mailto:info@dobaara.co" className="text-gold hover:underline">
                info@dobaara.co
              </a>
            </p>
          </>
        ),
      },
      {
        title: "Cookies",
        body: <p>We use essential cookies for authentication and session management. No advertising cookies.</p>,
      },
      {
        title: "Data retention",
        body: (
          <p>
            We retain your data for as long as your account is active. On account deletion, personal data is
            removed within 30 days.
          </p>
        ),
      },
      {
        title: "Changes to this policy",
        body: <p>We'll notify users of material changes by email.</p>,
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

export default Privacy;
