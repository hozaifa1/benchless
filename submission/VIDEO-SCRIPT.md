# Benchless: demo video script

**Target run time 2:40. Hard ceiling 3:00.** Voiceover below is 375 words, which lands at
roughly 145 words per minute with pauses. Read it slower than feels natural.

Every screen in this script was verified working on 16 August 2026. Nothing here is a mockup.

---

## Before you press record

- Brave, `--user-data-dir` set to a clean profile so no extensions or bookmarks are in shot.
- Window at 1920×1080, browser zoom 110%, system theme **light** (the pages are theme-aware and
  light reads better on compressed video).
- Tabs open in this order, all pre-loaded so nothing white-flashes on cut:
  1. `benchless-app.web.app`
  2. `benchless-app.web.app/app.html`
  3. `benchless-app.web.app/governance.html`
  4. Firebase console → Firestore → `decision_logs`
  5. `benchless-app.web.app/kit.html`
  6. Google Cloud → APIs & Services → `generativelanguage.googleapis.com`
- One terminal, `F:\Projects\benchless`, font size up to at least 18pt.
- **Run the scoping form once before recording.** The Gemini proxy returned a 502 on one call
  out of two during testing, and it succeeds on retry. Warm it up so the take is clean.

---

## Shot list

| Time | On screen | Voiceover |
|---|---|---|
| 0:00–0:14 | Landing page, slow scroll to the headline | I'm an undergraduate in Dhaka. My department has no fabrication lab, and I won an IEEE hackathon anyway, because the work was simulation and simulation runs on a laptop. Benchless is the thing I wish someone had handed me. |
| 0:14–0:30 | `app.html`, typing the intake form live: field `ferroelectric FET device simulation`, background `final-year EEE undergrad, comfortable with Python, no lab access`, software `Sentaurus TCAD on my university licence, Python`, weeks `12`, venue `IEEE Electron Device Letters` | A student types their field, what they know, what software they can actually get hold of, and how many weeks they have. |
| 0:30–0:52 | Click **Scope it**. Venue card lands first, then the three proposals fill in | Gemini 3.6 Flash proposes three studies under a forced schema. Each one has to say why it runs on the hardware listed, and the most likely reason it fails. Code, not the model's good intentions, drops anything that runs much longer than the weeks available. |
| 0:52–1:04 | Scroll to the timeline table | The dates are arithmetic. No model touches them. |
| 1:04–1:30 | Three venue checks back to back. Retype the venue field each time: `IEEE Electron Device Letters` → INDEXED, `World Academy of Science Engineering and Technology` → FLAGGED, `International Conference on Emerging Trends in Engineering and Technology` → UNKNOWN. Hover the source links so the Scopus and Beall's List URLs show in the status bar | The venue verdict comes from a lookup against 88,000 records, not a model call, and it shows you the record it matched and where that record came from. Indexed. Flagged on Beall's list. And unknown, which is the one that matters: the lookup found nothing, so Benchless refuses instead of guessing. |
| 1:30–1:48 | Firebase console, `decision_logs`, expand one row so `decision_type`, `model`, `input_hash`, `human_intervened` are legible | Every decision writes a row, the deterministic ones alongside the model ones, so the record shows which was which. Right now there are five rows and all five are my own tests. I'd rather show you an empty log than a fake one. |
| 1:48–2:08 | Terminal: `node scripts/conference_gap.mjs`, let it run to `self-check passed`. Cut to the refusal-rate table on `governance.html` | I benchmarked the checker against thirty conference names, twenty real and ten I made up. It returned unknown for sixteen of the twenty real ones and nine of the ten fakes. For conferences the verdict is close to worthless, because no registry of legitimate conference series exists to check against. That command reproduces the table, and the benchmark fails if the published page ever stops being true. |
| 2:08–2:26 | `kit.html`, click through to the Polar checkout, then cut to the revenue table on `governance.html` | Checkout works and delivery is gated on Polar confirming the order. Revenue, users, and marketing spend are all zero so far. I built for six days and never put this in front of a student, and that's a distribution failure, not a verdict on demand. |
| 2:26–2:40 | Back to the governance page, hold on the falsification threshold | Benchless does not write, submit, or co-author anything, and it never will. There's an industry that sells authorship, and the damage lands on the student. So the test is published in advance: eight people paying two hundred dollars or more by the twelfth of November. If that doesn't happen, I'll say so on this page. |

---

## Cutting room notes

- If you overrun, the first 14 seconds is the cut. The tool has to be on screen by 0:20.
- Do not add music under the venue-check section. The source URLs need to be readable and
  anything competing for attention there costs you the point.
- Keep the `UNKNOWN` verdict on screen longer than feels comfortable. Judges are scoring
  AI-native operations, and a system that declines on the record is the evidence.
- Never say "Gemini 1.5". The model is `gemini-3.6-flash`.
- Upload public to YouTube. Unlisted does not satisfy the rules.
