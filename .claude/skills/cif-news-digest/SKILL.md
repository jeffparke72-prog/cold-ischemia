---
name: cif-news-digest
description: Builds the Cold Ischemia Foundation's weekly research digest for kidney, transplant, living-donor and care-partner topics. Finds recent, verified, peer-reviewed or primary-source research that mainstream outlets rarely cover, checks who funded it, explains why it matters to patients and care partners, and packages each item as an X (Twitter) post and thread plus a Facebook post and story card. Use this whenever the user asks for the news digest, weekly digest, research roundup, "what's new in kidney/transplant research", content for Facebook or X, a post built from a journal article or government report, or any curated, sourced, hard-hitting education content for patients and care partners, even if they never say "skill" or "digest".
---

# CIF News Digest

## Why this exists
Large advocacy organizations curate "news" that is shaped by their donors. CIF has no industry donors, so it can do what they cannot: pick research because it matters to patients and care partners, say who paid for it, and say what it does not show. The digest is the proof. Every item must survive a hostile fact-check, because one wrong number hands critics a reason to ignore everything else.

The audience is patients, living donors and care partners. Write for an intelligent adult under stress: plain words, real numbers, no jargon without a translation, no hype, no medical advice.

## The deliverable: a 1,000-word essay, downloadable from the site
Every issue is one cohesive essay of about 1,000 words (title, deck, headings and body; sources and the verification note are extra). A bulleted list of links is not a digest. The essay should read like a person who has read the papers explaining them to a friend: one human opening, one section per finding (each with a verified number set apart as a big stat), what each finding cannot show, who paid for it, one question to take to the care team, and a closing that names the thread running through the week.
It must be downloadable directly from the site as a PDF, not only readable on screen. The build for this is in the repo: put the essay in `_digest/issue-NNN-essay.md` (format below), set its status in `_digest/status.json`, run `python3 _tools/build-digest.py`, then (with the repo served on port 8765) `node _tools/digest-pdf.js`. That produces `research-digest-NNN.html` (the readable page) and `research-digest-NNN.pdf` (the download), and updates `research-digest.html` (the index). Before delivering, open the PDF and confirm the page count, the download link and that no fact is unflagged.
Essay file format: first line `# Title`; second line `*Deck / issue line*`; `## Section` headings; plain paragraphs; `[[STAT 1,863|what the number counts]]` for each big number; a `## Sources` list of `- ` bullets; a `## Verification status` paragraph; a final italic disclaimer line.
Status stays `draft` (the page and PDF show a visible DRAFT banner) until every fact is verified and the user approves; then set it to `published`. Never merge or post a draft as final.

## The workflow
1. **Scope the week.** Default window: the last 30 to 90 days. Topics: kidney failure and dialysis, transplant access and outcomes, living donation, care partners and caregiving, policy and payment rules, and industry influence on patient advocacy. If the user names a topic, narrow to it.
2. **Find candidates** with the search strategy in `references/sources.md`. Pull 12 to 20 candidates, then cut to 4 to 6 finalists.
3. **Apply the "not mainstream" test** (below) and the **credibility ladder** (below). Drop what fails.
4. **Verify every finalist** with the checklist below. Record what you confirmed and how.
5. **Write the essay** (about 1,000 words) as described above. Keep the structured item notes from `assets/issue-template.md` as your working notes and for the flags list.
6. **Package for social** using `references/social-formats.md`.
7. **Deliver in chat first** (the essay text and the PDF), then save to the repo. Do not publish to the site or post anywhere until the user approves.

## The "not mainstream" test
Prefer research a patient would not already have seen. For each candidate, ask: has it been the subject of a wire story, a network segment or a major-outlet article? A single news hit does not disqualify it, but if it has saturated coverage, either skip it or add something the coverage left out (the funding, the limits, the finding the headline buried). Good sources of unreported material: original research in specialty journals, registry and agency reports, oversight reports (HHS OIG, GAO, MedPAC), Federal Register proposals with comment deadlines, and qualitative studies of patient and caregiver experience.

## Credibility ladder
- **Tier 1:** peer-reviewed journal article with a DOI or PubMed ID.
- **Tier 2:** government, registry or oversight report (OPTN/SRTR, USRDS, CMS, OIG, GAO, MedPAC).
- **Tier 3:** preprint or conference abstract. Allowed only with a visible "NOT PEER REVIEWED" label.
- **Never:** press releases, blogs, social posts, or industry white papers presented as evidence. If one is the *subject* (for example an industry claim being examined), say so explicitly.

## Verification checklist (every item, no exceptions)
Each of these has to be confirmed from the source or from two independent search results that agree. If you cannot confirm it, do not state it.
- The paper exists: title, journal, year, and a DOI or PMID. Never construct or guess an identifier.
- Date is inside the window, and it is not a correction or a retraction.
- Design and sample size (cohort, trial, qualitative interviews, registry analysis; how many people).
- The headline number, copied exactly with its unit and denominator.
- **Who funded it and the authors' disclosed conflicts.** This is CIF's signature line. If you cannot read the disclosure, write "Funding and conflicts: not confirmed. Check the article's disclosure section before posting."
- Limitations the authors state, plus any obvious one (single center, small sample, observational design cannot show cause).
- Wording discipline: association is not cause; "found" and "reported" are not "proved".

## When your tools are limited
Some environments block journal sites. Then work from search-result metadata and mark each item **VERIFY BEFORE POSTING** with exactly what is still unconfirmed. Say plainly that verification was limited. A smaller, honest issue beats a bigger, shaky one.

## Voice and ethics
- Hard-hitting means precise, not loud. The strongest line is a verified number next to a plain sentence about what it means.
- No medical or legal advice. Close every issue with: "Educational, not medical advice. Talk to your healthcare team. In an emergency, call 911."
- Describe lawsuits and investigations as allegations with their documented outcome. Name organizations only when the record supports it, and cite it.
- Independence line, when used, must match the pledge: no donations, no funding from drug, biologic, device or pharmaceutical companies, dialysis organizations, insurers, hospital systems, or advocacy organizations funded by them; fees only for services requested, never buying influence.
- No raising money, no calls to donate.
- Founder voice for posts: direct, plain, narrative, no bullet lists in long posts, no hype.

## Output rules
Deliver the issue in the chat as readable text, not only as a file: the user expects to see the words. Then save the draft file. Always end by listing anything flagged VERIFY BEFORE POSTING.
