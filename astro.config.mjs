// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

export const SITE = 'https://www.pianotuningscy.com';

/**
 * Preview deploys (GitHub Pages) set these. A preview is served from /<repo>/,
 * is marked noindex everywhere, and shows a review banner — so it can never be
 * mistaken for, or compete in search with, the real site.
 */
const PREVIEW_SITE = process.env.PREVIEW_SITE;
const PREVIEW_BASE = process.env.PREVIEW_BASE;

export default defineConfig({
  site: PREVIEW_SITE || SITE,
  ...(PREVIEW_BASE ? { base: PREVIEW_BASE } : {}),
  trailingSlash: 'always',
  build: { format: 'directory', inlineStylesheets: 'auto' },
  prefetch: { prefetchAll: true, defaultStrategy: 'viewport' },
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'el'],
    routing: { prefixDefaultLocale: false, redirectToDefaultLocale: false },
  },
  // No global `layout`/`responsiveStyles`: those inject sizing styles onto every
  // <Image>, which overrode the explicit height classes on the header logo.
  // Each image sets its own widths/sizes instead.
  integrations: [
    // A review deploy publishes no sitemap — see src/pages/robots.txt.ts
    ...(PREVIEW_SITE || PREVIEW_BASE ? [] : [sitemap({
      i18n: { defaultLocale: 'en', locales: { en: 'en-CY', el: 'el-CY' } },
      filter: (page) => !page.includes('/thanks/') && !page.includes('/404'),
      changefreq: 'monthly',
      priority: 0.7,
      serialize(item) {
        if (item.url === `${SITE}/`) { item.priority = 1.0; item.changefreq = 'weekly'; }
        if (item.url.includes('/book')) item.priority = 0.9;
        if (item.url.includes('/services/')) item.priority = 0.8;
        return item;
      },
    })]),
  ],
  vite: { plugins: [tailwindcss()] },
});
