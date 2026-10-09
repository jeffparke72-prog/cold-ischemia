---
name: cif-film-builder
description: Builds cinematic explainer films, trailers and audio-visual pieces for the Cold Ischemia Foundation from a written script, with kinetic typography, animated numbers and charts, controllable background photos, a generated score with proper mixing, optional voiceover with automatic music ducking, and a sendable MP4. Use this whenever the user asks for a video, film, commercial, trailer, explainer, "cinematic", motion graphics, a video with music, a script turned into a video, background images or music for a recording, or a short film to post on social media or the website, even if they do not say "skill" or "film".
---

# CIF Film Builder

## What this makes
A 1920x1080, 30 fps film in which every frame is drawn at an exact time, so picture, captions and music never drift. The founder usually records the voiceover afterward, so the film carries the script as on-screen text. Typical length is 2 to 4 minutes.

Why it is built this way: the working environment cannot run video editors or fetch stock footage or music, but it can run a browser and ffmpeg. The film is a web page (`assets/film-engine.html`) driven by a JSON script; a render script captures it frame by frame and mixes the generated score.

## Workflow
1. **Write the script first** (it is what the founder reads). At the default pace of 2.6 words per second, 3 minutes is about 430 words and 3.5 minutes about 500. Short sentences. One idea per segment. If the film states facts, every figure needs a source shown on screen (`src`) and lawsuits or investigations must be described as allegations with their documented outcome. Follow the founder's voice and independence wording from the other CIF skills.
2. **Break it into segments** and choose a `type` for each: `title` (big lines), `stat` (animated number), `dots` (a grid that fills, for "83 percent of 104"), `cards` (up to four boxed facts), `list` (rows revealed one by one, good for naming organizations as text), `quote`. See the table below.
3. **Choose backgrounds and mood** (`references/images.md`, `references/music.md`).
4. **Set up a work folder**: `mkdir -p _filmwork/NAME`, copy `assets/film-engine.html` to `_filmwork/NAME/film.html` and your script to `_filmwork/NAME/script.json`. Serve the repo root: `python3 -m http.server 8765` in the background.
5. **Preview before rendering**: `node scripts/preview-frames.js --page /_filmwork/NAME/film.html --out /tmp/preview`. Open the PNGs. Fix overlapping text, unreadable numbers, faces behind negative claims. This takes seconds; a full render takes about 5 to 10 minutes per 3 minutes of film.
6. **Render**: `node scripts/render-film.js --page /_filmwork/NAME/film.html --script script.json --out /tmp/out/master.mp4` (add `--voice voice.wav` if there is a recording; `--from 0 --to 12` renders a short test). Run it in the background and wait for the finish notice.
7. **Make the sendable copy**: `bash scripts/encode-to-size.sh /tmp/out/master.mp4 /tmp/out/film.mp4 27`. Chat attachments cap at 30 MB. The master is far larger; never commit it to the repository.
8. **Verify**: extract two or three frames with ffmpeg and look at them; run `volumedetect` (mean about -16 dB); confirm the duration.
9. **Deliver** the MP4, the timestamped script in chat (the founder wants to read it there), and plain notes: what is sourced, what is unverified, what logos or images were not used and why.

## script.json
Top level: `pace` (words per second, default 2.6), `gap` (seconds between segments, .45), `lead` (seconds before the first segment, .8), `style` (`accent`, `accent2`, `alert`, `ink`, `bar` for letterbox height, 120 by default, 0 for none), `bg` (default background controls), `music`, `end`, `segments`.

Every segment: `id`, `type`, `text` (the voiceover; it also becomes the captions, revealed word by word), `dur` (override length in seconds; needed when `text` is empty), `t0` (force a start time, for syncing to a recording), `captions:false`, `center:true` (captions mid-screen, for title and quote scenes), `src` (source line shown bottom left), `bg` (per-segment background), `tone` ([r,g,b] base color), `intensity` (0 to 1, drives the music), `hits` (fractions where a boom lands), `heartbeat`.

| type | fields |
|---|---|
| `title` | `lines: [{t, c}]`, `kicker` |
| `stat` | `stat: {value, prefix, suffix, label, sub:[...], c, plain}` (`plain:true` for years, no thousands comma) |
| `dots` | `dots: {total, lit, cols, special, c, stat:{big,label,c}, notes:[{t,c}]}` |
| `cards` | `cards: [{big, head, sub, note, c}]` (numbers in `big` count up; a year stays a year) |
| `list` | `rows: [{t, s}]` |
| `quote` | `quote: {text, by, size}` |

Colors accept `ink`, `accent`, `accent2`, `alert`, `dim` or any CSS color. `end`: `{headline, sub, lines:[...], strong: n (how many lines are bright), hold: seconds}`; the end card is where disclaimers and the source list go.

A full working example is `assets/sample-script.json`.

## Hard-won rules
- Keep text out of the top and bottom 120 px (letterbox) and the bottom 250 px is the caption zone.
- Never put another organization's logo in the film (`references/images.md`). Name organizations as text.
- Do not claim or imply more than the cited source says. When in doubt, shorten the claim.
- A film that is longer than the founder can read at about 156 words per minute will not sync; re-time or lengthen the segments.
- Many environments render only about 12 frames per second; budget time accordingly and run long renders in the background.
- If an image fails to load the engine warns and continues on the dark background: check the console output, do not ship a film that silently lost its photos.
