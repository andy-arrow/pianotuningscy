/**
 * Edge-case responsive audit — the cases width-only testing misses.
 *
 *  1. Landscape phones (short viewports): does a sticky header + bottom bar
 *     leave usable room, and does anything overlap?
 *  2. 200% text zoom (WCAG 1.4.4): text must scale to 200% without clipping
 *     or horizontal scrolling.
 *  3. 400% zoom reflow (WCAG 1.4.10): 1280px at 400% = a 320px CSS viewport.
 *
 * Usage: node scripts/responsive-edge.mjs [baseUrl]
 */
import { chromium } from 'playwright';
import { readdirSync, statSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, relative } from 'node:path';

const BASE = process.argv[2] || 'http://localhost:4331';
const DIST = 'dist';

/**
 * `font` = browser default font size in px (what a user sets in browser
 * settings). This is what `em` media queries respond to, so it is the accurate
 * way to test text zoom — an author-set html{font-size} would not move them.
 * `cssZoom` additionally forces a root font-size, the harsher synthetic case
 * some accessibility extensions create.
 */
const CASES = [
  { name: 'landscape 667x375 (iPhone SE)', w: 667, h: 375 },
  { name: 'landscape 844x390 (iPhone 14)', w: 844, h: 390 },
  { name: 'landscape 932x430 (Pro Max)', w: 932, h: 430 },
  { name: 'short laptop 1280x600', w: 1280, h: 600 },
  { name: '400% reflow (320 CSS px)', w: 320, h: 800 },
  { name: 'browser font 32px @ 375', w: 375, h: 812, font: 32 },
  { name: 'browser font 32px @ 768', w: 768, h: 1024, font: 32 },
  { name: 'browser font 32px @ 1280', w: 1280, h: 800, font: 32 },
  { name: 'browser font 24px @ 1024', w: 1024, h: 768, font: 24 },
  { name: 'forced root 200% @ 375', w: 375, h: 812, cssZoom: 2 },
  { name: 'forced root 200% @ 768', w: 768, h: 1024, cssZoom: 2 },
  { name: 'forced root 200% @ 1280', w: 1280, h: 800, cssZoom: 2 },
];

function pages(dir = DIST, out = []) {
  for (const e of readdirSync(dir)) {
    const full = join(dir, e);
    if (statSync(full).isDirectory()) pages(full, out);
    // Skip iCloud Drive conflict copies ("index 2.html").
    else if (e.endsWith('.html') && !/ \d+\.html$/.test(e))
      out.push('/' + relative(DIST, full).replace(/index\.html$/, '').replace(/\\/g, '/'));
  }
  return out;
}

const probe = () => {
  const vw = window.innerWidth;
  const out = [];
  const describe = (el) => {
    const cls =
      typeof el.className === 'string' && el.className
        ? '.' + el.className.trim().split(/\s+/).slice(0, 2).join('.')
        : '';
    const t = (el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 34);
    return `${el.tagName.toLowerCase()}${cls}${t ? ` "${t}"` : ''}`;
  };

  if (document.documentElement.scrollWidth > vw + 1) {
    const culprits = [];
    for (const el of document.querySelectorAll('body *')) {
      const cs = getComputedStyle(el);
      if (cs.display === 'none' || cs.visibility === 'hidden') continue;
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.left < -50) continue;
      if (r.right > vw + 1) {
        const p = el.parentElement;
        const pr = p ? p.getBoundingClientRect() : null;
        if (!pr || pr.right <= vw + 1) culprits.push(`${describe(el)} +${Math.round(r.right - vw)}px`);
      }
    }
    out.push({
      type: 'overflow-x',
      detail: `scrollWidth ${document.documentElement.scrollWidth} > ${vw} | ${culprits.slice(0, 3).join(' ; ') || 'no single culprit'}`,
    });
  }

  // Text clipped by a fixed-height box (the classic 200%-zoom failure).
  for (const el of document.querySelectorAll('body *')) {
    const s = getComputedStyle(el);
    if (s.display === 'none' || s.visibility === 'hidden') continue;
    if (s.overflow === 'visible' && s.overflowY === 'visible') continue;
    // Visually-hidden text is clipped to 1px on purpose.
    if (el.classList.contains('sr-only') || s.clip === 'rect(0px, 0px, 0px, 0px)') continue;
    if (s.position === 'absolute' && el.clientHeight <= 1) continue;
    if (el.scrollHeight > el.clientHeight + 4 && el.clientHeight > 0) {
      // Legitimate scroll containers opt in explicitly.
      if (s.overflowY === 'auto' || s.overflowY === 'scroll') continue;
      out.push({
        type: 'clipped-text',
        detail: `${describe(el)} content ${el.scrollHeight}px in ${el.clientHeight}px box`,
      });
    }
  }

  // Does a fixed bottom bar cover the last interactive element?
  const bar = document.querySelector('[data-sticky-bar]');
  if (bar) {
    const br = bar.getBoundingClientRect();
    const covered = br.top < window.innerHeight && br.height > 0;
    if (covered && br.height > window.innerHeight * 0.35) {
      out.push({
        type: 'sticky-bar-too-tall',
        detail: `bottom bar ${Math.round(br.height)}px of ${window.innerHeight}px viewport`,
      });
    }
  }
  return out;
};

