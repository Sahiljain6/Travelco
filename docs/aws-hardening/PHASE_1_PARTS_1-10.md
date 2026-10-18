# Travelco AWS Hardening — Parts 1–10

This runbook targets the AWS deployment documented in the Cloud Computing report: one Ubuntu EC2 instance in ap-south-1, nginx, a React production build, Node.js/Express managed by PM2, MongoDB in Docker bound to loopback, CloudFront, SES, CloudWatch, SNS and IAM.

## Guardrails

- Do not redesign React pages, CSS, layout, typography, navigation or user workflows in this phase.
- Do not push directly to main or test destructive changes against production.
- Use a dedicated branch and pull request, then deploy to staging first.
- Take and verify a MongoDB backup before any database or deployment change.
- Do not expose credentials, token values, private keys, database URIs, SMTP credentials, access keys or sensitive personal data in Git, screenshots, logs or issues.
- GitHub changes do not change the AWS console, EC2 security group, CloudFront distribution, nginx files, PM2 process, IAM policies, SES settings or database. Those are separate operator actions and must be verified independently.

## Current-state architecture to verify

1. Browser opens the CloudFront HTTPS URL.
2. CloudFront custom origin forwards to EC2 over HTTP port 80.
3. nginx serves the React build from /var/www/travelco and proxies /api/ and /socket.io/ to 127.0.0.1:5000.
4. PM2 supervises the Express backend.
5. MongoDB runs in Docker on the same EC2 host and is intended to bind only to 127.0.0.1.
6. SES handles account verification email.
7. CloudWatch alarms notify through SNS.
8. S3 exists but is not the current frontend origin.

Confirm each statement against the live console and host before relying on it. The single EC2 host is a single point of failure.

## Parts 1–3: baseline, UI contract and release safety

- [ ] Record the deployed EC2 instance, Elastic IP association, region, security group rules, CloudFront distribution/origin/behaviors, nginx configuration, PM2 process, MongoDB container, SES region/sandbox status, CloudWatch alarms and SNS subscription.
- [ ] Confirm the public EC2 origin cannot bypass CloudFront protections. Do not close or alter access rules until the expected traffic path and recovery access are verified.
- [ ] Capture desktop and mobile screenshots and exercise the existing pages before merging code. Keep the screenshots as a manual regression baseline; this repository update does not create screenshots of the live site.
- [ ] Check out a feature branch, confirm a recent known-good deployment/commit, take a MongoDB backup and test restoration to a non-production location.
- [ ] Verify the current deployment/rollback script before using it. The report describes deploy.ps1 but it may be local or differ from the current checkout.
- [ ] Do not use git pull plus an in-place deletion of /var/www/travelco as the only rollback mechanism. Prefer uploading a versioned build directory and switching the active release only after smoke tests, while retaining the previous release.

## Parts 4–5: tests and CI

The backend npm test command uses Node's built-in test runner and has no extra test dependency. It tests origin allowlisting, proxy-hop parsing and auth-cookie policy. GitHub Actions runs it alongside the existing frontend build and backend syntax checks. These unit tests do not replace end-to-end booking tests.

Before any production deployment, manually or automatically verify:
- Frontend production build.
- Login, logout, verification email and password reset.
- Traveler and administrator authorization.
- Hotel/room, vehicle, restaurant, tour, transport and activity reservation flows where configured.
- Admin listing changes, customer messages and refunds.
- Uploads through the actual CloudFront URL.
- Browser console, nginx log and backend log have no new errors.
- Current HTTPS URL works and legacy URLs behave as intentionally configured.

## Parts 6–7: structured logs, health checks and shutdown

