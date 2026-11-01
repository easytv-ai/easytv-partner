<div align="center">

# EasyTV Partner

**Partner console of [EasyTV](https://easytv.ai) — the open-source AI short-drama platform.**

[![CI](https://github.com/easytv-ai/easytv-partner/actions/workflows/ci.yml/badge.svg)](https://github.com/easytv-ai/easytv-partner/actions/workflows/ci.yml)
[![License: AGPL-3.0](https://img.shields.io/badge/License-AGPL--3.0-blue.svg)](LICENSE)
[![Nuxt 4](https://img.shields.io/badge/Nuxt-4-00DC82?logo=nuxt.js&logoColor=white)](https://nuxt.com)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

[English](README.md) · [简体中文](README.zh-CN.md) · [Backend](https://github.com/easytv-ai/easytv-api) · [Studio](https://github.com/easytv-ai/easytv-web) · [Admin](https://github.com/easytv-ai/easytv-manage)

</div>

EasyTV Partner is the self-service console for channel partners (MCNs,
schools, KOLs, developers) of a self-hosted EasyTV. A partner signs in with
their normal EasyTV account, applies for the partner program, and once
approved gets a referral link and code, a dashboard of attributed customers
and rebates, withdrawals, bonus-code performance and ready-to-share promo
materials. It is a Nuxt 4 single-page app that talks to the
`/user/partner/*` routes of [`easytv-api`](https://github.com/easytv-ai/easytv-api).

## What a partner can do

| Area | Page |
| --- | --- |
| **Dashboard** | Lifetime and month-to-date customers, paid customers, sales and rebates; 7 / 30 / 90-day trend chart; recent customers |
| **Customers** | Attributed customers (masked nicknames), source, first payment, lifetime spend and rebate |
| **Rebates & withdrawals** | Rebate ledger, withdrawal history, apply for a withdrawal (Alipay / WeChat / bank) |
| **Bonus codes** | Codes the operator assigned to the partner, with claims, sign-ups and paid conversions |
| **Promo materials** | Referral link + QR code, referral code, copy-ready templates, attribution rules |
| **Application & profile** | Apply, track review status, resubmit after rejection, edit contact details |

Rebates, attribution windows and review are configured by the operator in
[`easytv-manage`](https://github.com/easytv-ai/easytv-manage) (System →
Growth and the Partners page). Admins can also open a partner's console
with a one-time ticket from the Partners page.

## Quick Start

Requires Node.js 22.5+ and [pnpm](https://pnpm.io) 10+ (`corepack enable` installs the pinned version).

```bash
git clone https://github.com/easytv-ai/easytv-partner.git
cd easytv-partner
pnpm install
cp .env.example .env.development   # point NUXT_PUBLIC_API_BASE_URL at your API
pnpm dev                        # http://localhost:3010
```

Sign in with any EasyTV account (SMS code or password). Accounts that are
not partners yet land on the application page.

### Environment

| Variable | Purpose |
| --- | --- |
| `NUXT_PUBLIC_SITE_NAME` | Site name in the title bar |
| `NUXT_PUBLIC_API_BASE_URL` | `easytv-api` base URL |
| `NUXT_PUBLIC_STUDIO_URL` | Creator studio URL ("Official site" link and referral-link fallback) |

## Build & Deploy

```bash
pnpm typecheck        # vue-tsc
pnpm build            # Cloudflare Workers preset (wrangler.jsonc)
pnpm deploy           # build + wrangler deploy
```

A `Dockerfile` (Node server preset) is included for self-hosters; every
`NUXT_PUBLIC_*` value can be overridden at run time.

## Project layout

```
app/
  api/          HTTP client and typed partner endpoints
  components/   console shell, partner widgets (stat cards, trend chart, withdraw modal, form)
  composables/  auth session, partner overview state, toasts, theme
  layouts/      console (sidebar + header) and simple (login)
  pages/        login, console (admin ticket), index, customers, billing, bonus-code, materials, settings, apply
i18n/locales/   zh / zh-TW / en
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Security issues: [SECURITY.md](SECURITY.md).

## License

[AGPL-3.0-only](LICENSE) © EasyTV contributors.
