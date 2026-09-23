import { site, serviceAreas } from '~/data/site';
import { services, type Service } from '~/data/services';
import { testimonials } from '~/data/testimonials';
import { faqs, type Faq } from '~/data/faq';
import { bcp47, path, servicePath, type Locale } from '~/i18n/ui';

const abs = (p: string) => new URL(p, site.url).toString();

const ORG_ID = `${site.url}/#business`;
const WEBSITE_ID = `${site.url}/#website`;
const PERSON_ID = `${site.url}/#kleanthis`;

/**
 * The core LocalBusiness node. This is what lets Google understand that a piano
 * technician in Nicosia serves the whole island — the legacy site had none of it.
 */
export function localBusiness(locale: Locale) {
  return {
    '@type': ['LocalBusiness', 'HomeAndConstructionBusiness'],
    '@id': ORG_ID,
    name: site.name,
    legalName: site.legalName,
    url: abs(path('home', locale)),
    image: abs('/og/og-default.jpg'),
    logo: { '@type': 'ImageObject', url: abs('/logo.png'), width: 766, height: 336 },
    telephone: site.phone,
    email: site.email,
    foundingDate: String(site.foundingYear),
    priceRange: '€€',
    currenciesAccepted: site.currency,
    paymentAccepted: 'Cash, Bank transfer',
    address: {
      '@type': 'PostalAddress',
      addressLocality: site.address.locality,
      addressRegion: site.address.region,
      addressCountry: site.address.country,
    },
    geo: { '@type': 'GeoCoordinates', latitude: site.geo.lat, longitude: site.geo.lng },
    // A mobile technician: the service area is the whole island, not a shopfront radius.
    areaServed: [
      { '@type': 'Country', name: 'Cyprus' },
      ...serviceAreas.map((a) => ({ '@type': 'City', name: a[locale] })),
    ],
    serviceArea: {
      '@type': 'GeoCircle',
      geoMidpoint: { '@type': 'GeoCoordinates', latitude: site.geo.lat, longitude: site.geo.lng },
      geoRadius: 120000,
    },
    openingHoursSpecification: site.hours.map((h) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: h.days,
      opens: h.opens,
      closes: h.closes,
    })),
    founder: { '@id': PERSON_ID },
    employee: { '@id': PERSON_ID },
    sameAs: [site.social.facebook, site.social.instagram],
    knowsLanguage: ['en', 'el'],
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: locale === 'el' ? 'Υπηρεσίες πιάνου' : 'Piano services',
      itemListElement: services.map((s) => ({
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: s[locale].name,
          url: abs(servicePath(s.slug, locale)),
        },
        ...(s.price !== null
          ? {
              price: s.price,
              priceCurrency: site.currency,
              ...(s.priceFrom
                ? {
                    priceSpecification: {
                      '@type': 'PriceSpecification',
                      minPrice: s.price,
                      priceCurrency: site.currency,
                    },
                  }
                : {}),
            }
          : {}),
      })),
    },
  };
}

export function person(locale: Locale) {
  return {
    '@type': 'Person',
    '@id': PERSON_ID,
    name: site.technician.name,
    jobTitle: site.technician.jobTitle[locale],
    worksFor: { '@id': ORG_ID },
    image: abs('/og/kleanthis.jpg'),
    knowsAbout:
      locale === 'el'
        ? ['Κούρδισμα πιάνου', 'Ανακαίνιση πιάνου', 'Μεταφορά πιάνου', 'Ρύθμιση μηχανισμού']
        : ['Piano tuning', 'Piano restoration', 'Piano moving', 'Action regulation'],
  };
}

export function website(locale: Locale) {
  return {
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    url: site.url,
    name: site.name,
    inLanguage: bcp47[locale],
    publisher: { '@id': ORG_ID },
  };
}

/** Individual service page: a Service node tied to the business. */
export function serviceSchema(s: Service, locale: Locale) {
  const copy = s[locale];
  return {
    '@type': 'Service',
    '@id': abs(servicePath(s.slug, locale)) + '#service',
    name: copy.name,
    description: copy.metaDescription,
    url: abs(servicePath(s.slug, locale)),
    serviceType: copy.name,
    provider: { '@id': ORG_ID },
    areaServed: { '@type': 'Country', name: 'Cyprus' },
    availableChannel: {
      '@type': 'ServiceChannel',
      serviceUrl: abs(path('book', locale)),
      servicePhone: site.phone,
    },
    ...(s.price !== null && {
      offers: {
        '@type': 'Offer',
        priceCurrency: site.currency,
        price: s.price,
        availability: 'https://schema.org/InStock',
        url: abs(path('book', locale)),
        ...(s.priceFrom && {
          priceSpecification: {
            '@type': 'PriceSpecification',
            minPrice: s.price,
            priceCurrency: site.currency,
          },
        }),
      },
    }),
  };
}

/**
 * Reviews. Deliberately emitted WITHOUT aggregateRating: the testimonials carried over
 * from the old site have no star ratings attached, and inventing them would be both
 * dishonest and a Google structured-data violation.
 */
export function reviewSchema(locale: Locale) {
  return testimonials.map((r) => ({
    '@type': 'Review',
    itemReviewed: { '@id': ORG_ID },
    author: { '@type': 'Person', name: r.author },
    reviewBody: r.quote[locale],
  }));
}

export function faqSchema(items: Faq[], locale: Locale) {
  return {
    '@type': 'FAQPage',
    mainEntity: items.map((f) => ({
      '@type': 'Question',
      name: f.q[locale],
      acceptedAnswer: { '@type': 'Answer', text: f.a[locale] },
    })),
  };
}

export function breadcrumbs(trail: { name: string; url: string }[]) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((t, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: t.name,
      item: abs(t.url),
    })),
  };
}

export function webPage(opts: {
  locale: Locale;
  url: string;
  title: string;
  description: string;
}) {
  return {
    '@type': 'WebPage',
    '@id': abs(opts.url) + '#webpage',
    url: abs(opts.url),
    name: opts.title,
    description: opts.description,
    inLanguage: bcp47[opts.locale],
    isPartOf: { '@id': WEBSITE_ID },
    about: { '@id': ORG_ID },
  };
}

/** Wrap nodes into a single @graph — one script tag, no duplicated context. */
export function graph(nodes: unknown[]) {
  return JSON.stringify({ '@context': 'https://schema.org', '@graph': nodes.flat() });
}

export { faqs, services };
