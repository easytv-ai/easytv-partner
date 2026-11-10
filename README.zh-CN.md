<div align="center">

# EasyTV Partner

**[EasyTV](https://easytv.ai) 代理商后台 —— 开源的 AI 短剧创作平台。**

[![CI](https://github.com/easytv-ai/easytv-partner/actions/workflows/ci.yml/badge.svg)](https://github.com/easytv-ai/easytv-partner/actions/workflows/ci.yml)
[![License: AGPL-3.0](https://img.shields.io/badge/License-AGPL--3.0-blue.svg)](LICENSE)
[![License: Commercial](https://img.shields.io/badge/License-Commercial-orange.svg)](COMMERCIAL-LICENSE.zh-CN.md)
[![Nuxt 4](https://img.shields.io/badge/Nuxt-4-00DC82?logo=nuxt.js&logoColor=white)](https://nuxt.com)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

[English](README.md) · [简体中文](README.zh-CN.md) · [后端](https://github.com/easytv-ai/easytv-api) · [创作台](https://github.com/easytv-ai/easytv-web) · [运营后台](https://github.com/easytv-ai/easytv-manage)

</div>

EasyTV Partner 是自托管 EasyTV 的渠道伙伴（代理商）自助后台：MCN、院校、KOL、开发者用自己的 EasyTV 账号登录，提交入驻申请，审核通过后获得专属链接与专属码，查看归属客户与返佣看板、申请提现、查看口令红包效果并拿到现成的推广物料。它是一个 Nuxt 4 单页应用，对接 [`easytv-api`](https://github.com/easytv-ai/easytv-api) 的 `/user/partner/*` 接口。

## 伙伴能做什么

| 领域 | 页面 |
| --- | --- |
| **看板** | 累计与本月的客户数、付费客户、成交与返佣；7 / 30 / 90 天趋势图；最近归属客户 |
| **归属客户** | 归属客户列表（昵称脱敏）、来源、首次付费、累计实付与带来的返佣 |
| **返佣与提现** | 返佣流水、提现记录、申请提现（支付宝 / 微信 / 银行卡） |
| **口令红包** | 运营归属给伙伴的口令，含领取数、带来注册与付费转化 |
| **推广物料** | 专属链接 + 二维码、专属码、可直接复制的文案、归属与返佣规则 |
| **入驻与资料** | 申请、查看审核状态、驳回后重新提交、维护联系方式 |

返佣比例、归因窗口与审核都在 [`easytv-manage`](https://github.com/easytv-ai/easytv-manage) 配置（系统 → 增长，以及「渠道伙伴」页）。管理员也可以在「渠道伙伴」页用一次性凭证直接进入某个伙伴的后台。

## 快速开始

需要 Node.js 22.5+ 与 [pnpm](https://pnpm.io) 10+（`corepack enable` 会安装 `package.json` 里锁定的版本）。

```bash
git clone https://github.com/easytv-ai/easytv-partner.git
cd easytv-partner
pnpm install
cp .env.example .env.development
pnpm dev                        # http://localhost:3010
```

缺省接口是本机 `http://localhost:8383`，创作台缺省 `http://localhost:3005`。线上部署要自己改这两项，不要沿用缺省值。

用任意 EasyTV 账号登录（手机验证码或密码）。还不是伙伴的账号会落到入驻申请页。

### 环境变量

开发读 `.env.development`，生产构建读 `.env.production`。文件不存在时用 `nuxt.config.ts` 里的默认值。两者都不入库，以 `.env.example` 为准。

| 变量 | 用途 |
| --- | --- |
| `NUXT_PUBLIC_SITE_NAME` | 标题栏站点名（默认 `EasyTV`） |
| `NUXT_PUBLIC_API_BASE_URL` | `easytv-api` 地址（默认 `http://localhost:8383`） |
| `NUXT_PUBLIC_STUDIO_URL` | 创作台地址，顶栏「官网」与推广链接兜底（默认 `http://localhost:3005`） |

## 构建与部署

```bash
pnpm typecheck        # vue-tsc
pnpm build            # Cloudflare Workers 预设（wrangler.jsonc）
pnpm deploy           # 构建 + wrangler deploy
```

仓库附带 `Dockerfile`（Node server 预设）供自托管；所有 `NUXT_PUBLIC_*` 都可在运行时覆盖。

## 目录结构

```
app/
  api/          HTTP 客户端与伙伴接口类型
  components/   控制台壳层、伙伴组件（指标卡、趋势图、提现弹窗、表单）
  composables/  登录会话、伙伴总览状态、提示、主题
  layouts/      console（侧栏 + 顶栏）与 simple（登录页）
  pages/        login、console（管理员凭证）、index、customers、billing、bonus-code、materials、settings、apply
i18n/locales/   zh / zh-TW / en
```

## 参与贡献

见 [CONTRIBUTING.md](CONTRIBUTING.md)。安全问题请看 [SECURITY.md](SECURITY.md)。

## 协议

EasyTV Partner 采用 **AGPL + 商业** 双许可：

| 你想… | 用这份 |
| --- | --- |
| 学习、修改或自建部署，并遵守 AGPL-3.0（把修改版作为网络服务提供给他人时，须公开对应源代码） | [GNU Affero GPL v3.0](LICENSE) |
| 做闭源产品，或以 SaaS / 白标托管修改版，且**不想**承担上述 AGPL 义务 | [商业许可协议](COMMERCIAL-LICENSE.zh-CN.md) |

仓库里的商业条款是模板，双方签署订单后才生效。写信到
[leida@easyapi.com](mailto:leida@easyapi.com)，主题加 `[LICENSE] easytv-partner`。
[English terms](COMMERCIAL-LICENSE.md) 是准据文本。
