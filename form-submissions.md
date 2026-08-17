# Benchless · Devpost Submission Complete Dossier

This document archives every field, question response, uploaded file, and configuration submitted to the **Build with Gemini XPRIZE** hackathon on Devpost.

---

## 1. Basic Information & Metadata

- **Project Title**: `Benchless`
- **Elevator Pitch / Tagline**: 
  > Scoping simulation-first research studies and deterministic venue indexing for engineering students without fabrication labs.
- **Category**: `Education & Human Potential`
- **What date did you start this project? (MM-DD-YY)**: `08-11-26`
- **Submitter type**: `individual`
- **Organization name**: *(Blank)*
- **GitHub Repository URL**: `https://github.com/hozaifa1/benchless`
- **License**: MIT License (Public)
- **GitHub Sharing Confirmation**: Checked `[X]` (Shared with `testing@devpost.com` and `judging@hacker.fund`)

---

## 2. Built With Tags

```text
gemini-api, gemini-3.6-flash, firebase, firestore, firebase-hosting, nodejs, javascript, html5, css3, google-cloud, polar-sh, json-schema
```

---

## 3. "Try It Out" Links

1. **Live Web Application**: `https://benchless-app.web.app`
2. **GitHub Source Repository**: `https://github.com/hozaifa1/benchless`
3. **Governance Ledger & Benchmark**: `https://benchless-app.web.app/governance.html`

---

## 4. About the Project (7-Section Humanized Narrative)

### Inspiration
I am an electrical engineering undergraduate in Dhaka. My university department has no physical fabrication laboratory or cleanroom. Without access to experimental hardware, I won an IEEE hackathon because my research relied on semiconductor device simulation, which runs on an ordinary laptop.

Across fields like device physics, photonics, fluid dynamics, and materials science, early-stage research happens largely in software tools like Sentaurus TCAD, OpenFOAM, MEEP, and Quantum ESPRESSO. Compute is rarely the primary bottleneck for students in the Global South. The real bottleneck is research judgement: evaluating whether a question fits within a semester, verifying that local hardware can run the simulations, and checking whether a target publication venue is legitimate. Without research group apprenticeship, unsupervised students are routinely targeted by predatory conferences and paper mills that charge money for unindexed publications. I built Benchless to provide the scoping constraints and verification checks I needed as an undergraduate.

### What it does
Benchless divides its work into two systems with clear boundaries between probabilistic reasoning and deterministic code:

1. Study scoping engine: A student inputs their field, academic background, available simulation software, and project timeline in weeks. Gemini 3.6 Flash proposes three research studies under a forced JSON schema. Each proposal states the core research question, why it is novel, the concrete simulation method, why it runs on the stated hardware, and its most likely failure risk. Server-side code drops any proposal whose estimated duration exceeds the available weeks. The project timeline is computed through calendar arithmetic without model interference.
2. Deterministic venue checker: A student enters a conference or journal title. Benchless performs a direct lookup against an index of roughly 88,000 records compiled from DOAJ, the Scopus source list, IEEE listings, and Beall's list of predatory publishers. It returns the exact matching record and its source. If a venue is not found in the verified dataset, Benchless returns an explicit UNKNOWN verdict and does not guess, preventing false positive verdicts on academic credentials.

### How we built it
The frontend is a static interface built with semantic HTML and CSS, supporting system-aware light and dark themes, deployed on Firebase Hosting at benchless-app.web.app.

The scoping backend uses a Node.js serverless proxy (api/scope.js) that queries gemini-3.6-flash via the Google Generative AI API with structured JSON schema constraints. The proxy protects API keys, enforces origin checks, and validates the proposal schema before returning data.

The deterministic venue engine processes open datasets from DOAJ, Scopus, IEEE, and predatory publisher lists into a client-side search index (public/data/index/) for offline matching.

For auditability, an immutable Firestore collection (decision_logs) records model decisions alongside deterministic operations, logging timestamp, decision_type, model, input_hash, output, and human_intervened fields.

Commercial and governance infrastructure includes Polar payment integration on kit.html with webhook verification for digital kit delivery, paired with a public ledger on governance.html that discloses all financial metrics, user counts, and falsification criteria.

### Challenges we ran into
When benchmarking the venue checker against 30 conference names (20 established conferences such as IEDM, ISSCC, and NeurIPS, plus 10 fake names), 16 of the 20 real conferences and 9 of the 10 fake conferences returned UNKNOWN. We discovered that unlike journals with ISSNs and DOAJ, no machine-readable global registry exists for academic conference series. We published the benchmark data on conference-gap.html and built a reproducible benchmark script (scripts/conference_gap.mjs) with self-tests that fail if the live site diverges from the data.

During development, Gemini API requests occasionally timed out or required retry handling. We implemented error boundaries in the serverless proxy to catch upstream 502 errors and sanitize responses so API keys never reach client browsers.

