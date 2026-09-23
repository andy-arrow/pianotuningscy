# Cutover runbook — pianotuningscy.com from Wix to the new static site

**Written for:** the business owner, doing this themselves, with DNS access at one.com.
**Date written:** 23 September 2026. Values marked **verify on the day** can change — check them at the source before typing.
**The one thing that must not break:** business email on `info@pianotuningscy.com`. It is carried by the MX records. You will not touch them at any point in this runbook.

---

## 0. The shape of the whole job, in one paragraph

You create a Netlify account, connect it to the existing GitHub repo, and let it build the site. You check the site completely on a temporary Netlify address while `pianotuningscy.com` is still happily serving Wix. Only when it is perfect do you change **two** records at one.com — the `A` record for the bare domain and the `CNAME` for `www` — and leave every other record alone. Netlify issues an HTTPS certificate automatically. You verify, then keep Wix paid for another month as your parachute.

Total DNS work: two rows edited. Everything else is preparation and checking.

---

## 1. Decision — which host, and why not the GitHub Pages preview

**Use Netlify. Do not point the domain at the GitHub Pages preview that is already live.**

The preview at `https://andy-arrow.github.io/pianotuningscy/` looks like a finished site, which is exactly why it is dangerous. It is built in review mode and hosted on a platform that cannot run this site's configuration. If you pointed `pianotuningscy.com` at it today, four things would break, three of them silently:

| What breaks | Why | How you'd find out |
|---|---|---|
| **Google indexing** | The preview build sets `PUBLIC_PREVIEW=true`, which makes `/robots.txt` say `Disallow: /` and suppresses the sitemap entirely. Google never even reads a `noindex` on a page it is forbidden to crawl. | You wouldn't. Rankings would just decay over weeks. |
| **45 legacy redirects** | `public/_redirects` is a Netlify file. GitHub Pages has no server-side redirect feature at all — it serves the file as plain text. Verified live: `curl https://andy-arrow.github.io/pianotuningscy/blank-1` returns **404**, not a 301. | Every old Wix URL — `/blank-1`…`/blank-4`, `/book-online`, `/service-page/*`, `/booking-calendar/*`, the Greek equivalents — starts 404ing. ~14 years of accumulated links, dropped. |
| **All 7 security headers** | `netlify.toml` sets CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy and immutable caching for `/_astro/*`. GitHub Pages supports no custom headers whatsoever, and sends no HSTS at all on a custom domain. | Silent. Also loses year-long asset caching — Pages forces `max-age=600` on everything. |
| **The contact form** | The form is marked `data-netlify="true"`. GitHub Pages rejects POST with **405 Method Not Allowed** (verified). | Silent enquiry loss — the visitor may still see a success screen. This is the worst of the four. |

There is also a policy problem: GitHub's own terms say Pages "is not intended for or allowed to be used as a free web-hosting service to run your online business."

**Why not Cloudflare Pages either,** even though it reads `_redirects` fine: for an apex domain Cloudflare requires you to move your **nameservers** to Cloudflare, which means re-typing all four MX records by hand. That is the one risk this whole plan exists to avoid. Netlify works from your existing one.com nameservers.

**Why not move nameservers to Netlify DNS,** even though Netlify recommends it: Netlify cannot import a DNS zone — every record gets retyped by hand, and one missed MX record means customer emails bounce with no error anywhere. Your zone is also DNSSEC-signed by one.com, which switches off automatically if you move nameservers. Keep `ns01.one.com` / `ns02.one.com`. Forever, as far as this project is concerned.

---

## 2. Before you touch DNS

Every one of these must be true. None of them involve DNS.

### 2.1 Write down what you are about to change

Open the one.com DNS panel and **screenshot the entire record list**, both the "Personal DNS settings" and the "Standard DNS settings" sections (click **Show all** if the list is collapsed). Save the screenshot somewhere outside the panel — your phone, your email to yourself.

Also run these and save the output (Terminal on your Mac):

```
dig +noall +answer pianotuningscy.com A
dig +noall +answer pianotuningscy.com MX
dig +noall +answer pianotuningscy.com TXT
dig +noall +answer pianotuningscy.com NS
dig +noall +answer www.pianotuningscy.com CNAME
dig +noall +answer ftp.pianotuningscy.com CNAME
```

