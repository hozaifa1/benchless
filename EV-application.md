# Emergent Ventures — Benchless — FINAL

## "How do you describe your idea in a tweet?"

I won an IEEE hackathon from Dhaka with no lab. Then I built a tool to catch fake conferences, ran twenty real ones and ten fakes through it, and it couldn't tell them apart. No registry of legitimate conference series exists anywhere. I want to build it.

---

## "Tell us about your proposal"

### Me

I script things instead of clicking through them. In 2026 I entered the IEEE TCAD Hackathon with a stress-engineered gate-all-around silicon nanowire nMOS. Rather than sit there adjusting the device by hand in the simulator's interface, I drove it from the command line with a coordinate-descent script that moved one parameter at a time against a target metric, and left it running overnight. It came back as one of three winning entries. I did that alone, on a laptop, in a department that has no fabrication facility.

I'm an undergraduate in electrical engineering at the University of Dhaka. I'm also a co-author on a paper accepted at IEEE EDTM 2026, where I did the machine-learning half. The device simulation in that one was other people's work.

Equipment was never what stopped me. Three other things did, and there was nobody around to teach me any of them: what counts as a question small enough to finish, how long a study actually takes, and which conferences are real. That last one nearly got me. A conference can turn up in your inbox with a society-styled name and a plausible committee and still be a venue that takes four hundred dollars and quietly damages your record. I found out late.

One more thing, probably more useful to you than the hackathon. Before I settled on this I killed an idea and its four escape routes inside a single week, all of them variations on computing a legal deadline from public rules. They died the same way each time. Whoever monetises the next step gives the calculator away as advertising, so there's no room underneath it. I wrote up why and moved on.

### The consensus view I agree with

You should finish your degree. The fashionable advice to talented young people, that the credential is rent-seeking and you should drop out and build, is wrong.

This is inconvenient for me, obviously. Going full time now would be faster. But when I account honestly for how I got anywhere, the institution supplied things I couldn't have bought: the software licence, the university email address the hackathon required for entry, a peer group that told me when I was wrong, and a name on a form that got a committee to read my submission at all. I'm the person that advice is aimed at. Following it would have cost me every one of those.

### The idea

In device physics, photonics, fluids, structures, catalysis and most of materials, the first real pass at a new question now happens in software, on hardware a student already owns. Simulation took the capital cost out of it. Most of the tools are free: OpenFOAM, MEEP, LAMMPS, Quantum ESPRESSO, Code_Aster. Purdue's nanoHUB has put more than $70 million and twenty years into hosting several hundred simulation tools that anyone can run in a browser for nothing.

nanoHUB serves roughly 23,000 simulation users a year, and India alone graduates about 1.5 million engineers a year. Most of those graduates are in software and will never open a device simulator, so that comparison flatters me. Two orders of magnitude of it survive anyway.

What's left is judgement, which question to ask, how big it actually is, and where it goes after. That knowledge sits inside good research groups and moves by apprenticeship, and apprenticeship is the one input that never got cheaper. A student in Dhaka can't buy it at any price.

Benchless is my attempt at transmitting that judgement without the research group. Today it helps a student scope a simulation study they can actually finish, and tells them whether the journal they're aiming at is indexed.

Where I think it goes is a supervised path with a hard filter at the front. You don't start with an original question. You start by reproducing a specific published result out of a runnable repository, and you only get to propose something new once your curve matches the reference. Most people won't get that far, which is the point of it. There are already far too many papers. I'd rather raise the number of people who can tell a real result from a plausible one, and reproduction is the cheapest honest test of that I know of. For the first twenty students I check the curves myself. Whether that step can be made cheap is the open question, and it's the one I most want this year to answer.

By 2031 I want "I have no lab, so research isn't for me" to be visibly false to any engineering undergraduate in South Asia and West Africa, and I want a public dataset showing how many of them made it and how many didn't.

### What is unusual about it

First, the market structure is backwards. Normally somebody undercuts the honest version of a service by giving it away free as advertising, which is exactly what killed the idea I described above. Here the free-adjacent alternative is fraud. A large ghostwriting industry sells authorship into compromised journals at published prices, and it's the only party actively reaching out to an unsupervised undergraduate. Nobody downstream profits from a student publishing honestly, which is roughly why the honest version doesn't exist.

Second, I measured a gap I wasn't expecting. In the first week I built a venue checker against DOAJ, the Scopus source list, IEEE's listings and the predatory lists, about 88,000 records, written as deterministic code with no language model anywhere near the verdict. Ten out of ten journals I tried came back right. Then I ran thirty conference names through it: twenty flagship series including IEDM, ISSCC, DAC and NeurIPS, and ten I made up myself in the house style of the spam that reaches unsupervised students. Sixteen of the twenty real ones came back unknown. So did nine of the ten fakes. Writing the fakes myself is the weakest joint in that benchmark and I'd rather flag it than have you find it, but the result doesn't hang on it. The verdict can't separate real from fraudulent. And it isn't a matcher bug. Eighty-five per cent of the IEEE entries are dated individual events rather than series, and IEDM sits in there only as "Technical digest". Journals have ISSNs and DOAJ behind them. Conferences have no registry at all, and conferences are where the fraud actually reaches students. The benchmark is in the repo and reproduces in one command. Nobody owns that registry. I want to build it and give it away.

Third, the prices are absurd. American families pay Polygence around $3,000 for a supervised research project for a high schooler. Most of that $3,000 is the mentor's hours.

### How I'll know if I'm wrong

The objection I take most seriously is mine. Much of the proven willingness to pay in South Asia is demand to *be* published, not to *learn* to publish, and those are different customers. Only the second one is mine. I found 51 first-person posts in thirty days from students in real distress about having no publications, and every single one is admissions anxiety. None of them mention wanting to do the work.

So I'm fixing the threshold now, before I start. Checkout has worked since 14 August 2026, tested end to end on a zero-price order. By 12 November I want eight people to have paid $200 or more for the honest version. If they haven't, I'll publish that the honest segment isn't a business at this price, and say what I'm doing instead.

### Status, budget, and the ask

I started on 11 August 2026. In the first three days I put the site live, opened the source under MIT, and shipped the venue index with its own self-test. Fully independent, self-funded, with deployed production infrastructure.

I work part time around final-year coursework. The cohort runs during that final year rather than after it, because waiting for the degree would eat the twelve months this is meant to buy.

Running costs are almost nothing. The data is public, hosting is free-tier, inference comes to a few dollars a month. The $29 kit on the site is priced wrong and I know it. A supervised cohort at $200 to $400 a student is the real shape, and six to eight students a month is a genuine living here.

I'm asking for $15,000 over twelve months:

- **$5,000** to live on, which is about $400 a month in Dhaka, so I don't have to take contract work
- **$4,000** to put twenty students through the cohort at no cost to them, at the $200 floor
- **$4,000** to build the conference registry and release it publicly
- **$2,000** to find out whether these students can be reached at all, which is my least verified assumption

What I'm committing to is a published account of what happened to all twenty, including the ones who never finished.

---

## Form fields (not part of the submitted text)

- **Name:** Hozaifa | Hossain
- **Email:** 20hozaifa02@gmail.com (Personal)
- **Phone:** +8801615001456 (Mobile)
- **Country:** Bangladesh · **City:** Dhaka
- **Affected Region:** Asia
- **Project Topic:** Education (or Talent Search if offered)
- **Multimedia URL:** https://benchless-app.web.app
- **Twitter:** optional, leave blank if none
- **Supporting document:** .docx only, PDFs are not accepted. Optional.
- Tick all three consent boxes.
