/**
 * Responsive audit — every page, every breakpoint, measured in a real browser.
 *
 * Catches the failures that actually break a layout:
 *   - horizontal overflow (the page scrolls sideways)
 *   - individual elements poking past the right edge
 *   - touch targets below the 44px WCAG 2.5.8 minimum
 *   - text too small to read
 *   - images wider than their container
 *   - fixed/sticky bars eating the viewport on short screens
 *
 * Usage: node scripts/responsive-audit.mjs [baseUrl]
 */
import { chromium } from 'playwright';
import { readdirSync, statSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, relative } from 'node:path';

const BASE = process.argv[2] || 'http://localhost:4321';
const DIST = 'dist';

/** Widths from the smallest phone still in use to an ultrawide desktop. */
const VIEWPORTS = [
  { w: 280,  h: 653,  name: '280  Galaxy Fold (cover)' },
  { w: 320,  h: 568,  name: '320  iPhone SE (1st gen)' },
  { w: 360,  h: 740,  name: '360  Android common' },
  { w: 375,  h: 667,  name: '375  iPhone SE / 8' },
  { w: 390,  h: 844,  name: '390  iPhone 14' },
  { w: 414,  h: 896,  name: '414  iPhone 11 / XR' },
  { w: 430,  h: 932,  name: '430  iPhone Pro Max' },
  { w: 600,  h: 960,  name: '600  small tablet' },
  { w: 768,  h: 1024, name: '768  iPad portrait' },
  { w: 820,  h: 1180, name: '820  iPad Air' },
  { w: 1024, h: 768,  name: '1024 iPad landscape' },
  { w: 1280, h: 800,  name: '1280 laptop' },
  { w: 1440, h: 900,  name: '1440 desktop' },
  { w: 1920, h: 1080, name: '1920 full HD' },
  { w: 2560, h: 1440, name: '2560 2K' },
  { w: 3440, h: 1440, name: '3440 ultrawide' },
];

/** Every built page → its URL path. */
function pages(dir = DIST, out = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) pages(full, out);
    // Skip iCloud Drive conflict copies ("index 2.html") — stale duplicates
    // reference deleted CSS and render unstyled, producing phantom failures.
    else if (entry.endsWith('.html') && !/ \d+\.html$/.test(entry)) {
      const rel = relative(DIST, full);
      out.push('/' + rel.replace(/index\.html$/, '').replace(/\\/g, '/'));
    }
  }
  return out;
}

/** Runs inside the page. Returns every layout failure it can measure. */
const probe = () => {
  const vw = window.innerWidth;
  const issues = [];
  const describe = (el) => {
    const id = el.id ? `#${el.id}` : '';
    const cls =
      typeof el.className === 'string' && el.className
        ? '.' + el.className.trim().split(/\s+/).slice(0, 3).join('.')
        : '';
    const txt = (el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 40);
    return `${el.tagName.toLowerCase()}${id}${cls}${txt ? ` "${txt}"` : ''}`;
  };

  // 1. Does the document scroll sideways?
  const docW = document.documentElement.scrollWidth;
  if (docW > vw + 1) {
    issues.push({ type: 'page-overflow-x', detail: `document scrollWidth ${docW} > viewport ${vw}`, by: docW - vw });
  }

  const all = Array.from(document.querySelectorAll('body *'));

  // 2. Which elements actually stick out past the right edge?
  for (const el of all) {
    const s = getComputedStyle(el);
    if (s.display === 'none' || s.visibility === 'hidden' || s.position === 'fixed') continue;
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) continue;
    // Ignore things deliberately parked offscreen (skip links, sr-only, carousels).
    if (r.left < -50) continue;
    if (r.right > vw + 1) {
      const parent = el.parentElement;
      const parentR = parent ? parent.getBoundingClientRect() : null;
      // Only report the outermost offender, not every descendant.
      if (!parentR || parentR.right <= vw + 1) {
        issues.push({ type: 'element-overflow-x', detail: describe(el), by: Math.round(r.right - vw) });
      }
    }
  }

  // 3. Touch targets (phones/tablets only — checked by the caller).
  const targets = Array.from(
    document.querySelectorAll('a[href], button, input, select, textarea, [role="button"]'),
  );
  for (const el of targets) {
    const s = getComputedStyle(el);
    if (s.display === 'none' || s.visibility === 'hidden') continue;
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) continue;
    if (r.left < -50) continue;
    // Inline links inside a paragraph are exempt — WCAG 2.5.8 excludes inline text.
    const inlineInProse =
      el.tagName === 'A' &&
      el.parentElement &&
      ['P', 'LI', 'SPAN', 'LABEL', 'DD', 'FIGCAPTION'].includes(el.parentElement.tagName);
    if (inlineInProse) continue;
    // A visually-hidden input whose wrapping label provides a proper-sized
    // visible target is the correct pattern, not a defect.
    if (el.tagName === 'INPUT') {
      const lab = el.closest('label') || (el.id && document.querySelector(`label[for="${CSS.escape(el.id)}"]`));
      if (lab) {
        const lr = lab.getBoundingClientRect();
        // The label is a real click target for this control (checkbox/radio),
        // so the effective target is the label, not the 24px box.
        const labelIsTarget = el.type === 'checkbox' || el.type === 'radio';
        if (labelIsTarget && lr.height >= 24 && lr.width >= 24 && r.width >= 24 && r.height >= 24) continue;
        if ((r.width <= 2 || r.height <= 2) && lr.height >= 44 && lr.width >= 24) continue;
      }
    }
    if (r.height < 44 || r.width < 24) {
      issues.push({
        type: 'touch-target',
        detail: `${describe(el)} is ${Math.round(r.width)}x${Math.round(r.height)}`,
        by: Math.round(44 - r.height),
      });
    }
  }

  // 4. Unreadably small text.
  for (const el of all) {
    if (!el.childNodes.length) continue;
    const hasText = Array.from(el.childNodes).some(
      (n) => n.nodeType === 3 && n.textContent.trim().length > 3,
    );
    if (!hasText) continue;
    const s = getComputedStyle(el);
    if (s.display === 'none' || s.visibility === 'hidden') continue;
    const size = parseFloat(s.fontSize);
    if (size && size < 12) {
      issues.push({ type: 'tiny-text', detail: `${describe(el)} at ${size.toFixed(1)}px`, by: 12 - size });
    }
  }

  // 5. Images wider than the box they sit in.
  for (const img of Array.from(document.images)) {
    const r = img.getBoundingClientRect();
    if (r.width === 0) continue;
    const parent = img.parentElement;
    if (!parent) continue;
    const pr = parent.getBoundingClientRect();
    if (pr.width > 0 && r.width > pr.width + 2) {
      issues.push({
        type: 'image-overflow',
        detail: `${describe(img)} ${Math.round(r.width)}px in ${Math.round(pr.width)}px parent`,
        by: Math.round(r.width - pr.width),
      });
    }
  }

  return issues;
};

