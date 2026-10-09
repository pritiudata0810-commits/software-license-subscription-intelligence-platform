# Deployment & DevOps Guide

**Platform:** Vercel  
**Database:** Neon Serverless PostgreSQL  
**Repository:** GitHub `pritiudata0810-commits/software-license-subscription-intelligence-platform`  
**Vercel Team:** `pritiudata0810-commits-projects`  
**Account Email:** `pritiudata0810@gmail.com`

---

## 1. Production Architecture on Vercel

```
                         [ GitHub Repository ]
                      (pritiudata0810-commits)
                                 |
                                 v  (Automated CI/CD)
                         [ Vercel Edge / Serverless ]
                    software-license-subscription-intelligence
                    +------------------------------------+
                    |  Next.js 14 App Router + Tailwind  |
                    |  Node.js API Route Handlers        |
                    |  Prisma ORM Engine                 |
                    +------------------------------------+
                                 |
                                 v  (Connection Pooling / SSL)
                    [ Neon Persistent PostgreSQL ]
                    Database: neondb (Schema: fep_license_platform)
```

---

## 2. Environment Variables Configuration

Set these environment variables in your Vercel Project Settings (`Settings -> Environment Variables`):

| Variable | Description | Example / Target Value |
|---|---|---|
| `DATABASE_URL` | Aiven PostgreSQL connection string | `postgres://avnadmin:***@pg-6da4774-pritiudata0810-462c.g.aivencloud.com:28369/defaultdb?sslmode=require` |
| `DIRECT_URL` | Aiven PostgreSQL direct connection string | `postgres://avnadmin:***@pg-6da4774-pritiudata0810-462c.g.aivencloud.com:28369/defaultdb?sslmode=require` |
| `AUTH_SECRET` | 32+ byte cryptographic secret for JWT signing | `fep-software-license-intelligence-secure-jwt-secret-2026-prod` |
| `NEXT_PUBLIC_APP_URL` | Public production deployment domain | `https://software-license-subscription-intelligence.vercel.app` |
| `NODE_ENV` | Target environment | `production` |

---

## 3. Database Migration & Seeding Steps

1. **Push Schema to PostgreSQL:**
   ```bash
   npx prisma db push
   ```
2. **Execute Realistic Production Seed Data:**
   ```bash
   npm run prisma:seed
   ```
3. **Verify Data Integrity:**
   ```bash
   npx tsx -e "import prisma from './lib/prisma'; async function test() { const c = await prisma.software.count(); console.log('Total software:', c); } test();"
   ```

---

## 4. Production Smoke Test Verification Checklist
- [x] HTTPS security active
- [x] Login with Admin, Manager, and Employee accounts
- [x] Software catalog CRUD operations functional
- [x] License assignments check available seats
- [x] Real-time calculations: Total 50, Active 35, Available 15, Utilization 70%
- [x] Monthly idle waste ₹15,000 and annual saving ₹1,80,000
- [x] AI Recommendation rules execute with explainable metrics
- [x] PDF reports download with real database data
- [x] Database changes persist across logout and browser refreshes
