/**
 * Chat assistant — client logic. Loaded on demand by ChatWidget.astro.
 *
 * Talks straight to the Cloudflare Worker in chat-worker/ (not through a
 * Netlify proxy, which buffers streams and cuts them at 26 s) using a tiny
 * server-sent-events protocol that is independent of whichever model sits
 * behind it:
 *
 *   data: {"t":"text delta"}     streamed reply text
 *   data: {"done":true}          reply finished
 *   data: {"error":"quota"}      rate | quota | invalid | upstream
 *
 * The model never emits URLs. It emits action tokens — [[CALL]], [[WHATSAPP]],
 * [[BOOK]], [[BOOK:slug]], [[SERVICE:slug]] — which become buttons here, with
 * slugs checked against the site's real services. So a reply can never send a
 * visitor somewhere that does not exist.
 */

type Role = 'user' | 'assistant';
interface Msg { role: Role; content: string }
interface Action { type: 'CALL' | 'WHATSAPP' | 'BOOK' | 'SERVICE'; slug?: string }
interface ChatConfig {
  locale: 'en' | 'el';
  endpoint: string;
  page: string;
  phone: string;
  phoneDisplay: string;
  whatsapp: string;
  email: string;
  bookUrl: string;
  services: Record<string, { name: string; url: string }>;
  suggestions: string[];
  strings: Record<
    | 'welcome' | 'thinking' | 'you' | 'assistant' | 'error' | 'rate' | 'quota'
    | 'daily' | 'limit' | 'tooLong' | 'actionCall' | 'actionWhatsapp' | 'actionBook',
    string
  >;
}

const STORE_KEY = 'ptc-chat-v1';
// Mirrors the Worker's limits. History is trimmed here too, because Greek is
// two bytes a letter and an untrimmed conversation could outgrow the body cap.
const MAX_INPUT = 600;
const MAX_HISTORY = 12;
const MAX_ASSISTANT_CHARS = 2_000;
const MAX_HISTORY_CHARS = 6_000;
const MAX_USER_TURNS = 20;
const FIRST_TOKEN_TIMEOUT = 30_000;

const ICON = {
  phone:
    '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" class="h-4 w-4"><path d="M2.5 4.5A2 2 0 0 1 4.5 2.5h2a1 1 0 0 1 .97.76l.9 3.6a1 1 0 0 1-.28.96l-1.4 1.4a13 13 0 0 0 5.6 5.6l1.4-1.4a1 1 0 0 1 .96-.28l3.6.9a1 1 0 0 1 .76.97v2a2 2 0 0 1-2 2A15.5 15.5 0 0 1 2.5 4.5Z"/></svg>',
  whatsapp:
    '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" class="h-4 w-4"><path d="M12 2a10 10 0 0 0-8.6 15.05L2 22l5.1-1.33A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.18-1.14l-.3-.18-3.1.81.83-3.02-.2-.31A8.2 8.2 0 1 1 12 20.2Zm4.5-6.14c-.25-.13-1.46-.72-1.69-.8-.22-.09-.39-.13-.55.12s-.63.8-.77.97-.29.18-.53.06a6.7 6.7 0 0 1-2-1.23 7.4 7.4 0 0 1-1.36-1.7c-.14-.25-.01-.38.11-.5.11-.11.25-.29.37-.43.12-.15.16-.25.25-.42a.46.46 0 0 0-.02-.44c-.06-.13-.55-1.34-.76-1.83-.2-.47-.4-.41-.55-.42h-.47a.9.9 0 0 0-.65.3 2.74 2.74 0 0 0-.85 2.03 4.76 4.76 0 0 0 1 2.52 10.9 10.9 0 0 0 4.18 3.7c.58.25 1.04.4 1.4.51.59.19 1.12.16 1.54.1.47-.07 1.46-.6 1.66-1.18s.2-1.06.15-1.16-.23-.16-.48-.28Z"/></svg>',
  arrow:
    '<svg viewBox="0 0 24 24" aria-hidden="true" class="h-4 w-4"><path d="M4 12h15m0 0-6-6m6 6-6 6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
};

class ChatError extends Error {
  constructor(public kind: 'rate' | 'daily' | 'quota' | 'invalid' | 'upstream' | 'network') {
    super(kind);
  }
}

/* ------------------------------------------------------------------ */

let state: ReturnType<typeof setup> | null = null;

/** Called by the launcher. First call wires everything up. */
export function toggle(root: HTMLElement) {
  state ??= setup(root);
  if (root.dataset.state === 'open') state.close();
  else state.open();
}

