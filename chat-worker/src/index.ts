/**
 * Piano Tunings Cy — chat assistant backend (Cloudflare Worker).
 *
 * Why this is free, with no catch:
 *   - Models run on Workers AI through the `AI` binding. No API key exists to
 *     leak, and on the Workers Free plan there is no card on file — when the
 *     daily allowance runs out, requests fail until midnight UTC. Nothing is
 *     ever billed. The widget then shows Call / WhatsApp instead.
 *   - Cloudflare does not train models on Workers AI inputs or outputs.
 *   - No message content is stored or logged. The only thing kept is a
 *     per-visitor answer count for the day, keyed by a pseudonym (a keyed hash
 *     of the IP address with a random daily secret — never the address
 *     itself), deleted together with that secret after 48 hours.
 *
 * Protocol (independent of the model behind it):
 *   POST { messages: [{ role, content }], locale: 'en' | 'el', page: '/path/' }
 *   → text/event-stream of
 *       data: {"t":"delta"}   data: {"done":true}   data: {"error":"kind"}
 *   Errors before streaming are JSON { error } with a 4xx/5xx status.
 *   kind: rate | daily | quota | invalid | forbidden | upstream
 *
 * Sent as text/plain so the browser treats it as a simple request: no CORS
 * preflight, one round trip fewer. The body is parsed as JSON regardless.
 *
 * Facts come from https://pianotuningscy.com/chat-knowledge.json, generated
 * from the website's own data files — the Worker never needs redeploying when
 * a price or FAQ changes.
 */

import { params, replyLanguage, strayScriptPattern, systemPrompt } from './prompt.ts';

export interface Env {
  AI: Ai;
  PER_IP: RateLimit;
  GLOBAL: RateLimit;
  DAILY: DurableObjectNamespace;
  /** Comma-separated; the first is primary, the rest are fallbacks. */
  MODELS: string;
  KNOWLEDGE_URL: string;
  /** Comma-separated exact origins allowed to call this Worker. */
  ALLOWED_ORIGINS: string;
  /** Local testing only ("1"): also stream token usage. Never set in wrangler.toml. */
  DEBUG?: string;
  /** How long a model may take to start answering before the next one is tried. */
  STALL_MS?: string;
}

type Role = 'user' | 'assistant';
interface Msg { role: Role; content: string }
type ErrorKind = 'rate' | 'daily' | 'quota' | 'invalid' | 'forbidden' | 'upstream';

// Sized so a turn stays near the input the daily allowance was planned on;
// Greek tokenises denser than English.
const LIMITS = {
  bodyBytes: 16_000,
  turns: 12,
  userChars: 600,
  assistantChars: 2_000,
  historyChars: 6_000,
};

/**
 * Answers one visitor (IPv4 address, or IPv6 /64) may use per UTC day. The
 * per-minute limits alone would let a single script drain the whole daily
 * allowance in under an hour; with this, one source can use about a tenth.
 */
const DAILY_PER_VISITOR = 40;

const STATUS: Record<ErrorKind, number> = {
  invalid: 400, forbidden: 403, rate: 429, daily: 429, upstream: 502, quota: 503,
};

