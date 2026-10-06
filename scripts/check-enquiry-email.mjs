/**
 * Offline check of the enquiry email (netlify/lib/enquiry-mail.mjs) and the
 * submission-created function. Sends nothing and opens no connections:
 * messages are rendered with nodemailer's stream transport, and delivery is
 * exercised with a fake transport.
 *
 * Usage: npm run check:enquiry-email
 */
import assert from 'node:assert/strict';
import net from 'node:net';
import nodemailer from 'nodemailer';
import { INBOX, buildEnquiryEmail, fallbackEmail, deliver } from '../netlify/lib/enquiry-mail.mjs';

let passed = 0;
async function test(name, fn) {
  await fn();
  passed++;
  console.log(`ok - ${name}`);
}

const render = async (msg) => {
  const t = nodemailer.createTransport({ streamTransport: true, buffer: true, newline: 'unix' });
  const info = await t.sendMail(msg);
  return info.message.toString('utf8');
};
const headersOf = (raw) => raw.split('\n\n')[0];

const booking = {
  id: '6ab4c28df680c40008ac0f99',
  number: 7,
  form_name: 'enquiry-booking',
  created_at: '2026-10-06T19:12:13.102Z',
  data: {
    name: 'Μαρία Παπαδοπούλου',
    phone: '99 123456',
    email: 'maria@example.com',
    city: 'Λεμεσός',
    service: 'Κούρδισμα Πιάνου',
    'piano-type': 'upright',
    'last-tuned': '1–3 χρόνια πριν',
    message: 'Γεια σας,\nθα ήθελα κούρδισμα.',
    locale: 'el',
    'source-page': '/el/klisi-rantevou/',
    ip: '203.0.113.9',
    user_agent: 'Mozilla/5.0 test',
    referrer: 'https://example.org/',
  },
};
const contactNoEmail = {
  id: 'abc123',
  number: 2,
  form_name: 'enquiry-contact',
  created_at: '2026-10-06T18:15:21.606Z',
  data: { name: 'Emilianos', phone: '96554770', email: '', city: 'Limassol', service: 'other', message: '', locale: 'en' },
};

await test('Greek booking: encoded subject, Reply-To, WhatsApp and phone links, no tracking fields', async () => {
  const msg = buildEnquiryEmail(booking, { from: INBOX });
  assert.equal(msg.to, INBOX);
  assert.equal(msg.subject, 'Νέα κράτηση: Μαρία Παπαδοπούλου – Κούρδισμα Πιάνου – Λεμεσός');
  assert.equal(msg.replyTo.address, 'maria@example.com');
  assert.match(msg.html, /href="https:\/\/wa\.me\/35799123456"/);
  assert.match(msg.html, /href="tel:99123456"/);
  assert.match(msg.text, /Όρθιο \/ Upright/);
  const raw = await render(msg);
  const head = headersOf(raw);
  assert.match(head, /^Subject: =\?UTF-8\?/m);
  assert.match(head, /^Reply-To: /m);
  assert.match(head, /^Message-ID: <enquiry-6ab4c28df680c40008ac0f99@pianotuningscy\.com>$/m);
  assert.doesNotMatch(raw, /203\.0\.113\.9|Mozilla\/5\.0 test|example\.org/);
});

await test('no email given: no Reply-To, tells Kleanthis to call', async () => {
  const msg = buildEnquiryEmail(contactNoEmail, { from: INBOX });
  assert.equal(msg.replyTo, undefined);
  assert.match(msg.subject, /^Νέο μήνυμα: Emilianos – Κάτι άλλο \/ Something else – Limassol$/);
  assert.match(msg.text, /No email given — call or WhatsApp them/);
  assert.doesNotMatch(headersOf(await render(msg)), /^Reply-To:/m);
});

await test('header injection through the name or email is impossible', async () => {
  const p = structuredClone(booking);
  p.data.name = 'Eve\r\nBcc: victim@example.net';
  p.data.email = 'eve@example.com\r\nBcc: victim@example.net';
  const msg = buildEnquiryEmail(p, { from: INBOX });
  assert.equal(msg.replyTo, undefined, 'an email with a line break is not valid');
  assert.doesNotMatch(msg.subject, /[\r\n]/);
  const head = headersOf(await render(msg));
  assert.doesNotMatch(head, /^Bcc:/im);
  assert.equal((head.match(/^To:/gm) || []).length, 1);
});

