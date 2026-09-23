/**
 * Legal pages. The legacy site had none — privacy, cookies and terms all 404'd —
 * while running member accounts, a recurring €230/year subscription and forms
 * collecting personal data. That is a GDPR exposure, not a nicety.
 *
 * NOTE FOR THE OWNER: this is a solid, honest baseline written to match how the
 * site actually behaves. Have it reviewed by a Cypriot lawyer before launch if
 * you want certainty, and fill in the NEEDS-CONFIRMATION items in site.ts.
 */
import type { Locale } from '~/i18n/ui';

export interface LegalDoc {
  title: Record<Locale, string>;
  description: Record<Locale, string>;
  sections: Record<Locale, { heading: string; paras: string[] }[]>;
}

export const legalDocs: Record<'privacy' | 'cookies' | 'terms', LegalDoc> = {
  privacy: {
    title: { en: 'Privacy policy', el: 'Πολιτική απορρήτου' },
    description: {
      en: 'How Piano Tunings Cy collects, uses, stores and protects your personal data under the GDPR — what we hold, why, for how long, and your rights.',
      el: 'Πώς το Piano Tunings Cy συλλέγει, χρησιμοποιεί, αποθηκεύει και προστατεύει τα προσωπικά σας δεδομένα βάσει του GDPR — τι τηρούμε, γιατί, για πόσο, και τα δικαιώματά σας.',
    },
    sections: {
      en: [
        {
          heading: 'Who we are',
          paras: [
            'Piano Tunings Cy is a piano tuning, repair, restoration and transport business operated by Kleanthis Christoforou, based in Limassol, Cyprus. For the purposes of the General Data Protection Regulation (EU) 2016/679, Piano Tunings Cy is the data controller for the personal data described here.',
            'If you have any question about this policy or about the data we hold, contact us at info@pianotuningscy.com or on +357 99 405612.',
          ],
        },
        {
          heading: 'What we collect, and why',
          paras: [
            'When you submit an enquiry or booking form we collect your name, phone number, city or area, the service you are interested in, and optionally your email address and any message you write. If you are booking we may also ask what type of piano you own and when it was last tuned.',
            'We collect this for one reason: to respond to your enquiry, give you an accurate price, and carry out the work. The lawful basis is your consent when you submit the form, and thereafter the performance of a contract if you go ahead with the work.',
            'We do not buy personal data, we do not sell it, and we do not share it with anyone for marketing.',
          ],
        },
        {
          heading: 'Analytics',
          paras: [
            'We use Plausible Analytics to understand how many people visit the site and which pages they read. Plausible does not use cookies, does not collect or store any personal data, and does not track people across websites or over time. All data is aggregated and cannot be used to identify you.',
            'Because no personal data is processed and no cookies are set, this requires no consent banner. Full details are published at plausible.io/data-policy.',
          ],
        },
        {
          heading: 'How long we keep it',
          paras: [
            'Enquiries that do not lead to work are deleted within 12 months. Records relating to completed work — what was done to which instrument and when — are kept for as long as we service that piano, because a technician needs the instrument\'s history to look after it properly. Invoicing records are kept for the period required by Cypriot tax law.',
          ],
        },
        {
          heading: 'Who else sees your data',
          paras: [
            'Your enquiry is received through our website host\'s form handling and our email provider, and is read only by Kleanthis Christoforou. These providers act as data processors on our behalf and are bound to process the data only on our instructions.',
            'We do not transfer your personal data outside the European Economic Area, except where a provider listed above does so under an adequacy decision or standard contractual clauses.',
          ],
        },
        {
          heading: 'Your rights',
          paras: [
            'Under the GDPR you have the right to ask what personal data we hold about you, to have it corrected, to have it deleted, to restrict or object to how we use it, and to receive it in a portable format. Where we rely on consent, you may withdraw it at any time.',
            'To exercise any of these rights, email info@pianotuningscy.com. We will respond within one month.',
            'If you believe we have handled your data improperly, you may complain to the Office of the Commissioner for Personal Data Protection of the Republic of Cyprus (dataprotection.gov.cy).',
          ],
        },
        {
          heading: 'Changes to this policy',
          paras: [
            'If this policy changes materially, the updated version will be published on this page with a new revision date.',
          ],
        },
      ],
      el: [
        {
          heading: 'Ποιοι είμαστε',
          paras: [
            'Το Piano Tunings Cy είναι επιχείρηση κουρδίσματος, επισκευής, ανακαίνισης και μεταφοράς πιάνου, την οποία λειτουργεί ο Κλεάνθης Χριστοφόρου, με έδρα τη Λεμεσό. Για τους σκοπούς του Γενικού Κανονισμού Προστασίας Δεδομένων (ΕΕ) 2016/679, το Piano Tunings Cy είναι ο υπεύθυνος επεξεργασίας των προσωπικών δεδομένων που περιγράφονται εδώ.',
            'Για οποιαδήποτε ερώτηση σχετικά με την πολιτική αυτή ή με τα δεδομένα που τηρούμε, επικοινωνήστε στο info@pianotuningscy.com ή στο +357 99 405612.',
          ],
        },
        {
          heading: 'Τι συλλέγουμε και γιατί',
          paras: [
            'Όταν υποβάλλετε φόρμα επικοινωνίας ή κράτησης συλλέγουμε το όνομά σας, το τηλέφωνο, την πόλη ή περιοχή σας, την υπηρεσία που σας ενδιαφέρει και, προαιρετικά, το email σας και όποιο μήνυμα γράψετε. Για κρατήσεις ενδέχεται να ζητήσουμε επίσης τον τύπο του πιάνου σας και πότε κουρδίστηκε τελευταία φορά.',
            'Τα συλλέγουμε για έναν λόγο: για να απαντήσουμε στο αίτημά σας, να σας δώσουμε ακριβή τιμή και να εκτελέσουμε την εργασία. Η νομική βάση είναι η συγκατάθεσή σας κατά την υποβολή της φόρμας και, στη συνέχεια, η εκτέλεση σύμβασης εφόσον προχωρήσετε στην εργασία.',
            'Δεν αγοράζουμε προσωπικά δεδομένα, δεν τα πουλάμε, και δεν τα μοιραζόμαστε με κανέναν για σκοπούς προώθησης.',
          ],
        },
        {
          heading: 'Στατιστικά επισκεψιμότητας',
          paras: [
            'Χρησιμοποιούμε το Plausible Analytics για να γνωρίζουμε πόσοι επισκέπτονται την ιστοσελίδα και ποιες σελίδες διαβάζουν. Το Plausible δεν χρησιμοποιεί cookies, δεν συλλέγει ούτε αποθηκεύει προσωπικά δεδομένα, και δεν παρακολουθεί χρήστες σε άλλες ιστοσελίδες ή στον χρόνο. Όλα τα δεδομένα είναι συγκεντρωτικά και δεν μπορούν να σας ταυτοποιήσουν.',
            'Επειδή δεν γίνεται επεξεργασία προσωπικών δεδομένων και δεν τοποθετούνται cookies, δεν απαιτείται banner συγκατάθεσης. Πλήρεις λεπτομέρειες στο plausible.io/data-policy.',
          ],
        },
        {
          heading: 'Πόσο καιρό τα κρατάμε',
          paras: [
            'Αιτήματα που δεν οδηγούν σε εργασία διαγράφονται εντός 12 μηνών. Αρχεία σχετικά με ολοκληρωμένες εργασίες — τι έγινε σε ποιο όργανο και πότε — τηρούνται όσο συντηρούμε το συγκεκριμένο πιάνο, γιατί ο τεχνικός χρειάζεται το ιστορικό του οργάνου για να το φροντίζει σωστά. Τα φορολογικά παραστατικά τηρούνται για το διάστημα που ορίζει η κυπριακή νομοθεσία.',
          ],
        },
        {
          heading: 'Ποιος άλλος βλέπει τα δεδομένα σας',
          paras: [
            'Το αίτημά σας λαμβάνεται μέσω της υπηρεσίας φορμών του παρόχου φιλοξενίας και του παρόχου email μας, και το διαβάζει μόνο ο Κλεάνθης Χριστοφόρου. Οι πάροχοι αυτοί ενεργούν ως εκτελούντες την επεξεργασία για λογαριασμό μας και δεσμεύονται να επεξεργάζονται τα δεδομένα μόνο κατόπιν εντολής μας.',
            'Δεν διαβιβάζουμε τα προσωπικά σας δεδομένα εκτός του Ευρωπαϊκού Οικονομικού Χώρου, εκτός εάν κάποιος από τους παραπάνω παρόχους το πράττει βάσει απόφασης επάρκειας ή τυποποιημένων συμβατικών ρητρών.',
          ],
        },
        {
          heading: 'Τα δικαιώματά σας',
          paras: [
            'Βάσει του GDPR έχετε δικαίωμα να ζητήσετε ποια προσωπικά δεδομένα τηρούμε για εσάς, να τα διορθώσετε, να τα διαγράψετε, να περιορίσετε ή να αντιταχθείτε στη χρήση τους, και να τα λάβετε σε φορητή μορφή. Όπου βασιζόμαστε στη συγκατάθεση, μπορείτε να την ανακαλέσετε οποτεδήποτε.',
            'Για την άσκηση οποιουδήποτε δικαιώματος, στείλτε email στο info@pianotuningscy.com. Θα απαντήσουμε εντός ενός μηνός.',
            'Αν θεωρείτε ότι χειριστήκαμε ακατάλληλα τα δεδομένα σας, μπορείτε να υποβάλετε καταγγελία στο Γραφείο Επιτρόπου Προστασίας Δεδομένων Προσωπικού Χαρακτήρα της Κυπριακής Δημοκρατίας (dataprotection.gov.cy).',
          ],
        },
        {
          heading: 'Αλλαγές στην πολιτική',
          paras: [
            'Αν η πολιτική αυτή αλλάξει ουσιωδώς, η ενημερωμένη έκδοση θα δημοσιευτεί σε αυτή τη σελίδα με νέα ημερομηνία αναθεώρησης.',
          ],
        },
      ],
    },
  },

  cookies: {
    title: { en: 'Cookie policy', el: 'Πολιτική cookies' },
    description: {
      en: 'This website sets no tracking or advertising cookies. Here is exactly what it does and does not store.',
      el: 'Η ιστοσελίδα δεν τοποθετεί cookies παρακολούθησης ή διαφήμισης. Δείτε ακριβώς τι αποθηκεύει και τι όχι.',
    },
    sections: {
      en: [
        {
          heading: 'The short version',
          paras: [
            'This website sets no cookies of its own, no tracking cookies, no advertising cookies and no third-party marketing cookies. There is no consent banner because there is nothing to consent to.',
          ],
        },
        {
          heading: 'Why there is nothing to accept',
          paras: [
            'Most websites need a cookie banner because they load advertising or analytics tools that store an identifier on your device in order to follow you. We do not use any of those.',
            'Our analytics provider, Plausible, counts page views without cookies and without storing any data on your device. It cannot identify you, cannot follow you to other sites, and cannot build a profile of you.',
          ],
        },
        {
          heading: 'What your browser may still store',
          paras: [
            'Your browser caches fonts, images and stylesheets so that pages load faster on your next visit. That is ordinary browser caching, not tracking, and you can clear it at any time from your browser settings.',
            'If you follow a link from this site to Facebook, Instagram or WhatsApp, those services set their own cookies under their own policies, over which we have no control.',
          ],
        },
        {
          heading: 'If this changes',
          paras: [
            'If we ever introduce a tool that requires cookies, we will publish it here and ask for your consent before it loads.',
          ],
        },
      ],
      el: [
        {
          heading: 'Με λίγα λόγια',
          paras: [
            'Η ιστοσελίδα δεν τοποθετεί δικά της cookies, ούτε cookies παρακολούθησης, διαφήμισης ή προώθησης τρίτων. Δεν υπάρχει banner συγκατάθεσης επειδή δεν υπάρχει κάτι για το οποίο να συγκατατεθείτε.',
          ],
        },
        {
          heading: 'Γιατί δεν υπάρχει τίποτα να αποδεχτείτε',
          paras: [
            'Οι περισσότερες ιστοσελίδες χρειάζονται banner cookies επειδή φορτώνουν εργαλεία διαφήμισης ή στατιστικών που αποθηκεύουν ένα αναγνωριστικό στη συσκευή σας για να σας παρακολουθούν. Εμείς δεν χρησιμοποιούμε κανένα από αυτά.',
            'Ο πάροχος στατιστικών μας, το Plausible, μετρά προβολές σελίδων χωρίς cookies και χωρίς να αποθηκεύει δεδομένα στη συσκευή σας. Δεν μπορεί να σας ταυτοποιήσει, δεν μπορεί να σας ακολουθήσει σε άλλες ιστοσελίδες, και δεν μπορεί να δημιουργήσει προφίλ σας.',
          ],
        },
        {
          heading: 'Τι μπορεί να αποθηκεύει ο browser σας',
          paras: [
            'Ο browser σας αποθηκεύει προσωρινά γραμματοσειρές, εικόνες και αρχεία στυλ ώστε οι σελίδες να φορτώνουν ταχύτερα στην επόμενη επίσκεψη. Πρόκειται για συνηθισμένη προσωρινή αποθήκευση, όχι παρακολούθηση, και μπορείτε να την καθαρίσετε οποτεδήποτε από τις ρυθμίσεις του browser.',
            'Αν ακολουθήσετε σύνδεσμο προς Facebook, Instagram ή WhatsApp, οι υπηρεσίες αυτές τοποθετούν δικά τους cookies βάσει των δικών τους πολιτικών, τις οποίες δεν ελέγχουμε.',
          ],
        },
        {
          heading: 'Αν αυτό αλλάξει',
          paras: [
            'Αν ποτέ εισαγάγουμε εργαλείο που απαιτεί cookies, θα το δημοσιεύσουμε εδώ και θα ζητήσουμε τη συγκατάθεσή σας πριν φορτώσει.',
          ],
        },
      ],
    },
  },

  terms: {
    title: { en: 'Terms of service', el: 'Όροι υπηρεσίας' },
    description: {
      en: 'The terms on which Piano Tunings Cy provides tuning, repair, restoration, transport and rental services in Cyprus.',
      el: 'Οι όροι υπό τους οποίους το Piano Tunings Cy παρέχει κούρδισμα, επισκευή, ανακαίνιση, μεταφορά και ενοικίαση στην Κύπρο.',
    },
    sections: {
      en: [
        {
          heading: 'Quotes and prices',
          paras: [
            'Prices shown on this website are for standard work on an instrument in normal condition. A standard tuning is €100; an evaluation is €30; grand piano rental starts at €650; the Piano Guardian plan is €230 per year.',
            'Repairs, restorations and moves are quoted individually after inspection, because the cost genuinely depends on the instrument and the access. No work beyond the agreed quote is carried out without your approval.',
            'Where a piano has dropped far below pitch and needs a pitch raise before a fine tuning will hold, this is explained and priced before any work begins.',
          ],
        },
        {
          heading: 'Booking and cancellation',
          paras: [
            'Submitting a form on this website is a request, not a confirmed booking. An appointment exists once we have confirmed the date and time with you directly.',
            'If you need to cancel or move an appointment, please give as much notice as you can — ideally 24 hours. For a single technician, a cancelled slot usually cannot be refilled at short notice.',
          ],
        },
        {
          heading: 'Access and conditions on site',
          paras: [
            'Tuning is done by ear and needs a reasonably quiet room. Please arrange for the instrument to be accessible and the room free of other noise for the duration of the appointment.',
            'For a move, the price depends on the access described to us. If the access on the day differs materially from what was described — an extra flight of stairs, a doorway that will not take the instrument — the quote may need to be revised, and that will be discussed with you before work continues.',
          ],
        },
        {
          heading: 'Our work',
          paras: [
            'Work is carried out with reasonable skill and care. If a tuning fails to hold for a reason attributable to the work rather than to the instrument or its environment, tell us and we will return and correct it.',
            'A tuning cannot compensate for an instrument\'s condition. Where a piano has structural problems that limit what tuning can achieve, this is explained before the work rather than after it.',
          ],
        },
        {
          heading: 'Payment',
          paras: [
            'Payment is due on completion of the work unless agreed otherwise in advance. The Piano Guardian plan is an annual arrangement valid for 12 months from purchase and includes one full tuning.',
          ],
        },
        {
          heading: 'Liability',
          paras: [
            'We carry out piano transport with specialist equipment and appropriate care. Nothing in these terms limits liability for death or personal injury caused by negligence, or for anything else that cannot lawfully be limited.',
            'We are not liable for pre-existing faults, for deterioration caused by the environment the instrument is kept in, or for loss that was not reasonably foreseeable.',
          ],
        },
        {
          heading: 'Governing law',
          paras: [
            'These terms are governed by the law of the Republic of Cyprus, and the courts of Cyprus have jurisdiction over any dispute.',
          ],
        },
      ],
      el: [
        {
          heading: 'Προσφορές και τιμές',
          paras: [
            'Οι τιμές που εμφανίζονται στην ιστοσελίδα αφορούν τυπικές εργασίες σε όργανο σε φυσιολογική κατάσταση. Το τυπικό κούρδισμα είναι €100· η εκτίμηση €30· η ενοικίαση πιάνου με ουρά ξεκινά από €650· το πρόγραμμα Piano Guardian είναι €230 τον χρόνο.',
            'Επισκευές, ανακαινίσεις και μεταφορές κοστολογούνται ξεχωριστά μετά από έλεγχο, γιατί το κόστος εξαρτάται πραγματικά από το όργανο και την πρόσβαση. Καμία εργασία πέραν της συμφωνημένης προσφοράς δεν εκτελείται χωρίς την έγκρισή σας.',
            'Όταν ένα πιάνο έχει πέσει πολύ χαμηλά τονικά και χρειάζεται ανύψωση τόνου πριν κρατήσει λεπτό κούρδισμα, αυτό εξηγείται και κοστολογείται πριν ξεκινήσει οποιαδήποτε εργασία.',
          ],
        },
        {
          heading: 'Κρατήσεις και ακυρώσεις',
          paras: [
            'Η υποβολή φόρμας στην ιστοσελίδα αποτελεί αίτημα, όχι επιβεβαιωμένη κράτηση. Το ραντεβού υφίσταται αφού επιβεβαιώσουμε μαζί σας απευθείας την ημερομηνία και την ώρα.',
            'Αν χρειαστεί να ακυρώσετε ή να μεταφέρετε ραντεβού, ενημερώστε μας όσο νωρίτερα μπορείτε — ιδανικά 24 ώρες πριν. Για έναν τεχνικό, ένα ακυρωμένο ραντεβού συνήθως δεν μπορεί να καλυφθεί σε σύντομο χρόνο.',
          ],
        },
        {
          heading: 'Πρόσβαση και συνθήκες στον χώρο',
          paras: [
            'Το κούρδισμα γίνεται με το αυτί και απαιτεί σχετικά ήσυχο χώρο. Παρακαλούμε φροντίστε το όργανο να είναι προσβάσιμο και ο χώρος χωρίς άλλους θορύβους για τη διάρκεια του ραντεβού.',
            'Για μεταφορά, η τιμή εξαρτάται από την πρόσβαση όπως μας περιγράφηκε. Αν η πρόσβαση την ημέρα της εργασίας διαφέρει ουσιωδώς από την περιγραφή — ένας επιπλέον όροφος, μια πόρτα από την οποία δεν περνά το όργανο — η προσφορά ενδέχεται να αναθεωρηθεί, και αυτό θα συζητηθεί μαζί σας πριν συνεχιστεί η εργασία.',
          ],
        },
        {
          heading: 'Η εργασία μας',
          paras: [
            'Οι εργασίες εκτελούνται με εύλογη δεξιότητα και επιμέλεια. Αν ένα κούρδισμα δεν κρατήσει για λόγο που οφείλεται στην εργασία και όχι στο όργανο ή στο περιβάλλον του, ενημερώστε μας και θα επιστρέψουμε να το διορθώσουμε.',
            'Το κούρδισμα δεν μπορεί να αναπληρώσει την κατάσταση ενός οργάνου. Όπου ένα πιάνο έχει δομικά προβλήματα που περιορίζουν το τι μπορεί να πετύχει το κούρδισμα, αυτό εξηγείται πριν την εργασία και όχι μετά.',
          ],
        },
        {
          heading: 'Πληρωμή',
          paras: [
            'Η πληρωμή καταβάλλεται με την ολοκλήρωση της εργασίας, εκτός αν συμφωνηθεί διαφορετικά εκ των προτέρων. Το πρόγραμμα Piano Guardian είναι ετήσια συμφωνία με ισχύ 12 μηνών από την αγορά και περιλαμβάνει ένα πλήρες κούρδισμα.',
          ],
        },
        {
          heading: 'Ευθύνη',
          paras: [
            'Εκτελούμε μεταφορές πιάνου με εξειδικευμένο εξοπλισμό και κατάλληλη επιμέλεια. Τίποτα στους όρους αυτούς δεν περιορίζει την ευθύνη για θάνατο ή σωματική βλάβη από αμέλεια, ή για οτιδήποτε άλλο δεν επιτρέπεται νομίμως να περιοριστεί.',
            'Δεν ευθυνόμαστε για προϋπάρχουσες βλάβες, για φθορά που οφείλεται στο περιβάλλον στο οποίο φυλάσσεται το όργανο, ή για ζημία που δεν ήταν ευλόγως προβλέψιμη.',
          ],
        },
        {
          heading: 'Εφαρμοστέο δίκαιο',
          paras: [
            'Οι όροι αυτοί διέπονται από το δίκαιο της Κυπριακής Δημοκρατίας, και τα δικαστήρια της Κύπρου έχουν δικαιοδοσία για κάθε διαφορά.',
          ],
        },
      ],
    },
  },
};