/* -------------------------------------------------------------------------- */

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const origin = request.headers.get('Origin') ?? '';
    const allowed = env.ALLOWED_ORIGINS.split(',').map((s) => s.trim()).filter(Boolean);
    const cors: Record<string, string> = allowed.includes(origin)
      ? { 'Access-Control-Allow-Origin': origin, Vary: 'Origin' }
      : { Vary: 'Origin' };

    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          ...cors,
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Max-Age': '86400',
        },
      });
    }

    if (request.method === 'GET' && (url.pathname === '/' || url.pathname === '/health')) {
      let knowledge = false;
      try { knowledge = !!(await getKnowledge(env, ctx)).text; } catch { /* reported below */ }
      return json({ ok: knowledge, knowledge, models: models(env) }, knowledge ? 200 : 503, cors);
    }

    if (request.method !== 'POST') return fail('invalid', cors, 405);
    if (!allowed.includes(origin)) return fail('forbidden', cors);

    // Three layers against one source spending everyone's allowance: a
    // per-visitor burst limit, a whole-site ceiling, and a per-visitor daily
    // cap. The first two are approximate (per Cloudflare location); none of
    // this is about money — the hard stop is the free allowance, which can
    // never become a bill — it keeps the assistant available for real people.
    // Checked in order, per-visitor first, so a request one visitor isn't
    // allowed never uses up the site-wide budget everyone shares.
    const visitor = visitorKey(request.headers.get('CF-Connecting-IP') ?? 'unknown');
    if (!(await env.PER_IP.limit({ key: visitor })).success) return fail('rate', cors);

    const input = await parse(request);
    if (!input) return fail('invalid', cors);

    if (!(await takeDaily(env, visitor))) return fail('daily', cors);
    if (!(await env.GLOBAL.limit({ key: 'all' })).success) return fail('rate', cors);

    let knowledge: Knowledge;
    try {
      knowledge = await getKnowledge(env, ctx);
    } catch (e) {
      console.error('knowledge unavailable', String(e));
      return fail('upstream', cors);
    }

    // Facts in the language the answer will be written in: the site's own
    // Greek copy beats a model translating English facts on the fly.
    const lastUser = input.messages[input.messages.length - 1].content;
    const lang = replyLanguage(lastUser, input.locale);
    // Scripts used anywhere in the conversation stay allowed in the reply.
    const stray = strayScriptPattern(input.messages.map((m) => m.content).join('\n'));
    const system = systemPrompt(
      { text: lang === 'el' ? knowledge.textEl : knowledge.text, slugs: knowledge.slugs },
      input.locale,
      input.page,
      lang,
    );

    // Try each model in turn. The daily allowance is shared by every model on
    // the account, so running out ends it here. A model is committed to only
    // once it produces actual text: one test answer took 18 s to begin, and a
    // visitor shouldn't watch dots that long — or get an empty reply — when a
    // fallback exists. The clock covers the whole attempt, from the request
    // onwards. The last model gets the client's full wait.
    const list = models(env);
    const stallMs = Number(env.STALL_MS ?? 8_000);
    for (const [i, model] of list.entries()) {
      const last = i === list.length - 1;
      const ac = new AbortController();
      const timer = last ? null : setTimeout(() => ac.abort(new Error(`stalled: no text in ${stallMs} ms`)), stallMs);
      try {
        const upstream = await run(env, model, system, input.messages, ac.signal);
        let stream = upstream.pipeThrough(normalise(model, stray, env.DEBUG === '1'));
        if (!last) stream = await firstText(stream, ac.signal);
        if (timer) clearTimeout(timer);
        return new Response(stream, {
          headers: {
            ...cors,
            'Content-Type': 'text/event-stream; charset=utf-8',
            'Cache-Control': 'no-cache, no-transform',
            'X-Accel-Buffering': 'no',
          },
        });
      } catch (e) {
        if (timer) clearTimeout(timer);
        if (!ac.signal.aborted) ac.abort();
        const kind = classify(e);
        console.error('model failed', model, kind, errorCode(e));
        if (kind === 'quota') return fail('quota', cors);
      }
    }
    return fail('upstream', cors);
  },
} satisfies ExportedHandler<Env>;

/**
 * Reads a normalised stream until its first text event and returns an
 * equivalent stream (buffered events first). Throws — so the next model is
 * tried — if the stream errors, ends, or the signal aborts before any text.
 */
