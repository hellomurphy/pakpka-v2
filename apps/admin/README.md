# 🏢 PMS Admin Dashboard (The Hub)

**The centralized management engine for property operations, financial auditing, and utility billing.**

## 🛠 Technical Highlights
- **Core Engine:** Built with **Nuxt 4** utilizing the Hub-and-Spoke architecture.
- **Data Persistence:** Integrated with **Cloudflare D1** via **Drizzle ORM** for edge-native relational data management.
- **Smart Billing:** Batch processing logic for 200+ rooms with automated utility delta calculations and anomaly detection.
- **Security:** Server-side session management and strict API validation using **Zod**.

## 🚀 Development
```bash
# Run standalone admin dashboard
pnpm --filter admin dev
```

---
[⬅️ Back to Root Project](../../README.md)