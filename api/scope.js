// Gemini proxy. Exists so the API key stays server-side: the app is static on Firebase
// Hosting, the repo is public, and a key shipped to the browser would be in both.
// This is the ONLY place a model is consulted. Venue legitimacy is decided by
// public/js/venue-core.mjs and never here.
const MODEL = 'gemini-3.6-flash';
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

const ALLOWED_ORIGINS = [
  'https://benchless-app.web.app',
  'https://benchless-app.firebaseapp.com',
  'http://localhost:5000'
];

const SCHEMA = {
  type: 'object',
  properties: {
    proposals: {
      type: 'array',
      minItems: 3,
      maxItems: 3,
      items: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          question: { type: 'string', description: 'The single question the study answers.' },
          whyNovel: { type: 'string', description: 'What is already published, and what this adds.' },
          method: { type: 'string', description: 'Concrete simulation steps in the stated software.' },
          runnableOn: { type: 'string', description: 'Why this fits the stated hardware and software.' },
          weeksEstimate: { type: 'integer' },
          riskItFails: { type: 'string', description: 'The most likely reason this study does not work out.' }
        },
        required: ['title', 'question', 'whyNovel', 'method', 'runnableOn', 'weeksEstimate', 'riskItFails']
      }
    }
  },
  required: ['proposals']
};

const SYSTEM = `You propose simulation-based research studies for students who have no lab access.

Hard rules:
- Every proposal must be runnable with ONLY the software and hardware the student states. If a proposal needs equipment or a licence they did not list, do not propose it.
- Size each study to the weeks available. A study that cannot finish in that window is a failed proposal, not an ambitious one.
- You are proposing a study. You never write the paper, and you never say a venue is legitimate. Venue legitimacy is decided elsewhere by database lookup, not by you.
- If the field is too vague to scope honestly, say so inside whyNovel rather than inventing specifics.`;

const MAX_LEN = 2000;
const clean = (v, fallback = '') => String(v ?? fallback).slice(0, MAX_LEN);

module.exports = async (req, res) => {
  const origin = req.headers.origin;
  if (ALLOWED_ORIGINS.includes(origin)) res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  const key = process.env.GEMINI_API_KEY;
  if (!key) return res.status(500).json({ error: 'Scoping is not configured on the server.' });

  const body = typeof req.body === 'string' ? safeParse(req.body) : req.body || {};
  const field = clean(body.field).trim();
  if (field.length < 3) return res.status(400).json({ error: 'Tell us your field first.' });

  const weeks = Math.min(52, Math.max(1, Number(body.weeks) || 12));
  const prompt =
    `Field: ${field}\n` +
    `Background: ${clean(body.background, 'undergraduate')}\n` +
    `Software available: ${clean(body.software, 'unspecified')}\n` +
    `Weeks available: ${weeks}`;

  try {
    const r = await fetch(`${ENDPOINT}?key=${key}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM }] },
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: 'application/json', responseSchema: SCHEMA, temperature: 0.7 }
      })
    });

    if (!r.ok) {
      // Never leak the upstream body: it can echo the key back in error envelopes.
      console.error('gemini upstream', r.status, (await r.text()).slice(0, 300));
      return res.status(502).json({ error: 'The scoping model did not answer. Try again in a moment.' });
    }

    const data = await r.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) return res.status(502).json({ error: 'The scoping model returned nothing usable.' });

    const parsed = safeParse(text);
    if (!parsed?.proposals?.length) return res.status(502).json({ error: 'The scoping model returned nothing usable.' });

    // Enforce the week budget in code rather than trusting the model to respect its own prompt.
    const proposals = parsed.proposals.filter(p => Number(p.weeksEstimate) <= weeks);

    return res.status(200).json({
      model: MODEL,
      decisionType: 'study_scoping',
      weeksBudget: weeks,
      droppedOverBudget: parsed.proposals.length - proposals.length,
      proposals
    });
  } catch (e) {
    console.error('scope handler', e);
    return res.status(502).json({ error: 'Scoping failed. Try again in a moment.' });
  }
};

function safeParse(s) {
  try { return JSON.parse(s); } catch { return null; }
}