const run = async () => {
  const urls = pages().sort();
  const browser = await chromium.launch();
  const found = [];

  console.log(`Edge cases: ${urls.length} pages x ${CASES.length} scenarios\n`);

  for (const c of CASES) {
    const ctx = await browser.newContext({
      viewport: { width: c.w, height: c.h },
      isMobile: c.w < 768 && c.h > c.w,
      hasTouch: c.w <= 1024,
    });
    const page = await ctx.newPage();
    let n = 0;

    if (c.font) {
      // Change the browser's real default font size via CDP. em-based media
      // queries key off this, so it tests what a user actually experiences.
      const cdp = await ctx.newCDPSession(page);
      await cdp.send('Page.enable');
      await cdp.send('Page.setFontSizes', {
        fontSizes: { standard: c.font, fixed: c.font },
      });
    }

    for (const url of urls) {
      try {
        await page.goto(BASE + url, { waitUntil: 'load', timeout: 30000 });
        if (c.cssZoom) {
          await page.evaluate((z) => {
            document.documentElement.style.fontSize = `${100 * z}%`;
          }, c.cssZoom);
        }
        await page.waitForTimeout(200);
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        await page.waitForTimeout(120);
        const issues = await page.evaluate(probe);
        for (const i of issues) {
          found.push({ scenario: c.name, url, ...i });
          n++;
        }
      } catch (err) {
        found.push({ scenario: c.name, url, type: 'load-error', detail: String(err).slice(0, 110) });
        n++;
      }
    }
    console.log(`  ${c.name.padEnd(32)} ${n === 0 ? 'clean' : n + ' issue(s)'}`);
    await ctx.close();
  }

  await browser.close();
  mkdirSync('.audit', { recursive: true });
  writeFileSync('.audit/responsive-edge.json', JSON.stringify(found, null, 1));

  console.log(`\n${found.length} issue(s).`);
  if (found.length) {
    const grouped = {};
    for (const f of found) {
      const k = `${f.type} :: ${f.detail}`;
      (grouped[k] ||= { scenarios: new Set(), urls: new Set() });
      grouped[k].scenarios.add(f.scenario);
      grouped[k].urls.add(f.url);
    }
    for (const [k, g] of Object.entries(grouped).slice(0, 30)) {
      console.log(`\n  ${k}\n    ${g.urls.size} page(s) | ${[...g.scenarios].join(', ')}\n    e.g. ${[...g.urls][0]}`);
    }
    if (Object.keys(grouped).length > 30) console.log(`\n  ... +${Object.keys(grouped).length - 30} more`);
  }
  process.exit(found.length ? 1 : 0);
};

run();
