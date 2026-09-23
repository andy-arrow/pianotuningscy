import type { APIRoute } from 'astro';
import { SITE } from '../../astro.config.mjs';

/**
 * robots.txt is generated rather than static so a review deploy can lock
 * crawlers out entirely. A preview is a byte-for-byte duplicate of the real
 * site; letting it be crawled would compete with pianotuningscy.com.
 */
const isPreview = import.meta.env.PUBLIC_PREVIEW === 'true';

const preview = `# Review deployment — not the live site. Indexing is disabled here.
User-agent: *
Disallow: /
`;

const production = `User-agent: *
Allow: /

# System pages carry noindex; keep them out of crawl budget too.
Disallow: /thanks/
Disallow: /el/efcharistoume/

Sitemap: ${SITE}/sitemap-index.xml
`;

export const GET: APIRoute = () =>
  new Response(isPreview ? preview : production, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
