# TradeLens

A non-custodial crypto market-data, portfolio, trading, and P2P dashboard: connect an
exchange with your own API key, see your real holdings and live prices, read technical
indicators (RSI, EMA, SMA, MACD) computed from real historical data, place manual confirmed
orders, and trade directly with other users on a P2P offer board — no fund custody, no
guaranteed returns, no fabricated stats.

This exists as an honest rebuild of a "guaranteed daily returns / AI trading bot" site that
had every hallmark of an investment scam (fixed payouts, fake trader counts, decorative
exchange logos, no license). Everything here does what it says: the exchange integrations
are real (via [ccxt](https://github.com/ccxt/ccxt)), the indicators are standard published
formulas, orders only ever happen when a human explicitly confirms one, and the app never
takes custody of funds or promises a return.

## Stack

- Next.js 14 (App Router) + TypeScript + Tailwind CSS
- Prisma + Postgres (same provider in dev and prod — see Setup)
- `ccxt` for exchange integration (Binance, Coinbase, Kraken, OKX, Bybit, KuCoin) and order placement
- `technicalindicators` for RSI/SMA/EMA/MACD
- `stripe` for Pro/Team subscription billing
- Custom auth: bcrypt password hashing + JWT session in an httpOnly cookie

## Setup

```bash
npm install
cp .env.example .env
# Replace JWT_SECRET / ENCRYPTION_KEY with your own random values:
#   openssl rand -hex 32

docker compose up -d postgres        # local Postgres on localhost:5435
npx prisma migrate dev               # applies the committed migrations
npm run dev
# App runs at http://localhost:3000 (or the next free port if that's taken)
```

Stripe billing is optional locally — the app works fully without it, and billing routes
return a clear "not configured" error instead of crashing. See **Billing setup** below to
enable it.

## Project structure

```
src/
  app/
    page.tsx                — landing page
    login/, register/       — auth pages
    dashboard/
      page.tsx               — overview: portfolio, watchlist + signals, order history
      connect/                — add an exchange connection
      billing/                — current plan, upgrade, manage billing
      p2p/                     — offer board, post offer, offer detail, conversations
      settings/               — connected exchanges, disconnect
    api/
      auth/                  — register, login, logout, me
      exchanges/              — connect/list/delete connections, fetch balance, place orders
      market/                  — public ticker + signal endpoints (no auth required)
      watchlist/               — per-user watchlist CRUD
      orders/                   — order history
      billing/                  — Stripe checkout, customer portal, webhook
      p2p/                       — offers CRUD, per-offer conversation threads, messages
  lib/
    auth.ts                  — password hashing, JWT session, getCurrentUser()
    crypto.ts                 — AES-256-GCM encryption for stored API credentials
    exchanges.ts                — server-only ccxt integration (never bundled to the client)
    exchangeList.ts              — client-safe list of supported exchanges
    signals.ts                    — RSI/EMA/SMA/MACD computation over real candles
    plans.ts                       — Free/Pro/Team feature limits
    stripe.ts                       — server-only Stripe client + price↔plan mapping
```

## Security model

- **Non-custodial.** The app never asks for or uses withdrawal permissions. Every exchange
  call is public market data, `fetchBalance()`, or a single `createOrder()` the user just
  confirmed — there is no code path that could move funds off the exchange.
- **Encrypted at rest.** API keys/secrets are encrypted with AES-256-GCM
  (`src/lib/crypto.ts`) using a server-only key before they touch the database.
- **ccxt is server-only.** `src/lib/exchanges.ts` is marked `server-only` and never imported
  from a client component — only the small `exchangeList.ts` (name/id pairs) is, so the large
  ccxt bundle never ships to the browser.
- **Orders are manual and confirmed.** Placing an order requires the dashboard's two-step
  review flow, and the API rejects any request missing an explicit `confirm: true` — there is
  no autonomous trading, bot, or strategy execution anywhere in this app.
- **Honest signals.** `computeSignals()` runs standard technical-analysis math over real
  OHLCV history and returns a plain-English explanation with every result — it never claims
  to predict price or guarantee a return, and the UI labels it as informational only.
- **P2P is an offer board, not an escrow service.** TradeLens never holds funds for a P2P
  trade — it only hosts the offer listing and a private two-party message thread. Trade
  completion (sending fiat/crypto) happens entirely off-platform, `status` on an offer is
  self-reported by its owner, and every P2P page shows a safety warning to that effect. A
  message thread is only ever visible to the offer's owner and the one counterparty who
  opened it (`P2PThread` is unique per `[offerId, counterpartyId]`).

## Billing setup

Pro/Team upgrades go through Stripe Checkout; nothing here ever sees a raw card number.

1. Create a [Stripe account](https://dashboard.stripe.com) (test mode is fine for development).
2. Create a recurring Product/Price for "Pro" (and "Team" if you want it self-serve too —
   otherwise leave `STRIPE_PRICE_ID_TEAM` unset and it stays a "Contact us" link).
3. Get your test secret key from **Developers → API keys** → set `STRIPE_SECRET_KEY`.
4. Set `STRIPE_PRICE_ID_PRO` (and `_TEAM`) to the price IDs from step 2.
5. For webhooks locally: `stripe listen --forward-to localhost:3000/api/billing/webhook`,
   then copy the `whsec_...` it prints into `STRIPE_WEBHOOK_SECRET`. In production, add a
   webhook endpoint in the Stripe dashboard pointed at
   `https://<your-domain>/api/billing/webhook` listening for `checkout.session.completed`,
   `customer.subscription.updated`, and `customer.subscription.deleted`.
6. Set `NEXT_PUBLIC_APP_URL` to your app's real URL (used for checkout redirect URLs).

The webhook is the source of truth for `user.plan` — it's never set directly from client
input, only synced from Stripe subscription events.

## What's not implemented (by design, for an MVP)

- **Order limits/precision checks.** Amount/price are validated as positive numbers, but
  exchange-specific minimums, lot sizes, and tick sizes are left to the exchange's own
  rejection — add `client.market(symbol)` precision checks before handling real user funds
  at scale, so people get a clear error before submitting instead of an exchange rejection.
- **Rate limiting / abuse protection** on the API routes beyond what ccxt's own
  `enableRateLimit` provides — add this before any public deployment.
- **Team plan self-serve** — Team is a "Contact us" link by default; wire
  `STRIPE_PRICE_ID_TEAM` if you want it self-serve too.
- **P2P has no reputation system, dispute resolution, or reporting/blocking.** It's
  intentionally minimal (offer board + messaging) to avoid the false sense of security a
  gameable rating system would create without real escrow behind it. Before wider use, add
  at minimum a way to report/block a user and rate-limit offer posting.

## Deploying (Vercel + hosted Postgres)

This repo has no CI/CD or hosting account wired up — deploying means pushing it to a Git
host and connecting your own Vercel + Postgres accounts. Rough steps:

1. **Push to GitHub** (or GitLab/Bitbucket): `git init && git add -A && git commit -m "Initial commit"`,
   create a repo, and push.
2. **Provision Postgres.** Any hosted Postgres works — [Neon](https://neon.tech) and
   [Supabase](https://supabase.com) both have a free tier that's plenty for this. Copy the
   connection string.
3. **Import the repo into Vercel** ([vercel.com/new](https://vercel.com/new)) — it auto-detects
   Next.js, no config needed.
4. **Set environment variables** in the Vercel project settings (Production + Preview):
   `DATABASE_URL`, `JWT_SECRET`, `ENCRYPTION_KEY`, `NEXT_PUBLIC_APP_URL` (your Vercel domain),
   and the `STRIPE_*` vars if billing is enabled. Generate fresh `JWT_SECRET` /
   `ENCRYPTION_KEY` — never reuse the local dev values.
5. **Run the migration against production** once, from your machine, pointed at the prod
   `DATABASE_URL`: `npx prisma migrate deploy`.
6. **Add the Stripe production webhook** (see Billing setup step 5) pointed at your real
   domain, and switch `STRIPE_SECRET_KEY`/price IDs to live-mode values when you're ready to
   take real payments.
7. Deploy. Vercel rebuilds on every push to your default branch.

I don't have a Vercel or Stripe account of my own to complete this from here — the app is
built and verified locally (migrations, build, and every API route tested against real
exchange APIs), but going live requires your own accounts for the steps above.
