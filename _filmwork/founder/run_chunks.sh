#!/bin/bash
cd /home/user/cold-ischemia
mkdir -p /tmp/pt/fch
N=$(node -e "
const pw=require('/opt/node22/lib/node_modules/playwright');(async()=>{const b=await pw.chromium.launch();const p=await b.newPage();await p.goto('http://localhost:8765/_filmwork/founder/film.html?script='+encodeURIComponent('/_filmwork/founder/script.json'));await p.evaluate(()=>window.__ready);console.log(await p.evaluate(()=>window.__dur()));await b.close()})()")
echo DUR $N
I=0; F=0
while [ $F -lt $N ]; do
  T=$((F+30)); [ $T -gt $N ] && T=$N
  OUT=/tmp/pt/fch/c$(printf %02d $I).mp4
  if [ ! -s $OUT ]; then node _filmwork/founder/render-chunk.js $F $T ${OUT%.mp4}.part.mp4 && mv ${OUT%.mp4}.part.mp4 $OUT; fi
  I=$((I+1)); F=$T
done
echo ALLDONE
