/**
 * Single source of truth for business facts.
 * Everything here was verified against the live legacy site unless marked NEEDS-CONFIRMATION.
 */

export const site = {
  name: 'Piano Tunings Cy',
  legalName: 'Piano Tunings Cy',
  url: 'https://www.pianotuningscy.com',
  foundingYear: 2011,

  technician: {
    name: 'Kleanthis Christoforou',
    jobTitle: { en: 'Piano Technician', el: 'Τεχνικός Πιάνου' },
  },

  phone: '+35799405612',
  phoneDisplay: '+357 99 405612',
  whatsapp: '35799405612',
  email: 'info@pianotuningscy.com',

  address: {
    // NEEDS-CONFIRMATION: street address. Omitted deliberately — publishing a wrong
    // address damages local SEO more than omitting it. The business is mobile/at-your-home,
    // so it is modelled as a service-area business.
    locality: { en: 'Limassol', el: 'Λεμεσός' },
    region: { en: 'Limassol District', el: 'Επαρχία Λεμεσού' },
    /** Un-localised form for legacy geo meta tags. */
    localityEn: 'Limassol',
    country: 'CY',
    countryName: { en: 'Cyprus', el: 'Κύπρος' },
  },

  /** Approximate centre of Limassol — geo markup for a service-area business. */
  geo: { lat: 34.7071, lng: 33.0226 },

  /**
   * Confirmed by Kleanthis (Sept 2026): weekdays 09:00–17:00, weekends off.
   * This is the single source of truth — the footer and contact page derive
   * their visible hours from it, so the page and the schema cannot diverge.
   */
  hours: [
    { days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], opens: '09:00', closes: '17:00' },
  ],

  social: {
    facebook: 'https://www.facebook.com/pianotuningscy',
    instagram: 'https://www.instagram.com/piano_tunings_cy/',
    tiktok: 'https://www.tiktok.com/@pianotuningscy',
  },

  /** Analytics: set to a real ID to enable. Empty string = no tracking loaded at all. */
  analytics: {
    plausibleDomain: 'pianotuningscy.com', // privacy-first, no cookie banner required
    ga4: '', // leave empty unless the owner wants GA4 (then a consent banner is required)
  },


  /**
   * Form handling for a static site.
   * - Deployed on Netlify: leave `endpoint` empty — Netlify Forms picks the form up
   *   automatically from the data-netlify attribute, no third party involved.
   * - Anywhere else: set `endpoint` to a Formspree / Web3Forms / your-own-API URL.
   */
  forms: {
    endpoint: '',
    /**
     * One name per form SHAPE. Netlify keys submissions by form name and shows
     * the field schema from the most recent deploy of that name — so a contact
     * form and a booking form (which adds piano-type and last-tuned) must not
     * share one, or booking answers stop appearing in the dashboard.
     */
    netlifyName: { contact: 'enquiry-contact', booking: 'enquiry-booking' },
  },

  currency: 'EUR',
  vatNote: { en: 'Prices include VAT.', el: 'Οι τιμές περιλαμβάνουν ΦΠΑ.' },
} as const;

export type Locale = 'en' | 'el';

/**
 * Cities served — each gets a landing page for local search.
 *
 * Greek needs more than the nominative: "in Limassol" is «στη Λεμεσό», which is
 * both a case change (Λεμεσός → Λεμεσό) and a preposition that keeps or drops its
 * final ν depending on the next sound. Storing the finished phrase keeps that
 * grammar out of the templates.
 */
export const serviceAreas = [
  { slug: 'nicosia',   en: 'Nicosia',   el: 'Λευκωσία',   elIn: 'στη Λευκωσία',   elSlug: 'lefkosia',    lat: 35.1856, lng: 33.3823 },
  { slug: 'limassol',  en: 'Limassol',  el: 'Λεμεσός',    elIn: 'στη Λεμεσό',     elSlug: 'lemesos',     lat: 34.7071, lng: 33.0226 },
  { slug: 'larnaca',   en: 'Larnaca',   el: 'Λάρνακα',    elIn: 'στη Λάρνακα',    elSlug: 'larnaka',     lat: 34.9182, lng: 33.6201 },
  { slug: 'paphos',    en: 'Paphos',    el: 'Πάφος',      elIn: 'στην Πάφο',      elSlug: 'pafos',       lat: 34.7754, lng: 32.4245 },
  { slug: 'famagusta', en: 'Famagusta', el: 'Αμμόχωστος', elIn: 'στην Αμμόχωστο', elSlug: 'ammochostos', lat: 35.0396, lng: 33.9542 },
] as const;
