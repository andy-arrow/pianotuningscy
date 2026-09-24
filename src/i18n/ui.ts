import { services } from '~/data/services';
import { serviceAreas } from '~/data/site';

export type Locale = 'en' | 'el';
export const locales: Locale[] = ['en', 'el'];
export const defaultLocale: Locale = 'en';

/** BCP-47 tags. Cyprus-specific, not en-US — this matters for hreflang. */
export const bcp47: Record<Locale, string> = { en: 'en-CY', el: 'el-CY' };
export const localeNames: Record<Locale, string> = { en: 'English', el: 'Ελληνικά' };

export const ui = {
  en: {
    'nav.home': 'Home',
    'nav.services': 'Services',
    'nav.about': 'About',
    'nav.reviews': 'Reviews',
    'nav.faq': 'FAQ',
    'nav.contact': 'Contact',
    'nav.book': 'Book a tuning',
    'nav.areas': 'Areas we cover',
    'nav.menu': 'Menu',
    'nav.close': 'Close menu',
    'nav.open': 'Open menu',
    'nav.skip': 'Skip to main content',

    'cta.book': 'Book a tuning',
    'cta.bookService': 'Book this service',
    'cta.call': 'Call',
    'cta.callNow': 'Call now',
    'cta.whatsapp': 'WhatsApp',
    'cta.email': 'Email us',
    'cta.quote': 'Get a quote',
    'cta.learnMore': 'Learn more',
    'cta.allServices': 'See all services',
    'cta.readReviews': 'Read all reviews',
    'cta.askQuestion': 'Ask a question',

    'label.from': 'From',
    'label.price': 'Price',
    'label.duration': 'Duration',
    'label.quoted': 'Quoted per instrument',
    'label.varies': 'Varies',
    'label.unitMin': 'min',
    'label.unitMinOne': 'min',
    'label.unitHr': 'hr',
    'label.unitHrOne': 'hr',
    'label.includes': 'What’s included',
    'label.since': 'Serving Cyprus since',
    'label.phone': 'Phone',
    'label.email': 'Email',
    'label.follow': 'Follow',
    'label.serviceArea': 'Service area',
    'label.allCyprus': 'All of Cyprus',
    'label.hours': 'Opening hours',
    'label.monFri': 'Monday – Friday',
    'label.sat': 'Saturday',
    'label.sun': 'Sunday',
    'label.closed': 'Closed',
    'label.required': 'required',
    'label.optional': 'optional',

    'home.heroEyebrow': 'Piano tuning, repair & removals — since 2011',
    'home.heroTitle': 'Your piano, at its best',
    'home.heroLead':
      'Concert-standard tuning, repair, restoration and transport for every piano in Cyprus — from a family upright to a Steinway on a concert stage.',
    'home.trustYears': 'years in Cyprus',
    'home.trustIsland': 'island-wide',
    'home.servicesEyebrow': 'What we do',
    'home.servicesTitle': 'Everything a piano needs, from one technician',
    'home.servicesLead':
      'Tuning, repairs, restoration, transport and rental — handled by the same person who will answer your phone call.',
    'home.aboutEyebrow': 'Who you’re calling',
    'home.whyEyebrow': 'Why it matters here',
    'home.whyTitle': 'Cyprus is hard on pianos',
    'home.whyLead':
      'Humid coastal summers, dry winter heating and air conditioning that changes a room by twenty degrees in an afternoon. All of it works on the same thing — the wood your piano is made of.',
    'home.reviewsEyebrow': 'What clients say',
    'home.reviewsTitle': 'Trusted with instruments people love',
    'home.faqEyebrow': 'Common questions',
    'home.faqTitle': 'Questions piano owners ask',
    'home.areasEyebrow': 'Where we work',
    'home.areasTitle': 'Across the whole island',
    'home.areasLead':
      'Based in Limassol, working weekly in every district of the island. Travel is normally included in the price.',
    'home.ctaTitle': 'Ready when your piano is',
    'home.ctaLead':
      'Tell us what your piano needs — or simply that it has not been tuned in a while — and you will get a straight answer and a firm price.',

    'services.title': 'Services',
    'services.lead':
      'Every service below is carried out personally by Kleanthis Christoforou, working across Cyprus since 2011.',
    'services.otherTitle': 'Other services',
    'services.relatedTitle': 'Related services',

    'about.title': 'About',
    'reviews.title': 'Reviews',
    'reviews.lead':
      'Comments from clients who have trusted us with their instruments — concert professionals, teachers and families.',
    'reviews.note':
      'These reviews were given directly to Piano Tunings Cy and are reproduced as written.',
    'faq.title': 'Frequently asked questions',
    'faq.lead':
      'Straight answers about tuning, moving, restoring and looking after a piano in the Cypriot climate.',
    'faq.stillTitle': 'Still have a question?',
    'faq.stillLead': 'Ask it directly — you will get a real answer, not a sales pitch.',

    'contact.title': 'Contact',
    'contact.lead':
      'Call, message on WhatsApp, or send the form. Messages are answered personally, usually the same day.',
    'contact.formTitle': 'Send a message',
    'contact.fastestTitle': 'Fastest way to reach us',
    'contact.fastestLead':
      'A phone call or WhatsApp message gets an answer quickest, especially for urgent work or event bookings.',

    'book.title': 'Book a service',
    'book.lead':
      'Tell us about your piano and what it needs. You will get a reply with the next available appointments and a confirmed price.',
    'book.note':
      'Sending this form does not charge you anything. Nothing is booked until we have confirmed the appointment with you.',

    'form.name': 'Your name',
    'form.email': 'Email address',
    'form.phone': 'Phone number',
    'form.city': 'City / area',
    'form.service': 'What do you need?',
    'form.servicePlaceholder': 'Choose a service',
    'form.serviceOther': 'Something else / not sure',
    'form.pianoType': 'Type of piano',
    'form.pianoUpright': 'Upright',
    'form.pianoGrand': 'Grand',
    'form.pianoUnsure': 'Not sure',
    'form.lastTuned': 'When was it last tuned?',
    'form.lastTunedOptions': 'Within a year|1–3 years ago|3–10 years ago|More than 10 years ago|Never / don’t know',
    'form.message': 'Anything else we should know',
    'form.messagePlaceholder':
      'Make and model if you know it, access details for a move, the date of your event…',
    'form.consent':
      'I agree that Piano Tunings Cy may use these details to respond to my enquiry.',
    'form.submit': 'Send enquiry',
    'form.sending': 'Sending…',
    'form.privacyNote': 'Your details are used to answer your enquiry and nothing else.',
    'form.errorRequired': 'Please fill in this field.',
    'form.errorEmail': 'Please enter a valid email address.',
    'form.errorGeneric': 'Something went wrong. Please call or WhatsApp us instead.',

    'thanks.title': 'Message sent',
    'thanks.lead':
      'Thank you — your message has arrived. You will normally get a reply the same day. If it is urgent, call or send a WhatsApp message.',
    'thanks.back': 'Back to the homepage',

    'footer.tagline': 'Piano tuning, repair, restoration and transport across Cyprus since 2011.',
    'footer.servicesTitle': 'Services',
    'footer.companyTitle': 'Company',
    'footer.contactTitle': 'Contact',
    'footer.legalTitle': 'Legal',
    'footer.privacy': 'Privacy policy',
    'footer.terms': 'Terms of service',
    'footer.cookies': 'Cookie policy',
    'footer.rights': 'All rights reserved.',
    'footer.builtBy': 'Site by',

    'a11y.langSwitch': 'Change language',
    'a11y.currentLang': 'Current language',
    'a11y.breadcrumb': 'Breadcrumb',
    'a11y.mainNav': 'Main navigation',
    'a11y.footerNav': 'Footer navigation',
    'a11y.socialNav': 'Social media',
    'a11y.newTab': 'opens in a new tab',

    '404.title': 'Page not found',
    '404.lead':
      'This page has moved or never existed. The site was rebuilt in 2026 and some old links changed.',
    '404.suggest': 'Try one of these instead:',
  },

  el: {
    'nav.home': 'Αρχική',
    'nav.services': 'Υπηρεσίες',
    'nav.about': 'Σχετικά',
    'nav.reviews': 'Κριτικές',
    'nav.faq': 'Συχνές ερωτήσεις',
    'nav.contact': 'Επικοινωνία',
    'nav.book': 'Κλείστε κούρδισμα',
    'nav.areas': 'Περιοχές',
    'nav.menu': 'Μενού',
    'nav.close': 'Κλείσιμο μενού',
    'nav.open': 'Άνοιγμα μενού',
    'nav.skip': 'Μετάβαση στο περιεχόμενο',

    'cta.book': 'Κλείστε κούρδισμα',
    'cta.bookService': 'Κλείστε αυτή την υπηρεσία',
    'cta.call': 'Τηλέφωνο',
    'cta.callNow': 'Καλέστε τώρα',
    'cta.whatsapp': 'WhatsApp',
    'cta.email': 'Στείλτε email',
    'cta.quote': 'Ζητήστε προσφορά',
    'cta.learnMore': 'Περισσότερα',
    'cta.allServices': 'Όλες οι υπηρεσίες',
    'cta.readReviews': 'Όλες οι κριτικές',
    'cta.askQuestion': 'Κάντε μια ερώτηση',

    'label.from': 'Από',
    'label.price': 'Τιμή',
    'label.duration': 'Διάρκεια',
    'label.quoted': 'Κοστολόγηση ανά όργανο',
    'label.varies': 'Ποικίλλει',
    // Greek inflects for number: 1 ώρα / 2 ώρες, 1 λεπτό / 30 λεπτά.
    'label.unitMin': 'λεπτά',
    'label.unitMinOne': 'λεπτό',
    'label.unitHr': 'ώρες',
    'label.unitHrOne': 'ώρα',
    'label.includes': 'Τι περιλαμβάνει',
    'label.since': 'Στην Κύπρο από το',
    'label.phone': 'Τηλέφωνο',
    'label.email': 'Email',
    'label.follow': 'Ακολουθήστε μας',
    'label.serviceArea': 'Περιοχή εξυπηρέτησης',
    'label.allCyprus': 'Όλη η Κύπρος',
    'label.hours': 'Ώρες λειτουργίας',
    'label.monFri': 'Δευτέρα – Παρασκευή',
    'label.sat': 'Σάββατο',
    'label.sun': 'Κυριακή',
    'label.closed': 'Κλειστά',
    'label.required': 'υποχρεωτικό',
    'label.optional': 'προαιρετικό',

    'home.heroEyebrow': 'Κούρδισμα, επισκευή & μεταφορά πιάνου — από το 2011',
    'home.heroTitle': 'Το πιάνο σας, στα καλύτερά του',
    'home.heroLead':
      'Κούρδισμα επιπέδου συναυλίας, επισκευή, ανακαίνιση και μεταφορά για κάθε πιάνο στην Κύπρο — από το οικογενειακό όρθιο πιάνο μέχρι ένα Steinway σε σκηνή συναυλιών.',
    'home.trustYears': 'χρόνια στην Κύπρο',
    'home.trustIsland': 'σε όλο το νησί',
    'home.servicesEyebrow': 'Τι κάνουμε',
    'home.servicesTitle': 'Ό,τι χρειάζεται ένα πιάνο, από έναν τεχνικό',
    'home.servicesLead':
      'Κούρδισμα, επισκευές, ανακαίνιση, μεταφορά και ενοικίαση — από το ίδιο πρόσωπο που θα σηκώσει το τηλέφωνο.',
    'home.aboutEyebrow': 'Ποιον καλείτε',
    'home.whyEyebrow': 'Γιατί έχει σημασία εδώ',
    'home.whyTitle': 'Η Κύπρος είναι σκληρή με τα πιάνα',
    'home.whyLead':
      'Υγρά παραθαλάσσια καλοκαίρια, ξηρή χειμερινή θέρμανση και κλιματισμός που αλλάζει ένα δωμάτιο κατά είκοσι βαθμούς μέσα σε ένα απόγευμα. Όλα δρουν στο ίδιο πράγμα — στο ξύλο από το οποίο είναι φτιαγμένο το πιάνο σας.',
    'home.reviewsEyebrow': 'Τι λένε οι πελάτες',
    'home.reviewsTitle': 'Εμπιστοσύνη σε όργανα που αγαπιούνται',
    'home.faqEyebrow': 'Συχνές ερωτήσεις',
    'home.faqTitle': 'Ερωτήσεις που κάνουν οι ιδιοκτήτες πιάνου',
    'home.areasEyebrow': 'Πού εργαζόμαστε',
    'home.areasTitle': 'Σε ολόκληρο το νησί',
    'home.areasLead':
      'Με έδρα τη Λεμεσό και εβδομαδιαία παρουσία σε κάθε επαρχία του νησιού. Η μετάβαση κανονικά περιλαμβάνεται στην τιμή.',
    'home.ctaTitle': 'Έτοιμοι όταν είναι και το πιάνο σας',
    'home.ctaLead':
      'Πείτε μας τι χρειάζεται το πιάνο σας — ή απλώς ότι έχει καιρό να κουρδιστεί — και θα λάβετε ξεκάθαρη απάντηση και σταθερή τιμή.',

    'services.title': 'Υπηρεσίες',
    'services.lead':
      'Κάθε υπηρεσία παρακάτω εκτελείται προσωπικά από τον Κλεάνθη Χριστοφόρου, σε όλη την Κύπρο από το 2011.',
    'services.otherTitle': 'Άλλες υπηρεσίες',
    'services.relatedTitle': 'Σχετικές υπηρεσίες',

    'about.title': 'Σχετικά με εμάς',
    'reviews.title': 'Κριτικές',
    'reviews.lead':
      'Σχόλια από πελάτες που μας εμπιστεύτηκαν τα όργανά τους — επαγγελματίες μουσικοί, καθηγητές και οικογένειες.',
    'reviews.note':
      'Οι κριτικές δόθηκαν απευθείας στο Piano Tunings Cy και αναπαράγονται όπως γράφτηκαν.',
    'faq.title': 'Συχνές ερωτήσεις',
    'faq.lead':
      'Ξεκάθαρες απαντήσεις για το κούρδισμα, τη μεταφορά, την ανακαίνιση και τη φροντίδα ενός πιάνου στο κυπριακό κλίμα.',
    'faq.stillTitle': 'Έχετε ακόμη κάποια ερώτηση;',
    'faq.stillLead': 'Ρωτήστε μας απευθείας — θα πάρετε πραγματική απάντηση, όχι πωλήσεις.',

    'contact.title': 'Επικοινωνία',
    'contact.lead':
      'Τηλεφωνήστε, στείλτε μήνυμα στο WhatsApp, ή συμπληρώστε τη φόρμα. Απαντάμε προσωπικά, συνήθως την ίδια μέρα.',
    'contact.formTitle': 'Στείλτε μήνυμα',
    'contact.fastestTitle': 'Ο γρηγορότερος τρόπος επικοινωνίας',
    'contact.fastestLead':
      'Ένα τηλεφώνημα ή μήνυμα WhatsApp παίρνει απάντηση ταχύτερα, ειδικά για επείγουσες εργασίες ή κρατήσεις εκδηλώσεων.',

    'book.title': 'Κλείστε ραντεβού',
    'book.lead':
      'Πείτε μας για το πιάνο σας και τι χρειάζεται. Θα λάβετε απάντηση με τα επόμενα διαθέσιμα ραντεβού και επιβεβαιωμένη τιμή.',
    'book.note':
      'Η αποστολή της φόρμας δεν σας χρεώνει τίποτα. Τίποτα δεν κλείνεται μέχρι να επιβεβαιώσουμε μαζί σας το ραντεβού.',

    'form.name': 'Το όνομά σας',
    'form.email': 'Διεύθυνση email',
    'form.phone': 'Τηλέφωνο',
    'form.city': 'Πόλη / περιοχή',
    'form.service': 'Τι χρειάζεστε;',
    'form.servicePlaceholder': 'Επιλέξτε υπηρεσία',
    'form.serviceOther': 'Κάτι άλλο / δεν είμαι σίγουρος',
    'form.pianoType': 'Τύπος πιάνου',
    'form.pianoUpright': 'Όρθιο',
    'form.pianoGrand': 'Με ουρά',
    'form.pianoUnsure': 'Δεν γνωρίζω',
    'form.lastTuned': 'Πότε κουρδίστηκε τελευταία φορά;',
    'form.lastTunedOptions':
      'Μέσα στον τελευταίο χρόνο|Πριν 1–3 χρόνια|Πριν 3–10 χρόνια|Πάνω από 10 χρόνια|Ποτέ / δεν γνωρίζω',
    'form.message': 'Οτιδήποτε άλλο πρέπει να γνωρίζουμε',
    'form.messagePlaceholder':
      'Μάρκα και μοντέλο αν το γνωρίζετε, λεπτομέρειες πρόσβασης για μεταφορά, ημερομηνία εκδήλωσης…',
    'form.consent':
      'Συμφωνώ να χρησιμοποιήσει το Piano Tunings Cy τα στοιχεία αυτά για να απαντήσει στο αίτημά μου.',
    'form.submit': 'Αποστολή',
    'form.sending': 'Αποστολή…',
    'form.privacyNote': 'Τα στοιχεία σας χρησιμοποιούνται μόνο για να απαντήσουμε στο αίτημά σας.',
    'form.errorRequired': 'Συμπληρώστε αυτό το πεδίο.',
    'form.errorEmail': 'Εισαγάγετε έγκυρη διεύθυνση email.',
    'form.errorGeneric': 'Κάτι πήγε στραβά. Τηλεφωνήστε μας ή στείλτε WhatsApp.',

    'thanks.title': 'Το μήνυμα στάλθηκε',
    'thanks.lead':
      'Ευχαριστούμε — το μήνυμά σας έφτασε. Συνήθως απαντάμε την ίδια μέρα. Αν είναι επείγον, τηλεφωνήστε ή στείλτε μήνυμα στο WhatsApp.',
    'thanks.back': 'Επιστροφή στην αρχική',

    'footer.tagline':
      'Κούρδισμα, επισκευή, ανακαίνιση και μεταφορά πιάνου σε όλη την Κύπρο από το 2011.',
    'footer.servicesTitle': 'Υπηρεσίες',
    'footer.companyTitle': 'Η εταιρεία',
    'footer.contactTitle': 'Επικοινωνία',
    'footer.legalTitle': 'Νομικά',
    'footer.privacy': 'Πολιτική απορρήτου',
    'footer.terms': 'Όροι υπηρεσίας',
    'footer.cookies': 'Πολιτική cookies',
    'footer.rights': 'Με επιφύλαξη παντός δικαιώματος.',
    'footer.builtBy': 'Ιστοσελίδα από',

    'a11y.langSwitch': 'Αλλαγή γλώσσας',
    'a11y.currentLang': 'Τρέχουσα γλώσσα',
    'a11y.breadcrumb': 'Διαδρομή πλοήγησης',
    'a11y.mainNav': 'Κύρια πλοήγηση',
    'a11y.footerNav': 'Πλοήγηση υποσέλιδου',
    'a11y.socialNav': 'Μέσα κοινωνικής δικτύωσης',
    'a11y.newTab': 'ανοίγει σε νέα καρτέλα',

    '404.title': 'Η σελίδα δεν βρέθηκε',
    '404.lead':
      'Η σελίδα μετακινήθηκε ή δεν υπήρξε ποτέ. Η ιστοσελίδα ανακατασκευάστηκε το 2026 και ορισμένοι παλιοί σύνδεσμοι άλλαξαν.',
    '404.suggest': 'Δοκιμάστε ένα από αυτά:',
  },
} as const;

