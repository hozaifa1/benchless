## Inspiration

I am an electrical engineering undergraduate in Dhaka. My university department has no physical fabrication laboratory or cleanroom. Without access to experimental hardware, I won an IEEE hackathon because my research relied on semiconductor device simulation, which runs on an ordinary laptop.

Across fields like device physics, photonics, fluid dynamics, and materials science, early-stage research happens largely in software tools like Sentaurus TCAD, OpenFOAM, MEEP, and Quantum ESPRESSO. Compute is rarely the primary bottleneck for students in the Global South. The real bottleneck is research judgement: evaluating whether a question fits within a semester, verifying that local hardware can run the simulations, and checking whether a target publication venue is legitimate. Without research group apprenticeship, unsupervised students are routinely targeted by predatory conferences and paper mills that charge money for unindexed publications. I built Benchless to provide the scoping constraints and verification checks I needed as an undergraduate.

## What it does

Benchless divides its work into two systems with clear boundaries between probabilistic reasoning and deterministic code:

1. Study scoping engine: A student inputs their field, academic background, available simulation software, and project timeline in weeks. Gemini 3.6 Flash proposes three research studies under a forced JSON schema. Each proposal states the core research question, why it is novel, the concrete simulation method, why it runs on the stated hardware, and its most likely failure risk. Server-side code drops any proposal whose estimated duration exceeds the available weeks. The project timeline is computed through calendar arithmetic without model interference.
2. Deterministic venue checker: A student enters a conference or journal title. Benchless performs a direct lookup against an index of roughly 88,000 records compiled from DOAJ, the Scopus source list, IEEE listings, and Beall's list of predatory publishers. It returns the exact matching record and its source. If a venue is not found in the verified dataset, Benchless returns an explicit UNKNOWN verdict and does not guess, preventing false positive verdicts on academic credentials.

## How we built it

The frontend is a static interface built with semantic HTML and CSS, supporting system-aware light and dark themes, deployed on Firebase Hosting at benchless-app.web.app.

The scoping backend uses a Node.js serverless proxy (api/scope.js) that queries gemini-3.6-flash via the Google Generative AI API with structured JSON schema constraints. The proxy protects API keys, enforces origin checks, and validates the proposal schema before returning data.

The deterministic venue engine processes open datasets from DOAJ, Scopus, IEEE, and predatory publisher lists into a client-side search index (public/data/index/) for offline matching.

For auditability, an immutable Firestore collection (decision_logs) records model decisions alongside deterministic operations, logging timestamp, decision_type, model, input_hash, output, and human_intervened fields.

Commercial and governance infrastructure includes Polar payment integration on kit.html with webhook verification for digital kit delivery, paired with a public ledger on governance.html that discloses all financial metrics, user counts, and falsification criteria.

## Challenges we ran into

When benchmarking the venue checker against 30 conference names (20 established conferences such as IEDM, ISSCC, and NeurIPS, plus 10 fake names), 16 of the 20 real conferences and 9 of the 10 fake conferences returned UNKNOWN. We discovered that unlike journals with ISSNs and DOAJ, no machine-readable global registry exists for academic conference series. We published the benchmark data on conference-gap.html and built a reproducible benchmark script (scripts/conference_gap.mjs) with self-tests that fail if the live site diverges from the data.

During development, Gemini API requests occasionally timed out or required retry handling. We implemented error boundaries in the serverless proxy to catch upstream 502 errors and sanitize responses so API keys never reach client browsers.

When testing an automated outreach agent, the agent refused to post three consecutive times because candidate discussions fell outside its relevance rules. We logged all three refusals in Firestore as evidence of safety behavior instead of bypassing the guardrails.

## Accomplishments that we're proud of

- We separated subjective synthesis from code verification: the LLM handles study topic scoping, while venue legitimacy, timeline dates, and duration caps are enforced in deterministic code.
- We published an open governance ledger tracking all operational metrics and our explicit falsification threshold of 8 committed students by November 12, 2026.
- Production Firestore logs maintain a verifiable record of both deterministic and model decisions.
- The 88,000-entry venue index and the reproducible conference gap benchmark are open source under the MIT license at github.com/hozaifa1/benchless.
- We built an architectural commitment that Benchless will never write, co-author, or submit papers for students.

## What we learned

- Machine-readable academic data has notable gaps. While journals have clear indexing provenance through ISSNs and DOAJ, engineering conference series lack standardized public registries despite being the primary vector for predatory publishing in engineering.
- Prompting cannot replace deterministic code. JavaScript timeline arithmetic and duration filters execute reliably, while relying on model self-policing leads to silent edge-case failures.
- Publishing our governance ledger and benchmark limitations directly on the live site established clearer technical expectations than presenting unvalidated claims.

## What's next for Benchless

- Building and releasing an open, machine-readable registry of verified engineering conference series as a free public asset.
- Testing a 1-on-1 simulation research mentorship model ($200 to $400 per student) pairing Dhaka university graduates with under-resourced undergraduates ahead of the November 12 falsification milestone.
- Adding guided scoping templates for open-source physics engines, including OpenFOAM for fluid dynamics, LAMMPS for molecular dynamics, and Quantum ESPRESSO for materials modeling.
