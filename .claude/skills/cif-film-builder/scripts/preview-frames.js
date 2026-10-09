// node preview-frames.js --page /_filmwork/NAME/film.html --script script.json --out /tmp/preview
// Saves one PNG per segment (at 80% through it) so you can look at every scene before spending ten minutes rendering.
const fs=require('fs');const pw=(()=>{try{return require('playwright')}catch(e){return require('/opt/node22/lib/node_modules/playwright')}})();
const arg=(k,d)=>{const i=process.argv.indexOf('--'+k);return i>0?process.argv[i+1]:d};
(async()=>{const out=arg('out','/tmp/preview');fs.mkdirSync(out,{recursive:true});
const b=await pw.chromium.launch();const p=await b.newPage({viewport:{width:1920,height:1080}});
p.on('pageerror',e=>console.log('PAGE ERROR',e.message));p.on('console',m=>{if(m.type()!=='log')console.log('page:',m.text())});
await p.goto(`${arg('host','http://localhost:8765')}${arg('page')}?script=${encodeURIComponent(arg('script','script.json'))}`);await p.evaluate(()=>window.__ready);
const plan=await p.evaluate(()=>({d:window.__dur(),p:window.__plan()}));
const f=t=>`${Math.floor(t/60)}:${String(Math.floor(t%60)).padStart(2,'0')}`;
console.log('TOTAL',plan.d+'s ('+f(plan.d)+')');
for(const s of plan.p){await p.evaluate(x=>window.__seek(x),s.t0+(s.t1-s.t0)*.8);await p.screenshot({path:`${out}/${s.id}.png`});console.log(f(s.t0),s.id,s.type,(s.t1-s.t0).toFixed(1)+'s')}
await b.close()})();
