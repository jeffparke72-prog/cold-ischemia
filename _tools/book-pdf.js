// node _tools/book-pdf.js <html> <outprefix>   (repo served on :8765) -> /tmp/<outprefix>-{cover,body,back}.pdf
const pw=(()=>{try{return require('playwright')}catch(e){return require('/opt/node22/lib/node_modules/playwright')}})();
const [,,html,pre]=process.argv;
(async()=>{const b=await pw.chromium.launch();const p=await b.newPage();
for(const [cls,out,css] of [['only-cover','cover','@page{size:Letter;margin:0}'],['no-cover only-body','body',''],['only-back','back','@page{size:Letter;margin:0}']]){
await p.goto('http://localhost:8765/'+html,{waitUntil:'load'});
await p.evaluate(c=>{c.split(' ').forEach(x=>document.documentElement.classList.add(x))},cls);
if(css)await p.addStyleTag({content:css});
if(cls==='only-body')await p.addStyleTag({content:'.backcover{display:none!important}'});
await p.evaluate(()=>document.fonts.ready);
await p.pdf({path:`/tmp/${pre}-${out}.pdf`,format:'Letter',printBackground:true,preferCSSPageSize:true});}
await b.close()})();