export type UiKey = keyof (typeof ui)['en'];

/** Translator bound to a locale. Falls back to English rather than rendering a key. */
export function useTranslations(locale: Locale) {
  return function t(key: UiKey): string {
    return (ui[locale] as Record<string, string>)[key] ?? (ui.en as Record<string, string>)[key] ?? key;
  };
}

/* ------------------------------------------------------------------ *
 * Routing — translated slugs, so Greek pages get Greek URLs.
 * ------------------------------------------------------------------ */

const PATHS: Record<string, { en: string; el: string }> = {
  home: { en: '', el: '' },
  services: { en: 'services', el: 'ypiresies' },
  about: { en: 'about', el: 'schetika-me-emas' },
  reviews: { en: 'reviews', el: 'kritikes' },
  faq: { en: 'faq', el: 'syhnes-erotiseis' },
  contact: { en: 'contact', el: 'epikoinonia' },
  book: { en: 'book', el: 'klisi-rantevou' },
  areas: { en: 'areas', el: 'perioches' },
  thanks: { en: 'thanks', el: 'efcharistoume' },
  privacy: { en: 'privacy', el: 'politiki-aporritou' },
  terms: { en: 'terms', el: 'oroi-chrisis' },
  cookies: { en: 'cookies', el: 'politiki-cookies' },
};

