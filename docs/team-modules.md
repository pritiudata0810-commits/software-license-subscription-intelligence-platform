# Team Module Division & Cross-Functional Architecture

**Course:** Field Engineering Project (FEP)  
**Department:** Computer Engineering  
**Project Guide:** Mr. Ajit Chavan  
**Project Title:** Software License & Subscription Intelligence Platform

---

## 1. Team Members & Module Responsibilities

### Person 1: Yamgar Shreyasi
**Module:** User, Software & License Management  
**Technologies:** React / Next.js, Node.js, Prisma ORM, PostgreSQL  
**Key Responsibilities Delivered:**
- System Authentication & Stateless JWT Token session governance.
- Strict Role-Based Access Control (RBAC) across `ADMIN`, `MANAGER`, and `EMPLOYEE`.
- Software Catalog CRUD: Categories, versions, vendor associations.
- Vendor Contract Governance: Primary supplier contacts, agreements, and notes.
- License Inventory Pools: Managing seat quotas, per-seat unit costs, and billing cycles.
- Real-time Assignment Engine: Allocating software to employees with concurrency and over-assignment prevention.
- Comprehensive Audit Trail logging every mutation.

### Person 2: Shaikh Alfiya
**Module:** Usage & Cost Analytics  
**Technologies:** Python, Pandas, NumPy, Next.js Analytics API  
**Key Responsibilities Delivered:**
- Active vs Idle license seat calculations.
- Vectorized Utilization Formula:
  $$\text{Utilization (\%)} = \left(\frac{\text{Active Licenses}}{\text{Total Licenses}}\right) \times 100$$
- Efficiency Tier Classification: Excellent ($\ge 90\%$), Good ($75-89\%$), Moderate ($50-74\%$), Low ($25-49\%$), Critical ($<25\%$).
- Financial Cost Modeling:
  $$\text{Monthly Cost} = \text{Total Seats} \times \text{Cost per Seat}$$
  $$\text{Monthly Idle Waste} = \text{Unused Seats} \times \text{Cost per Seat}$$
  $$\text{Potential Annual Savings} = \text{Monthly Idle Waste} \times 12$$
- Departmental spend tracking vs approved IT budgets.

### Person 3: Sonawane Shrawani
**Module:** AI Intelligence & Explainable Recommendations  
**Technologies:** Python, FastAPI, Pandas, Vectorized Decision Rules  
**Key Responsibilities Delivered:**
- Deterministic 0–100 **License Health Score**:
  - Utilization Factor: max 35 pts
  - Cost Efficiency Factor: max 25 pts
  - Renewal Risk Factor: max 20 pts
  - Unused Seat Minimization: max 10 pts
  - Category Overlap Safety: max 10 pts
- 5 Explainable Business Intelligence Rules:
  - **Rule 1 (Idle Reallocation):** Flags sub-70% utilization with idle capacity to downscale or reassign.
  - **Rule 2 (License Reuse):** Automatically checks pool when an employee submits a software request to avoid duplicate procurement.
  - **Rule 3 (Pre-Renewal Audit):** Flags renewals within 30 days with low adoption.
  - **Rule 4 (High-Spend Optimization):** Detects expensive licenses with low adoption.
  - **Rule 5 (Duplicate Consolidation):** Detects overlapping tools in identical functional domains.

### Person 4: Jadhav Suraj
**Module:** Renewal, Risk & Alert Management  
**Technologies:** Node.js, Express/Next.js API, PostgreSQL  
**Key Responsibilities Delivered:**
- Renewal timeline management: `EXPIRED`, `DUE_7_DAYS`, `DUE_30_DAYS`, `UPCOMING`.
- Contract auto-renew toggles and renewal history logging.
- Proactive Alert Engine generating `CRITICAL`, `WARNING`, and `INFO` alerts based on real-time database thresholds.
- Software Request Submission & Approval Workflow with database transactions.

### Person 5: Udata Priti
**Module:** Executive Dashboard & Enterprise Reporting  
**Technologies:** React, Next.js, Recharts, jsPDF, jspdf-autotable, Tailwind CSS  
**Key Responsibilities Delivered:**
- GeneX-inspired Executive SaaS Dashboard: Deep Midnight Navy sidebar (`#0B192C`), crisp white canvas, clean elevated cards.
- 12 Live Top KPI cards pulling directly from PostgreSQL.
- Interactive Recharts: Stacked bar charts, utilization distributions, department budgets.
- Enterprise PDF Report Generator: Delivering client-side and server-side formatted PDF documents with tables, savings totals, and academic accreditation.

---

## 2. Mandatory End-to-End Cross-Module Data Flow
All 5 modules share the same normalized PostgreSQL database:
1. **Person 1** provisions Adobe Creative Cloud (50 seats @ ₹1,000/mo) and assigns 35 seats.
2. **Person 2** calculates 70% utilization, ₹15,000 monthly unused waste, and ₹1,80,000 potential annual savings.
3. **Person 3** computes the License Health Score (e.g., 82/100) and outputs Rule 1 recommendation to reallocate 15 idle seats.
4. **Person 4** monitors contract renewal due in 90 days and flags the pending employee request.
5. **Person 5** visualizes all metrics on the Executive Dashboard and generates a publication-ready PDF audit report.
