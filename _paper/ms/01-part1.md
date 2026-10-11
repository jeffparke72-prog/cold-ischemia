# Chapter 1: The Customer Nobody Surveyed
EPIGRAPH: "Would you tell me, please, which way I ought to go from here?" "That depends a good deal on where you want to get to," said the Cat.
BY: Lewis Carroll, Alice's Adventures in Wonderland (1865)

## The customer is a person, and the person has a clock

In the vocabulary of Lean Six Sigma, the customer is whoever receives the output of a process and decides, by their experience of it, whether the process has done its job. A factory has a buyer. A restaurant has a diner. A transplant system has a customer who cannot shop elsewhere, who did not choose the product, and who may be too ill to complain about the service. That customer is a person whose kidneys have failed, together with the small circle of family and friends who organize their lives around the failure.

The transplant system has other stakeholders too. Donor families are customers of a different kind, because they are asked for consent in the worst hour of their lives and they are owed an honest process in return. Living donors are customers who volunteer an organ and a stretch of their own livelihood. Taxpayers purchase a good deal of this care. Transplant surgeons, coordinators, dialysis nurses, and registry analysts are employees of the process, and their burnout is a data point whether or not anybody records it. For the purposes of an audit, however, the primary customer is the patient, and the question that governs everything else is simple. What does that person need from the process, and does the process deliver it?

## The record: how large is the demand?

The national registry reports that 143,982 adults were listed for a kidney transplant during 2024, a figure the annual data report characterizes as approaching the peak recorded just before the pandemic (SRTR & OPTN, 2026a). The report's overview, which counts a candidate once for every center at which that candidate is listed, tallies 147,091 listings (SRTR & OPTN, 2026b). The gap between 143,982 and 147,091 is not an error. It is a reminder that a registry is a model of reality and not reality itself, and that every number in this book should be read with its definition attached.

New demand arrives faster than supply. A record 49,249 adults joined the kidney list in 2024, and 50,481 patients of all ages were added in total (SRTR & OPTN, 2026a). The previous year's report counted 47,838 additions against 28,142 kidney transplants, the highest number of transplants ever performed in a single year (SRTR & OPTN, 2025). Set those two figures beside each other. Even in a record year for surgery, the system added roughly 19,700 more names than it removed through transplantation. Whatever one thinks of any individual reform, the arithmetic of the inflow does not close.

Removals from the list tell a second story. According to the national registry's removal table for kidney candidates, deaths on the list ran 4,891 in 2020, 5,032 in 2021, 4,448 in 2022 and 3,803 in 2023, while removals because a candidate had become too sick for transplant ran 3,814, 3,920, 4,396 and 4,672 over the same years (Organ Procurement and Transplantation Network [OPTN], n.d.). The latest annual report shows the same crossing pattern: removals for death fell to 3,743 in 2024, and removals for being too sick rose to 4,901 (SRTR & OPTN, 2026a). Note that different publications count these categories slightly differently, which is why the figures in the annual report and the registry table do not match exactly.

[[FIG:removals|Figure 1.1. Kidney candidates removed from the waiting list, by reason, 2020–2023. Source: OPTN removal table (n.d.). Annual data report counts differ slightly because of population and definition.]]

## The reading: a falling death count is not necessarily good news

It would be comforting to read the declining number of deaths as proof that waiting has become safer. I want to resist that reading, and the reason is a lesson from quality engineering about the danger of a metric that can be moved without moving the thing it stands for. A candidate who is removed for being too sick is, in the registry's accounting, not a death on the list. Yet that candidate has been withdrawn from the only path that could have saved them. When deaths decline while too-sick removals climb, at least two explanations compete. One is that care is improving and fewer people are dying. The other is that the system is increasingly reclassifying decline, so that the same attrition flows through a different door. The registry figures alone cannot adjudicate between these explanations, and the honest course is to say that the question is open. What can be said is that a single headline metric, deaths while waiting, is an incomplete instrument. A proper dashboard would report deaths and too-sick removals together, and would follow delisted candidates for a fixed period afterward.

## The record: what a transplant is worth to the customer

