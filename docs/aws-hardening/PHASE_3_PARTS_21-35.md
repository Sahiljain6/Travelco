# Travelco AWS Hardening — Parts 21–35

This is the final slice of the 35-part hardening plan. It stays in the GitHub review branch and does not deploy to the production EC2 host or modify AWS resources. The React UI/layout is unchanged.

## Parts 21–23 — Booking consistency and caching

### Part 21: Transaction safety and compensation
The hotel reservation controller now keeps track of its booking record and room-availability writes. If a later room write fails, it attempts to remove availability dates added by the current request and delete the created reservation record. Rollback failures are logged using the request ID and error name only.

This is best-effort compensation, not a database transaction. The current AWS report describes MongoDB in Docker on the same EC2 host; whether multi-document transactions are available depends on the actual MongoDB topology/configuration. Before adopting real MongoDB transactions, confirm replica-set support, configure it in a maintenance window, back up and test restore, then test retry behavior and failure recovery in staging. Do not simply turn transactions on in production based on this code change.

### Part 22: Short-lived public-catalogue cache
A bounded TTL cache supports public hotel detail/list/search and catalogue count reads. It has a 30-second TTL and a maximum of 200 entries. Reservation data, room availability, authenticated responses, and private user data are not placed in this cache.

**The cache is disabled by default.** The environment variable ENABLE_PUBLIC_CATALOG_CACHE must be explicitly set to true only after staging confirms catalogue response parity and freshness.

### Part 23: Cache invalidation
Successful hotel create/update/delete and room create/delete operations invalidate the catalogue cache. External or manual database edits will not notify this in-process cache; its 30-second TTL bounds stale results. Keep the cache disabled if direct database modifications are part of routine production operations or if this freshness model is not acceptable.

## Parts 24–26 — External service resilience

### Part 24: Timeouts
The flight-search provider request uses an 8-second Axios timeout. Existing weather calls retain their 8-second timeouts; Cloudinary upload already uses a bounded 25-second timeout. Audit any future provider integrations for bounded deadlines.

### Part 25: Bounded retry with backoff
A reusable retry helper retries only explicitly transient network failures and HTTP 502/503/504 responses, with a single retry by default and a small bounded delay. It is used for read-only flight/weather GET requests only. Do not wrap booking creation, cancellation, uploads or other non-idempotent operations in automatic retries.

### Part 26: Circuit breakers
Flight search, weather geocoding, and current-weather lookups have in-process circuit breakers. Repeated failures temporarily stop new provider requests; after a 30-second cooldown, one recovery probe is allowed. A failure produces a controlled temporary-unavailable response rather than an unbounded request storm.

These circuit breakers are process-local. The counts reset on process restart and aren't shared across workers. They are not a replacement for provider monitoring or shared coordination in a multi-instance deployment.

## Parts 27–30 — Routing, scaling and resource use

### Part 27: API gateway and routing review
The code change does not create a new AWS API Gateway or change the current CloudFront/nginx path. The project report describes CloudFront → EC2/nginx → Express and Socket.IO. Before any routing/security change, verify the current CloudFront origin, cache policy, allowed HTTP methods, origin request policy, upload behavior, API paths and Socket.IO upgrade headers. The report previously records CloudFront upload 403 responses, so do not disable WAF rules or broadly increase request limits as a guess.

### Part 28: Stateless scaling
The current design uses per-process rate limits, keyed locks, circuit breakers and an optional local cache. That is consistent with the documented single EC2 application process but **is not safe as distributed coordination across multiple workers/instances**. Do not scale PM2 to multiple workers or add EC2 instances and assume these controls coordinate globally.

Before horizontal scaling, choose the intended shared state store, replace rate limits with a shared store or suitable AWS edge controls, add database-backed reservation coordination, verify media storage is shared (Cloudinary/S3 rather than instance-local files), and test Socket.IO with a shared adapter and correct connection-affinity policy where required.

### Part 29: Webhooks
The current route inventory contains no clearly identified inbound third-party webhook endpoint. Therefore this phase does not invent or expose a new public webhook route. If a provider webhook is added later, its own signature contract, timestamp/replay window, provider event ID deduplication, idempotent processing, and safe audit logs must be designed and tested before it is exposed.

### Part 30: Memory leaks and resource caps
The TTL cache and per-process rate limiter have explicit entry bounds; external-provider calls have concurrency and queue caps. These prevent unbounded growth in those new components but do not prove the entire application is free of memory leaks. Complete a staging soak test while observing RSS/heap, event-loop delay, open connections, pending requests and Socket.IO listener counts before production rollout.

