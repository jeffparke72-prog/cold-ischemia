---
name: cif-welcome-sequence
description: Writes and maintains the Cold Ischemia Foundation's personal welcome email sequence for new volunteers, sent from Jeff's own Gmail through the site's Apps Script backend. Use when the user asks for volunteer welcome emails, a follow-up or check-in email to new volunteers, changes to the automatic reply new applicants get, or an onboarding email series.
---

# CIF Personal Welcome Sequence

New volunteers should hear from Jeff, in Jeff's voice, within minutes, and again before their enthusiasm fades.

## How sending works today

- `cif-forms-apps-script.gs` (deployed as a web app under jeffparke72@gmail.com) already sends one automatic reply, `REPLIES.application`, the moment an application arrives, and logs the applicant to the "CIF Website Submissions" sheet.
- There is no working @coldischemia.foundation address. Mail comes from jeffparke72@gmail.com with Jeff's signature. Never claim otherwise.
- Claude cannot deploy Apps Script. Any change to the script must be re-pasted and redeployed by Jeff at script.google.com. Say so every time the script changes.

## The sequence

| # | When | Purpose |
|---|---|---|
| 1 | Immediately (existing `REPLIES.application`) | Thank them, say Jeff reads every application, say when they will hear back |
| 2 | Day 2 | What CIF actually does, in four sentences, plus the free toolkits link |
| 3 | Day 4 | Their first task, matched to the first track they ticked (see cif-first-task) |
| 4 | Day 10 | Personal check-in: "How did the first task go? Anything blocking you?" |

Messages 2–4 are sent by a time-driven Apps Script trigger (`sendWelcomeSteps_`, daily) that reads the sheet, checks a `Welcome step` column, and sends the next due message. Add the column and function to `cif-forms-apps-script.gs`; keep `doPost` unchanged except for writing the initial step value.

## Writing rules

- First person, Jeff speaking, warm and direct, short paragraphs that read well on a phone. Use the person's first name.
- Each message has exactly one ask.
- Honest about automation: the footer of messages 2–4 says these notes are scheduled and that a reply reaches Jeff personally.
- Do not mention dialysis or transplant. Do not mention the Cold Truths podcast. No money or donation language. No medical advice.
- Merge fields: `{first_name}`, `{track_label}`, `{first_task}`. If a field is missing, fall back to neutral wording; never send a raw placeholder.
- Every message includes an unsubscribe line: "Reply STOP and I'll take you off these updates." The script must honor STOP by marking the row and sending nothing further.

## Steps

1. Draft or revise the messages and show them to the user for approval before any script change.
2. Update `REPLIES` and add the step logic to `cif-forms-apps-script.gs`, with a `testWelcome()` function that sends all four to OWNER_EMAIL only.
3. Commit and push, then give the user the redeploy steps from the top of the script file, plus: in the Apps Script editor add a time-driven trigger for `sendWelcomeSteps_`, daily, 9–10 am.
4. Ask the user to run `testWelcome()` and confirm the four test emails arrived before calling it live.

## Output to the user

The approved messages, what changed in the script, and the exact redeploy and trigger steps.
