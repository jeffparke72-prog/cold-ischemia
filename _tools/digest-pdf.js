// node _tools/digest-pdf.js  (repo served on :8765) -> research-digest-NNN.pdf for every issue page
const fs=require('fs');const pw=(()=>{try{return require('playwright')}catch(e){return require('/opt/node22/lib/node_modules/playwright')}})();
(async()=>{const b=await pw.chromium.launch();const p=await b.newPage();
for(const f of fs.readdirSync('.').filter(x=>/^research-digest-\d+\.html$/.test(x))){await p.goto('http://localhost:8765/'+f,{waitUntil:'load'});await p.evaluate(()=>document.fonts.ready);
const n=f.match(/(\d+)/)[1];await p.pdf({path:`research-digest-${n}.pdf`,format:'Letter',printBackground:true,preferCSSPageSize:true});console.log('wrote',n)}
await b.close()})();
