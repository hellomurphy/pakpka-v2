# Nuxt Starter Template

[![Nuxt UI](https://img.shields.io/badge/Made%20with-Nuxt%20UI-00DC82?logo=nuxt&labelColor=020420)](https://ui.nuxt.com)

Use this template to get started with [Nuxt UI](https://ui.nuxt.com) quickly.

- [Live demo](https://starter-template.nuxt.dev/)
- [Documentation](https://ui.nuxt.com/docs/getting-started/installation/nuxt)

<a href="https://starter-template.nuxt.dev/" target="_blank">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://ui.nuxt.com/assets/templates/nuxt/starter-dark.png">
    <source media="(prefers-color-scheme: light)" srcset="https://ui.nuxt.com/assets/templates/nuxt/starter-light.png">
    <img alt="Nuxt Starter Template" src="https://ui.nuxt.com/assets/templates/nuxt/starter-light.png" width="830" height="466">
  </picture>
</a>

> The starter template for Vue is on https://github.com/nuxt-ui-templates/starter-vue.

## Quick Start

```bash [Terminal]
npm create nuxt@latest -- -t github:nuxt-ui-templates/starter
```

## Deploy your own

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-name=starter&repository-url=https%3A%2F%2Fgithub.com%2Fnuxt-ui-templates%2Fstarter&demo-image=https%3A%2F%2Fui.nuxt.com%2Fassets%2Ftemplates%2Fnuxt%2Fstarter-dark.png&demo-url=https%3A%2F%2Fstarter-template.nuxt.dev%2F&demo-title=Nuxt%20Starter%20Template&demo-description=A%20minimal%20template%20to%20get%20started%20with%20Nuxt%20UI.)

## Setup

Make sure to install the dependencies:

```bash
pnpm install
```

### Local database (D1 / seed)

เมื่อรัน `nuxt dev` (หรือ `pnpm dev --filter admin`) NuxtHub ใช้ SQLite คนละไฟล์กับที่ Wrangler D1 local ใช้ ดังนั้นถ้า migrate ผ่าน `wrangler d1 execute ... --local` แล้ว Drizzle Studio จะเห็นตาราง แต่แอปอาจยังเจอ "no such table" เพราะแอปต่ออยู่ที่ไฟล์อื่น

**ต้องรัน migration ก่อน:** ให้ D1 local มี schema อย่างน้อยครั้งเดียว จาก repo root: `pnpm --filter @repo/db run db:migrate:local` (หรือ `wrangler d1 execute pakpak-db --local --file=./packages/database/drizzle/0000_common_master_chief.sql`)

**แก้ให้แอปใช้ไฟล์เดียวกับ Wrangler:** ตั้งใน `apps/admin/.env`:

1. เปิด `.env.example` ใน admin แล้ว copy บรรทัด `DATABASE_URL=file:../../.wrangler/...` ไปไว้ใน `.env`
2. แก้ให้ uncomment บรรทัดนั้น (ลบ `#` ด้านหน้า)
3. Path แบบ relative ได้ — แอปจะ resolve เป็น absolute จากโฟลเดอร์ apps/admin ให้เอง
4. ถ้า hash ในชื่อไฟล์เปลี่ยน: รัน `ls .wrangler/state/v3/d1/miniflare-D1DatabaseObject/` จาก repo root แล้วอัปเดตชื่อไฟล์ `.sqlite` ใน URL

ค่า `DATABASE_URL` ต้องชี้ไปที่ไฟล์ `.sqlite` เดียวกับที่อยู่ใต้ repo root `.wrangler` (ที่ใช้กับ `db:migrate:local`) จึงจะใช้ schema ที่ migrate แล้ว

จากนั้น restart `pnpm dev --filter admin` แล้วลอง seed อีกครั้ง

## Development Server

Start the development server on `http://localhost:3000`:

```bash
pnpm dev
```

## Production

Build the application for production:

```bash
pnpm build
```

Locally preview production build:

```bash
pnpm preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.

## CORS (เมื่อ client/landing เรียก API ข้าม origin)

Admin ใช้ middleware ฝั่ง server ให้ CORS แบบ **allowlist** เท่านั้น (ไม่ใช้ `*`)

### วิธีตั้งค่าในอนาคต

1. **ตั้ง env ที่ admin** (หรือใน hosting เช่น Cloudflare/Vercel):
   - `ALLOWED_ORIGINS` = รายการ origin คั่นด้วย comma (ไม่มีช่องว่างหลัง comma ก็ได้)
   - แต่ละค่าเป็น URL เต็มของฝั่งที่เรียก API (scheme + host + port ถ้ามี)

2. **ตัวอย่าง**
   - **Dev (client รัน localhost:3002):**  
     `ALLOWED_ORIGINS=http://localhost:3002`
   - **Prod (client อยู่ที่ https://app.example.com):**  
     `ALLOWED_ORIGINS=https://app.example.com`
   - **รวมหลาย origin:**  
     `ALLOWED_ORIGINS=http://localhost:3002,https://app.example.com,https://landing.example.com`

3. **ฝั่ง client (หรือ landing)** เวลาเรียก admin API:
   - ใช้ `useRuntimeConfig().public.apiBase` เป็น base URL (client ตั้ง `NUXT_PUBLIC_API_BASE` ใน env)
   - ถ้าต้องส่ง cookie: ใช้ `$fetch(url, { credentials: 'include' })`

4. **ถ้าไม่ตั้ง `ALLOWED_ORIGINS`:** middleware จะไม่ set CORS headers → browser จะ block response ข้าม origin ตามปกติ
