/**
 * FAQ content. These answer what Cypriot piano owners actually search for,
 * and they feed FAQPage schema so the answers can surface directly in Google.
 */

export interface Faq {
  id: string;
  /** Which pages this question appears on. 'general' = FAQ page + homepage. */
  topics: string[];
  q: { en: string; el: string };
  a: { en: string; el: string };
}

export const faqs: Faq[] = [
  {
    id: 'how-often',
    topics: ['general', 'piano-tuning'],
    q: {
      en: 'How often should a piano be tuned in Cyprus?',
      el: 'Κάθε πότε πρέπει να κουρδίζεται ένα πιάνο στην Κύπρο;',
    },
    a: {
      en: 'Twice a year for most homes. Manufacturers recommend two tunings annually, and the Cypriot climate makes that advice more relevant rather than less — the swing between humid coastal summers and dry winter heating moves the soundboard more than a temperate climate does. A piano that is played daily, or one used for teaching or performance, benefits from three or four. If an instrument has gone several years without attention it will usually need a pitch raise before a fine tuning will hold.',
      el: 'Δύο φορές τον χρόνο για τα περισσότερα σπίτια. Οι κατασκευαστές συνιστούν δύο κουρδίσματα ετησίως, και το κυπριακό κλίμα κάνει αυτή τη σύσταση πιο επίκαιρη, όχι λιγότερο — η εναλλαγή ανάμεσα στο υγρό παραθαλάσσιο καλοκαίρι και την ξηρή χειμερινή θέρμανση κινεί την αρμονική περισσότερο απ’ ό,τι ένα εύκρατο κλίμα. Ένα πιάνο που παίζεται καθημερινά, ή χρησιμοποιείται για διδασκαλία ή συναυλίες, ωφελείται από τρία ή τέσσερα. Αν ένα όργανο έχει μείνει χρόνια χωρίς φροντίδα, συνήθως χρειάζεται ανύψωση τόνου πριν κρατήσει ένα λεπτό κούρδισμα.',
    },
  },
  {
    id: 'cost',
    topics: ['general', 'piano-tuning'],
    q: { en: 'How much does a piano tuning cost?', el: 'Πόσο κοστίζει ένα κούρδισμα πιάνου;' },
    a: {
      en: 'A standard tuning is €100 and takes about an hour and a half. That covers a full tuning to concert pitch plus a check of the action and tone while the piano is open. If the instrument has drifted a long way below pitch it needs a pitch raise first, which is quoted before any work starts — you will never be surprised by the invoice.',
      el: 'Το τυπικό κούρδισμα κοστίζει €100 και διαρκεί περίπου μιάμιση ώρα. Περιλαμβάνει πλήρες κούρδισμα στο σωστό διαπασών και έλεγχο του μηχανισμού και του ήχου όσο το πιάνο είναι ανοιχτό. Αν το όργανο έχει πέσει πολύ χαμηλά τονικά, χρειάζεται πρώτα ανύψωση τόνου, η οποία κοστολογείται πριν ξεκινήσει οποιαδήποτε εργασία — δεν θα εκπλαγείτε ποτέ από το τιμολόγιο.',
    },
  },
  {
    id: 'areas',
    topics: ['general'],
    q: { en: 'Which areas of Cyprus do you cover?', el: 'Ποιες περιοχές της Κύπρου καλύπτετε;' },
    a: {
      en: 'The whole island. We work regularly in Nicosia, Limassol, Larnaca, Paphos and the Famagusta district, as well as the villages in between. Travel is usually folded into the price rather than charged separately — ask when you book.',
      el: 'Ολόκληρο το νησί. Εργαζόμαστε τακτικά σε Λευκωσία, Λεμεσό, Λάρνακα, Πάφο και στην επαρχία Αμμοχώστου, καθώς και στα χωριά ενδιάμεσα. Η μετάβαση συνήθως ενσωματώνεται στην τιμή αντί να χρεώνεται ξεχωριστά — ρωτήστε μας κατά την κράτηση.',
    },
  },
  {
    id: 'moved-piano',
    topics: ['general', 'piano-moving', 'piano-tuning'],
    q: {
      en: 'Does a piano need tuning after it is moved?',
      el: 'Χρειάζεται κούρδισμα το πιάνο μετά από μεταφορά;',
    },
    a: {
      en: 'Yes, but not immediately. Moving itself rarely knocks a piano out of tune — what does it is the new room, with its different temperature and humidity. Give the instrument two to four weeks to settle into its new environment, then tune it. Tuning the day after a move usually means paying for the same job twice.',
      el: 'Ναι, αλλά όχι αμέσως. Η ίδια η μεταφορά σπάνια ξεκουρδίζει ένα πιάνο — αυτό που το ξεκουρδίζει είναι το νέο δωμάτιο, με διαφορετική θερμοκρασία και υγρασία. Αφήστε το όργανο δύο με τέσσερις εβδομάδες να προσαρμοστεί στο νέο περιβάλλον και μετά κουρδίστε το. Το κούρδισμα την επομένη της μεταφοράς συνήθως σημαίνει ότι θα πληρώσετε δύο φορές την ίδια δουλειά.',
    },
  },
  {
    id: 'air-conditioning',
    topics: ['general', 'piano-guardian'],
    q: {
      en: 'Where should I put my piano, and does air conditioning harm it?',
      el: 'Πού πρέπει να τοποθετήσω το πιάνο μου, και το βλάπτει ο κλιματισμός;',
    },
    a: {
      en: 'Keep it away from direct sunlight, away from an exterior wall if you can, and out of the direct airflow of an air conditioning unit. It is not cold or heat that damages a piano so much as rapid change — an A/C unit blowing straight onto a soundboard creates exactly the kind of sharp humidity swing that cracks wood and unsettles tuning. An interior wall in a room with stable temperature is ideal.',
      el: 'Κρατήστε το μακριά από άμεσο ηλιακό φως, μακριά από εξωτερικό τοίχο αν γίνεται, και εκτός της ροής του κλιματιστικού. Δεν είναι τόσο το κρύο ή η ζέστη που βλάπτουν ένα πιάνο, όσο η απότομη μεταβολή — ένα κλιματιστικό που φυσά κατευθείαν στην αρμονική δημιουργεί ακριβώς τη μεταβολή υγρασίας που ραγίζει το ξύλο και χαλά το κούρδισμα. Ιδανικός είναι ένας εσωτερικός τοίχος σε δωμάτιο με σταθερή θερμοκρασία.',
    },
  },
  {
    id: 'old-piano-worth',
    topics: ['general', 'piano-evaluation', 'piano-restoration'],
    q: {
      en: 'My piano has not been tuned in 20 years. Is it worth saving?',
      el: 'Το πιάνο μου έχει 20 χρόνια να κουρδιστεί. Αξίζει να σωθεί;',
    },
    a: {
      en: 'Usually, yes — and more often than owners expect. Years without tuning do not, by themselves, ruin a piano. What matters is whether the pinblock still holds the tuning pins, whether the soundboard and bridges are sound, and whether the action can be regulated or needs rebuilding. Those are things that have to be seen, not guessed at. An evaluation costs €30 and will tell you honestly whether to restore it, tune it, or let it go.',
      el: 'Συνήθως ναι — και πιο συχνά απ’ όσο περιμένουν οι ιδιοκτήτες. Τα χρόνια χωρίς κούρδισμα δεν καταστρέφουν από μόνα τους ένα πιάνο. Σημασία έχει αν το καρφόξυλο κρατά ακόμη τα στριφτάρια, αν η αρμονική και οι καβαλάρηδες είναι γεροί, και αν ο μηχανισμός ρυθμίζεται ή χρειάζεται ανακατασκευή. Αυτά πρέπει να τα δει κανείς, όχι να τα μαντέψει. Η εκτίμηση κοστίζει €30 και θα σας πει ειλικρινά αν αξίζει ανακαίνιση, κούρδισμα, ή να το αφήσετε.',
    },
  },
  {
    id: 'buying-second-hand',
    topics: ['general', 'piano-evaluation'],
    q: {
      en: 'I am buying a second-hand piano. Should I have it checked first?',
      el: 'Αγοράζω μεταχειρισμένο πιάνο. Να το ελέγξω πρώτα;',
    },
    a: {
      en: 'Always. A piano can look immaculate and be mechanically finished. The most expensive faults — a cracked soundboard, a pinblock that will no longer hold a tuning, an action needing a full rebuild — are invisible with the lid closed. A €30 evaluation before you hand over several thousand euro is the cheapest decision in the whole transaction.',
      el: 'Πάντα. Ένα πιάνο μπορεί να φαίνεται άψογο και μηχανικά να έχει τελειώσει. Τα ακριβότερα προβλήματα — ραγισμένη αρμονική, καρφόξυλο που δεν κρατά πια κούρδισμα, μηχανισμός που χρειάζεται πλήρη ανακατασκευή — είναι αόρατα με το καπάκι κλειστό. Μια εκτίμηση €30 πριν δώσετε αρκετές χιλιάδες ευρώ είναι η φθηνότερη απόφαση όλης της συναλλαγής.',
    },
  },
  {
    id: 'move-myself',
    topics: ['general', 'piano-moving'],
    q: {
      en: 'Can I move a piano myself with a few friends?',
      el: 'Μπορώ να μεταφέρω το πιάνο μόνος μου με φίλους;',
    },
    a: {
      en: 'Please do not. An upright weighs 200–350 kg and a grand can exceed 500 kg, with the mass concentrated high and towards the back — which is why uprights topple forwards onto people. Beyond the injury risk, the damage done to legs, casters, pedals and the frame in an improvised move routinely costs more than the move would have. Proper equipment exists for a reason.',
      el: 'Καλύτερα όχι. Ένα όρθιο πιάνο ζυγίζει 200–350 κιλά και ένα πιάνο με ουρά μπορεί να ξεπεράσει τα 500, με τη μάζα συγκεντρωμένη ψηλά και προς τα πίσω — γι’ αυτό τα όρθια πιάνα πέφτουν μπροστά πάνω σε ανθρώπους. Πέρα από τον κίνδυνο τραυματισμού, οι ζημιές σε πόδια, ροδάκια, πετάλια και πλαίσιο σε έναν αυτοσχέδιο μετακομισμό κοστίζουν τακτικά περισσότερο από όσο θα κόστιζε η μεταφορά. Ο ειδικός εξοπλισμός υπάρχει για κάποιον λόγο.',
    },
  },
  {
    id: 'how-long',
    topics: ['general', 'piano-tuning'],
    q: { en: 'How long does a tuning take?', el: 'Πόση ώρα διαρκεί ένα κούρδισμα;' },
    a: {
      en: 'Around an hour and a half for a standard tuning. A piano needing a pitch raise takes longer, because it has to be tuned roughly first to bring the overall tension back, then tuned properly once the frame has taken the new load. Please keep the room quiet during the appointment — tuning is done by ear.',
      el: 'Περίπου μιάμιση ώρα για ένα τυπικό κούρδισμα. Ένα πιάνο που χρειάζεται ανύψωση τόνου παίρνει περισσότερο, γιατί πρέπει πρώτα να κουρδιστεί πρόχειρα ώστε να επανέλθει η συνολική τάση, και μετά να κουρδιστεί σωστά αφού το πλαίσιο δεχτεί το νέο φορτίο. Παρακαλούμε κρατήστε τον χώρο ήσυχο κατά τη διάρκεια του ραντεβού — το κούρδισμα γίνεται με το αυτί.',
    },
  },
  {
    id: 'new-piano',
    topics: ['general', 'piano-tuning'],
    q: {
      en: 'I just bought a brand-new piano. Does it still need tuning?',
      el: 'Μόλις αγόρασα καινούριο πιάνο. Χρειάζεται κούρδισμα;',
    },
    a: {
      en: 'Yes, and more often than an older one for the first couple of years. New strings stretch and new felt compresses, so a new instrument settles considerably during its first two years. Three to four tunings in the first year is normal and is not a sign that anything is wrong.',
      el: 'Ναι, και μάλιστα πιο συχνά από ένα παλιό τα πρώτα δύο χρόνια. Οι καινούριες χορδές τεντώνονται και οι νέες τσόχες συμπιέζονται, οπότε ένα νέο όργανο σταθεροποιείται σημαντικά μέσα στα δύο πρώτα χρόνια. Τρία με τέσσερα κουρδίσματα τον πρώτο χρόνο είναι φυσιολογικά και δεν σημαίνουν ότι κάτι δεν πάει καλά.',
    },
  },
  {
    id: 'outdoor-event',
    topics: ['general', 'grand-piano-rental'],
    q: {
      en: 'Can you supply a grand piano for an outdoor wedding or concert?',
      el: 'Μπορείτε να προσφέρετε πιάνο με ουρά για υπαίθριο γάμο ή συναυλία;',
    },
    a: {
      en: 'Yes — we do this regularly, including seaside venues. Outdoor events need planning: direct sun on the lid will pull an instrument out of tune within an hour, so we agree placement, shading and the timing of the on-site tuning with you in advance, and we tune as close to the performance as the schedule allows. Delivery, staging, tuning and collection are all included.',
      el: 'Ναι — το κάνουμε τακτικά, ακόμη και σε παραθαλάσσιους χώρους. Οι υπαίθριες εκδηλώσεις θέλουν σχεδιασμό: ο ήλιος πάνω στο καπάκι ξεκουρδίζει το όργανο μέσα σε μία ώρα, γι’ αυτό συμφωνούμε εκ των προτέρων μαζί σας την τοποθέτηση, τη σκίαση και την ώρα του επιτόπιου κουρδίσματος, και κουρδίζουμε όσο πιο κοντά στην παράσταση επιτρέπει το πρόγραμμα. Παράδοση, στήσιμο, κούρδισμα και παραλαβή περιλαμβάνονται.',
    },
  },
  {
    id: 'payment',
    topics: ['general'],
    q: { en: 'How do I book, and how do I pay?', el: 'Πώς κλείνω ραντεβού και πώς πληρώνω;' },
    a: {
      en: 'Call or message on WhatsApp for the fastest answer, or send the booking form and you will get a reply with the next available slots. Payment is made after the work is done, and prices are agreed before anything starts.',
      el: 'Τηλεφωνήστε ή στείλτε μήνυμα στο WhatsApp για την ταχύτερη απάντηση, ή συμπληρώστε τη φόρμα κράτησης και θα λάβετε απάντηση με τα επόμενα διαθέσιμα ραντεβού. Η πληρωμή γίνεται μετά την ολοκλήρωση της εργασίας, και οι τιμές συμφωνούνται πριν ξεκινήσει οτιδήποτε.',
    },
  },
];

export const faqsFor = (topic: string) => faqs.filter((f) => f.topics.includes(topic));
