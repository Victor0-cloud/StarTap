# StarTap Premium (website only)

Premium, sign-in and Flutterwave checkout exist only on the Next.js server build of startap.fun. The Android app stays a static export with no accounts. Progress in the app stays on the device.

Do not merge this into `main` until the environment below is set on purpose. `main` auto-deploys production. This document does not change Vercel, Supabase or Flutterwave itself. There are no credentials in the repo.

## What stays free

- Today's Five (`/play`) is never locked and never asks for a login.
- Music World and Sports World stay open.
- Score and share stay open.
- A free player can start 3 Play Five rounds per UTC day (category Play Five and World Mix share that count). A round already in progress does not use another slot. Today's Five is not counted.
- Home, How to play, Privacy, Terms and Support stay public.

When `STARTAP_PAYMENTS_ENABLED` is off, or any required variable is missing, none of the locks, the Premium page, or login appear. The site behaves as it does today.

## Builds

| Script | What it does |
| --- | --- |
| `npm run build:web:server` | Vercel build. Normal Next.js server. Includes `route.web.ts` and `page.web.tsx`. |
| `npm run build:web` | Unchanged static export to `out/`. No API routes. Fallback if a host cannot run a server. |
| `npm run build:mobile` | Unchanged static export to `.next-mobile`. Capacitor. |

`next.config.ts` adds the `web.ts` / `web.tsx` page extensions only for the server build. The mobile build never compiles API routes.

Git deploys of startap.fun read `vercel.json`, which overrides a project setting of `outputDirectory: out` (the old static export):

| Setting | Value |
| --- | --- |
| `framework` | `nextjs` |
| `installCommand` | `npm install --no-audit --no-fund` |
| `buildCommand` | `npm run build:web:server` |
| `outputDirectory` | `.next` |
| `trailingSlash` | `true` |

`npm run build:mobile` is separate. It still static-exports to `.next-mobile` for Capacitor and does not use `outputDirectory`.

`trailingSlash` is still on. Flutterwave should call:

`https://startap.fun/api/flutterwave/webhook`

`vercel.json` rewrites that URL (no slash) to `/api/flutterwave/webhook/` so the POST body is not dropped by a redirect. The same rewrite covers `create-checkout`, `verify-payment`, and `subscription/status`. The slash form is the route Next serves. Headers are unchanged: `/_next/static` is immutable, `.mjs` is `text/javascript`, `.geojson` is `application/geo+json`, and every path sends `X-Content-Type-Options: nosniff` and `Referrer-Policy: strict-origin-when-cross-origin`.

## Feature flag

`STARTAP_PAYMENTS_ENABLED` must be `1` or `true`. Anything else, including unset, is off.

It is on only when every variable in the next section is non-empty, the Supabase URL is `https` (or `http` on localhost), and the service role key is not the anon key. Otherwise checkout and the webhook answer 503 and grant nothing.

`NEXT_PUBLIC_STARTAP_PAYMENTS_ENABLED` is baked at build time (`1` only on the server build when the check above passes). Changing env vars requires a new Vercel deployment before Premium links and locks show up. The status route still fails closed at runtime if a secret disappears after the build: the client then behaves as it does today (no locks).

## Environment variables

Set these in the Vercel project for Production when you are ready, and for Preview only if you intend to test payments on a preview. Do not commit them. `.env*` is gitignored.

| Variable | Role |
| --- | --- |
| `STARTAP_PAYMENTS_ENABLED` | `1` or `true` to offer Premium. |
| `FLW_SECRET_KEY` | Flutterwave secret key. Server only. Sent as `Authorization: Bearer`. |
| `FLW_SECRET_HASH` | The secret hash configured on the Flutterwave webhook. Compared to the `verif-hash` header with a timing-safe check. |
| `FLW_PLAN_MONTHLY_USD` | Flutterwave payment plan id for the USD monthly base. Required. Positive integer. |
| `FLW_PLAN_YEARLY_USD` | Same, USD yearly base. Required. |
| `FLW_PLAN_MONTHLY_NGN` | Optional. NGN monthly test plan. Same shape for any other currency: `FLW_PLAN_MONTHLY_<CUR>` and `FLW_PLAN_YEARLY_<CUR>`. |
| `FLW_PLAN_YEARLY_NGN` | Optional. NGN yearly test plan. |
| `STARTAP_GEO_COUNTRY` | Optional server-only test override. An ISO alpha-2 code replaces `x-vercel-ip-country`. Do not set this in production. |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key. Used in the browser and to verify the user JWT. |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role. Server only. The only key that writes billing rows. |

