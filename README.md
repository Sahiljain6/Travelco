# Travelco 🌍✈️ — Travel & Tourism Management Platform

Travelco is a full-stack travel and tourism web application that brings trip planning and booking workflows together in one place. Travelers can explore destinations and listings, while administrators can manage services, customer requests, and operational workflows.

<p align="left">
  <a href="https://travelxco.netlify.app/"><img src="https://img.shields.io/badge/Live%20Demo-Open%20Travelco-0A7EA4?style=for-the-badge&logo=netlify" alt="Live demo"></a>
  <img src="https://img.shields.io/badge/Frontend-React%2018-61DAFB?style=for-the-badge&logo=react" alt="React 18">
  <img src="https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-339933?style=for-the-badge&logo=nodedotjs" alt="Node.js and Express">
  <img src="https://img.shields.io/badge/Database-MongoDB-47A248?style=for-the-badge&logo=mongodb" alt="MongoDB">
</p>

> **Live application:** [travelxco.netlify.app](https://travelxco.netlify.app/)  
> **Repository:** [Sahiljain6/Travelco](https://github.com/Sahiljain6/Travelco)

## Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Run Locally](#run-locally)
- [Environment Configuration](#environment-configuration)
- [Roles and Access](#roles-and-access)
- [Deployment](#deployment)
- [Security and Production Notes](#security-and-production-notes)
- [AWS Hardening and Operations](#aws-hardening-and-operations)
- [Roadmap](#roadmap)
- [License](#license)

## Overview

Travelco uses the MERN stack (MongoDB, Express.js, React, and Node.js) to provide a central platform for travel discovery and booking-related workflows. It includes destination, tour, accommodation, transport, restaurant, and activity modules, together with administrative tools for managing listings and service operations.

The interface supports international destination discovery. Listing records can include country and currency information, and prices can be formatted using locale-aware currency formatting. Sample listings across multiple countries are for demonstration and development only; they should not be interpreted as verified, bookable real-world inventory.

## Features

### Traveler experience

- **Authentication:** registration and sign-in, JWT-based protected routes, and password recovery workflows.
- **Hotels and rooms:** browse listings, review details and amenities, and follow room reservation workflows.
- **Vehicle rentals:** explore vehicles and submit date-range bookings.
- **Tours:** browse packages and itineraries, with options to submit custom tour requests.
- **Trains and flights:** search configured schedules, select seats where supported, manage passenger details, and generate printable ticket PDFs.
- **Restaurants:** filter listings by location or cuisine and use table reservation workflows.
- **Activities and events:** discover special activities and submit booking requests.
- **International discovery:** country and destination browsing with listing-level location and currency fields.
- **Customer support:** submit enquiries and use in-app messaging features where configured.

### Administration and operations

- Manage hotel, room, vehicle, and tour listings.
- Review customer enquiries and special-activity requests.
- Manage user and role-related workflows.
- View financial-health and payroll dashboards.
- Review refund requests and track operational records.

### Platform capabilities

- REST API built with Express.
- Real-time messaging using Socket.IO.
- Image uploads with Cloudinary integration and local fallbacks where configured.
- Email workflows using Nodemailer and SMTP.
- PDF ticket and invoice generation using jsPDF.
- Data visualization using Recharts and administrative tables using MUI Data Grid.

Feature availability depends on application configuration, database records, and external-provider credentials. The README does not imply that every provider-backed feature or real-world booking is enabled in every deployment.

## Technology Stack

| Area | Technologies |
|---|---|
| Frontend | React 18, React Router v6, Axios, Tailwind CSS, Material Tailwind, Material UI / MUI Data Grid |
| Backend | Node.js, Express.js, Socket.IO, Multer, Nodemailer |
| Authentication | JSON Web Tokens (JWT), bcryptjs |
| Database | MongoDB, Mongoose ODM |
| Media | Cloudinary and configured local-upload support |
| Reports and charts | jsPDF, jspdf-autotable, Recharts |
| Hosting | AWS CloudFront + EC2/nginx + PM2 and MongoDB in Docker (per the AWS deployment report) |

## Architecture

Travelco follows a client-server architecture. The React single-page application communicates with the Express API over HTTP and with the Socket.IO service for real-time messaging. The active AWS deployment documented in the project report uses CloudFront in front of an Ubuntu EC2 host running nginx, a React build, Node.js/Express under PM2, and MongoDB in Docker on that same host. Confirm the live console settings before applying any infrastructure change.

```text
┌──────────────────────────────┐
│ Browser: React UI            │
│ Existing layout and routes   │
└──────────────┬───────────────┘
               │ HTTPS
               ▼
┌──────────────────────────────┐
│ Amazon CloudFront             │
│ Viewer TLS / CDN              │
└──────────────┬───────────────┘
               │ Origin traffic
               ▼
┌────────────────────────────────────────┐
│ Amazon EC2 — Ubuntu                    │
│ nginx                                  │
│  ├─ React build: /var/www/travelco      │
│  ├─ /api and Socket.IO → localhost:5000 │
│  └─ Node.js / Express under PM2         │
│                                        │
│ MongoDB in Docker, bound to loopback    │
└────────────────────────────────────────┘

Supporting services noted in the AWS report:
SES · IAM · CloudWatch · SNS · S3
```

The report describes the CloudFront-to-origin connection as HTTP and MongoDB as sharing the EC2 host. Origin encryption/access restrictions, database isolation, backups, and failover are operational topics; repository code changes do not configure AWS resources.

### Main data domains

The backend contains models for users, hotels and rooms, reservations, vehicles, tours, train and flight bookings, restaurants, special activities, employees, salaries, financial records, refunds, chats, and messages. Refer to the source tree for the current model and route names.

## Project Structure

The repository includes the frontend, backend, and project documentation. A simplified overview:

```text
Travelco/
├── backend/       # Express API, models, controllers, routes and middleware
├── frontend/      # React application and UI components
├── Charter/       # Project charter documents
├── Proposal/      # Project proposal
├── Final Report/  # Project report
├── Procfile       # Process definition for supported hosts
├── nixpacks.toml  # Nixpacks build configuration
├── netlify.toml   # Netlify configuration
└── LICENSE
```

Exact folders may change as the project evolves.

## Run Locally

### Prerequisites

- [Node.js](https://nodejs.org/) (version 18 recommended)
- [Git](https://git-scm.com/)
- A [MongoDB Atlas](https://www.mongodb.com/atlas) cluster or local MongoDB instance

### 1. Clone the repository

```bash
git clone https://github.com/Sahiljain6/Travelco.git
cd Travelco
```

### 2. Install and start the backend

```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory and add the configuration required by the backend (see [Environment Configuration](#environment-configuration)). Then start the server using the script defined by the backend package:

```bash
npm run dev
```

If the project does not define a `dev` script in your current checkout, inspect `backend/package.json` and use its available development or start script. The API commonly uses port `5000`, subject to the configured `PORT`.

### 3. Install and start the frontend

Open another terminal:

```bash
cd frontend
npm install
```

Create `frontend/.env` if needed:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

Start the frontend:

```bash
npm start
```

The React development server typically opens at [http://localhost:3000](http://localhost:3000). Confirm the actual scripts and required environment variables in the relevant package files if your branch differs.

## Environment Configuration

Never commit secrets, access tokens, or production `.env` files. Configure secrets in your local environment or hosting provider's secret/settings dashboard.

### Backend variables

The backend may use the following variables, depending on the enabled modules:

| Variable | Purpose |
|---|---|
| `PORT` | Port for the Express server (commonly `5000`) |
| `MONGO_URI` | MongoDB connection URI |
| `JWT_SECRET` or the secret name used by the current backend | Secret for signing/verifying JWTs; check the authentication code for the exact name |
| `FRONTEND_URL` | Public frontend URL used in links or email workflows |
| `CORS_ORIGINS` | Allowed frontend origins, where supported |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE` | SMTP server configuration |
| `SMTP_USER`, `SMTP_PASS`, `MAIL_FROM` | SMTP authentication and sender details |
| `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | Cloudinary media uploads |
| `SKYSCANNER_RAPIDAPI_KEY` | Optional flight search provider key, if flight search is enabled |
| `OPENWEATHER_API_KEY` | Weather integration, if enabled |
| `DRIVER_DAILY_FEE` | Optional driver-related fee for vehicle bookings, if supported by the backend |

Use the exact variable names expected by your current code and any provided `.env.example`. Do not copy example values into production without verifying them.

### Frontend variables

| Variable | Purpose |
|---|---|
| `REACT_APP_API_URL` | Base URL for the backend API |
| `REACT_APP_MAPTILER_API_KEY` | Optional map tile key, if maps are enabled |

Create or update frontend environment variables before building the app. In Create React App, `REACT_APP_*` values are embedded into the browser bundle and are **not secret**. Never place private provider credentials in frontend variables.

## Roles and Access

The app documents traveler and administrative workflows, including finance-related permissions. Public registration should create a standard traveler account; privileged roles should only be granted through a secure, authorized process.

Before release, verify permissions for each role against the actual backend middleware and routes. Do not grant administrative access by exposing a public endpoint or by trusting role values supplied by the browser.

## Deployment

The AWS deployment report documents:

- **Viewer/CDN:** Amazon CloudFront
- **Application host:** Ubuntu on Amazon EC2, with nginx serving the React build and proxying API/Socket.IO traffic
- **API process:** Node.js/Express supervised by PM2
- **Database:** MongoDB in Docker on the same EC2 host, bound to loopback
- **Supporting services:** SES, IAM, CloudWatch, SNS, and an S3 bucket that is not currently the website origin in that report

The README previously referenced Netlify and Railway; treat those links as legacy/demo documentation unless you have separately verified that they are still active production components. The CloudFront/EC2 description reflects the provided AWS report, not a live inspection of the AWS console.

Do not apply an infrastructure configuration from this README without confirming the actual resources and origin path. Before a release, verify backup/restore and application rollback, then test sign-in, API connectivity, uploads, email workflows, booking validation, role-based access, Socket.IO, health checks, and provider-dependent features.

## Security and Production Notes

- Use a long, unique JWT signing secret and store it only in backend environment settings.
- A flight-provider key was previously committed in source. **Revoke or rotate it in the provider dashboard.** Removing a key from the latest source does not remove it from Git history.
- Keep MongoDB credentials, SMTP passwords, Cloudinary secrets, and third-party API keys out of source control and frontend bundles.
- Restrict CORS to the expected frontend origins and configure secure cookies or token handling according to the application's authentication design.
- Ensure server-side validation and authorization for bookings, totals, refunds, and administrative actions.
- Development/demo listings are not verified real-world inventory. Do not run destructive seed scripts against production data.
- The deployment described by prior project notes may not have HTTPS configured end-to-end. Verify the live setup and enable HTTPS before processing real customer information.
- Run the repository's available build checks and tests, then manually verify anonymous, traveler, business-owner (if enabled), finance, and administrator access paths.

## AWS Hardening and Operations

The staged hardening work is tracked in these runbooks:

- [Parts 1–10: AWS baseline, diagnostics, secrets, proxy and session protections](docs/aws-hardening/PHASE_1_PARTS_1-10.md)
- [Parts 11–20: headers, rate limits, upload/query protections, idempotency and booking contention](docs/aws-hardening/PHASE_2_PARTS_11-20.md)
- [Parts 21–35: transactions, caching, external-provider resilience, scaling, deployment, and monitoring](docs/aws-hardening/PHASE_3_PARTS_21-35.md)

These controls are designed to preserve the React UI. Some runtime controls are active once merged; public-catalog caching remains opt-in. Run the backend tests and frontend production build, then validate all booking, authentication, upload, and Socket.IO workflows in staging before production release. Several AWS-console tasks and any replica-set/transaction or multi-instance changes require separate operator action; they are not performed by GitHub code changes.

## Roadmap

- [ ] Verify and document the current production deployment and HTTPS configuration.
- [ ] Add or expand automated tests for booking validation and authorization.
- [ ] Add a CI pipeline for repeatable build and syntax checks.
- [ ] Review and document external provider integrations and their limitations.
- [ ] Improve frontend code splitting and initial-load performance.
- [ ] Complete production payment, refund, tax, and currency-settlement integrations before enabling real transactions.

## License

This project includes a `LICENSE` file. Check that file for the governing license; the README and repository metadata should agree on the license designation.
