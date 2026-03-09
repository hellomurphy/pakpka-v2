# Server API Testing Strategy (admin)

> เอกสารนี้ใช้เป็น reference สำหรับ AI/developer ครั้งถัดไป — อ่านก่อน implement เทสต่อ (ประหยัด token)

## 1. Testing Pyramid และขอบเขต

| ชั้น            | สัดส่วน | ขอบเขต                                                                | เครื่องมือ                        |
| --------------- | ------- | --------------------------------------------------------------------- | --------------------------------- |
| **Unit**        | 80%     | Service logic, calculation, validation (pure functions / แยกออกมาได้) | Vitest, Node, ไม่ต้องมี DB/Nitro  |
| **Integration** | 15%     | Handler + DB (เรียก handler จริง หรือ callEventHandler + DB)          | Vitest + Nitro test env / test DB |
| **E2E**         | 5%      | HTTP + cookie + middleware (ยิง request จริงผ่าน server)              | @nuxt/test-utils/e2e, $fetch      |

**Coverage เป้าหมาย**

- Overall: 70–85%
- Business logic (ที่แยกออกมา): 90%+
- Handler/controller: ไม่ต้อง 100%

---

## 2. โครงสร้างโฟลเดอร์เทส

```
apps/admin/test/
  unit/
    server/
      logic/
        date-overlap.test.ts
        billing-run-rules.test.ts
        utility-cost.test.ts
        invoice-meter-ready.test.ts
        staff-rules.test.ts
      schemas/
        billing-run-schema.test.ts
        contract-schema.test.ts
      utils/
        apiResponse.test.ts
    useStatusStyles.test.ts   # มีอยู่แล้ว (frontend)
    useFormatters.test.ts     # มีอยู่แล้ว
  integration/
    helpers.ts
    server/
      api/
        contracts.post.test.ts
        billing-runs.post.test.ts
        payments.approve-reject.test.ts
  e2e/
    api.get.spec.ts
    api.contracts.spec.ts
    api.billing-runs.spec.ts
    api.payments.spec.ts
  TESTING_STRATEGY.md   # ไฟล์นี้
```

---

## 2.1 Migration: run once per run, never per test

Migrations must run **once per test run** (e.g. once per CI job when preparing the DB), not inside `setup()` or per test case.

- Do **not** call migrations in test `setup()` or in `beforeEach`/`beforeAll` hooks.
- In CI, migrations are applied once when creating the temp SQLite file (e.g. `cat packages/database/drizzle/*.sql | sqlite3 $RUNNER_TEMP/pakpak-test.sqlite`) before starting the preview server. See `test/CI_BUILD_ONCE_PLAN.md`.

---

## 3. ตาราง Route หลัก vs ประเภทเทส

| Domain                 | ไฟล์หลัก (server/api)                                                                                               | Unit (แยก logic)                                                  | Integration               | E2E                          |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- | ------------------------- | ---------------------------- |
| **Auth**               | auth/dev-login.get, auth/credentials.post, auth/line.get, auth/line/callback.get, auth/logout.post                  | (optional)                                                        | (optional) dev-login+DB   | 1–2 ตัว (dev-login, session) |
| **Contracts**          | contracts/index.get, index.post, [id].get, [id].put, [id]/finalize, notice, cancel, check-in, services/index.post   | overlap, finalize deductions                                      | POST สร้างสัญญา, finalize | flow หลัก 1–2 ตัว            |
| **Reservations**       | reservations/index.post, [id]/cancel.post                                                                           | overlap (shared กับ contract)                                     | POST สร้างการจอง          | ตามจำเป็น                    |
| **Billing runs**       | billing-runs/index.get, index.post, latest.get, [id]/\*                                                             | period YYYY-MM, role OWNER/ADMIN, period ซ้ำ                      | POST สร้างรอบบิล          | 1–2 ตัว                      |
| **Payments**           | payments/index.get, pending.get, [id]/approve.post, [id]/reject.post                                                | (optional) state                                                  | approve, reject           | 401/404 + 1 happy path       |
| **Invoices**           | invoices/[id].get, [id].put, [id]/meter-reading.put, [id]/send.post                                                 | utility cost (calcUtilityCost), meter ready (isInvoiceMeterReady) | meter-reading.put         | —                            |
| **Rooms**              | rooms/index.get, index.post, [id].get, [id].put, [id]/delete, status.put, page-init.get, available-for-contract.get | —                                                                 | ตามจำเป็น                 | —                            |
| **Services**           | services/index.get, index.post, [id].put, [id].delete                                                               | schema validation                                                 | —                         | —                            |
| **Tenants**            | tenants/index.get, index.post, [id].put, [id]/history.get, archive, permanent.delete                                | overlap (ใช้ชุดเดียวกับ contract)                                 | index.post                | —                            |
| **Properties**         | properties/[id].put, [id]/dashboard.get, staff.get, settings.get, sync-rooms.post, floors.post                      | —                                                                 | —                         | —                            |
| **Staff**              | staff/index.delete, role.put                                                                                        | canChangeStaffRole, canDeleteStaffMember                          | —                         | —                            |
| **Receiving-accounts** | receiving-accounts/index.get, index.post, [id].put, [id].delete                                                     | —                                                                 | —                         | —                            |
| **Room-types**         | room-types/index.get, index.post, [id].put, [id].delete                                                             | —                                                                 | —                         | —                            |
| **Invitations**        | invitations/index.post, [id].delete                                                                                 | —                                                                 | —                         | —                            |
| **Tenant (LIFF)**      | tenant/\* (profile, contracts, rooms, invoices, payments, maintenance, notifications)                               | —                                                                 | —                         | —                            |
| **Session**            | session/init.get                                                                                                    | —                                                                 | —                         | —                            |
| **Dashboard**          | dashboard.get                                                                                                       | —                                                                 | (optional)                | 400/401 (มีอยู่แล้ว)         |
| **Dev**                | dev/check-env.get, seed.post, generate-payments.post                                                                | —                                                                 | —                         | check-env (มีอยู่แล้ว)       |

