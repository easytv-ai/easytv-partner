<div align="center">

# EasyTV Partner

**Partner console of [EasyTV](https://easytv.ai) — the open-source AI short-drama platform.**

[![CI](https://github.com/easytv-ai/easytv-partner/actions/workflows/ci.yml/badge.svg)](https://github.com/easytv-ai/easytv-partner/actions/workflows/ci.yml)
[![License: AGPL-3.0](https://img.shields.io/badge/License-AGPL--3.0-blue.svg)](LICENSE)
[![License: Commercial](https://img.shields.io/badge/License-Commercial-orange.svg)](COMMERCIAL-LICENSE.md)
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
cp .env.example .env.development
pnpm dev                        # http://localhost:3010
```

The API defaults to `http://localhost:8383`. `pnpm dev` talks to a local API
without an env file. A public deploy must set `NUXT_PUBLIC_API_BASE_URL`.
The studio link defaults to `http://localhost:3005`.

Sign in with any EasyTV account (SMS code or password). Accounts that are
not partners yet land on the application page.

### Environment

Development reads `.env.development`, production builds read
`.env.production`. Missing files fall back to the defaults in
`nuxt.config.ts`. Neither file is committed; `.env.example` is the reference.

| Variable | Purpose |
| --- | --- |
| `NUXT_PUBLIC_SITE_NAME` | Site name in the title bar (default `EasyTV`) |
| `NUXT_PUBLIC_API_BASE_URL` | `easytv-api` base URL (default `http://localhost:8383`) |
| `NUXT_PUBLIC_STUDIO_URL` | Creator studio URL for the "Official site" link and referral-link fallback (default `http://localhost:3005`) |

## Build & Deploy

```bash
pnpm typecheck        # vue-tsc
pnpm build            # Cloudflare Workers preset (wrangler.jsonc)
pnpm deploy           # build + wrangler deploy
```

### Docker

A `Dockerfile` (Node server preset) is included for self-hosters, and a
multi-arch image is published to GHCR. One image serves any deployment: the
three variables above are read when the container starts.

```bash
docker run -d -p 3010:3010 \
  -e NUXT_PUBLIC_API_BASE_URL=https://api.example.com \
  -e NUXT_PUBLIC_STUDIO_URL=https://studio.example.com \
  ghcr.io/easytv-ai/easytv-partner:latest
```

These are addresses the **browser** uses, so they must be reachable from the
partner's machine (not a Docker-internal service name). URL values must start
with `http://` or `https://`; anything else is ignored and the build-time
default stays in effect.

How it works: pages are prerendered, so the HTML carries build-time values.
The Node server answers `/config.js` from its environment, every page loads
that script before the app starts, and a plugin applies it to the public
runtime config. On a plain static host (`pnpm generate`) there is no
`/config.js`, and the values from the build are used.

The `docker-compose.yml` in [`easytv-api`](https://github.com/easytv-ai/easytv-api)
starts the whole stack, this console included, with
`docker compose --profile full up -d`.

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

EasyTV Partner is **dual-licensed**:

| You want to… | Use |
| --- | --- |
| Study, modify, or self-host and you will follow AGPL-3.0 (including publishing corresponding source if you offer a modified version as a network service) | [GNU Affero GPL v3.0](LICENSE) |
| Ship a closed-source product, or host a modified version as SaaS / white-label **without** those AGPL obligations | [Commercial License](COMMERCIAL-LICENSE.md) |

The commercial terms in the repo are a template. They apply only after you and
the EasyTV copyright holders sign an Order. Write to
[leida@easyapi.com](mailto:leida@easyapi.com) with `[LICENSE] easytv-partner` in
the subject. [简体中文译本](COMMERCIAL-LICENSE.zh-CN.md) is provided for
convenience; the English text governs.
