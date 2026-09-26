/**
 * Long-form bilingual prose that is too substantial to live in the UI-strings file.
 */
import type { Locale } from '~/i18n/ui';

type L<T> = Record<Locale, T>;

export const homeAbout: L<{ title: string; paras: string[]; bullets: string[]; }> = {
  en: {
    title: 'One technician, every piano on the island',
    paras: [
      'Piano Tunings Cy is <strong>Kleanthis Christoforou</strong>. When you call, he answers. When he arrives, he is the one who does the work — there is no rotating team and no call centre between you and the person with his hands inside your instrument.',
      'Since 2011 he has tuned, repaired, restored and moved pianos for music shops across Cyprus, for theatres, for schools and conservatories, for concert venues — including a Steinway Model D for the Cyprus Symphony Orchestra — and for several hundred families with an upright in the living room.',
      'The same standard applies to all of them. A family piano that has not been touched in fifteen years gets the same attention as a concert instrument on the night of a performance.',
    ],
    bullets: [
      'Tuning to concert pitch',
      'Repairs, regulation and voicing',
      'Full restorations and restringing',
      'Specialist moving, island-wide',
    ],
  },
  el: {
    title: 'Ένας τεχνικός, για κάθε πιάνο του νησιού',
    paras: [
      'Το Piano Tunings Cy είναι ο <strong>Κλεάνθης Χριστοφόρου</strong>. Όταν τηλεφωνείτε, απαντά ο ίδιος. Όταν έρχεται, ο ίδιος κάνει τη δουλειά — δεν υπάρχει εναλλασσόμενο συνεργείο ούτε τηλεφωνικό κέντρο ανάμεσα σε εσάς και στον άνθρωπο που βάζει τα χέρια του μέσα στο όργανό σας.',
      'Από το 2011 κουρδίζει, επισκευάζει, ανακαινίζει και μεταφέρει πιάνα για καταστήματα μουσικής σε όλη την Κύπρο, για θέατρα, για σχολεία και ωδεία, για χώρους συναυλιών — ανάμεσά τους ένα Steinway Model D για τη Συμφωνική Ορχήστρα Κύπρου — και για αρκετές εκατοντάδες οικογένειες με ένα όρθιο πιάνο στο σαλόνι.',
      'Το ίδιο επίπεδο ισχύει για όλους. Ένα οικογενειακό πιάνο που δεν το άγγιξε κανείς δεκαπέντε χρόνια παίρνει την ίδια προσοχή με ένα όργανο συναυλίας το βράδυ της παράστασης.',
    ],
    bullets: [
      'Κούρδισμα στο σωστό τονικό ύψος',
      'Επισκευές, ρύθμιση και διαμόρφωση ήχου',
      'Πλήρεις ανακαινίσεις και αλλαγή χορδών',
      'Εξειδικευμένη μεταφορά, σε όλο το νησί',
    ],
  },
};

export const climateCards: L<{ icon: string; title: string; body: string }[]> = {
  en: [
    {
      icon: 'guardian',
      title: 'Humidity swings move the soundboard',
      body: 'Coastal summer humidity and dry winter heating make the soundboard swell and shrink. String tension follows it, and the tuning goes with it.',
    },
    {
      icon: 'tuning',
      title: 'Air conditioning is the usual culprit',
      body: 'A unit blowing straight onto a piano creates exactly the kind of sharp, repeated change that opens glue joints and cracks wood over time.',
    },
    {
      icon: 'repair',
      title: 'Twice a year keeps it stable',
      body: 'Two tunings a year is the manufacturer recommendation, and in this climate it is the difference between an instrument that holds and one that drifts.',
    },
  ],
  el: [
    {
      icon: 'guardian',
      title: 'Η υγρασία κινεί την αρμονική',
      body: 'Η καλοκαιρινή υγρασία στα παράλια και η ξηρή χειμερινή θέρμανση διαστέλλουν και συστέλλουν την αρμονική. Η τάση των χορδών την ακολουθεί, και μαζί της φεύγει το κούρδισμα.',
    },
    {
      icon: 'tuning',
      title: 'Ο κλιματισμός είναι ο συνήθης ένοχος',
      body: 'Μια μονάδα που φυσά κατευθείαν στο πιάνο δημιουργεί ακριβώς την απότομη, επαναλαμβανόμενη μεταβολή που με τον καιρό ανοίγει κολλήσεις και ραγίζει το ξύλο.',
    },
    {
      icon: 'repair',
      title: 'Δύο φορές τον χρόνο το κρατά σταθερό',
      body: 'Δύο κουρδίσματα τον χρόνο είναι η σύσταση του κατασκευαστή, και σε αυτό το κλίμα είναι η διαφορά ανάμεσα σε ένα όργανο που κρατά και σε ένα που ξεφεύγει.',
    },
  ],
};

