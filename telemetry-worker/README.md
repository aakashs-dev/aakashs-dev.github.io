# Portfolio Telemetry Worker (Option B)

A lightweight, cookieless Cloudflare Worker collector for `aakashs-dev.github.io`.

## What it records (and what it discards)

- **Recorded (auto-expires after 90 days):**
  - Timestamp, route path (query/hash stripped), referrer hostname, coarse viewport bucket (`mobile` / `tablet` / `desktop` / `ultrawide`), light/dark scheme, browser & OS family.
  - Edge-resolved location (`city`, `region`, `country`, `timezone`) and network (`asn`, `asOrganization`) from Cloudflare `request.cf`.
  - Interaction events (`section_view`, `dossier_open`) and field Core Web Vitals (`LCP`, `CLS`).
  - A daily-rotated, non-reversible 12-hex SHA-256 hash for unique daily visitor counts.
- **Never stored:** raw visitor IP addresses, cookies, cross-day user IDs, form inputs, query strings or personal identifiers. Honours `navigator.globalPrivacyControl`.

## Deploy (Cloudflare free tier)

Run from `telemetry-worker/`:

1. Sign in to Cloudflare:
   ```bash
   npx wrangler login
   ```
2. Create the KV namespace and copy the returned `id` into `wrangler.toml`:
   ```bash
   npx wrangler kv namespace create TELEMETRY_KV
   ```
3. Set the private secrets (never commit these):
   ```bash
   npx wrangler secret put STATS_TOKEN
   npx wrangler secret put HASH_SALT
   ```
4. Deploy the worker:
   ```bash
   npx wrangler deploy
   ```
5. Paste the deployed `https://portfolio-telemetry.<subdomain>.workers.dev/v1/events` URL into `src/app/telemetry.config.ts` and deploy the portfolio site.

## Query your visit stats

```bash
curl -H "Authorization: Bearer <YOUR_STATS_TOKEN>" "https://portfolio-telemetry.<subdomain>.workers.dev/stats?days=7"
```