Why does the customer wait so intently? Because the difference between the waiting room and the operating room is, statistically, enormous. In a landmark cohort study of 228,552 patients on long-term dialysis, the death rate was 16.1 per 100 patient-years among all dialysis patients, 6.3 among those on the transplant waiting list, and 3.8 among recipients of a first deceased-donor kidney (Wolfe et al., 1999). The authors also documented the cost of the first weeks, since mortality was higher right after surgery before it fell below the waiting-list rate. This study is a quarter-century old and the methods of the field have improved, so I cite it only as a foundational benchmark. The more recent national summaries, though they describe older cohorts, point in the same direction: among patients who started treatment in 2007, adjusted five-year survival was about 40.4% on dialysis, 73.7% after a deceased-donor transplant, and 87.0% after a living-donor transplant (United States Renal Data System [USRDS], 2014).

An honest reader must attach a caveat to every number in that paragraph. People who receive transplants are selected, in part, because they are healthier, so part of the survival gap reflects who is chosen rather than what the operation does. The best studies attempt to correct for this, as Wolfe and colleagues did by comparing transplant recipients against others who were also on the waiting list. Even so, the direction of the finding is not seriously disputed, and the magnitude is large enough to make access and timeliness the central quality characteristics of the whole enterprise.

## Translating the voice of the customer into measurable requirements

Lean Six Sigma translates what customers say they want into what the process must deliver, using a device called a critical-to-quality tree. One starts with a broad need, such as "I want to live," and decomposes it into requirements specific enough to measure. When I apply that device to the kidney patient, six branches emerge.

*Access.* The patient must be told that transplantation is an option, referred to a center, evaluated, and placed on the list. Chapter 5 shows that this gate leaks.

*Timeliness.* The patient must receive an offer before health declines past the point of eligibility. The measures here are time to listing, time to offer, and the rate of removal for deterioration.

*Quality of the organ.* The kidney that arrives must function and endure. Cold ischemia time, delayed graft function, and long-term graft survival are the instruments, and Chapter 6 examines them.

*Affordability.* The patient must be able to obtain the surgery and, crucially, to keep taking the immunosuppressive drugs afterward. Chapter 15 turns to this branch.

*Trust.* The patient and the donor family must believe that the process is clean and fair, because belief is the fuel that keeps donors registering. Chapter 10 treats trust as a process variable and not as a public-relations afterthought.

*Understanding.* The patient must be able to comprehend the options in plain language. Chapter 14 takes up the awareness problem.

