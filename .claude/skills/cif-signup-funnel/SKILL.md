---
name: cif-signup-funnel
description: Audits and improves the Cold Ischemia Foundation volunteer sign-up funnel, from first visit to a submitted application on cif-volunteer-page.html, so more interested visitors finish signing up. Use when the user asks why people are not signing up, to shorten or fix the volunteer form, improve sign-up conversion, review the volunteer page, or check form analytics.
---

# CIF Sign-up Funnel Optimizer

## The funnel as built

1. Visitor lands on `cif-volunteer-page.html` (also linked from the sitewide nav).
2. Optional Volunteer Readiness training writes a summary into the hidden `trainingSummary` field.
3. `#volunteerForm` collects: name, email, phone, city/state, four long free-text answers (`qMotivation`, `qDiscovery`, `qFit`, `qDifficult`), connection, tracks, skills, hours, duration, conflicts, and a reference.
4. Submission posts to the Apps Script web app set as `formsEndpoint` in `cif-help.js`. `cif-forms-apps-script.gs` emails Jeff, sends the applicant an automatic thank-you, and logs a row to the "CIF Website Submissions" sheet.

## Audit checklist (run every time)

- Count required fields and required free-text boxes. Each required long answer is a drop-off point. Flag any required field that the first conversation with Jeff could collect instead.
- Phone width (390 px): every field visible, labels above inputs, tap targets at least 44 px, no horizontal scroll, keyboard type matches field (`type="email"`, `type="tel"`).
- Clarity: the page states, above the form, how long it takes, what happens next, and when they will hear back.
- Errors: submitting with a missing field shows a clear message next to the field and keeps everything typed.
- Success: after submit the visitor sees a confirmation that names the next step, not a blank form.
- Endpoint: `formsEndpoint` matches `^https://script.google.com/.+/exec$`. If not, the form cannot send; report this first.
- Analytics: GA4 tag `G-M95EH0B5BK`. Check that a `volunteer_form_start` event fires on first field focus and `volunteer_form_submit` fires on success. Add them if missing (`gtag('event', ...)`), no personal data in event parameters.

## Improvements, in order of payoff

1. Two-step form: step 1 is name, email, city/state, tracks and hours (under a minute); step 2 holds the reflective questions, clearly marked optional or "we can talk about this instead". Submitting step 1 alone must still create an application.
2. Show the time cost up front: "About 2 minutes. Jeff reads every application personally."
3. Link each track checkbox to its roles on the roles board (see the cif-volunteer-roles skill).
4. Save-as-you-go in `localStorage` (wrapped in try/catch) so a dropped connection doesn't lose a long answer; clear it on successful submit.
5. Never remove the conflict-of-interest question; CIF's independence depends on it. It may move to step 2.

## Rules

- Collect no more personal data than CIF uses. Never add fields for health details.
- If a change needs the backend (new field names, two-step submission), update `cif-forms-apps-script.gs` AND tell the user plainly that the script must be re-pasted and redeployed at script.google.com as jeffparke72@gmail.com before the change works. Claude cannot deploy Apps Script. Keep old field names working until the redeploy is confirmed.
- One change at a time when testing, so results are attributable.
- Run `python3 _tools/site_audit.py`, commit, push to `main`.

## Output to the user

What was found, what changed, and the one number to watch (form starts vs. submits).
