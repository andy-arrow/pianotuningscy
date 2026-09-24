// Runs the question set against one or more Workers AI models with EXACTLY the
// production system prompt and parameters (src/prompt.ts), and writes every
// answer with its latency and Neuron cost to a JSON file for review.
//
//   node test/eval.mjs --models @cf/google/gemma-4-26b-a4b-it,... \
//     [--knowledge https://pianotuningscy.com/chat-knowledge.json] \
//     [--only id1,id2] [--out results.json]
//
// Uses your local `wrangler login` token (never stored in this repo). Every
// call spends Neurons from the account's free daily allowance.
import { readFileSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { params, replyLanguage, strayScriptPattern, systemPrompt } from '../src/prompt.ts';

const here = dirname(fileURLToPath(import.meta.url));
const arg = (name, fallback) => {
  const i = process.argv.indexOf(`--${name}`);
  return i === -1 ? fallback : process.argv[i + 1];
};

const models = arg('models', '@cf/google/gemma-4-26b-a4b-it').split(',');
const knowledgeUrl = arg('knowledge', 'https://pianotuningscy.com/chat-knowledge.json');
const only = arg('only', '');
const out = arg('out', join(here, 'eval-results.json'));
const account = arg('account', '5197878398d276dff4eee2b486a62bd8');

const cfg = readFileSync(join(homedir(), 'Library/Preferences/.wrangler/config/default.toml'), 'utf8');
const token = cfg.match(/^oauth_token\s*=\s*"([^"]+)"/m)?.[1];
if (!token) throw new Error('Run `npx wrangler login` first.');

const k = await (await fetch(knowledgeUrl)).json();
const knowledgeFor = (lang) => ({ text: lang === 'el' ? (k.knowledgeEl ?? k.knowledge) : k.knowledge, slugs: k.serviceSlugs });

let questions = JSON.parse(readFileSync(join(here, 'questions.json'), 'utf8'));
if (only) questions = questions.filter((q) => only.split(',').includes(q.id));

async function ask(model, q) {
  const body = {
    messages: [
      { role: 'system', content: systemPrompt(knowledgeFor(replyLanguage(q.q, q.locale)), q.locale, q.page, replyLanguage(q.q, q.locale)) },
      ...(q.history ?? []),
      { role: 'user', content: q.q },
    ],
    ...params(model),
  };
  const t = Date.now();
  const res = await fetch(`https://api.cloudflare.com/client/v4/accounts/${account}/ai/run/${model}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  const r = data.result ?? {};
  const choice = r.choices?.[0] ?? {};
  const msg = choice.message ?? {};
  return {
    id: q.id, model,
    ok: res.ok && !!(msg.content || r.response),
    http: res.status,
    error: res.ok ? undefined : JSON.stringify(data.errors ?? data).slice(0, 300),
    // Same clean-up the Worker applies before a visitor sees it.
    answer: (msg.content ?? r.response ?? '').replace(strayScriptPattern(q.q), ''),
    finish: choice.finish_reason,
    reasoningChars: (msg.reasoning_content ?? '').length,
    seconds: (Date.now() - t) / 1000,
    promptTokens: r.usage?.prompt_tokens,
    completionTokens: r.usage?.completion_tokens,
    neurons: r.usage?.neurons,
  };
}

const results = [];
for (const q of questions) {
  // Models side by side per question, so a mid-run failure still leaves
  // comparable pairs.
  const row = await Promise.all(models.map((m) => ask(m, q)));
  for (const r of row) {
    results.push(r);
    const n = r.neurons != null ? r.neurons.toFixed(1) : '?';
    console.log(`${r.ok ? 'ok ' : 'ERR'} ${q.id.padEnd(22)} ${r.model.split('/').pop().padEnd(34)} ${r.seconds.toFixed(1)}s ${n}N`);
  }
}

writeFileSync(out, JSON.stringify({ knowledgeUrl, models, results }, null, 2));
const by = Object.groupBy(results, (r) => r.model);
for (const [m, rs] of Object.entries(by)) {
  const n = rs.reduce((s, r) => s + (r.neurons ?? 0), 0);
  const secs = rs.map((r) => r.seconds).sort((a, b) => a - b);
  console.log(`\n${m}: ${rs.filter((r) => r.ok).length}/${rs.length} answered, ` +
    `${(n / rs.length).toFixed(1)} Neurons/answer (≈${Math.floor(10000 / (n / rs.length))}/day), ` +
    `median ${secs[Math.floor(secs.length / 2)].toFixed(1)}s`);
}
console.log(`\nWritten to ${out}`);