export const aboutPage: L<{
  lead: string;
  sections: { heading: string; paras: string[] }[];
  credentials: { label: string; value: string }[];
}> = {
  en: {
    lead: 'Piano Tunings Cy has looked after pianos across Cyprus since 2011 — in living rooms, classrooms, theatres and concert halls.',
    sections: [
      {
        heading: 'The person who answers the phone is the person who does the work',
        paras: [
          'Piano Tunings Cy is Kleanthis Christoforou. There is no team of subcontractors and no dispatcher. You speak to the technician, he sees the instrument, and he is accountable for the result.',
          'For an instrument that costs as much as a piano and lasts as long, that continuity matters. A technician who has tuned the same piano for eight years knows how it behaves — which notes drift first, how it responds to the room, what it will need next year.',
        ],
      },
      {
        heading: 'From family uprights to concert grands',
        paras: [
          'The work spans the whole range. Most weeks include domestic uprights that have not been tuned in years, a school or conservatory contract, a repair or regulation job, and a move.',
          'It also includes concert work — preparing and tuning instruments where the piano has to be right at eight o\'clock and there is no second chance. Moving a Steinway Model D for the Cyprus Symphony Orchestra is the kind of job that sets the standard for everything else.',
        ],
      },
      {
        heading: 'Honest advice, including when the answer is no',
        paras: [
          'Not every piano is worth restoring and not every repair is worth doing. Saying so costs a job in the short term and earns the next ten in the long term.',
          'If your instrument needs a €400 repair to be worth €300, you will be told. If it is a good piano hiding under neglect — which is more often the case than people expect — you will be told that too, along with what it will take to bring it back.',
        ],
      },
      {
        heading: 'Working across the whole island',
        paras: [
          'Based in Limassol, working weekly in Nicosia, Larnaca, Paphos and the Famagusta district, and in the villages in between. Travel is normally folded into the price rather than added to it.',
          'Both Greek and English are spoken, and you will get the same clear explanation of what your piano needs in either one.',
        ],
      },
    ],
    credentials: [
      { label: 'Trading since', value: '2011' },
      { label: 'Based in', value: 'Limassol' },
      { label: 'Service area', value: 'All of Cyprus' },
      { label: 'Languages', value: 'Greek, English' },
    ],
  },
  el: {
    lead: 'Από το 2011, το Piano Tunings Cy φροντίζει πιάνα σε ολόκληρη την Κύπρο, σε σπίτια, ωδεία, σχολεία, θέατρα και επαγγελματικές αίθουσες συναυλιών.',
    sections: [
      {
        heading: 'Ο άνθρωπος που απαντά στο τηλέφωνο είναι ο ίδιος που φροντίζει το πιάνο σας',
        paras: [
          'Το Piano Tunings Cy είναι ο Κλεάνθης Χριστοφόρου. Δεν υπάρχουν υπεργολάβοι ή ενδιάμεσοι συντονιστές. Μιλάτε απευθείας με τον τεχνικό που θα ελέγξει το πιάνο σας, θα πραγματοποιήσει την εργασία και θα είναι προσωπικά υπεύθυνος για το αποτέλεσμα.',
          'Για ένα όργανο τόσο πολύτιμο και μακρόβιο, αυτή η σταθερή σχέση έχει πραγματική σημασία. Ένας τεχνικός που φροντίζει το ίδιο πιάνο για χρόνια γνωρίζει πώς συμπεριφέρεται, ποιες νότες αποσταθεροποιούνται πρώτες, πώς επηρεάζεται από τον χώρο και ποιες εργασίες ενδέχεται να χρειαστεί στο μέλλον.',
        ],
      },
      {
        heading: 'Από το οικογενειακό όρθιο πιάνο μέχρι το συναυλιακό πιάνο με ουρά',
        paras: [
          'Κάθε εβδομάδα περιλαμβάνει διαφορετικές ανάγκες. Οικιακά πιάνα που έχουν παραμείνει ακούρδιστα για χρόνια, συνεργασίες με σχολεία και ωδεία, επισκευές, ρυθμίσεις μηχανισμών και εξειδικευμένες μεταφορές.',
          'Η εμπειρία περιλαμβάνει επίσης την προετοιμασία και το κούρδισμα πιάνων για επαγγελματικές συναυλίες, όπου το όργανο πρέπει να είναι απόλυτα έτοιμο τη στιγμή που αρχίζει η παράσταση. Η μεταφορά ενός Steinway Model D για τη Συμφωνική Ορχήστρα Κύπρου αποτελεί χαρακτηριστικό παράδειγμα του επιπέδου προσοχής και υπευθυνότητας που εφαρμόζεται σε κάθε εργασία.',
        ],
      },
      {
        heading: 'Ειλικρινείς συμβουλές, ακόμη και όταν η απάντηση είναι όχι',
        paras: [
          'Δεν αξίζει κάθε πιάνο να ανακατασκευαστεί και δεν είναι κάθε επισκευή οικονομικά συμφέρουσα. Η ειλικρινής ενημέρωση μπορεί να σημαίνει ότι δεν θα προχωρήσει μια εργασία σήμερα, όμως δημιουργεί εμπιστοσύνη που διαρκεί για χρόνια.',
          'Εάν ένα πιάνο χρειάζεται επισκευή αξίας €400, αλλά η συνολική του αξία δεν ξεπερνά τα €300, θα σας το πω ξεκάθαρα. Εάν, αντίθετα, πρόκειται για ένα ποιοτικό πιάνο που έχει απλώς παραμεληθεί, θα σας εξηγήσω τι ακριβώς χρειάζεται και τι θα κοστίσει για να επανέλθει στην καλύτερη δυνατή κατάσταση.',
        ],
      },
      {
        heading: 'Εξυπηρέτηση σε ολόκληρη την Κύπρο',
        paras: [
          'Με έδρα τη Λεμεσό και τακτική παρουσία στη Λευκωσία, τη Λάρνακα, την Πάφο, την επαρχία Αμμοχώστου και τις γύρω κοινότητες, εξυπηρετώ πελάτες σε ολόκληρη την Κύπρο. Το κόστος μετακίνησης συνήθως περιλαμβάνεται στην τιμή της υπηρεσίας και δεν προστίθεται ως ξεχωριστή χρέωση.',
          'Η εξυπηρέτηση παρέχεται στα ελληνικά και στα αγγλικά. Σε κάθε περίπτωση, θα λάβετε μια ξεκάθαρη και κατανοητή εξήγηση για την κατάσταση του πιάνου σας και τις εργασίες που χρειάζεται.',
        ],
      },
    ],
    credentials: [
      { label: 'Έτος ίδρυσης', value: '2011' },
      { label: 'Έδρα', value: 'Λεμεσός' },
      { label: 'Περιοχή εξυπηρέτησης', value: 'Ολόκληρη η Κύπρος' },
      { label: 'Γλώσσες επικοινωνίας', value: 'Ελληνικά και Αγγλικά' },
    ],
  },
};
