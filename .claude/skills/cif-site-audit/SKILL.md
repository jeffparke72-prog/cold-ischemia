---
name: cif-site-audit
description: Weekly health check of the Cold Ischemia Foundation website (coldischemia.foundation) for broken links, missing anchors, duplicate pages and repeated content. Use when the user asks to check, audit or scan the site, find broken links or duplicated data, or when the Friday scheduled site check runs.
---

# CIF site audit

Checks every HTML page in the `cold-ischemia` repo (GitHub Pages source for coldischemia.foundation).

## Steps

1. Pull the latest `main`.
2. Run `python3 _tools/site_audit.py --out _audit/report.md`. It reports:
   - broken internal links and image/script references (files that don't exist)
   - buttons and controls whose onclick/onchange handler calls a function that does not exist
   - links to `#anchors` that aren't on the target page
   - duplicate `id`s on one page
   - identical duplicate HTML files
   - pages sharing the same `<title>`
   - paragraphs repeated within a page, and long paragraphs repeated across pages
3. External links: the workspace shell cannot reach outside sites, so the script only lists them in `_audit/external-links.json`. Spot-check the most important ones (BHOC, Payhip, Fundrazr, government links) with WebFetch, at most ~15 per run, and report any that fail or redirect somewhere unexpected.
4. Fetch the live homepage and `bhoc.html` with WebFetch to confirm the site is up. Grep every page for BHOC links: the only allowed BHOC domain is bhoctherapeutics.com (see the BHOC rule in CLAUDE.md); replace any other BHOC domain.
5. Judge the findings before reporting. Shared nav, footer and boilerplate repeated across pages is expected; flag only content that looks accidentally duplicated. Underscore folders (`_book`, `_paper*`, `_film*`, `_serial`, `_scripts`) are drafts and are skipped by default; add `--include-drafts` only if the user asks about them.

## Fixing

- Jeff's standing rule: anything duplicated by accident (copy-pasted text, copied pages, stray `_1`/`-embedded` copies) gets removed, and anything that doesn't work (broken buttons, links, images) gets fixed. Repeated text is only acceptable when it clearly makes sense, such as each edition of a guide carrying its own disclaimer page.
- On a scheduled run, fix clear-cut problems directly (dead links, missing images recoverable from the repo, broken button handlers, accidental duplicate pages and copied text), commit with a clear message and push to `main`. Report anything that needs a judgment call instead of guessing.
- When the user asks for fixes: fix clear-cut problems (a mistyped filename, a missing anchor, a doubled paragraph), never overwrite the homepage wholesale, keep the full sitewide nav, commit with a clear message and push to `main`.
- Removing accidental duplicate copies is pre-approved by Jeff. Never delete an original page (one that is linked from the site or is the only copy of its content).

## Report format

Short and phone-readable: one line saying whether the site is healthy, then what you fixed (page and what changed), then anything left for Jeff to decide. No raw dumps.
