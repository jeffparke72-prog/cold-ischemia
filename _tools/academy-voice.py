#!/usr/bin/env python3
"""Cold Ischemia Foundation Academy: renders the presenter's narration for every course scene.

  python3 _tools/academy-voice.py MODEL_DIR            render anything new or changed
  python3 _tools/academy-voice.py MODEL_DIR --only c1  one course

Needs: pip install kokoro-onnx soundfile numpy  (+ ffmpeg), and model.onnx + voices.bin from
https://github.com/thewh1teagle/kokoro-onnx/releases (model-files-v1.0) in MODEL_DIR.

Writes academy/audio/<scene-key>.mp3 and academy/audio/manifest.json, which holds each clip's
duration, a 25-frames-per-second mouth-opening envelope for the presenter, and a hash of the text,
so only edited scenes are re-rendered.
"""
import hashlib, json, os, re, subprocess, sys, tempfile
import numpy as np, soundfile as sf
from kokoro_onnx import Kokoro

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
AC = os.path.join(ROOT, 'academy')
OUT = os.path.join(AC, 'audio')
VOICE, SPEED, FPS = 'am_michael', 0.95, 25
MD = sys.argv[1] if len(sys.argv) > 1 and not sys.argv[1].startswith('--') else '/tmp/kk'
ONLY = sys.argv[sys.argv.index('--only') + 1] if '--only' in sys.argv else None
SHARD = [int(x) for x in sys.argv[sys.argv.index('--shard') + 1].split('/')] if '--shard' in sys.argv else None  # e.g. 0/2
MERGE = '--merge' in sys.argv

# Say things the way a person would, so the voice never spells or stumbles.
SAY = [
    (r'\beGFR\b', 'e G F R'), (r'\bOPOs\b', 'O P Os'), (r'\bOPO\b', 'O P O'), (r'\bOPTN\b', 'O P T N'),
    (r'\bBHOC\b', 'B H O C'), (r'\bESRD\b', 'E S R D'), (r'\bESKD\b', 'E S K D'), (r'\bCKD\b', 'C K D'),
    (r'\bUSRDS\b', 'U S R D S'), (r'\bMedPAC\b', 'Med PAC'), (r'\bHHS\b', 'H H S'), (r'\bCMS\b', 'C M S'),
    (r'\bFDA\b', 'F D A'), (r'\bAB 290\b', 'A B two ninety'), (r'\bForm 990\b', 'Form nine ninety'),
    (r'\bDMAIC\b', 'D MAIC'), (r'\bIOTA\b', 'Iota'), (r'\bAARP\b', 'A A R P'), (r'\bFMLA\b', 'F M L A'),
    (r'\bDOJ\b', 'D O J'), (r'\bOIG\b', 'O I G'), (r'\bNEJM\b', 'New England Journal of Medicine'),
    (r'\bKDPI\b', 'K D P I'), (r'\bHIPAA\b', 'hippa'), (r'\bCMS 2728\b', 'C M S twenty-seven twenty-eight'), (r'\bSchedule I\b', 'Schedule one'),
    (r'\bSHIP\b', 'ship'), (r'Kt/V', 'K T over V'), (r'ClinicalTrials\.gov', 'clinical trials dot gov'), (r'\bNLDAC\b', 'N L D A C'),
    (r'\bvs\.', 'versus'), (r'\bDr\.', 'Doctor'),
]
def spoken(t):
    for a, b in SAY: t = re.sub(a, b, t)
    return t

def envelope(a, sr):
    hop = sr // FPS
    n = int(np.ceil(len(a) / hop))
    rms = np.array([np.sqrt(np.mean(a[i * hop:(i + 1) * hop] ** 2) + 1e-12) for i in range(n)])
    ref = np.percentile(rms, 95) or 1
    v = np.clip(rms / ref, 0, 1)
    v = np.convolve(v, [0.25, 0.5, 0.25], mode='same')
    return ''.join(str(int(round(x * 9))) for x in v)

