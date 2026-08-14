# Emergent Ventures — Benchless — FINAL

## "How do you describe your idea in a tweet?"

The cost of doing original engineering research fell to a laptop and nobody told the students. I won an IEEE hackathon from Dhaka with no lab. Benchless teaches other unfunded students how, and checks that the conference they are aiming at is not a fraud.

---

## "Tell us about your proposal"

### Me

I would rather write the loop than do the work. In 2026 I entered the IEEE TCAD Hackathon with a stress-engineered gate-all-around silicon nanowire nMOS. Instead of adjusting the device by hand in the simulator's interface, I drove it from the command line with a coordinate-descent script that moved one parameter at a time against a target metric, and left it running while I slept. It was one of three winning entries. I did that work alone, on a laptop, in a department with no fabrication facility.

I am an undergraduate in electrical engineering at the University of Dhaka. I am also a co-author on a paper accepted at IEEE EDTM 2026, where I did the machine-learning half; the device simulation was other people's work.

The equipment was never what stopped me. Three other things did, and I had no way to learn any of them: what counts as a question small enough to finish, how long a study actually takes, and which conferences are real. I did not know that a conference can arrive in your inbox with a society-styled name and a plausible committee and still be a venue that takes four hundred dollars and quietly damages your record. I found that out late and by accident.

One more thing, probably more informative than the hackathon. Before settling on this I killed an idea and its four escape routes in a single week, all variations on computing a legal deadline from public rules. They died for the same reason: whoever monetises the next step always gives the calculator away as advertising. I wrote up why and moved on. Spending three more years defending any of them would have been the more expensive mistake.

### The consensus view I agree with

That you should finish your degree. The fashionable advice to talented young people, that the credential is rent-seeking and you should drop out and build, is wrong.

This is inconvenient for me. Going full time now would be faster. But the honest accounting of how I got anywhere is that the institution supplied things I could not have bought: the software licence, the university email address the hackathon required for entry, a peer group that told me when I was wrong, and a name on a form that made a committee read my submission at all. I am the person the drop-out advice is aimed at, and following it would have cost me every one of those.

### The idea

In device physics, photonics, fluids, structures, catalysis and most of materials, the first real pass at a new question now happens in software, on hardware a student already owns. Simulation took the capital cost out of it. The tools are largely free: OpenFOAM, MEEP, LAMMPS, Quantum ESPRESSO, Code_Aster. Purdue's nanoHUB has put over $70 million and twenty years into hosting several hundred simulation tools anyone can run in a browser at no cost. The supply side is solved.

nanoHUB serves roughly 23,000 simulation users a year. India alone graduates about 1.5 million engineers a year. That comparison is generous to my case, since most of those graduates are in software and will never open a device simulator, and the gap is still two orders of magnitude.

Tooling and money were solved years ago and given away. What is left is judgement: knowing which question is worth asking, how big it is, when a result is real, and where it can go. That knowledge lives inside good research groups and transmits by apprenticeship. Apprenticeship is the one input that never got cheaper, and a student in Dhaka cannot obtain it at any price.

Benchless is my attempt to transmit that judgement without the research group. In its current form it helps a student scope a simulation study they can finish and checks whether the venue they are aiming at is indexed anywhere real.

What I think it becomes is a supervised path with a hard filter at the front. A student does not begin with an original question. They begin by reproducing a specific published result from a runnable repository, and they only get to propose something new after their curve matches the reference. Most people will not get past that. That is deliberate. I am not trying to increase the number of papers; there are far too many already. I am trying to increase the number of people who can tell a real result from a plausible one, and the reproduction step is the cheapest honest test of that I know. For the first twenty students I check the curves myself. Whether that step can be made cheap is the open question, and it is the one I most want this year to answer.

By 2031 I want the sentence "I have no lab, so research is not for me" to be visibly false to any engineering undergraduate in South Asia and West Africa, and I want a public dataset showing how many of them made it and how many did not.

### What is unusual about it

First, the market structure is backwards. Normally somebody undercuts the honest version of a service by giving it away free as advertising, which is what killed my five previous ideas. Here the free-adjacent alternative is fraud. A large ghostwriting industry sells authorship into compromised journals at published prices, and it is the only party actively reaching out to an unsupervised undergraduate. No firm anywhere profits from a student publishing honestly, which is why nobody has built the honest version.

Second, I stumbled into a public-good gap. Over the first week I built a venue checker against DOAJ, the Scopus source list, IEEE's listings and the predatory lists, about 88,000 records. It is deterministic code with no language model anywhere near the verdict, because a confident wrong answer about a venue costs a student a year. It works for journals. It largely fails for conferences, and testing it taught me why: no machine-readable list of legitimate conference series exists. Journals have ISSNs and DOAJ. Conferences have nothing, and conferences are where the fraud actually reaches students. Building that list is unglamorous and nobody owns it. I intend to build it and give it away.

Third, the prices are absurd. American families pay Polygence around $3,000 and Indigo from $3,800 for a supervised research project for a high schooler. The mentor's time does not travel. The judgement does, and it is worth something to a student who cannot buy an hour of that mentor's time at any price.

### How I will know if I am wrong

The objection I take most seriously is my own. Much of the proven willingness to pay in South Asia is demand to *be* published, not to *learn* to publish. Those are different customers and only the second is mine. I found 51 first-person posts in thirty days from students in real distress about having no publications, and every one of them is admissions anxiety, which shows pain and does not show that anyone wants to do the work.

So I am setting the threshold now, before I start. Within ninety days of a working checkout I want eight people to pay $200 or more for the honest version. If they do not, I will publish that the honest segment is not a business at this price and say what I am doing instead.

### Status, budget, and the ask

I started on 11 August 2026. In the first three days I put the site live, opened the source under MIT, and shipped the venue index with its own self-test. No partners, no employees, no outside money, no revenue.

I work part time around final-year coursework. The cohort runs during that final year rather than after it, because waiting for the degree would cost the twelve months this is meant to buy.

Costs are near zero: the data is public, hosting is free-tier, inference is a few dollars a month. The $29 kit currently on the site is priced wrong and I know it. A supervised cohort at $200 to $400 a student is the real shape, and six to eight students a month is a genuine living at Dhaka costs. This can reach self-sufficiency at a scale no American company would get out of bed for.

I am asking for **$12,000 over twelve months**: $4,000 to live on instead of taking contract work, $4,000 to put twenty students through a supervised reproduction cohort at no cost to them and publish the complete outcome table including every failure, $2,500 to build and release the conference-legitimacy dataset, and $1,500 to test whether these students can be reached at all, which is my least verified assumption.

I am committing to a published, falsifiable account of what happened to twenty students who had no lab and tried anyway. That is the deliverable, rather than a product. If the cohort fails I will publish it anyway, and a documented failure is still a useful public record.
