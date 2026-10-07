// node _tools/render-film2.js <out.mp4>   (repo served on :8765). Silent picture + generated score only; the founder records the voiceover.
const {spawn}=require('child_process'),fs=require('fs'),path=require('path'),os=require('os');
const pw=(()=>{try{return require('playwright')}catch(e){return require('/opt/node22/lib/node_modules/playwright')}})();
const OUT=process.argv[2]||'/tmp/out/independent-master.mp4',FPS=30,TMP=fs.mkdtempSync(path.join(os.tmpdir(),'f2-'));
(async()=>{const b=await pw.chromium.launch();const p=await b.newPage({viewport:{width:1920,height:1080}});p.on('pageerror',e=>console.error('page error',e.message));
await p.goto('http://localhost:8765/_film2/film.html?render=1');await p.evaluate(()=>window.__ready);
const DUR=await p.evaluate(()=>window.__dur());
const b64=await p.evaluate(()=>window.__renderScore());const wav=path.join(TMP,'s.wav');fs.writeFileSync(wav,Buffer.from(b64,'base64'));
fs.writeFileSync('/tmp/out/independent-score.wav',Buffer.from(b64,'base64'));
const ff=spawn('ffmpeg',['-v','error','-y','-f','image2pipe','-framerate',String(FPS),'-c:v','mjpeg','-i','-','-i',wav,'-filter_complex','[1:a]loudnorm=I=-16:TP=-1.5:LRA=11[a]','-map','0:v','-map','[a]','-c:v','libx264','-preset','slow','-crf','19','-pix_fmt','yuv420p','-ar','48000','-c:a','aac','-b:a','192k','-shortest','-movflags','+faststart',OUT],{stdio:['pipe','inherit','inherit']});
const total=DUR*FPS,t0=Date.now();
for(let i=0;i<total;i++){await p.evaluate(t=>window.__seek(t),i/FPS);const jpg=await p.screenshot({type:'jpeg',quality:92});if(!ff.stdin.write(jpg))await new Promise(r=>ff.stdin.once('drain',r));if(i%300===0)console.log('frame',i,'/',total,((Date.now()-t0)/1000|0)+'s')}
ff.stdin.end();await new Promise(r=>ff.on('close',r));await b.close();console.log('wrote',OUT)})();