When testing an automated outreach agent, the agent refused to post three consecutive times because candidate discussions fell outside its relevance rules. We logged all three refusals in Firestore as evidence of safety behavior instead of bypassing the guardrails.

### Accomplishments that we're proud of
- We separated subjective synthesis from code verification: the LLM handles study topic scoping, while venue legitimacy, timeline dates, and duration caps are enforced in deterministic code.
- We published our open governance ledger and our explicit falsification threshold of 8 committed students by November 12, 2026.
- Production Firestore logs maintain a verifiable record of both deterministic and model decisions.
- The 88,000-entry venue index and the reproducible conference gap benchmark are open source under the MIT license at github.com/hozaifa1/benchless.
- We built an architectural commitment that Benchless will never write, co-author, or submit papers for students.

### What we learned
- Machine-readable academic data has notable gaps. While journals have clear indexing provenance through ISSNs and DOAJ, engineering conference series lack standardized public registries despite being the primary vector for predatory publishing in engineering.
- Prompting cannot replace deterministic code. JavaScript timeline arithmetic and duration filters execute reliably, while relying on model self-policing leads to silent edge-case failures.
- Publishing our governance ledger and benchmark limitations directly on the live site established clearer technical expectations than presenting unvalidated metrics.

### What's next for Benchless
- Building and releasing an open, machine-readable registry of verified engineering conference series as a free public asset.
- Testing a 1-on-1 simulation research mentorship model ($200 to $400 per student) pairing Dhaka university graduates with under-resourced undergraduates ahead of the November 12 falsification milestone.
- Adding guided scoping templates for open-source physics engines, including OpenFOAM for fluid dynamics, LAMMPS for molecular dynamics, and Quantum ESPRESSO for materials modeling.

---

## 5. Technical Questions & Impact Analysis

### Explain how your project uses AI to impact the world, specifically in the category you have chosen.
Benchless focuses on the Education and Human Potential category by addressing missing laboratory infrastructure. In fields like semiconductor device physics, photonics, fluid dynamics, and materials science, university departments in emerging markets often lack fabrication labs and cleanrooms. Students can run modern research simulations on standard computers, but undergraduates lack the mentorship needed to scope feasible projects. Benchless uses Gemini 3.6 Flash to generate bounded simulation proposals tailored to a student's software, background, and timeline. The system then enforces failure-mode analysis and applies code-driven limits on project duration.

### How do you measure impact?
We track whether students move from classroom coursework into verified simulation research. Short-term impact is measured by how many generated proposals fit within hard duration limits and pass venue verification against our index of 88,000 academic records. Long-term impact is tracked by the count of completed manuscripts submitted to verified publication venues and the ongoing growth of the open-source conference registry.

### Explain the underlying business model of your submission.
Benchless runs a B2C educational model combining free tools and paid mentorship:
1. A free client-side venue checker that indexes 88,000 records, along with a reproducible conference gap benchmark.
2. Digital simulation guide packages sold through Polar.sh.
3. One-on-one research mentorship cohorts priced at $200 to $400 per student, pairing undergraduates with recent engineering graduates in Dhaka.

### How will you sustain business operations in the future?
We keep fixed overhead low by running on serverless infrastructure. The web app is hosted on the Firebase Spark tier, and model inference stays within standard free-tier API limits. Revenue from the $200 to $400 student mentorship cohorts pays the graduate mentors directly and covers any scaling costs for infrastructure.

### Which AI tools have you leveraged while working on this project?
1. Gemini 3.6 Flash (via Google Generative AI API) for generating structured research proposals.
2. Antigravity and Claude Code CLI environments for local coding, benchmarking scripts, and git repository management.
3. Whisper API via Groq to extract audio and generate timestamped transcripts for project media.

### Explain how your business model shared above is sustainable and viable.
Many engineering students need simulation training when physical facilities are unavailable. Purdue's nanoHUB alone serves over 23,000 simulation users each year, and universities in developing regions graduate hundreds of thousands of engineers without cleanroom access. While US-based research mentorship programs charge $3,000 or more per student, our $200 to $400 pricing covers competitive mentor stipends in Dhaka while keeping costs manageable for undergraduates. We have set a public milestone to enroll 8 paying students by November 12, 2026 to validate commercial demand.

### Please explain how your business operates with AI.
Our architecture separates LLM generation from rule-based validation. When a student requests a study plan, Gemini 3.6 Flash outputs structured JSON containing research questions, methodologies, and duration estimates. Local JavaScript functions then inspect the output, checking timelines against student availability and verifying candidate publication venues. Every prompt, model response, and validation check is saved to Cloud Firestore as an immutable audit log.

