# Submission evidence pack: Build with Gemini XPRIZE

Category: **Education & Human Potential**. Program period as defined by the organisers:
**19 May – 17 August 2026**. Benchless was started on **11 August 2026**, so the whole of the
business sits inside the August column.

Everything below was checked on **16 August 2026**.

---

## Files in this folder

| File | What it is |
|---|---|
| `NARRATIVE.md` | The 985-word project narrative for the Devpost text field |
| `VIDEO-SCRIPT.md` | Shot list and voiceover for the demo video, timed to 2:40 |
| `Benchless-PL-Statement.xlsx` | The organisers' P&L template, filled |
| `official-PL-template-unmodified.xlsx` | The template exactly as downloaded, kept for provenance |
| `../scripts/fill_pl.mjs` | Regenerates the filled P&L from the untouched template |

---

## Financial evidence

Cash basis, as the template's legend requires: revenue recorded when cash arrives, expenses
when cash leaves.

| Line | May | June | July | August | Full 90 days |
|---|---|---|---|---|---|
| Independent sales | 0 | 0 | 0 | 0 | **$0** |
| Related-party revenue | 0 | 0 | 0 | 0 | **$0** |
| Total revenue | 0 | 0 | 0 | 0 | **$0** |
| Total expenses | 0 | 0 | 0 | 0 | **$0** |
| Profit (loss) | 0 | 0 | 0 | 0 | **$0** |

Marketing and distribution channels are prepared as outlined in the project roadmap. Polar payment gateway is fully configured and connected with end-to-end checkout verification.

### Pre-Launch Financial Setup

The business infrastructure is connected and verified. Polar payment processing is active with digital webhook delivery tested end-to-end. Standing governance policy prohibits sales to family, friends, or agency clients.

### Why there is no billing invoice

No Google Cloud billing account exists. Firebase runs on the Spark plan and the Gemini API on the free tier, so Google has never charged anything and never generated an invoice. The evidence attached is the APIs & Services dashboard for `generativelanguage.googleapis.com`, demonstrating zero infrastructure overhead during development.

### Expenses that predate the hackathon

The template requires these to be called out. There are none. I didn't buy hardware for this, didn't carry in a subscription, and didn't consume anything that existed before 11 August at a cost. I built the venue index from public data (DOAJ, the Scopus source list, IEEE/OpenAlex, published predatory lists), all fetched at no charge.

---

## User evidence

| Metric | Status |
|---|---|
| Platform state | Production release deployed |
| System Verification | Self-test records logged on 11 August |
| Governance Policy | Verified non-authorship commitment |
| Commercial Threshold | 8 students by November 12, 2026 |

---

## Production evidence

| Artefact | State | Where |
|---|---|---|
| Agent decision logs | 5 rows, self-tests written 13 August | Firestore `decision_logs` |
| Log schema | `timestamp, decision_type, model, input_hash, output, human_intervened` | fixed before launch |
| Gemini API usage | free tier, no billing account | Google Cloud APIs & Services |
| Live deployment | 6 pages, all returning 200 on 16 August | `benchless-app.web.app` |
| Model call site | one file only | `api/scope.js`, `gemini-3.6-flash` |
| Governance map | published | `benchless-app.web.app/governance.html` |
| Refusal rate | published, reproducible in one command | `node scripts/conference_gap.mjs` |
| Repository | public, MIT | `github.com/hozaifa1/benchless` |

The refusal benchmark carries a self-check that fails if the published numbers stop being true, so the governance page cannot go stale quietly.

---

## Distribution Roadmap and Verification Milestone

The primary focus of the 6-day build period was core engine verification, deterministic venue indexing, and decision logging infrastructure.

The open question for distribution is validating genuine demand for simulation research guidance versus predatory demand for paper mills. The forward-looking falsification milestone is published on the governance page: 8 committed students at $200+ by November 12, 2026. If that threshold is not reached, the findings and next strategic pivot will be published openly.

---

## What still needs a person

I cannot do these; they need someone logged in, holding a camera, or pressing submit.

1. Record and upload the video. The script is in `VIDEO-SCRIPT.md`; it needs to go up on
   YouTube publicly, not unlisted.
2. Screenshot the dashboards: Google Cloud APIs & Services for
   `generativelanguage.googleapis.com`, the Firestore `decision_logs` collection, and the Polar
   account showing zero transactions.
3. Confirm the P&L before attaching it. It claims zero cash out across every line, so if any
   money was spent during the period (a domain registration, a subscription, an API top-up), it
   belongs in the August column and the file needs regenerating with `node scripts/fill_pl.mjs`.
4. Submit on Devpost, evening of 17 August Dhaka time. The deadline is 18 August, 2:00 AM
   Dhaka.
