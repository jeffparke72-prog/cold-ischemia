// node _tools/book-pdf.js (repo served on :8765) -> not-a-spare-living-donor-guide.pdf  (cover page rendered separately, then merged: python3 _tools/book-merge.py)
const pw=(()=>{try{return require('playwright')}catch(e){return require('/opt/node22/lib/node_modules/playwright')}})();
(async()=>{const b=await pw.chromium.launch();const p=await b.newPage();
for(const [cls,out,css] of [['only-cover','/tmp/_cover.pdf','@page{size:Letter;margin:0}'],['no-cover','/tmp/_body.pdf','']]){
await p.goto('http://localhost:8765/living-donor-guide.html',{waitUntil:'load'});
await p.evaluate(c=>{document.documentElement.classList.add(c)},cls);
if(css)await p.addStyleTag({content:css});
await p.evaluate(()=>document.fonts.ready);
await p.pdf({path:out,format:'Letter',printBackground:true,preferCSSPageSize:true});}
await b.close()})();
