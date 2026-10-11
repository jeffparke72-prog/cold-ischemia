---
name: cif-whistleblower-serial
description: Writes the next weekly installment of "The Inside Files", the Cold Ischemia Foundation's 15,000-word serial investigation of kidney transplant and dialysis built from public-record whistleblower material. Finds a verified event no more than 90 days old, grades every claim, writes about 1,250 words with a timeline, charts and vintage plates, validates the file and opens a DRAFT pull request for the editor. Use when the user asks for the next installment, the weekly whistleblower article, the Inside Files, or to add or fix an installment, chart, plate or source.
---

# The Inside Files: weekly installment

One essay, released in about 12 weekly installments (about 15,000 words in total). The page is `inside-files.html`, drawn by `cif-serial.js` from `serial/installments.json`. Installment 1 (`_serial/build_installment_01.py`) is the worked example: copy its structure.

## What counts as a topic
A **hook event** dated within 90 days of the publish date, found in public records:
- congressional hearings, letters and testimony (House Ways and Means, Energy and Commerce, Senate Finance and HELP)
- HHS, CMS, HRSA, OIG and DOJ releases, reports and enforcement actions (OPO decertifications, False Claims Act settlements, corrective action plans)
- unsealed qui tam complaints and court dockets; state attorney general actions
- OPTN board and committee minutes; peer-reviewed or primary-source studies
- investigative reporting that links to documents
Older material may appear only as background and is labelled so on the timeline.

## What is out
- Leaked, hacked or anonymous material that cannot be verified. "Whistleblower" here means a named or on-the-record person, sworn testimony, a complaint or an agency finding.
- Naming a private individual as a wrongdoer unless a court or agency has made a finding. Use "alleged" until then.
- Anything from the Payhip books. Nothing from the books goes on the website.
- Money, donation or sponsorship language. No biography or disclosure sections.

## Weekly steps
1. **Sweep** (WebSearch standard, then extended for gaps). Pick one hook event from the last 90 days that adds something the previous installments did not. Prefer the under-covered angle (process, timing, who answers the phone) to a retelling of the headline.
2. **Collect sources** into the `sources` map (`S#`, title, publisher, date, type, https URL). Get the primary document if you can reach it. If you cannot open it, say so in `editor_note` and do not grade the claim A.
3. **Grade each claim** in `evidence`: A = we opened and quoted the primary document (set `primary_read: true`); B = a government source plus independent reports agree (two distinct publishers at least); C = a single or secondary source; X = disputed. Keep an honest `status` line for each.
4. **Write 1,000 to 1,400 words** as sections with ids including `reply` (the other side's position, given the same weight) and `unknown` (what we do not know). Cite with `{S#}`. Lead with the finding. Keep sentences plain. Explain every term the first time.
5. **Build the dynamic pieces**: a `timeline`, plus two or more of `waffle`, `elapsed`, `counter` and `reply` charts (see the types in `cif-serial.js`). Every number must come from a cited source; show the arithmetic in the data table. Add a `glossary` and a teaser for next week.
6. **Plates**: reuse or add vintage-style plates with `_tools/serial/make_plates.py`. They are original illustrations and are captioned that way. Archival photographs from the Library of Congress, NLM or Wikimedia Commons may be added only if the license and credit are recorded in the figure caption.
7. **Validate**: `python3 _tools/serial_build.py --self-test && python3 _tools/serial_build.py`. It enforces the 90-day rule, source completeness, grade rules, alt text, word range, weekly cadence and no conclusory wrongdoing language, and rewrites `inside-files.xml`.
8. **Look at it** in a browser (headless is fine): read tab, charts, evidence filter, source popovers.
9. **Open a draft pull request.** Never merge an installment without the editor reading the primary documents named in `editor_note`. Set `status: "draft-for-approval"` and change it to `"published"` when approved.

## Rules that do not bend
- Every named organization gets its reply on the page.
- If a claim rests on one summary, grade it C and say so.
- Do not call anything verified that you did not open.
- A 12-week serial outlasts the 90-day window, so the rule applies at each installment's publish date, and the compiled essay carries "as of" dates.
- The web tools in some sessions cannot reach hospital or agency sites. If so, say what you could not open.
