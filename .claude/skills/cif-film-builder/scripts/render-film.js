// node render-film.js --page /_filmwork/NAME/film.html --script script.json --out master.mp4 [--voice voice.wav] [--from 0] [--to 999] [--fps 30]
// Needs: the repo root served on http://localhost:8765, Playwright (Chromium) and ffmpeg.
// Renders every frame at an exact time (so picture and music never drift), mixes the generated score with an optional
// voice track (music ducks under speech), loudness-normalises, and writes a high-quality master. Use encode-to-size.sh for a sendable copy.
const {spawn}=require('child_process'),fs=require('fs'),path=require('path'),os=require('os');
const pw=(()=>{try{return require('playwright')}catch(e){return require('/opt/node22/lib/node_modules/playwright')}})();
const arg=(k,d)=>{const i=process.argv.indexOf('--'+k);return i>0?process.argv[i+1]:d};
const PAGE=arg('page'),SCRIPT=arg('script','script.json'),OUT=arg('out','master.mp4'),VOICE=arg('voice',''),FPS=+arg('fps',30),FROM=+arg('from',0),HOST=arg('host','http://localhost:8765');
if(!PAGE){console.error('missing --page');process.exit(1)}
(async()=>{
  const b=await pw.chromium.launch({args:['--autoplay-policy=no-user-gesture-required']});
  const p=await b.newPage({viewport:{width:1920,height:1080}});
  p.on('pageerror',e=>console.error('page error:',e.message));p.on('console',m=>{if(m.type()==='warning'||m.type()==='error')console.error('page:',m.text())});
  await p.goto(`${HOST}${PAGE}?script=${encodeURIComponent(SCRIPT)}`,{waitUntil:'load'});await p.evaluate(()=>window.__ready);
  const dur=await p.evaluate(()=>window.__dur()),TO=Math.min(+arg('to',dur),dur);
  const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'film-')),wav=path.join(tmp,'score.wav');
  fs.writeFileSync(wav,Buffer.from(await p.evaluate(()=>window.__renderScore()),'base64'));
  console.log('duration',dur,'s; rendering',FROM,'to',TO);
  const mix=VOICE
    ? ['-i',VOICE,'-filter_complex','[1:a]volume=0.8[m];[2:a]asplit=2[v1][v2];[m][v1]sidechaincompress=threshold=0.02:ratio=9:attack=30:release=500:makeup=1[md];[md][v2]amix=inputs=2:normalize=0:duration=first,loudnorm=I=-15:TP=-1.5:LRA=9[a]']
    : ['-filter_complex','[1:a]loudnorm=I=-16:TP=-1.5:LRA=11[a]'];
  const ff=spawn('ffmpeg',['-v','error','-y','-f','image2pipe','-framerate',String(FPS),'-c:v','mjpeg','-i','-','-ss',String(FROM),'-t',String(TO-FROM),'-i',wav,...mix,'-map','0:v','-map','[a]','-c:v','libx264','-preset','slow','-crf','19','-pix_fmt','yuv420p','-ar','48000','-c:a','aac','-b:a','192k','-shortest','-movflags','+faststart',OUT],{stdio:['pipe','inherit','inherit']});
  const total=Math.round((TO-FROM)*FPS),t0=Date.now();
  for(let i=0;i<total;i++){
    await p.evaluate(t=>window.__seek(t),FROM+i/FPS);
    const jpg=await p.screenshot({type:'jpeg',quality:92});
    if(!ff.stdin.write(jpg))await new Promise(r=>ff.stdin.once('drain',r));
    if(i%300===0)console.log(`frame ${i}/${total} ${((Date.now()-t0)/1000)|0}s`);
  }
  ff.stdin.end();await new Promise(r=>ff.on('close',r));await b.close();console.log('wrote',OUT);
})();