### Please explain the extent to which AI is live in production and executes key decisions.
The scoping engine is deployed live at benchless-app.web.app/app.html. When a user submits their field of study, available software, and schedule, Gemini 3.6 Flash generates three separate research proposals. The model selects the methodology, novelty angle, and main failure risks for each proposal. Client-side JavaScript then parses the JSON response, validates the format, and filters out any proposal that exceeds the student's time budget.

### Please explain which product from Google Cloud you used during the hackathon and how.
1. Gemini API (gemini-3.6-flash): Called from api/scope.js to generate structured simulation research proposals.
2. Firebase Hosting: Deploys the static web application and the client-side venue search index at benchless-app.web.app.
3. Cloud Firestore: Stores immutable decision logs containing input hashes, raw model outputs, and validation verdicts.

### If your project uses an LLM, it must use Gemini API for at least one LLM call. Please explain which LLMs are used in the project and specifically how the Gemini API is used.
We use gemini-3.6-flash as our only language model. In api/scope.js, the application calls the generateContent endpoint with a configured responseSchema. The model processes the student's discipline, tools, background, and timeline, returning a JSON array of three proposals with fields for title, question, whyNovel, method, runnableOn, weeksEstimate, and riskItFails.

---

## 6. Financial & Governance Disclosures

- **Pre-existing Resources**: `No. All application code, search indices, benchmarking scripts, and documentation were written during the hackathon period starting August 11, 2026. Venue data was compiled from public directories and registries (DOAJ, Scopus, IEEE, and curated predatory lists) with no prior commercial assets.`
- **Total Revenue**: `0`
- **Revenue by Month**: `May: $0, June: $0, July: $0, August: $0`
- **Revenue Explanation**: `During the six-day hackathon window, work focused on developing the scoping engine, indexing database, and audit log infrastructure. We integrated and tested payment checkout through Polar.sh for enrollment in the first mentorship cohort.`
- **Related-Party Revenue**: `0` (Governance policy prohibits sales to family, friends, or agency clients)
- **Total Expenses**: `0`
- **Expense Explanation**: `Total expenses during the hackathon were $0. We built the platform using Google Cloud and Firebase free tiers, open-source tools, and public datasets. This resulted in 0% COGS, 0% marketing spend, 0% paid R&D, and 0% administrative costs.`
- **Total COGS**: `0`
- **COGS Explanation**: `COGS was $0. The venue search index runs client-side from static JSON files, and model inference operates within serverless free-tier limits.`
- **Total Marketing / CAC**: `0`
- **Marketing Explanation**: `Marketing expenses were $0. We prepared initial outreach organically and did not spend money on paid advertising.`
- **Additional Expenses**: `$0. We did not purchase external domains, dedicated servers, or hardware.`
- **Users Acquired**: `1`
- **Paying Users**: `0`
- **User Testimonial**: `Currently in the self-test and validation phase. Student enrollment opens ahead of the November 12 falsification milestone.`
- **Learning Derived**: `A great deal`
- **Agentic Economy Prize (Circle)**: `No`

---

## 7. Uploaded File Attachments

| Devpost Upload Field | Attached File Path | Description |
|---|---|---|
| **Revenue Evidence (PDF)** | `F:\Projects\benchless\submission\Revenue-Evidence-Polar.pdf` | Polar.sh merchant dashboard confirming connected checkout & digital fulfillment |
| **Evidence of Project Running** | `F:\Projects\benchless\submission\Benchless-Live-Application-and-System-Evidence.pdf` | Live application scoping UI + Google Cloud Gemini API traffic + Firestore audit logs |
| **Profit Evidence (P&L)** | `F:\Projects\benchless\submission\Benchless-PL-Statement.pdf` | Official 90-day P&L Statement spreadsheet rendered to publication-grade PDF |
| **Image Gallery 1** | `F:\Projects\benchless\submission\screenshots\01_gcp_generative_language_traffic.png` | Google Cloud APIs and Services live Gemini API traffic console |
| **Image Gallery 2** | `F:\Projects\benchless\submission\screenshots\02_firebase_firestore_decision_logs.png` | Cloud Firestore decision logs immutable audit trail |
| **Image Gallery 3** | `F:\Projects\benchless\submission\video_screens\shot01_landing_headline.png` | Benchless web application landing page |
| **Image Gallery 4** | `F:\Projects\benchless\submission\video_screens\shot02a_venue_ieee_indexed.png` | Deterministic venue verification lookup against 88,000 indexing records |
| **Image Gallery 5** | `F:\Projects\benchless\submission\video_screens\shot04_scoped_proposals_gemini.png` | Gemini 3.6 Flash research study proposals with hardware checks |
| **Image Gallery 6** | `F:\Projects\benchless\submission\video_screens\shot05_timeline_table_arithmetic.png` | Project timeline table generated strictly through calendar arithmetic |
| **Image Gallery 7** | `F:\Projects\benchless\submission\video_screens\shot06_firestore_decision_logs_row.png` | Expanded audit log row showing input hash, decision type, and model version |
