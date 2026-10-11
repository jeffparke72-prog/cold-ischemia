import os,base64,subprocess
HERE=os.path.dirname(os.path.abspath(__file__))
F='file:///home/user/cold-ischemia/fonts/'
FONTS=f'''@font-face{{font-family:PF;src:url({F}playfairdisplay-900-normal.woff2);font-weight:900}}
@font-face{{font-family:PFI;src:url({F}playfairdisplay-400-italic.woff2);font-style:italic}}
@font-face{{font-family:CP;src:url({F}crimsonpro-400-normal.woff2)}}
@font-face{{font-family:CPI;src:url({F}crimsonpro-400-italic.woff2);font-style:italic}}
@font-face{{font-family:BN;src:url({F}bebasneue-400-normal.woff2)}}'''
def img(n): return 'file://'+HERE+'/src/'+n
BG='background:linear-gradient(160deg,#0e2a52 0%,#0a1f40 55%,#06101f 100%)'
pages={}
# 1 square product image 1600x1600: cover with shadow + badges
pages['payhip-02-product-square']=(1600,1600,f'''<style>{FONTS}
html,body{{margin:0;width:1600px;height:1600px;overflow:hidden;{BG};font-family:BN;color:#f7efe0}}
.glow{{position:absolute;left:300px;top:150px;width:1000px;height:1000px;border-radius:50%;background:radial-gradient(circle,rgba(63,224,212,.35),rgba(63,224,212,0) 65%)}}
.book{{position:absolute;left:380px;top:110px;width:840px;height:1163px;box-shadow:0 50px 90px rgba(0,0,0,.65),0 0 0 2px rgba(255,255,255,.08);border-radius:6px}}
.spine{{position:absolute;left:380px;top:110px;width:34px;height:1163px;background:linear-gradient(90deg,rgba(255,255,255,.22),rgba(255,255,255,0));border-radius:6px 0 0 6px}}
.b{{position:absolute;left:0;right:0;text-align:center}}
</style><div class="glow"></div><img class="book" src="{img('cover.png')}"><div class="spine"></div>
<div class="b" style="top:1340px;font-size:84px;letter-spacing:10px;color:#f2b84b">AN INVESTIGATION IN 15 CHAPTERS</div>
<div class="b" style="top:1440px;font-size:56px;letter-spacing:8px;color:#9fc3e6">136 PAGES · PDF + EPUB · INSTANT DOWNLOAD</div>''')
def stat(n,l,s): return f'<div class="st"><div class="n">{n}</div><div class="l">{l}</div><div class="s">{s}</div></div>'
pages['payhip-03-numbers']=(1600,900,f'''<style>{FONTS}
html,body{{margin:0;width:1600px;height:900px;overflow:hidden;{BG};color:#f7efe0}}
.h{{position:absolute;top:50px;width:100%;text-align:center;font-family:BN;font-size:52px;letter-spacing:12px;color:#f2b84b}}
.t{{position:absolute;top:118px;width:100%;text-align:center;font-family:PF;font-weight:900;font-size:64px}}
.g{{position:absolute;left:70px;right:70px;top:260px;display:flex;gap:26px}}
.st{{flex:1;border:2px solid rgba(242,184,75,.55);border-radius:10px;padding:30px 24px;background:rgba(255,255,255,.04);text-align:center;height:470px;box-sizing:border-box}}
.n{{font-family:PF;font-weight:900;font-size:128px;line-height:1;color:#ff6b57}}
.l{{font-family:BN;font-size:46px;letter-spacing:3px;margin-top:20px;color:#f7efe0;line-height:1.1}}
.s{{font-family:CPI;font-style:italic;font-size:27px;margin-top:16px;color:#9fc3e6;line-height:1.25}}
.f{{position:absolute;bottom:34px;width:100%;text-align:center;font-family:CPI;font-style:italic;font-size:26px;color:#9fb0c4}}
</style><div class="h">FOUR NUMBERS THE BOOK FOLLOWS</div><div class="t">The Discard</div>
<div class="g">{stat('29.3%','OF DONATED KIDNEYS WENT UNUSED','Recovered but never transplanted, United States, 2024')}{stat('16','OFFERS BEFORE THEY DIED','Median kidney offers received by candidates who died waiting, 2008 to 2015')}{stat('39%','OF KIDNEYS ARE PUMPED','Deceased-donor kidneys on a machine pump, 2023; the trial proved the benefit in 2009')}{stat('48','DAYS FOR ONE MEMO','From a federal email to lower kidney recoveries (early analysis)')}</div>
<div class="f">Sources and grades for every figure are in the book\'s Source Notes.</div>''')
def pg(n,rot,left,top,w): return f'<img src="{img(n)}" style="position:absolute;left:{left}px;top:{top}px;width:{w}px;transform:rotate({rot}deg);box-shadow:0 30px 60px rgba(0,0,0,.55);border-radius:3px;background:#fff">'
pages['payhip-04-inside']=(1600,900,f'''<style>{FONTS}
html,body{{margin:0;width:1600px;height:900px;overflow:hidden;{BG};color:#f7efe0}}
.h{{position:absolute;left:0;width:520px;top:260px;padding-left:80px;font-family:BN;font-size:60px;letter-spacing:6px;color:#f2b84b;line-height:1.05}}
.p{{position:absolute;left:80px;width:440px;top:420px;font-family:CP;font-size:32px;line-height:1.4;color:#dfe7f1}}
</style><div class="h">LOOK<br>INSIDE</div><div class="p">A clear contents page, a boxed answer at the start of every chapter, graded sources, and a plan you can act on.</div>
{pg('toc.png',-5,620,70,330)}{pg('ch2.png',0,860,40,360)}{pg('moves.png',5,1130,90,350)}''')
pages['payhip-05-structure']=(1600,900,f'''<style>{FONTS}
html,body{{margin:0;width:1600px;height:900px;overflow:hidden;{BG};color:#f7efe0}}
.h{{position:absolute;top:40px;width:100%;text-align:center;font-family:BN;font-size:56px;letter-spacing:12px;color:#f2b84b}}
.card{{position:absolute;left:150px;top:130px;width:1300px;height:700px;background:#fff;border-radius:14px;box-shadow:0 30px 70px rgba(0,0,0,.5);display:flex;align-items:center;justify-content:center}}
.card img{{width:1180px}}
</style><div class="h">FOUR PARTS · FIFTEEN CHAPTERS · FIFTEEN MOVES</div><div class="card"><img src="file://{HERE}/../fig/map.png"></div>''')
pages['payhip-06-fifteen-moves']=(1600,900,f'''<style>{FONTS}
html,body{{margin:0;width:1600px;height:900px;overflow:hidden;{BG};color:#f7efe0}}
.h{{position:absolute;top:40px;width:100%;text-align:center;font-family:BN;font-size:56px;letter-spacing:12px;color:#f2b84b}}
.card{{position:absolute;left:200px;top:130px;width:1200px;height:700px;background:#fff;border-radius:14px;box-shadow:0 30px 70px rgba(0,0,0,.5);display:flex;align-items:center;justify-content:center}}
.card img{{height:640px}}
</style><div class="h">THE WAY OUT: FIFTEEN SPECIFIC MOVES</div><div class="card"><img src="file://{HERE}/../fig/moves.png"></div>''')
for name,(w,h,body) in pages.items():
    open(f'{HERE}/src/{name}.html','w').write(f'<!doctype html><html><head><meta charset="utf-8"></head><body>{body}</body></html>')
js="const pw=require('/opt/node22/lib/node_modules/playwright');(async()=>{const b=await pw.chromium.launch();"+''.join(f"{{const p=await b.newPage({{viewport:{{width:{w},height:{h}}}}});await p.goto('file://{HERE}/src/{n}.html');await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(700);await p.screenshot({{path:'{HERE}/{n}.png'}});await p.close();}}" for n,(w,h,_) in pages.items())+"await b.close()})()"
open('/tmp/payhip_shots.js','w').write(js); subprocess.run(['node','/tmp/payhip_shots.js'],check=True)
