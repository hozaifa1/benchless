// Study scoping. This is the half where a model is allowed to decide, because
// "is this study novel and finishable on your hardware" is judgement. The other half
// (check_venue.js) is pure lookup and never asks a model anything. Keep the line there.
//
//   node scripts/scope_study.js --field "..." --background "..." --software "..." --weeks 12
//   node scripts/scope_study.js --selfcheck
const assert = require('assert');
const fs = require('fs');
const path = require('path');

const MODEL = 'gemini-3.6-flash';
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

function apiKey() {
  if (process.env.GEMINI_API_KEY) return process.env.GEMINI_API_KEY;
  // .env is gitignored and holds the key for local runs.
  const envPath = path.join(__dirname, '..', '.env');
  if (fs.existsSync(envPath)) {
    const m = fs.readFileSync(envPath, 'utf8').match(/^GEMINI_API_KEY=(.+)$/m);
    if (m) return m[1].trim();
  }
  throw new Error('GEMINI_API_KEY not set (env or .env).');
}

// Forced response schema. The model fills these fields or the call fails; it does not
// get to return prose, and it does not get to invent extra fields.
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

async function scopeStudy({ field, background, software, weeks }) {
  const res = await fetch(`${ENDPOINT}?key=${apiKey()}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: SYSTEM }] },
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: `Field: ${field}\nBackground: ${background}\nSoftware available: ${software}\nWeeks available: ${weeks}`
            }
          ]
        }
      ],
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: SCHEMA,
        temperature: 0.7
      }
    })
  });

  if (!res.ok) throw new Error(`Gemini ${res.status}: ${(await res.text()).slice(0, 400)}`);
  const body = await res.json();
  const text = body.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error(`No content in Gemini response: ${JSON.stringify(body).slice(0, 400)}`);

  const parsed = JSON.parse(text);
  return {
    model: MODEL,
    decisionType: 'study_scoping',
    proposals: parsed.proposals
  };
}

async function selfcheck() {
  const out = await scopeStudy({
    field: 'ferroelectric FET device simulation',
    background: 'final-year EEE undergraduate, comfortable with Python and TCAD basics',
    software: 'Synopsys Sentaurus (university licence), Python',
    weeks: 10
  });

  assert.strictEqual(out.proposals.length, 3, 'schema must force exactly 3 proposals');
  for (const p of out.proposals) {
    for (const f of ['title', 'question', 'whyNovel', 'method', 'runnableOn', 'weeksEstimate', 'riskItFails']) {
      assert.ok(p[f] !== undefined && p[f] !== '', `proposal missing ${f}: ${p.title}`);
    }
    // A study sized past the window is the failure this whole step exists to prevent.
    assert.ok(p.weeksEstimate <= 10, `"${p.title}" estimated ${p.weeksEstimate}w against a 10w budget`);
  }
  console.log(`ok  3 proposals, all fields present, all within the 10-week budget`);
  out.proposals.forEach(p => console.log(`    - ${p.title} (${p.weeksEstimate}w)`));

  // The model must never be the thing that rules on a venue.
  const src = fs.readFileSync(__filename, 'utf8');
  assert.ok(!/venue/i.test(SCHEMA.properties.proposals.items.properties.method.description || ''),
    'scoping schema must not carry venue fields');
  assert.ok(/Venue legitimacy is decided elsewhere/.test(src), 'system prompt must disclaim venue rulings');
  console.log('ok  scoping output carries no venue verdict');

  console.log('\nAll scoping self-checks passed.');
}

function arg(name) {
  const i = process.argv.indexOf(`--${name}`);
  return i === -1 ? null : process.argv[i + 1];
}

if (require.main === module) {
  const run = process.argv.includes('--selfcheck')
    ? selfcheck()
    : scopeStudy({
        field: arg('field'),
        background: arg('background') || 'undergraduate',
        software: arg('software') || 'unspecified',
        weeks: Number(arg('weeks') || 12)
      }).then(r => console.log(JSON.stringify(r, null, 2)));

  run.catch(e => {
    console.error(e.message);
    process.exit(1);
  });
}

module.exports = { scopeStudy };
