# Travelco account security and launch checklist

## Required host configuration

Set these values in the backend host's environment settings (for example, Render); do not commit credentials into source control:

- `MONGO_URI`: the production MongoDB connection string.
- `JWT`: a unique random signing secret with at least 32 random bytes. Do not reuse a source-code default.
- `NODE_ENV=production`: enables secure, cross-site HTTP-only session cookies.
- `FRONTEND_URL=https://travelxco.netlify.app`: the public frontend origin used to build verification and password-reset links.
- `CORS_ORIGINS=https://travelxco.netlify.app`: comma-separated exact frontend origins allowed to call the credentialed API.
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`: credentials for a verified transactional email provider.
- `MAIL_FROM`: sender address approved by the email provider.

The backend intentionally refuses new account registrations if SMTP is not configured, because an unverified account otherwise cannot complete sign-up. Deploy and test SMTP delivery before reopening registration. Existing accounts created before verification was added are treated as verified for compatibility; newly registered accounts must verify before login.

## Account features in this change

- One-time email-verification tokens and password-reset tokens are cryptographically random, stored only as SHA-256 hashes, expire, and cannot be reused after success.
- Login checks email verification for new accounts; password reset responses do not reveal whether an email address exists and never return a reset token in the API response.
- Password changes require the current password and at least eight characters for the new password.
- Profile updates allow only explicit profile and preference fields. Admin status, account type, password, email, verification status and token fields cannot be changed through the profile endpoint.
- Email delivery secrets and JWT signing secrets come from environment variables.
- Credentialed CORS is restricted to the configured frontend origins, and the login session uses an HTTP-only cookie.

## Before production launch

1. Add and verify all environment variables in the backend host. Test register → email delivery → verify → login → profile update → change password → forgot/reset password → logout.
2. Rotate any mail credential that was previously committed to source control. A code change does not erase old Git history; check provider logs and consider repository history cleanup if a real secret was committed.
3. Confirm the production frontend origin and API URL match the values above. If the domain changes, update both environment settings.
4. Add distributed rate limiting for login, register, verification resend and password reset; a process-local limiter is not sufficient for multiple instances.
5. Add automated integration tests for authorization boundaries, verification expiry/reuse, weak passwords, duplicate registration, and cross-origin cookie behavior.
6. Review payment, booking, cancellation and refund flows with the relevant service providers. Do not represent a booking as confirmed until its booking API confirms it.
7. Complete a privacy/data inventory, retention schedule, cookie/analytics disclosure, data-subject request process, and incident-response procedure.
8. Have counsel review the Terms & Conditions and Privacy Policy. Replace/confirm the operator's legal name, registered address, governing law, dispute process, age rules, retention periods, and applicable consumer/privacy disclosures before public launch.
9. Run dependency and secret scanning, production frontend/backend builds, accessibility checks, and end-to-end tests.
10. Do not run `backend/seed.js` against production data; it can delete collections.

## Known implementation boundaries

- The country list is shipped with the frontend; it should be reviewed and updated when territory naming requirements change.
- Currency and country data are delivered by third-party public APIs and can be unavailable. Rate results are indicative, not a bank/payment quote.
- Account preferences are stored now; personalized ranking, real saved-booking linkage, actual booking history, loyalty balances, and notification delivery require their own tested data/workflows. No artificial loyalty points are shown.
- These policy pages are a strong initial draft, not a substitute for jurisdiction-specific legal advice.
