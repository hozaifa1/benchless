# The kit

This directory assembles the paid product. **Three of its files are deliberately absent
from this repository**, and their absence is the point rather than an oversight:

| File | In this repo | Why |
|---|---|---|
| `index.mjs` | ✅ yes | Assembly logic. It is the code, not the product. |
| `worksheet.mjs` | ❌ no | The scoping worksheet — the material customers pay for. |
| `latex.mjs` | ❌ no | The commented LaTeX submission kit. |
| `shortlist.mjs` | ❌ no | The generated venue shortlist. |

`scripts/build_kit_shortlist.mjs`, which generates the shortlist, is held back for the
same reason: it carries the curated venue selection and the fit notes, which are the
editorial judgement being sold.

The three files **are** deployed. `.vercelignore` governs what reaches production and
`.gitignore` does not, so the live functions serve the full kit while the public repo
does not carry it.

## What this means if you cloned this

`api/kit.mjs` — the entitlement gate, which is the part worth reading — is here in full,
along with `api/checkout.mjs` and `api/polar-webhook.mjs`. Importing `_kit/index.mjs`
will fail on a fresh clone because its three imports are missing. Everything else in the
application runs: the study scoping agent (`api/scope.js`) and the deterministic venue
checker (`public/js/venue-core.mjs`, `scripts/check_venue.mjs`) have no dependency on
this directory, and the venue checker ships with its full index and its self-checks.

## Why it is arranged this way

The repository is public because the reasoning should be auditable — particularly the
rule that a model never decides whether a venue is legitimate, and the decision to verify
entitlement against Polar on every request rather than trusting a webhook. None of that
requires giving away the worksheet.

Publishing the method and selling the material is the honest split. Publishing the
material too would mean the $29 buys nothing, and pretending otherwise on the landing
page would be worse than either.
