#!/bin/bash
cd /home/user/cold-ischemia
mkdir -p /tmp/pt/vch
N=848
for I in 0 1 2 3 4 5 6 7 28 27 26 25 24; do
  F=$((I*30)); T=$((F+30)); [ $T -gt $N ] && T=$N
  OUT=/tmp/pt/vch/c$(printf %02d $I).mp4
  if [ ! -s $OUT ]; then node _filmwork/founder/render-chunk.js $F $T ${OUT%.mp4}.w2.mp4 && mv ${OUT%.mp4}.w2.mp4 $OUT; fi
done
echo W2DONE
