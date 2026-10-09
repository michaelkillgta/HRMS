# HRMS — Enterprise Workforce & Biometric Management Platform

**HRMS** is a full-stack, enterprise-grade Human Resource Management System built with **Next.js 15**, **React 19**, and **TypeScript**, engineered for modern organizations seeking an all-in-one workforce intelligence hub.

Featuring strict **Role-Based Access Control (RBAC)**, the platform delivers zero-flash, personalized experiences for HR Administrators and Employee Self-Service portals. Key capabilities include:

- **AI Biometric Attendance & Geofencing**: Browser-based webcam face recognition with anti-spoofing HUD, live selfie matching, and GPS radius verification.
- **Workforce Directory & Lifecycle**: Complete employee record management with photo upload, profile enrollment, and one-click CSV/Excel import & export.
- **Payroll & Statutory Compliance**: Automated salary calculations, tax breakdowns (PF, ESI, TDS, PT), and printable salary slips.
- **Leave & Permission Workflows**: Real-time request submissions, multi-tier manager approvals, and automated balance tracking.
- **Service & Performance Management**: Employee tenure tracking, performance appraisals, goal management, digital HR letters, and resignation handover workflows.
- **Portable Persistence**: Built-in JSON database architecture (`data.json`) enabling zero-configuration deployment and offline portability.

Designed with an executive slate UI/UX, responsive layouts, and sub-second interactions, HRMS delivers a consumer-grade experience for enterprise operations.

---

## 🏗️ Architecture & Modules

```text
HR/
├── nextjs/                             # Modern Next.js 15 App Router Fullstack Application
│   ├── app/
│   │   ├── page.tsx                    # Executive Intelligence & Self-Service Dashboard
│   │   ├── access/page.tsx             # Role & Permission Matrix
│   │   ├── attendance/page.tsx         # Attendance Roster & Daily Logs
│   │   ├── departments/page.tsx        # Department & Team Management
│   │   ├── employees/page.tsx          # Employee Directory & Profile Cards
│   │   ├── leaves/page.tsx             # Leave Applications & Approvals
│   │   ├── letters/page.tsx            # Digital HR Letter Generator
│   │   ├── login/page.tsx              # Secure Dual-Role Authentication
│   │   ├── payroll/page.tsx            # Compensation & Salary Slips
│   │   ├── performance/page.tsx        # Goal Tracking & KPI Appraisals
│   │   ├── permissions/page.tsx        # Gate Passes & Hourly Permissions
│   │   ├── recruitment/page.tsx        # Job Postings & Candidate Pipeline
│   │   ├── resignations/page.tsx       # Separation & Relieving Lifecycle
│   │   ├── service/page.tsx            # Service Books & Career History
│   │   ├── settings/page.tsx           # Organization Configuration
│   │   ├── statmods/page.tsx           # Statutory Compliance Modules (PF/ESI/TDS)
│   │   └── api/                        # 17 Enterprise REST Endpoints
│   ├── components/                     # Reusable UI & Modal Components
│   │   ├── FaceAttendanceModal.tsx     # Biometric Camera & Anti-Spoofing Modal
│   │   ├── DashboardLayout.tsx         # Responsive Sidebar & Topbar Shell
│   │   ├── WeeklyTrendChart.tsx        # 7-Day Workforce Analytics Chart
│   │   ├── Avatar.tsx                  # Dynamic Photo / Initials Fallback
│   │   └── AdminGuard.tsx              # Role-Based Route Shield
│   ├── lib/
│   │   └── AuthContext.tsx             # Zero-Flash Synchronous Auth Context
│   └── data/                           # Atomic JSON Persistence
│       └── data.json
├── client/                             # Zero-Dependency Modular HTML5 Client
├── server/                             # Express-Compatible Microservice Server
└── public/                             # Public Assets & Neural Network Models
```

---

## 🚀 Getting Started

### Next.js Production Mode (Recommended)
```bash
cd nextjs
npm install
npm run build
npm start
```
Visit [http://localhost:3000](http://localhost:3000).

### Next.js Development Mode
```bash
cd nextjs
npm install
npm run dev
```

---

## 🔐 Credentials & Default Logins

| Role | Username | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **HR Administrator** | `admin` | `admin123` | Full Administrative Privileges & All 15 Modules |
| **Employee Self-Service** | `EMP001` | `emp123` | Personal Attendance, Leaves, Payslips & Performance |

---

## 🛡️ License
Private & Proprietary. All rights reserved.
