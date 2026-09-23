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
      'Κούρδισμα στο σωστό διαπασών',
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
    lead: 'Το Piano Tunings Cy φροντίζει πιάνα σε όλη την Κύπρο από το 2011 — σε σαλόνια, αίθουσες διδασκαλίας, θέατρα και αίθουσες συναυλιών.',
    sections: [
      {
        heading: 'Αυτός που απαντά στο τηλέφωνο είναι αυτός που κάνει τη δουλειά',
        paras: [
          'Το Piano Tunings Cy είναι ο Κλεάνθης Χριστοφόρου. Δεν υπάρχει συνεργείο υπεργολάβων ούτε συντονιστής. Μιλάτε με τον τεχνικό, εκείνος βλέπει το όργανο, και εκείνος είναι υπεύθυνος για το αποτέλεσμα.',
          'Για ένα όργανο που κοστίζει όσο ένα πιάνο και διαρκεί τόσο, αυτή η συνέχεια μετράει. Ένας τεχνικός που κουρδίζει το ίδιο πιάνο οκτώ χρόνια ξέρει πώς συμπεριφέρεται — ποιες νότες φεύγουν πρώτες, πώς αντιδρά στον χώρο, τι θα χρειαστεί του χρόνου.',
        ],
      },
      {
        heading: 'Από οικογενειακά όρθια πιάνα μέχρι πιάνα συναυλιών',
        paras: [
          'Η δουλειά καλύπτει όλο το φάσμα. Οι περισσότερες εβδομάδες περιλαμβάνουν οικιακά όρθια πιάνα που έχουν χρόνια να κουρδιστούν, μια συνεργασία με σχολείο ή ωδείο, μια επισκευή ή ρύθμιση, και μια μεταφορά.',
          'Περιλαμβάνει επίσης δουλειά συναυλιών — προετοιμασία και κούρδισμα οργάνων όπου το πιάνο πρέπει να είναι σωστό στις οκτώ και δεν υπάρχει δεύτερη ευκαιρία. Η μεταφορά ενός Steinway Model D για τη Συμφωνική Ορχήστρα Κύπρου είναι η δουλειά που θέτει τον πήχη για όλα τα υπόλοιπα.',
        ],
      },
      {
        heading: 'Ειλικρινείς συμβουλές, ακόμη κι όταν η απάντηση είναι όχι',
        paras: [
          'Δεν αξίζει κάθε πιάνο ανακαίνιση και δεν αξίζει κάθε επισκευή να γίνει. Το να το λες χάνει μια δουλειά βραχυπρόθεσμα και κερδίζει τις επόμενες δέκα μακροπρόθεσμα.',
          'Αν το όργανό σας χρειάζεται επισκευή €400 για να αξίζει €300, θα σας το πούμε. Αν είναι καλό πιάνο κρυμμένο κάτω από την παραμέληση — που συμβαίνει πιο συχνά απ’ όσο περιμένει ο κόσμος — θα σας το πούμε κι αυτό, μαζί με το τι χρειάζεται για να επανέλθει.',
        ],
      },
      {
        heading: 'Σε ολόκληρο το νησί',
        paras: [
          'Με έδρα τη Λεμεσό, με εβδομαδιαία παρουσία σε Λευκωσία, Λάρνακα, Πάφο και στην επαρχία Αμμοχώστου, και στα χωριά ενδιάμεσα. Η μετάβαση κανονικά ενσωματώνεται στην τιμή αντί να προστίθεται.',
          'Μιλάμε ελληνικά και αγγλικά, και θα λάβετε την ίδια καθαρή εξήγηση για το τι χρειάζεται το πιάνο σας και στις δύο γλώσσες.',
        ],
      },
    ],
    credentials: [
      { label: 'Σε λειτουργία από', value: '2011' },
      { label: 'Έδρα', value: 'Λεμεσός' },
      { label: 'Περιοχή εξυπηρέτησης', value: 'Όλη η Κύπρος' },
      { label: 'Γλώσσες', value: 'Ελληνικά, Αγγλικά' },
    ],
  },
};
