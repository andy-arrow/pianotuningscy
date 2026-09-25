import type { APIRoute } from 'astro';
import { BUILD_ID } from '~/lib/buildId';

/** The live build's id. Served with no-store (public/_headers). */
export const GET: APIRoute = () =>
  new Response(JSON.stringify({ version: BUILD_ID }), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
