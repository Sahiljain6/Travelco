# Travelco demo dataset and Faker seed

This directory contains a compact, developer-focused airport reference fixture derived from the CSV files provided for this task:

- airports.csv
- airport-frequencies.csv
- countries.csv
- regions.csv

The fixture is intentionally a small sample instead of the full 86,000+ row airport catalogue. It is enough to generate global destination variety while keeping this repository and routine test runs small. Verify the source licence and attribution terms before reusing or redistributing the original files elsewhere.

The uploaded map file was **not imported**. It only contains an OpenStreetMap error response saying the query ran out of memory; it has no usable feature records.

## What the seeder creates

Run npm run seed:demo from the backend directory to generate synthetic catalogue content with Faker and import the compact reference sample.

| Target | Contents |
|---|---|
| Existing Hotel model | Approved demo hotels using varied airport-linked cities/countries |
| Existing Room model | Valid room types connected to the seeded hotels by their room ID lists |
| Existing Tour model | Synthetic tours and descriptions |
| Existing Vehicle model | Synthetic, approved fleet listings with valid capacities and prices |
| Existing Train model | Clearly labelled fictional QA train fixtures on common Indian city pairs |
| travelco_demo_countries | Reference country sample |
| travelco_demo_regions | Reference region sample |
| travelco_demo_airports | Airport identity/location reference sample |
| travelco_demo_airport_frequencies | Selected radio-frequency reference records |

The new airport collections are **reference-only**. They do not power the current flight search or create flights, routes, live availability, or bookable schedules. The website's existing flight-provider path remains unchanged.

No test users, passwords, hotel/vehicle/tour reservations, refunds, finance records, or restaurant records are generated. Those modules have important ownership and reference relationships; they should be tested through purpose-built fixtures or the app's normal user workflow rather than by creating orphaned records.

Images use deterministic Picsum URLs. They require an internet connection in the browser and are not bundled image assets.

## Safety behavior

- The script is separate from the existing backend/seed.js script. That existing script deletes all records in selected collections and should not be used as a general-purpose demo-data importer.
- The new seeder **never calls deleteMany or deletes records**.
- Seeded catalogue documents use deterministic IDs. Re-running the script upserts only records owned by this fixture, so normal app records with different IDs are not overwritten.
- Airport references use dedicated travelco_demo_* collections, rather than changing the live flight integration.
- The script refuses to run with NODE_ENV=production.
- It also requires explicit ALLOW_TRAVELCO_DEMO_SEED=true consent and a database name containing a clear dev, test, staging, sandbox, demo, or local marker.
- Run it against a separate disposable development/staging database. A database name check is an extra guard, not a substitute for checking MONGO_URI.

## How to run it safely

Create an isolated database first, for example travelco_demo. Never point the command at the production database.

### Windows PowerShell

~~~powershell
cd backend
npm install

$env:NODE_ENV = "development"
$env:MONGO_URI = "mongodb://127.0.0.1:27017/travelco_demo"
$env:ALLOW_TRAVELCO_DEMO_SEED = "true"
$env:TRAVELCO_DEMO_SCALE = "small"
$env:TRAVELCO_DEMO_SEED = "20261019"

npm run seed:demo
~~~

Change the URI only after you have confirmed that it names an isolated development/staging database. With MongoDB Atlas, use a dedicated non-production database name in the URI and a test database user with permissions scoped to that database.

Available scales:

| TRAVELCO_DEMO_SCALE | Hotels | Rooms (approx.) | Tours | Vehicles | Trains |
|---|---:|---:|---:|---:|---:|
| small (default) | 8 | 16–24 | 8 | 8 | 8 |
| standard | 30 | 60–90 | 30 | 25 | 20 |
| load | 100 | 200–300 | 100 | 100 | 50 |

The load scale is for an isolated test database only. It is not a production load test and should not be run against the public website.

The seeder logs a summary with the target database name and number of upserts. It does not log the MongoDB URI or credentials.

## Test and browse the results

Run checks before and after seeding:

~~~bash
cd backend
npm test
npm run audit:production
~~~

Then run npm start and browse the app locally with its API URL and environment settings pointed at the same travelco_demo database. Verify the public hotel/tour/vehicle/train catalogue, hotel room loading, filters and price formatting. Some images may be unavailable because they are external placeholders.

This gives you a **functional QA dataset**, not proof of production readiness. Booking concurrency, authentication/authorization, payments, email delivery, provider failures and performance/load tests need their own controlled test setup.

To reset a disposable dataset, the safest beginner workflow is to create a fresh, separate development database. Do not manually clear collections or run destructive scripts in production.