---

## 4. ขั้นตอนทำทีละ step (ให้ AI ครั้งหน้าทำต่อ)

1. **สร้างไฟล์ TESTING_STRATEGY.md** — Done. ไฟล์นี้
2. **แยก logic ชุดแรก (contract/reservation overlap)** — Done.
   - `server/utils/date-overlap.ts` มี `hasOverlappingDateRanges`
   - อัปเดต contracts/index.post, reservations/index.post, tenants/index.post แล้ว
3. **Unit test logic ชุดแรก** — Done.
   - `test/unit/server/logic/date-overlap.test.ts` เทส `hasOverlappingDateRanges` (ไม่ทับ, ทับขอบ, ทับภายใน, date string จาก DB)
4. **แยก validation/schema** — Done.
   - `server/utils/schemas/billing-run.ts`, `contract.ts`; handler อ้างอิงจาก `~~/server/utils/schemas/billing-run` หรือ `.../contract` โดยตรง (ไม่มี index เพื่อเลี่ยง duplicated-import warning)
   - Unit test: `test/unit/server/schemas/billing-run-schema.test.ts`, `contract-schema.test.ts`
5. **แยกกฎ billing run** — Done.
   - `server/utils/billing-run-rules.ts`: isValidBillingRunPeriod, canCreateBillingRun, isPeriodDuplicate
   - Unit test ใน `test/unit/server/logic/billing-run-rules.test.ts`
6. **ตั้งค่า Integration test** — Done.
   - Vitest project `integration` ใน vitest.config; ใช้ setup + $fetch เหมือน e2e
   - ไฟล์: `test/integration/server/api/contracts.post.test.ts`, `billing-runs.post.test.ts`, `payments.approve-reject.test.ts` (เพิ่มแล้ว)
7. **ลด E2E ให้เหลือ ~5%** — Done.
   - E2E เก็บเฉพาะ 401 (no session) และ 403 (cookie ส่งแต่ไม่ใช่ staff) ต่อ flow; E2E ไม่มี placeholder skip; เคส 400/404 อยู่ที่ integration, เคสที่ต้อง seed ทำใน integration หรือ e2e เมื่อมี seed
8. **แยก utils เพิ่ม (utility cost, invoice meter ready, staff rules)** — Done.
   - `server/utils/utility-cost.ts`: calcUtilityCost(units, billingType, rate, minCharge) — ใช้ใน invoices/[id]/meter-reading.put, dev/seed.post
   - `server/utils/invoice-meter-ready.ts`: isInvoiceMeterReady(electricityBillingType, waterBillingType, hasElec, hasWater) — ใช้ใน billing-runs/[id]/invoices.get, invoices/[id]/send.post
   - `server/utils/staff-rules.ts`: canChangeStaffRole(actorRole), canDeleteStaffMember(targetRole) — ใช้ใน staff/role.put, staff/index.delete
   - Unit test: `test/unit/server/logic/utility-cost.test.ts`, `invoice-meter-ready.test.ts`, `staff-rules.test.ts`
9. **วัด coverage**
   - รัน `pnpm --filter admin test -- --run --coverage` (ตั้งค่า vitest coverage ถ้าต้องการ); เป้า overall 70–85%, business logic 90%+

---

## 5. Path จริงที่อ้างอิง

- Handlers: `apps/admin/server/api/<domain>/<file>.ts`
- Utils: `apps/admin/server/utils/auth.ts`, `apiResponse.ts`, `date-overlap.ts`, `billing-run-rules.ts`, `utility-cost.ts`, `invoice-meter-ready.ts`, `staff-rules.ts`, `schemas/` (billing-run, contract)
- Unit tests: `apps/admin/test/unit/server/logic/*.test.ts` (date-overlap, billing-run-rules, utility-cost, invoice-meter-ready, staff-rules), `test/unit/server/utils/*.test.ts`, `test/unit/server/schemas/*.test.ts`
- Integration: `apps/admin/test/integration/server/api/*.test.ts`
- E2E: `apps/admin/test/e2e/*.spec.ts`
- Vitest config: `apps/admin/vitest.config.ts` (มี project unit, integration, e2e, nuxt)

---

## 6. E2E เก็บไว้ ~5% (อะไรควรอยู่ที่ E2E)

เก็บเทส E2E เฉพาะที่ต้องตรวจ **HTTP + cookie + middleware** จริง:

- **เก็บ:** GET /api/dev/check-env (ไม่พึ่ง auth)
- **เก็บ:** GET /api/auth/dev-login (flow ล็อกอิน + cookie)
- **เก็บ:** GET /api/dashboard ไม่ส่ง query → 400; ส่ง query แต่ไม่มี session → 401 (ตรวจว่า auth middleware ทำงาน)
- **ลดหรือย้าย:** เทส 400/404 อยู่ที่ integration; E2E ไม่เก็บ placeholder skip — เหลือแค่ 1–2 ตัวต่อ flow ที่ต้องตรวจ cookie/middleware จริง (401, 403)

หลัง refactor เป้า: จำนวนเทส E2E น้อยกว่า integration และ unit (pyramid)
