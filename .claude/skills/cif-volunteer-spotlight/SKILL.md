---
name: cif-volunteer-spotlight
description: Produces Cold Ischemia Foundation volunteer spotlights, a short profile of one volunteer published on the volunteer page with a matching social card and a 60-second video script, to turn volunteers into ambassadors who recruit the next wave. Use when the user asks for a volunteer spotlight, volunteer story, volunteer feature, volunteer of the month, a thank-you post for a volunteer, or social content showing who volunteers with CIF.
---

# CIF Volunteer Spotlight Producer

People join causes because someone like them already did. A spotlight shows a real person, what they do, and how easy it was to start.

## Consent comes first

- Nothing is published without the volunteer's written consent, given by email reply or form, stating exactly what may be used: first name only or full name, photo yes or no, city yes or no.
- Store consent in the "CIF Website Submissions" sheet (a "Spotlight consent" tab), never in the repo.
- Never include health details, diagnoses, or a loved one's medical history, even if the volunteer offers them. Their reason for joining can be described in general terms ("someone close to them") only with their approval of the exact wording.
- The volunteer approves the final text before it goes live. If consent is withdrawn, remove the spotlight from the site and from scheduled posts the same day.

## Questionnaire (send as one email, five questions)

1. What do you do with CIF, in one or two sentences?
2. What made you sign up?
3. What was your first task, and how long did it take?
4. What surprised you about volunteering here?
5. What would you tell someone who's on the fence?

## Outputs

1. Site: a spotlight card in a "Volunteer Spotlights" section on `cif-volunteer-page.html`, newest first, at most 6 shown. Data in `data/spotlights.json` (only consented fields). Photo, if consented, cropped square and saved as `spotlight-<id>.jpg`.
2. Social card: 1080x1080 image in CIF palette (navy #1B2A4A, gold #C9A84C, teal #2E7D74), name, one-line quote, "Volunteer with CIF" and the volunteer-page URL. Post copy for LinkedIn, X, Instagram and Facebook in Jeff's first-person voice, queued through Buffer by the user.
3. Video script: about 60 seconds (roughly 150 words) for the cif-film-builder skill or for Jeff to read.

## Writing rules

- Use the volunteer's own words for quotes; edit only for length, never meaning. Show the edited quote to them.
- One clear call to action: the volunteer page.
- Do not mention dialysis or transplant. Do not mention the Cold Truths podcast. No money or donation language.
- Deliver post copy as plain text, never inside code blocks, with nothing appended after the copy.

## Steps

1. Draft the questionnaire email for the volunteer the user names.
2. When answers and consent arrive, write the spotlight, card text and video script; send the draft to the user to pass to the volunteer for approval.
3. After approval, add the spotlight, render the card, run `python3 _tools/site_audit.py`, commit and push to `main`.

## Output to the user

The approved spotlight live on the site, the social card file, the four post versions, and the video script.
