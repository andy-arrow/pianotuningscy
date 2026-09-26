/**
 * Service catalogue. Prices and durations were taken from the legacy Wix booking system.
 * Services without a price are quoted per instrument — that is honest and expected in this trade.
 */

import { site } from '~/data/site';
import { cyprusYear } from '~/lib/cyprusTime';

/** Years in business, counted in Cyprus time at build — never hard-coded. */
const YEARS = cyprusYear() - site.foundingYear;

export interface Service {
  /** English slug — also the canonical id. */
  slug: string;
  /** Greek slug, transliterated/translated for /el/ routes. */
  elSlug: string;
  icon: string;
  /** Price in EUR. null = quoted on inspection. */
  price: number | null;
  priceFrom?: boolean;
  /** Minutes. null = varies. */
  duration: number | null;
  /** Show in the primary services grid on the homepage. */
  featured: boolean;
  image: string;
  en: ServiceCopy;
  el: ServiceCopy;
}

export interface ServiceCopy {
  name: string;
  tagline: string;
  /** 155–165 chars, used as the meta description. */
  metaDescription: string;
  /** Short card text. */
  summary: string;
  /** Long-form body paragraphs. */
  body: string[];
  /** "What's included" bullets. */
  includes: string[];
  priceNote: string;
  /** Heading of the service page's FAQ section, when it needs its own wording. */
  faqTitle?: string;
  /** Sentence shown in the service page's price box instead of the short card label. */
  priceText?: string;
  /** Sentence shown in the service page's duration box instead of the short label. */
  durationText?: string;
}

