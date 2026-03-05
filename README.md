# 🏠 Edge-Native Property Management System (PMS)

> **A high-performance, monorepo-based SaaS engineered for financial accuracy and global low-latency property operations.**

[![CI](https://github.com/hellomurphy/pakpak-v2/actions/workflows/ci.yml/badge.svg)](https://github.com/hellomurphy/pakpak-v2/actions/workflows/ci.yml)
[![Framework: Nuxt 4](https://img.shields.io/badge/Framework-Nuxt_4-00DC82?style=flat-square&logo=nuxt.js)](https://nuxt.com/)
[![Runtime: Cloudflare Workers](https://img.shields.io/badge/Runtime-Cloudflare_Workers-F38020?style=flat-square&logo=cloudflare)](https://workers.cloudflare.com/)
[![Database: Cloudflare D1](https://img.shields.io/badge/Database-Cloudflare_D1-F38020?style=flat-square&logo=cloudflare)](https://www.cloudflare.com/products/workers/d1/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](LICENSE)

---

## 🔗 Live Demo & Deployment

| Platform                    | Access Link                                                       | Status                      |
| :-------------------------- | :---------------------------------------------------------------- | :-------------------------- |
| **Production Admin (v1)**   | [https://demo.pakpak.app](https://demo.pakpak.app)                | 🟢 Live (Node.js)           |
| **Edge-Native Source (v2)** | [hellomurphy/pakpka-v2](https://github.com/hellomurphy/pakpka-v2) | 🛠️ In-Migration (This Repo) |
| **Tenant Portal (LIFF)**    | [Private Access]                                                  | 🔒 On-Request               |

### 🔑 Demo Credentials

To explore the **Production Dashboard (v1)**, please use the following testing account:

- **Username:** `admin01`
- **Password:** `password`

> **Note:** The Tenant Portal is integrated with LINE LIFF and requires phone number whitelisting. A live demonstration can be provided during the technical interview.

---

## 🚀 Engineering Vision: Reliability at the Edge

This project solves operational bottlenecks for high-density dormitory management (200+ rooms). Unlike generic platforms, this system is architected for **Extreme Financial Integrity** and **Operational Agility**.

### Core Philosophy:

- **Accuracy over Automation:** Focus on eliminating human error in auditing and billing before layering IoT complexity.
- **Edge-First Architecture:** Built on Cloudflare’s global network to ensure sub-second response times and 100% availability without cold starts.
- **Mobile-First Auditing:** Optimized for "Smart Entry" meter reading, allowing staff to audit and sync data directly from the field.

---

## 🏗 System Architecture (The Hub-and-Spoke Model)

The project utilizes a **Monorepo Strategy** to maintain a Single Source of Truth for schemas and business logic across multiple applications.

### 1. The Hub (`apps/admin`)

The centralized **API Gateway** and logic engine.

- **Smart Billing Engine:** Batch process 200+ invoices in a single transaction with complex utility delta calculations.
- **Anomaly Detection:** Real-time validation system to flag utility consumption spikes (detecting leaks or meter malfunctions).

### 2. The Spokes (`apps/client`, `apps/landing`)

Decoupled applications focused on User Experience.

- **Tenant Portal:** Integrated via **LINE LIFF** for a frictionless, app-less user journey.
- **Self-Onboarding:** Automated identity matching via phone numbers, syncing tenant data with the Hub in real-time.

### 3. Shared Core (`packages/*`)

- **`@repo/db`:** Shared Drizzle schemas and migrations.
- **`@repo/ui`:** Unified Design System for consistent brand UX across apps.

---

## 🛠 Technical Challenges & Decisions

### **1. Migration to Edge Runtime (Architectural Evolution)**

- **Problem:** V1 (Node.js/Postgres) faced scalability and cost issues during idle times.
- **Solution:** Migrated to **Nuxt 4 + Cloudflare Workers**. This required refactoring all backend logic to be Web Standard compliant, moving away from Node-native dependencies.
- **Result:** Reduced operational costs and achieved near-zero latency for global users.

### **2. Distributed Monorepo Governance**

- Implemented **pnpm workspaces** to manage shared dependencies.
- Enforced strict type-safety by sharing Zod schemas between the Hub and Spoke applications, ensuring API contracts never break.

### **3. Data Persistence with Cloudflare D1**

- Optimized SQL sub-queries to handle relational data efficiently within SQLite's execution limits.
- Implemented automated migration pipelines from the `@repo/db` package to production D1 instances.

---

## 📐 Tech Stack

- **Frontend/Backend:** Nuxt 4 (Full-stack)
- **Database:** Cloudflare D1 (SQLite) with Drizzle ORM
- **Security:** `nuxt-auth-utils` (Session-based), LINE OAuth2, and LIFF API
- **State Management:** Pinia & Nuxt Composables
- **Storage/Cache:** NuxtHub (KV for caching, Blob for slip storage)
- **Validation:** Zod (Strict API request/response validation)

---

## 🛠 Development Workflow

This project utilizes a modern **AI-Augmented Development** workflow to achieve high velocity without compromising architectural integrity:

- **Tooling:** Developed using **Cursor AI** with custom `.cursorrules` configured to enforce strict Nuxt 4 patterns and Edge-native standards.
- **Consistency:** Leveraged AI-driven linting and pattern enforcement to maintain a clean Monorepo structure and ensure type safety across all packages.
- **Velocity:** Optimized for rapid iteration from V1 to V2, focusing on refactoring core business logic into scalable, Edge-ready modules.

---

## 📈 Roadmap

- [x] **Phase 1:** Core Billing & Admin Dashboard (Manual Entry Optimized for 200+ Rooms)
- [ ] **Phase 2:** Engineering Excellence (Integration of Vitest for core billing logic and CI/CD pipelines)
- [ ] **Phase 3:** AI OCR Integration (Automated utility reading via camera)
- [ ] **Phase 4:** IoT Smart Meter direct integration

---

## 🛠 Development

```bash
# Install dependencies
pnpm install

# Start Admin Dashboard
pnpm --filter admin dev

# Start Tenant Portal
pnpm --filter client dev
```

---

## 🧪 Testing

We use a **testing pyramid** (Unit → Integration → E2E) with Vitest and `@nuxt/test-utils`. Integration and E2E run against a **single pre-built server** and an isolated SQLite DB (Build Once, Run Many), so full test runs stay fast.

| Command | What it runs | When to use |
| :------ | :------------ | :----------- |
| `pnpm test:quick` | Unit + Nuxt only | Before push (fast feedback) |
| `pnpm test:full` | Unit, Nuxt, Integration, E2E | Before opening a PR or to mirror CI |
| `pnpm --filter admin run test:unit` | Unit only | While editing pure logic |
| `pnpm --filter admin run test:int` | Integration only | While changing API + DB flows |
| `pnpm --filter admin run test:e2e` | E2E only | While changing auth / HTTP behaviour |

Details: `apps/admin/test/TESTING_STRATEGY.md` and `apps/admin/test/CI_BUILD_ONCE_PLAN.md`.

---

## 🔧 Troubleshooting

**CI is red (failed)**

- **E2E or Integration step failed**  
  Check that migrations are applied to the test DB. In CI we use a temp SQLite file and run `packages/database/drizzle/*.sql` once before starting the preview server. Locally, run `pnpm --filter @repo/db run db:migrate:local` and ensure `apps/admin/.env` has a valid `DATABASE_URL` if you run integration/e2e without `TEST_HOST`.
- **“Server not ready” or timeouts**  
  If you run integration/e2e against a local server, start the app first (`pnpm --filter admin run preview`), then run tests with `TEST_HOST=http://localhost:3000 pnpm --filter admin run test:int` (and similarly for `test:e2e`).
- **Other steps (lint, format, unit, build)**  
  Run the same commands locally: `pnpm format:check`, `pnpm turbo run lint --filter=admin`, `pnpm --filter admin run test:unit`, `pnpm turbo run build --filter=admin`.

---

_Developed with a focus on Engineering Excellence and User Experience._
