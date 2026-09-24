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
 * An IPv6 subscriber often holds a whole /56 (256 /64s), so that is capped
 * too — generously, since mobile carriers share pools among customers. None
 * of this stops a determined attacker with many unrelated addresses; that
 * would take a challenge such as Turnstile. The worst case remains the chat
 * pausing until midnight UTC, never a bill.
 */
const DAILY_PER_VISITOR = 40;
const DAILY_PER_V6_56 = 120;

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
    const ip = request.headers.get('CF-Connecting-IP') ?? 'unknown';
    const visitor = visitorKey(ip);
    if (!(await env.PER_IP.limit({ key: visitor })).success) return fail('rate', cors);

    const input = await parse(request);
    if (!input) return fail('invalid', cors);

    if (!(await takeDaily(env, visitor, prefix56(ip)))) return fail('daily', cors);
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
        let settle!: (ok: boolean) => void;
        const firstText = new Promise<boolean>((resolve) => { settle = resolve; });
        const ts = normalise(model, stray, env.DEBUG === '1', settle);
        // A broken upstream (or a visitor who leaves) ends the attempt too.
        upstream.pipeTo(ts.writable).catch(() => settle(false));
        if (!last) {
          const aborted = new Promise<boolean>((resolve) => {
            if (ac.signal.aborted) resolve(false);
            ac.signal.addEventListener('abort', () => resolve(false), { once: true });
          });
          if (!(await Promise.race([firstText, aborted]))) {
            ts.readable.cancel().catch(() => {});
            throw ac.signal.aborted ? ac.signal.reason : new Error('no text before the stream ended');
          }
        }
        if (timer) clearTimeout(timer);
        return new Response(ts.readable, {
          headers: {
            ...cors,
            'Content-Type': 'text/event-stream; charset=utf-8',
            'Cache-Control': 'no-cache, no-transform',
            'X-Accel-Buffering': 'no',
          },
        });
      } catch (e) {
        if (timer) clearTimeout(timer);
        // Read before aborting: our own stall abort isn't a Workers AI error,
        // and its message ("…8000 ms") must not be parsed as an error code.
        const stalled = ac.signal.aborted;
        if (!stalled) ac.abort();
        const kind = stalled ? 'upstream' : classify(e);
        console.error('model failed', model, kind, stalled ? 'stall' : errorCode(e));
        if (kind === 'quota') return fail('quota', cors);
      }
    }
    return fail('upstream', cors);
  },
} satisfies ExportedHandler<Env>;

/* ---------- visitors ---------- */

/** The eight 16-bit groups of an IPv6 address, "::" expanded; null if not IPv6. */
function ipv6Groups(ip: string): number[] | null {
  if (!ip.includes(':')) return null;
  const [head, tail = ''] = ip.toLowerCase().split('%')[0].split('::');
  const h = head ? head.split(':') : [];
  const t = ip.includes('::') && tail ? tail.split(':') : [];
  const parts = ip.includes('::') ? [...h, ...Array(Math.max(0, 8 - h.length - t.length)).fill('0'), ...t] : h;
  if (parts.length < 4) return null;
  return parts.map((g) => parseInt(g || '0', 16) || 0);
}

/**
 * IPv6 hosts get their whole /64, so rotating addresses inside it can't dodge
 * the limits. The address is expanded first: "2001:db8::1:2:3:4" and
 * "2001:db8::5:6:7:8" are the same /64.
 */
export function visitorKey(ip: string): string {
  const g = ipv6Groups(ip);
  if (!g) return ip.toLowerCase();
  return `${g.slice(0, 4).map((x) => x.toString(16)).join(':')}::/64`;
}

/** The IPv6 /56 an address belongs to (a typical home delegation), or null for IPv4. */
export function prefix56(ip: string): string | null {
  const g = ipv6Groups(ip);
  if (!g) return null;
  return `${g.slice(0, 3).map((x) => x.toString(16)).join(':')}:${(g[3] & 0xff00).toString(16)}::/56`;
}

