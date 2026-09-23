/**
 * Service-area copy. The legacy site never named a single Cypriot city in
 * indexable text, which foreclosed every "piano tuner <city>" search on the island.
 *
 * Each city gets genuinely distinct copy — a page that just swaps a place-name
 * into a template is thin content and Google treats it as such.
 */
import type { Locale } from '~/i18n/ui';

export interface AreaCopy {
  intro: string;
  /** Two or three paragraphs specific to this city. */
  body: string[];
  /** Neighbourhoods / nearby towns, for long-tail local search. */
  nearby: string[];
}

export const areaContent: Record<string, Record<Locale, AreaCopy>> = {
  nicosia: {
    en: {
      intro:
        'Weekly visits to Nicosia for tuning, repairs, restorations and moving — across the capital, its suburbs and the surrounding villages.',
      body: [
        'Nicosia is about an hour from base and is on the schedule every week, so appointments there are booked as easily as on the coast and travel is normally folded into the price rather than added to it.',
        'The capital is also the hardest environment on the island for a piano. Inland Nicosia swings from dry summer heat to heated winter interiors, and that annual cycle is what pulls a piano out of tune and, over years, opens glue joints. Pianos here benefit more than most from two tunings a year.',
        'Work in the city ranges from family uprights in Strovolos and Lakatamia to conservatory instruments, school pianos and theatre work in the centre.',
      ],
      nearby: ['Strovolos', 'Lakatamia', 'Engomi', 'Aglandjia', 'Latsia', 'Dali', 'Kokkinotrimithia'],
    },
    el: {
      intro:
        'Εβδομαδιαίες επισκέψεις στη Λευκωσία για κούρδισμα, επισκευές, ανακαινίσεις και μεταφορές — σε όλη την πρωτεύουσα, τα προάστια και τα γύρω χωριά.',
      body: [
        'Η Λευκωσία απέχει περίπου μία ώρα από την έδρα μας και βρίσκεται στο πρόγραμμα κάθε εβδομάδα, οπότε τα ραντεβού κλείνονται εξίσου εύκολα με την ακτή και η μετάβαση κανονικά ενσωματώνεται στην τιμή αντί να προστίθεται.',
        'Η πρωτεύουσα είναι επίσης το σκληρότερο περιβάλλον του νησιού για ένα πιάνο. Η ηπειρωτική Λευκωσία περνά από την ξηρή καλοκαιρινή ζέστη στους θερμαινόμενους χειμερινούς χώρους, και αυτός ο ετήσιος κύκλος είναι που ξεκουρδίζει το πιάνο και, με τα χρόνια, ανοίγει τις κολλήσεις. Τα πιάνα εδώ ωφελούνται περισσότερο από δύο κουρδίσματα τον χρόνο.',
        'Η δουλειά στην πόλη εκτείνεται από οικογενειακά όρθια πιάνα στον Στρόβολο και τη Λακατάμια μέχρι όργανα ωδείων, σχολικά πιάνα και εργασίες σε θέατρα του κέντρου.',
      ],
      nearby: ['Στρόβολος', 'Λακατάμια', 'Έγκωμη', 'Αγλαντζιά', 'Λατσιά', 'Δάλι', 'Κοκκινοτριμιθιά'],
    },
  },

  limassol: {
    en: {
      intro:
        'Limassol is home. Tunings, repairs, restorations, moving and event instruments across the city and its suburbs — usually within a few days of calling.',
      body: [
        'Limassol is home base, which means the shortest lead times on the island and no travel surcharge. Most appointments in the city can be offered within a few days, and urgent work — a stuck key before a lesson, a piano that has to be right for a recital — can often be fitted in sooner.',
        'The coast brings its own problem: humidity. A piano two streets from the sea lives in air that is consistently more humid than the same instrument inland, and that shows up as sluggish action, rusting strings and tuning that drifts flat. It is also the part of the island where the Piano Guardian monitoring plan earns its keep most obviously.',
        'Limassol also generates the most event work — hotel functions, corporate events and weddings needing a grand delivered, staged and tuned on site.',
      ],
      nearby: ['Germasogeia', 'Agios Athanasios', 'Mesa Geitonia', 'Ypsonas', 'Parekklisia', 'Pissouri'],
    },
    el: {
      intro:
        'Η Λεμεσός είναι η έδρα μας. Κουρδίσματα, επισκευές, ανακαινίσεις, μεταφορές και όργανα εκδηλώσεων σε όλη την πόλη και τα προάστιά της — συνήθως μέσα σε λίγες μέρες.',
      body: [
        'Η Λεμεσός είναι η έδρα μας, που σημαίνει τους συντομότερους χρόνους αναμονής στο νησί και καμία επιβάρυνση μετάβασης. Τα περισσότερα ραντεβού στην πόλη προσφέρονται μέσα σε λίγες μέρες, και οι επείγουσες εργασίες — ένα πλήκτρο που κόλλησε πριν το μάθημα, ένα πιάνο που πρέπει να είναι έτοιμο για ρεσιτάλ — συχνά εξυπηρετούνται νωρίτερα.',
        'Η ακτή φέρνει το δικό της πρόβλημα: την υγρασία. Ένα πιάνο δύο δρόμους από τη θάλασσα ζει σε αέρα σταθερά πιο υγρό από το ίδιο όργανο στην ενδοχώρα, και αυτό φαίνεται ως βαρύς μηχανισμός, χορδές που σκουριάζουν και κούρδισμα που πέφτει. Είναι επίσης το κομμάτι του νησιού όπου το πρόγραμμα παρακολούθησης Piano Guardian αποδεικνύει πιο καθαρά την αξία του.',
        'Η Λεμεσός δίνει επίσης τις περισσότερες εκδηλώσεις — δεξιώσεις ξενοδοχείων, εταιρικές εκδηλώσεις και γάμους που χρειάζονται πιάνο με ουρά με παράδοση, στήσιμο και επιτόπιο κούρδισμα.',
      ],
      nearby: ['Γερμασόγεια', 'Άγιος Αθανάσιος', 'Μέσα Γειτονιά', 'Ύψωνας', 'Παρεκκλησιά', 'Πισσούρι'],
    },
  },

  larnaca: {
    en: {
      intro:
        'Tuning, repairs and piano moving throughout Larnaca and the surrounding villages, including instruments arriving through the port and airport.',
      body: [
        'Larnaca is a short run east along the motorway from Limassol and is covered weekly. Tunings, repairs and evaluations are booked as normal appointments with no separate call-out charge.',
        'The city sees a steady stream of pianos arriving from abroad — people relocating to Cyprus, instruments shipped in through the port. A piano that has spent weeks in a container needs unpacking carefully, a settling period in its new room, and then tuning; done in the wrong order it is money wasted.',
        'Coastal humidity applies here as it does in Limassol, particularly for instruments kept near the seafront or in properties left closed for parts of the year.',
      ],
      nearby: ['Oroklini', 'Livadia', 'Aradippou', 'Pyla', 'Kiti', 'Dromolaxia'],
    },
    el: {
      intro:
        'Κούρδισμα, επισκευές και μεταφορά πιάνου σε όλη τη Λάρνακα και τα γύρω χωριά, συμπεριλαμβανομένων οργάνων που φτάνουν μέσω λιμανιού και αεροδρομίου.',
      body: [
        'Η Λάρνακα είναι σύντομη διαδρομή ανατολικά από τη Λεμεσό και καλύπτεται εβδομαδιαία. Κουρδίσματα, επισκευές και εκτιμήσεις κλείνονται ως κανονικά ραντεβού χωρίς ξεχωριστή χρέωση μετάβασης.',
        'Η πόλη βλέπει σταθερή ροή πιάνων που έρχονται από το εξωτερικό — ανθρώπους που μετακομίζουν στην Κύπρο, όργανα που φτάνουν μέσω λιμανιού. Ένα πιάνο που πέρασε εβδομάδες σε κοντέινερ χρειάζεται προσεκτική αποσυσκευασία, περίοδο προσαρμογής στον νέο του χώρο, και μετά κούρδισμα· με λάθος σειρά, είναι χαμένα χρήματα.',
        'Η παραθαλάσσια υγρασία ισχύει εδώ όπως και στη Λεμεσό, ιδιαίτερα για όργανα κοντά στην παραλία ή σε κατοικίες που μένουν κλειστές μέρος του χρόνου.',
      ],
      nearby: ['Ορόκλινη', 'Λιβάδια', 'Αραδίππου', 'Πύλα', 'Κίτι', 'Δρομολαξιά'],
    },
  },

  paphos: {
    en: {
      intro:
        'Piano tuning, repairs and moving across Paphos and the surrounding villages, including holiday properties and instruments shipped from abroad.',
      body: [
        'Paphos is a straightforward run west along the coast from Limassol and is covered on regular scheduled visits, so a routine tuning rarely means a long wait and travel is normally included in the price.',
        'Paphos has a high concentration of instruments belonging to people who moved to Cyprus and brought a piano with them, often a good English or German upright that has crossed Europe in a container. These need careful reassessment after the move: shipping and a new climate together will have moved the tuning a long way, and a pitch raise is often required before a fine tuning will hold.',
        'Properties that stand empty for months present the opposite problem — a piano in a closed, unconditioned house through a Cypriot summer takes real punishment.',
      ],
      nearby: ['Kato Paphos', 'Peyia', 'Chloraka', 'Tala', 'Polis Chrysochous', 'Tsada'],
    },
    el: {
      intro:
        'Κούρδισμα, επισκευές και μεταφορά πιάνου σε όλη την Πάφο και τα γύρω χωριά, συμπεριλαμβανομένων εξοχικών κατοικιών και οργάνων από το εξωτερικό.',
      body: [
        'Η Πάφος είναι εύκολη διαδρομή δυτικά κατά μήκος της ακτής από τη Λεμεσό και καλύπτεται με τακτικές προγραμματισμένες επισκέψεις, οπότε ένα τακτικό κούρδισμα σπάνια σημαίνει μεγάλη αναμονή και η μετάβαση κανονικά περιλαμβάνεται στην τιμή.',
        'Η Πάφος έχει μεγάλη συγκέντρωση οργάνων που ανήκουν σε ανθρώπους οι οποίοι μετακόμισαν στην Κύπρο φέρνοντας μαζί το πιάνο τους, συχνά ένα καλό αγγλικό ή γερμανικό όρθιο πιάνο που διέσχισε την Ευρώπη σε κοντέινερ. Αυτά χρειάζονται προσεκτική επανεκτίμηση μετά τη μεταφορά: η αποστολή και το νέο κλίμα μαζί έχουν μετακινήσει πολύ το κούρδισμα, και συχνά απαιτείται ανύψωση τόνου πριν κρατήσει ένα λεπτό κούρδισμα.',
        'Οι κατοικίες που μένουν άδειες για μήνες παρουσιάζουν το αντίθετο πρόβλημα — ένα πιάνο σε κλειστό σπίτι χωρίς κλιματισμό μέσα στο κυπριακό καλοκαίρι υποφέρει πραγματικά.',
      ],
      nearby: ['Κάτω Πάφος', 'Πέγεια', 'Χλώρακα', 'Τάλα', 'Πόλις Χρυσοχούς', 'Τσάδα'],
    },
  },

  famagusta: {
    en: {
      intro:
        'Tuning, repairs and event instruments across the Famagusta district — Paralimni, Protaras and Ayia Napa, including hotel and wedding work.',
      body: [
        'The Famagusta district is the longest run from base, so visits there are scheduled and appointments grouped — which keeps the travel off any one customer’s bill and usually means booking a little further ahead.',
        'This is the district where seasonal work dominates. Hotels and venues around Protaras and Ayia Napa need instruments delivered, staged and tuned for the season, and outdoor wedding ceremonies need a grand placed where the sound works and tuned as late as the schedule allows — direct sun on a lid will undo a tuning within the hour.',
        'For resident instruments, the same coastal humidity that affects Limassol and Larnaca applies, with the added factor of properties that are closed and unconditioned out of season.',
      ],
      nearby: ['Paralimni', 'Protaras', 'Ayia Napa', 'Deryneia', 'Sotira', 'Liopetri'],
    },
    el: {
      intro:
        'Κούρδισμα, επισκευές και όργανα εκδηλώσεων σε όλη την επαρχία Αμμοχώστου — Παραλίμνι, Πρωταράς και Αγία Νάπα, με εργασίες ξενοδοχείων και γάμων.',
      body: [
        'Η επαρχία Αμμοχώστου είναι η πιο απομακρυσμένη από την έδρα μας, γι’ αυτό οι επισκέψεις προγραμματίζονται και τα ραντεβού ομαδοποιούνται — που κρατά το κόστος μετάβασης εκτός του λογαριασμού και συνήθως σημαίνει κράτηση λίγο νωρίτερα.',
        'Είναι η επαρχία όπου κυριαρχεί η εποχική δουλειά. Ξενοδοχεία και χώροι γύρω από τον Πρωταρά και την Αγία Νάπα χρειάζονται όργανα με παράδοση, στήσιμο και κούρδισμα για τη σεζόν, και οι υπαίθριες τελετές γάμου χρειάζονται πιάνο με ουρά τοποθετημένο εκεί που δουλεύει ο ήχος και κουρδισμένο όσο πιο αργά επιτρέπει το πρόγραμμα — ο ήλιος στο καπάκι χαλά το κούρδισμα μέσα σε μία ώρα.',
        'Για τα μόνιμα όργανα ισχύει η ίδια παραθαλάσσια υγρασία με Λεμεσό και Λάρνακα, με επιπλέον παράγοντα τις κατοικίες που μένουν κλειστές και χωρίς κλιματισμό εκτός σεζόν.',
      ],
      nearby: ['Παραλίμνι', 'Πρωταράς', 'Αγία Νάπα', 'Δερύνεια', 'Σωτήρα', 'Λιοπέτρι'],
    },
  },
};