For a Flutterwave test run, `FLW_SECRET_KEY` is the test secret (`FLWSECK_TEST-...`). The database stores plan ids `premium_monthly` and `premium_yearly`. The applied `0001` payments check still allows only `NGN` and `USD`. `supabase/migrations/0002_payment_currencies.sql` widens that list and is not applied.

## Localized prices

The USD amounts ($5 monthly, $40 yearly) are the base. USD and NGN (₦2,500 monthly, ₦25,000 yearly) are APPROVED final prices, approved by Victor on Oct 17, 2026. Every other currency is an UNAPPROVED placeholder and stays disabled. Approved does not mean live-verified: `recurringVerified` and `liveVerified` stay false for every row, USD and NGN included, until Flutterwave LIVE is confirmed. There is no live foreign-exchange conversion.

The disabled placeholders follow a researched recommendation and stay disabled until the checklist below is done. Sources: World Bank PPP conversion factor PA.NUS.PRVT.PP and FX rate PA.NUS.FCRF, both 2024; a 0.35 price-level floor for African markets; yearly is about 8 times monthly. NGN is the approved 2500 / 25000, matching Flutterwave test plans 246244 and 246246. RWF, ZMW, EGP, MAD, XOF and XAF are unchanged. The other researched rows are GHS 25 / 200, KES 250 / 2000, ZAR 40 / 320, UGX 7000 / 55000, TZS 4500 / 35000, EUR 4.49 / 35.99 and GBP 3.99 / 29.99.

Amounts are stored and compared as integer minor units (hundredths of the currency). 449 is 4.49. A verified charge matches when its decimal text is the same number of hundredths, including trailing zeros such as 4.490. A third non-zero decimal place does not match, and values are not compared with floating-point equality. The amount sent to Flutterwave is that same value, so 4.49 is serialized as 4.49. The premium page formats from those hundredths.

The server maps the visitor's country to a currency, then looks up a fixed amount in `CURRENCY_TABLE`. A currency can be charged only when its row is `enabled`, its `priceStatus` is `APPROVED`, and both `FLW_PLAN_MONTHLY_<CUR>` and `FLW_PLAN_YEARLY_<CUR>` are set. Otherwise the offer falls back to USD. If the USD plan ids are missing, payments stay unavailable (pages 404, APIs 503). USD and NGN start enabled, matching the existing test plans. Every other currency starts disabled. `recurringVerified` and `liveVerified` stay false until the checklist below is done.

Country comes from `x-vercel-ip-country` on Vercel. `STARTAP_GEO_COUNTRY` overrides it for a server test. The browser may send `currency` as `local` or `USD` only. A currency code, an amount, or a country in the body is not the price. An invalid `currency` is 400. `GET /api/pricing/` returns the offer used on `/premium`: currency, both amounts, `usdFallback`, and `localAvailable`. The plan picker shows a local / USD toggle only when the local currency is chargeable and is not already USD.

Webhook and verify-payment still grant only when the verified charge matches the stored payment row and the configured plan id.

### Before enabling a country

Do all of these before setting `enabled: true` for a currency, and before relying on it for a real charge:

1. Confirm Flutterwave LIVE supports that currency. Test-mode support is not enough.
2. Confirm Flutterwave recurring / subscription billing supports that currency for a payment plan. A one-off charge is not enough.
3. Confirm this Flutterwave account is approved to charge that currency.
4. Get Victor's approval for the amounts and set `priceStatus: "APPROVED"` on the row. An `UNAPPROVED` row is never chargeable.
5. Create the monthly and yearly payment plans at the catalogue amounts, then set `FLW_PLAN_MONTHLY_<CUR>` and `FLW_PLAN_YEARLY_<CUR>`.
6. Apply `supabase/migrations/0002_payment_currencies.sql` if the currency is not already `NGN` or `USD`. Do not apply it until the SQL and the unchanged RLS have been reviewed.
7. Set `recurringVerified` and `liveVerified` to true in the table only after steps 1–3 are done. Then set `enabled` to true and redeploy.