**That snapshot is your rollback source of truth — not this document.** If the screenshot and this document disagree about what the old value was, believe the screenshot.

Expected today (confirmed by `dig`):

```
A      pianotuningscy.com      185.230.63.107        (Wix)       TTL 600
CNAME  www.pianotuningscy.com  www43.wixdns.net      (Wix)
CNAME  ftp.pianotuningscy.com  ftp.c3ub80nh5.service.one  (one.com)
MX     mx1..mx4.mailpod15-cph3.g1i.one.com, priority 10 each
NS     ns01.one.com, ns02.one.com
TXT    none
```

### 2.2 Turn off preview mode in the build

This is the single most damaging thing that can ship to production. Netlify builds from `netlify.toml` (`npm run build`, publish `dist`) and does **not** read the GitHub Actions workflow, so the preview flags will not follow automatically — but they must not be added either.

- **Leave `.github/workflows/deploy.yml` alone.** It builds the GitHub Pages preview, which stays noindexed. That is correct and harmless.
- **In Netlify, never set `PUBLIC_PREVIEW`, `PREVIEW_SITE` or `PREVIEW_BASE`.** Check **Site configuration → Environment variables** and confirm all three are absent. `astro.config.mjs` reads them to decide the base path, the sitemap and `robots.txt`; `src/components/EnquiryForm.astro` reads `PUBLIC_PREVIEW` to *fake* a successful submit without sending anything. If that one variable leaks into Netlify, every enquiry shows a green tick and vanishes.

### 2.3 Soften HSTS before go-live — this is a two-year, one-way door

`netlify.toml` currently sends:

```
Strict-Transport-Security = "max-age=63072000; includeSubDomains; preload"
```

`includeSubDomains` tells every browser that **every** subdomain of `pianotuningscy.com` must be HTTPS for two years — including `ftp.pianotuningscy.com` and any one.com webmail address you open in a browser. If one of them doesn't serve valid HTTPS, it becomes unreachable and you cannot quickly undo it. `preload` is worse: it is a standing invitation to be hard-coded into browsers.

**Change that line to this before the first production deploy:**

```
Strict-Transport-Security = "max-age=300"
```

Once the site has been live and correct for a week or two, and you have confirmed every subdomain you actually use works over HTTPS, put the long value back. Netlify's own docs flag this setting as "not easily reversible once enabled."

### 2.4 Fix the form-name collision

All four pages that render the enquiry form (`/contact/`, `/book/`, `/el/epikoinonia/`, `/el/klisi-rantevou/`) submit under the same form name `enquiry`, but the two booking pages carry extra fields (`piano-type`, `last-tuned`) that the contact pages don't. Netlify keys forms by name and **only displays the fields from the last-deployed version of that form** — so booking answers can silently stop appearing in the dashboard.

In `src/components/EnquiryForm.astro`, either:
- always render `piano-type` and `last-tuned` (visually hidden on the contact variant), so both copies share one schema — simplest; or
- give the variants distinct names (`enquiry-contact` / `enquiry-booking`), keeping the hidden `form-name` input in sync with the `name` attribute on `<form>`.

The data is never actually lost — it is retrievable via Netlify's API — but you would not see it when you need it.

### 2.5 Decide about paying Netlify

A Netlify account created today is on **credit-based** pricing: 300 credits/month, hard limit, no auto-recharge. When credits run out, **Netlify pauses your sites and visitors see a "Site not available" page** until the next billing cycle. For a business that takes bookings through the site, that is a real outage, not a quota warning.

