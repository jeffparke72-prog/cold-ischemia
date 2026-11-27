#!/usr/bin/env python3
"""Cold Ischemia Foundation webinar: renders the guide's narration for every scene in webinar/script.json.

  python3 _tools/webinar-voice.py MODEL_DIR       render anything new or changed

Needs: pip install kokoro-onnx soundfile numpy (+ ffmpeg), and kokoro-v1.0.onnx + voices-v1.0.bin from
https://github.com/thewh1teagle/kokoro-onnx/releases (model-files-v1.0), saved as model.onnx and voices.bin.
Kokoro is Apache-2.0 licensed, so the audio may be used commercially.

Writes webinar/audio/<scene-id>.mp3 and webinar/audio/manifest.json (duration, 25 fps mouth envelope,
text hash) so only edited scenes are re-rendered.
"""
import hashlib, json, os, re, subprocess, sys, tempfile
import numpy as np, soundfile as sf
from kokoro_onnx import Kokoro

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
W = os.path.join(ROOT, 'webinar')
OUT = os.path.join(W, 'audio')
SPEED, FPS, GAP = 0.88, 25, 0.38
MD = sys.argv[1] if len(sys.argv) > 1 else '/tmp/kk'

SAY = [
    (r'\bOPTN\b', 'O P T N'), (r'\bBHOC\b', 'B H O C'), (r'\bESRD\b', 'E S R D'), (r'\bCMS\b', 'C M S'),
    (r'\bHHS\b', 'H H S'), (r'\bOIG\b', 'O I G'), (r'\bHRSA\b', 'hersa'), (r'\bDOJ\b', 'D O J'),
    (r'\bAARP\b', 'A A R P'), (r'\bFMLA\b', 'F M L A'), (r'\bHIPAA\b', 'hippa'), (r'\bNLDAC\b', 'N L D A C'),
    (r'\bMERIDIAN\b', 'Meridian'), (r'\bForm 990\b', 'Form nine ninety'), (r'regulations\.gov', 'regulations dot gov'),
    (r'\bCFR\b', 'C F R'),
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
    S = json.load(open(os.path.join(W, 'script.json')))
    voice = S.get('voice', 'af_heart')
    os.makedirs(OUT, exist_ok=True)
    mp = os.path.join(OUT, 'manifest.json')
    man = json.load(open(mp)) if os.path.exists(mp) else {}
    k = Kokoro(os.path.join(MD, 'model.onnx'), os.path.join(MD, 'voices.bin'))
    for ch in S['chapters']:
        for sc in ch['scenes']:
            text = spoken(sc['say'])
            h = hashlib.sha1((voice + str(SPEED) + text).encode()).hexdigest()[:12]
            f = os.path.join(OUT, sc['id'] + '.mp3')
            if man.get(sc['id'], {}).get('h') == h and os.path.exists(f):
                continue
            parts, sr = [], 24000
            for sent in [x for x in re.split(r'(?<=[.?!])\s+', text) if x.strip()]:
                b, sr = k.create(sent, voice=voice, speed=SPEED, lang='en-us')
                parts += [np.asarray(b, dtype=np.float32), np.zeros(int(sr * GAP), dtype=np.float32)]
            a = np.concatenate(parts[:-1])
            pad = np.zeros(int(sr * 0.25), dtype=np.float32)
            a = np.concatenate([pad, a, pad])
            with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as t:
                sf.write(t.name, a, sr)
            subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', t.name, '-af', 'loudnorm=I=-16:TP=-1.5',
                            '-ac', '1', '-ar', '24000', '-b:a', '64k', f], check=True)
            os.unlink(t.name)
            man[sc['id']] = {'h': h, 'd': round(len(a) / sr, 2), 'm': envelope(a, sr)}
            json.dump(man, open(mp, 'w'), separators=(',', ':'))
            print(sc['id'], man[sc['id']]['d'], flush=True)
    print('total minutes', round(sum(v['d'] for v in man.values()) / 60, 1))

if __name__ == '__main__':
    main()
