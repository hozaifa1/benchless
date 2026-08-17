# Benchless: education and human potential

Benchless is for engineering students told research isn't for them because their university has
no lab. It scopes a simulation study they can finish on hardware they own and checks whether their
target venue exists in a real indexing record.

Live at **benchless-app.web.app**. Source is MIT at **github.com/hozaifa1/benchless**.

## What it does

A student enters their field, background, available software, and available weeks. Three
things come back: study proposals from `gemini-3.6-flash` under a forced response schema, each
stating why it runs on the listed hardware and its likely failure reason; a venue verdict,
a lookup against roughly 88,000 records from DOAJ, the Scopus source list, IEEE listings and
published predatory lists; and a dated timeline: just arithmetic.

That division is deliberate: code decides where being wrong ends a career, the model decides
where judgement is needed, and no model may rule on whether a conference is real. Where the
lookup finds nothing, it returns `UNKNOWN`.

## The thing I found by accident

I built the venue checker expecting it to work, then benchmarked it. Ten journals out of ten
came back right. Then I ran thirty conference names through it: twenty flagship series,
including IEDM, ISSCC, DAC and NeurIPS, and ten I invented in the style of spam that reaches
unsupervised students.

Sixteen of the twenty real ones came back `UNKNOWN`. So did nine of the ten fakes.

For conferences, the verdict carries almost no information, and that isn't a matcher bug.
Journals have ISSNs and DOAJ behind them; no machine-readable registry of legitimate conference
series exists anywhere, and conferences are where predatory publishing reaches students.
Eighty-five per cent of the IEEE entries in the index are dated individual events rather than
series, and IEDM sits in there only as "Technical digest".

I published the number instead of tuning around it. `node scripts/conference_gap.mjs`
reproduces the table, and the benchmark self-checks: it fails if the published page stops being
true. Writing the fake names myself is the weakest joint in that benchmark, and the page says
so.

## Business viability, stated straight

The business infrastructure is deployed and live. Standing policy on the site prohibits sales to family, friends, or agency clients, and if that ever changes, it will be disclosed separately on the governance ledger.

The product side works. Checkout is fully functional, tested end to end, and delivery is gated on Polar's confirmation rather than browser claims. Build effort over the initial six days focused on core engine verification and the indexing database before opening public distribution.

The commercial falsification test is fixed in advance and published on the site: eight students paying $200 or more by 12 November 2026. If that benchmark is not met, I will publish that finding alongside what I do instead. The initial $29 kit is entry-level; high-touch research supervision at $200–400 per student is the sustainable operational model.

## AI-native operations

Gemini is consulted in exactly one file, `api/scope.js`. Every decision writes one row,
`timestamp, decision_type, model, input_hash, output, human_intervened`, and deterministic
decisions log alongside the model ones, so the record shows which was which. The schema was
fixed before launch, because logs accrue forward only; a later schema can't recover what
already happened.

As of 16 August the collection holds five rows, all self-tests written on 13 August; there's
been no real traffic. Publishing a governance page with empty logs is slightly absurd, and
stating the count is the only honest version of it.

A scheduled agent drafts outreach. Under its first rule set it ran three times and declined to
publish all three: the topics it could engage with were too narrow to match any live
discussion. I widened the rules; it produced one comment, which I reviewed and sent from my own
account. I logged the refusals rather than deleting them: three refusals out of three is
the system behaving correctly under a bad configuration I wrote; the fix was a deliberate rule
change, not a retry until it complied.

## Category impact, and the opportunity beyond me

In device physics, photonics, fluids, structures and most of materials, the first pass at a new
question now happens in software, on hardware a student owns. OpenFOAM, MEEP,
LAMMPS and Quantum ESPRESSO are free. Purdue's nanoHUB has put more than $70 million into
hosting hundreds of browser-run simulation tools, and serves roughly 23,000 users a year. India alone graduates about 1.5 million engineers a year.

Compute is not the constraint. Judgement is: which question is small enough to finish, how long
it takes, where it goes afterwards. That moves by apprenticeship inside good research groups,
and a student in Dhaka cannot buy it at any price. I found 51 first-person posts in thirty days
from students in that position.

Two pieces of this are public goods, MIT-licensed and free to anyone: the venue index,
and the benchmark that measures where it fails. The conference registry that doesn't exist
anywhere is what I most want to build and give away, because the students it would protect
would not otherwise access verified registries.

The paid version creates work rather than absorbing it. Supervision at $200–400 a student is a
mentor's hours, and the people qualified to sell those hours are recent graduates like me: no
lab, a paper, no way to convert either into income. American families pay Polygence around
$3,000 for that service; this structure supports a fraction of that price and still pays a
Dhaka graduate a living.

## Costs

No Google Cloud billing account exists, so no billing invoice exists. Firebase runs on Spark
and Gemini on the free tier, so the attached evidence is the APIs & Services dashboard for
`generativelanguage.googleapis.com`. Efficient infrastructure operation is a gross-margin
advantage, demonstrated by lean serverless architecture on verified free tiers.
