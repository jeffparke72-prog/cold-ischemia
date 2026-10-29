// node render-chunk.js FROM TO OUT  (video only, frames at 30fps; page+script fixed)
const {spawn}=require('child_process');
const pw=require('/opt/node22/lib/node_modules/playwright');
const [,,F,T,OUT]=process.argv,FPS=30;
(async()=>{
  const b=await pw.chromium.launch();const p=await b.newPage({viewport:{width:1920,height:1080}});
  p.on('pageerror',e=>console.error('page error:',e.message));p.on('console',m=>{if(['warning','error'].includes(m.type()))console.error('page:',m.text())});
  await p.goto('http://localhost:8765/_filmwork/legacy/film.html?script='+encodeURIComponent('/_filmwork/legacy/script.json'),{waitUntil:'load'});await p.evaluate(()=>window.__ready);
  const ff=spawn('ffmpeg',['-v','error','-y','-f','image2pipe','-framerate','30','-c:v','mjpeg','-i','-','-c:v','libx264','-preset','veryfast','-crf','23','-pix_fmt','yuv420p',OUT],{stdio:['pipe','inherit','inherit']});
  const n=Math.round((+T-+F)*FPS);
  for(let i=0;i<n;i++){await p.evaluate(t=>window.__seek(t),+F+i/FPS);const j=await p.screenshot({type:'jpeg',quality:93});if(!ff.stdin.write(j))await new Promise(r=>ff.stdin.once('drain',r))}
  ff.stdin.end();await new Promise(r=>ff.on('close',r));await b.close();console.log('done',OUT);
})();
