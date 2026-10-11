---
name: cif-social-autopublish
description: Announce new Cold Ischemia Foundation website content (new pages, new papers) on X, LinkedIn, Facebook and Instagram automatically. Use when the user asks to connect social media, check which accounts are connected, preview or re-send a social post, change post wording or hashtags, or debug a failed social post.
---

# Social autopublish

New first-party content on main triggers `.github/workflows/social-autopublish.yml`, which runs `_tools/social/social_publish.py`.

## What counts as new content
- A newly added top-level `*.html` page (except those in `_social/config.json` `skip_pages` / `skip_prefixes`).
- A newly added `files/*.pdf` paper.
- Never the third-party news feed (`news/`), edits to existing pages, or anything under `_book`, `_paper*`, `_film*`.
- Nothing from the Payhip books goes on the site, so books are never announced from here.

## How it behaves
- Preview by default off-push: manual runs are dry unless `live=true`. Pushes to main post live.
- A platform posts only if **all** its GitHub Secrets exist. Missing ones are skipped, not errors.
- Dedupe: `_social/posted.json` records item -> platform -> post id. Never delete entries to "retry" a success.
- Max 3 items per run (`max_per_run`), 3 attempts per platform, one platform failing never blocks the others.
- Instagram needs an image: the script draws a 1080x1080 card into `_social/cards/`, commits it, waits until the URL returns 200, then publishes.

## Commands
```
python3 _tools/social/social_publish.py --check            # which platforms are READY
python3 _tools/social/social_publish.py --self-test        # offline tests
python3 _tools/social/social_publish.py --only about.html  # dry-run preview of the copy
```
Re-send or preview from GitHub: Actions -> Social autopublish -> Run workflow (set `live`, `files`).

## Editing wording
Copy lives in `x_text()` and `long_text()`; hashtags in `_social/config.json`. X posts are held to 280 with URLs counted as 23. Run `--self-test` after edits.

## Honesty rules when talking to the user
- Claude cannot create or log into the user's social accounts or developer apps. The user must create them and add the secrets (see `_social/SETUP.md`). Do not claim a platform is connected until `--check` prints READY and a live post has succeeded.
- X API posting is paid (pay-per-use); Instagram and LinkedIn need app review/approval. Say so; check each platform's official docs, because these terms change.
- No donation, sponsorship or money language in any post.
