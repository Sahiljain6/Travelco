import React from "react";
import { Link } from "react-router-dom";

const sections = [
  ["1. Information we may collect", "Account information you provide, such as name, email address, country, phone number, profile image and travel preferences; booking or reservation details needed to provide requested services; messages you send to support; and technical information such as device/browser details, basic logs and cookie/session data."],
  ["2. How we use information", "We use information to create and secure accounts, verify email addresses, manage bookings and support requests, remember preferences such as currency and travel interests, personalize destination discovery, protect the service against abuse, and meet legal obligations. Optional product updates should be controlled through your notification preferences."],
  ["3. Sharing and service providers", "We share the minimum information needed with travel providers and booking partners when you request their services, and with providers that help us host the website, deliver email, store data, process payments, or prevent fraud. Those providers may process information under their own terms and privacy notices. We do not sell personal information as a product."],
  ["4. International processing", "Travel services and infrastructure may operate in more than one country. Where personal information is transferred internationally, Travelco must use appropriate safeguards required by applicable law and explain any required transfer details in the final production policy."],
  ["5. Retention", "We keep account and transaction information only for as long as reasonably needed to provide the service, resolve disputes, maintain security, and satisfy legal or accounting requirements. Final retention periods should be set based on the records Travelco actually maintains and its legal obligations."],
  ["6. Security", "We use reasonable technical and organizational measures designed to protect information. No internet service is completely risk-free. Use a unique password, protect access to your email account, and tell us promptly if you suspect unauthorized use of your Travelco account."],
  ["7. Cookies and local storage", "The website may use browser storage to remember your sign-in display state and preferences, and secure cookies to maintain an authenticated session. Browser settings can limit storage, but doing so may affect sign-in or other features. The production website should document any analytics or advertising tools before enabling them."],
  ["8. Your choices and rights", "You can review and update permitted account details and notification preferences in your profile, and request help with access, correction or deletion where applicable law provides those rights. Some records may need to be retained for legal, security or transaction reasons. We will verify requests before acting on them."],
  ["9. Children", "Travelco's account features are not designed for children to create independent accounts where parental consent or a minimum age is required by applicable law. The production policy must state the minimum age for the relevant jurisdictions and how a parent or guardian can contact the operator."],
  ["10. Changes and contact", "We may update this policy as the service changes. We will provide notice of material changes where required. Use the Contact Us page for privacy questions or requests. Before launch, add the operator's legal name, postal address, privacy contact, applicable jurisdiction, and any required local disclosures."],
];

const PrivacyPolicy = () => (
  <main className="min-h-screen bg-slate-50 px-4 py-14 sm:px-6">
    <article className="mx-auto max-w-4xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-12">
      <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-600">Travelco · Your data</p>
      <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-950">Privacy Policy</h1>
      <p className="mt-3 text-sm text-slate-500">Last updated: October 10, 2026</p>
      <p className="mt-6 rounded-2xl bg-amber-50 p-4 text-sm leading-6 text-amber-900">
        This is the initial privacy-policy draft based on the current product. The operator must verify every listed data flow, name a privacy contact, complete jurisdiction-specific disclosures, and obtain legal review before public launch.
      </p>
      <p className="mt-6 leading-7 text-slate-600">
        This policy explains how Travelco may collect, use, store and share information when you browse destinations, create an account, manage preferences or request a travel service.
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
        Review our <Link className="font-semibold text-blue-700 hover:underline" to="/terms">Terms &amp; Conditions</Link> or contact us via <Link className="font-semibold text-blue-700 hover:underline" to="/contactus">Contact Us</Link>.
      </p>
    </article>
  </main>
);

export default PrivacyPolicy;
