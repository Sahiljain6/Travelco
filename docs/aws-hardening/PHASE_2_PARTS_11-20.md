# Travelco AWS Hardening — Parts 11–20

This change set continues the existing draft PR and is deliberately separate from the working AWS deployment. It does not deploy to EC2, change CloudFront/nginx/security groups, or modify the React UI.

## Guardrails for this phase

- Keep the PR in draft until CI and staging smoke tests complete.
- Preserve current routes, JSON response formats, login cookie defaults and one-hop Express proxy default.
- Do not run the vehicle idempotency index migration on production before staging and backup verification.
- The current deployment described in the project report is a single EC2 host with PM2 and MongoDB in Docker. The keyed booking locks in this phase coordinate only inside one Node process. Do not scale the backend to multiple PM2 workers/instances and treat these locks as distributed coordination.
- Do not automatically enforce a Content Security Policy or alter CloudFront behavior until all existing image, map, API and Socket.IO resources have been inventoried.

## Part 11 — Security headers

backend/middleware/securityHeaders.js adds X-Content-Type-Options: nosniff, Referrer-Policy: strict-origin-when-cross-origin, X-Frame-Options: SAMEORIGIN, X-Permitted-Cross-Domain-Policies: none and disables DNS prefetching. The app's X-Powered-By header is disabled.

HSTS is intentionally not emitted from the Express origin at this stage because the reported origin-facing connection is HTTP and the current site is reached through CloudFront. Configure and verify transport policy at the CloudFront/origin layer. CSP remains a separate report-only rollout after resource discovery.

## Part 12 — Rate limiting

- Authentication and recovery routes use per-IP limits.
- Booking creation uses a per-user limit when the authenticated user is available, with IP fallback.
- Flight search and authenticated image uploads have dedicated limits.
- Rate limits are in-memory per process and bounded. This is adequate as a conservative first control for the current single-process topology, but counters reset on process restart and are not shared across instances. Before horizontal scaling, replace them with a shared store or edge limiter such as a suitably configured AWS WAF rule.

Treat the thresholds in backend/middleware/routeLimits.js as conservative starting points. Watch 429s and legitimate user complaints in staging before altering limits.

## Part 13 — Input and payload boundaries

- Existing JSON and URL-encoded request-body limits remain at 5 MB to avoid breaking current forms. Payload/parser errors now produce bounded JSON responses instead of raw parser messages or the default HTML error page.
- Existing upload controller limits remain: 2 MB for public profile images, 5 MB for private images, one file per request and magic-byte verification against the declared image MIME type.
- Activity list endpoints validate pagination: page is 1–10,000 and limit is 1–100. Invalid values return 400 rather than making unbounded queries.
- Keep any request-size changes route-specific. A global limit smaller than the current upload/API contract may break working image forms.

## Part 14 — Authorization review

The legacy verifyUser and verifyAdmin middleware now loads the current account role from MongoDB instead of trusting only the role embedded in a possibly old JWT. JWT verification is explicitly restricted to HS256, matching the repository's current signing defaults.

The remaining route inventory should still be tested for every role before release. A route's CORS behavior does not replace authentication or object-ownership checks.

## Part 15 — File upload protections

The repository already had several useful controls in backend/controllers/uploadController.js: bounded in-memory file sizes, MIME allowlisting, one-file limits, magic-byte checks for JPG/PNG/WEBP/GIF, safe generated names and Cloudinary URLs over HTTPS. This phase adds a rate limit to authenticated image uploads and keeps the existing public profile-upload limiter.

The separate hotel image upload path uses Multer disk storage. Review that path separately before changing its file filtering or storage location; moving it to Cloudinary/S3 would be a separate migration.

## Part 16 — MongoDB connection options

backend/utils/mongoOptions.js accepts validated optional pool and timeout settings. If the variables are absent, the current Mongoose driver defaults are retained. Do not set production tuning values based on guesses; use staging traffic and connection metrics first.

## Part 17 — Index inventory

Run npm run inspect:indexes from backend/ only against the intended environment. The script is read-only: it lists collection/index definitions and does not create, drop or modify indexes. Use the inventory and explain() results to plan indexes. Do not create new indexes blindly because large collections or duplicate data can make index builds risky.

## Part 18 — N+1/query load guardrails

This phase bounds activity-list pagination and adds an index inventory tool. It does not blindly rewrite multi-query controllers without representative query plans. For expensive endpoints, compare explain("executionStats"), examined documents, returned documents and application latency using staging data before changing queries.

## Part 19 — Vehicle reservation idempotency

Clients may optionally send Idempotency-Key (16–128 characters from letters, digits, dot, underscore, colon and hyphen) on vehicle reservation creation. The server fingerprints the normalized vehicle/date/driver request. A repeated key with the same request returns the original reservation; reuse with a different payload returns 409.

The feature stores optional fields and includes an explicit, separate index migration:
1. Back up and verify restore.
2. Deploy the branch to staging with the feature code.
3. Test a repeated key, a different payload with the same key, no key, and simultaneous duplicate requests.
4. Run npm run migrate:vehicle-idempotency-index against the staging database.
5. Verify the uniq_user_vehicle_idempotency_key index exists using npm run inspect:indexes.
6. Only after successful tests and a production backup should the same migration be considered for production during a controlled window.

Do not run the migration implicitly at application startup. This first pass covers vehicle reservations; hotel, restaurant, flight and train reservation endpoints need equivalent request/response-specific designs before they can all claim persistent idempotency.

## Part 20 — Reservation race conditions

Vehicle reservation availability checks and same-room hotel reservation flows are serialized with keyed locks inside the current Node process. This prevents competing requests handled by that process from simultaneously passing the read/check/write section.

This is not a distributed lock. It does not guarantee correctness if multiple PM2 workers/instances or independent scripts write reservations concurrently. Before enabling multiple app processes, design and test database-backed coordination or atomic inventory/slot documents, and use a supported MongoDB replica-set transaction strategy where multi-document atomicity is required. The current report describes MongoDB in a Docker container on the same EC2 host; do not assume transactions are available without checking the actual deployment mode.

The hotel controller still updates reservation documents and room availability in separate operations. This lock reduces the current single-process race window but is not a substitute for crash-safe multi-document transactions. Test room allocations and recovery behavior in staging.

## Required staging checks before considering merge

- [ ] Existing UI screenshots and React build match the baseline.
- [ ] Normal login/logout, verification, recovery and profile upload work.
- [ ] Repeated invalid login/recovery requests receive controlled 429 responses.
- [ ] All current authenticated roles can create/view/manage the same bookings as before.
- [ ] Normal and invalid activity pagination behave as documented.
- [ ] Payloads over parser limits receive JSON 413 responses; valid image forms still work.
- [ ] Vehicle reservations without an idempotency key continue to work.
- [ ] Repeated vehicle Idempotency-Key requests return one reservation after the unique index is installed.
- [ ] Two same-vehicle overlap requests and two same-room date-overlap requests are run concurrently against staging.
- [ ] Index inspection is read-only, and the explicit index migration succeeds on staging.
- [ ] Backend CI tests, syntax checks and frontend production build pass.

No AWS production changes are performed by these repository updates.
