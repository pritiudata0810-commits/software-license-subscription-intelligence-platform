# API Reference Documentation

**Base URL:** `/api`  
**Authentication:** HTTP-only JWT Cookie `auth_token` or `Authorization: Bearer <token>`  
**Response Format:** Standard JSON `{ "success": boolean, ... }`

---

## 1. Authentication Endpoints

### `POST /api/auth/login`
- **Request Body:** `{ "email": "admin@enterprise.com", "password": "Password@123" }`
- **Response:** `{ "success": true, "user": { "id", "name", "email", "role", "department" }, "token": "..." }`
- **Cookies:** Sets HTTP-only `auth_token` valid for 7 days.

### `POST /api/auth/logout`
- **Response:** `{ "success": true, "message": "Logged out successfully" }`
- **Cookies:** Clears `auth_token`.

### `GET /api/auth/me`
- **Headers/Cookies:** Requires valid authentication.
- **Response:** `{ "success": true, "user": { "id", "email", "name", "role", "designation", "department", "assignments" } }`

---

## 2. Software & License Endpoints

### `GET /api/software`
- **Query Params:** `search`, `category`, `status`
- **Response:**
  ```json
  {
    "success": true,
    "count": 8,
    "software": [
      {
        "id": "...",
        "name": "Adobe Creative Cloud",
        "category": "Design & Multimedia",
        "totalLicenses": 50,
        "activeAssignments": 35,
        "availableLicenses": 15,
        "unusedLicenses": 15,
        "utilizationRate": 70.0,
        "costPerLicense": 1000,
        "monthlyCost": 50000,
        "unusedMonthlyCost": 15000,
        "potentialAnnualSaving": 180000
      }
    ]
  }
  ```

### `POST /api/software`
- **Permissions:** `ADMIN`, `MANAGER`
- **Request Body:** `{ "name", "vendorId", "category", "description", "version", "website", "initialLicenses", "costPerLicense" }`

### `GET /api/licenses`
- **Query Params:** `softwareId`, `status`
- **Response:** Returns license batches with dynamic calculation of `assignedQuantity`, `availableQuantity`, `unusedQuantity`, and `utilizationRate`.

### `POST /api/licenses`
- **Permissions:** `ADMIN`, `MANAGER`
- **Request Body:** `{ "softwareId", "totalQuantity", "costPerLicense", "renewalDate", "licenseType", "billingFrequency" }`

---

## 3. Assignment Endpoints

### `GET /api/assignments`
- **Query Params:** `userId`, `licenseId`, `departmentId`, `status`
- **Response:** Active software seat assignments with user and department details.

### `POST /api/assignments`
- **Permissions:** `ADMIN`, `MANAGER`
- **Request Body:** `{ "licenseId", "userId", "departmentId", "notes" }`
- **Validation:** Enforces `availableQuantity > 0`, blocks over-assignment, and commits atomically in a Prisma database transaction.

### `DELETE /api/assignments/[id]`
- **Action:** Revokes assignment and immediately restores license seat to available pool.

---

## 4. Intelligence & Analytics Endpoints

### `GET /api/analytics`
- **Response:**
  - `overallUtilization` (%)
  - `totalSoftware`, `totalVendors`, `totalLicenses`, `activeLicenses`, `availableLicenses`
  - `monthlyExpenditure`, `annualExpenditure`
  - `potentialMonthlySavings`, `potentialAnnualSavings`
  - `softwareBreakdown`: Detailed per-product utilization and spend
  - `departmentBreakdown`: Actual spend vs monthly budget

### `GET /api/analytics/health`
- **Response:**
  - `totalScore` (0–100)
  - `utilizationScore` (max 35)
  - `costEfficiencyScore` (max 25)
  - `renewalRiskScore` (max 20)
  - `unusedLicensesScore` (max 10)
  - `overlapRiskScore` (max 10)
  - `status`: `EXCELLENT` | `HEALTHY` | `MODERATE` | `AT_RISK`

### `POST /api/recommendations`
- **Action:** Re-evaluates live PostgreSQL database records against the 5 explainable business rules, saves newly discovered opportunities, and returns actionable recommendations.

### `GET /api/renewals`
- **Response:** Renewals categorized by deadline urgency: `EXPIRED`, `DUE_7_DAYS`, `DUE_30_DAYS`, `UPCOMING`.

### `GET /api/alerts`
- **Response:** Dynamic risk alerts classified by `CRITICAL`, `WARNING`, and `INFO`.

---

## 5. Request & Approval Endpoints

### `POST /api/requests`
- **Action:** Submits an employee software license request.
- **Smart Logic:** Inspects database pool; if unassigned seats exist, flags recommendation to reuse before buying.

### `POST /api/requests/[id]/approve`
- **Permissions:** `ADMIN`, `MANAGER`
- **Request Body:** `{ "decision": "APPROVED" | "REJECTED", "comments": "..." }`
- **Action:** If approved and unassigned seats exist, executes instant atomic allocation to the requesting user and logs an audit trail event.
