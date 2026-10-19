// node audio.js script-out.wav : renders the generated score for the whole film
const fs=require('fs');const pw=require('/opt/node22/lib/node_modules/playwright');
(async()=>{const b=await pw.chromium.launch();const p=await b.newPage({viewport:{width:1920,height:1080}});
await p.goto('http://localhost:8765/_filmwork/anger/film.html?script='+encodeURIComponent('/_filmwork/anger/script.json'));await p.evaluate(()=>window.__ready);
console.log('dur',await p.evaluate(()=>window.__dur()));
fs.writeFileSync(process.argv[2],Buffer.from(await p.evaluate(()=>window.__renderScore()),'base64'));await b.close();})();
