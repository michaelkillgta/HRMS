# R & A Associates HRMS – Tech Stack & Architecture

A modernized, modular Human Resource Management System (HRMS) with facial recognition attendance, employee self-service (ESS), leave tracking, and payroll compliance.

---

## 🏗️ Architecture Overview

The codebase has been refactored from a single monolithic file into a **clean, decoupled, production-ready tech stack** while preserving 100% of the UI design, styles, biometrics, and business logic.

```
HR/
├── client/                     # Clean, Modular Frontend
│   ├── css/                    # Modular Stylesheets
│   │   ├── variables.css       # Design tokens, color palette, typography
│   │   ├── layout.css          # Shell, sidebar, topbar, responsive grid
│   │   ├── components.css      # Cards, tables, forms, buttons, badges
│   │   ├── modals.css          # Responsive popups & camera modal
│   │   └── style.css           # Master aggregated stylesheet
│   ├── js/                     # Modular JavaScript
│   │   ├── config.js           # Storage keys, avatars, uid generator
│   │   ├── storage.js          # Persistence layer & /api/state sync
│   │   ├── faceApi.js          # Face-api detection & verification service
│   │   ├── biometrics.js       # WebAuthn fingerprint & mobile biometrics
│   │   └── app.js              # Application router & runtime
│   └── index.html              # Clean 600-line shell (was ~5,900 lines)
│
├── server/                     # Backend API & Server
│   ├── src/
│   │   ├── config.js           # Environment & path configs
│   │   ├── db.js               # Persistence manager with atomic writes
│   │   ├── routes/
│   │   │   ├── state.routes.js # REST state synchronization
│   │   │   └── api.routes.js   # API endpoints
│   │   └── app.js              # HTTP request dispatcher & CORS handler
│   └── server.js               # Express-compatible server entry
│
├── public/                     # Static Public Assets
│   ├── faceapi/                # Neural net weights & face-api.js library
│   │   ├── model/              # Tiny Face Detector, Landmarks, Recognition
│   │   └── face-api.js
│   ├── manifest.webmanifest    # PWA configuration
│   └── sw.js                   # Service worker for offline caching
│
├── nextjs/                     # Next.js Fullstack Option (App Router)
│   ├── app/
│   │   ├── layout.jsx          # Root layout with fonts & sidebar
│   │   ├── page.jsx            # Interactive React Dashboard
│   │   ├── employees/page.jsx  # Employee Directory
│   │   ├── attendance/page.jsx # Attendance Logs
│   │   ├── api/state/route.js  # App Router API endpoint
│   │   └── globals.css         # Complete HRMS styles
│   ├── components/
│   │   ├── Sidebar.jsx         # React navigation sidebar
│   │   └── FaceAttendanceModal.jsx # Client-only face-api biometric modal
│   └── package.json            # Next.js dependencies
│
├── data/                       # Persistent JSON Database
│   └── data.json
│
├── index.html                  # Legacy fallback file (preserved intact)
├── server.js                   # Root launcher (delegates to server/server.js)
└── package.json                # Root package configuration
```

---

## 🚀 How to Run

### Standard Modular Server (Recommended - Zero Dependencies)
Run directly with Node.js:
```bash
npm start
# or
node server.js
```
Then visit **`http://localhost:3000`** in your browser.

### Next.js Mode
If you prefer running the Next.js React App Router version:
```bash
cd nextjs
npm install
npm run dev
```
Then visit **`http://localhost:3000`**.

---

## 🔒 Biometrics & Face Recognition
* Pre-trained neural network weights are hosted statically under `/public/faceapi/model/`:
  * **Tiny Face Detector**: Fast client-side face boundary box detection.
  * **68 Facial Landmarks**: Face alignment and pose normalization.
  * **Face Recognition**: 128-dimensional embedding extraction for 1:1 facial identity matching.
* Works seamlessly in modern browsers with WebGL/Canvas acceleration.
* In Next.js, the `FaceAttendanceModal` runs strictly on the client (`'use client'`) to prevent server-side rendering conflicts.

---

## 💾 Database & State Persistence
* All HRMS data (employees, leaves, attendance punches, payroll runs, statutory configs) is managed through `server/src/db.js`.
* State is persisted using **atomic writes** (`data.json.tmp` -> `data.json`), preventing file corruption during power outages or unexpected crashes.
