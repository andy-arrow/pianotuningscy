import type { APIRoute } from 'astro';
import { site, serviceAreas } from '~/data/site';
import { services } from '~/data/services';
import { faqs } from '~/data/faq';
import { openingHoursRows } from '~/lib/hours';
import type { Locale } from '~/i18n/ui';
import { cyprusIso } from '~/lib/cyprusTime';

/**
 * The chat assistant's knowledge, generated from the same data files that build
 * the pages. Change a price in services.ts, push, and the assistant knows —
 * there is no second copy to keep in sync.
 *
 * Built twice, in English and in Greek, from the site's own professional copy
 * in each language. Tested: a model translating English facts into Greek on
 * the fly made grammar mistakes and left terms in English; given the site's
 * Greek text it can quote it instead. The Worker picks one per question.
 *
 * Only facts the site itself publishes belong here. Marketing prose stays out,
 * so the assistant repeats prices and policies, not adjectives. Kept compact:
 * every character is sent on every chat turn, on a free daily allowance.
 */

type Service = (typeof services)[number];

const L = {
  en: {
    business: 'BUSINESS',
    intro: () =>
      `${site.name} is ${site.technician.name}, a piano technician working on his own — ` +
      'no team, no subcontractors; he answers the phone and does every job himself.',
    since: `Trading since ${site.foundingYear}.`,
    area: () =>
      `Based in ${site.address.locality.en}, Cyprus. Covers the whole island: ` +
      `${serviceAreas.map((a) => a.en).join(', ')} district, and villages in between. ` +
      'Travel is normally included in the price, not charged separately; ask when you book.',
    hours: 'Opening hours (Cyprus time)',
    contact: `Phone and WhatsApp: ${site.phoneDisplay}. Email: ${site.email}.`,
    langs: 'Speaks Greek and English.',
    payment: 'Payment is made after the work is done. Prices are agreed before any work starts.',
    services: 'SERVICES — [slug] name: price; duration',
    quoted: 'quoted per instrument after inspection',
    from: 'from',
    varies: 'varies',
    hr: (n: number) => `${n} hr`,
    min: (n: number) => `${n} min`,
    what: 'What it is',
    includes: 'Includes',
    note: 'Pricing note',
    notOffered: 'NOT OFFERED',
    digital:
      'Digital pianos are not tuned — they have no strings. The booking form offers upright and ' +
      'grand pianos only. For any other digital-piano question, suggest contacting Kleanthis directly.',
    faq: 'FREQUENTLY ASKED QUESTIONS',
    sep: '; ',
  },
  el: {
    business: 'Η ΕΠΙΧΕΙΡΗΣΗ',
    intro: () =>
      `Το ${site.name} είναι ο ${site.technician.nameEl} (τον/του Κλεάνθη), τεχνικός πιάνου ` +
      'που εργάζεται μόνος του — χωρίς ομάδα, χωρίς υπεργολάβους· απαντά ο ίδιος στο τηλέφωνο ' +
      'και κάνει ο ίδιος κάθε εργασία.',
    since: `Δραστηριοποιείται από το ${site.foundingYear}.`,
    area: () =>
      `Έδρα: ${site.address.locality.el}, Κύπρος. Καλύπτει όλο το νησί: ` +
      `${serviceAreas.map((a) => (a.slug === 'famagusta' ? 'επαρχία Αμμοχώστου' : a.el)).join(', ')}, ` +
      'και τα χωριά ενδιάμεσα. Τα έξοδα μετακίνησης συνήθως περιλαμβάνονται στην τιμή και δεν ' +
      'χρεώνονται ξεχωριστά· ρωτήστε κατά την κράτηση.',
    hours: 'Ώρες λειτουργίας (ώρα Κύπρου)',
    contact: `Τηλέφωνο και WhatsApp: ${site.phoneDisplay}. Email: ${site.email}.`,
    langs: 'Μιλά ελληνικά και αγγλικά.',
    payment:
      'Η πληρωμή γίνεται μετά την ολοκλήρωση της εργασίας. Οι τιμές συμφωνούνται πριν ξεκινήσει ' +
      'οποιαδήποτε εργασία.',
    services: 'ΥΠΗΡΕΣΙΕΣ — [slug] όνομα: τιμή· διάρκεια',
    // Not "κατόπιν εκτίμησης": Εκτίμηση Πιάνου is also the paid €30 service.
    quoted: 'η τιμή δίνεται αφού ο Κλεάνθης δει το όργανο',
    from: 'από',
    varies: 'ποικίλλει',
    hr: (n: number) => `${n} ${n === 1 ? 'ώρα' : 'ώρες'}`,
    min: (n: number) => `${n} λεπτά`,
    what: 'Τι είναι',
    includes: 'Περιλαμβάνει',
    note: 'Σημείωση τιμής',
    notOffered: 'ΔΕΝ ΠΡΟΣΦΕΡΕΤΑΙ',
    digital:
      'Τα ψηφιακά πιάνα δεν κουρδίζονται — δεν έχουν χορδές. Η φόρμα κράτησης αφορά μόνο όρθια ' +
      'πιάνα και πιάνα με ουρά. Για οποιαδήποτε άλλη ερώτηση για ψηφιακό πιάνο, προτείνετε ' +
      'επικοινωνία απευθείας με τον Κλεάνθη.',
    faq: 'ΣΥΧΝΕΣ ΕΡΩΤΗΣΕΙΣ',
    // In Greek ";" is the question mark; the ano teleia is its semicolon.
    sep: ' · ',
  },
} satisfies Record<Locale, unknown>;