function setup(root: HTMLElement) {
  const cfg = JSON.parse(
    document.getElementById('ptc-chat-config')!.textContent || '{}',
  ) as ChatConfig;
  const S = cfg.strings;

  const launcher = root.querySelector<HTMLButtonElement>('[data-chat-launcher]')!;
  const panel = root.querySelector<HTMLElement>('[data-chat-panel]')!;
  const log = root.querySelector<HTMLElement>('[data-chat-log]')!;
  log.tabIndex = -1; // focus target on touch screens, where the input would open the keyboard
  const form = root.querySelector<HTMLFormElement>('[data-chat-form]')!;
  const input = root.querySelector<HTMLTextAreaElement>('[data-chat-input]')!;
  const sendBtn = root.querySelector<HTMLButtonElement>('[data-chat-send]')!;
  const closeBtn = root.querySelector<HTMLButtonElement>('[data-chat-close]')!;
  const restartBtn = root.querySelector<HTMLButtonElement>('[data-chat-restart]')!;
  const title = panel.querySelector<HTMLElement>('#ptc-chat-title')!;

  const small = window.matchMedia('(max-width: 639.98px)');
  const coarse = window.matchMedia('(pointer: coarse)');

  let history: Msg[] = load();
  let busy = false;
  let controller: AbortController | null = null;

  /* ---------- persistence (per tab; survives moving between pages) ---------- */

  function load(): Msg[] {
    try {
      const raw = sessionStorage.getItem(STORE_KEY);
      const data = raw ? JSON.parse(raw) : null;
      return Array.isArray(data)
        ? data.filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
        : [];
    } catch {
      return [];
    }
  }
  function save() {
    try {
      sessionStorage.setItem(STORE_KEY, JSON.stringify(history.slice(-MAX_HISTORY * 2)));
    } catch {
      /* storage blocked — conversation just won't survive navigation */
    }
  }

  /* ---------- rendering ---------- */

  const esc = (s: string) =>
    s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

  const TOKEN = /\[\[\s*(CALL|WHATSAPP|BOOK|SERVICE)\s*(?::\s*([a-z0-9-]+))?\s*\]\]/gi;

  function parseReply(raw: string, streaming: boolean): { html: string; actions: Action[] } {
    const actions: Action[] = [];
    const seen = new Set<string>();

    const collect = (_m: string, type: string, slug?: string) => {
      const kind = type.toUpperCase() as Action['type'];
      // Own properties only: "constructor" or "toString" must not count as slugs.
      const validSlug = slug && Object.prototype.hasOwnProperty.call(cfg.services, slug) ? slug : undefined;
      if (kind === 'SERVICE' && !validSlug) return '';
      const key = `${kind}:${validSlug ?? ''}`;
      if (!seen.has(key)) {
        seen.add(key);
        actions.push({ type: kind, slug: validSlug });
      }
      return '';
    };

    // Tokens belong on a line of their own. Models sometimes copy a label
    // next to one ("[[BOOK]] booking form"). A remainder of at most three
    // words with no digits or prices is such a label (the button already says
    // it); anything longer is real content and stays.
    let text = raw
      .split('\n')
      .map((line) => {
        TOKEN.lastIndex = 0;
        if (!TOKEN.test(line)) return line;
        const rest = line.replace(TOKEN, collect).trim();
        const label = rest.split(/\s+/).length <= 3 && !/[\d€$£]/.test(rest) && !/[.!?;:…·]$/.test(rest);
        return label ? '' : rest;
      })
      .join('\n');

    // A service-specific booking button makes a plain one redundant; then
    // keep at most three, as the prompt asks.
    if (actions.some((a) => a.type === 'BOOK' && a.slug)) {
      const plain = actions.findIndex((a) => a.type === 'BOOK' && !a.slug);
      if (plain !== -1) actions.splice(plain, 1);
    }
    actions.splice(3);

    // Mid-stream, hide a token that has only partly arrived ("[[BO", "[[CALL]").
    if (streaming) text = text.replace(/\[\[[^\]]*\]?$/, '').replace(/\[$/, '');
    text = text.replace(/[ \t]+\n/g, '\n').trim();

    return { html: toHtml(text), actions };
  }

  /** A deliberately small, safe markdown subset: paragraphs, lists, bold. */
  function toHtml(text: string): string {
    const inline = (s: string) =>
      esc(s)
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/__(.+?)__/g, '<strong>$1</strong>')
        .replace(/(^|[\s(])\*(\S[^*\n]*?\S)\*(?=[\s).,!?;:]|$)/g, '$1<em>$2</em>')
        .replace(/`([^`]+)`/g, '$1')
        // Only the business's own number becomes tap-to-call. Any other
        // number stays plain text, so no reply can turn a stranger's number
        // into a one-tap call.
        .replace(/(^|[^\d])((?:\+357[\s-]?)?(9\d)[\s-]?(\d{3})[\s-]?(\d{3}))(?!\d)/g, (m, pre, num, a, b, c) =>
          `+357${a}${b}${c}` === cfg.phone ? `${pre}<a href="tel:${cfg.phone}">${num}</a>` : m)
        .replace(new RegExp(esc(cfg.email).replace(/\./g, '\\.'), 'g'),
          `<a href="mailto:${cfg.email}">${cfg.email}</a>`);

    const out: string[] = [];
    let para: string[] = [];
    let list: string[] = [];
    const flushPara = () => { if (para.length) { out.push(`<p>${para.join('<br>')}</p>`); para = []; } };
    const flushList = () => { if (list.length) { out.push(`<ul>${list.map((l) => `<li>${l}</li>`).join('')}</ul>`); list = []; } };

    for (const line of text.split('\n')) {
      const bullet = line.match(/^\s*(?:[-*•]|\d+[.)])\s+(.*)$/);
      const heading = line.match(/^\s*#{1,6}\s+(.*)$/);
      if (!line.trim()) { flushPara(); flushList(); continue; }
      if (bullet) { flushPara(); list.push(inline(bullet[1])); continue; }
      flushList();
      para.push(heading ? `<strong>${inline(heading[1])}</strong>` : inline(line));
    }
    flushPara();
    flushList();
    return out.join('');
  }

  function actionHtml(a: Action): string {
    const base =
      'inline-flex min-h-[44px] items-center gap-2 rounded-full px-4 py-2 text-[0.875rem] font-semibold transition-colors';
    switch (a.type) {
      case 'CALL':
        return `<a href="tel:${cfg.phone}" class="${base} bg-ebony-950 text-white hover:bg-ebony-800">${ICON.phone}${esc(S.actionCall)}</a>`;
      case 'WHATSAPP':
        return `<a href="https://wa.me/${cfg.whatsapp}" target="_blank" rel="noopener noreferrer" class="${base} bg-[#1f8a4c] text-white hover:bg-[#18743f]">${ICON.whatsapp}${esc(S.actionWhatsapp)}</a>`;
      case 'BOOK': {
        const url = a.slug ? `${cfg.bookUrl}?service=${a.slug}` : cfg.bookUrl;
        return `<a href="${url}" class="${base} bg-gold-600 text-white hover:bg-gold-700">${esc(S.actionBook)}${ICON.arrow}</a>`;
      }
      case 'SERVICE': {
        const svc = cfg.services[a.slug!];
        return `<a href="${svc.url}" class="${base} border border-ebony-300 bg-white text-ebony-900 hover:border-ebony-900">${esc(svc.name)}${ICON.arrow}</a>`;
      }
    }
  }

  function bubble(role: Role): { wrap: HTMLElement; body: HTMLElement; actions: HTMLElement } {
    const wrap = document.createElement('div');
    wrap.className = role === 'user' ? 'flex justify-end' : 'flex justify-start';

    const inner = document.createElement('div');
    inner.className = role === 'user' ? 'max-w-[85%]' : 'max-w-[92%]';

    const label = document.createElement('span');
    label.className = 'sr-only';
    label.textContent = `${role === 'user' ? S.you : S.assistant}: `;

    const body = document.createElement('div');
    body.className =
      role === 'user'
        ? 'chat-msg whitespace-pre-wrap break-words rounded-2xl rounded-br-md bg-ebony-900 px-4 py-2.5 text-[0.95rem] leading-relaxed text-white'
        : 'chat-msg break-words rounded-2xl rounded-bl-md bg-white px-4 py-3 text-[0.95rem] leading-relaxed text-ebony-800 shadow-sm ring-1 ring-ebony-200/70';

    const actions = document.createElement('div');
    actions.className = 'mt-2 flex flex-wrap gap-2 empty:hidden';

    inner.append(label, body, actions);
    wrap.append(inner);
    log.append(wrap);
    return { wrap, body, actions };
  }

  function renderUser(text: string) {
    bubble('user').body.textContent = text;
  }

  function renderAssistant(text: string, streaming = false) {
    const b = bubble('assistant');
    const { html, actions } = parseReply(text, streaming);
    b.body.innerHTML = html;
    if (!streaming) b.actions.innerHTML = actions.map(actionHtml).join('');
    return b;
  }

  function renderNotice(message: string, actions: Action[] = []) {
    const b = bubble('assistant');
    b.body.innerHTML = `<p>${esc(message)}</p>`;
    b.actions.innerHTML = actions.map(actionHtml).join('');
    stickToBottom(true);
  }

  function renderWelcome() {
    const b = bubble('assistant');
    b.body.innerHTML = `<p>${esc(S.welcome)}</p>`;
    // Starter questions only for a fresh conversation.
    if (history.length) return;

    const chips = document.createElement('div');
    chips.className = 'flex flex-wrap gap-2 pt-1';
    chips.dataset.chatChips = '';
    for (const q of cfg.suggestions) {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className =
        'min-h-[40px] rounded-full border border-gold-500/50 bg-gold-50 px-3.5 py-2 text-left text-[0.85rem] font-medium text-gold-800 transition-colors hover:border-gold-600 hover:bg-gold-100';
      chip.textContent = q;
      chip.addEventListener('click', () => submit(q));
      chips.append(chip);
    }
    log.append(chips);
  }

  function renderAll() {
    log.innerHTML = '';
    renderWelcome();
    for (const m of history) {
      if (m.role === 'user') renderUser(m.content);
      else renderAssistant(m.content);
    }
    stickToBottom(true);
  }

  function typing(): HTMLElement {
    const b = bubble('assistant');
    b.body.innerHTML =
      `<span class="sr-only">${esc(S.thinking)}</span>` +
      '<span class="inline-flex items-center gap-1 py-1" aria-hidden="true">' +
      '<span class="chat-dot h-2 w-2 rounded-full bg-ebony-400"></span>' +
      '<span class="chat-dot h-2 w-2 rounded-full bg-ebony-400"></span>' +
      '<span class="chat-dot h-2 w-2 rounded-full bg-ebony-400"></span></span>';
    return b.wrap;
  }

  function nearBottom() {
    return log.scrollHeight - log.scrollTop - log.clientHeight < 90;
  }
  function stickToBottom(force = false) {
    if (force || nearBottom()) log.scrollTop = log.scrollHeight;
  }

  /* ---------- sending ---------- */

  /** What the Worker sees: recent turns only, oldest dropped first. */
  function payload(): Msg[] {
    const out = history.slice(-MAX_HISTORY).map((m) =>
      m.role === 'assistant' && m.content.length > MAX_ASSISTANT_CHARS
        ? { ...m, content: `${m.content.slice(0, MAX_ASSISTANT_CHARS)}…` }
        : m,
    );
    let total = out.reduce((n, m) => n + m.content.length, 0);
    while (out.length > 1 && total > MAX_HISTORY_CHARS) total -= out.shift()!.content.length;
    while (out.length > 1 && out[0].role !== 'user') out.shift();
    return out;
  }

  /** The daily allowance resets at 00:00 UTC; say when that is in Cyprus. */
  function resetTime(): string {
    const now = new Date();
    const reset = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1));
    return new Intl.DateTimeFormat(cfg.locale === 'el' ? 'el-GR' : 'en-GB', {
      timeZone: 'Asia/Nicosia', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
    }).format(reset);
  }

  async function submit(raw: string) {
    const text = raw.trim();
    if (!text || busy) return;
    if (text.length > MAX_INPUT) {
      renderNotice(S.tooLong);
      return;
    }
    if (history.filter((m) => m.role === 'user').length >= MAX_USER_TURNS) {
      renderNotice(S.limit, [{ type: 'CALL' }, { type: 'WHATSAPP' }, { type: 'BOOK' }]);
      return;
    }

    // Removing a focused chip would drop focus to <body>; move it first.
    const chips = root.querySelector('[data-chat-chips]');
    if (chips?.contains(document.activeElement)) (coarse.matches ? log : input).focus({ preventScroll: true });
    chips?.remove();
    renderUser(text);
    history.push({ role: 'user', content: text });
    save();
    input.value = '';
    autosize();
    stickToBottom(true);

    busy = true;
    // A disabled button loses focus to <body>; keep it in the conversation.
    if (document.activeElement === sendBtn) input.focus({ preventScroll: true });
    sendBtn.disabled = true;
    log.setAttribute('aria-busy', 'true');

    const dots = typing();
    stickToBottom(true);

    let reply = '';
    let view: ReturnType<typeof bubble> | null = null;
    let frame = 0;
    const paint = () => {
      frame = 0;
      if (!view) {
        dots.remove();
        view = bubble('assistant');
      }
      const follow = nearBottom();
      view.body.innerHTML = parseReply(reply, true).html;
      if (follow) stickToBottom(true);
    };

    try {
      controller = new AbortController();
      await stream(payload(), (delta) => {
        reply += delta;
        if (!frame) frame = requestAnimationFrame(paint);
      }, controller.signal);

      if (frame) cancelAnimationFrame(frame);
      if (!reply.trim()) throw new ChatError('upstream');

      paint();
      // Decide before the buttons add height, or they'd land just out of view.
      const follow = nearBottom();
      const { html, actions } = parseReply(reply, false);
      view!.body.innerHTML = html;
      view!.actions.innerHTML = actions.map(actionHtml).join('');
      history.push({ role: 'assistant', content: reply.trim() });
      save();
      if (follow) stickToBottom(true);
    } catch (err) {
      if (frame) cancelAnimationFrame(frame);
      dots.remove();
      // A half-written reply is dropped rather than left looking complete.
      (view as ReturnType<typeof bubble> | null)?.wrap.remove();
      // The failed question stays visible but is not resent as context.
      history.pop();
      save();

      if ((err as Error)?.name === 'AbortError') return;
      const kind = err instanceof ChatError ? err.kind : 'network';
      const contact: Action[] = [{ type: 'CALL' }, { type: 'WHATSAPP' }, { type: 'BOOK' }];
      if (kind === 'rate') renderNotice(S.rate);
      else if (kind === 'quota') renderNotice(S.quota.replace('{time}', resetTime()), contact);
      else if (kind === 'daily') renderNotice(S.daily.replace('{time}', resetTime()), contact);
      else renderNotice(S.error, [{ type: 'CALL' }, { type: 'WHATSAPP' }]);
    } finally {
      busy = false;
      controller = null;
      sendBtn.disabled = !input.value.trim();
      log.setAttribute('aria-busy', 'false');
    }
  }

  async function stream(messages: Msg[], onDelta: (t: string) => void, signal: AbortSignal) {
    let firstToken = false;
    const timer = setTimeout(() => {
      if (!firstToken) controller?.abort(new ChatError('upstream'));
    }, FIRST_TOKEN_TIMEOUT);

    try {
      let res: Response;
      try {
        res = await fetch(cfg.endpoint, {
          method: 'POST',
          // text/plain keeps this a "simple" cross-origin request: no CORS
          // preflight, so the first reply starts one round trip sooner.
          headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
          // The route this page was built for — never the address bar, which
          // on the 404 page could be any text a link author chose.
          body: JSON.stringify({ messages, locale: cfg.locale, page: cfg.page }),
          signal,
        });
      } catch (e) {
        if (signal.reason instanceof ChatError) throw signal.reason;
        throw (e as Error)?.name === 'AbortError' ? e : new ChatError('network');
      }

      if (!res.ok || !res.body) {
        const data = await res.json().catch(() => ({} as { error?: string }));
        const kind = data.error ?? (res.status === 429 ? 'rate' : 'upstream');
        throw new ChatError(['rate', 'daily', 'quota', 'invalid'].includes(kind) ? kind : 'upstream');
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      for (;;) {
        let chunk: ReadableStreamReadResult<Uint8Array>;
        try {
          chunk = await reader.read();
        } catch (e) {
          if (signal.reason instanceof ChatError) throw signal.reason;
          throw e;
        }
        if (chunk.done) break;
        buffer += decoder.decode(chunk.value, { stream: true });

        let cut: number;
        while ((cut = buffer.indexOf('\n\n')) !== -1) {
          const event = buffer.slice(0, cut);
          buffer = buffer.slice(cut + 2);
          for (const line of event.split('\n')) {
            if (!line.startsWith('data:')) continue;
            const payload = line.slice(5).trim();
            if (!payload) continue;
            let data: { t?: string; done?: boolean; error?: string };
            try { data = JSON.parse(payload); } catch { continue; }
            if (data.error) {
              throw new ChatError(['rate', 'daily', 'quota', 'invalid'].includes(data.error)
                ? (data.error as 'rate' | 'daily' | 'quota' | 'invalid') : 'upstream');
            }
            if (typeof data.t === 'string' && data.t) {
              firstToken = true;
              onDelta(data.t);
            }
            if (data.done) return;
          }
        }
      }
    } finally {
      clearTimeout(timer);
    }
  }

  /* ---------- input ---------- */

  function autosize() {
    input.style.height = 'auto';
    input.style.height = `${Math.min(input.scrollHeight, 128)}px`;
  }

  input.addEventListener('input', () => {
    autosize();
    sendBtn.disabled = busy || !input.value.trim();
  });
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) {
      e.preventDefault();
      submit(input.value);
    }
  });
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    submit(input.value);
  });
  sendBtn.disabled = true;

  restartBtn.addEventListener('click', () => {
    controller?.abort();
    history = [];
    save();
    renderAll();
    input.focus();
  });

  /* ---------- open / close, focus, mobile ---------- */

  // Mobile keyboards overlay the page rather than resizing it. Keep the
  // panel inside the visible viewport so the input is never hidden: full
  // screen on phones, lifted above the keyboard on tablets and desktops.
  const vv = window.visualViewport;
  function fitViewport() {
    const reset = () => {
      panel.style.height = '';
      panel.style.top = '';
      panel.style.bottom = '';
      panel.style.maxHeight = '';
    };
    if (!vv || root.dataset.state !== 'open') return reset();
    reset();
    if (small.matches) {
      panel.style.height = `${vv.height}px`;
      panel.style.top = `${vv.offsetTop}px`;
    } else {
      const keyboard = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
      if (keyboard > 0) {
        panel.style.bottom = `calc(1.5rem + ${keyboard}px)`;
        panel.style.maxHeight = `${Math.max(240, vv.height - 48)}px`;
      }
    }
    stickToBottom();
  }
  vv?.addEventListener('resize', fitViewport);
  vv?.addEventListener('scroll', fitViewport);

  const lockPage = (on: boolean) => {
    // Its own flag, so closing the chat never releases the header menu's lock.
    if (on) document.documentElement.dataset.lockChat = '';
    else delete document.documentElement.dataset.lockChat;
  };

  // Listens on the document while open, so Escape and the focus trap still
  // work if focus has ended up on <body> (e.g. after a clicked chip is removed).
  // Beside the page (not full screen), Escape belongs to the chat only when
  // the chat has focus; anything else (the header menu) handles its own.
  function onKey(e: KeyboardEvent) {
    if (e.defaultPrevented) return;
    const active = document.activeElement;
    const ours = small.matches || !active || active === document.body || panel.contains(active);
    if (e.key === 'Escape') {
      if (!ours) return;
      e.preventDefault();
      close();
      return;
    }
    if (e.key !== 'Tab' || !small.matches) return;
    const f = [...panel.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], textarea')]
      .filter((el) => el.offsetParent !== null);
    if (!f.length) return;
    const first = f[0];
    const last = f[f.length - 1];
    const outside = !active || !panel.contains(active) || active === title;
    if (e.shiftKey && (outside || active === first)) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && (outside || active === last)) { e.preventDefault(); first.focus(); }
  }

  function open() {
    if (!log.childElementCount) renderAll();
    root.dataset.state = 'open';
    panel.hidden = false;
    panel.dataset.anim = 'in';
    launcher.setAttribute('aria-expanded', 'true');
    // Visually hidden while open; keep it out of the tab order too.
    launcher.inert = true;
    panel.setAttribute('aria-modal', small.matches ? 'true' : 'false');
    lockPage(small.matches);
    fitViewport();
    stickToBottom(true);

    // On touch screens, don't throw the keyboard up before they've read anything.
    if (coarse.matches) {
      title.setAttribute('tabindex', '-1');
      title.focus({ preventScroll: true });
    } else {
      input.focus({ preventScroll: true });
    }
    document.addEventListener('keydown', onKey);
  }

  function close() {
    root.dataset.state = 'closed';
    panel.hidden = true;
    panel.removeAttribute('data-anim');
    launcher.setAttribute('aria-expanded', 'false');
    launcher.inert = false;
    lockPage(false);
    fitViewport();
    document.removeEventListener('keydown', onKey);
    launcher.focus({ preventScroll: true });
  }

  closeBtn.addEventListener('click', close);
  small.addEventListener('change', () => {
    if (root.dataset.state !== 'open') return;
    panel.setAttribute('aria-modal', small.matches ? 'true' : 'false');
    lockPage(small.matches);
    fitViewport();
  });

  return { open, close };
}