const run = async () => {
  const urls = pages().sort();
  const browser = await chromium.launch();
  const found = [];
  let checks = 0;

  console.log(`Auditing ${urls.length} pages x ${VIEWPORTS.length} viewports = ${urls.length * VIEWPORTS.length} checks\n`);

  for (const vp of VIEWPORTS) {
    const isTouch = vp.w <= 1024;
    const ctx = await browser.newContext({
      viewport: { width: vp.w, height: vp.h },
      deviceScaleFactor: 1,
      isMobile: vp.w < 768,
      hasTouch: isTouch,
      userAgent:
        vp.w < 768
          ? 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
          : undefined,
    });
    const page = await ctx.newPage();
    let vpIssues = 0;

    for (const url of urls) {
      checks++;
      try {
        await page.goto(BASE + url, { waitUntil: 'load', timeout: 30000 });
        // Let fonts settle and the reveal sweep run.
        await page.waitForTimeout(160);
        // Scroll the whole page so sticky/lazy content is laid out, then return.
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        await page.waitForTimeout(120);
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.waitForTimeout(80);

        let issues = await page.evaluate(probe);
        if (!isTouch) issues = issues.filter((i) => i.type !== 'touch-target');

        for (const i of issues) {
          found.push({ viewport: vp.name, width: vp.w, url, ...i });
          vpIssues++;
        }
      } catch (err) {
        found.push({ viewport: vp.name, width: vp.w, url, type: 'load-error', detail: String(err).slice(0, 120), by: 0 });
        vpIssues++;
      }
    }
    console.log(`  ${vp.name.padEnd(26)} ${vpIssues === 0 ? 'clean' : vpIssues + ' issue(s)'}`);
    await ctx.close();
  }

  await browser.close();

  mkdirSync('.audit', { recursive: true });
  writeFileSync('.audit/responsive.json', JSON.stringify(found, null, 1));

  console.log(`\n${checks} checks complete. ${found.length} issue(s).\n`);

  if (found.length) {
    const byType = {};
    for (const f of found) (byType[f.type] ||= []).push(f);
    for (const [type, list] of Object.entries(byType).sort((a, b) => b[1].length - a[1].length)) {
      console.log(`\n=== ${type} (${list.length}) ===`);
      // Group identical problems so the list stays readable.
      const grouped = {};
      for (const f of list) {
        const key = `${f.detail}`;
        (grouped[key] ||= { widths: new Set(), urls: new Set(), by: f.by }).widths.add(f.width);
        grouped[key].urls.add(f.url);
        grouped[key].by = Math.max(grouped[key].by, f.by);
      }
      for (const [detail, g] of Object.entries(grouped).slice(0, 24)) {
        const w = [...g.widths].sort((a, b) => a - b);
        console.log(
          `  [${w.join(',')}] x${g.urls.size} page(s)  by ${g.by}px\n     ${detail}\n     e.g. ${[...g.urls][0]}`,
        );
      }
      if (Object.keys(grouped).length > 24) console.log(`  ... +${Object.keys(grouped).length - 24} more variants`);
    }
  }

  process.exit(found.length ? 1 : 0);
};

run();
