# CI: Timeouts, DB isolation, and Build-Once-Run-Many (revised)

Revised plan incorporating: wait-on for server readiness, artifact retention and .output hygiene, and Drizzle/SQLite migration via `cat ... | sqlite3`.

---

## 1. Vitest timeouts (180s for GitHub runners)

**File:** `apps/admin/vitest.config.ts`

- For **integration** and **e2e** projects, set:
  - `setupTimeout: 180_000` (3 min)
  - `hookTimeout: 180_000` (3 min)
- Keep `testTimeout: 60_000` and `fileParallelism: false` as-is.
- Unit and nuxt projects stay with current shorter timeouts.

---

## 2. Migration: run once, not per test case

**Current state:** Test `setup()` does **not** call any migration. Only `server/plugins/db-connection.ts` runs `SELECT 1` on app startup.

**Required behaviour:** Migrations must run **once per test run** (e.g. once per CI job before starting the server), not inside each test or each `setup()`.

- Do **not** add migration calls inside `setup()` or per-test hooks.
- Run migrations once when preparing the temp DB (Section 3 below). Document in `test/TESTING_STRATEGY.md`.

---

## 3. Isolated SQLite for CI: temp file + migrate once (Drizzle way)

**Goal:** One SQLite DB per CI job, on disk (runner SSD), schema applied once.

**Approach:**

- Create a single file per job, e.g. `$RUNNER_TEMP/pakpak-test.sqlite`.
- Set `DATABASE_URL=file:<path>` for the preview process.
- Apply schema **once** using the Drizzle-generated SQL files (no wrangler in the hot path).

**Pro-tip (recommended):** Use `drizzle-kit generate` so the latest schema is in `packages/database/drizzle/*.sql`. In CI, apply all migrations in order with sqlite3:

```bash
# Apply all migration SQL files to temp DB (fast, no wrangler/network)
cat packages/database/drizzle/*.sql | sqlite3 $RUNNER_TEMP/pakpak-test.sqlite
```

This is much faster than `wrangler d1 execute` and avoids depending on wrangler’s local DB path. The shell expands `*.sql` in **alphabetical order**; Drizzle typically names migrations `0000_xxx.sql`, `0001_xxx.sql`, etc., so the order is correct.

**Caution:** Ensure `packages/database/drizzle/` contains **only** migration files. Do not put other `.sql` files there (e.g. backups, seed data, or ad‑hoc scripts), or the execution order may be wrong and break the schema.

**Implementation:**

- CI step (after checkout/install): create `$RUNNER_TEMP/pakpak-test.sqlite` (touch or let sqlite3 create it), run the `cat ... | sqlite3` command above, then export `DATABASE_URL=file:$RUNNER_TEMP/pakpak-test.sqlite` for the preview step.

---

## 4. Build Once, Run Many (CI workflow)

**Idea:** Build admin once; run integration/e2e against that build (no Vitest-triggered build per file).

**Order:** validate → unit-test → **build** → **test-integration-e2e**.

### 4.1 Build job

- Run `pnpm turbo run build --filter=admin`.
- **Artifact upload:**
  - Upload `apps/admin/.output` (or the actual Nitro output path) as an artifact (e.g. `admin-output`).
  - Set **`retention-days: 1`** on `upload-artifact` to avoid filling GitHub storage.
  - Before upload, ensure `.output` does not contain unnecessary bloat (e.g. duplicate or nested `node_modules`). If Nuxt/Nitro outputs a lean `.output`, no extra step; otherwise add a step to prune known junk so the artifact stays small.

### 4.2 test-integration-e2e job

- **needs:** `[validate, unit-test, build]`.
- Checkout, pnpm install, restore caches as today.
- **Download** the `admin-output` artifact and restore to `apps/admin/.output`.
- **Prepare DB once:** create `$RUNNER_TEMP/pakpak-test.sqlite`, run:
  ```bash
  cat packages/database/drizzle/*.sql | sqlite3 $RUNNER_TEMP/pakpak-test.sqlite
  ```
  then export `DATABASE_URL=file:$RUNNER_TEMP/pakpak-test.sqlite`.
- **Start server and wait until ready (use wait-on):**
  - Start the preview server in the background (e.g. `pnpm --filter admin run preview &`).
  - **Do not** rely on a simple curl loop: the port can be open before Nitro has finished preparing SQLite or loading plugins; tests may then hit 500s.
  - Use **wait-on** so tests only start when the server responds (e.g. HTTP 200). By default `wait-on http://localhost:3000` waits until that URL returns 200 OK.
  - **Pro-tip:** If the app’s root page does heavy SSR or loads a lot of data, point wait-on at a **lighter endpoint** (e.g. `/api/health` or a static page) so you confirm Nitro is ready without waiting for the full UI. Example:
    ```yaml
    - name: Start Preview Server
      run: |
        pnpm --filter admin run preview &
        npx wait-on http://localhost:3000/api/health --timeout 60000
    ```
    (Add a minimal `/api/health` that returns 200 if you don’t have one.) Use the same port when setting `TEST_HOST` for the test step.
