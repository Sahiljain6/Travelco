# Travelco security hardening notes

This document records the repository-level security changes in this branch. They require review and deployment before they protect the hosted site. No AWS account, CloudFront distribution, WAF, security group, live database, or running server is changed by a GitHub branch/PR.

## Application defenses added

- **Broken access control:** chat/message reads and writes require chat membership, and the authenticated user cannot spoof a different direct-chat participant; tour bookings derive the user ID from the authenticated session. Activity owners can edit/delete only their own activity records; public reads hide pending/declined activities unless the requester is the owner or an administrator. Activity reservation approval/decline is restricted to the activity owner or admin, and cancellation is restricted to the reservation owner/admin. Restaurant creation requires an authenticated, approved restaurant-owner role or an admin; ownership and approval status are assigned server-side. Restaurant reservation ownership and status are also assigned server-side.
- **NoSQL injection:** a request guard rejects dangerous MongoDB/operator property names (such as keys beginning with `$`, dotted property keys, and prototype-pollution keys) in parsed request bodies/query objects. Search terms used in regular expressions are escaped and bounded.
- **Cross-site scripting:** user-controlled names are HTML-escaped before inclusion in verification-email markup. React text rendering escapes ordinary string values by default; do not add raw HTML rendering for user-generated content without a dedicated sanitizer and review.
- **Request flooding:** a general in-process API limiter now covers API endpoints that lack a more specific limit. Existing stricter auth/booking limits remain. The limiter is process-local and may not coordinate across multiple PM2 workers/instances.
- **Email/recovery hygiene:** the existing generic forgot-password/resend-verification responses remain; HTML verification emails now escape the name field.

## Controls that still must be configured outside the code

### DDoS and infrastructure

1. Enable AWS WAF on the CloudFront distribution and configure rate-based rules for authentication, search, contact, upload and other expensive paths. Tune using real traffic; avoid broad rules that break legitimate API or Socket.IO traffic.
2. Keep the EC2 origin from being directly reachable around CloudFront. Review Security Group ingress, nginx origin checks and CloudFront origin configuration. Do not expose MongoDB or the Node port publicly.
3. Confirm CloudFront caching is disabled or correctly scoped for authenticated/API responses. Keep health checks available.
4. Review request-size/time-out settings in CloudFront, nginx and Node; the in-process limiter cannot absorb a bandwidth/connection flood before traffic reaches the host.
5. If running more than one process/instance, use a shared rate-limit store (or WAF/edge rules) rather than assuming the in-memory limiter is distributed.

### Phishing and social engineering

1. Configure and test SPF, DKIM and DMARC for the actual sender domain; monitor DMARC reports before enforcing a stricter policy.
2. Use a verified sender and a fixed, HTTPS-only frontend URL for verification/reset links. Restrict who can change SMTP and frontend URL settings.
3. For a production service, consider MFA/passkeys for administrators and sensitive business-owner accounts. Do not ask users to send passwords, reset codes, or verification links through support messages.
4. Teach portfolio/demo users to navigate to the known Travelco domain directly and verify the domain before signing in. App code alone cannot prevent a user entering credentials into an unrelated spoofed site.

## Verification checklist

Run from `backend/`:

```powershell
npm test
npm run audit:production
```

Also verify manually in an isolated/staging database:

- An organizer cannot update/delete another organizer's activity or approve/decline that organizer's reservation.
- Public visitors cannot retrieve pending/declined activity records.
- Restaurant submissions cannot forge the owner or self-approve.
- Restaurant reservations use the authenticated account, not a user ID submitted by the browser.
- Requests containing nested keys such as `{"filter":{"$ne":null}}` are rejected with HTTP 400.
- Search input containing regex metacharacters is treated as literal text.
- The API returns HTTP 429 after the configured global limit is exceeded.
- Signup, login, verification/reset, bookings, owner workflows, images, Socket.IO and the full frontend are regression-tested.

The global app limiter is intentionally a backstop. It is not evidence of DDoS resilience. Do not deploy without reviewing CI results and testing the complete UI/API workflow on staging.
