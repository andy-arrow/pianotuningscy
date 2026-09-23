/**
 * Real testimonials carried over from the legacy site, verbatim in English.
 * Greek versions are translations of the same words — marked so they are never
 * presented as separately-authored reviews.
 */

export interface Testimonial {
  id: string;
  author: string;
  role?: { en: string; el: string };
  quote: { en: string; el: string };
  /** Reviews carried over from the previous site; not a verified third-party rating. */
  source: 'legacy-site';
}

export const testimonials: Testimonial[] = [
  {
    id: 'aris-antoniades',
    author: 'Aris Antoniades',
    role: { en: 'Composer / Arranger / Orchestrator', el: 'Συνθέτης / Ενορχηστρωτής' },
    quote: {
      en: 'Kleanthis is a 5-star piano technician. He has been tuning and maintaining my piano for years, keeping it in stellar condition. He is highly professional, accommodative, and offers some of the best rates in the country. I highly recommend Piano Tunings CY to any professional or amateur in need of a serious piano doctor!',
      el: 'Ο Κλεάνθης είναι τεχνικός πιάνου πέντε αστέρων. Κουρδίζει και συντηρεί το πιάνο μου εδώ και χρόνια, κρατώντας το σε εξαιρετική κατάσταση. Είναι άκρως επαγγελματίας, εξυπηρετικός, και προσφέρει από τις καλύτερες τιμές στη χώρα. Συστήνω ανεπιφύλακτα το Piano Tunings Cy σε κάθε επαγγελματία ή ερασιτέχνη που χρειάζεται έναν σοβαρό γιατρό πιάνου!',
    },
    source: 'legacy-site',
  },
  {
    id: 'jared-willis',
    author: 'Jared Willis',
    quote: {
      en: 'I feel so blessed to have met Kleanthis and that he is here in Cyprus. He uncrated and set up my two precious pianos on their arrival to Cyprus and I felt so at ease to be in such professional and competent hands. Kleanthis is clearly passionate about his work, and I trust him completely with any maintenance or repair work for my instruments.',
      el: 'Νιώθω πολύ τυχερός που γνώρισα τον Κλεάνθη και που βρίσκεται εδώ στην Κύπρο. Αποσυσκεύασε και εγκατέστησε τα δύο πολύτιμα πιάνα μου όταν έφτασαν στην Κύπρο και ένιωσα απόλυτη σιγουριά που βρισκόμουν σε τόσο επαγγελματικά και ικανά χέρια. Ο Κλεάνθης είναι προφανώς παθιασμένος με τη δουλειά του, και τον εμπιστεύομαι απόλυτα για οποιαδήποτε συντήρηση ή επισκευή των οργάνων μου.',
    },
    source: 'legacy-site',
  },
  {
    id: 'katerina-sazou',
    author: 'Katerina Sazou',
    quote: {
      en: 'I was so very impressed with the service of Piano Tunings Cy. Kleanthis was professional, punctual, polite and friendly. I highly recommend Piano Tunings Cy.',
      el: 'Εντυπωσιάστηκα πραγματικά από την εξυπηρέτηση του Piano Tunings Cy. Ο Κλεάνθης ήταν επαγγελματίας, συνεπής, ευγενικός και φιλικός. Συστήνω ανεπιφύλακτα το Piano Tunings Cy.',
    },
    source: 'legacy-site',
  },
  {
    id: 'andreas-michaelides',
    author: 'Andreas Michaelides',
    quote: {
      en: 'Absolutely professional. Precise tuning and excellent service. Well done Kleanthis. Totally recommend it.',
      el: 'Απόλυτα επαγγελματικός. Ακριβές κούρδισμα και άριστη εξυπηρέτηση. Μπράβο Κλεάνθη. Το συστήνω ανεπιφύλακτα.',
    },
    source: 'legacy-site',
  },
];