async function takeDaily(env: Env, visitor: string, group: string | null): Promise<boolean> {
  const day = new Date().toISOString().slice(0, 10);
  try {
    const stub = env.DAILY.get(env.DAILY.idFromName(day));
    // The raw keys only travel to the counter, which stores keyed hashes of them.
    const res = await stub.fetch('https://daily/take', {
      method: 'POST',
      body: JSON.stringify({ visitor, limit: DAILY_PER_VISITOR, group, groupLimit: DAILY_PER_V6_56 }),
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

  private async pseudonym(prefix: string, value: string): Promise<string> {
    const mac = await crypto.subtle.sign('HMAC', await this.hmacKey(), new TextEncoder().encode(value));
    return `${prefix}:${[...new Uint8Array(mac).slice(0, 16)].map((b) => b.toString(16).padStart(2, '0')).join('')}`;
  }

  async fetch(request: Request): Promise<Response> {
    const { visitor, limit, group, groupLimit } = (await request.json()) as {
      visitor: string; limit: number; group?: string | null; groupLimit?: number;
    };
    const id = await this.pseudonym('v', visitor);
    const gid = group ? await this.pseudonym('g', group) : null;
    // Storage calls only between read and write, so no other request can
    // interleave (Durable Object input gates) and no count is lost.
    const used = (await this.state.storage.get<number>(id)) ?? 0;
    const groupUsed = gid ? ((await this.state.storage.get<number>(gid)) ?? 0) : 0;
    if (used >= limit || (gid && groupUsed >= (groupLimit ?? Infinity))) return new Response('0');
    await this.state.storage.put(gid ? { [id]: used + 1, [gid]: groupUsed + 1 } : { [id]: used + 1 });
    return new Response('1');
  }

  async alarm() {
    await this.state.storage.deleteAll();
    this.key = null;
  }
}

/* ---------- request validation ---------- */

async function parse(request: Request) {
  // The widget always sends a length. Requiring one means the body can't be
  // larger than declared (the runtime enforces it), so nothing oversized is
  // ever buffered.
  const declared = request.headers.get('Content-Length');
  if (declared === null || !/^\d+$/.test(declared) || Number(declared) > LIMITS.bodyBytes) return null;

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
 *
 * Kept lean for the Free plan's 10 ms CPU budget, of which the Workers AI
 * binding itself takes about 5 ms (measured): one output event per network
 * chunk rather than per token, and the text of OpenAI-style deltas read
 * straight out of the event without parsing its bulky usage metadata.
 * Anything unusual falls back to a full JSON.parse.
 *
 * `onFirst(true)` fires with the first text, `onFirst(false)` if the stream
 * errors or ends before any. The readable side buffers freely, so the handler
 * can wait for that verdict before anything reads it.
 */
function normalise(
  model: string,
  stray: RegExp,
  debug = false,
  onFirst: (ok: boolean) => void = () => {},
): TransformStream<Uint8Array, Uint8Array> {
  const enc = new TextEncoder();
  const dec = new TextDecoder();
  let buffer = '';
  let finished = false;
  let sent = 0;
  let decided = false;
  const decide = (ok: boolean) => {
    if (!decided) { decided = true; onFirst(ok); }
  };

  type Read = { text: string; end?: 'done' | 'error'; usage?: unknown };

  const read = (payload: string): Read => {
    if (payload === '[DONE]') return { text: '', end: 'done' };
    // Fast path. `"content":"` can't match "reasoning_content", whose
    // "content" follows an underscore, not a quote.
    const at = debug ? -1 : payload.indexOf('"content":"');
    if (at !== -1) {
      let j = at + 11;
      while (j < payload.length && payload[j] !== '"') j += payload[j] === '\\' ? 2 : 1;
      try { return { text: JSON.parse(payload.slice(at + 10, j + 1)) as string }; } catch { /* full parse below */ }
    }
    let d: Record<string, any>;
    try { d = JSON.parse(payload); } catch { return { text: '' }; }
    const usage = debug ? d.usage : undefined;
    if (typeof d.response === 'string') return { text: d.response, usage };
    if (typeof d.choices?.[0]?.delta?.content === 'string') return { text: d.choices[0].delta.content, usage };
    if (typeof d.choices?.[0]?.text === 'string') return { text: d.choices[0].text, usage };
    if (d.type === 'response.output_text.delta' && typeof d.delta === 'string') return { text: d.delta, usage };
    if (d.type === 'response.completed' || d.type === 'response.done') return { text: '', end: 'done' };
    if (d.type === 'error' || d.type === 'response.failed' || d.error) {
      console.error('stream error', model, JSON.stringify(d.error ?? d).slice(0, 300));
      return { text: '', end: 'error' };
    }
    return { text: '', usage };
  };

  const emit = (c: TransformStreamDefaultController<Uint8Array>, obj: object) =>
    c.enqueue(enc.encode(`data: ${JSON.stringify(obj)}\n\n`));

  const flushText = (c: TransformStreamDefaultController<Uint8Array>, text: string) => {
    const clean = text.replace(stray, '');
    if (!clean) return;
    sent += clean.length;
    emit(c, { t: clean });
    decide(true);
  };

  const finish = (c: TransformStreamDefaultController<Uint8Array>, how: 'done' | 'error') => {
    finished = true;
    if (how === 'done' && sent) emit(c, { done: true });
    else {
      emit(c, { error: 'upstream' });
      decide(false);
    }
  };

  const process = (c: TransformStreamDefaultController<Uint8Array>, events: string[]) => {
    let text = '';
    for (const event of events) {
      for (const line of event.split('\n')) {
        if (finished || !line.startsWith('data:')) continue;
        const r = read(line.slice(5).trim());
        if (r.usage) emit(c, { usage: r.usage, model });
        text += r.text;
        if (r.end) {
          flushText(c, text);
          text = '';
          finish(c, r.end);
        }
      }
    }
    if (!finished) flushText(c, text);
  };

  return new TransformStream<Uint8Array, Uint8Array>(
    {
      transform(chunk, c) {
        if (finished) return;
        buffer += dec.decode(chunk, { stream: true }).replace(/\r/g, '');
        const cut = buffer.lastIndexOf('\n\n');
        if (cut === -1) return;
        const complete = buffer.slice(0, cut);
        buffer = buffer.slice(cut + 2);
        process(c, complete.split('\n\n'));
      },
      flush(c) {
        if (!finished && buffer.trim()) process(c, [buffer]);
        if (!finished) finish(c, sent ? 'done' : 'error');
      },
    },
    undefined,
    { highWaterMark: 1_024 },
  );
}

/* ---------- errors ---------- */

function errorCode(e: unknown): string {
  const m = String((e as Error)?.message ?? e).match(/\b(\d{4})\b/);
  return m ? m[1] : 'n/a';
}

function classify(e: unknown): ErrorKind {
  const msg = String((e as Error)?.message ?? e);
  // 4006 (seen live) / 3036 (docs): the account's daily free Neurons are used up.
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
