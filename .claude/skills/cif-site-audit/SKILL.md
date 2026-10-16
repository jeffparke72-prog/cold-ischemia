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
   - links to `#anchors` that aren't on the target page
   - duplicate `id`s on one page
   - identical duplicate HTML files
   - pages sharing the same `<title>`
   - paragraphs repeated within a page, and long paragraphs repeated across pages
3. External links: the workspace shell cannot reach outside sites, so the script only lists them in `_audit/external-links.json`. Spot-check the most important ones (BHOC, Payhip, Fundrazr, government links) with WebFetch, at most ~15 per run, and report any that fail or redirect somewhere unexpected.
4. Fetch the live homepage and `bhoc.html` with WebFetch to confirm the site is up.
5. Judge the findings before reporting. Shared nav, footer and boilerplate repeated across pages is expected; flag only content that looks accidentally duplicated. Underscore folders (`_book`, `_paper*`, `_film*`, `_serial`, `_scripts`) are drafts and are skipped by default; add `--include-drafts` only if the user asks about them.

## Fixing

- Do NOT change the site on a scheduled run. Report only.
- When the user asks for fixes: fix clear-cut problems (a mistyped filename, a missing anchor, a doubled paragraph), never overwrite the homepage wholesale, keep the full sitewide nav, commit with a clear message and push to `main`.
- Never delete pages or files without the user's explicit say-so.

## Report format

Short and phone-readable: one line saying whether the site is healthy, then a short list of real problems with the page name and what's wrong, then what you'd fix. No raw dumps.
