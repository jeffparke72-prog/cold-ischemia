// Renders cif-commercial.html to cif-commercial.mp4 (1920x1080, 30 fps, with the generated score
// and, if present, the narration in cif-commercial-voice.mp3).
//   python3 -m http.server 8765 &      (from the repo root)
//   node _tools/render-commercial.js   [--fps 30] [--from 0] [--to 180] [--out cif-commercial.mp4]
// Needs Playwright (Chromium) and ffmpeg. Each frame is rendered at an exact time with __seek(t),
// so the picture never drifts from the sound.
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const pw = (() => { try { return require('playwright'); } catch (e) { return require('/opt/node22/lib/node_modules/playwright'); } })();

const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > 0 ? process.argv[i + 1] : d; };
const FPS = +arg('fps', 30), FROM = +arg('from', 0), TO = +arg('to', 180);
const OUT = arg('out', 'cif-commercial.mp4');
const URL = arg('url', 'http://localhost:8765/cif-commercial.html?render=1');
const TMP = arg('tmp', fs.mkdtempSync(path.join(require('os').tmpdir(), 'cifc-')));

(async () => {
  const browser = await pw.chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, ignoreHTTPSErrors: true });
  page.on('pageerror', e => console.error('page error:', e.message));
  await page.goto(URL, { waitUntil: 'load' });
  await page.evaluate(async () => {
    await Promise.all(['220px "Bebas Neue"', '500 20px "IBM Plex Mono"', '900 40px "Playfair Display"', 'italic 400 40px "Playfair Display"'].map(f => document.fonts.load(f)));
    await document.fonts.ready;
    await Promise.all([...document.images].map(im => im.decode().catch(() => {})));
  });

  const wav = path.join(TMP, 'score.wav');
  console.log('rendering sound…');
  const b64 = await page.evaluate(() => window.__renderScore());
  fs.writeFileSync(wav, Buffer.from(b64, 'base64'));

  const ff = spawn('ffmpeg', ['-v', 'error', '-y', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-',
    '-ss', String(FROM), '-t', String(TO - FROM), '-i', wav,
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '19', '-pix_fmt', 'yuv420p', '-tune', 'film',
    '-af', 'loudnorm=I=-16:TP=-1.5:LRA=11', '-ar', '48000', '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', OUT], { stdio: ['pipe', 'inherit', 'inherit'] });

  const total = Math.round((TO - FROM) * FPS), t0 = Date.now();
  for (let i = 0; i < total; i++) {
    const t = FROM + i / FPS;
    await page.evaluate(tt => window.__seek(tt), t);
    const jpg = await page.screenshot({ type: 'jpeg', quality: 92 });
    if (!ff.stdin.write(jpg)) await new Promise(r => ff.stdin.once('drain', r));
    if (i % 300 === 0) console.log(`frame ${i}/${total}  ${((Date.now() - t0) / 1000).toFixed(0)}s`);
  }
  ff.stdin.end();
  await new Promise(r => ff.on('close', r));
  await browser.close();
  console.log('wrote', OUT);
})();
