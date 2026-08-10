# Build with Gemini XPRIZE — Execution Plan

**Deadline: Aug 17 2026, 1:00 PM PDT = Aug 18, 2:00 AM Dhaka.** Submit Aug 17 evening Dhaka.
Category: **Professional Services Access** — *"Connecting everyday people with the expert guidance they need."*
Panel score after 5 adversarial rounds: **21/30** (BV 7 / AI-Native 7 / Category Impact 7 — all conditional on delivered evidence).

---

## THE PRODUCT — "AdmitUntil" (working name)

**A free, cited exposure check for F-1/J-1 students against the new fixed-admission rule. Paid fix.**

DHS published the final rule ending **Duration of Status** on **17 Jul 2026**, effective **15 Sep 2026**.
Admission becomes a fixed I-94 "admit until" date (max 4 years); post-completion grace drops **60 → 30
days**; extensions now require **Form I-539 + $420 online / $470 mail + biometrics**. Advisers are
telling affected students to act **before Sep 15**, practical cutoff ~**Aug 15**.

Student uploads **I-20 / DS-2019 + I-94 + EAD** → deterministic engine computes:
- exact admit-until date under the transition rule
- whether an I-539 is required, and by when
- a live day-counter
- document checklist + a DSO email draft

Paid ($29–49 via Polar, or ৳ via bKash): the **fix** — the prepared I-539 document set, the dated
action plan, the re-check.
Paid (small monthly): **Rule Watch** — term monitor, re-evaluates the stored file on a clock.

### Why this and not the UK-student-visa version
Nothing just changed in UK student rules. With zero ad spend and no cold outreach, *nothing just
changed* means **no inbound**. This rule is **24 days old** — nobody who registered for this
hackathon before mid-July could be building it, and no consultant has the failure data yet.

### The six non-negotiables (architecture, not preference)
1. **Code decides, AI does not.** Gemini extracts and explains; deterministic predicates compute the
   verdict. Admit-until is date arithmetic over extracted fields — hand-checkable and fixture-able.
2. **No citation from model memory, ever.** Every quoted rule substring-matched against freshly
   fetched **Federal Register** text before emission. A fabricated rule URL ends the submission.
3. **One rule corpus, deep.**
4. **Ledger = public failure-mode distribution**, not a rule library. 24 days post-change, this is
   *the first public knowledge that exists*. Aggregates only.
5. **Refuse what you cannot compute.** Change of status, OPT/STEM interactions, pending
   applications → emit *"this case has an interaction we do not compute; take this to your DSO."*
   **Publish the refusal rate.** A declared decline rate is a trust artifact; a confident wrong
   answer is entry-ending.
6. **AI-run freshness monitor → the injunction demo.** Federal Register text is fixed; what's
   unstable is *status* (litigation, injunction, implementation guidance). Frame it exactly so:
   *"if this rule is enjoined, every stored user file is re-evaluated and every user re-notified
   within hours, no human involved."* No other entrant can show that.

### Legal posture — print on every output
> "Deadline calculator and document organiser. Not legal advice. We do not file on your behalf.
> Judgment calls go to your DSO."

Publishing law and doing arithmetic is unregulated. The UPL line is *applying law to an individual's
facts and advising on it*. So: compute dates, quote the rule verbatim, **never** opine on eligibility
or outcome, never recommend a filing strategy, never file, route judgment calls to the DSO.

### Killed, deliberately
- **Saudi SVP prep** — the acquisition channel *is* the criminalized act (Overseas Employment and
  Migrants Act 2013: advertising overseas employment without approval = imprisonment + fine).
- **Migrant contract checks / Malaysia agency check** — same statute.
- **IEEPA tariff refunds** — best business on the list, unreachable buyer. Build it in October.
- **ESL authorship defence** — purchase moment and value moment permanently inverted.
- **Facebook Messenger integration** — Meta App Review is a ~20-day wall.
- **Admission/rejection prediction** — unfalsifiable inside the judging window.

---

## PHASE 0 — TODAY. Three things, in parallel. Do not write product code yet.

### 0.1 The 90-minute demand test (HIGHEST PRIORITY — it can kill the whole idea)
**Riskiest assumption:** that an F-1 student pays a stranger's site for date arithmetic when their
DSO does it free and authoritatively. Backlog is the entire wedge — and backlog is an assumption.

**Test, no build, no link, no product mention:** post a *free, complete* worked explainer of the
transition rule with the date math shown, into 3–4 F-1 communities.
**Measure one thing: how many people reply asking about their own specific case.** Case-specific
questions are the product. Generic thanks are not.

**Kill criterion: fewer than ~10 case-specific questions in 2 hours → fall back to Preflight-UK
immediately, no deliberation.**

Free bonus: communities where the post survives moderation *are* the acquisition channel, already
primed with a post that earned standing before a product was ever mentioned.

