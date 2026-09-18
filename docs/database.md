# Database Schema & Relational Model Architecture

**Database Provider:** Persistent PostgreSQL (Neon Database)  
**ORM:** Prisma ORM v5.22.0  
**Schema Namespace:** `fep_license_platform`

---

## 1. Relational Entity Overview

The platform uses a fully normalized relational schema with foreign key integrity, index optimizations, and cascaded relations:

```
users (1) --------< (M) license_assignments (M) >-------- (1) licenses (M) >-------- (1) software (1) >--- (1) vendors
  |                          |                                   |                          |
  |                          |                                   |                          |
  v                          v                                   v                          v
departments             usage_records                         renewals               cost_records
  ^                                                              |                          |
  |                                                              v                          v
  +------------------------------------------------------- recommendations <----------------+
```

### Table Definitions & Key Relationships

1. **`users`**:
   - `id` (String CUID, Primary Key)
   - `email` (String, Unique, Indexed)
   - `name` (String)
   - `passwordHash` (String, bcrypt 10 rounds)
   - `role` (`ADMIN`, `MANAGER`, `EMPLOYEE`)
   - `designation` (String)
   - `departmentId` (Foreign Key -> `departments.id`, SetNull on delete)
   - `status` (`ACTIVE`, `INACTIVE`, `SUSPENDED`)

2. **`departments`**:
   - `id` (String CUID, Primary Key)
   - `name` (String, Unique)
   - `code` (String, Unique, e.g. `ENG`, `DES`, `OPS`)
   - `budgetMonthly` (Float, INR)

3. **`vendors`**:
   - `id` (String CUID, Primary Key)
   - `name` (String, Unique)
   - `contactPerson`, `email`, `phone`, `website`, `notes`

4. **`software`**:
   - `id` (String CUID, Primary Key)
   - `name` (String, Unique)
   - `category` (String, Indexed)
   - `description`, `version`, `website`
   - `vendorId` (Foreign Key -> `vendors.id`, Cascade)
   - `status` (`ACTIVE`, `UNDER_REVIEW`, `DISCONTINUED`)

5. **`licenses`**:
   - `id` (String CUID, Primary Key)
   - `softwareId` (Foreign Key -> `software.id`, Cascade)
   - `licenseType` (`PER_USER`, `ENTERPRISE`, `FLOATING`, `PER_CORE`)
   - `totalQuantity` (Int, total purchased seat pool)
   - `costPerLicense` (Float, monthly rate in INR)
   - `billingFrequency` (`MONTHLY`, `ANNUAL`, `ONE_TIME`)
   - `purchaseDate`, `startDate`, `renewalDate` (Indexed), `expiryDate`
   - `status` (`ACTIVE`, `EXPIRING_SOON`, `EXPIRED`, `TERMINATED`)

6. **`license_assignments`**:
   - `id` (String CUID, Primary Key)
   - `licenseId` (Foreign Key -> `licenses.id`, Cascade)
   - `userId` (Foreign Key -> `users.id`, Cascade)
   - `departmentId` (Foreign Key -> `departments.id`, SetNull)
   - `assignedDate` (DateTime)
   - `status` (`ACTIVE`, `REVOKED`)
   - `Unique([licenseId, userId, status])` prevents duplicate active seat assignment.

7. **`usage_records`**:
   - `id` (String CUID, Primary Key)
   - `userId`, `softwareId`, `licenseId`
   - `lastActiveDate`, `loginCount`, `hoursUsed`
   - `utilizationStatus` (`HIGH`, `MODERATE`, `LOW`, `INACTIVE`)

8. **`software_requests`**:
   - `id` (String CUID, Primary Key)
   - `userId`, `softwareId`
   - `priority` (`LOW`, `MEDIUM`, `HIGH`, `URGENT`)
   - `reason`, `requiredDate`, `status` (`PENDING`, `APPROVED`, `REJECTED`, `FULFILLED_EXISTING`)

9. **`request_approvals`**:
   - `id` (String CUID, Primary Key)
   - `requestId` (Foreign Key -> `software_requests.id`)
   - `approvedById` (Foreign Key -> `users.id`)
   - `decision` (`APPROVED`, `REJECTED`)
   - `actionTaken` (`ASSIGNED_EXISTING`, `PURCHASE_AUTHORIZED`, `REJECTED_NO_BUDGET`)

10. **`renewals`**:
    - `id` (String CUID, Primary Key)
    - `licenseId`, `softwareId`
    - `renewalDate`, `estimatedCost`, `status`, `riskLevel`, `autoRenew`

11. **`cost_records`**:
    - `id`, `softwareId`, `departmentId`, `month`, `year`, `allocatedCost`, `wastedCost`

12. **`recommendations`**:
    - `id`, `softwareId`, `type`, `severity`, `title`, `reason`, `supportingMetrics` (JSON), `estimatedMonthlySavings`, `estimatedAnnualSavings`, `suggestedAction`, `status`

13. **`alerts`**:
    - `id`, `severity` (`CRITICAL`, `WARNING`, `INFO`), `title`, `message`, `entityType`, `entityId`, `isRead`

14. **`audit_logs`**:
    - `id`, `userId`, `action`, `entity`, `entityId`, `details` (JSON), `ipAddress`, `createdAt`

---

## 2. Seed Data Consistency Verification
- All seeded software products link directly to real vendors.
- Adobe Creative Cloud explicitly seeded with **50 total licenses, 35 active assignments, 15 available seats, ₹1,000/mo cost per seat**, yielding:
  - Active: 35
  - Available: 15
  - Utilization: 70%
  - Monthly idle waste: ₹15,000
  - Potential annual saving: ₹1,80,000
