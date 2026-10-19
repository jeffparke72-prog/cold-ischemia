#!/bin/bash
cd /home/user/cold-ischemia
mkdir -p /tmp/pt/ch
for i in $(seq 0 10); do
  F=$((i*30)); T=$(( (i+1)*30 )); [ $T -gt 325 ] && T=325
  OUT=/tmp/pt/ch/c$(printf %02d $i).mp4
  [ -s $OUT ] && continue
  node _filmwork/policy/render-chunk.js $F $T ${OUT%.mp4}.part.mp4 && mv ${OUT%.mp4}.part.mp4 $OUT
done
echo ALLDONE
