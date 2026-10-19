---
name: cif-first-task
description: Gets every new Cold Ischemia Foundation volunteer to a real, finished contribution in their first week by keeping a queue of ready-made 30-minute starter tasks per track and matching each new volunteer to one. Use when the user asks for starter tasks, first assignments for new volunteers, what to give a new volunteer, a volunteer task queue, or why volunteers go quiet after signing up.
---

# CIF First-Task Launcher

A volunteer who finishes something real in week one usually stays. One who waits for instructions usually doesn't.

## Where things live

- Task queue: `data/starter-tasks.json`. One object per task:

```json
{
  "id": "cite-check-accountability-01",
  "track": "data",
  "title": "Check five figures on the Accountability Atlas",
  "minutes": 30,
  "brief": "Open accountability.html. For the first five figures, open the linked source and confirm the number matches. Note any that don't.",
  "done_when": "You've sent Jeff a list of the five figures marked OK or Mismatch, with the source link for each.",
  "example": "Figure 3: OK, source matches (link).",
  "status": "ready",
  "assigned_to": ""
}
```

- Tracks are the form's `tracks` values: `patient-support`, `policy`, `content`, `data`, `social`, `events`, `admin`. Volunteers who ticked `unsure` get an `admin` or `data` task, the easiest to start remotely.
- Assignment records live in the "CIF Website Submissions" sheet, never in the repo. The repo holds tasks only, no volunteer names or emails.

## Keeping the queue stocked

- Aim for at least 3 `ready` tasks per track. On each run, report any track below 3 and draft new tasks to fill it.
- Draw tasks from real, useful work found on the site: the weekly cif-site-audit report (broken sources, readability fixes), Research Digest fact checks, caption files for videos, alt text for images, letter templates to proofread, partner organizations to research from public sources.
- Every task is 30 minutes or less, needs no special access, has a concrete `done_when`, and includes an `example` of finished work.
- Never assign patient-facing work as a first task. Patient-support volunteers start with a listening or resource-mapping task, never with direct contact.

## Matching

1. Read the new application's first ticked track.
2. Pick the oldest `ready` task in that track, set `status` to `assigned` in the sheet record, not the repo.
3. Hand the task brief to the cif-welcome-sequence skill as `{first_task}` for message 3.
4. When the volunteer reports back, mark it done and log it for the volunteer impact tally.

## Rules

- Tasks must be real work Jeff will actually use. No busywork.
- Do not mention dialysis or transplant in task copy. No money language. No medical advice.
- Commit task-queue changes with a clear message and push to `main`.

## Output to the user

Queue health per track (ready / assigned / done), new tasks drafted, and any volunteer who received a task more than 7 days ago without reporting back.
