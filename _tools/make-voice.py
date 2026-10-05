#!/usr/bin/env python3
"""Generates the film's voices from _film/script.json and lays them on a timeline.
Writes _film/timeline.json (when each line starts/ends) and _film/voice.wav (all voices, 48 kHz stereo).
Needs: pip install kokoro-onnx soundfile numpy, plus kokoro-v1.0.onnx and voices-v1.0.bin from
https://github.com/thewh1teagle/kokoro-onnx/releases (model-files-v1.0).  Usage: make-voice.py [model_dir] [total_seconds]"""
import json, os, sys, numpy as np, soundfile as sf
from kokoro_onnx import Kokoro
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MD = sys.argv[1] if len(sys.argv) > 1 else '/tmp/kk'
TOTAL = float(sys.argv[2]) if len(sys.argv) > 2 else 180.0
S = json.load(open(os.path.join(ROOT, '_film', 'script.json')))
k = Kokoro(os.path.join(MD, 'model.onnx'), os.path.join(MD, 'voices.bin'))
SR = 24000
clips = []
for i, it in enumerate(S['items']):
    a, _ = k.create(it['text'], voice=S['voices'][it['w']], speed=S['speeds'][it['w']], lang='en-us')
    a = np.asarray(a, dtype=np.float64)
    n = int(.03 * SR); a[:n] *= np.linspace(0, 1, n); a[-n:] *= np.linspace(1, 0, n)
    clips.append(a); print(i, it['w'], round(len(a) / SR, 2), it['text'][:50], flush=True)
lead = {s['id']: s['lead'] for s in S['scenes']}
tail_min = 6.0
def lay(gscale):
    t, out, seen = 0.0, [], set()
    for it, a in zip(S['items'], clips):
        if it['s'] not in seen: t += lead[it['s']]; seen.add(it['s'])
        d = len(a) / SR; out.append((t, t + d)); t += d + it['gap'] * gscale
    return out, t
gs = 1.0
for _ in range(40):
    tl, end = lay(gs)
    if end + tail_min > TOTAL: gs *= .97
    elif end + tail_min < TOTAL - 1.5: gs *= 1.03
    else: break
tl, end = lay(gs); print('gap scale', round(gs, 2), 'last line ends', round(end, 1))
N = int(TOTAL * SR) + SR
L = np.zeros(N); R = np.zeros(N)
pan = {'N': 0.0, 'F': 0.22, 'V': -0.22}
for it, a, (t0, t1) in zip(S['items'], clips, tl):
    p = pan[it['w']]; s = int(t0 * SR)
    L[s:s + len(a)] += a * np.sqrt((1 - p) / 2) * 1.4142; R[s:s + len(a)] += a * np.sqrt((1 + p) / 2) * 1.4142
st = np.stack([L, R], 1)[:int(TOTAL * SR)]
st /= max(1e-9, np.abs(st).max()) / .9
sf.write(os.path.join(ROOT, '_film', 'voice.wav'), st, SR)
tlj = {'total': TOTAL, 'scenes': S['scenes'], 'items': []}
for it, (t0, t1) in zip(S['items'], tl):
    d = dict(it); d['t0'] = round(t0, 3); d['t1'] = round(t1, 3); tlj['items'].append(d)
json.dump(tlj, open(os.path.join(ROOT, '_film', 'timeline.json'), 'w'), indent=1)