The country map is ISO 3166-1 alpha-2 to ISO 4217: NG NGN, GH GHS, KE KES, ZA ZAR, UG UGX, TZ TZS, RW RWF, ZM ZMW, EG EGP, MA MAD, CI and SN XOF, CM XAF, US USD, GB GBP, and every current EU member EUR. Any other country is USD.

### Vercel steps

1. Open the StarTap project on Vercel → Settings → Environment Variables.
2. Add each name above. Mark `FLW_SECRET_KEY`, `FLW_SECRET_HASH` and `SUPABASE_SERVICE_ROLE_KEY` as sensitive.
3. Redeploy. `NEXT_PUBLIC_*` values are inlined at build time, so a redeploy is required after any change.
4. Do not put these values in Preview unless that preview should take real or test charges.

### Preview webhooks and Deployment Protection

Vercel Deployment Protection (including SSO) blocks requests that do not have the bypass. Flutterwave cannot send a webhook to a protected preview URL. The webhook will not run, and Premium will not turn on, until one of these is true:

- the webhook points at production (`https://startap.fun/api/flutterwave/webhook`), which is not behind preview SSO, or
- a protection bypass is set for that preview and Flutterwave is given the bypass (do not commit the bypass secret).

This repo does not set that bypass.

## Supabase

`supabase/migrations/0001_premium.sql` is the migration that was applied to the StarTap project on 17 October 2026. Do not edit it and do not run it again. It creates:

- `profiles` (`user_id` primary key, email, created_at)
- `payments` (unique `tx_ref`, unique `flutterwave_transaction_id`, user, plan `premium_monthly` or `premium_yearly`, amount, currency `NGN` or `USD`, status `pending` / `successful` / `failed` / `cancelled`, `verified_at`)
- `entitlements` (`user_id` primary key, plan, status, provider, period start and end)
- `webhook_events` (`event_key` primary key, `received_at`, `processed_at`)

Row level security lets a signed-in user read only their own profile, payments and entitlement. There are no insert, update or delete policies. `webhook_events` has no policies. Browser roles cannot write. The service role in the API routes writes. `handle_new_user` and `touch_updated_at` are not executable by `anon` or `authenticated`.

Auth → URL configuration:

- Site URL: `https://startap.fun`
- Redirect allow-list: `https://startap.fun/account/` and `https://startap.fun/account`
- Local: `http://localhost:3000/account/`
- Add a preview origin only if that preview should send magic links, for example `https://<preview>.vercel.app/account/`

There is no separate `/auth/callback` route. The magic-link redirect (`emailRedirectTo`) is `/account/`. The account page reads the session from that URL. Sign-in is email magic link and a one-time code (`signInWithOtp`, `verifyOtp`). A trigger inserts `profiles.user_id` on signup.

## Flutterwave test setup

Checked on 17 October 2026:

