# Music and mix

The engine generates its own score in the browser (Web Audio), so there is nothing to license and nothing to download. It is deterministic: the same script gives the same music.

## What the score is made of
- **Drone:** three low sawtooth voices on the mood's root note. It swells and brightens per segment according to `intensity` (0 to 1).
- **Pads:** four-chord progression in six-second bars; the last two segments switch to a "lift" progression (the turn toward hope or resolution) unless `music.lift` is false.
- **Piano:** sparse single notes over the chords. Turn off with `music.piano: false`.
- **Heartbeat:** a slow double pulse. Use it only where tension should be felt (set `heartbeat: true` on a segment, or `music.heartbeat: true` for the opening).
- **Hits:** a deep boom. Stat, dots and cards segments get one automatically at 10 percent in; any segment can set `hits: [0.2, 0.6]` (fractions of its length). Place a hit on the number the voice says, not on filler.
- **Risers:** a filtered noise sweep before each segment, so every change of scene is felt before it is seen.

## Moods (`music.mood`)
- `ominous` (D minor, dark pads, lift to D major): exposés, warnings, accountability. Default.
- `hopeful` (C major, warmer pads): launches, community, stories of people helping each other.
- `neutral` (A minor, restrained): explainers where the numbers should carry the weight.

## Controls
`music.level` (0 to 1, default 0.9) is the overall level. `intensity` per segment shapes the drone. `lift:false` keeps a single emotional color all the way through. For a more serious tone, raise `intensity` on the numbers and keep `heartbeat` to one or two segments; for a gentler tone use `hopeful`, `piano:true`, `heartbeat:false`.

## Voice
If the film has a voiceover, pass `--voice voice.wav` to render-film.js. The music is automatically ducked under speech (sidechain compression) and the final mix is loudness-normalised. Time the picture to the voice: either record to the on-screen text, or set each segment's `t0` and `dur` from the real recording. Without a voice the film is written for roughly 156 words per minute (`pace: 2.6` words per second); tell the speaker that pace, because a slower reader will fall behind the captions.

## Checks before delivering
Run `ffmpeg -i film.mp4 -af volumedetect -vn -f null /dev/null`. Expect a mean around -16 dB and a peak near -1.5 dB. A mean far below -22 dB means the score did not render.
