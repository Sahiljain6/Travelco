# Travelco — AWS Deployment & Developer Guide

Travelco is a MERN-stack travel and tourism platform and a learning project for deploying, operating and improving a full-stack application on AWS.

<p align="left">
  <img src="https://img.shields.io/badge/Cloud-AWS-FF9900?style=for-the-badge&logo=amazonaws" alt="AWS">
  <img src="https://img.shields.io/badge/Frontend-React%2018-61DAFB?style=for-the-badge&logo=react" alt="React 18">
  <img src="https://img.shields.io/badge/API-Node.js%20%2B%20Express-339933?style=for-the-badge&logo=nodedotjs" alt="Node.js and Express">
  <img src="https://img.shields.io/badge/Database-MongoDB-47A248?style=for-the-badge&logo=mongodb" alt="MongoDB">
</p>

> **AWS demo URL recorded in the deployment notes:** [https://dp0upmp8cla6l.cloudfront.net](https://dp0upmp8cla6l.cloudfront.net)  
> Availability may change. This URL and architecture are documented project information, not a live inspection of the AWS account. Verify the current distribution, origin and instance before operating on AWS.

**Repository:** [Sahiljain6/Travelco](https://github.com/Sahiljain6/Travelco)

## Contents

- [Project overview](#project-overview)
- [AWS architecture](#aws-architecture)
- [AWS services](#aws-services)
- [Deployment constraints](#deployment-constraints)
- [Local development](#local-development)
- [Demo data and test fixtures](#demo-data-and-test-fixtures)
- [Environment configuration](#environment-configuration)
- [AWS deployment workflow](#aws-deployment-workflow)
- [Smoke tests and rollback](#smoke-tests-and-rollback)
- [Monitoring and troubleshooting](#monitoring-and-troubleshooting)
- [Security checklist](#security-checklist)
- [Hardening runbooks and contributions](#hardening-runbooks-and-contributions)
- [Roadmap](#roadmap)

## Project overview

Travelco combines several travel discovery and booking-related workflows in one web application.

**Traveler features:** registration and sign-in, password recovery, hotel and room reservations, vehicle rentals, tours, flight/train workflows where configured, restaurant listings, activities, contact enquiries and real-time messaging where enabled.

**Admin features:** hotel, room, vehicle and tour listing management; customer enquiries; user and role workflows; finance-health, payroll and refund-related dashboards.

Provider-backed features depend on credentials and configuration. Demo listings are not verified live inventory. The application is not a live travel supplier or payment processor.

### Technology stack

| Layer | Main technologies |
|---|---|
| Frontend | React 18, React Router, Axios, Tailwind CSS, Material UI / MUI Data Grid |
| Backend | Node.js, Express, Socket.IO, Multer, Nodemailer |
| Authentication | JWT and bcryptjs |
| Database | MongoDB with Mongoose |
| Media and integrations | Cloudinary, SMTP, configured flight/weather providers |
| Documents and charts | jsPDF, jspdf-autotable, Recharts |
| Documented AWS deployment | CloudFront, EC2, nginx, PM2, MongoDB in Docker, SES, CloudWatch and SNS |

## AWS architecture

The deployment notes describe a **single EC2 host** in AWS Mumbai, region **ap-south-1**. CloudFront is the public HTTPS entry point. nginx serves the React build and proxies API and Socket.IO requests to Express on the same machine. MongoDB runs in Docker on that host.

~~~mermaid
flowchart TD
    U["Traveler or administrator browser"] -->|"HTTPS"| CF["Amazon CloudFront"]
    CF -->|"Origin HTTP :80, as documented"| NG["nginx on Ubuntu EC2"]
    NG -->|"/ — static React build"| UI["React files: /var/www/travelco"]
    NG -->|"/api and /socket.io"| API["Node.js / Express / Socket.IO<br/>PM2, local port 5000"]
    API --> DB["MongoDB in Docker<br/>same EC2 host"]
    API --> SES["SMTP / Amazon SES"]
    EC2["EC2 host metrics"] -.-> CW["Amazon CloudWatch"]
    CW --> SNS["Amazon SNS email alerts"]
~~~

The diagram reflects the documented design, not proof that every setting is currently present in AWS. Confirm the live setup before changing it.

### Request path

1. The browser opens the CloudFront URL over HTTPS.
2. CloudFront forwards requests to the EC2 origin.
3. nginx serves the built React application.
4. nginx proxies requests for /api/ and /socket.io/ to the Node service on 127.0.0.1:5000.
5. Express uses MongoDB and configured external services.

The deployment notes describe HTTP between CloudFront and EC2. The viewer-to-CloudFront connection can therefore be encrypted while the CloudFront-to-origin hop is not. Review origin TLS and access restrictions before processing real customer data.

## AWS services

| Service / component | Documented role | Verify before changing it |
|---|---|---|
| **Amazon CloudFront** | Public HTTPS entry point and CDN | Domain, origin DNS/protocol, certificate, allowed methods, cache policy, origin request policy and 4xx/5xx metrics |
| **Amazon EC2** | Ubuntu host for nginx, Node.js and MongoDB container | Instance state, patching, disk/CPU/memory and recovery plan |
| **Elastic IP** | Stable origin address, if attached | Confirm it remains associated with the intended instance |
| **Security Group** | Network access control | The report says web traffic and SSH are allowed while API/database ports should not be public; verify actual inbound rules |
| **nginx** | React hosting and API/WebSocket proxy | Document root, API upstream, Socket.IO upgrade headers and config test |
| **PM2** | Node process supervision | Process name, working directory, logs, restart and startup configuration |
| **Docker / MongoDB** | Database container on EC2 | Authentication, data volume, restart policy, disk use, backup and restore |
| **IAM** | AWS identity and permissions | Least privilege; never commit AWS access keys |
| **Amazon SES** | Transactional email over SMTP | Region, sender verification, sandbox/production status and SMTP credentials |
| **CloudWatch + SNS** | Monitoring and email alerts described by the report | Verify alarms/subscriptions exist and test notification delivery |
| **Amazon S3** | Bucket noted for future static hosting | The report does not describe S3 as the current website origin |

The repository also includes older Netlify/Nixpacks configuration. Do not mistake it for the documented AWS production path. GitHub Actions validation is CI, not proof of automatic AWS deployment.

## Deployment constraints

Treat these as design constraints, not claims that the application is highly available or ready for commercial booking traffic.

- **Single point of failure:** frontend, backend and database share one EC2 host.
- **Origin encryption:** the documented CloudFront-to-origin hop uses HTTP.
- **Database co-location:** backups, tested restores, isolation and disaster recovery need separate attention.
- **No verified auto-deployment:** pushing or merging code does not prove EC2 is updated. Verify the live version after an approved release.
- **Process-local controls:** rate limits, keyed booking locks, circuit breakers and optional catalogue cache are not shared across workers/instances. Do not scale horizontally until coordination is redesigned.
- **Optional cache:** ENABLE_PUBLIC_CATALOG_CACHE defaults to false. Enable it only after staging tests confirm freshness and invalidation.
- **Upload 403s:** large uploads have previously been reported as returning 403. Inspect CloudFront, nginx and application logs before changing limits or protections.
- **External services:** flights, weather, email and image uploads depend on credentials, availability and provider quotas.

### Recommended AWS evolution

Make these separate, tested projects rather than one large release:

1. Establish a repeatable build, staging, release, smoke-test and rollback process.
2. Restrict origin access and encrypt CloudFront-to-origin traffic.
3. Evaluate a managed database such as MongoDB Atlas or Amazon DocumentDB after compatibility and migration planning. Amazon RDS is relational and is not a direct MongoDB replacement.
4. Store persistent uploads in shared object storage rather than instance-local files.
5. Add a load balancer and multi-AZ application capacity only after replacing process-local coordination with shared or database-backed mechanisms.
6. Add measured CloudWatch alarms, tested SNS notifications and automated backup/restore checks.

These are recommendations, not AWS resources created by this repository. Review costs and migration requirements first.

## Local development

### Prerequisites

- [Git](https://git-scm.com/)
- [Node.js](https://nodejs.org/) 18 or newer recommended
- npm
- MongoDB locally, in Docker or in a compatible [MongoDB Atlas](https://www.mongodb.com/atlas) cluster

### Clone the repository

~~~bash
git clone https://github.com/Sahiljain6/Travelco.git
cd Travelco
~~~

### Start the backend

~~~bash
cd backend
npm install
~~~

Copy backend/.env.example to backend/.env. Configure a reachable MONGO_URI and a strong local JWT secret. Add provider credentials only for the features you need to test.

~~~bash
npm run dev
~~~

The backend entry point is server.js; the documented default port is 5000, unless PORT is configured.

### Start the frontend

In another terminal:

~~~bash
cd frontend
npm install
~~~

Create frontend/.env:

~~~env
REACT_APP_API_URL=http://localhost:5000/api
~~~

Then run:

~~~bash
npm start
~~~

The React development server normally opens at [http://localhost:3000](http://localhost:3000). If a command fails, inspect the scripts in frontend/package.json and backend/package.json for the current checkout.

### Run checks

~~~bash
cd backend
npm test
npm run audit:production
~~~

The production audit may fail on high-severity findings. Triage each finding and test compatible upgrades rather than blindly upgrading major versions.

For the frontend build:

~~~bash
cd frontend
npm run build
~~~

## Demo data and test fixtures

A repeatable, non-destructive Faker dataset and a compact airport/country/region reference sample are documented in [backend/data/demo/README.md](backend/data/demo/README.md).

The optional command is run manually from the backend folder with a dedicated development/staging database. It refuses production mode, requires explicit opt-in, and only upserts deterministic demo IDs. It does not generate real user credentials or bookings, change flight search, or configure AWS. **Never point the demo seeder at the production database.**

## Environment configuration

**Never commit a real .env, production secret, SSH private key or API credential.** Configure secrets on the server or in an appropriate secrets manager. Use backend/.env.example as the source of truth for supported backend variable names.

| Variable | Purpose |
|---|---|
| NODE_ENV | Runtime environment: development or production |
| PORT | Express port; documented default is 5000 |
| MONGO_URI | MongoDB connection URI |
| JWT | Current backend JWT secret; use a unique high-entropy value |
| FRONTEND_URL | Public frontend URL for application links/email workflows |
| CORS_ORIGINS | Allowed browser origins, where supported |
| TRUST_PROXY_HOPS | Proxy trust setting; change only after verifying the proxy chain |
| AUTH_COOKIE_SAME_SITE | Cookie policy; preserve and verify behavior during rollout |
| SMTP_HOST, SMTP_PORT, SMTP_SECURE | SMTP connection settings |
| SMTP_USER, SMTP_PASS, MAIL_FROM | SMTP credentials and sender |
| CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET | Server-side Cloudinary uploads |
| OPENWEATHER_API_KEY | Optional weather provider |
| SKYSCANNER_RAPIDAPI_KEY | Optional flight search provider |
| ENABLE_PUBLIC_CATALOG_CACHE | Optional hotel catalogue cache; keep false until staging validation |
| MongoDB pool/timeout variables | Optional tuning; unset values preserve driver defaults |
| DRIVER_DAILY_FEE | Optional driver fee for supported vehicle bookings |

The documented AWS frontend URL is https://dp0upmp8cla6l.cloudfront.net; verify the current domain before copying it. SES SMTP settings and sender verification must match the actual region.

### Frontend build-time settings

| Variable | Purpose | Secret? |
|---|---|---|
| REACT_APP_API_URL | Backend API URL embedded in the React build | No |
| REACT_APP_MAPTILER_API_KEY | Browser-visible map tile key, if used | No; restrict allowed origins/usage |

Create React App embeds REACT_APP_* values in browser assets. Never put SMTP passwords, JWT secrets, Cloudinary API secrets or flight-provider secrets in frontend variables. Rebuild the frontend after changing build-time settings.

## AWS deployment workflow

This is a **release checklist, not a turnkey script**. Confirm the live host configuration before switching files or restarting services. The documented environment uses nginx, /var/www/travelco, PM2 and MongoDB in Docker, but actual paths and process names must be checked on the host.

### A. Pre-deployment gate

1. Identify the exact commit approved for release and confirm its GitHub checks.
2. Review the diff; keep unrelated UI and infrastructure changes out of the release.
3. Run backend tests, the production dependency audit and frontend production build.
4. Deploy to staging first, where available.
5. Back up the database and verify restore on a separate non-production target.
6. Record the current live version and a known-good rollback target.
7. Confirm SSH access, disk space and the release/maintenance window.

### B. Inspect EC2

Connect with the approved SSH key and verified host:

~~~bash
# Read-only checks; verify the host before making changes.
hostname
df -h
pm2 status
docker ps
sudo nginx -t
sudo nginx -T
~~~

In the nginx output, confirm the actual document root and proxy destinations for /api/ and /socket.io/. Confirm the PM2 process name and working directory. Check MongoDB persistence and authentication without printing secrets.

Do not assume a process name, container name or live path from this README alone.

### C. Build the frontend locally

On Windows PowerShell, from the repository folder:

~~~powershell
cd frontend
npm ci
$env:REACT_APP_API_URL = "https://<current-cloudfront-domain>/api"
npm run build
~~~

Replace the placeholder with the verified domain. For local development, use http://localhost:5000/api. If your checkout does not have a package lock, follow the project's package manager workflow rather than forcing npm ci.

Verify the build and API URL before upload. Never put server-side secrets in the frontend environment.

### D. Upload to a staging directory

Upload the generated build folder to a **new, uniquely named staging folder**, not directly over the currently served files.

~~~powershell
scp -i <path-to-key.pem> -r build ubuntu@<verified-ec2-host>:~/staging-<release-id>
~~~

Replace all placeholders. Confirm the upload completed and inspect permissions. Compare the staged build with nginx's configured document root before publishing.

### E. Publish the frontend

First verify whether nginx's configured root is a regular directory or a symlink-based release path.

- Keep the current build as a recoverable backup.
- Prefer versioned release directories and a tested atomic switch where the nginx layout supports it.
- If the current layout is a regular directory, test the copy and restore procedure in staging before production.
- Do **not** blindly run recursive deletion or a generic rsync --delete against the live document root.
- Run sudo nginx -t before reloading nginx.
- Check the live site immediately for missing assets, routing failures and browser console errors.

The repository cannot determine the live filesystem state, so it intentionally does not provide a destructive one-line publish command.

### F. Release the backend

- Confirm the running PM2 process, working directory and approved application commit.
- Keep the production .env outside version control with restricted permissions.
- Install from the lockfile in a staging/release directory where supported; do not overwrite the running directory blindly.
- Do not change MongoDB topology, run index migrations or alter production data as an incidental part of an application release.
- Restart or switch PM2 only through the verified procedure for the current host.
- Use pm2 status and pm2 logs with the verified process name to inspect health. Avoid logging secrets or personal data.
- Confirm Socket.IO, outbound integrations and booking workflows after switching the API.

Only use the process name travelco-api if pm2 status confirms it is still correct.

### G. Verify CloudFront

After the host is healthy, test through the public CloudFront URL, not only through EC2. Review:

- correct origin hostname and protocol;
- HTTP-to-HTTPS viewer redirect;
- appropriate allowed methods for API requests;
- no stale caching of authenticated/API responses;
- forwarding of required headers, cookies and query strings;
- /api/ routing and Socket.IO WebSocket upgrade behavior;
- upload behavior and CloudFront 4xx/5xx responses.

Do not change origin settings, open ports, disable protections or relax upload limits based on guesswork. Compare CloudFront, nginx and application logs to find where a request fails.

## Smoke tests and rollback

### Post-release smoke tests

- [ ] CloudFront homepage loads over HTTPS.
- [ ] React routes and JS/CSS assets load with correct content types.
- [ ] /health/live responds as expected and /health/ready reports dependency readiness.
- [ ] Sign-in, sign-out and configured password recovery/verification work.
- [ ] Admin APIs reject users without the correct role.
- [ ] Hotel, room, vehicle and other supported booking flows validate dates and input.
- [ ] Repeated booking submissions do not create unintended duplicates.
- [ ] Allowed images upload; disallowed files fail safely.
- [ ] Socket.IO works through CloudFront/nginx.
- [ ] Email, flight, weather and other enabled integrations are checked.
- [ ] Logs show no sustained increase in errors, latency or database failures.

### Rollback plan

1. Stop further changes and capture the release ID and error evidence.
2. Restore the last known-good frontend/backend release using the tested switch procedure.
3. Restart or switch the backend only if needed; confirm PM2 and health endpoints.
4. Verify CloudFront, nginx, application and database behavior.
5. Inspect whether a schema, index or data migration occurred; application rollback does not necessarily reverse database changes.
6. Record the cause and add a staging regression test before trying again.

Keep database migrations separate from unrelated UI/API releases. A backup is only useful if restoration has been tested.

## Monitoring and troubleshooting

The deployment notes mention CloudWatch CPU/status alarms and SNS email alerts. Verify the alarms and subscriptions in AWS; documentation alone is not proof they exist.

### Monitoring checklist

Tune alarms to the real instance type and traffic baseline:

- EC2 instance status-check failures.
- Sustained high CPU and low disk space.
- CloudFront/nginx 4xx and 5xx trends, including upload 403s and origin errors.
- API error rate and latency.
- PM2 restarts and backend health-check failures.
- MongoDB disconnects, container restarts, volume growth and backup freshness.
- Reservation conflicts and compensation/rollback errors.
- SES delivery, bounce and rejection behavior.
- SNS delivery tests and confirmation of intended recipients.

### Troubleshooting

| Symptom | Investigate first |
|---|---|
| CloudFront site is unavailable | Distribution/origin status, EC2 checks, Security Group, nginx and logs |
| Blank page or Unexpected token '<' on JS | Browser network tab, asset URLs, nginx root and static-file permissions; JS requests should not return index.html |
| API returns 502/504 | nginx upstream, PM2 state, local port 5000, backend logs and dependency readiness |
| Browser reports CORS errors | Request Origin, CORS_ORIGINS, frontend build URL and backend logs |
| Socket.IO disconnects | nginx upgrade headers, CloudFront behavior, proxy timeouts and client/server paths |
| Image upload returns 403 | Compare CloudFront response with nginx/application logs; inspect upload and current distribution settings |
| Verification email rejected | SMTP credentials, SES region, sender verification and SES sandbox status |
| API works locally but fails through HTTPS | Check whether the React build contains an HTTP or incorrect API URL; rebuild with the verified HTTPS URL |
| Site down after EC2 stop/start | Confirm Elastic IP association, then inspect nginx, PM2, Docker and health endpoints |
| Database disconnects or disk fills | MongoDB/container logs, host disk/volume, connection settings and backup status |

Never post credentials, full connection strings, bearer tokens, session cookies or customer details in issues and screenshots.

## Security checklist

Before exposing a release to real users:

- [ ] Keep secrets in server-side settings or a secrets manager.
- [ ] Rotate provider keys that were ever committed; removing them from the latest source does not erase Git history.
- [ ] Restrict SSH to approved source IPs and use least-privilege IAM.
- [ ] Verify MongoDB authentication and ensure the database is not publicly reachable.
- [ ] Keep API and database ports closed to public inbound access; check the actual Security Group and host firewall.
- [ ] Restrict access to the EC2 origin so users cannot bypass intended CloudFront controls.
- [ ] Review end-to-end TLS and encrypt origin traffic before processing sensitive information.
- [ ] Restrict CORS to expected frontend origins.
- [ ] Verify server-side authorization for admin, finance, refund, user and booking endpoints.
- [ ] Validate uploaded file type, size and storage policy.
- [ ] Test backup/restore procedures and monitor disk usage.
- [ ] Run automated checks, dependency review and staging regression tests before deployment.

This project includes demo workflows and should not be treated as payment-ready or highly available without additional design, compliance, security and operational work.

## Hardening runbooks and contributions

- [Parts 1–10: baseline, diagnostics, secrets, proxy and session protections](docs/aws-hardening/PHASE_1_PARTS_1-10.md)
- [Parts 11–20: headers, rate limits, uploads, validation and booking safeguards](docs/aws-hardening/PHASE_2_PARTS_11-20.md)
- [Parts 21–35: compensation, optional cache, provider resilience, scaling, releases and monitoring](docs/aws-hardening/PHASE_3_PARTS_21-35.md)

### Important implementation limits

- The public hotel catalogue cache is disabled by default.
- Rate limits, keyed locks, caches and circuit breakers are process-local, not shared across multiple workers/instances.
- Best-effort reservation compensation is not an ACID transaction.
- Index/migration scripts require backup and staging validation before an operator runs them.
- Unit tests and CI do not replace browser, real-database concurrency, load, soak or AWS configuration tests.
- The validation workflow is not a verified deployment pipeline for the AWS account.

### Contribution workflow

1. Open an issue with the expected behavior and reproduction steps.
2. Create a branch from the current main branch and keep changes focused.
3. Add or update tests for changed behavior.
4. Run backend tests, frontend build and relevant dependency checks.
5. Open a pull request with scope, test results, operational impact and rollback notes.
6. Wait for review/CI and validate production-impacting changes in staging.
7. Never include secrets, personal data, production database dumps or unrelated generated files.

Keep UI/layout changes separate from AWS infrastructure changes unless both are explicitly required. Do not modify or deploy AWS resources merely because a pull request was merged.

## Roadmap

- [ ] Verify the live CloudFront distribution, origin, TLS and Security Group settings against this guide.
- [ ] Establish a repeatable staging-to-production release process with rollback.
- [ ] Automate backup freshness checks and tested restores.
- [ ] Verify CloudWatch/SNS alarm coverage and notification delivery.
- [ ] Move to managed database and shared upload storage after migration planning.
- [ ] Design distributed booking coordination before adding instances or PM2 workers.
- [ ] Add browser regression tests for authentication, booking, uploads and Socket.IO.
- [ ] Review payment, refund, tax and currency-settlement requirements before real transactions.

## License

Refer to the repository's [LICENSE](LICENSE) file for the applicable terms.