async function firstText(stream: ReadableStream<Uint8Array>, signal: AbortSignal) {
  const reader = stream.getReader();
  const dec = new TextDecoder();
  const held: Uint8Array[] = [];
  let seen = '';
  const aborted = new Promise<never>((_, reject) => {
    if (signal.aborted) reject(signal.reason);
    signal.addEventListener('abort', () => reject(signal.reason), { once: true });
  });
  aborted.catch(() => {});
  try {
    for (;;) {
      const { done, value } = await Promise.race([reader.read(), aborted]);
      if (done) throw new Error('ended before any text');
      held.push(value);
      seen += dec.decode(value, { stream: true });
      const first = seen.match(/data: \{"(t|error|done)"/);
      if (!first) continue;
      if (first[1] !== 't') throw new Error(`no text before ${first[1]}`);
      break;
    }
  } catch (e) {
    reader.cancel().catch(() => {});
    throw e;
  }
  return new ReadableStream<Uint8Array>({
    start(c) { for (const chunk of held) c.enqueue(chunk); },
    async pull(c) {
      const { done, value } = await reader.read();
      if (done) c.close();
      else c.enqueue(value);
    },
    cancel(reason) { return reader.cancel(reason); },
  });
}

/* ---------- visitors ---------- */

/**
 * IPv6 hosts get their whole /64, so rotating addresses inside it can't dodge
 * the limits. The address is expanded first: "2001:db8::1:2:3:4" and
 * "2001:db8::5:6:7:8" are the same /64.
 */
export function visitorKey(ip: string): string {
  if (!ip.includes(':')) return ip;
  const [head, tail = ''] = ip.toLowerCase().split('::');
  const h = head ? head.split(':') : [];
  const t = ip.includes('::') && tail ? tail.split(':') : [];
  const groups = ip.includes('::') ? [...h, ...Array(Math.max(0, 8 - h.length - t.length)).fill('0'), ...t] : h;
  if (groups.length < 4) return ip.toLowerCase();
  return `${groups.slice(0, 4).map((g) => parseInt(g || '0', 16).toString(16)).join(':')}::/64`;
}

async function takeDaily(env: Env, visitor: string): Promise<boolean> {
  const day = new Date().toISOString().slice(0, 10);
  try {
    const stub = env.DAILY.get(env.DAILY.idFromName(day));
    // The raw key only travels to the counter, which stores a keyed hash of it.
    const res = await stub.fetch('https://daily/take', {
      method: 'POST',
      body: JSON.stringify({ visitor, limit: DAILY_PER_VISITOR }),
    });
    return (await res.text()) === '1';
  } catch (e) {
    // Fail open: this cap protects availability, and the free allowance
    // remains the hard stop either way.
    console.error('daily counter unavailable', String(e));
    return true;
  }
}

/**
 * One instance per UTC day holds that day's per-visitor answer counts under
 * pseudonyms: HMAC-SHA-256 of the visitor with a random secret created on the
 * day's first request. Two days later an alarm deletes everything, secret
 * included, after which the pseudonyms can't be linked to anyone.
 */
export class DailyAllowance {
  private state: DurableObjectState;
  private key: CryptoKey | null = null;

  constructor(state: DurableObjectState) {
    this.state = state;
  }

  private async hmacKey(): Promise<CryptoKey> {
    if (this.key) return this.key;
    let secret = await this.state.storage.get<ArrayBuffer>('secret');
    if (!secret) {
      secret = crypto.getRandomValues(new Uint8Array(32)).buffer;
      await this.state.storage.put('secret', secret);
      await this.state.storage.setAlarm(Date.now() + 48 * 3_600_000);
    }
    this.key = await crypto.subtle.importKey('raw', secret, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
    return this.key;
  }

  async fetch(request: Request): Promise<Response> {
    const { visitor, limit } = (await request.json()) as { visitor: string; limit: number };
    const mac = await crypto.subtle.sign('HMAC', await this.hmacKey(), new TextEncoder().encode(visitor));
    const id = `v:${[...new Uint8Array(mac).slice(0, 16)].map((b) => b.toString(16).padStart(2, '0')).join('')}`;
    const used = (await this.state.storage.get<number>(id)) ?? 0;
    if (used >= limit) return new Response('0');
    await this.state.storage.put(id, used + 1);
    return new Response('1');
  }

  async alarm() {
    await this.state.storage.deleteAll();
    this.key = null;
  }
}

/* ---------- request validation ---------- */

async function parse(request: Request) {
  const len = Number(request.headers.get('Content-Length') ?? 0);
  if (len > LIMITS.bodyBytes) return null;

  let body: { messages?: unknown; locale?: unknown; page?: unknown };
  try {
    const text = await request.text();
    if (text.length > LIMITS.bodyBytes) return null;
    body = JSON.parse(text);
  } catch {
    return null;
  }
  if (!body || !Array.isArray(body.messages) || body.messages.length === 0) return null;

  const clean = (s: string) =>
    s.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').replace(/\r\n?/g, '\n').trim();

  let messages: Msg[] = [];
  for (const m of body.messages.slice(-LIMITS.turns)) {
    if (!m || typeof m !== 'object') return null;
    const { role, content } = m as { role?: unknown; content?: unknown };
    if ((role !== 'user' && role !== 'assistant') || typeof content !== 'string') return null;
    let text = clean(content);
    if (!text) return null;
    if (role === 'user' && text.length > LIMITS.userChars) return null;
    if (role === 'assistant' && text.length > LIMITS.assistantChars) {
      text = `${text.slice(0, LIMITS.assistantChars)}…`;
    }
    messages.push({ role, content: text });
  }

  if (messages[messages.length - 1].role !== 'user') return null;

  // Long conversations forget their oldest turns rather than failing.
  let total = messages.reduce((n, m) => n + m.content.length, 0);
  while (messages.length > 1 && total > LIMITS.historyChars) {
    total -= messages.shift()!.content.length;
  }
  // A conversation opens with the visitor and ends with their latest question.
  while (messages.length && messages[0].role !== 'user') messages.shift();
  if (!messages.length) return null;

  // Collapse accidental repeats of the same role so the model sees a clean
  // alternating exchange.
  messages = messages.reduce<Msg[]>((out, m) => {
    const prev = out[out.length - 1];
    if (prev && prev.role === m.role) prev.content += `\n\n${m.content}`;
    else out.push({ ...m });
    return out;
  }, []);

  const locale = body.locale === 'el' ? 'el' : 'en';
  // Only the shape every real route has (lowercase ASCII segments). Anything
  // else — encoded characters above all — could smuggle text into the prompt.
  const page =
    typeof body.page === 'string' && body.page.length <= 100 && /^\/(?:[a-z0-9-]+\/)*$/.test(body.page)
      ? body.page
      : '/';

  return { messages, locale, page } as const;
}

/* ---------- knowledge ---------- */

interface Knowledge { text: string; textEl: string; slugs: string[]; at: number }
let cache: Knowledge | null = null;
let refreshing: { p: Promise<Knowledge>; at: number } | null = null;
const FRESH_MS = 5 * 60_000;

/**
 * Stale-while-revalidate: a slow website never slows a reply down. A load
 * older than 10 s is presumed lost (e.g. its request was cancelled) and
 * replaced, and a cold start waits at most 8 s, so nothing can hang forever.
 */
async function getKnowledge(env: Env, ctx: ExecutionContext): Promise<Knowledge> {
  if (cache && Date.now() - cache.at < FRESH_MS) return cache;
  if (!refreshing || Date.now() - refreshing.at > 10_000) {
    const entry = { at: Date.now(), p: loadKnowledge(env) };
    entry.p = entry.p.finally(() => { if (refreshing === entry) refreshing = null; });
    refreshing = entry;
  }
  const { p } = refreshing;
  if (cache) {
    ctx.waitUntil(p.catch((e) => console.error('knowledge refresh failed', String(e))));
    return cache;
  }
  let timer: ReturnType<typeof setTimeout> | null = null;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error('knowledge load timed out')), 8_000);
  });
  try {
    return await Promise.race([p, timeout]);
  } finally {
    if (timer !== null) clearTimeout(timer);
  }
}

