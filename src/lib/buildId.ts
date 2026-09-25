import { cyprusIso } from '~/lib/cyprusTime';

/**
 * Identifies this build. Every page carries it (meta "site-version") and
 * /version.json serves the live one, so an open or restored tab can tell it
 * is out of date and refresh itself (see Base.astro). Netlify provides the
 * commit; a local build falls back to the build time.
 */
const commit = (process.env.COMMIT_REF ?? process.env.GITHUB_SHA ?? '').slice(0, 12);
export const BUILD_ID = `${cyprusIso().replace(/[^0-9]/g, '').slice(0, 14)}${commit ? `-${commit}` : ''}`;
