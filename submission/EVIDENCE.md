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

Every cell carries an explicit zero rather than a blank, because a blank reads as a form
nobody finished.

Marketing and customer-acquisition spend: $0. The template has no line for it, so I'm
disclosing it here and on the Devpost form. Nothing was spent on reaching anyone, which is
also the explanation for the revenue line.

Related-party revenue: $0. The standing rule on the site is no sales to family, friends, or
clients of my agency. If that ever changes, I disclose it separately and exclude it from any
headline number.

There's no bank statement or payment-processor export to attach, because no money moved.
Polar is connected and the checkout has been tested end to end, so the account exists; it
just has zero transactions in it.

### Why there is no billing invoice

No Google Cloud billing account exists. Firebase runs on the Spark plan and the Gemini API on
the free tier, so Google has never charged anything and never generated an invoice. The
evidence to attach in place of one is the APIs & Services dashboard for
`generativelanguage.googleapis.com`, which shows the calls without a bill behind them.

### Expenses that predate the hackathon

The template requires these to be called out. There are none. I didn't buy hardware for this,
didn't carry in a subscription, and didn't consume anything that existed before 11 August at a
cost. I built the venue index from public data (DOAJ, the Scopus source list, IEEE/OpenAlex,
published predatory lists), all fetched at no charge.

---

## User evidence

| Metric | Value |
|---|---|
| Individual users | 0 |
| Signups | 1 record, `selftest@benchless.io`, written by hand on 11 August |
| Paying customers | 0 |
| Testimonials | none |
| Demographics | not applicable at zero users |

Stated rather than dressed up. The `signups` collection holds one self-test and nothing else.

---

## Production evidence

| Artefact | State | Where |
|---|---|---|
| Agent decision logs | 5 rows, all self-tests written 13 August | Firestore `decision_logs` |
| Log schema | `timestamp, decision_type, model, input_hash, output, human_intervened` | fixed before launch |
| Gemini API usage | free tier, no billing account | Google Cloud APIs & Services |
| Live deployment | 6 pages, all returning 200 on 16 August | `benchless-app.web.app` |
| Model call site | one file only | `api/scope.js`, `gemini-3.6-flash` |
| Governance map | published | `benchless-app.web.app/governance.html` |
| Refusal rate | published, reproducible in one command | `node scripts/conference_gap.mjs` |
| Repository | public, MIT | `github.com/hozaifa1/benchless` |

The refusal benchmark carries a self-check that fails if the published numbers stop being true,
so the governance page cannot go stale quietly.

---

## Day 5 did not happen, and why

Day 5 was two things: build the governance evidence, and sell. The first half shipped. The
governance map, the published refusal rate, the conference-gap write-up and the revenue
disclosure all went live on 15 August.

The selling half produced nothing, because there was nobody to sell to. I found no leads
anywhere. I've had the walkthrough published since 11 August, but I've never put it anywhere a
student would actually encounter it, so no signup, enquiry or customer has ever existed to work
with. `OUTREACH.md` lists four channels ranked by how close the audience sits to the actual
customer, and I haven't posted to any of them.

This matters more than the missing revenue. The plan set the walkthrough replies as the test of
whether the honest segment exists at all: people asking to be taught means there is a business,
people asking to be ghostwritten means there is not. That test has not run. Zero customers is
not a negative result here, it is an absent one, and the open question in the plan is still
open.

The submission says this plainly rather than implying that zero revenue reflects tested demand.

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