async function loadKnowledge(env: Env): Promise<Knowledge> {
  const res = await fetch(env.KNOWLEDGE_URL, {
    headers: { Accept: 'application/json' },
    cf: { cacheTtl: 120, cacheEverything: true },
    // Always settles, so one hung request can't block every later refresh.
    signal: AbortSignal.timeout(5_000),
  });
  if (!res.ok) throw new Error(`knowledge HTTP ${res.status}`);
  const data = (await res.json()) as { knowledge?: unknown; knowledgeEl?: unknown; serviceSlugs?: unknown };
  if (typeof data.knowledge !== 'string' || !Array.isArray(data.serviceSlugs)) {
    throw new Error('knowledge malformed');
  }
  cache = {
    text: data.knowledge,
    textEl: typeof data.knowledgeEl === 'string' ? data.knowledgeEl : data.knowledge,
    slugs: data.serviceSlugs.filter((s): s is string => typeof s === 'string'),
    at: Date.now(),
  };
  return cache;
}

/* ---------- models ---------- */

function models(env: Env): string[] {
  return env.MODELS.split(',').map((s) => s.trim()).filter(Boolean);
}

type Runner = {
  run(model: string, inputs: unknown, options?: { rejectIfBusy?: boolean; signal?: AbortSignal }): Promise<unknown>;
};

