#!/bin/bash
cd /home/user/cold-ischemia
mkdir -p /tmp/pt/vch
N=848
for I in 8 23 22 21; do
  F=$((I*30)); T=$((F+30)); [ $T -gt $N ] && T=$N
  OUT=/tmp/pt/vch/c$(printf %02d $I).mp4
  if [ ! -s $OUT ]; then node _filmwork/founder/render-chunk.js $F $T ${OUT%.mp4}.w3.mp4 && mv ${OUT%.mp4}.w3.mp4 $OUT; fi
done
echo W3DONE
