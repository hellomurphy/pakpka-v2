# 🏠 Edge-Native Property Management System (PMS)
> **A high-performance, monorepo-based SaaS engineered for financial accuracy and global low-latency property operations.**

[![Framework: Nuxt 4](https://img.shields.io/badge/Framework-Nuxt_4-00DC82?style=flat-square&logo=nuxt.js)](https://nuxt.com/)
[![Runtime: Cloudflare Workers](https://img.shields.io/badge/Runtime-Cloudflare_Workers-F38020?style=flat-square&logo=cloudflare)](https://workers.cloudflare.com/)
[![Database: Cloudflare D1](https://img.shields.io/badge/Database-Cloudflare_D1-F38020?style=flat-square&logo=cloudflare)](https://www.cloudflare.com/products/workers/d1/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](LICENSE)

---

## 🔗 Live Demo & Deployment
* **Production Dashboard (v1):** [https://demo.pakpak.app](https://demo.pakpak.app) *(Stable Node.js Architecture)*
* **Edge-Native Source (v2):** [https://github.com/hellomurphy/pakpka-v2](https://github.com/hellomurphy/pakpka-v2) *(Current Migration Target)*
* **Tenant Portal (LIFF):** Accessible via LINE Official Account (Access available upon request for demo purposes)

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
* **Problem:** V1 (Node.js/Postgres) faced scalability and cost issues during idle times.
* **Solution:** Migrated to **Nuxt 4 + Cloudflare Workers**. This required refactoring all backend logic to be Web Standard compliant, moving away from Node-native dependencies.
* **Result:** Reduced operational costs and achieved near-zero latency for global users.

### **2. Distributed Monorepo Governance**
* Implemented **pnpm workspaces** to manage shared dependencies.
* Enforced strict type-safety by sharing Zod schemas between the Hub and Spoke applications, ensuring API contracts never break.

### **3. Data Persistence with Cloudflare D1**
* Optimized SQL sub-queries to handle relational data efficiently within SQLite's execution limits.
* Implemented automated migration pipelines from the `@repo/db` package to production D1 instances.

---

## 📐 Tech Stack

-   **Frontend/Backend:** Nuxt 4 (Full-stack)
-   **Database:** Cloudflare D1 (SQLite) with Drizzle ORM
-   **Security:** `nuxt-auth-utils` (Session-based), LINE OAuth2, and LIFF API
-   **State Management:** Pinia & Nuxt Composables
-   **Storage/Cache:** NuxtHub (KV for caching, Blob for slip storage)
-   **Validation:** Zod (Strict API request/response validation)

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
*Developed with a focus on Engineering Excellence and User Experience.*
