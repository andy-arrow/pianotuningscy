// @ts-check
import { defineConfig } from 'astro/config';
import sitemap, { ChangeFreqEnum } from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { readFile, writeFile } from 'node:fs/promises';

// Apex, not www: Netlify serves the apex as the primary domain and 301s
// www -> apex. Canonical tags, the sitemap, hreflang and schema must agree
// with that, or Google sees a page redirect to a URL that disclaims itself.
export const SITE = 'https://pianotuningscy.com';

/**
 * Preview deploys (GitHub Pages) set these. A preview is served from /<repo>/,
 * is marked noindex everywhere, and shows a review banner — so it can never be
 * mistaken for, or compete in search with, the real site.
 */
const PREVIEW_SITE = process.env.PREVIEW_SITE;
const PREVIEW_BASE = process.env.PREVIEW_BASE;

/**
 * Most old Wix links were indexed as https://www.… or http://… . Netlify first
 * sends those to https://pianotuningscy.com and only then applies the legacy
 * rules in public/_redirects, so an old link took two or three 301s. Each
 * legacy rule is repeated here for those hosts, pointing straight at the final
 * page, so every old link lands in one hop.
 */
const LEGACY_HOSTS = ['https://www.pianotuningscy.com', 'http://www.pianotuningscy.com', 'http://pianotuningscy.com'];
/** @type {() => import('astro').AstroIntegration} */
const legacyHostRedirects = () => ({
  name: 'legacy-host-redirects',
  hooks: {
    'astro:build:done': async ({ dir }) => {
      const file = new URL('_redirects', dir);
      const rules = (await readFile(file, 'utf8')).split('\n').flatMap((line) => {
        const m = line.match(/^(\/\S*)\s+(\/\S*)\s+(301|302)\s*$/);
        if (!m) return [line];
        const [, from, to, code] = m;
        // Host rules first: the bare path rule below would otherwise match first.
        return [...LEGACY_HOSTS.map((host) => `${host}${from}  ${SITE}${to}  ${code}!`), line];
      });
      await writeFile(file, rules.join('\n'));
    },
  },
});

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
    // A review deploy publishes no sitemap or host redirects — see src/pages/robots.txt.ts
    ...(PREVIEW_SITE || PREVIEW_BASE ? [] : [sitemap({
      i18n: { defaultLocale: 'en', locales: { en: 'en-CY', el: 'el-CY' } },
      // Thank-you pages are noindex; a sitemap lists only pages meant for search.
      filter: (page) => !/\/(thanks|efcharistoume|404)\b/.test(page),
      changefreq: ChangeFreqEnum.MONTHLY,
      priority: 0.7,
      serialize(item) {
        if (item.url === `${SITE}/`) { item.priority = 1.0; item.changefreq = ChangeFreqEnum.WEEKLY; }
        if (item.url.includes('/book')) item.priority = 0.9;
        if (item.url.includes('/services/')) item.priority = 0.8;
        return item;
      },
    }), legacyHostRedirects()]),
  ],
  vite: { plugins: [tailwindcss()] },
});
