---
name: cif-volunteer-roles
description: Designs and maintains the Cold Ischemia Foundation's catalogue of specific, bounded volunteer micro-roles and the filterable roles board on cif-volunteer-page.html. Use when the user asks to create, add, update, retire or reword volunteer roles, write role descriptions or role cards, explain "what volunteers can do", or post a call for a specific kind of volunteer.
---

# CIF Volunteer Role Architect

People say yes to a specific, bounded ask ("check five citations this week, about 2 hours") far more often than to "help us". This skill turns CIF's real work into role cards a stranger can understand in ten seconds.

## Where things live

- Roles data: `data/volunteer-roles.json` (create it on first run). One object per role. It must live in `data/`, not `_data/`: GitHub Pages does not publish underscore folders, so the page could not load it.
- Roles board: a section on `cif-volunteer-page.html` with id `roles`, placed ABOVE the application form, rendered from the JSON by a small inline script, filterable by track and hours.
- The application form's `tracks` checkboxes are the canonical track list. Every role must map to exactly one of these values: `patient-support`, `policy`, `content`, `data`, `social`, `events`, `admin`. Never invent a track without also adding it to the form and to `LABELS` in `cif-forms-apps-script.gs`.
- The form's `hours` options (`1–4 hours`, `5–9 hours`, `10–19 hours`, `20+ hours`, `Project-based / as-needed only`) are the canonical commitment bands.

## Role card schema

```json
{
  "id": "citation-checker",
  "title": "Citation Checker",
  "track": "data",
  "hours": "1–4 hours",
  "remote": true,
  "outcome": "Every statistic on a CIF page traces to a working primary source.",
  "you_will": ["Open the page you are assigned", "Check each figure against its linked source", "Log anything broken or out of date"],
  "first_task": "Check the five statistics on one assigned page (about 30 minutes).",
  "skills": "Careful reading. No medical background needed.",
  "supervised_by": "Jeff A. Parke",
  "status": "open",
  "review_by": "2027-01-31"
}
```

## Steps

1. Inventory real work: read `projects.html`, `command-center.html`, the toolkits, Field Notes, the Research Digest and any open items the user names. A role exists only if there is real, recurring work behind it and someone to supervise it. Never invent work to pad the board.
2. Break each work stream into units of 1–4 hours with a visible outcome. Write the card in plain language at about an 8th-grade reading level.
3. Every card needs a `first_task` that takes 30 minutes or less, so a new volunteer can finish something in their first week.
4. Ask the user to confirm the list before publishing if roles are new; edits to wording on existing roles can go straight through.
5. Render: update the JSON, make sure the roles section reads it, and keep the full sitewide nav untouched. Cards stack on phones; filters are real `<button>` elements with `aria-pressed`.
6. Expire: any role past `review_by` or marked `closed` is hidden from the board. On each run, list roles within 30 days of `review_by` for the user to renew or retire.
7. Validate with `python3 _tools/site_audit.py`, then commit with a clear message and push to `main`.

## Writing rules

- Lead with the outcome, not the duty. "Every letter reaches the right office" beats "data entry".
- No medical advice roles. Patient-support roles listen, point to CIF's free resources and escalate; they never advise on treatment.
- Do not mention dialysis or transplant in role titles or card copy. Do not mention the Cold Truths podcast. No money or donation language anywhere.
- No invented numbers ("join 200 volunteers") unless the figure is real and current.

## Output to the user

One short message: roles added, changed or retired, and any roles due for review.
