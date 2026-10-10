import React from "react";
import { Link } from "react-router-dom";

const sections = [
  ["1. About Travelco", "Travelco provides tools for discovering destinations and accessing travel-related listings and services. Before public launch, this page must identify the legal entity that operates the service, its registered address, and the applicable governing law."],
  ["2. Eligibility and accounts", "You must provide accurate information, keep your sign-in details secure, and use an email address you control. You are responsible for activity performed through your account. We may suspend access when needed to protect users, investigate abuse, or comply with applicable law."],
  ["3. Listings, bookings and third parties", "Availability, prices, itinerary details and service descriptions may be supplied by hotels, transport providers, tour operators, restaurants or other partners. A reservation is confirmed only when the relevant booking flow or provider confirms it. A third-party provider may have additional terms that apply to its service."],
  ["4. Prices, payments and cancellations", "The price and currency displayed at checkout or in a provider's final confirmation govern the transaction. Currency-conversion information is indicative and may differ from the amount charged by a bank or payment provider. Cancellation, refund, change and no-show conditions are those presented for the specific booking before you confirm it."],
  ["5. Acceptable use", "Do not misuse the service, submit fraudulent information, interfere with the website, attempt unauthorized access, upload unlawful content, or use the service to harass or harm others. You may not scrape or resell content in a way that violates law or the rights of others."],
  ["6. Accuracy and availability", "We work to keep information useful and current but cannot guarantee that every third-party listing, map, price, translation, weather result or exchange rate is complete or uninterrupted. Travel decisions should be checked with the relevant provider and official local guidance."],
  ["7. Intellectual property", "The website's original content, branding and software belong to Travelco or its licensors. Third-party names, logos and media remain the property of their respective owners. You may use the website for personal, lawful travel planning."],
  ["8. Liability", "To the extent permitted by law, Travelco is not responsible for service failures caused by third-party providers, inaccurate third-party data, events beyond reasonable control, or interruptions outside its reasonable control. Nothing in these terms limits rights or liabilities that cannot legally be excluded."],
  ["9. Privacy", "Our handling of personal information is explained in the Privacy Policy. By using the service, you acknowledge that policy; where consent is legally required, we will request it separately."],
  ["10. Changes and contact", "We may update these terms to reflect product, operational or legal changes. Material changes will be communicated where required. For questions, use the Contact Us page. The final production version must specify an effective date and complete operator/contact details."],
];

const TermsAndConditions = () => (
  <main className="min-h-screen bg-slate-50 px-4 py-14 sm:px-6">
    <article className="mx-auto max-w-4xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-12">
      <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-600">Travelco · Legal</p>
      <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-950">Terms &amp; Conditions</h1>
      <p className="mt-3 text-sm text-slate-500">Last updated: October 10, 2026</p>
      <p className="mt-6 rounded-2xl bg-amber-50 p-4 text-sm leading-6 text-amber-900">
        This is the initial product terms draft. Before launch, Travelco's legal operator details, governing law, dispute process, and final booking/refund rules must be completed and legally reviewed.
      </p>
      <p className="mt-6 leading-7 text-slate-600">
        These terms describe the basic rules for accessing Travelco's website and account features. By creating an account or using the service, you agree to follow them and any booking-specific terms shown before a reservation is confirmed.
      </p>
      <div className="mt-8 space-y-8">
        {sections.map(([heading, body]) => (
          <section key={heading}>
            <h2 className="text-xl font-bold text-slate-900">{heading}</h2>
            <p className="mt-2 leading-7 text-slate-600">{body}</p>
          </section>
        ))}
      </div>
      <p className="mt-10 border-t border-slate-200 pt-6 text-sm text-slate-600">
        Read how personal data is handled in our <Link className="font-semibold text-blue-700 hover:underline" to="/privacy">Privacy Policy</Link>, or contact us through <Link className="font-semibold text-blue-700 hover:underline" to="/contactus">Contact Us</Link>.
      </p>
    </article>
  </main>
);

export default TermsAndConditions;