[[FIG:voc|Figure 1.2. Voice-of-the-customer to critical-to-quality tree for the kidney patient. Author's analytic framework.]]

## A project charter for a national problem

Six Sigma projects begin with a charter, a short document that states the problem, the scope, and the goal in terms that can be checked later. I offer one here, in the spirit of an exercise and not a regulation.

:::note Project charter
**Problem statement.** In 2024, the national registry listed 143,982 adults for a kidney transplant while 29.3% of recovered kidneys went unused. Candidates continue to be removed for death or deterioration in numbers that the registry reports as between 3,700 and 4,900 each per year.
**Scope.** From the moment a patient with advanced kidney disease first meets a nephrologist to the first year after transplant, including the donor pathway and the payment pathway.
**Goal.** Reduce the share of recovered kidneys that go unused, reduce unexplained variation in referral, listing, and offer acceptance, and make the whole journey measurable in public.
**Out of scope.** Clinical decisions about any individual patient.
:::

The charter is deliberately modest. It claims no cure. It claims only that a country able to name the problem in numbers has already taken the first step toward solving it, and that a country unwilling to publish the numbers has not yet begun.

# Chapter 2: A Map Nobody Holds
EPIGRAPH: "I returned, and saw under the sun, that the race is not to the swift, nor the battle to the strong... but time and chance happeneth to them all."
BY: Ecclesiastes 9:11 (King James Version, 1611)

## SIPOC: the process on one page

Before improving a process, a Six Sigma team draws it, and the preferred drawing is a deliberately crude one known by its acronym, SIPOC. The letters stand for suppliers, inputs, process, outputs, and customers. The exercise forces a team to agree on where the process begins and ends and on who hands what to whom. I have drawn one for the kidney transplant system, and the first thing it reveals is how many hands are involved.

[[FIG:sipoc|Figure 2.1. SIPOC diagram of the kidney transplant process. Author's analytic framework.]]

On the supplier side stand dialysis facilities and nephrology practices that identify the patient, hospitals whose intensive care units identify potential deceased donors, the families who consent, the living donors who volunteer, and the 55 organ procurement organizations that coordinate recovery (Health Resources and Services Administration [HRSA], 2026a). The inputs are patients, organs, medical information, and money. The process itself runs through referral, evaluation, listing, donor identification, recovery, allocation, offer and acceptance, transport and preservation, surgery, and the long tail of follow-up. The outputs are transplants, graft survival, and patient survival. The customers are the patients, and, indirectly, everyone who pays.

## The record: who governs what, as of this autumn

The governance of this process has been in motion for several years, and the past six months have been busy. Federal oversight agency HRSA describes the creation of an independent, elected board of directors for the national transplant network, one that is separate from the contractor structure and intended to clarify decision-making authority and to reduce potential conflicts of interest (HRSA, 2026a). In April 2026 that board appointed a new director to fill a vacancy and granted one-year extensions to its president and vice president, explaining that recent disruptions, including contractor transitions and funding interruptions, had impaired its ability to move initiatives forward (HRSA, 2026b).

Later monthly updates, which Chapter 9 examines in detail, describe a steady program of reconstruction: new contracts, new officers, new requirements for deceased donation, and a higher registration fee.

I want to be careful about the provenance of these facts. They come from the oversight agency's own monthly summaries, so they reflect that agency's framing, and I found no independent press coverage that tested them. They are reliable as a record of what was decided. They are not evidence that what was decided will work.

## The reading: a process with many owners is a process with none

Lean thinking has a firm view about ownership. Every end-to-end process needs a single owner who is responsible for the whole, because a process that is owned only in pieces is optimized only in pieces. When I lay the kidney pathway across the page and ask who owns the whole of it, from the first nephrology appointment to the fifth year after surgery, I cannot find a name or an office. I find, instead, a relay of owners, each accountable for a segment and each measured by a different instrument.

The payment agency for Medicare measures organ procurement organizations by two rates and sorts them into tiers (Centers for Medicare & Medicaid Services [CMS], 2026). It measures kidney transplant hospitals, in its new payment model, by transplant volume, organ offer acceptance, and graft survival, with 60, 20, and 20 points available respectively (CMS, n.d.). It measures dialysis facilities, in a separate model, by home dialysis and by waitlisting and transplant rates (CMS, 2025). The oversight agency measures compliance with allocation policy (HRSA, 2026a). Each instrument is reasonable on its own. None of them is the patient's own measure, which is a single and merciless one: did I get a working kidney in time?

:::note The eight wastes, applied to the kidney pathway
Lean practitioners classify waste under eight headings, often remembered by the acronym DOWNTIME. Mapping them onto this system is a useful discipline, and every mapping below is the author's analytic reading and not a finding of any agency.
**Defects:** recovered kidneys that are never transplanted. **Overproduction:** none apparent, since demand exceeds supply. **Waiting:** the list itself, and the hours between offers. **Non-utilized talent:** patients and care partners who could contribute to navigation but are never invited. **Transportation:** the movement of organs across distance, which converts into cold ischemic time. **Inventory:** a waiting list that is also a stockpile of human potential. **Motion:** the repeated phone calls that precede acceptance. **Extra-processing:** redundant tests and paperwork at the handoffs.
:::

## The handoffs where the process leaks

A process fails most often at its seams. Four handoffs in the kidney pathway deserve scrutiny, and each one receives a chapter in this book.

The first seam lies between the dialysis chair and the transplant center. A patient must be told, referred, and evaluated, and each of those verbs is a possible exit. The second seam lies between the donor hospital and the organ procurement organization, where decisions about a possible donor are made under time pressure and, as Chapter 10 documents, have recently drawn federal scrutiny. The third seam lies between the offer and the acceptance, where a kidney is accepted or declined by an individual clinician on call. The fourth lies between the cooler and the operating table, where hours accumulate.

A Lean Six Sigma team would add to this a fifth observation about the seams. Each of them is a place where information is passed from one party to another, and each is therefore a place where measurement is either possible or it is not. A transparent system measures the seams. An opaque system measures the segments and assumes the seams will take care of themselves. The remainder of this book is an inspection of the seams.

## Why a map matters to a patient

I have laid out these diagrams and definitions with something close to affection, because I believe that a map is one of the most generous things one person can hand to another. Patients and care partners are routinely asked to navigate a process that no one can describe to them end to end. Services that offer a free orientation or a plain-language roadmap are not decoration; they are an attempt to supply, at the scale of one household, the map that the system as a whole has failed to supply at the scale of the nation. A country that handed every new dialysis patient a one-page SIPOC, and meant it, would be a better country.

In Part Two we begin to measure. The numbers are not kind, but they are clarifying, and clarity is the only kind of kindness that has ever fixed a bridge.