export const services: Service[] = [
  {
    slug: 'piano-tuning',
    elSlug: 'kourdisma-pianou',
    icon: 'tuning',
    price: 100,
    duration: 90,
    featured: true,
    image: 'kleanthis-tuning-concert-grand.jpg',
    en: {
      name: 'Piano Tuning',
      tagline: 'Concert-standard tuning, anywhere in Cyprus',
      metaDescription:
        'Professional piano tuning in Cyprus from €100. Concert-standard tuning for uprights and grands by Kleanthis Christoforou, technician since 2011.',
      summary:
        'A full tuning to concert pitch, with a fine regulation check of touch and tone while the instrument is open.',
      body: [
        'A piano holds roughly 220 strings under about 18 tonnes of combined tension. That tension never stops moving — every change in temperature and humidity pulls the soundboard and the strings with it. This is why a piano drifts out of tune even when nobody plays it.',
        'A tuning restores the instrument to concert pitch and, just as importantly, rebuilds the relationships between the notes so that chords sit cleanly against each other across the whole compass. Whether your piano was last tuned three months or twenty years ago, it can be brought back.',
        'Every tuning includes a check of the action and the tone while the instrument is open. If something needs attention — a sluggish key, a buzzing damper, a hammer that has gone hard and brittle — you will hear about it before it becomes expensive.',
      ],
      includes: [
        'Full tuning to concert pitch',
        'Unison and octave refinement across all 88 notes',
        'Touch and tone inspection while the piano is open',
        'Pedal and damper function check',
        'A plain-language report on the instrument’s condition',
        'Advice on where to place the piano in your room',
      ],
      priceNote:
        'Pianos left untuned for many years may need a pitch raise first — a rough tuning to bring the tension back up, followed by a fine tuning. This is quoted before any work begins.',
    },
    el: {
      name: 'Κούρδισμα Πιάνου',
      tagline: 'Κούρδισμα συναυλιακού επιπέδου σε ολόκληρη την Κύπρο',
      metaDescription:
        'Επαγγελματικό κούρδισμα πιάνου στην Κύπρο από €100. Κούρδισμα επιπέδου συναυλίας για όρθια πιάνα και πιάνα με ουρά από τον Κλεάνθη Χριστοφόρου.',
      summary:
        'Πλήρες κούρδισμα στο σωστό τονικό ύψος, με έλεγχο του μηχανισμού και του ήχου όσο το όργανο είναι ανοιχτό.',
      body: [
        'Ένα πιάνο διαθέτει περίπου 220 χορδές, οι οποίες ασκούν συνολική τάση που μπορεί να φτάσει τους 18 τόνους. Η τάση αυτή μεταβάλλεται συνεχώς, καθώς οι αλλαγές στη θερμοκρασία και την υγρασία επηρεάζουν το ξύλο, το ηχείο και τις χορδές. Γι’ αυτό ένα πιάνο μπορεί να ξεκουρδιστεί ακόμη και όταν δεν χρησιμοποιείται.',
        'Το σωστό κούρδισμα επαναφέρει το πιάνο στο κατάλληλο τονικό ύψος και αποκαθιστά με ακρίβεια τις σχέσεις μεταξύ των φθόγγων, ώστε κάθε νότα και συγχορδία να ακούγεται καθαρά και αρμονικά σε ολόκληρη την έκταση του οργάνου.',
        'Είτε το πιάνο σας κουρδίστηκε πριν από λίγους μήνες είτε έχει παραμείνει ακούρδιστο για πολλά χρόνια, θα αξιολογηθεί προσεκτικά και θα ακολουθηθεί η κατάλληλη διαδικασία για την καλύτερη δυνατή αποκατάστασή του.',
        'Κάθε κούρδισμα συνοδεύεται από βασικό έλεγχο του μηχανισμού και της ποιότητας του ήχου. Εάν εντοπιστεί κάποιο πρόβλημα, όπως ένα πλήκτρο που κολλάει, ένας πνιγέας που προκαλεί βόμβο ή ένα σφυράκι που έχει σκληρύνει, θα ενημερωθείτε έγκαιρα, προτού εξελιχθεί σε σοβαρότερη και πιο δαπανηρή βλάβη.',
      ],
      includes: [
        'Πλήρες κούρδισμα στο σωστό τονικό ύψος',
        'Ακριβής ρύθμιση ταυτοφωνιών και οκτάβων σε ολόκληρη την έκταση των 88 πλήκτρων',
        'Βασικός έλεγχος του μηχανισμού και της ποιότητας του ήχου',
        'Έλεγχος της σωστής λειτουργίας των πεταλιών και των πνιγέων',
        'Αναλυτική ενημέρωση για την κατάσταση του πιάνου, με απλά και κατανοητά λόγια',
        'Συμβουλές για τη σωστή τοποθέτηση και φροντίδα του πιάνου στον χώρο σας',
      ],
      priceNote:
        'Πιάνα που έχουν παραμείνει ακούρδιστα για πολλά χρόνια ενδέχεται να χρειαστούν αρχικά ανύψωση τονικού ύψους, ένα προκαταρκτικό κούρδισμα που επαναφέρει σταδιακά τη σωστή τάση των χορδών και στη συνέχεια ένα λεπτομερές, ακριβές κούρδισμα. Η ανάγκη για αυτή τη διαδικασία αξιολογείται κατά τον έλεγχο του πιάνου και το συνολικό κόστος συμφωνείται πριν από την έναρξη οποιασδήποτε εργασίας.',
      faqTitle: 'Συχνές ερωτήσεις για το κούρδισμα πιάνου',
    },
  },

  {
    slug: 'piano-repairs',
    elSlug: 'episkeves-pianou',
    icon: 'repair',
    price: null,
    duration: null,
    featured: true,
    image: 'piano-action-restoration.jpg',
    en: {
      name: 'Piano Repairs & Regulation',
      tagline: 'Making the action do what your fingers ask',
      metaDescription:
        `Piano repairs and action regulation across Cyprus. Sticking keys, broken hammers, worn dampers and uneven touch put right by a technician of ${YEARS} years.`,
      summary:
        'Sticking keys, broken hammers, worn dampers, uneven touch, buzzing notes — diagnosed and put right.',
      body: [
        'A grand piano action contains more than 8,000 moving parts, and an upright is not far behind. Felt compresses, cloth wears, glue joints dry out, and screws work loose. The result is a piano that fights the player: keys that stick, notes that will not repeat, a touch that is heavy in one octave and light in the next.',
        'Regulation is the process of bringing all of those parts back into their correct geometric relationships. It is unglamorous, patient work, and it transforms how an instrument feels far more than most owners expect. Many pianos written off as "tired" simply need regulating.',
        'Repairs are quoted after an inspection, because guessing at a price without opening the piano serves nobody. You will be told what is wrong, what it will cost, and — just as honestly — when a repair is not worth doing.',
      ],
      includes: [
        'Sticking, sluggish and non-repeating keys',
        'Hammer reshaping, refacing and replacement',
        'Damper regulation and buzz elimination',
        'Key levelling and dip regulation',
        'Pedal and trapwork repairs',
        'Broken string replacement and splicing',
        'Voicing to even out harsh or dull notes',
      ],
      priceNote: 'Quoted after inspection. Small repairs are often completed during a tuning visit at no extra call-out charge.',
    },
    el: {
      name: 'Επισκευές και Ρύθμιση Μηχανισμού',
      tagline: 'Για να ανταποκρίνεται το πιάνο με ακρίβεια στο άγγιγμά σας',
      metaDescription:
        'Επισκευές πιάνου και ρύθμιση μηχανισμού σε όλη την Κύπρο. Πλήκτρα που κολλούν, σπασμένα σφυράκια, φθαρμένοι πνιγείς και ανομοιόμορφο βάρος αφής.',
      summary:
        'Πλήκτρα που κολλούν, σπασμένα σφυράκια, φθαρμένοι πνιγείς, ανομοιόμορφη αφή, νότες που βουίζουν — διάγνωση και αποκατάσταση.',
      body: [
        'Με την πάροδο του χρόνου, ο μηχανισμός του πιάνου φθείρεται και χάνει τη σωστή του ρύθμιση. Πλήκτρα που κολλούν, νότες που δεν επαναλαμβάνονται σωστά και ανομοιόμορφη αίσθηση στο παίξιμο είναι μερικά από τα συνηθέστερα συμπτώματα.',
        'Με τον κατάλληλο έλεγχο, τη ρύθμιση και τις απαραίτητες επισκευές, το πιάνο μπορεί να αποκτήσει ξανά ομοιόμορφη και άμεση απόκριση. Πριν ξεκινήσει οποιαδήποτε εργασία, θα ενημερωθείτε ξεκάθαρα για την κατάσταση του οργάνου, τις διαθέσιμες επιλογές και το συνολικό κόστος.',
      ],
      includes: [
        'Επισκευή πλήκτρων που κολλούν ή δεν επαναλαμβάνονται σωστά',
        'Διαμόρφωση, ανακατασκευή και αντικατάσταση σφυριών',
        'Ρύθμιση πνιγέων και εξάλειψη ανεπιθύμητων βόμβων',
        'Ευθυγράμμιση πλήκτρων και ρύθμιση του βάθους τους',
        'Επισκευή πεταλιών και του μηχανισμού μετάδοσης',
        'Αντικατάσταση ή επισκευή σπασμένων χορδών',
        'Διαμόρφωση του ήχου για ομοιομορφία σε ολόκληρη την έκταση του πιάνου',
      ],
      priceNote: 'Μικρές επισκευές μπορούν συχνά να πραγματοποιηθούν κατά τη διάρκεια του ραντεβού για κούρδισμα, χωρίς επιπλέον χρέωση επίσκεψης. Για κάθε πιθανή επιπλέον εργασία και το κόστος της, θα ενημερωθείτε πριν προχωρήσουμε.',
      priceText: 'Η κοστολόγηση γίνεται ξεχωριστά για κάθε όργανο, μετά από τον απαραίτητο έλεγχο.',
      durationText: 'Η διάρκεια εξαρτάται από το είδος και την έκταση της εργασίας.',
    },
  },

  {
    slug: 'piano-restoration',
    elSlug: 'anakainisi-pianou',
    icon: 'restore',
    price: null,
    duration: null,
    featured: true,
    image: 'steinway-concert-stage.jpg',
    en: {
      name: 'Piano Restoration',
      tagline: 'Bringing an instrument all the way back',
      metaDescription:
        'Full piano restoration in Cyprus: restringing, action rebuilds, soundboard work, colour changes and cabinet refinishing on uprights and grands.',
      summary:
        'Full restorations — restringing, action rebuilds, soundboard work, colour changes and cabinet refinishing.',
      body: [
        'Some pianos are worth far more than their condition suggests. An instrument that has sat in a Cypriot house for fifty years may have a soundboard and a frame that are entirely sound, hidden under rusted strings, moth-eaten felt and a cracked finish.',
        'A full restoration strips the instrument back and rebuilds it: new strings and tuning pins, a rebuilt or replaced action, new hammers, reconditioned keys, soundboard and bridge repairs, and a refinished cabinet in the original colour or a new one.',
        'This is long work and it should never be started without a frank conversation about whether the piano justifies it. Sentimental value counts — a family instrument is often worth restoring when a comparable piano on the open market is not. That conversation comes first, before any quote.',
      ],
      includes: [
        'Complete restringing with new strings and tuning pins',
        'Action rebuild, new hammers, shanks and flanges',
        'Key recovering and rebushing',
        'Soundboard and bridge repair',
        'Cabinet refinishing and colour changes',
        'Full regulation, voicing and tuning on completion',
      ],
      priceNote: 'Every restoration is quoted individually after a full inspection, with the work broken down stage by stage.',
    },
    el: {
      name: 'Ανακαίνιση Πιάνου',
      tagline: 'Η πλήρης επαναφορά ενός οργάνου',
      metaDescription:
        'Πλήρης ανακαίνιση πιάνου στην Κύπρο: αλλαγή χορδών, ανακατασκευή μηχανισμού, εργασίες αρμονικής, αλλαγή χρώματος και βερνίκωμα επίπλου.',
      summary:
        'Πλήρεις ανακαινίσεις — νέες χορδές, ανακατασκευή μηχανισμού, εργασίες αρμονικής, αλλαγή χρώματος και βερνίκωμα.',
      body: [
        'Κάποια πιάνα αξίζουν πολύ περισσότερα απ’ όσα δείχνει η κατάστασή τους. Ένα όργανο που στέκεται σε ένα κυπριακό σπίτι πενήντα χρόνια μπορεί να έχει αρμονική και πλαίσιο σε άριστη κατάσταση, κρυμμένα κάτω από σκουριασμένες χορδές, φαγωμένες τσόχες και σπασμένο βερνίκι.',
        'Η πλήρης ανακαίνιση αποσυναρμολογεί το όργανο και το ξαναχτίζει: νέες χορδές και στριφτάρια, ανακατασκευασμένος ή νέος μηχανισμός, νέα σφυράκια, αποκατεστημένα πλήκτρα, επισκευές αρμονικής και καβαλάρη, και βερνίκωμα του επίπλου στο αρχικό ή σε νέο χρώμα.',
        'Είναι μακρά εργασία και δεν πρέπει ποτέ να ξεκινά χωρίς ειλικρινή συζήτηση για το αν το πιάνο τη δικαιολογεί. Η συναισθηματική αξία μετράει — ένα οικογενειακό όργανο συχνά αξίζει να ανακαινιστεί εκεί που ένα αντίστοιχο πιάνο της αγοράς δεν θα άξιζε. Αυτή η συζήτηση προηγείται κάθε προσφοράς.',
      ],
      includes: [
        'Πλήρης αλλαγή χορδών με νέες χορδές και στριφτάρια',
        'Ανακατασκευή μηχανισμού, νέα σφυράκια και στελέχη',
        'Επικάλυψη και επαναδιαμόρφωση πλήκτρων',
        'Επισκευή αρμονικής και καβαλάρη',
        'Βερνίκωμα επίπλου και αλλαγή χρώματος',
        'Πλήρης ρύθμιση, διαμόρφωση ήχου και κούρδισμα στο τέλος',
      ],
      priceNote: 'Κάθε ανακαίνιση κοστολογείται ξεχωριστά μετά από πλήρη έλεγχο, με ανάλυση της εργασίας ανά στάδιο.',
      faqTitle: 'Συχνές ερωτήσεις για την ανακαίνιση πιάνου',
    },
  },

  {
    slug: 'piano-moving',
    elSlug: 'metafora-pianou',
    icon: 'move',
    price: null,
    duration: null,
    featured: true,
    image: 'piano-removal-seaside.jpg',
    en: {
      name: 'Piano Moving & Removals',
      tagline: 'Specialist equipment, insured, anywhere on the island',
      metaDescription:
        'Specialist piano moving across Cyprus. Uprights, grands and concert instruments moved with proper equipment — stairs, balconies and tight access handled.',
      summary:
        'Uprights, grands and concert instruments moved with proper equipment — including stairs, balconies and impossible access.',
      body: [
        'A piano is not furniture. An upright weighs 200–350 kg and a concert grand can exceed 500 kg, with the mass concentrated in a cast-iron frame and the weight distributed in a way that punishes anyone who improvises. Pianos are damaged far more often in transit than in use.',
        'We move pianos with the equipment the job actually requires — piano skids and boards, stair-climbing gear, proper strapping, padded protection and, where the access demands it, a crane. Concert grands are stripped of legs and lyre, boarded and cased before they move.',
        'We have moved instruments up narrow Nicosia stairwells, onto rooftop terraces, across beaches for seaside weddings, and a Steinway Model D for the Cyprus Symphony Orchestra. If you think your access is impossible, describe it — it usually isn’t.',
      ],
      includes: [
        'Upright, baby grand and concert grand moving',
        'Stairs, lifts, balconies and crane access',
        'Full padding, strapping and protective casing',
        'Inter-city moves anywhere in Cyprus',
        'Repositioning within the same property',
        'Tuning after the move once the piano has settled',
      ],
      priceNote: 'Quoted on the specifics: instrument size, floor levels, access at both ends and distance. Send photos of the access and you will get a firm price.',
    },
    el: {
      name: 'Μεταφορά Πιάνου',
      tagline: 'Ειδικός εξοπλισμός, ασφαλισμένη μεταφορά, σε όλο το νησί',
      metaDescription:
        'Εξειδικευμένη μεταφορά πιάνου σε όλη την Κύπρο. Όρθια πιάνα, πιάνα με ουρά και όργανα συναυλιών με κατάλληλο εξοπλισμό — σκάλες, μπαλκόνια, δύσκολη πρόσβαση.',
      summary:
        'Όρθια πιάνα, πιάνα με ουρά και όργανα συναυλιών με κατάλληλο εξοπλισμό — σκάλες, μπαλκόνια και αδύνατες προσβάσεις.',
      body: [
        'Το πιάνο δεν είναι έπιπλο. Ένα όρθιο πιάνο ζυγίζει 200–350 κιλά και ένα πιάνο συναυλιών μπορεί να ξεπεράσει τα 500, με τη μάζα συγκεντρωμένη σε χυτοσίδηρο πλαίσιο και την κατανομή βάρους να τιμωρεί όποιον αυτοσχεδιάζει. Τα πιάνα παθαίνουν ζημιά πολύ συχνότερα στη μεταφορά παρά στη χρήση.',
        'Μεταφέρουμε πιάνα με τον εξοπλισμό που πραγματικά απαιτεί η δουλειά — ειδικά έλκηθρα και σανίδες, μηχανήματα για σκάλες, σωστούς ιμάντες, προστατευτικά καλύμματα και, όπου το επιβάλλει η πρόσβαση, γερανό. Τα πιάνα συναυλιών αφαιρούνται από πόδια και λύρα, τοποθετούνται σε σανίδα και συσκευάζονται πριν μετακινηθούν.',
        'Έχουμε μεταφέρει όργανα σε στενά κλιμακοστάσια της Λευκωσίας, σε ταράτσες, πάνω σε παραλίες για γάμους, και ένα Steinway Model D για τη Συμφωνική Ορχήστρα Κύπρου. Αν νομίζετε ότι η πρόσβασή σας είναι αδύνατη, περιγράψτε την — συνήθως δεν είναι.',
      ],
      includes: [
        'Μεταφορά όρθιων πιάνων και πιάνων με ουρά',
        'Σκάλες, ανελκυστήρες, μπαλκόνια και πρόσβαση με γερανό',
        'Πλήρης προστασία, ιμάντες και συσκευασία',
        'Μεταφορές μεταξύ πόλεων σε όλη την Κύπρο',
        'Μετακίνηση εντός του ίδιου χώρου',
        'Κούρδισμα μετά τη μεταφορά, αφού σταθεροποιηθεί το όργανο',
      ],
      priceNote: 'Κοστολόγηση βάσει των δεδομένων: μέγεθος οργάνου, όροφοι, πρόσβαση και στα δύο σημεία, απόσταση. Στείλτε φωτογραφίες της πρόσβασης για σταθερή τιμή.',
      faqTitle: 'Συχνές ερωτήσεις για τη μεταφορά πιάνου',
    },
  },

  {
    slug: 'grand-piano-rental',
    elSlug: 'enoikiasi-pianou-me-oura',
    icon: 'rental',
    price: 650,
    priceFrom: true,
    duration: 480,
    featured: true,
    image: 'grand-piano-seaside.jpg',
    en: {
      name: 'Grand Piano Rental',
      tagline: 'Concert instruments for weddings, concerts and events',
      metaDescription:
        'Grand piano rental in Cyprus from €650. Kawai, Ritmüller and Steinway & Sons instruments delivered, tuned and staged for weddings, concerts and events.',
      summary:
        'Kawai, Ritmüller and Steinway & Sons grands delivered, staged, tuned on site and collected — indoors or outdoors.',
      body: [
        'A hired grand is not just an instrument dropped at a venue. It has to arrive undamaged, be positioned where the sound works rather than where there happens to be space, and be tuned on site after it has settled — a piano moved in the morning and played in the evening will have moved in pitch.',
        'Our fleet includes K. Kawai, Ritmüller and Steinway & Sons instruments, for indoor and outdoor use. Outdoor events in the Cypriot summer need particular care: direct sun on a lid will put an instrument out of tune within the hour, so placement, shading and timing of the tuning are planned with you in advance.',
        'Delivery, staging, on-site tuning and collection are all included. We have supplied instruments for concerts, hotel events, corporate functions and seaside weddings across the island.',
      ],
      includes: [
        'Choice of K. Kawai, Ritmüller and Steinway & Sons grands',
        'Delivery, positioning and staging at your venue',
        'On-site tuning after the instrument has settled',
        'Matching bench and protective cover',
        'Indoor and outdoor events catered for',
        'Collection after the event',
      ],
      priceNote: 'From €650 depending on the instrument, the venue, access and how long you need it. Outdoor events are quoted individually.',
    },
    el: {
      name: 'Ενοικίαση Πιάνου με Ουρά',
      tagline: 'Όργανα συναυλίας για γάμους, συναυλίες και εκδηλώσεις',
      metaDescription:
        'Ενοικίαση πιάνου με ουρά στην Κύπρο από €650. Όργανα Kawai, Ritmüller και Steinway & Sons με παράδοση, κούρδισμα και τοποθέτηση για κάθε εκδήλωση.',
      summary:
        'Πιάνα Kawai, Ritmüller και Steinway & Sons με παράδοση, τοποθέτηση, επιτόπιο κούρδισμα και παραλαβή — σε εσωτερικό ή εξωτερικό χώρο.',
      body: [
        'Ένα ενοικιαζόμενο πιάνο με ουρά δεν είναι απλώς ένα όργανο που αφήνεται σε έναν χώρο. Πρέπει να φτάσει χωρίς ζημιά, να τοποθετηθεί εκεί που δουλεύει ο ήχος και όχι εκεί που τυχαίνει να υπάρχει χώρος, και να κουρδιστεί επιτόπου αφού σταθεροποιηθεί — ένα πιάνο που μεταφέρθηκε το πρωί και παίζεται το βράδυ θα έχει μετακινηθεί τονικά.',
        'Ο στόλος μας περιλαμβάνει όργανα K. Kawai, Ritmüller και Steinway & Sons, για εσωτερικούς και εξωτερικούς χώρους. Οι υπαίθριες εκδηλώσεις το κυπριακό καλοκαίρι απαιτούν ιδιαίτερη προσοχή: ο ήλιος πάνω στο καπάκι ξεκουρδίζει το όργανο μέσα σε μία ώρα, γι’ αυτό η τοποθέτηση, η σκίαση και η ώρα του κουρδίσματος σχεδιάζονται μαζί σας εκ των προτέρων.',
        'Η παράδοση, η τοποθέτηση, το επιτόπιο κούρδισμα και η παραλαβή περιλαμβάνονται. Έχουμε προμηθεύσει όργανα για συναυλίες, εκδηλώσεις ξενοδοχείων, εταιρικές εκδηλώσεις και γάμους δίπλα στη θάλασσα σε όλο το νησί.',
      ],
      includes: [
        'Επιλογή από όργανα K. Kawai, Ritmüller και Steinway & Sons',
        'Παράδοση, τοποθέτηση και στήσιμο στον χώρο σας',
        'Επιτόπιο κούρδισμα αφού σταθεροποιηθεί το όργανο',
        'Ταιριαστό σκαμπό και προστατευτικό κάλυμμα',
        'Εξυπηρέτηση εσωτερικών και εξωτερικών χώρων',
        'Παραλαβή μετά την εκδήλωση',
      ],
      priceNote: 'Από €650 ανάλογα με το όργανο, τον χώρο, την πρόσβαση και τη διάρκεια. Οι υπαίθριες εκδηλώσεις κοστολογούνται ξεχωριστά.',
      faqTitle: 'Συχνές ερωτήσεις για την ενοικίαση πιάνου με ουρά',
    },
  },

  {
    slug: 'piano-evaluation',
    elSlug: 'ektimisi-pianou',
    icon: 'evaluate',
    price: 30,
    duration: 30,
    featured: false,
    image: 'grand-piano-modern-home.jpg',
    en: {
      name: 'Piano Evaluation',
      tagline: 'An independent opinion before you buy, sell or insure',
      metaDescription:
        `Independent piano evaluation in Cyprus, €30. Written condition and value assessment for buying, selling, insurance or probate — from a technician of ${YEARS} years.`,
      summary:
        'An independent condition and value assessment for buying, selling, insurance or inheritance.',
      body: [
        'Buying a second-hand piano is one of the easiest ways to spend several thousand euro badly. Cosmetic condition tells you almost nothing: a beautiful cabinet can hide a cracked soundboard, loose tuning pins that will never hold a tuning, or an action that needs a rebuild costing more than the instrument is worth.',
        'An evaluation covers the frame, soundboard, bridges, pinblock, strings, action, keyboard, pedals and cabinet, and ends with a plain assessment of condition, what it would cost to put right, and what the instrument is realistically worth on the Cypriot market.',
        'The same report is used for insurance valuations, probate, and by sellers who want to price an instrument honestly rather than guess.',
      ],
      includes: [
        'Full structural and mechanical inspection',
        'Pinblock and tuning-stability assessment',
        'Soundboard and bridge condition report',
        'Realistic market valuation for Cyprus',
        'Estimated cost of any remedial work',
        'Written report you can show a buyer, seller or insurer',
      ],
      priceNote: '€30 for an evaluation within your city. Pre-purchase inspections elsewhere on the island are quoted with travel included.',
    },
    el: {
      name: 'Εκτίμηση Πιάνου',
      tagline: 'Ανεξάρτητη γνώμη πριν αγοράσετε, πουλήσετε ή ασφαλίσετε',
      metaDescription:
        'Ανεξάρτητη εκτίμηση πιάνου στην Κύπρο, €30. Γραπτή αξιολόγηση κατάστασης και αξίας για αγορά, πώληση, ασφάλιση ή κληρονομιά.',
      summary:
        'Ανεξάρτητη αξιολόγηση κατάστασης και αξίας για αγορά, πώληση, ασφάλιση ή κληρονομιά.',
      body: [
        'Η αγορά μεταχειρισμένου πιάνου είναι ένας από τους ευκολότερους τρόπους να ξοδέψει κανείς άσχημα αρκετές χιλιάδες ευρώ. Η εξωτερική εικόνα δεν λέει σχεδόν τίποτα: ένα όμορφο έπιπλο μπορεί να κρύβει ραγισμένη αρμονική, χαλαρά στριφτάρια που δεν θα κρατήσουν ποτέ κούρδισμα, ή μηχανισμό που χρειάζεται ανακατασκευή ακριβότερη από την αξία του οργάνου.',
        'Η εκτίμηση καλύπτει το πλαίσιο, την αρμονική, τους καβαλάρηδες, το καρφόξυλο, τις χορδές, τον μηχανισμό, το πληκτρολόγιο, τα πετάλια και το έπιπλο, και καταλήγει σε καθαρή αξιολόγηση της κατάστασης, του κόστους αποκατάστασης και της ρεαλιστικής αξίας του οργάνου στην κυπριακή αγορά.',
        'Η ίδια αναφορά χρησιμοποιείται για ασφαλιστικές εκτιμήσεις, κληρονομικά, και από πωλητές που θέλουν να τιμολογήσουν σωστά αντί να μαντέψουν.',
      ],
      includes: [
        'Πλήρης δομικός και μηχανικός έλεγχος',
        'Αξιολόγηση καρφόξυλου και σταθερότητας κουρδίσματος',
        'Αναφορά κατάστασης αρμονικής και καβαλάρη',
        'Ρεαλιστική εκτίμηση αξίας για την κυπριακή αγορά',
        'Εκτιμώμενο κόστος τυχόν εργασιών αποκατάστασης',
        'Γραπτή αναφορά για αγοραστή, πωλητή ή ασφαλιστή',
      ],
      priceNote: '€30 για εκτίμηση εντός της πόλης σας. Έλεγχοι πριν από αγορά σε άλλες περιοχές κοστολογούνται με τα έξοδα μετάβασης.',
      faqTitle: 'Συχνές ερωτήσεις για την εκτίμηση πιάνου',
    },
  },

  {
    slug: 'piano-guardian',
    elSlug: 'piano-guardian',
    icon: 'guardian',
    price: 230,
    duration: 60,
    featured: true,
    image: 'grand-piano-landscape.jpg',
    en: {
      name: 'The Piano Guardian',
      tagline: 'Year-round protection against the Cypriot climate',
      metaDescription:
        'The Piano Guardian: €230/year. Humidity and temperature monitoring for your piano in Cyprus, plus one full tuning included every year.',
      summary:
        'Humidity and temperature monitoring inside your piano, plus one full tuning a year — €230 annually.',
      body: [
        'Cyprus is hard on pianos. Summer humidity on the coast, dry winter heating inland, and air conditioning that swings a room by twenty degrees in an afternoon all act on the same thing: the wood. The soundboard swells and shrinks, tension changes, and the tuning goes with it. Over years, the same cycle opens glue joints and cracks soundboards.',
        'The Piano Guardian places monitoring equipment inside your instrument that tracks humidity and temperature continuously, so the conditions your piano actually lives in stop being a guess. When readings drift outside the safe range you are told, along with what to do about it — which is often as simple as moving the instrument away from a wall or changing where the air conditioning points.',
        'One full tuning per year is included in the plan. For an instrument you care about, this is the cheapest insurance there is.',
      ],
      includes: [
        'Continuous humidity and temperature monitoring',
        'Alerts when conditions move outside the safe range',
        'One full tuning included every year',
        'Annual condition check of action and soundboard',
        'Practical, specific advice for your room',
        'Priority booking for callouts',
      ],
      priceNote: '€230 per year, valid for 12 months, including one full tuning.',
    },
    el: {
      name: 'The Piano Guardian',
      tagline: 'Προστασία όλο τον χρόνο από το κυπριακό κλίμα',
      metaDescription:
        'The Piano Guardian: €230/έτος. Παρακολούθηση υγρασίας και θερμοκρασίας για το πιάνο σας στην Κύπρο, με ένα πλήρες κούρδισμα κάθε χρόνο.',
      summary:
        'Παρακολούθηση υγρασίας και θερμοκρασίας μέσα στο πιάνο σας, συν ένα πλήρες κούρδισμα τον χρόνο — €230 ετησίως.',
      body: [
        'Η Κύπρος είναι σκληρή με τα πιάνα. Η υγρασία του καλοκαιριού στα παράλια, η ξηρή θέρμανση του χειμώνα στο εσωτερικό, και ο κλιματισμός που μεταβάλλει έναν χώρο κατά είκοσι βαθμούς μέσα σε ένα απόγευμα δρουν όλα πάνω στο ίδιο πράγμα: το ξύλο. Η αρμονική διαστέλλεται και συστέλλεται, η τάση αλλάζει, και το κούρδισμα φεύγει μαζί της. Με τα χρόνια, ο ίδιος κύκλος ανοίγει κολλήσεις και ραγίζει αρμονικές.',
        'Το Piano Guardian τοποθετεί μέσα στο όργανό σας εξοπλισμό που καταγράφει συνεχώς υγρασία και θερμοκρασία, ώστε οι συνθήκες στις οποίες ζει πραγματικά το πιάνο σας να πάψουν να είναι εικασία. Όταν οι μετρήσεις βγουν εκτός ασφαλούς ορίου ενημερώνεστε, μαζί με το τι πρέπει να γίνει — που συχνά είναι τόσο απλό όσο να απομακρυνθεί το όργανο από έναν τοίχο ή να αλλάξει η κατεύθυνση του κλιματιστικού.',
        'Ένα πλήρες κούρδισμα τον χρόνο περιλαμβάνεται στο πρόγραμμα. Για ένα όργανο που αγαπάτε, είναι η φθηνότερη ασφάλεια που υπάρχει.',
      ],
      includes: [
        'Συνεχής παρακολούθηση υγρασίας και θερμοκρασίας',
        'Ειδοποιήσεις όταν οι συνθήκες βγουν εκτός ασφαλούς ορίου',
        'Ένα πλήρες κούρδισμα κάθε χρόνο',
        'Ετήσιος έλεγχος μηχανισμού και αρμονικής',
        'Πρακτικές, συγκεκριμένες συμβουλές για τον χώρο σας',
        'Προτεραιότητα στα ραντεβού',
      ],
      priceNote: '€230 τον χρόνο, με ισχύ 12 μηνών, περιλαμβανομένου ενός πλήρους κουρδίσματος.',
      faqTitle: 'Συχνές ερωτήσεις για το Piano Guardian',
    },
  },

  {
    slug: 'piano-covers',
    elSlug: 'kalymmata-pianou',
    icon: 'cover',
    price: 200,
    // The page's own copy says "from €200 depending on the size".
    priceFrom: true,
    duration: 15,
    featured: false,
    image: 'handmade-piano-cover.jpg',
    en: {
      name: 'Handmade Piano Covers',
      tagline: 'Made to your instrument’s exact measurements',
      metaDescription:
        'Handmade piano covers in Cyprus from €200. Quilted, padded covers made to the exact measurements of your upright or grand piano.',
      summary:
        'Quilted, padded covers cut and sewn to the exact measurements of your upright or grand.',
      body: [
        'A cover keeps dust, sunlight and the worst of the humidity swings off your instrument, and it protects a polished finish from the scratches that ordinary household life inflicts.',
        'Each cover is made to the measurements of your specific piano rather than bought off a shelf, in quilted padded fabric, with a choice of colours. Measurements are taken on site.',
      ],
      includes: [
        'Measured on site to your instrument',
        'Quilted, padded protective fabric',
        'Choice of colours',
        'Upright and grand piano covers',
        'Protection from dust, sun and scratches',
      ],
      priceNote: 'From €200 depending on the size of the instrument.',
    },
    el: {
      name: 'Χειροποίητα Καλύμματα Πιάνου',
      tagline: 'Ραμμένα στις ακριβείς διαστάσεις του οργάνου σας',
      metaDescription:
        'Χειροποίητα καλύμματα πιάνου στην Κύπρο από €200. Καπιτονέ, επενδυμένα καλύμματα στις ακριβείς διαστάσεις του δικού σας πιάνου.',
      summary:
        'Καπιτονέ, επενδυμένα καλύμματα, κομμένα και ραμμένα στις ακριβείς διαστάσεις του πιάνου σας.',
      body: [
        'Το κάλυμμα κρατά τη σκόνη, τον ήλιο και τις χειρότερες μεταβολές υγρασίας μακριά από το όργανό σας, και προστατεύει το γυαλισμένο φινίρισμα από τις γρατσουνιές της καθημερινής ζωής.',
        'Κάθε κάλυμμα κατασκευάζεται στις διαστάσεις του δικού σας πιάνου και όχι έτοιμο από ράφι, σε καπιτονέ επενδυμένο ύφασμα, με επιλογή χρωμάτων. Οι μετρήσεις λαμβάνονται επιτόπου.',
      ],
      includes: [
        'Μέτρηση επιτόπου στο όργανό σας',
        'Καπιτονέ, επενδυμένο προστατευτικό ύφασμα',
        'Επιλογή χρωμάτων',
        'Καλύμματα για όρθια πιάνα και πιάνα με ουρά',
        'Προστασία από σκόνη, ήλιο και γρατσουνιές',
      ],
      priceNote: 'Από €200 ανάλογα με το μέγεθος του οργάνου.',
    },
  },
];

export const getService = (slug: string) => services.find((s) => s.slug === slug);
export const featuredServices = services.filter((s) => s.featured);