/**
 * Deployment base. '' at a domain root, '/repo' under GitHub Pages.
 * Astro sets BASE_URL from the `base` config option.
 */
const BASE = (import.meta.env.BASE_URL || '/').replace(/\/+$/, '');

/** Locale-aware URL for a named route. Always returns a trailing slash. */
export function path(key: keyof typeof PATHS, locale: Locale): string {
  const seg = PATHS[key][locale];
  const prefix = locale === defaultLocale ? '' : `/${locale}`;
  return seg ? `${BASE}${prefix}/${seg}/` : `${BASE}${prefix}/`;
}

export function servicePath(slug: string, locale: Locale): string {
  const svc = services.find((s) => s.slug === slug);
  const leaf = locale === 'el' ? (svc?.elSlug ?? slug) : slug;
  return `${path('services', locale)}${leaf}/`;
}

export function areaPath(slug: string, locale: Locale): string {
  const area = serviceAreas.find((a) => a.slug === slug);
  const leaf = locale === 'el' ? (area?.elSlug ?? slug) : slug;
  return `${path('areas', locale)}${leaf}/`;
}

/** Given the current route key, the equivalent URL in the other locale. */
export function alternateUrls(
  routeKey: keyof typeof PATHS | { kind: 'service' | 'area'; slug: string },
): Record<Locale, string> {
  if (typeof routeKey === 'object') {
    const fn = routeKey.kind === 'service' ? servicePath : areaPath;
    return { en: fn(routeKey.slug, 'en'), el: fn(routeKey.slug, 'el') };
  }
  return { en: path(routeKey, 'en'), el: path(routeKey, 'el') };
}

/**
 * Pull the locale out of an Astro URL pathname.
 * Strips the deployment base first — under GitHub Pages the path is
 * `/repo/el/...`, which a naive `/el` check would read as English.
 */
export function localeFromUrl(url: URL): Locale {
  const p = BASE && url.pathname.startsWith(BASE) ? url.pathname.slice(BASE.length) : url.pathname;
  return p === '/el' || p.startsWith('/el/') ? 'el' : 'en';
}
