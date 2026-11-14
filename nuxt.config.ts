import { defineNuxtConfig } from 'nuxt/config'

const prerenderPaths = [
  '/login',
  '/console',
  '/apply',
  '/customers',
  '/billing',
  '/bonus-code',
  '/materials',
  '/settings',
]

export default defineNuxtConfig({
  app: {
    head: {
      meta: [
        { name: 'robots', content: 'noindex, nofollow' },
      ],
      script: [
        // 运行时公开配置（server/routes/config.js.ts）：同步脚本，先于应用入口（module 脚本）执行，
        // 预渲染页面靠它在容器启动后拿到 NUXT_PUBLIC_* 的实际值。取不到时沿用构建期的值。
        { src: '/config.js', tagPosition: 'head' },
        {
          innerHTML: `(function(){try{var k='easytv-theme',s=localStorage.getItem(k),d=s==='dark'||(s!=='light'&&window.matchMedia('(prefers-color-scheme:dark)').matches);document.documentElement.classList.toggle('dark',d);}catch(e){}})();`,
          type: 'text/javascript',
          tagPosition: 'head',
        },
      ],
    },
  },
  ssr: false,
  experimental: {
    renderJsonPayloads: false,
    payloadExtraction: true,
    appManifest: true,
  },
  nitro: {
    prerender: {
      concurrency: 1,
      routes: (() => {
        const zhRoutes = ['/', ...prerenderPaths]
        const prefixed = ['en', 'zh-tw'] as const
        const extra = prefixed.flatMap(loc =>
          ['', ...prerenderPaths].map(p => (p ? `/${loc}${p}` : `/${loc}`)),
        )
        return [...zhRoutes, ...extra]
      })(),
      crawlLinks: true,
    },
    preset: 'cloudflare_module',
    cloudflare: {
      deployConfig: true,
      nodeCompat: true,
    },
  },
  modules: ['@nuxt/ui', '@nuxtjs/i18n', 'nitro-cloudflare-dev'],
  ui: {
    colorMode: false,
    fonts: false,
  },
  // 图标全部走本地 @iconify-json/lucide 打进客户端，不依赖 api.iconify.design（国内经常连不上）
  icon: {
    serverBundle: 'local',
    clientBundle: {
      scan: true,
      sizeLimitKb: 512,
    },
    fallbackToApi: false,
  },
  i18n: {
    defaultLocale: 'zh',
    strategy: 'prefix_except_default',
    lazy: true,
    langDir: 'locales',
    locales: [
      { code: 'zh', language: 'zh-CN', name: '简体中文', file: 'zh.json' },
      { code: 'zh-tw', language: 'zh-TW', name: '繁體中文', file: 'zh-TW.json' },
      { code: 'en', language: 'en-US', name: 'English', file: 'en.json' },
    ],
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_redirected',
      redirectOn: 'root',
    },
  } as any,
  css: ['~/assets/css/main.css'],
  vite: {
    optimizeDeps: {
      include: ['echarts/charts', 'echarts/components', 'echarts/core', 'echarts/renderers', 'vue-echarts', 'qrcode'],
    },
  },
  components: true,
  router: {
    options: {
      hashMode: false,
    },
  },
  runtimeConfig: {
    public: {
      siteName: (globalThis as any).process?.env?.NUXT_PUBLIC_SITE_NAME || 'EasyTV',
      apiBaseUrl: (globalThis as any).process?.env?.NUXT_PUBLIC_API_BASE_URL || 'http://localhost:8383',
      /** 创作台地址：顶栏「官网」与推广链接兜底 */
      studioUrl: (globalThis as any).process?.env?.NUXT_PUBLIC_STUDIO_URL || 'http://localhost:3005',
    },
  },
  future: {
    compatibilityVersion: 5,
  },
  compatibilityDate: '2024-11-14',
  devServer: {
    port: 3010,
  },
})