function formatPrice(s: Service, locale: Locale): string {
  if (s.price === null) return L[locale].quoted;
  return `${s.priceFrom ? `${L[locale].from} ` : ''}€${s.price}`;
}

function formatDuration(mins: number | null, locale: Locale): string {
  const t = L[locale];
  if (mins === null) return t.varies;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return [h ? t.hr(h) : '', m ? t.min(m) : ''].filter(Boolean).join(' ');
}

function buildKnowledge(locale: Locale): string {
  const t = L[locale];
  const hours = openingHoursRows(locale)
    .map((r) => `${r.label}: ${r.value}`)
    .join(t.sep);

  const lines: string[] = [];

  lines.push(t.business, t.intro(), t.since, t.area(), `${t.hours}: ${hours}.`, t.contact, t.langs, t.payment, '');

  lines.push(t.services);
  for (const s of services) {
    const c = s[locale];
    lines.push(`[${s.slug}] ${c.name}: ${formatPrice(s, locale)}${t.sep}${formatDuration(s.duration, locale)}.`);
    lines.push(`  ${t.what}: ${c.summary}`);
    lines.push(`  ${t.includes}: ${c.includes.join(t.sep)}.`);
    lines.push(`  ${t.note}: ${c.priceNote}`);
  }
  lines.push('');

  lines.push(t.notOffered, t.digital, '');

  lines.push(t.faq);
  for (const f of faqs) {
    lines.push(`Q: ${f.q[locale]}`);
    lines.push(`A: ${f.a[locale]}`);
  }

  if (locale === 'en') {
    // For a Greek reply built from the English facts (e.g. Greeklish on an
    // English page), the exact Greek names keep terminology consistent.
    lines.push('');
    lines.push('OFFICIAL GREEK NAMES — use these exact terms when replying in Greek');
    lines.push(`Kleanthis Christoforou = ${site.technician.nameEl} (τον/του Κλεάνθη)`);
    for (const s of services) lines.push(`${s.en.name} = ${s.el.name}`);
    for (const a of serviceAreas) lines.push(`${a.en} = ${a.el}`);
    // Terms as the site's own Greek copy uses them.
    lines.push(
      'pitch raise = ανύψωση τόνου; concert pitch = σωστό διαπασών; grand piano = πιάνο με ουρά; ' +
        'upright = όρθιο πιάνο; soundboard = αρμονική; pinblock = καρφόξυλο; ' +
        'travel costs = έξοδα μετακίνησης; booking form = φόρμα κράτησης',
    );
  }

  return lines.join('\n');
}

export const GET: APIRoute = () => {
  // The assistant links to pages and pre-fills the booking form by slug; it may
  // only use slugs from this list, which the widget also validates.
  const body = {
    version: 2,
    generatedAt: cyprusIso(),
    serviceSlugs: services.map((s) => s.slug),
    knowledge: buildKnowledge('en'),
    knowledgeEl: buildKnowledge('el'),
  };

  return new Response(JSON.stringify(body), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
};