### 0.2 Start Polar.sh onboarding THIS HOUR
The only latency that cannot be compressed; SLA unpublished. Bangladesh is on Polar's supported-payout
list; they use **Stripe Express** (available in BD) even though Stripe Payments is not.
**Target state is "can accept payments," NOT "payout landed"** — the Polar dashboard export is the
revenue evidence; money can arrive in September.

### 0.3 Accounts — ~30 min total, NO CARD NEEDED ANYWHERE
1. **Devpost** — `xprize.devpost.com` → Join Hackathon
2. **GitHub** — new public repo + MIT licence
3. **AI Studio key** — `aistudio.google.com` → Get API key → *Create API key in new project*.
   This creates a Google Cloud project with no billing.
4. **Firebase** — `console.firebase.google.com` → Add project → **select the same project** →
   stay on free **Spark** plan → enable Firestore.

### 0.4 The Google Cloud card — OPTIONAL, cap at 15 minutes
**Prepaid cards are rejected by Google** (Google requires a card "valid for the period of the Free
Trial"); this is the cause of the "card invalid" error and no bank can fix it. Only a non-prepaid
credit/debit card works.

**We do not need it.** Compliance requires "at least one product from Google Cloud" + "Gemini API for
at least one LLM call." **Firebase Spark = a Google Cloud product, free, no card. AI Studio Gemini
free tier = free, no card.**

Trade-off accepted: no Vertex AI model-observability dashboard and no billing artifacts. Replacement
evidence: **Cloud Console → APIs & Services → Dashboard → `generativelanguage.googleapis.com`** →
traffic / error / latency graphs, which the AI Studio key populates. Note this substitution
explicitly in the submission.

### 0.5 30 minutes: prove the corpus
Confirm the Federal Register text fetches and substring-matches. Hand-verify **5 fixture cases**.

---

## PHASE 1 — Aug 11. Corpus + extraction + INSTRUMENTATION.

**Instrumentation is a prerequisite, not a competitor for time.** ~4h, before selling anything.
Instrumented before, every log entry accrues free all week. Instrumented after, days 2–3 are gone.

- Rule corpus YAML: `id, text (verbatim), source_url, retrieved_at, predicate`
- `verify_citation()` — fetch, normalise whitespace, assert substring. Fail → **withhold**, no exceptions
- Extraction: `gemini-3.6-flash` via the AI Studio API key, forced response schema
- Decision log: `timestamp, decision_type, model, input_hash, output, human_intervened` → Firestore

## PHASE 2 — Aug 12. Engine + report + ledger.
- Deterministic predicates, pure functions, one runnable self-check per rule
- Findings report: verdict, the offending date, verbatim rule text, source URL, retrieval timestamp
- `/ledger` — aggregates only, consent at upload, **published refusal rate**

## PHASE 3 — Aug 13. Payment, ops agents, Rule Watch. SHIP.
- **AI payment verification**: Polar webhook; for bKash, Gemini reads the confirmation screenshot →
  extracts TrxID/amount/sender → dedupes → unlocks. A real AI-executed money decision.
- **Rule Watch**: scheduled job on **GitHub Actions cron** (free, no billing) hitting the app.
  Monitor **time-drift** (admit-until approaching,
  I-539 window, EAD expiry, grace-period countdown) as well as rule-drift. Date triggers fire for
  nearly every user with certainty; rule changes fire ~1-in-4 to 1-in-10. **Materiality is code, not
  judgment** — a boolean flip is a diff, not an LLM opinion. Ship a monthly receipt even when nothing
  changed. Call it a **term monitor** with stated cycle-end churn, never "recurring revenue."
- **Governance map** (the single artifact that beats Platea — see below)

### The governance map
Platea is the field's only true "AI as operator" — but deep and narrow (media buying), with **"one
human in the approval loop."** The rubric says how **broadly** AI governs. Beat it on breadth.

| Function | Decided by | Human interventions | Log |
|---|---|---|---|
| Acquisition content | AI | | link |
| Inbound qualification | AI | | link |
| Pricing | AI | | link |
| Document extraction | AI | | link |
| **Deadline verdict** | **deterministic code** | | link |
| Refusal / escalate-to-DSO | code | | link |
| Payment verification | AI | | link |
| Delivery | AI | | link |
| Refunds | AI | | link |
| Support | AI | | link |
| Corpus freshness | AI | | link |
| Monitor alerting | AI + code | | link |

Target **<5% logged human intervention**. Declare the deterministic engine openly — *code where
correctness is legally consequential, AI where judgment is required*. Hiding it costs more than the row.

## PHASE 4 — Aug 14–15. Sell. ৳0 ad spend, deliberately.
Marketing spend must be disclosed even if zero, and **$0 CAC with receipts is a stronger
sustainability argument than $2k MRR bought with $8k of ads.**

- Channels = the communities from the 0.1 demand test, already primed
- **Do NOT sell to agency clients, family, or friends** — "team members, family, related entities, or
  pre-existing customer relationships" is **related-party revenue**, disclosed separately and discounted
- Log **channel-of-origin per customer**; disclose any related-party sales proactively
- **Do not cut price below the floor.** Buyer faces a $420–470 I-539 fee; not price-sensitive.
  Friction is the constraint. Below a token threshold a judge reads the transaction as a gesture,
  not a purchase, and you lose the willingness-to-pay signal that is the point of collecting money.
- Target: **300+ free checks, 30+ paying arms-length customers**

## PHASE 5 — Aug 16. Evidence pack.

**The requested "monthly Google Cloud billing invoice" does not exist for us** — we run on Firebase
Spark + the Gemini free tier, so there is no billing account. Do NOT leave the field blank. State:
> *"This business runs entirely on Google Cloud free-tier services (Firebase Spark plan — Firestore,
> Hosting, Auth) and the Gemini API free tier, so no billing account and therefore no billing invoice
> exists. Attached instead: Google Cloud APIs & Services usage dashboard for
> generativelanguage.googleapis.com showing production traffic, error rate and latency across the
> period, plus our own agent execution logs and API usage records."*

