/**
 * Text handling for the chat widget, kept free of the DOM so it can be tested
 * in Node (chat-worker/test/smoke.mjs).
 */

export type ChatErrorKind = 'rate' | 'daily' | 'quota' | 'invalid' | 'upstream';

/**
 * One server-sent event → text, end of stream, or an error. Reads the
 * Worker's own events ({t} / {done} / {error: kind}) and every shape Workers
 * AI streams: OpenAI-style chat deltas, legacy {response}, completions
 * {choices[].text}, Responses API events. Reasoning text is ignored.
 */
export function parseEvent(payload: string): { text?: string; done?: boolean; error?: ChatErrorKind } {
  if (payload === '[DONE]') return { done: true };
  let d: Record<string, any>;
  try { d = JSON.parse(payload); } catch { return {}; }
  if (typeof d.error === 'string') {
    return { error: (['rate', 'daily', 'quota', 'invalid'].includes(d.error) ? d.error : 'upstream') as ChatErrorKind };
  }
  if (d.error || d.type === 'error' || d.type === 'response.failed') return { error: 'upstream' };
  if (d.done || d.type === 'response.completed' || d.type === 'response.done') return { done: true };
  if (typeof d.t === 'string') return { text: d.t };
  if (typeof d.response === 'string') return { text: d.response };
  if (typeof d.choices?.[0]?.delta?.content === 'string') return { text: d.choices[0].delta.content };
  if (typeof d.choices?.[0]?.text === 'string') return { text: d.choices[0].text };
  if (d.type === 'response.output_text.delta' && typeof d.delta === 'string') return { text: d.delta };
  return {};
}

/**
 * Small models occasionally emit a stray glyph from an unrelated writing
 * system mid-word (seen live: Devanagari inside «Καλησπέρα»). Latin, Greek,
 * punctuation, symbols and emoji are always kept; another script only if the
 * conversation already uses it, so a Russian question keeps a Russian answer.
 */
const ALWAYS =
  '\\u0000-\\u036F\\u0370-\\u03FF\\u1F00-\\u1FFF\\u1D00-\\u1EFF\\u2000-\\u2BFF\\u2E00-\\u2E7F\\uFE00-\\uFE0F\\uD800-\\uDFFF';
const OTHER_SCRIPTS: Record<string, string> = {
  Cyrillic: '\\u0400-\\u052F', Armenian: '\\u0530-\\u058F', Hebrew: '\\u0590-\\u05FF',
  Arabic: '\\u0600-\\u06FF\\u0750-\\u077F', Indic: '\\u0900-\\u0DFF', Thai: '\\u0E00-\\u0E7F',
  Georgian: '\\u10A0-\\u10FF', CJK: '\\u3000-\\u30FF\\u3400-\\u4DBF\\u4E00-\\u9FFF\\uFF00-\\uFFEF',
  Hangul: '\\u1100-\\u11FF\\uAC00-\\uD7AF',
};
export function strayPattern(conversation: string): RegExp {
  const used = Object.entries(OTHER_SCRIPTS).filter(([, r]) => new RegExp(`[${r}]`).test(conversation)).map(([, r]) => r);
  return new RegExp(`[^${ALWAYS}${used.join('')}]`, 'g');
}
/** The model's one recurring slip, repaired rather than just stripped. */
const GREETING_GLITCH = /Καλ[\u0900-\u0DFF]+(?:σ?(π)έρα|μ?έρα)/g;
export function cleanGlyphs(text: string, stray: RegExp): string {
  return text
    .replace(GREETING_GLITCH, (_m, p?: string) => (p ? 'Καλησπέρα' : 'Καλημέρα'))
    .replace(stray, '');
}

