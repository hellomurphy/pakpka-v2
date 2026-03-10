# Cron jobs — slip storage cleanup

All endpoints are **GET** and require `CRON_SECRET` unless unset (not recommended in production).

- Query: `?secret=<CRON_SECRET>` or header `x-cron-secret: <CRON_SECRET>`
- Optional: `dryRun=1` — list what would be deleted without deleting

## Endpoints

| Job            | Path                                | Schedule (suggested)      | Purpose                                                                       |
| -------------- | ----------------------------------- | ------------------------- | ----------------------------------------------------------------------------- |
| Orphan         | `/api/cron/cleanup-orphan-slips`    | `0 3 * * *` daily         | Delete blobs under `slips/` with no `payment.slip_key`, older than 24h        |
| Retention      | `/api/cron/cleanup-retention-slips` | `0 4 * * *` daily         | Payments older than 5 years: delete blob, set `slip_key` null                 |
| Dev aggressive | `/api/cron/cleanup-dev-blob`        | `0 */6 * * *` in dev only | Delete all `slips/` blobs older than 24h (no DB check); **403 in production** |

## Examples

```bash
# Orphan (production)
curl -s "https://your-admin.example.com/api/cron/cleanup-orphan-slips?secret=$CRON_SECRET"

# Retention dry-run first
curl -s "https://your-admin.example.com/api/cron/cleanup-retention-slips?secret=$CRON_SECRET&dryRun=1"

# Dev cleanup (local only)
curl -s "http://localhost:3001/api/cron/cleanup-dev-blob?secret=$CRON_SECRET"
```

## Cloudflare

- **Cron Triggers** in `wrangler.toml` pointing at a Worker that `$fetch`es the admin URL with secret, or
- **Scheduled Worker** on the same project as admin if supported, or
- External cron (GitHub Actions, cron-job.org) hitting the HTTPS URL.

## Response shape

Each job returns JSON including:

- `job`, `timestamp`, `durationMs`
- `deleted` or `wouldDeleteCount` (when `dryRun=1`)
- `errors` (capped) if any delete failed