- **Environment variables for this job:** After downloading the artifact, set all env vars the app needs at runtime, same as in a real run:
  - **`DATABASE_URL`:** must point at the temp DB, e.g. `file:$RUNNER_TEMP/pakpak-test.sqlite` (with an absolute path if needed).
  - **`NUXT_PUBLIC_*`** and any other runtime config (e.g. session password, dev user id for dev-login): set them in the job (via `env:` or a step that exports them) so the preview server and tests behave correctly.
- Set `TEST_HOST=http://localhost:3000` (or the chosen port) in the environment for the test step.
- Run `pnpm --filter admin run test:int` and `pnpm --filter admin run test:e2e` with `TEST_HOST` (and the same env vars) set.

### 4.3 Test code

- In every integration/e2e file that calls `setup()` from `@nuxt/test-utils/e2e`, pass `host: process.env.TEST_HOST` when set so the runner does not build or start a server.
- Optional: shared helper that returns `setup()` options (rootDir, timeouts, `host` when `TEST_HOST` is set) to avoid repetition.

---

## 5. Summary of file changes

| Item | File(s) | Change |
|------|---------|--------|
| Timeouts | `apps/admin/vitest.config.ts` | integration/e2e: `setupTimeout`, `hookTimeout` → 180_000 |
| Migration once | `apps/admin/test/TESTING_STRATEGY.md` | Document: migrations run once per run (CI step), never in setup() or per test |
| DB isolation | CI workflow + SQL | Temp DB: `cat packages/database/drizzle/*.sql \| sqlite3 $RUNNER_TEMP/pakpak-test.sqlite`; keep only migration .sql files in that folder; export DATABASE_URL |
| Build once | `.github/workflows/ci.yml` | build before test-integration-e2e; build uploads .output with retention-days: 1; verify .output has no junk; test job downloads artifact, prepares DB, starts preview, uses wait-on, then runs tests with TEST_HOST |
| Server readiness | `.github/workflows/ci.yml` | Use wait-on (e.g. `/api/health` or static page if root is heavy) after starting preview; do not use only a curl loop |
| Env vars in test job | `.github/workflows/ci.yml` | Set DATABASE_URL, NUXT_PUBLIC_*, and other runtime vars in test-integration-e2e so preview matches real run |
| Artifacts | `.github/workflows/ci.yml` | retention-days: 1 on upload-artifact; document or add step to avoid uploading junk in .output |
| Test setup | Integration/e2e test files | Use `host: process.env.TEST_HOST` when set (optional: shared helper) |

---

## 6. Why this approach

- **Separating build from test:** Avoids Vitest/Nuxt building in every test file; tests act as a client against a single pre-built server. CI turns green faster and feedback is quicker.
- **Cost and scale:** Fewer redundant builds and smaller artifacts (retention-days: 1, lean .output) save storage and compute when runs are frequent or runners are more powerful.
- **Infrastructure as Code:** CI encodes DB isolation, migration strategy, and server readiness in a repeatable way, which is hard to learn from app code alone.

---

## 7. Notes: NODE_ENV, DATABASE_URL, and process.dev

### NODE_ENV in CI (preview step)

We set **NODE_ENV=development** in the test-integration-e2e job so that:

1. **hub.db** in `nuxt.config.ts` uses `DATABASE_URL` (libsql + temp file). When `NODE_ENV !== 'development'`, the config falls back to `'sqlite'` and may not use our temp DB.
2. **dev-login** (`server/api/auth/dev-login.get.ts`) only runs when `NODE_ENV === 'development'`; otherwise it returns 403. Our integration/e2e tests need dev-login to get a session, so we keep it enabled in CI.

Preview still serves the **production build** (optimized .output); only the runtime env is development so the app connects to the temp DB and allows dev-login.

**Check:** `server/api/health.get.ts` has **no** `process.dev` or NODE_ENV logic; it always returns `{ ok: true }`. If you add logic elsewhere that branches on `process.dev` or `import.meta.dev`, ensure it does not change behaviour in ways that make CI test results misleading (e.g. skip auth or use a different DB). Prefer feature flags or explicit config over `process.dev` for test-critical paths.

### DATABASE_URL and tests

**DATABASE_URL** is set for the **preview server process** only. The **Vitest process** that runs `test:int` and `test:e2e` does **not** connect to the DB: integration and e2e tests use `$fetch` to hit the running server, so they never need DATABASE_URL in the test runner.

If you later add tests that **query the DB directly** from the test process (e.g. import `db` and run queries to assert state), then the test process must receive the **same** DATABASE_URL as the server (e.g. via `env` in the Vitest step or in the job), so both use the same SQLite file.