This is a strength, not a weakness — zero infrastructure cost is a gross-margin argument. Say so.

- Observability: **Cloud Console → APIs & Services → Dashboard → `generativelanguage.googleapis.com`**
  → traffic / errors / latency. Populated by real programmatic calls from the deployed app.
- **3-min video** (public): real file → agent logs streaming → finding with citation → payment landing
  → ledger → human-intervention rate
- **500–1000w narrative** — must explicitly cover *"the jobs and economic opportunities the business
  creates or enables for people beyond the founding team."* Most entrants skip this.
  Pre-empt, don't defend: retention is unmeasurable in 7 days (say so — never model an LTV); absolute
  revenue is below the leaders (concede in one sentence, pivot to $0 CAC, margin, autonomy); name the
  **supply-side B2B model** (auditing university ISS offices' caseloads) as the post-hackathon
  recurring path.

## PHASE 6 — Aug 17. Submit.
- [ ] **Request the bKash PDF statement Aug 14, not Aug 16** — support turnaround is hours to a day
- [ ] P&L from the Resources template (download it, don't recreate it); COGS vs SG&A split
- [ ] Revenue by month: May $0 / Jun $0 / Jul $0 / Aug $X — zero months are not disqualifying
- [ ] Related-party revenue: separate field. Marketing spend: **$0**, stated
- [ ] Customer evidence: names, emails, phones, testimonials — **with consent**
- [ ] Repo public + OSI licence (or private, shared with `testing@devpost.com` **and** `judging@hacker.fund`)
- [ ] Video public, **under 3 minutes**
- [ ] **Never write "Gemini 1.5"** — it no longer exists. Current: `gemini-3.6-flash` (GA 21 Jul 2026),
      `gemini-3.1-pro-preview`. The 2.5 family shuts down 16 Oct 2026.

---

## The real field (recon, Aug 10 2026)

| Entrant | Disclosed traction |
|---|---|
| **InspectIQ** | **1 customer, $99/mo** — best-documented revenue in the field |
| **LaunchBridge** | $350 one-time, 3 named Google reviews, WTOP press |
| **Platea** | Real box office revenue + ad spend; total not published. Deepest AI-native ops |
| **Bloom** | "basically no real users yet" |
| **ServiceConnected** | 50k TikTok views, **$0 revenue**, OpenAI-primary |
| ~10 others | Stripe wired, zero revenue. BidPilot ships in MOCK PAYMENT MODE |

Organizers scheduled a session **Aug 3 — two weeks before deadline — "how to turn your build into
revenue before the deadline."** The official P&L walkthrough used $10,000 as *labelled dummy data*.
Orientation anchors on **$100**.

**~500–1,200 real submissions, 150–400 with any arms-length revenue, against 25 prizes → 1-in-10 to
1-in-20** conditional on shipping a complete, revenue-positive package. **30 paying strangers would
be ~10x the customer count of the best-documented entrant.**

*Caveat: every entrant above chose to publish. A quiet, well-capitalised team could be invisible.*

## Priority order for every remaining hour
A dependency chain, not competing uses of time:
1. **Instrumentation** — ~4h, hard deadline of *now*. Logs only accrue forward.
2. **Evidence pack** — a gate, not a score. Scaffold early, finish last, cap at ~8h, don't gold-plate.
3. **Customers** — first in every remaining hour. The only input that pays all three criteria at once.

**Do not trade a selling day for anything. Trade polish and sleep.**
