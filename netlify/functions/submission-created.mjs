/**
 * Emails every verified enquiry to info@pianotuningscy.com through one.com's
 * own mail server, so it doesn't depend on Netlify's notification email
 * (formresponses@netlify.com), which never reached that inbox.
 *
 * Netlify runs this by its file name for each submission it verifies (spam
 * never triggers it), and signs the event so it can't be called from outside.
 *
 * Dormant until the owner adds, in the Netlify UI (never in this repo, which
 * is public):
 *   ONECOM_SMTP_PASSWORD  the password of the mailbox that sends
 *   ONECOM_SMTP_USER      optional; that mailbox, default info@pianotuningscy.com
 * Without the password it logs one line and returns. Netlify's own email
 * notification is separate and keeps running either way.
 */
import { createTransport } from 'nodemailer';
import { INBOX, buildEnquiryEmail, fallbackEmail, deliver } from '../lib/enquiry-mail.mjs';

// Best effort only: each warm instance counts its own sends, and Netlify may
// run several at once. It slows a bot that got past the spam filter; Netlify
// Forms' own limits are the real ceiling.
const MAX_PER_HOUR = 30;
const sent = [];

export default async (req) => {
  let payload = null;
  try {
    ({ payload } = await req.json());
  } catch {
    /* handled below */
  }
  const id = String(payload?.id ?? '?').slice(0, 40);

  const pass = process.env.ONECOM_SMTP_PASSWORD;
  if (!pass) {
    console.log(`enquiry-mail: dormant (ONECOM_SMTP_PASSWORD not set); submission ${id} relies on Netlify's own email`);
    return new Response('dormant');
  }
  if (!payload?.data) {
    console.error('enquiry-mail: event had no submission in it');
    return new Response('no submission', { status: 400 });
  }

  const hourAgo = Date.now() - 3600_000;
  while (sent.length && sent[0] < hourAgo) sent.shift();
  if (sent.length >= MAX_PER_HOUR) {
    console.error(`enquiry-mail: over ${MAX_PER_HOUR}/hour, not sending ${id}; it is still in Netlify Forms`);
    return new Response('rate limited', { status: 429 });
  }

  const user = process.env.ONECOM_SMTP_USER || INBOX;
  let message;
  try {
    message = buildEnquiryEmail(payload, { from: user });
  } catch (err) {
    console.error(`enquiry-mail: formatting failed for ${id} (${err?.name}); sending the plain version`);
    message = fallbackEmail(payload, { from: user });
  }

  const result = await deliver(message, { createTransport, user, pass });
  // Codes only: never the message, which would copy customer data into logs.
  if (result.ok) {
    sent.push(Date.now());
    console.log(`enquiry-mail: submission ${id} sent to ${INBOX} via port ${result.port}`);
    return new Response('sent');
  }
  const outcome = result.code === 'EBUDGET' ? 'timed out (may still arrive)' : 'NOT sent';
  console.error(
    `enquiry-mail: submission ${id} ${outcome}: ${result.code} ${result.responseCode ?? ''} ${result.command ?? ''} (last port ${result.port ?? '-'}); it is still in Netlify Forms`,
  );
  return new Response('send failed', { status: 502 });
};