- Standard checkout: [developer.flutterwave.com/reference/checkout](https://developer.flutterwave.com/reference/checkout) — `POST https://api.flutterwave.com/v3/payments`, `Authorization: Bearer`, body includes `payment_plan`. The example key prefix is `FLWSECK_TEST-`. Test mode returns a hosted link on `checkout-v2.dev-flutterwave.com`. That host is accepted only when `FLW_SECRET_KEY` starts with `FLWSECK_TEST-`. A live key accepts only `https://checkout.flutterwave.com`.
- Testing: [developer.flutterwave.com/v3.0/docs/testing](https://developer.flutterwave.com/v3.0/docs/testing) — test cards work only in Test Mode. PIN Mastercard `5531886652142950`, expiry `09/32`, CVV `564`, OTP `12345`, PIN `3310`. 3DS Visa `4187427415564246`, expiry `09/32`, CVV `828`, OTP `12345`, PIN `3310`.
- Webhooks: [developer.flutterwave.com/docs/webhooks](https://developer.flutterwave.com/docs/webhooks) — Settings → Webhooks, set the URL, set a secret hash, check all the boxes, save. Flutterwave sends the hash in `verif-hash`. Sample events include `charge.completed` and `subscription.cancelled`.
- Verify: `GET https://api.flutterwave.com/v3/transactions/{id}/verify`. A checkout that returns with no transaction id is checked with `GET https://api.flutterwave.com/v3/transactions/verify_by_reference?tx_ref=`.

Dashboard, in Test Mode:

1. Settings → Webhooks → URL `https://startap.fun/api/flutterwave/webhook`
2. Secret hash: any long random string. Put the same value in Vercel as `FLW_SECRET_HASH`.
3. Check all the webhook boxes (the guide's instruction) and save. This server grants on `charge.completed` only after verify says `successful`, and it handles `subscription.cancelled`. Other events are recorded and ignored.
4. Settings → API keys: copy the test secret (`FLWSECK_TEST-...`) to `FLW_SECRET_KEY`. Do not use a live key for this test. The public key is not used; checkout is created on the server.
5. Payment plans: create four plans whose amounts match the approved USD and NGN catalogue prices, then put the numeric ids in the env vars:
   - NGN monthly 2500 → `FLW_PLAN_MONTHLY_NGN` (stored plan `premium_monthly`)
   - USD monthly 5 → `FLW_PLAN_MONTHLY_USD`
   - NGN yearly 25000 → `FLW_PLAN_YEARLY_NGN` (stored plan `premium_yearly`). Existing test plans: 246244 NGN 2500 monthly, 246245 USD 5 monthly, 246246 NGN 25000 yearly, 246247 USD 40 yearly.
   - USD yearly 40 → `FLW_PLAN_YEARLY_USD`

The server ignores any amount, country, plan id or return URL sent by the browser. `currency` is accepted only as `local` or `USD`; any other value is 400 and is never the charged currency. A verified charge whose id, amount, currency, `tx_ref` or payment plan does not match the pending row does not grant Premium. The verify call accepts the plan as `payment_plan`, as `plan.id`, or as a bare `plan` number or numeric string (test mode returns `"plan": 246244`). The id is compared as a string with the `FLW_PLAN_*` value. Test mode rewrites the customer email (`ravesb_<hex>_…`) and drops the `+` tag. That email is not compared to the StarTap account. The user is the one stored on the payment row when checkout created the `tx_ref`. `/payment/success` does not grant Premium. Both the webhook and `POST /api/flutterwave/verify-payment/` call the same finalize function. The idempotency key is `charge.completed:<flutterwave transaction id>` on `webhook_events`, and a payment moves from `pending` to `successful` once.

A rejected charge still inserts that event key, and the key is final. Retrying the webhook or the success page does not grant Premium for the same transaction. Recovering it is manual: support has to repair the payment and the entitlement for that charge. This code does not delete or rewrite a rejected event key.

An entitlement that is still active (including `cancelled` with time left) makes `POST /api/flutterwave/create-checkout` return `409` `{ "error": "already_premium" }` before any pending row is written. The Premium page syncs the signed-in session before it reads status, then hides the plan picker and shows “Premium is on until” the period end, with a link to `/account`. If a verified charge for a different plan still arrives, the payment is marked successful and the outcome reason is `plan_conflict`. The entitlement keeps the longer plan (`premium_yearly` over `premium_monthly`). The incoming period is added after the later of now and the current end, so paid time is never shortened and a monthly charge does not relabel a yearly entitlement. A yearly charge may relabel monthly to yearly. The same plan extends as before and is not `plan_conflict`. The log line is `{ "scope": "startap-payments", "event": "finalize", "reason": "plan_conflict" }`.

`POST /api/flutterwave/verify-payment/` answers `{ "status": "active" }`, `{ "status": "pending" }`, `{ "status": "failed" }`, or `{ "status": "cancelled" }` from the stored payment and entitlement after the write. It does not return the provider payload, and it does not trust `status` from the browser. `tx_ref` must be one this server minted (`parseTxRef`) and `transaction_id` must be 1–20 digits. Anything else, including an empty value, is `400` before the database or Flutterwave is called. A call with only `tx_ref` uses verify-by-reference. No successful transaction cancels that user's own pending row. The event key is `checkout.cancelled:<tx_ref>`, so a later `charge.completed:<id>` can still grant. A verified charge whose status is `failed` or `cancelled` is stored as that status. A verified `pending` charge leaves the row pending. A `401`, `403`, or provider outage returns 503 and does not cancel the row. `failed` means we could not confirm the payment; the page tells the player to contact sales@startap.fun. `cancelled` is checkout closed, with no "payment received" heading.

No new SQL is required for cancelled or failed charges. `payments.status` already allows `cancelled` in `supabase/migrations/0001_premium.sql`. A charge in any currency other than `NGN` or `USD` needs `supabase/migrations/0002_payment_currencies.sql`. That file is not applied.

### Approved and unapproved prices

`src/lib/payments/plans.ts` gives every row a `priceStatus`. USD (monthly 5, yearly 40) and NGN (monthly 2500, yearly 25000) are `APPROVED` final prices, approved by Victor on Oct 17, 2026. They match Flutterwave test plans 246244–246247. They are not live-verified: `recurringVerified` and `liveVerified` stay false and payments stay off in production. Every other row is `UNAPPROVED` and disabled, and an `UNAPPROVED` row cannot be charged even with plan ids set. Disabled researched placeholders: GHS 25 / 200, KES 250 / 2000, ZAR 40 / 320, UGX 7000 / 55000, TZS 4500 / 35000, EUR 4.49 / 35.99, GBP 3.99 / 29.99. RWF, ZMW, EGP, MAD, XOF and XAF are unchanged and still disabled. Sources for the researched rows: World Bank PPP PA.NUS.PRVT.PP and FX PA.NUS.FCRF, 2024, a 0.35 price-level floor for African markets, and yearly at about 8 times monthly. The page shows the UNAPPROVED label only for an unapproved offer; approved USD and NGN offers show no placeholder label. Change the catalogue and the Flutterwave plan amounts together before real charges.

## Routes

| Route | Behaviour |
| --- | --- |
| `GET /api/pricing` | Server price for this request's country. Optional `currency=local` or `currency=USD`. No other currency value. 503 while payments are off. |
| `POST /api/flutterwave/create-checkout` | Bearer JWT required. Plan plus `local` or `USD`. Country and amount in the body are ignored. Any other `currency` is 400. `409` `already_premium` when the entitlement is still active. Writes the pending payment at the server amount and currency, then returns the hosted link. |
| `POST /api/flutterwave/webhook` | Checks `verif-hash`, then verifies the transaction with Flutterwave. Idempotent. |
| `POST /api/flutterwave/verify-payment` | Signed-in confirmation. Validates `tx_ref` and `transaction_id` first. Verifies with Flutterwave (by id, or by reference when there is no id), uses the same finalize path as the webhook, and returns `active`, `pending`, `failed`, or `cancelled` from the stored rows. |
| `GET /api/subscription/status` | Server source of truth for Premium. When payments are off this is `200` with `paymentsEnabled: false`. |
| `/premium` | Free vs Premium. Shows the server offer. The UNAPPROVED label appears only for an unapproved offer. A local / USD toggle appears only when both are chargeable. An active or not-yet-expired member sees “Premium is on until” their period end and a link to `/account`. Hidden (404) while payments are off. |
| `/login`, `/account` | Email OTP, plan, status, renewal or expiry, sign out. Hidden (404) while payments are off. |
| `/payment/success` | Used when Flutterwave sends a 1–20 digit `transaction_id` and the query status is not `cancelled`. Posts that id and `tx_ref` once, then polls. The heading follows the server status. Does not grant Premium by itself. |
| `/payment/cancel` | Shown for `status=cancelled` or a missing transaction id. Posts only `tx_ref` when the player is signed in. Heading is checkout closed, still confirming, payment failed, or premium is on. Does not grant Premium by itself. |

While `STARTAP_PAYMENTS_ENABLED` is unset, `create-checkout`, `GET /api/pricing`, the webhook, and `verify-payment` return `503` `{ "error": "Payments are not available" }`. The payment pages, `/premium`, `/login`, and `/account` are 404. The merge does not turn payments on.

Checkout is limited to 20 requests a minute per IP and 8 a minute per user. The verify route allows 30 a minute per IP and 12 a minute per user. The webhook allows 120 a minute per IP. Status and pricing each allow 60 a minute per IP. The limiter is per server instance, not a global lock.

The return URL is built from the request host only when that host is `startap.fun`, `www.startap.fun`, `localhost`, `127.0.0.1`, or `*.vercel.app` (https, or http on localhost). Otherwise it is `https://startap.fun`. The path is always `/payment/success/`.

Logs from the webhook include a result and a `tx_ref`. They do not include the secret key, the hash, card numbers or tokens.

## Android

`npm run build:mobile` still static-exports to `.next-mobile`. The leak scan rejects the words `supabase` and `flutterwave` anywhere in that output. Account and payment UI are compiled out of the Android render by `IS_ANDROID_BUILD` / the payments flag, which the mobile build bakes off. The app has no accounts and stores progress locally. The website legal pages name the processor; the Android copies do not.