## Parts 31–32 — Tests and dependencies

### Part 31: Security and concurrency tests
Backend unit tests cover security headers, rate-limit behavior and bounds, MongoDB configuration validation, idempotency keys/fingerprints, keyed locks, pagination, TTL caching, retry behavior, circuit-breaker recovery, and outbound concurrency limits. They are fast unit tests; they do not replace an end-to-end database/browser staging suite.

Staging scenarios to execute:
- Submit two overlapping vehicle reservations concurrently.
- Submit two overlapping hotel room reservations concurrently.
- Re-send a vehicle request with the same Idempotency-Key and payload.
- Re-use that key with a changed request and verify a 409 response.
- Exercise login, logout, recovery, verification, image uploads, admin actions, and every existing booking module.
- Test provider timeout/open-circuit behavior and confirm a temporary outage does not crash the API process.
- Verify the cache remains disabled by default and invalidates correctly when enabled.

### Part 32: Dependency and supply-chain security
The repository has a manual backend command: npm run audit:production. GitHub Actions also runs informational dependency-audit steps for backend and frontend packages. Those audit steps are intentionally non-blocking because findings require triage; dependencies are not automatically upgraded.

For each finding, record the vulnerable package and path, whether the affected code is reachable, a compatible patched version, the lockfile diff, and test results. Make major-version upgrades separate pull requests with regression tests. Keep secret scanning enabled and rotate exposed credentials rather than relying only on deleting them from the latest source.

## Parts 33–35 — Release, monitoring and documentation

### Part 33: Gradual deployment and rollback
Repository updates do not deploy themselves to AWS through this hardening PR. Use the existing release process only after confirming it matches the live EC2 host. Prefer a versioned release directory and a fast switch/rollback to the last known-good build, rather than deleting the live frontend or backend before the new copy is validated.

Release sequence:
1. Confirm the approved commit and CI status.
2. Back up MongoDB and verify restore to a non-production target.
3. Deploy to staging, run smoke/regression/concurrency tests and inspect logs.
4. Schedule a maintenance/release window and retain the prior known-good app release.
5. Deploy the smallest approved changeset, check /health/live and /health/ready, login, booking, uploads, Socket.IO and logs.
6. Roll back immediately if the agreed error/latency/health thresholds are exceeded.
7. Do not combine a MongoDB topology conversion or index migration with unrelated application changes.

### Part 34: Monitoring and runbooks
The app emits structured request logs including request ID, method, path, status and duration, without logging query strings, body data, cookies or authorization headers. Health routes are /health/live and /health/ready.

Configure or verify the following in CloudWatch/SNS in the actual AWS account. Suggested thresholds are starting points, not verified production values:
- EC2 status-check failures: alert on any failed status check.
- CPU utilization: sustained >80% for 5 minutes; tune to baseline and instance type.
- Root-volume free space: alert below 20% available; monitor MongoDB and image upload growth.
- API 5xx rate: alert on a sustained increase above the measured baseline.
- API latency: alert on sustained p95 above the agreed SLO.
- MongoDB connection failures / readiness failures: alert on repeated failures, not only individual transient events.
- Booking conflicts and reservation rollback errors: alert and inspect whether users are seeing a legitimate availability conflict or an integrity problem.
- CloudFront 4xx/5xx, especially upload 403 and origin 5xx: monitor and diagnose distribution/origin behavior.

Keep operational runbooks for unhealthy EC2 status, failing PM2 process, MongoDB disconnection/full disk, unhealthy deployment, provider outage, upload failures, and rollback. Avoid creating noisy alarms before measuring the existing baseline.

### Part 35: Maintenance documentation
README now links to the three hardening runbooks and reflects the AWS architecture documented by the cloud deployment report. Re-confirm the report against live AWS settings before changing infrastructure, because README and infrastructure can drift independently.

## Explicit production boundaries
- No CloudFront distribution, security group, nginx file, IAM policy, EC2 instance, PM2 process, SES setting, CloudWatch alarm, SNS subscription, or live database was changed by repository edits.
- No real AWS backup was created or restored by these changes.
- No index migration was run.
- No MongoDB replica-set/transaction setting was changed.
- The new public catalogue cache is disabled by default.
- Full browser, real database concurrency, long-duration memory, and live AWS routing validation remain staging/operator gates.

## Rollback
If any repository change fails a staging check, revert the corresponding commit(s) in the feature branch or close the draft PR. Do not roll back by manually deleting live files. If a future production release has already applied a database migration, evaluate the schema/index rollback separately from the application rollback.
