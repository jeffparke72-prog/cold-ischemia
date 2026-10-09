# Background images and logos

## Where images may come from
Only files already in the repository or created by the engine. In many working environments stock-photo sites, social networks and organization websites are blocked, and inventing or scraping images is not allowed. Good local sources: the site's own photos and banners (for example `/hero-banner.jpg`, `/march-for-care.jpg`, `/jeff-marie-founders.png`, `/marie_and_jeff.jpg`, `/united_we_stand.jpg`), and graphics created for the project. Reference them with root-absolute paths such as `/hero-banner.jpg`.

## Controls (global `bg`, overridden per segment `bg`)
| key | meaning | default |
|---|---|---|
| `src` | image path | none (the dark animated background shows) |
| `dim` | darkness laid over the photo, 0 to 1 | 0.6 |
| `blur` | blur in pixels (use 8 to 20 to turn a photo into a texture) | 0 |
| `zoom` | slow push-in over the segment (0.05 = 5 percent) | 0.05 |
| `pan` | `left`, `right`, `up`, `down` or `none`: slow drift | none |
| `fit` | `cover` fills the frame; `contain` shows the whole image over a blurred copy of itself | cover |

Rules that keep it cinematic and readable:
1. Text must always win. If a photo has busy detail behind a number, raise `dim` to 0.7 or more, or add `blur`.
2. Faces of real people are treated with care: never put a person's photo behind an accusation or a negative statistic. Use a texture (blur) or no photo for those segments.
3. Reuse the same `src` in consecutive segments for a continuous shot; changing the image crossfades.
4. Vary movement: alternate `pan` directions between segments; use `zoom` for emphasis and `none` for calm.
5. Photos of crowds and places are for context; a headshot belongs on the founder's own words or an opening title.

## Logos of other organizations
Do not download or recreate other organizations' logos. They are usually unreachable from the working environment, they are trademarks, and a critical film using them raises legal risk. Show the organization's name as typeset text (the `list` and `cards` scene types do this) and tell the founder that official logos can be added in a video editor after a lawyer's review. The Foundation's own logo (`/cold-ischemia-logo-clear.png`) is fine to use.

## Checking
Run `scripts/preview-frames.js` and look at one frame per segment. Check: legible text, no face behind a negative claim, no pixelation (images smaller than 1920 wide look soft; raise `blur` or use `contain`).
