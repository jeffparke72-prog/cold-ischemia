import runpy,json,html
ns=runpy.run_path('build_voice.py');CT=ns['CT']
ch=json.load(open('chapters.json'))
def mmss(t):
    t=int(t);return f"{t//60}:{t%60:02d}"
chap=''.join(f'<li><button type="button" data-t="{a}"><b>{mmss(a)}</b> {html.escape(t)}</button></li>' for a,t in ch)
transcript=''.join(f'<p>{html.escape(CT[i])}</p>' for i in range(len(CT)))
# group transcript phrases into readable paragraphs of ~4
paras=[];buf=[]
for i in range(len(CT)):
    buf.append(CT[i])
    if len(buf)==4 or i==len(CT)-1: paras.append(' '.join(buf));buf=[]
transcript=''.join(f'<p>{html.escape(p)}</p>' for p in paras)
nav=open('/home/user/cold-ischemia/book-a-meeting.html').read()
a=nav.index('<!--CIFNAV-->');b=nav.index('<!--/CIFNAV-->')+len('<!--/CIFNAV-->')
NAV=nav[a:b]
jsonld=json.dumps({"@context":"https://schema.org","@type":"VideoObject","name":"A Message From the Founder: Why We Exist","description":"The founder of the Cold Ischemia Foundation explains why the foundation exists, who funds the voices that speak for kidney patients, and how an independent organization is different.","thumbnailUrl":"https://coldischemia.foundation/cif-founder-message-poster.jpg","uploadDate":"2026-10-19","duration":"PT13M50S","contentUrl":"https://coldischemia.foundation/cif-founder-message.mp4","publisher":{"@type":"Organization","name":"Cold Ischemia Foundation","url":"https://coldischemia.foundation"}})
PAGE=f'''<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>A Message From the Founder | Cold Ischemia Foundation</title>
<meta name="description" content="Why the Cold Ischemia Foundation exists, who funds the voices that speak for kidney patients, and how an independent organization is different. A 14-minute message from the founder, with sources.">
<link rel="canonical" href="https://coldischemia.foundation/founder-message.html">
<meta property="og:type" content="video.other"><meta property="og:title" content="A Message From the Founder: Why We Exist"><meta property="og:description" content="Who funds the voices that speak for patients? A message from the founder of the Cold Ischemia Foundation."><meta property="og:image" content="https://coldischemia.foundation/cif-founder-message-poster.jpg"><meta property="og:url" content="https://coldischemia.foundation/founder-message.html">
<meta name="twitter:card" content="summary_large_image">
<link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=IBM+Plex+Mono:wght@400;500&family=Crimson+Pro:ital,wght@0,400;0,600;1,400&display=swap" rel="stylesheet">
<script type="application/ld+json">{jsonld}</script>
<style>
:root{{--ink:#e6dccd;--ink80:rgba(230,220,205,.86);--ink60:rgba(230,220,205,.64);--gold:#c8902a;--gold-l:#f0c15a;--pulse:#2ac4c8;--rose:#e0566f;--green:#44e0b0;--b:rgba(110,150,210,.2);--b2:rgba(110,150,210,.34)}}
*{{box-sizing:border-box}}
body{{margin:0;background:radial-gradient(1200px 600px at 50% -10%,#0d2038 0%,#030509 62%);color:var(--ink);font-family:'Crimson Pro',Georgia,serif;font-size:19px;line-height:1.65}}
a{{color:var(--gold-l)}}.wrap{{max-width:1040px;margin:0 auto;padding:0 22px}}
.mono{{font:500 12px 'IBM Plex Mono',monospace;letter-spacing:.2em;text-transform:uppercase;color:var(--pulse)}}
:focus-visible{{outline:3px solid var(--gold-l);outline-offset:2px}}
.hero{{padding:46px 0 18px;text-align:center}}
.hero h1{{font:400 clamp(40px,7vw,84px)/1 'Bebas Neue',sans-serif;margin:8px 0 10px;letter-spacing:.01em}}.hero h1 em{{font-style:normal;color:var(--gold-l)}}
.hero p{{max-width:760px;margin:0 auto;font-size:21px;color:var(--ink80)}}
.vid{{margin:22px 0 10px;border:1px solid var(--b2);border-radius:16px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,.5);background:#000}}
.vid video{{display:block;width:100%;height:auto;aspect-ratio:16/9;background:#000}}
.cta{{display:flex;flex-wrap:wrap;gap:10px;justify-content:center;margin:14px 0 4px}}
.btn{{display:inline-block;border:1px solid var(--b2);border-radius:10px;padding:12px 18px;background:rgba(255,255,255,.05);color:var(--ink);text-decoration:none;font:500 12.5px 'IBM Plex Mono',monospace;letter-spacing:.09em;text-transform:uppercase}}
.btn.gold{{background:linear-gradient(180deg,#f6cf72,#c8902a);color:#0a1628;border:0;font-weight:700}}
section{{padding:26px 0}}h2{{font:400 38px 'Bebas Neue',sans-serif;letter-spacing:.04em;margin:0 0 6px;color:var(--gold-l)}}
.chap{{list-style:none;padding:0;margin:10px 0;display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:8px}}
.chap button{{width:100%;text-align:left;background:rgba(255,255,255,.04);border:1px solid var(--b);border-radius:10px;color:var(--ink);padding:10px 14px;font:inherit;font-size:17px;cursor:pointer}}.chap b{{font:500 12px 'IBM Plex Mono',monospace;color:var(--gold-l);margin-right:8px}}
.tbl{{overflow-x:auto;border:1px solid var(--b2);border-radius:14px;background:rgba(10,22,40,.7)}}
table{{border-collapse:collapse;width:100%;min-width:820px;font-size:16.5px}}
th,td{{padding:12px 12px;border-bottom:1px solid var(--b);vertical-align:top;text-align:center}}th{{font:500 12px 'IBM Plex Mono',monospace;letter-spacing:.08em;text-transform:uppercase;color:var(--ink80)}}
th:first-child,td:first-child{{text-align:left;font-weight:600}}th.us{{color:var(--gold-l);background:rgba(240,193,90,.1)}}td.us{{background:rgba(240,193,90,.06)}}
.y{{color:var(--rose);font:400 26px 'Bebas Neue',sans-serif;letter-spacing:.05em;display:block}}.n{{color:var(--green);font:400 26px 'Bebas Neue',sans-serif;letter-spacing:.05em;display:block}}.g{{color:#9aa7b8;font:400 26px 'Bebas Neue',sans-serif;display:block}}td small{{display:block;color:var(--ink60);font-size:14.5px;line-height:1.35}}
.src li{{margin:6px 0;font-size:16.5px;color:var(--ink80)}}
details{{border:1px solid var(--b);border-radius:12px;padding:12px 16px;background:rgba(255,255,255,.03)}}summary{{cursor:pointer;font:500 13px 'IBM Plex Mono',monospace;letter-spacing:.1em;text-transform:uppercase;color:var(--gold-l)}}
.note{{border-left:3px solid var(--gold);padding:8px 16px;color:var(--ink80);background:rgba(240,193,90,.05);border-radius:0 10px 10px 0;margin:14px 0}}
footer.pg{{padding:30px 0 70px;color:var(--ink60);font-size:15px;text-align:center}}
</style>
</head>
<body>
{NAV}
<header class="hero"><div class="wrap">
  <div class="mono">A message from the founder</div>
  <h1>Why we exist. <em>Who pays for the voice?</em></h1>
  <p>Fourteen minutes, in my own words: who we are, what we build, what the record shows about who funds the groups that speak for kidney patients, and why we do it differently.</p>
</div></header>
<main class="wrap">
  <div class="vid"><video controls preload="metadata" poster="cif-founder-message-poster.jpg" playsinline aria-label="A message from the founder of the Cold Ischemia Foundation"><source src="cif-founder-message.mp4" type="video/mp4"><track kind="captions" srclang="en" label="English" src="cif-founder-message.vtt"><p>Your browser cannot play this video. The full transcript is below.</p></video></div>
  <div class="cta"><a class="btn gold" href="independence.html">What independence means</a><a class="btn" href="advocacy-assessment.html">Check any group yourself</a><a class="btn" href="kidney-transplant-centers.html">Transplant centers by state</a><a class="btn" href="cif-volunteer-page.html">Volunteer</a></div>
  <section aria-label="Chapters"><h2>In this video</h2><ul class="chap">{chap}</ul></section>
  <section id="table"><h2>Who funds the voices that speak for patients?</h2>
   <p>This is the table from the video. Every entry comes from the organization's own website or from published reporting, as of the dates in the sources below. Taking industry money is legal and common, and these groups do real work. The question is who pays for the microphone.</p>
   <div class="tbl"><table><thead><tr><th></th><th class="us">Cold Ischemia Foundation</th><th>American Kidney Fund</th><th>National Kidney Foundation</th><th>American Assoc. of Kidney Patients</th><th>Dialysis Patient Citizens</th></tr></thead><tbody>
   <tr><td>Takes drugmaker money</td><td class="us"><span class="n">No</span><small>No donations or sponsors</small></td><td><span class="y">Yes</span><small>2025 corporate members include Novartis, Amgen, Novo Nordisk</small></td><td><span class="y">Yes</span><small>2026 corporate members include Boehringer Ingelheim, Novo Nordisk, Vertex</small></td><td><span class="y">Yes</span><small>Partners include Amgen, AstraZeneca, Bayer</small></td><td><span class="g">Unverified</span><small>Check its Form 990</small></td></tr>
   <tr><td>Takes dialysis-company money</td><td class="us"><span class="n">No</span><small>None, of any kind</small></td><td><span class="y">Yes</span><small>DaVita and Fresenius reported at about 80% of its donor base</small></td><td><span class="y">Yes</span><small>Fresenius has publicized its fundraising support</small></td><td><span class="y">Yes</span><small>DaVita and Fresenius listed as partners</small></td><td><span class="y">Yes</span><small>Founded with a DaVita grant; DaVita, Fresenius and U.S. Renal Care listed as top supporters</small></td></tr>
   <tr><td>Lists corporate sponsors on its site</td><td class="us"><span class="n">None to list</span><small>No sponsor to protect</small></td><td><span class="y">Yes</span><small>Corporate members page</small></td><td><span class="y">Yes</span><small>Corporate membership program</small></td><td><span class="y">Yes</span><small>Corporate membership</small></td><td><span class="y">Yes</span><small>Supporters page</small></td></tr>
   </tbody></table></div>
   <p class="note">The American Kidney Fund denies steering patients, and the Justice Department declined to join the whistleblower suit. If you represent an organization named here and believe a statement is inaccurate, write to us at <a href="mailto:jeffparke72@gmail.com">jeffparke72@gmail.com</a> and we will review it and correct the record where we are wrong.</p>
  </section>
  <section id="sources"><h2>Sources for the facts in the video</h2><ul class="src">
   <li>37 million Americans with kidney disease; 87% of adults with it do not know: <a href="https://cdc.gov/kidney-disease/media/pdfs/ckd-factsheet-h.pdf" rel="noopener">CDC chronic kidney disease fact sheet, March 2026</a>.</li>
   <li>DaVita about 36% of U.S. dialysis patients; the two largest chains roughly 70 to 75% together: <a href="https://www.sec.gov/Archives/edgar/data/927066/000092706626000012/dva-20251231.htm" rel="noopener">DaVita Form 10-K, fiscal 2025</a> and industry analyses.</li>
   <li>DaVita revenue of $13.6 billion in 2025: <a href="https://davita.mediaroom.com/2026-02-02-DaVita-Inc-4th-Quarter-2025-Results" rel="noopener">DaVita 4th quarter 2025 results</a>.</li>
   <li>More than $34 million to settle federal kickback allegations in July 2024, without admitting liability: <a href="https://www.americanbar.org/groups/health_law/news/2024/07/davita-pay-34m-resolve-allegations-illegal-kickbacks/" rel="noopener">American Bar Association summary of the Justice Department settlement</a>.</li>
   <li>About one patient in seven dialyzes at home: <a href="https://homedialysis.org/news-and-research/blog/628-home-dialysis-updates-from-the-2024-usrds-annual-data-report" rel="noopener">USRDS 2024 Annual Data Report summary</a>.</li>
   <li>Early specialist referral and catheter starts, 72 studies: <a href="https://doaj.org/article/baa4d03a9d5440d1967bd5fb845a3338" rel="noopener">BMC Nephrology 2025 meta-analysis</a>.</li>
   <li>83% of the 104 largest patient advocacy groups took industry money; only 1 said it did not: McCoy et al., New England Journal of Medicine, 2017. Details and the full list of sources are on <a href="independence.html">our independence page</a>.</li>
   <li>American Kidney Fund donor concentration and the whistleblower suit: <a href="https://kffhealthnews.org/health-care-costs/dialysis-patients-panic-as-financial-life-raft-becomes-unmoored/" rel="noopener">KFF Health News</a>; <a href="https://www.kidneyfund.org/article/american-kidney-fund-announces-2025-class-corporate-members-providing-support-fight-against-kidney" rel="noopener">AKF's 2025 corporate members</a>.</li>
   <li>National Kidney Foundation corporate members: <a href="https://www.kidney.org/about/corporate-supporters" rel="noopener">NKF 2026 corporate membership program</a>. Dialysis Patient Citizens supporters: <a href="https://www.dialysispatients.org/about/supporters/" rel="noopener">DPC supporters page</a>.</li>
   <li>3,743 candidates removed from the kidney waiting list because they died in 2024, and 29% of recovered kidneys not transplanted: SRTR 2024 Annual Data Report, kidney.</li>
  </ul></section>
  <section><h2>Full transcript</h2><details><summary>Read what was said</summary>{transcript}</details></section>
  <p class="note">This page is educational advocacy, not medical or legal advice. Allegations are allegations. Talk with your care team about decisions that affect your health.</p>
</main>
<footer class="pg"><div class="wrap">Cold Ischemia Foundation &middot; <a href="independence.html">What independence means</a> &middot; <a href="privacy.html">Privacy</a> &middot; <a href="terms.html">Terms</a></div></footer>
<script>
document.querySelectorAll('.chap button').forEach(function(b){{b.addEventListener('click',function(){{var v=document.querySelector('video');try{{v.currentTime=+b.dataset.t;v.play();v.scrollIntoView({{behavior:'smooth',block:'center'}})}}catch(e){{}}}})}});
</script>
</body>
</html>
'''
open('/home/user/cold-ischemia/founder-message.html','w').write(PAGE)
print(len(PAGE))
