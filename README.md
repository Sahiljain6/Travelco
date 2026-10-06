# Travelco 🌍✈️ — Comprehensive Tourism & Travel Management System

[![Live Demo](https://img.shields.io/badge/Live%20Demo-travelxco.netlify.app-blue?style=for-the-badge&logo=netlify)](https://travelxco.netlify.app/)
[![MERN Stack](https://img.shields.io/badge/Stack-MERN-green?style=for-the-badge&logo=mongodb)](https://github.com/Sahiljain6/Travelco)
[![Node.js](https://img.shields.io/badge/Node.js-18.x-brightgreen?style=for-the-badge&logo=node.js)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.x-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org/)

**Travelco** is a modern, full-stack enterprise travel and tourism platform built using the **MERN (MongoDB, Express.js, React.js, Node.js)** architecture. It unifies tour packages, hotel reservations, vehicle rentals, train/flight seat bookings, restaurant table reservations, and special activity bookings into a single ecosystem with role-based administrative workflows, financial health tracking, and real-time messaging.

---

## 🌐 Live Deployments

- **Frontend Application:** [https://travelxco.netlify.app/](https://travelxco.netlify.app/)
- **Backend API Service:** Deployed on [Railway](https://railway.app/)
- **Database:** [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) Multi-Cloud Cluster

---

## 🏗️ System Architecture

Travelco follows a decoupled **Client-Server Architecture** communicating over a RESTful API and WebSocket channels:

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT LAYER (Frontend)                  │
│  React 18 SPA • React Router v6 • Tailwind CSS • Context API │
│  Hosted on Netlify (CDN Edge)                               │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTPS (REST) / WSS (Socket.io)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                    SERVER LAYER (Backend)                   │
│  Node.js • Express.js REST API • JWT Auth • Socket.io Engine │
│  Hosted on Railway                                          │
└──────────────┬──────────────────────────────┬───────────────┘
               │                              │
               ▼                              ▼
┌──────────────────────────────┐┌─────────────────────────────┐
│       DATABASE LAYER         ││      EXTERNAL SERVICES      │
│  MongoDB Atlas (Cloud DB)    ││  Cloudinary (Image Storage) │
│  Mongoose ODM (27+ Models)   ││  Nodemailer (Email Service) │
└──────────────────────────────┘└─────────────────────────────┘
```

---

## 💡 How the MERN Stack is Implemented

### 1. 🍃 MongoDB (Data Layer)
- **ODM:** Uses **Mongoose** for data modeling, schema validation, and lifecycle hooks.
- **Relational Integrity in NoSQL:** References across collections via `ObjectId` (e.g., Rooms referencing Hotels, Reservations referencing Users and Vehicles).
- **27+ Schemas & Collections:**
  - `User`, `Hotel`, `Room`, `HotelReservation`
  - `Vehicle`, `VehicleReservation`
  - `Tour`, `TourBook`, `TourCustomForm`
  - `Train`, `SeatBooking`, `FlightSeatBooking`
  - `Restaurant`, `RestaurantType`, `RestaurantDistrict`, `RestaurantReservation`, `RestaurantRate`
  - `SpecialActivity`, `SpecialActivityType`, `Reservation`
  - `Employee`, `Salary`, `FinanceHealth`, `Refund`
  - `Chat`, `Message`

### 2. ⚡ Express.js (API & Middleware Layer)
- **Modular REST Routing:** Separation of concerns using dedicated route handlers for every domain (`/api/auth`, `/api/hotels`, `/api/train`, `/api/vehicle`, `/api/tours`, etc.).
- **Security & Session Handling:**
  - `jsonwebtoken (JWT)` authentication tokens for protected routes.
  - Custom `verifyToken` middleware checking authentication and role authorization (`isAdmin`, `financeManager`).
  - `bcryptjs` password hashing with salt generation.
  - CORS middleware allowing secure cross-origin communication between Netlify and the backend API.
- **Payload Handling:** `body-parser` and `express.json` with 50MB limit to handle media and document payloads.
- **Static Asset Serving:** Express static file endpoints for local image fallbacks.

### 3. ⚛️ React.js (Presentation Layer)
- **Component Hierarchy:** Modular and reusable component architecture (Navbar, AdminNavbar, Sidebar, Datatables, Hero components, Search bars).
- **Global State Management:** React `Context API` (`AuthContext`) managing user login sessions, roles, and token storage across page reloads using browser storage.
- **Routing & Protected Views:** `react-router-dom` v6 for Single-Page Application (SPA) navigation with client-side route guards.
- **Design & UI System:**
  - **Tailwind CSS** & **Material Tailwind** for responsive layouts.
  - **SweetAlert2** & **React Hot Toast** for interactive user feedback.
  - **MUI (Material UI)** & `@mui/x-data-grid` for administrative data tables.
  - **Recharts** for visual financial health dashboards and salary charts.
  - **jsPDF & jspdf-autotable** for client-side invoice and ticket PDF generation.

### 4. 🚀 Node.js (Runtime & Real-Time Engine)
- Asynchronous, event-driven runtime handling concurrent booking transactions.
- **Socket.io Integration:** Embedded WebSocket server directly on the Express HTTP instance enabling live bidirectional chat communication between clients and support agents.

---

## 📦 Core Modules & Services

### 1. 🔐 User & Authentication Service
- Multi-role registration (Traveler, Admin, Finance Manager).
- Cloudinary profile picture uploads with automatic URL generation.
- Secure login with JWT issuing and password encryption.
- Forgot/Reset password workflow via token verification.

### 2. 🏖️ Tour Package Management
- Tour package exploration with destination filters, duration, and price points.
- Itinerary details with inclusion/exclusion breakdown.
- Custom tour request forms tailored to customer preferences.

### 3. 🏨 Hotel & Room Reservation
- Multi-hotel directory with amenities, ratings, and location filters.
- Real-time room availability calendar and selection.
- Room booking with dynamic price computation.

### 4. 🚗 Vehicle Reservation System
- Fleet catalog (Sedans, SUVs, Vans, Luxury) with rental pricing and specs.
- Date-range reservation engine with automated total calculation.

### 5. 🚆 Train & Flight Booking System
- Train schedule lookup with class options (1st, 2nd, 3rd class).
- Interactive seat selection and passenger details management.
- Instant printable ticket generation in PDF format.

### 6. 🍽️ Restaurant Reservation
- Filtering restaurants by district, cuisine type, and operational hours.
- Table reservation system with slot management and user ratings.

### 7. 🎯 Special Activities & Events
- Outdoor activities, safaris, and adventure bookings.
- Administrative review and approval workflow for event requests.

### 8. 📊 Finance, Payroll & Refunds
- Comprehensive financial health tracking (revenue vs. expenses).
- Employee payroll calculation and automated salary sheet generation.
- Customer refund request intake with administrative approval/rejection.

### 9. 💬 Real-Time Chat System
- One-on-one and administrative messaging powered by Socket.io.

---

## 🛠️ Technology Stack Overview

| Category | Technology |
|---|---|
| **Frontend** | React 18, React Router v6, Tailwind CSS, Material Tailwind, MUI DataGrid, Axios |
| **Backend** | Node.js, Express.js, Socket.io, Multer, Nodemailer, Bcrypt.js, JWT |
| **Database** | MongoDB Atlas, Mongoose ODM |
| **Cloud Storage** | Cloudinary API |
| **Reporting & Export** | jsPDF, JSPDF-AutoTable, Recharts |
| **Deployment** | Netlify (Frontend), Railway (Backend & API) |

---

## ⚙️ Local Development Setup

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 recommended)
- [Git](https://git-scm.com/)
- [MongoDB Atlas](https://www.mongodb.com/) account or local MongoDB instance

### 1. Clone the Repository
```bash
git clone https://github.com/Sahiljain6/Travelco.git
cd Travelco
```

### 2. Configure Backend
```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
```

Start the backend:
```bash
npm run dev     # Starts with nodemon for development
# OR
npm start       # Starts standard Node process
```

### 3. Configure Frontend
Open a new terminal:
```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend/` directory (optional for local):
```env
REACT_APP_API_URL=http://localhost:5000/api
```

Start the React development server:
```bash
npm start
```
The application will launch at `http://localhost:3000`.

---

## 🔒 Environment Variables Reference

### Backend (`backend/.env`)
| Variable | Description |
|---|---|
| `PORT` | Listening port for Express (Default: `5000`) |
| `MONGO_URI` | MongoDB Atlas or local connection URI |
| `JWT_SECRET` | Secret key used to sign and verify JSON Web Tokens |

### Frontend (`frontend/.env` or Netlify Environment)
| Variable | Description |
|---|---|
| `REACT_APP_API_URL` | Base URL of the deployed backend API (e.g., `https://your-railway-app.up.railway.app/api`) |
| `CI` | Set to `false` for CI build runners (configured in `netlify.toml`) |

---

## 📄 License
This project is licensed under the ISC License.