await test('links and HTML written by the visitor are neutralised', async () => {
  const p = structuredClone(booking);
  p.data.message = 'Click https://evil.example/x and www.evil.example <script>alert(1)</script>';
  p.data.name = 'http://spam.example';
  const msg = buildEnquiryEmail(p, { from: INBOX });
  assert.match(msg.text, /hxxps\[:\/\/\]evil\[\.\]example\/x/);
  assert.match(msg.text, /www\[\.\]evil\[\.\]example/);
  assert.doesNotMatch(msg.html, /href="https?:\/\/(evil|spam)/);
  assert.doesNotMatch(msg.html, /<script>/);
  assert.match(msg.html, /&lt;script&gt;/);
  assert.doesNotMatch(msg.subject, /http:\/\//);
  assert.match(msg.text, /do not open links/);
});

await test('bare domains in visitor text are broken too, so mail apps cannot link them', async () => {
  const p = structuredClone(booking);
  p.data.message = 'Pay at paypal-secure.com/login or xhttps://evil-site.com/b or HTTPS://a.b.example/c. Price 1.5 ok.';
  const msg = buildEnquiryEmail(p, { from: INBOX });
  const row = msg.text.split('\n').find((l) => l.startsWith('Μήνυμα'));
  assert.doesNotMatch(row, /[a-z0-9-]\.[a-z]{2,}/i, row);
  assert.doesNotMatch(row, /https?:\/\//i, row);
  assert.match(row, /paypal-secure\[\.\]com\/login/);
  assert.match(row, /1\.5 ok/, 'numbers keep their dots');
});

await test('an "email" that smuggles mailto parameters is not trusted', async () => {
  for (const bad of ['bob@evil.com?bcc=victim%40example.net', 'bob@evil.com&cc=x@y.z', 'a/b@evil.com', 'bob@evil']) {
    const p = structuredClone(booking);
    p.data.email = bad;
    const msg = buildEnquiryEmail(p, { from: INBOX });
    assert.equal(msg.replyTo, undefined, bad);
    assert.doesNotMatch(msg.html, /href="mailto:/, bad);
  }
  const p = structuredClone(booking);
  p.data.email = 'μαρία@παράδειγμα.gr';
  const msg = buildEnquiryEmail(p, { from: INBOX });
  assert.equal(msg.replyTo.address, 'μαρία@παράδειγμα.gr');
  assert.match(msg.html, /href="mailto:%CE%BC[^"?&]*@[^"?&]*"/);
});

await test('a broken date or missing fields do not stop the email', async () => {
  const now = new Date('2026-10-07T09:00:00Z');
  const msg = buildEnquiryEmail({ id: 'x', form_name: 'enquiry-contact', created_at: 'not a date', data: {} }, { from: INBOX, now });
  assert.equal(msg.date.getTime(), now.getTime());
  assert.match(msg.subject, /^Νέο μήνυμα: — – —$/);
  await render(msg);
  const fb = fallbackEmail({ id: 'y', data: { name: 'A', odd: { x: 1 }, ip: '1.2.3.4' } }, { from: INBOX, now });
  assert.equal(fb.to, INBOX);
  assert.match(fb.text, /name: A/);
  assert.doesNotMatch(fb.text, /1\.2\.3\.4/);
  await render(fb);
});

// ---------------------------------------------------------------- delivery
function fakeTransports(behaviours) {
  const made = [];
  const createTransport = (opts) => {
    const b = behaviours[made.length] ?? (() => Promise.resolve({}));
    const t = { opts, closed: false, sendMail: () => b(), close() { t.closed = true; } };
    made.push(t);
    return t;
  };
  return { made, createTransport };
}
const fail = (code, responseCode) => () => Promise.reject(Object.assign(new Error(code), { code, responseCode }));
const msg = buildEnquiryEmail(booking, { from: INBOX });

await test('465 first; on a timeout, one retry on 587 with STARTTLS required', async () => {
  const { made, createTransport } = fakeTransports([fail('ETIMEDOUT'), () => Promise.resolve({})]);
  const r = await deliver(msg, { createTransport, user: INBOX, pass: 'x' });
  assert.deepEqual(r, { ok: true, port: 587 });
  assert.equal(made.length, 2);
  assert.equal(made[0].opts.port, 465);
  assert.equal(made[0].opts.secure, true);
  assert.equal(made[1].opts.port, 587);
  assert.equal(made[1].opts.requireTLS, true);
  assert.equal(made[0].opts.host, 'send.one.com');
  assert.ok(made.every((t) => t.closed));
});

await test('wrong password or a 5xx rejection: stop after one attempt', async () => {
  for (const [code, rc] of [['EAUTH', 535], ['EENVELOPE', undefined], ['EMESSAGE', 550]]) {
    const { made, createTransport } = fakeTransports([fail(code, rc)]);
    const r = await deliver(msg, { createTransport, user: INBOX, pass: 'x' });
    assert.equal(r.ok, false);
    assert.equal(r.code, code);
    assert.equal(made.length, 1, code);
  }
});

await test('a hung send stops at its slot, is reported as unknown, and is not repeated', async () => {
  const { made, createTransport } = fakeTransports([() => new Promise(() => {})]);
  const t0 = Date.now();
  const r = await deliver(msg, { createTransport, user: INBOX, pass: 'x', budgetMs: 2000 });
  const took = Date.now() - t0;
  assert.equal(r.code, 'EBUDGET');
  assert.ok(took < 1500, `took ${took} ms`);
  assert.equal(made.length, 1, 'a send that may still finish is not retried on 587');
});

await test('real nodemailer against a silent server: its own timeouts fire, 587 still gets its turn', async () => {
  const conns = [];
  const server = net.createServer((sock) => { conns.push(Date.now()); sock.on('error', () => {}); });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  const { port } = server.address();
  const ports = [];
  const createTransport = (opts) => {
    ports.push(opts.port);
    return nodemailer.createTransport({ ...opts, host: '127.0.0.1', port, secure: false, requireTLS: false, ignoreTLS: true });
  };
  const t0 = Date.now();
  try {
    const r = await deliver(msg, { createTransport, user: INBOX, pass: 'x', budgetMs: 6000 });
    const took = Date.now() - t0;
    assert.equal(r.ok, false);
    assert.notEqual(r.code, 'EBUDGET', 'nodemailer timed out by itself, inside the slot');
    assert.deepEqual(ports, [465, 587]);
    assert.equal(conns.length, 2);
    assert.ok(took < 6000, `took ${took} ms`);
  } finally {
    server.close();
  }
});

await test('result never contains the password', async () => {
  const { createTransport } = fakeTransports([fail('EAUTH', 535)]);
  const r = await deliver(msg, { createTransport, user: INBOX, pass: 'SECRET-PASS' });
  assert.doesNotMatch(JSON.stringify(r), /SECRET-PASS/);
});

// ---------------------------------------------------------------- function
const event = (payload) => new Request('https://example.invalid/', { method: 'POST', body: JSON.stringify({ payload }) });

await test('function without a password: dormant, 200, nothing sent', async () => {
  delete process.env.ONECOM_SMTP_PASSWORD;
  const { default: handler } = await import('../netlify/functions/submission-created.mjs');
  const res = await handler(event(booking));
  assert.equal(res.status, 200);
  assert.equal(await res.text(), 'dormant');
});

await test('function with a password but no submission: 400, nothing sent', async () => {
  process.env.ONECOM_SMTP_PASSWORD = 'not-a-real-password';
  try {
    const { default: handler } = await import('../netlify/functions/submission-created.mjs');
    const res = await handler(new Request('https://example.invalid/', { method: 'POST', body: 'not json' }));
    assert.equal(res.status, 400);
  } finally {
    delete process.env.ONECOM_SMTP_PASSWORD;
  }
});

console.log(`\n${passed} passed`);