async function run(env: Env, model: string, system: string, messages: Msg[], signal: AbortSignal) {
  // Cast: rejectIfBusy (Workers AI changelog, 2026-09-17) isn't in the
  // published types yet.
  const ai = env.AI as unknown as Runner;
  const inputs = {
    messages: [{ role: 'system', content: system }, ...messages],
    stream: true,
    ...params(model),
  };
  // Fail fast when the model is busy, so the fallback (or a friendly error)
  // arrives in a second instead of after a long queue.
  const out = await ai.run(model, inputs, { rejectIfBusy: true, signal });
  if (!(out instanceof ReadableStream)) throw new Error('not a stream');
  return out as ReadableStream<Uint8Array>;
}

/**
 * Model stream → the widget's protocol. Accepts every streaming shape Workers
 * AI produces ({response}, OpenAI chat deltas, Responses API events) and drops
 * reasoning text, so swapping models never touches the website.
 */
function normalise(model: string, stray: RegExp, debug = false): TransformStream<Uint8Array, Uint8Array> {
  const enc = new TextEncoder();
  const dec = new TextDecoder();
  let buffer = '';
  let finished = false;
  let sent = 0;

  const emit = (c: TransformStreamDefaultController<Uint8Array>, obj: object) =>
    c.enqueue(enc.encode(`data: ${JSON.stringify(obj)}\n\n`));

  const handle = (c: TransformStreamDefaultController<Uint8Array>, payload: string) => {
    if (finished) return;
    if (payload === '[DONE]') {
      finished = true;
      emit(c, sent ? { done: true } : { error: 'upstream' });
      return;
    }
    let d: Record<string, any>;
    try { d = JSON.parse(payload); } catch { return; }
    if (debug && d.usage) emit(c, { usage: d.usage, model });

    let text = '';
    if (typeof d.response === 'string') text = d.response;
    else if (typeof d.choices?.[0]?.delta?.content === 'string') text = d.choices[0].delta.content;
    else if (typeof d.choices?.[0]?.text === 'string') text = d.choices[0].text;
    else if (d.type === 'response.output_text.delta' && typeof d.delta === 'string') text = d.delta;
    else if (d.type === 'response.completed' || d.type === 'response.done') {
      finished = true;
      emit(c, sent ? { done: true } : { error: 'upstream' });
      return;
    } else if (d.type === 'error' || d.type === 'response.failed' || d.error) {
      finished = true;
      console.error('stream error', model, JSON.stringify(d.error ?? d).slice(0, 300));
      emit(c, { error: 'upstream' });
      return;
    }

    text = text.replace(stray, '');
    if (text) {
      sent += text.length;
      emit(c, { t: text });
    }
  };

  return new TransformStream({
    transform(chunk, c) {
      buffer += dec.decode(chunk, { stream: true });
      let cut: number;
      while ((cut = buffer.search(/\r?\n\r?\n/)) !== -1) {
        const event = buffer.slice(0, cut);
        buffer = buffer.slice(cut).replace(/^\r?\n\r?\n/, '');
        for (const line of event.split(/\r?\n/)) {
          if (line.startsWith('data:')) handle(c, line.slice(5).trim());
        }
      }
    },
    flush(c) {
      for (const line of buffer.split(/\r?\n/)) {
        if (line.startsWith('data:')) handle(c, line.slice(5).trim());
      }
      if (!finished) emit(c, sent ? { done: true } : { error: 'upstream' });
    },
  });
}

/* ---------- errors ---------- */

function errorCode(e: unknown): string {
  const m = String((e as Error)?.message ?? e).match(/\b(\d{4})\b/);
  return m ? m[1] : 'n/a';
}

function classify(e: unknown): ErrorKind {
  const msg = String((e as Error)?.message ?? e);
  // 3036: the account's daily free Neurons are used up (older docs: 4006).
  if (/\b(3036|4006)\b|daily free allocation|neurons/i.test(msg)) return 'quota';
  return 'upstream';
}

function json(body: object, status: number, headers: Record<string, string>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...headers, 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
  });
}

function fail(kind: ErrorKind, headers: Record<string, string>, status = STATUS[kind]) {
  return json({ error: kind }, status, headers);
}
