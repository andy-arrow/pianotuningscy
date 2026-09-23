# Piano Tunings Cy — website

Rebuild of [pianotuningscy.com](https://www.pianotuningscy.com), replacing a Wix site
whose forensic audit is in [`AUDIT.md`](./AUDIT.md) (141 verified findings, 40 critical).

Astro 7 + Tailwind 4, statically generated, fully bilingual EN/EL.

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # → dist/
npm run preview  # serve the built site
npm run check    # type + template diagnostics
```

---

## Before it goes live

Four things need a decision or a real value. Everything else works as-is.

| # | What | Where |
|---|---|---|
| 1 | **Form delivery.** On Netlify it works untouched (Netlify Forms picks up `data-netlify`). Anywhere else, set an endpoint (Formspree, Web3Forms, your own API). | `src/data/site.ts` → `forms.endpoint` |
| 2 | **Analytics.** Plausible is wired and cookieless, so no consent banner is needed — but the account must exist. Clear the field to ship with no tracking at all. Only add GA4 if you accept needing a consent banner. | `src/data/site.ts` → `analytics` |
| 3 | **Opening hours.** Currently Mon–Fri 08:00–19:00, Sat 09:00–15:00 as a placeholder. Confirm with Kleanthis — these are published in `LocalBusiness` schema and Google will show them. | `src/data/site.ts` → `hours` |
| 4 | **Legal review.** Privacy, cookie and terms pages are written honestly against what the site actually does, but a Cypriot lawyer should sign them off. | `src/data/legal.ts` |

Deliberately **not** published: a street address. The old site's partial address hurt
more than it helped, and this is a mobile, at-your-home business — it is modelled as a
service-area business instead. If Kleanthis wants a Google Business Profile with a
verified address, add it to `site.address` and it flows into the schema automatically.

### Also fix outside this repo

- **DNS: add SPF, DKIM and DMARC.** The domain has none, so `@pianotuningscy.com` is
  spoofable and outbound mail is more likely to be filtered. One DNS change, big win.
- **Google Business Profile** — claim it, add the service areas, and link it.
- **Google Search Console** — submit `https://www.pianotuningscy.com/sitemap-index.xml`
  and watch the `/blank-N` URLs redirect cleanly.

---

## Structure

```
src/
  data/          Single source of truth — edit content here, not in templates
    site.ts          business facts, contact, service areas, form + analytics config
    services.ts      8 services, bilingual copy, prices, durations
    faq.ts           12 bilingual Q&As, feed FAQPage schema
    testimonials.ts  the 4 real reviews carried over, EN + EL
    areaContent.ts   distinct per-city copy for the 5 service-area pages
    pageContent.ts   long-form homepage + about prose
    legal.ts         privacy / cookies / terms, both languages
  i18n/ui.ts     UI strings, translated slugs, locale-aware URL helpers
  lib/schema.ts  all structured data
  layouts/       Base.astro — head, meta, schema, hreflang, analytics
  components/    Header, Footer, Hero, ServiceCard, EnquiryForm, …
  views/         one per page type, locale-parameterised
  pages/         thin route files; `pages/el/**` mirrors with Greek slugs
public/          favicons, OG images, robots.txt, _redirects
```

**Adding a service** — append to `src/data/services.ts` with both `en` and `el` blocks
and an `elSlug`. Routes, cards, footer links, sitemap, schema and the booking dropdown
all pick it up. Same for `serviceAreas` in `site.ts`.

---

## How the bilingual side works

The old site declared `lang="el"` and served English. Here Greek is a real translation:
copy, metadata, URL slugs, schema and form labels.

- English at `/`, Greek at `/el/` — `prefixDefaultLocale: false`.
- Slugs are translated: `/services/piano-tuning/` ↔ `/el/ypiresies/kourdisma-pianou/`.
- `hreflang` is `en-CY` / `el-CY` + `x-default`, not the `en-us` the old site shipped.
- The language switcher is real `<a>` links to the *equivalent* page, so both locales
  are crawlable and switching never dumps you on the homepage.
- Greek grammar that templates get wrong is stored as finished strings: city names
  carry an `elIn` form (`στη Λεμεσό`, `στην Πάφο`), and duration units have separate
  singular/plural entries (`1 ώρα` / `8 ώρες`).

`t()` falls back to English rather than rendering a raw key, so a missing string
degrades to readable text instead of `label.foo`.

---

## Structured data

Every page emits one `@graph`: `LocalBusiness` + `Person` + `WebSite` + `WebPage`,
plus `Service`/`Offer`, `FAQPage`, `Review`, `BreadcrumbList` and `ItemList` where
they apply. The old site had a two-field `WebSite` node and nothing else.

`AggregateRating` is deliberately **omitted**. The four testimonials carried over have
no star ratings attached; inventing them would be dishonest and a Google structured-data
violation. Once there are real Google reviews, add `aggregateRating` sourced from them.

---

## Measured against the old site

| | Wix | This |
|---|---:|---:|
| Homepage HTML | 906 KB | **77 KB** |
| JS bundles | ~108 | **1** |
| JS shipped | 4.6–6.9 MB | **2.5 KB** |
| Pages with `tel:` links | 0 | **all 52** |
| Homepage `<h1>` | 0 | 1 |
| Schema types | 1 | 10 |
| Indexable pages | 13 | 49 |
| Legal pages | 0 (404) | 3 × 2 languages |

Verify after any change:

```bash
npm run check && npm run build
```

---

## Deployment

Built for **Netlify** out of the box — `netlify.toml` sets the build, security headers
(CSP, HSTS with preload, Referrer-Policy, Permissions-Policy — Wix set none of these)
and immutable caching for `/_astro/*`. `public/_redirects` maps every legacy Wix URL,
including `/blank-1`…`/blank-4`, `/service-page/*` and the Wix booking calendar, so no
ranking or bookmark is lost.

Cloudflare Pages reads the same two files. For Vercel, port `netlify.toml` to
`vercel.json` — the redirect map in `public/_redirects` is the part that matters.

**Keep the redirects.** They are what preserves 14 years of accumulated ranking.

---

## Known next steps

- **Education/guides section.** The audit found zero technical-authority content and
  real local search demand for it. The FAQ covers the highest-value questions; a
  `/guides/` section (humidity in the Cypriot climate, what a pitch raise is, buying
  second-hand) is the biggest remaining SEO opportunity.
- **Real Google reviews.** The old review form funnelled testimonials into a private
  Wix inbox where they influenced nobody. Point happy customers at a Google review link
  instead, then add `aggregateRating`.
- **The video library.** Five videos on the old homepage (including the Cyprus Symphony
  Orchestra Steinway move) are still on Wix. Worth re-hosting and giving a gallery page.
