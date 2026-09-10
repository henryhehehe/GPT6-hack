import { loadEnvFile } from 'node:process';
loadEnvFile('.env.local');
if (!process.env.OPENAI_API_KEY) throw new Error('OPENAI_API_KEY is empty');
const started = Date.now();
const response = await fetch('https://api.openai.com/v1/responses', {
  method: 'POST', headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({ model: process.env.OPENAI_MODEL || 'gpt-6-astra', reasoning: { effort: 'low' }, input: 'Reply exactly: Counterfactual Worlds ready', max_output_tokens: 128 }),
  signal: AbortSignal.timeout(60000),
});
const data = await response.json();
console.log(JSON.stringify({ ok: response.ok, status: response.status, model: data.model, responseId: data.id, latencyMs: Date.now()-started, error: data.error?.code, message: data.error?.message, text: data.output?.flatMap(i=>i.content??[]).filter(c=>c.type==='output_text').map(c=>c.text).join('') }, null, 2));
if (!response.ok) process.exitCode = 1;