Current rates (**verify on the day** at Netlify's pricing page — these changed as recently as April 2026): bandwidth 20 credits/GB, production deploy 15 credits flat, web requests 2 credits per 10,000, **form submissions free**, deploy previews free. Roughly: 300 credits ≈ 15 GB of traffic *or* 20 production deploys, in practice a mix.

For a brochure site that is probably fine — but attach a payment method, or move to the Personal plan (~$9/mo), before cutover, and turn on usage alerts (Netlify notifies at 50/75/90/100%). Do not discover the ceiling by hitting it.

### 2.6 Keep Wix alive

**Turn off auto-renew on the Wix plan. Do not click Cancel.** Wix deactivates a cancelled plan immediately, which destroys your rollback and refunds nothing (their money-back guarantee is 14 days, new plans only). Turning off auto-renew leaves it running to the paid end date.

Your domain is registered at one.com, not Wix, so ending the Wix plan cannot affect the domain. Do check Wix's subscriptions list for a Wix-hosted business email subscription — if one exists, cancelling it would break mail regardless.

---

## 3. Step by step

### (a) Host setup — nothing here can affect the live site

1. **Create a Netlify account** at netlify.com and sign in with GitHub. Grant it access to `andy-arrow/pianotuningscy`. *Stop when:* you can see the repo listed.

2. **Add new site → Import an existing project → GitHub → `andy-arrow/pianotuningscy`.** Build settings should auto-fill from `netlify.toml`:
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Branch: `main`

   Do **not** add any environment variables. Click **Deploy**.
   *Stop when:* the deploy log ends with "Site is live" and you have a URL like `https://something-something-123456.netlify.app`. **Write that hostname down — you need it exactly later, and nobody can predict it for you.**

   *(One thing to watch: `netlify.toml` sets `NODE_VERSION = "24"` while the Actions workflow uses Node 22. If the build fails on a Node version issue, that line is the first place to look.)*

3. **Rename the site to something readable** (optional): Site configuration → Site details → Change site name → e.g. `pianotuningscy`. The hostname becomes `pianotuningscy.netlify.app`. Do this **now**, not later — changing it after DNS is pointed would break `www`.

4. **Turn on form detection.** Netlify → your site → **Forms → Enable form detection**. It is **off by default**, and it only takes effect **starting with the next deploy**. So after enabling it, go to Deploys → **Trigger deploy → Deploy site**.
   *Stop when:* the Forms tab lists a form called `enquiry` (or your renamed variants) — it appears after the deploy, before any submission exists. If it doesn't appear, nothing else in this section will work.

5. **Add an email notification.** Forms → Submission notifications → Add notification → **Email notification** → recipient `info@pianotuningscy.com`. Netlify sends nothing by default.
   Two things to know: notifications come from `formresponses@netlify.com`, and the **Reply-To** is only set when the sender filled the field named `email` — which this form marks optional (phone is the required field). Expect a share of enquiries you must phone back rather than reply to. If that's not acceptable, make the email field required.

6. **Test the site completely on the `.netlify.app` URL.** This is the whole point of the exercise — the real domain is still on Wix and is unaffected by anything you find here.

   ```
   curl -s https://YOURSITE.netlify.app/robots.txt
   ```
   Must show `User-agent: *` / `Allow: /`, then `Disallow: /thanks/` and `Disallow: /el/efcharistoume/` (both expected and correct), then `Sitemap: https://www.pianotuningscy.com/sitemap-index.xml`. **If it says `Disallow: /`, stop — preview mode has leaked. Fix it before going further.**

   ```
   curl -s https://YOURSITE.netlify.app/sitemap-index.xml | head -5
   ```
   Must be XML, not a 404 page.

   ```
   curl -s https://YOURSITE.netlify.app/ | grep -c '/pianotuningscy/'
   ```
   Must return **0** — no leftover base path.

   ```
   curl -sI https://YOURSITE.netlify.app/blank-1 | head -3
   ```
   Must be **301** with a `location:` of `/services/`. Spot-check `/blank-2`, `/book-online`, `/service-page/piano-tuning`, `/el/blank-4`.

   Then by hand, in a browser: both languages, the language switcher producing `/el/...` URLs with Greek chrome (worth re-checking now the base path is gone — a recent commit fixed exactly this failure), images and OG images loading, and the site on a phone. Watch the browser console on each page type for CSP violations.

7. **Submit the contact form for real**, from the `.netlify.app` URL, in both English and Greek. Use a real email address, write a full sentence in the message box, and space the two submissions apart — Akismet filtering is always on and cannot be disabled, and terse test submissions from one IP are exactly what it eats.
   *Stop when:* both appear under Forms → your form → **Verified submissions**, and the notification email actually arrives at `info@pianotuningscy.com`. If a submission is missing, check the **Spam submissions** list before concluding anything is broken.

8. **Add the domains in Netlify — still no DNS change.** Domain management → Add a domain → `www.pianotuningscy.com`. Netlify adds the apex `pianotuningscy.com` automatically. **Set `www.pianotuningscy.com` as the primary domain** — Netlify strongly recommends this when DNS stays with an external provider (an apex on third-party DNS can't use their direct CDN routing), and it matches the site's own canonicals, which are hard-coded to `https://www.pianotuningscy.com` in `astro.config.mjs`. Netlify will redirect the apex to www automatically.
   *Stop when:* both domains are listed as "Awaiting External DNS" / "Pending DNS verification".

9. **Read the exact values off the "Pending DNS verification" modal.** Click it next to `pianotuningscy.com`. Write down the A-record IP it shows and the `.netlify.app` hostname it shows. **These are authoritative for your site and override anything written below** — sites on Netlify's High-Performance Edge get a different load balancer and a different target.

   Netlify's public documentation currently says the apex A record is **75.2.60.5**. **Verify on the day** at `https://docs.netlify.com/manage/domains/configure-domains/configure-external-dns/`. You may optionally sanity-check with `dig +short apex-loadbalancer.netlify.com A` — but note it returns *more than one* address (today: `99.83.231.61` and `75.2.60.5`, in varying order). You are only confirming that the documented IP still appears. **Never paste "whatever dig returned."**

> **Order matters and is not negotiable.** The domain must be registered on the Netlify site *before* DNS points at Netlify. The reverse order gives you a window where the domain resolves to a Netlify load balancer that has no site for it, and a second window with no certificate — a full-page browser security warning on a live business site.

### (b) DNS records at one.com — two rows, 10 minutes

Do this **at a quiet hour** (early morning Cyprus time).

10. **Log in to the one.com Control Panel and open DNS settings.**
    - Old design: scroll to the **Advanced settings** tile → **DNS settings** → **DNS records** tab.
    - New design: left menu → **Domains** → **DNS settings** → **DNS records**.
    - A **"Try new look"** toggle in the bottom-left switches between them. one.com is mid-rollout, so labels may not match their own help screenshots. Match fields by meaning.

    Scroll to **Personal DNS settings**. Click **Show all** if the list looks short.

11. **Edit the apex A record in place.** Find the `A` record whose **Hostname is blank** (blank = the domain root) with value `185.230.63.107`. Click the row — it opens as an editable form. Change the field labelled **IP address** from `185.230.63.107` to the Netlify IP from step 9 (expected `75.2.60.5`). Set **TTL** to `600`. Click **Update record**.

    - **Edit it; do not delete and re-create.** Deleting can re-expose one.com's own standard A record and serve stale one.com hosting content, and leaves a window with no apex record at all.
    - **Never have two apex A records live.** DNS would round-robin and roughly half your visitors would get Wix.
    - **Leave the Hostname field empty.** A literal `@` typed at one.com is disregarded and treated as empty — but don't rely on that, just leave it blank.
    - **Never put a CNAME at the apex.** one.com offers the type; using it there would exclude every other record at that name, **including your MX records**. That is how you take email down. The apex must be an `A` record. one.com has no ALIAS/ANAME/flattened-CNAME type, so Netlify's preferred apex target is unavailable and the documented A-record fallback is correct here.

    *Stop when:* the row reads `A` / blank hostname / the Netlify IP.

12. **Edit the www CNAME in place.** Find the `CNAME` row with Hostname `www`, value `www43.wixdns.net`. Click it. Change **"Is an alias of"** to your site's Netlify hostname from step 9 — e.g. `pianotuningscy.netlify.app`. No trailing dot. Not an IP (one.com rejects one). Not `apex-loadbalancer.netlify.com`. TTL `600`. Click **Update record**.

    *Stop when:* the row reads `CNAME` / `www` / `yoursite.netlify.app`.

    If the panel genuinely refuses to open the row for editing: delete it, then immediately **Create new record → CNAME**, hostname `www`, alias `yoursite.netlify.app`, TTL 600. Do it in the same sitting — there will be a short gap where `www` doesn't resolve.

13. **While you are here — add SPF and DMARC.** See section 5. Ideally do this a few days *before* the web cutover, not the same sitting, so that if anything odd happens with mail you know which change caused it. If you're already here, it is still safe: both are TXT records and cannot affect web serving.

14. **Do not click anything else.** In particular:
    - **Never click "Reset DNS records."** It deletes every personal record at once and restores one.com's defaults. Your new records vanish and any custom mail records go with them. No documented undo.
    - **Do not touch the Name servers tab.** one.com states plainly that moving nameservers to a third party stops all hosting-bundled features "for example, the Website Builder, Online shop and **email**," and it disables DNSSEC. Recovery requires MX/SPF/DKIM values that only one.com support can give you.
    - **Do not touch the sliders under "Standard DNS settings."** one.com's own warning: disabling more than the first six also kills email and FTP — "You risk losing new emails." You don't need them; creating a personal record on the same hostname disables the conflicting standard one automatically.
    - **Do not tidy up.** Do not delete, reorder or "clean" any record you are not explicitly replacing.

15. **Reload the DNS page and confirm the MX rows are still there** before you walk away.

### (c) Verification

16. **Immediately — confirm email is untouched.** Query one.com's own nameserver, not a cache; the MX TTL is 10800 (3 hours), so a cached lookup will happily show you the old, correct-looking answer and falsely reassure you:

    ```
    dig +short @ns01.one.com pianotuningscy.com MX
    ```

    Must return all four: `10 mx1.mailpod15-cph3.g1i.one.com.`, and mx2, mx3, mx4. **If any is missing, stop everything and restore it from your screenshot before doing anything else.**

    ```
    dig +short @ns01.one.com pianotuningscy.com A
    dig +short @ns01.one.com www.pianotuningscy.com CNAME
    dig +short @ns01.one.com ftp.pianotuningscy.com CNAME
    ```

17. **Within ~90 minutes — confirm the web records propagated.** one.com's own guidance is that a change can take up to 90 minutes to go active; full global propagation can take up to 24–48 hours. Expect a mixed window where some visitors get the old site and some the new.

    ```
    dig +short A pianotuningscy.com @1.1.1.1
    dig +short A pianotuningscy.com @8.8.8.8
    dig +short CNAME www.pianotuningscy.com @1.1.1.1
    ```

    Expect the Netlify IP and `yoursite.netlify.app.` — and `185.230.63.107` / `www43.wixdns.net` gone. Use `@1.1.1.1` to bypass your own resolver's cache; also check from your phone on mobile data, or a site like dnschecker.org, since your local resolver will lag.

18. **Wait for the certificate.** Netlify starts trying once DNS points at it, and **cannot** issue before the old cached records have expired. In Netlify: **Domain management → HTTPS**. Usually minutes to ~an hour. On failure it retries every 10 minutes for the first 24 hours, then hourly for two more days.

    **Do not roll back at two hours because HTTPS hasn't come up**, as long as the site loads over `http://`. Netlify's docs treat 24 hours — not 2 — as the point where you should assume a DNS misconfiguration. Rolling back early aborts an attempt that may be on schedule and re-fills caches with the old records, which then have to expire all over again.

19. **Once the certificate shows as issued**, enable **Force HTTPS** in Netlify. Not before.

20. **Check the headers and the certificate:**

    ```
    curl -sI https://www.pianotuningscy.com/ | head -20
    ```
    Expect `HTTP/2 200`, `server: Netlify`, plus `strict-transport-security`, `content-security-policy`, `x-content-type-options`.

    ```
    curl -sIL http://pianotuningscy.com/ | grep -iE '^HTTP|^location'
    ```
    Expect a redirect chain ending at `https://www.pianotuningscy.com/`. (Netlify's docs don't state the status code, so don't be alarmed if it isn't a 301, and don't expect the custom headers on the redirect hops — only on the final 200.)

    ```
    openssl s_client -connect www.pianotuningscy.com:443 -servername www.pianotuningscy.com </dev/null 2>/dev/null \
      | openssl x509 -noout -issuer -dates -ext subjectAltName
    ```
    Expect a Let's Encrypt issuer and a `subjectAltName` listing **both** `www.pianotuningscy.com` and `pianotuningscy.com`. If only one name is covered, DNS was still propagating at issuance — wait for the old TTLs to expire, then click **Renew certificate** in Netlify.

21. **Raise the TTLs back to 3600** on the two records, once you are confident — but not before you've finished section 7.

---

## 4. The exact DNS records

### CHANGE — exactly two rows

| Record | Hostname | Type | Old value (Wix) | New value | TTL |
|---|---|---|---|---|---|
| Apex | *(leave blank)* | A | `185.230.63.107` | **the IP from your Netlify "Pending DNS verification" modal** — documented default `75.2.60.5` | 600 |
| www | `www` | CNAME | `www43.wixdns.net` | **`<your-site>.netlify.app`** — the exact hostname from your Netlify dashboard | 600 |

Edit both **in place**. Both in the same sitting.

### ADD — optional but recommended (see section 5)

| Record | Hostname | Type | Value | TTL |
|---|---|---|---|---|
| SPF | *(leave blank)* | TXT | `v=spf1 include:_custspf.one.com ~all` | default |
| DMARC | `_dmarc` | TXT | `v=DMARC1; p=none; rua=mailto:dmarc@pianotuningscy.com` | default |

### LEAVE ALONE — do not edit, delete, reorder or "clean up"

| Record | Value | Why |
|---|---|---|
| **MX ×4** | `mx1`, `mx2`, `mx3`, `mx4`**`.mailpod15-cph3.g1i.one.com`**, priority 10 each | **THIS IS YOUR BUSINESS EMAIL. Touching these is the only way this project can cost you money.** MX is a separate record type from A and CNAME — mail routing is completely independent of the website records. RFC 5321 §5.1: once MX records exist for a name, sending servers must not use that name's A record for delivery. So changing the apex A record *cannot* affect mail. Deleting an MX record can. |
| **NS** | `ns01.one.com`, `ns02.one.com` | Moving these hands the whole zone elsewhere and takes email, DNSSEC and hosting features with it. |
| **CNAME `ftp`** | `ftp.c3ub80nh5.service.one` | one.com service record. Unrelated to the website. |
| Any DKIM / autodiscover / autoconfig / `mail` records | as found | Mail infrastructure. |
| Everything under **Standard DNS settings** | as found | Leave the sliders alone entirely. |

**Never click "Reset DNS records."**

---

## 5. Email hardening — SPF and DMARC

The domain currently publishes **no SPF and no DMARC**, which means anyone can forge mail from `@pianotuningscy.com` and your legitimate mail is more likely to land in spam. Worth fixing while you're in the panel. Netlify form notifications come from Netlify's own domain and need no entry here.

**Best timing: do this three days *before* the web cutover**, so the two changes are separable if something looks odd.

### SPF

**First check whether one.com is already publishing one for you.** In the panel, scroll to **Standard DNS settings** and look for an entry `TXT domain.com` (directly above `TXT _dmarc.domain.com`). Also run `dig +short TXT pianotuningscy.com` — the standard record is published by a toggle and does *not* appear in the personal records list, so an empty list doesn't mean there's no SPF.

- **If the toggle exists:** just switch it on. Done. **Do not also add a TXT record by hand.**
- **If it doesn't exist:** DNS records → **Create new record → TXT**:

  - Hostname: *(leave empty — blank means the apex)*
  - Value: `v=spf1 include:_custspf.one.com ~all`
  - TTL: leave empty (defaults to 3600)

**Exactly one SPF record at the apex.** Two `v=spf1` records is a permanent error under RFC 7208 and providers will ignore both. Any future sender (a CRM, Mailchimp, Google Workspace) gets its `include:` added *inside this same record*, never as a second one. Keep `~all` (softfail); only consider `-all` after weeks of clean reports.

Verify: `dig +short TXT pianotuningscy.com` — exactly one string starting `v=spf1`. Allow up to 90 minutes.

### DMARC

**First, create the mailbox `dmarc@pianotuningscy.com` in one.com** (or change the address below to a real mailbox you actually read), otherwise the reports bounce.

DNS records → **Create new record → TXT**:

- Hostname: `_dmarc`
- Value, one line, no line breaks:

  ```
  v=DMARC1; p=none; rua=mailto:dmarc@pianotuningscy.com
  ```

`p=none` means "report, change nothing" — it cannot break mail. Leave it at `p=none` for at least 2–4 weeks. The reports arrive as XML; feed them to a free aggregator (dmarcian's or Postmark's free tier).

Two notes on the current standard: RFC 9989 (May 2026) **removed the `pct=` tag**, so there is no percentage ramp any more — the path is `none` → `quarantine` → `reject`. And DMARC passes if *either* SPF or DKIM produces an aligned pass, so a single SPF failure with DKIM aligned is still `dmarc=pass`.

**Uncertain, and it matters:** a live lookup today found **no DKIM key published at the usual selectors** for this domain. Before you ever raise DMARC above `p=none`, check one.com's control panel for DKIM signing on this domain and turn it on. Raising to `quarantine` or `reject` without DKIM working is how you start losing your own outbound mail.

Verify: `dig +short TXT _dmarc.pianotuningscy.com`.

---

## 6. Rollback

### The two records to restore

Open the one.com DNS panel and put these back, **from your screenshot**, not from memory and not from a Wix help page (Wix's current published generic value is `pointing.wixdns.net`, but your site uses the older per-site form `www43.wixdns.net` — restoring the wrong one would not work):

```
A     (blank hostname)  185.230.63.107      TTL 600
CNAME www               www43.wixdns.net    TTL 600
```

**Nothing else.** Do not touch MX, NS, TXT, `ftp`, or anything else in either direction.

### How fast

TTL is 600 seconds, so most resolvers pick up the old records within ~10 minutes. one.com itself says a change can take up to 90 minutes to become fully active. Realistically: **10 minutes for most visitors, up to 90 minutes for everyone.**

Two things that make rollback work at all:
1. **The Wix site must still exist.** That's why you turned off auto-renew instead of cancelling.
2. **HSTS must not be set to a long max-age.** With `max-age=300` (section 2.3), browsers forget the HTTPS requirement in five minutes. With the original two-year value, every browser that has visited the new site will refuse plain HTTP for two years.

### When to roll back — two different triggers, don't conflate them

- **Site down, wrong content, or errors on `http://` as well as `https://`** → roll back immediately, don't wait.
- **HTTPS alone hasn't come up but the site loads over `http://`** → **do not roll back.** Check with `dig` that the records resolve correctly everywhere. If they do, wait the full 24 hours. See step 18.

---

## 7. After it is live

### Functional checklist — do all of these on the real domain

- [ ] All four MX records still resolving (`dig +short MX pianotuningscy.com @1.1.1.1`) — check this first, and again at every step.
- [ ] **Send a real email** from the business address to a Gmail address *and* an Outlook.com address; have someone reply from outside. In Gmail: More → **Show original** and confirm `spf=pass` and `dmarc=pass`. In Outlook.com: View message source → read `Authentication-Results`.
- [ ] `https://www.pianotuningscy.com/robots.txt` shows `Allow: /` and the sitemap line — **not** `Disallow: /`. Check this within minutes of going live. This is the single most damaging possible failure and the easiest to miss.
- [ ] `https://www.pianotuningscy.com/sitemap-index.xml` returns XML.
- [ ] Legacy redirects fire on the real domain:
      ```
      for p in /blank-1 /blank-2 /blank-3 /blank-4 /book-online \
               /pricing-plans/plans-pricing /service-page/piano-tuning \
               /booking-calendar/piano-tuning /el/blank-4 /el/book-online; do
        printf '%s -> ' "$p"; curl -sI "https://www.pianotuningscy.com$p" | head -1
      done
      ```
      Every one must be **301**, not 200 and not 404.
- [ ] Both languages walked by hand; language switcher gives `/el/...` URLs with Greek chrome.
- [ ] **Contact form submitted for real from the live domain, in both languages**, and both submissions visible under Forms → Verified submissions, with the notification email arriving at `info@pianotuningscy.com`.
- [ ] `curl -sI https://www.pianotuningscy.com/og/<file> ` returns 200 with `Cache-Control: public, max-age=604800`.
- [ ] Tested on a phone.
- [ ] Browser console clean of CSP violations on each page type.
- [ ] Plausible recording pageviews and the "Enquiry sent" event.
- [ ] **Unpublish the Wix site** (or at minimum hide it from search) before or at the moment the plan lapses. Cancelling alone does *not* take it offline — Wix reverts the address to `siteprefix.wixsite.com/siteaddress` and the site stays live and indexable, competing with you as duplicate content.
- [ ] The GitHub Pages preview stays noindexed, or delete the Pages deployment entirely.

### Google Search Console

1. **Verify a Domain property** — enter the bare domain, no `https://`, no `www`. Google requires DNS verification for this type and it covers www, apex, http and https in one property. Add the TXT record it gives you in the same one.com panel. (An existing URL-prefix property keeps working; re-verify only if its verification method broke during the move.)
2. **Do not use the Change of Address tool.** Google says it's for moving between domains. Your domain isn't changing — only the host. The tool can't even be used here: it runs from a property for the *old domain you're leaving*, and there isn't one.
3. **Sitemaps → submit `sitemap-index.xml`.** Delete the old Wix sitemap entries if you like, but it's cosmetic — Google's own docs say deleting a sitemap doesn't make it forget the URLs. What actually retires the old URLs is the 301s, which is why you verified them above.
4. **URL Inspection → Test Live URL** on: the homepage, one EN service page, one EL page, and one redirected legacy URL. Each must report "URL is available to Google," no `noindex`, correct canonical. Use **Request indexing** on the top handful only.
5. **Before you let the Wix plan lapse**, pull the real list of indexed old URLs from the Pages report (or `site:pianotuningscy.com` in Google) and confirm every one has a mapping in `public/_redirects`. Google asks for these to stay in place at least a year — in practice, keep `_redirects` in the repo permanently.
6. **Monitor for 2–4 weeks:** the Pages report and Crawl stats. A spike in "Not found (404)" means a redirect gap. "Excluded by 'noindex' tag" means preview mode leaked into production.

### A month later

- Raise DNS TTLs back to 3600.
- Restore the long HSTS value in `netlify.toml` once you've confirmed every subdomain you open in a browser works over HTTPS. Leave `preload` off unless you have a reason.
- Read the DMARC reports; if all your legitimate mail is authenticating **and DKIM is confirmed working**, move to `p=quarantine`.
- Let the Wix plan lapse — with the site unpublished first.

---

## 8. Things that are genuinely uncertain — don't smooth over these

1. **`75.2.60.5` may not be your IP.** Netlify uses a different load balancer for High-Performance Edge sites, and has changed published values before. **The "Pending DNS verification" modal in your own dashboard is authoritative.** Read it at the moment you type.
2. **Your `.netlify.app` hostname is unpredictable.** Nobody can tell you what it is. Read it from your dashboard.
3. **Netlify's credit rates changed as recently as April 2026.** Re-read the pricing page on the day rather than trusting the numbers in section 2.5.
4. **one.com's Control Panel is mid-redesign.** Their own help articles carry banners saying the screenshots may not match your screen. Match fields by meaning, not by position.
5. **one.com's minimum TTL is 600 seconds, not 300.** Advice elsewhere that says "set TTL to 300 before cutover" cannot be followed here — 600 is the floor. Your apex is already at 600, which is fine. Note that leaving the TTL field **blank does not mean "keep current"** — it means 3600. Type `600` in explicitly on any record you create.
6. **No DKIM key is currently published** at the usual selectors for this domain. This blocks tightening DMARC later, and needs checking in one.com's control panel — possibly with their support.
7. **Whether one.com's "TXT domain.com" SPF toggle exists in your panel** — their documentation has changed on this point. Look before you type, and end up with exactly one SPF record either way.
8. **Netlify does not document the status code** of the apex→www redirect, so don't promise a 301 specifically.
9. **`dist/` on your Mac contains 54 iCloud conflict duplicates** (`index 2.html`, `areas/paphos 2`, etc.). Harmless — `dist/` is gitignored and Netlify builds from git. But **never** drag-and-drop that folder into Netlify as a manual deploy; it would publish duplicate indexable URLs.
10. **I have changed nothing.** No DNS record edited, no Netlify account created, no terms accepted, no repo commit. Every step above is yours to perform — including the two repo edits in sections 2.3 and 2.4, which I can make for you if you ask.