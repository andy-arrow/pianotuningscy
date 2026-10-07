/**
 * The enquiry email Kleanthis reads, and its delivery through one.com.
 *
 * Kept outside netlify/functions/ so Netlify doesn't deploy it as a function
 * of its own. buildEnquiryEmail() is pure (no network, no secrets) and
 * deliver() takes its transport factory as an argument, so both are tested
 * offline by scripts/check-enquiry-email.mjs without sending anything.
 */

/** Every enquiry goes here, whatever mailbox it is sent from. */
export const INBOX = 'info@pianotuningscy.com';

const PIANO = {
  upright: 'Όρθιο / Upright',
  grand: 'Με ουρά / Grand',
  unsure: 'Δεν γνωρίζω / Not sure',
};

const clean = (v, max = 3000) =>
  String(v ?? '')
    .replace(/\r\n?/g, '\n')
    .replace(/[\u0000-\u0008\u000b-\u001f\u007f]/g, '')
    .trim()
    .slice(0, max);

/**
 * Visitor-written text arrives from the site's own address, so it looks
 * trusted. Links in it are made unclickable: the scheme is broken and so is
 * every dot before a domain ending ("evil.com" → "evil[.]com"), because mail
 * apps turn a bare "evil.com/pay" into a link too.
 */
const defang = (s) =>
  s.replace(/(h)tt(ps?):\/\//gi, '$1xx$2[://]').replace(/([a-z0-9-])\.(?=[a-z]{2,})/gi, '$1[.]');

/** Anything that ends up in a header: one line, short, no links. */
const oneLine = (v, max = 80) => defang(clean(v, max).replace(/\s+/g, ' '));

const esc = (s) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

/**
 * Strict on purpose: the address becomes the Reply-To and a mailto: link, where
 * "?" or "&" would let a visitor pre-fill Cc/Bcc and text in Kleanthis's reply.
 */
const EMAIL_RE = /^[^\s@<>()",;:\\[\]?&=%/]+@(?:[\p{L}\p{N}-]+\.)+\p{L}{2,}$/u;

/**
 * INBOX plus any extra addresses from a comma-separated setting (the
 * ENQUIRY_ALSO_TO environment variable; kept out of this public repo).
 * Invalid entries are skipped, duplicates removed, at most three extras.
 */
export function recipients(extra = '') {
  const also = String(extra)
    .split(/[,;\s]+/)
    .map((a) => a.trim())
    .filter((a) => EMAIL_RE.test(a));
  return [...new Set([INBOX, ...also.slice(0, 3)].map((a) => a.toLowerCase()))];
}

/** +357 99 123456 / 99123456 / 0035799123456 → 35799123456, for wa.me links. */
function waDigits(phone) {
  let d = phone.replace(/[^\d+]/g, '');
  if (d.startsWith('+')) d = d.slice(1);
  else if (d.startsWith('00')) d = d.slice(2);
  else if (/^[29]\d{7}$/.test(d)) d = '357' + d;
  return /^\d{8,15}$/.test(d) ? d : '';
}

function cyprusTime(date) {
  try {
    return new Intl.DateTimeFormat('el-GR', {
      timeZone: 'Asia/Nicosia', dateStyle: 'full', timeStyle: 'short',
    }).format(date);
  } catch {
    return date.toISOString();
  }
}

function validDate(v, now) {
  const d = new Date(v ?? NaN);
  return Number.isNaN(d.getTime()) ? now : d;
}

/** First address visible in To; the rest hidden in Bcc. */
const addressing = (to) => ({ to: to[0], ...(to.length > 1 ? { bcc: to.slice(1) } : {}) });

const messageId = (p, when) =>
  `<enquiry-${String(p.id || when.getTime()).replace(/[^\w.-]/g, '')}@pianotuningscy.com>`;

/**
 * One verified Netlify Forms submission → nodemailer message options.
 * `from` must be the mailbox that logs in to one.com (one.com rejects any
 * other sender); `to` is recipients(), which always starts with INBOX. Only
 * INBOX is visible: the others go as Bcc, so a Reply All from info@ never
 * shows a customer Kleanthis's personal address.
 */
export function buildEnquiryEmail(p, { from, to = [INBOX], now = new Date() }) {
  const d = p.data || {};
  const isBooking = p.form_name === 'enquiry-booking';
  const name = oneLine(d.name) || '—';
  const phone = clean(d.phone, 40).replace(/\s+/g, ' ');
  const email = clean(d.email, 254);
  const validEmail = EMAIL_RE.test(email);
  const city = oneLine(d.city, 60);
  const service = d.service === 'other' ? 'Κάτι άλλο / Something else' : oneLine(d.service, 80);
  const when = validDate(p.created_at, now);
  const wa = waDigits(phone);
  const telDigits = phone.replace(/[^\d+]/g, '');

  // [label, plain value, optional link]
  const rows = [
    ['Όνομα / Name', name],
    ['Τηλέφωνο / Phone', defang(phone), telDigits && `tel:${telDigits}`],
    ['WhatsApp', wa ? `wa.me/${wa}` : '', wa && `https://wa.me/${wa}`],
    ['Email', validEmail ? email : email ? `${oneLine(email, 254)} (μη έγκυρο / looks invalid)` : '— (δεν δόθηκε / not given)', validEmail && `mailto:${encodeURIComponent(email).replace(/%40/g, '@')}`],
    ['Πόλη / City', city],
    ['Υπηρεσία / Service', service],
    ...(isBooking
      ? [
          ['Πιάνο / Piano', PIANO[d['piano-type']] || '—'],
          ['Τελευταίο κούρδισμα / Last tuned', oneLine(d['last-tuned'], 60) || '—'],
        ]
      : []),
    ['Μήνυμα / Message', defang(clean(d.message)) || '—'],
    ['Γλώσσα / Language', d.locale === 'el' ? 'Ελληνικά' : 'English'],
    ['Σελίδα / Page', oneLine(d['source-page'], 200)],
    ['Ώρα / Time', cyprusTime(when)],
    ['Αρ. / No.', `${oneLine(p.form_name, 40)} #${p.number ?? ''} (${oneLine(p.id, 40)})`],
  ].filter(([, v]) => v);

  const kind = isBooking ? 'Νέα κράτηση' : 'Νέο μήνυμα';
  const subject = oneLine(`${kind}: ${name} – ${service || '—'}${city ? ' – ' + city : ''}`, 150);
  const warning = 'Γράφτηκε από επισκέπτη της ιστοσελίδας — μην ανοίγετε συνδέσμους. / Written by a website visitor — do not open links in it.';
  const action = validEmail
    ? 'Πατήστε «Απάντηση» για να απαντήσετε απευθείας στον πελάτη. / Press Reply to answer the customer directly.'
    : 'Ο πελάτης δεν άφησε email — καλέστε τον ή στείλτε WhatsApp. / No email given — call or WhatsApp them.';

  const text =
    `${kind} από το pianotuningscy.com\n\n` +
    rows.map(([k, v]) => (v.includes('\n') ? `${k}:\n${v}` : `${k}: ${v}`)).join('\n') +
    `\n\n${action}\n${warning}\n`;

  const html =
    `<div style="font:16px/1.5 -apple-system,Segoe UI,Roboto,Arial,sans-serif;color:#1a1a1a">` +
    `<p style="font-size:18px;margin:0 0 12px"><strong>${esc(kind)}</strong> από το pianotuningscy.com</p>` +
    `<table cellpadding="6" style="border-collapse:collapse">` +
    rows
      .map(([k, v, href]) => {
        const val = esc(v).replace(/\n/g, '<br>');
        return `<tr><td style="vertical-align:top;color:#666;white-space:nowrap">${esc(k)}</td><td style="vertical-align:top">${
          href ? `<a href="${esc(href)}">${val}</a>` : val
        }</td></tr>`;
      })
      .join('') +
    `</table>` +
    `<p style="margin:16px 0 4px"><strong>${esc(action)}</strong></p>` +
    `<p style="margin:0;color:#666;font-size:13px">${esc(warning)}</p></div>`;

  return {
    from: { name: 'Ιστοσελίδα Piano Tunings Cy', address: from },
    ...addressing(to),
    ...(validEmail ? { replyTo: { name: name === '—' ? '' : name, address: email } } : {}),
    subject,
    text,
    html,
    date: when,
    // Same submission → same Message-ID, so a rare double send is recognisable.
    messageId: messageId(p, when),
    headers: { 'X-Enquiry-Form': oneLine(p.form_name, 40) },
  };
}

/**
 * Used only if buildEnquiryEmail() throws: a formatting bug must never cost
 * an enquiry. Plain text, every field as sent, nothing clever.
 */
export function fallbackEmail(p, { from, to = [INBOX], now = new Date() }) {
  const d = p?.data || {};
  const lines = Object.keys(d)
    .filter((k) => !['ip', 'user_agent', 'referrer', 'company-website'].includes(k))
    .map((k) => `${k}: ${defang(clean(typeof d[k] === 'string' ? d[k] : JSON.stringify(d[k]), 3000))}`);
  return {
    from: { name: 'Ιστοσελίδα Piano Tunings Cy', address: from },
    ...addressing(to),
    subject: 'Νέο μήνυμα από την ιστοσελίδα / New website enquiry',
    text: `${lines.join('\n')}\n\nΓράφτηκε από επισκέπτη της ιστοσελίδας — μην ανοίγετε συνδέσμους.\n`,
    messageId: messageId(p || {}, now),
  };
}

/**
 * one.com's outgoing server: implicit TLS on 465, STARTTLS on 587 as the
 * fallback. Each route gets its own share of the time, so a dead 465 can't
 * leave 587 without any.
 */
const ROUTES = [
  { port: 465, secure: true, share: 0.5 },
  { port: 587, secure: false, requireTLS: true, share: 1 },
];

/** Errors where trying the other port can't help: wrong password, rejected message. */
const isFinal = (err) =>
  ['EAUTH', 'EENVELOPE', 'EMESSAGE'].includes(err?.code) || (err?.responseCode >= 500 && err?.responseCode < 600);

/**
 * Sends one message, trying 465 then 587, within `budgetMs` (Netlify allows a
 * synchronous function 60 s). nodemailer's own timeouts are set to fire well
 * inside each route's slot: its transport can't abort a session in progress,
 * so the race timer is only a backstop, and when it does fire the outcome is
 * reported as unknown rather than failed. connectionTimeout applies per
 * address (send.one.com has several), hence the short value.
 * Returns { ok, port, accepted, rejected, inboxRefused } or
 * { ok: false, code, ... } (counts only, no addresses). Never throws, and never
 * puts the message or the password in its result.
 */
export async function deliver(message, { createTransport, user, pass, budgetMs = 25000 }) {
  const started = Date.now();
  let last = { ok: false, code: 'NOATTEMPT' };
  for (const route of ROUTES) {
    const left = budgetMs - (Date.now() - started);
    const slot = Math.floor(left * route.share);
    if (slot < 1000) break;
    const transport = createTransport({
      host: 'send.one.com',
      name: 'pianotuningscy.com',
      port: route.port,
      secure: route.secure,
      ...(route.requireTLS ? { requireTLS: true } : {}),
      auth: { user, pass },
      connectionTimeout: Math.min(2500, Math.floor(slot / 3)),
      greetingTimeout: Math.min(4000, Math.floor(slot / 2)),
      socketTimeout: Math.min(8000, Math.floor(slot * 0.8)),
      dnsTimeout: Math.min(2000, Math.floor(slot / 4)),
      tls: { minVersion: 'TLSv1.2', servername: 'send.one.com' },
    });
    let timer;
    try {
      const info = await Promise.race([
        transport.sendMail(message),
        new Promise((_, reject) => {
          timer = setTimeout(() => reject(Object.assign(new Error('budget'), { code: 'EBUDGET' })), slot);
        }),
      ]);
      // The server can refuse one address and take the others; count both.
      return {
        ok: true,
        port: route.port,
        accepted: info?.accepted?.length ?? 0,
        rejected: info?.rejected?.length ?? 0,
        inboxRefused: (info?.rejected || []).some((a) => String(a).toLowerCase() === INBOX),
      };
    } catch (err) {
      last = { ok: false, port: route.port, code: err?.code || 'ERR', responseCode: err?.responseCode, command: err?.command };
      // The session may still finish and deliver; a second route could duplicate it.
      if (isFinal(err) || last.code === 'EBUDGET') break;
    } finally {
      clearTimeout(timer);
      transport.close();
    }
  }
  return last;
}
