# System Architecture & Technical Design

**Course:** Field Engineering Project (FEP) — Computer Engineering  
**Platform:** Software License & Subscription Intelligence Platform (LicenseIQ)  
**Authors:** Yamgar S., Shaikh A., Sonawane S., Jadhav S., Udata P.  
**Guide:** Mr. Ajit Chavan  

---

## 1. Architectural Philosophy
The system is built as a **single, unified, production-grade cloud application**. Rather than maintaining disparate modules, all 5 functional areas communicate with a single centralized PostgreSQL database, authenticated through shared sessions, and rendered through an enterprise UI design inspired by the **GeneX design system**.

```
+-------------------------------------------------------------------------+
|                               Next.js 14 Client                         |
|  - GeneX Navy Sidebar (#0B192C)      - Interactive Recharts Visualizer  |
|  - High-Clarity Workspace Canvas     - jsPDF Export Engine              |
|  - Role-Based Dynamic Views          - Real-Time Search, Sort & Filters |
+-------------------------------------------------------------------------+
                                     |
                                     | (HTTPS / REST API)
                                     v
+-------------------------------------------------------------------------+
|                         Next.js App Router Backend                      |
|  - Stateless Signed JWT Authentication & HTTP-Only Cookies              |
|  - Server-Side Role Enforcement (ADMIN / MANAGER / EMPLOYEE)            |
|  - Prisma ORM Data Access Layer with Atomic Transactions                |
|  - Mathematical Analytics & Explainable Rules Engine                    |
+-------------------------------------------------------------------------+
                  |                                    |
                  | (SQL Queries / Connection Pool)    | (Optional Microservice)
                  v                                    v
+------------------------------------+  +---------------------------------+
|     Neon Persistent PostgreSQL     |  |       Python FastAPI API        |
|  - 14 Relational Tables            |  |  - Pandas Vectorized Analytics  |
|  - Isolated Schema Namespace       |  |  - NumPy Calculations           |
|  - Indexes, Keys & Cascades        |  |  - 0-100 Health Score Engine    |
+------------------------------------+  +---------------------------------+
```

---

## 2. Key Architecture Pillars

### 1. Data Integrity & Concurrency Controls
- Every critical mutation (e.g. allocating a license seat or approving a software request) runs in an isolated `prisma.$transaction`.
- Over-allocation is strictly prevented:
  $$\text{Available Seats} = \text{Total Quantity} - \text{Active Assignments}$$
  If $\text{Available Seats} \le 0$, new assignments are rejected at the database level.

### 2. Explainable Intelligence (No Black Boxes)
- Recommendations are never synthetic or generic. Each generated proposal contains:
  - Triggering Business Rule (Rules 1 through 5)
  - Concrete Supporting Metrics from PostgreSQL
  - Quantitative Monthly & Annual Savings
  - Actionable Decision Steps

### 3. Full-Stack Performance
- Database queries use indexed fields on emails, categories, and foreign keys.
- Client bundles use tree-shaken Lucide icons and lightweight Recharts components.
- Zero horizontal layout overflows across mobile, tablet, laptop, and 4K displays.