- Backend request logs are newline-delimited JSON and include a generated request ID, method, path, status and elapsed milliseconds. They must not include request bodies, cookies, authorization headers, query parameters, passwords or secrets.
- /health/live indicates the Node process is alive. /health/ready returns success only when Mongoose is connected and shutdown has not begun. Neither endpoint exposes environment variables or infrastructure details.
- SIGINT/SIGTERM initiates a graceful Socket.IO/HTTP and MongoDB shutdown. Verify how the active PM2 configuration handles restart signals before relying on this in production.
- Configure nginx/CloudWatch health checks to use the intended endpoint only after validating it in staging.

## Part 8: secrets and environment

- Keep production values in the EC2 environment file with owner-only permissions or move them to AWS Secrets Manager/Parameter Store in a separately tested change.
- Never commit .env or put server-side secrets in any REACT_APP_* variable.
- Rotate credentials that have been committed or shared, after identifying the affected provider and deployment dependencies.
- Ensure IAM access follows least privilege, MFA is enabled where available, and the root account is not used for routine work.
- The current JWT secret is required in production. Before enforcing any minimum secret length, inspect the configured value without printing it, rotate it safely if needed, and verify old sessions' intended invalidation behavior.

## Parts 9–10: reverse proxy, origin and browser session protection

- TRUST_PROXY_HOPS defaults to the existing one-hop setting to avoid changing current request-IP behavior. Keep that setting until the exact proxy chain and forwarded headers are verified. Do not set a permissive trust-all value. Change the hop count only after direct-origin access is restricted and nginx/CloudFront header behavior is confirmed.
- The AWS report describes CloudFront-to-origin HTTP. Prefer HTTPS to the origin after configuring a valid origin certificate and testing nginx/CloudFront behavior. Browser HTTPS alone does not encrypt the separate CloudFront-to-origin HTTP leg.
- Restrict direct origin access. A CloudFront managed prefix list limits source IP ranges but can allow requests from other distributions; consider a distribution-specific secret origin header checked at nginx, with the value kept out of source control and rotated if exposed.
- Keep the CloudFront behavior's API and Socket.IO paths working. Review allowed methods, origin request policy, cache policy and any attached WAF/edge functions before addressing the documented upload 403. Do not broadly disable security protections or set arbitrary request-size limits.
- CORS_ORIGINS should list only the exact active browser origins, including the staging origin separately where needed. CORS is not authentication; sensitive routes must continue enforcing server-side authorization.
- Auth cookies default to HttpOnly, Secure in production, Path=/, and preserve the existing production SameSite=None behavior. AUTH_COOKIE_SAME_SITE may be changed only after staging confirms login, logout, cross-site behavior where relevant, and API calls. None requires HTTPS/Secure. Keep cookie creation and clearing attributes aligned.
- The backend rejects browser requests with a present but unallowlisted Origin. Requests without Origin remain possible for non-browser clients and must be protected by authentication, authorization and rate limits on sensitive endpoints.
- The current API also returns a token in the login JSON response for compatibility. Do not remove or change that response contract without tracing frontend token usage and planning a separate migration.

## Operator validation before production

- [ ] Verify live AWS configuration and origin access.
- [ ] Validate CORS_ORIGINS, FRONTEND_URL, TRUST_PROXY_HOPS and AUTH_COOKIE_SAME_SITE in the actual environment without printing secret values.
- [ ] Run npm ci and npm test from the backend directory.
- [ ] Run npm ci and npm run build from the frontend directory.
- [ ] Test health endpoints and all critical workflows on staging.
- [ ] Verify upload behavior using the CloudFront URL.
- [ ] Confirm database backup/restore and application rollback procedures.
- [ ] Deploy during a controlled window and monitor CloudWatch, nginx and PM2 logs.

## Known limitations not solved by this phase

- One EC2 host remains a single point of failure.
- MongoDB remains on the application host; a container restart is not a backup strategy.
- CloudFront origin encryption and origin lockdown require AWS/host configuration, not just application code.
- The upload 403 must be diagnosed in the live CloudFront/WAF/origin path.
- Rate limiting, formal CSRF tokens, indexes, idempotency, concurrency handling and distributed caching are later phases.
