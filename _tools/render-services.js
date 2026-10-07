// node _tools/render-services.js  (repo served on :8765) -> cif-services-infographic.png (2160x3280)
const pw=(()=>{try{return require('playwright')}catch(e){return require('/opt/node22/lib/node_modules/playwright')}})();
(async()=>{const b=await pw.chromium.launch();const p=await b.newPage({viewport:{width:1080,height:1640},deviceScaleFactor:2});
await p.goto('http://localhost:8765/_film2/services-infographic.html');await p.evaluate(()=>document.fonts.ready);
await (await p.$('#g')).screenshot({path:'cif-services-infographic.png'});await b.close()})();
