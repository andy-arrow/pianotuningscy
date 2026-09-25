/**
 * Everything the site prints about dates runs on Cyprus time (Asia/Nicosia:
 * EEST, UTC+3, in summer; EET, UTC+2, in winter) — never the clock of
 * whichever server builds it. Netlify and GitHub build in UTC, so a build
 * between midnight and 03:00 in Nicosia would otherwise stamp yesterday.
 */
export const CYPRUS_TZ = 'Asia/Nicosia';

/** Year in Cyprus right now (or at `at`). */
export function cyprusYear(at = new Date()): number {
  return Number(new Intl.DateTimeFormat('en-GB', { timeZone: CYPRUS_TZ, year: 'numeric' }).format(at));
}

/** A long date in Cyprus time, e.g. "25 September 2026" / "25 Σεπτεμβρίου 2026". */
export function cyprusLongDate(locale: 'en' | 'el', at = new Date()): string {
  return new Intl.DateTimeFormat(locale === 'el' ? 'el-CY' : 'en-GB', {
    timeZone: CYPRUS_TZ, year: 'numeric', month: 'long', day: 'numeric',
  }).format(at);
}

/** ISO 8601 timestamp with the Cyprus offset, e.g. "2026-09-25T07:40:12+03:00". */
export function cyprusIso(at = new Date()): string {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-GB', {
      timeZone: CYPRUS_TZ, year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23', timeZoneName: 'longOffset',
    }).formatToParts(at).map((p) => [p.type, p.value]),
  );
  const offset = (parts.timeZoneName as string).replace('GMT', '') || '+00:00';
  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}:${parts.second}${offset}`;
}