def main():
    os.makedirs(OUT, exist_ok=True)
    mp = os.path.join(OUT, 'manifest.json')
    man = json.load(open(mp)) if os.path.exists(mp) else {}
    if MERGE:  # fold shard manifests back into manifest.json
        import glob
        for f in sorted(glob.glob(os.path.join(OUT, 'manifest.shard*.json'))):
            man.update(json.load(open(f))); os.unlink(f)
        json.dump(man, open(mp, 'w'), separators=(',', ':'))
    if SHARD: mp = os.path.join(OUT, f'manifest.shard{SHARD[0]}.json')
    k = Kokoro(os.path.join(MD, 'model.onnx'), os.path.join(MD, 'voices.bin'))
    jobs = []
    for n in (1, 2, 3):
        c = json.load(open(os.path.join(AC, f'course-{n}.json')))
        if ONLY and c['id'] != ONLY: continue
        for m in c['modules']:
            for i, s in enumerate(m['scenes']):
                if 'text' in s: jobs.append((f"{m['id']}-{i:02d}", s['text']))
    keep = {key for key, _ in jobs}
    if SHARD: jobs_s = [j for i, j in enumerate(jobs) if i % SHARD[1] == SHARD[0]]
    else: jobs_s = jobs
    todo = [(key, t) for key, t in jobs_s if man.get(key, {}).get('h') != hashlib.sha1((VOICE + t).encode()).hexdigest()[:12]
            or not os.path.exists(os.path.join(OUT, key + '.mp3'))]
    # Reuse a clip already rendered for the same text under another key (scenes that only moved position).
    byhash = {v.get('h'): k for k, v in man.items() if os.path.exists(os.path.join(OUT, k + '.mp3'))}
    want = {key: hashlib.sha1((VOICE + t).encode()).hexdigest()[:12] for key, t in todo}
    blobs = {h: (open(os.path.join(OUT, byhash[h] + '.mp3'), 'rb').read(), dict(man[byhash[h]])) for h in set(want.values()) if h in byhash}
    for key, h in want.items():
        if h in blobs:
            open(os.path.join(OUT, key + '.mp3'), 'wb').write(blobs[h][0]); man[key] = dict(blobs[h][1])
    todo = [(key, t) for key, t in todo if want[key] not in blobs]
    print(f'{len(jobs)} scenes, {len(todo)} to render ({len(want) - len(todo)} reused)', flush=True)
    for j, (key, t) in enumerate(todo):
        a, sr = k.create(spoken(t), voice=VOICE, speed=SPEED, lang='en-us')
        a = np.asarray(a, dtype=np.float64)
        f = int(.015 * sr); a[:f] *= np.linspace(0, 1, f); a[-f:] *= np.linspace(1, 0, f)
        with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as tmp:
            sf.write(tmp.name, a, sr)
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', tmp.name, '-af', 'loudnorm=I=-17:TP=-1.5:LRA=7',
                        '-ar', '24000', '-ac', '1', '-c:a', 'libmp3lame', '-b:a', '48k', os.path.join(OUT, key + '.mp3')], check=True)
        os.unlink(tmp.name)
        man[key] = {'d': round(len(a) / sr, 2), 'e': envelope(a, sr), 'h': hashlib.sha1((VOICE + t).encode()).hexdigest()[:12]}
        if j % 10 == 0 or j == len(todo) - 1:
            json.dump(man, open(mp, 'w'), separators=(',', ':'))
            print(f'{j + 1}/{len(todo)} {key} {man[key]["d"]}s', flush=True)
    if not ONLY and not SHARD:
        for key in list(man):
            if key not in keep:
                man.pop(key)
                p = os.path.join(OUT, key + '.mp3')
                if os.path.exists(p): os.unlink(p)
    json.dump(man, open(mp, 'w'), separators=(',', ':'))
    print('total narration', round(sum(v['d'] for v in man.values()) / 60, 1), 'min')

main()
