import { site } from '~/data/site';
import { useTranslations, type Locale } from '~/i18n/ui';

/**
 * Turns `site.hours` into display rows.
 *
 * The footer and contact page used to have the hours typed in by hand while the
 * LocalBusiness schema read them from data — two sources of truth, and a change
 * to one would silently publish different hours to Google than the page showed.
 * Both now render from here.
 *
 * Consecutive days sharing the same hours collapse into a range
 * ("Monday – Friday"), and days with no entry are reported as closed.
 */

const WEEK = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
] as const;

type Day = (typeof WEEK)[number];

const DAY_LABEL: Record<Locale, Record<Day, string>> = {
  en: {
    Monday: 'Monday',
    Tuesday: 'Tuesday',
    Wednesday: 'Wednesday',
    Thursday: 'Thursday',
    Friday: 'Friday',
    Saturday: 'Saturday',
    Sunday: 'Sunday',
  },
  el: {
    Monday: 'Δευτέρα',
    Tuesday: 'Τρίτη',
    Wednesday: 'Τετάρτη',
    Thursday: 'Πέμπτη',
    Friday: 'Παρασκευή',
    Saturday: 'Σάββατο',
    Sunday: 'Κυριακή',
  },
};

export interface HoursRow {
  /** "Monday – Friday" / "Σάββατο" */
  label: string;
  /** "09:00 – 17:00" or the localised word for closed. */
  value: string;
  closed: boolean;
}

export function openingHoursRows(locale: Locale): HoursRow[] {
  const t = useTranslations(locale);
  const label = DAY_LABEL[locale];

  // day -> "09:00 – 17:00", or undefined when closed
  const byDay = new Map<Day, string | undefined>();
  for (const day of WEEK) byDay.set(day, undefined);
  for (const block of site.hours) {
    for (const day of block.days) {
      byDay.set(day as Day, `${block.opens} – ${block.closes}`);
    }
  }

  const rows: HoursRow[] = [];
  let i = 0;
  while (i < WEEK.length) {
    const value = byDay.get(WEEK[i]);
    let j = i;
    while (j + 1 < WEEK.length && byDay.get(WEEK[j + 1]) === value) j++;

    rows.push({
      label: i === j ? label[WEEK[i]] : `${label[WEEK[i]]} – ${label[WEEK[j]]}`,
      value: value ?? t('label.closed'),
      closed: value === undefined,
    });
    i = j + 1;
  }
  return rows;
}
