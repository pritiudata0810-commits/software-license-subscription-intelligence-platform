# Software License & Subscription Intelligence Platform (LicenseIQ)

**Course:** Field Engineering Project (FEP)  
**Department:** Computer Engineering  
**Guide:** Mr. Ajit Chavan  
**Team Members:**
1. **Yamgar Shreyasi** (Person 1: User, Software & License Management, Auth & RBAC)
2. **Shaikh Alfiya** (Person 2: Usage & Cost Analytics, Savings Estimation, Formulas)
3. **Sonawane Shrawani** (Person 3: AI Intelligence, Explainable Recommendations, Health Score)
4. **Jadhav Suraj** (Person 4: Renewal Management, Risk & Alerts, Approval Workflows)
5. **Udata Priti** (Person 5: Executive Dashboard, Data Visualizations, PDF Reporting)

---

## 1. Project Overview
**LicenseIQ** is a production-grade, centralized enterprise SaaS license governance and subscription intelligence platform. It brings together all 5 team modules into **one unified application** backed by a persistent PostgreSQL database (Neon), deterministic mathematical calculations, and explainable AI optimization rules.

### Key Capabilities:
- **Single Integrated Platform:** Unified React/Next.js frontend, Node/Prisma backend, and Python analytics intelligence layer.
- **Enterprise Design System (GeneX Theme):** Deep Midnight Navy sidebar (`#0B192C`), crisp white/light canvas (`#F8FAFC`), elevated data cards, and responsive desktop/tablet/mobile layouts.
- **Explainable Recommendation Engine:** 5 deterministic rules analyzing seat utilization, upcoming renewals, and category tool redundancy.
- **0–100 License Health Score:** A documented, weighted scoring system factoring in utilization (35%), cost efficiency (25%), renewal readiness (20%), unused minimization (10%), and overlap safety (10%).
- **Interactive Visualizations & PDF Generator:** Real-time Recharts dashboards and one-click downloadable PDF audit reports via `jsPDF`.

---

## 2. Default Test Credentials

All accounts are pre-seeded with the password: `Password@123`

| Role | Email | Privileges |
|---|---|---|
| **Admin** | `admin@enterprise.com` | Full administrative control: CRUD software, vendors, licenses, assignments, departments, users, and audit logs. |
| **Manager** | `manager.eng@enterprise.com` | Departmental management: View dashboards, approve/reject software requests, allocate seats, view analytics and reports. |
| **Employee** | `alex.chen@enterprise.com` | Personal portal: View assigned licenses, submit software requests with smart unused pool pre-checks. |

---

## 3. Technology Stack

- **Frontend:** Next.js 14+ (App Router), React 18, TypeScript, Tailwind CSS, Lucide React Icons
- **Visualizations:** Recharts (Area, Bar, Stacked, and Donut charts)
- **Reporting:** jsPDF + jspdf-autotable
- **Backend:** Next.js Route Handlers + Node.js
- **Database & ORM:** Persistent PostgreSQL (Neon Database) + Prisma ORM v5.22.0
- **Analytics & Microservice:** Python 3 + FastAPI + Pandas + NumPy (`/python_service`) with native TypeScript parity fallback
- **Security:** bcryptjs password hashing (10 salt rounds), signed JWT tokens, secure HTTP-only cookies

---

## 4. Exact Mathematical Formulas & Business Rules

### Utilization Formula (Person 2):
$$\text{Utilization (\%)} = \left(\frac{\text{Active Assigned Licenses}}{\text{Total Purchased Licenses}}\right) \times 100$$
- Classifications: Excellent ($\ge 90\%$), Good ($75-89\%$), Moderate ($50-74\%$), Low ($25-49\%$), Critical ($<25\%$)

### Cost & Savings Formulas (Person 2):
- $\text{Monthly Expenditure} = \sum (\text{Total Licenses} \times \text{Cost per License})$
- $\text{Monthly Idle Waste} = \sum (\text{Unused Licenses} \times \text{Cost per License})$
- $\text{Potential Annual Savings} = \text{Monthly Idle Waste} \times 12$

### License Health Score (Person 3):
$$\text{Score (0–100)} = S_{\text{util}} (35) + S_{\text{cost}} (25) + S_{\text{renewal}} (20) + S_{\text{unused}} (10) + S_{\text{overlap}} (10)$$

### 5 Business Intelligence Rules:
1. **Rule 1 (Idle Seat Reduction):** If utilization &lt; 70% and unused seats &gt; 0, generate reallocation/reduction recommendation.
2. **Rule 2 (License Re-Use):** When an employee requests software, check the pool; if available seats &gt; 0, recommend allocating existing seats before buying new licenses.
3. **Rule 3 (Pre-Renewal Review):** If renewal is due within 30 days and utilization &lt; 70%, flag for contract adjustment.
4. **Rule 4 (High-Cost Optimization):** If software cost $\ge$ ₹30,000/mo and utilization &lt; 60%, trigger priority tier audit.
5. **Rule 5 (Overlap Detection):** If multiple active tools share the same category, flag potential duplicate subscriptions.

---

## 5. Local Setup & Execution

### Prerequisites:
- Node.js 20+
- npm

### Installation:
```bash
# 1. Install dependencies
npm install

# 2. Push Prisma schema to PostgreSQL
npx prisma db push

# 3. Seed realistic enterprise data
npm run prisma:seed

# 4. Start Next.js development server
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 6. Project Directory Structure

```
├── app/                     # Next.js App Router
│   ├── api/                 # REST API endpoints
│   │   ├── analytics/       # Utilization, cost & health score
│   │   ├── assignments/     # License seat allocations & revocation
│   │   ├── auth/            # Login, logout, me (JWT session)
│   │   ├── departments/     # Department budgets & spend
│   │   ├── licenses/        # License inventory pools
│   │   ├── recommendations/ # Explainable AI rule evaluation
│   │   ├── renewals/        # Expiration tracking & auto-renew
│   │   ├── requests/        # Software requests & approval workflow
│   │   ├── software/        # Software catalog CRUD
│   │   ├── users/           # Employee directory
│   │   └── vendors/         # Vendor supplier management
│   ├── dashboard/           # Executive Dashboard
│   ├── software/            # Software Catalog Page
│   ├── vendors/             # Vendor Management Page
│   ├── licenses/            # License Inventory Page
│   ├── assignments/         # Seat Allocations Page
│   ├── employees/           # Employee Directory Page
│   ├── departments/         # Department Budgets Page
│   ├── analytics/usage/     # Usage & Utilization Analytics
│   ├── analytics/costs/     # Financial Spend & Idle Waste
│   ├── renewals/            # Contract Renewals Page
│   ├── risk-alerts/         # Risk & Alert Center
│   ├── recommendations/     # AI Optimization Recommendations
│   ├── requests/            # Employee Software Requests
│   ├── approvals/           # Manager Approval Queue
│   ├── reports/             # PDF Reports Generator
│   ├── audit-logs/          # Immutable Audit Trail
│   └── settings/            # Academic Accreditation & Thresholds
├── components/              # GeneX Design System Components
├── context/                 # AuthContext & Session Management
├── lib/                     # Database client, auth guards, formulas
├── prisma/                  # Prisma Schema & Database Seeder
├── python_service/          # Python FastAPI & Pandas microservice
└── docs/                    # Architectural & DevOps Documentation
```
