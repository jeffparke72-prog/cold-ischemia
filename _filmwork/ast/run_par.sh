#!/bin/bash
# usage: run_par.sh WORKER NWORKERS DUR
cd /home/user/cold-ischemia; mkdir -p /tmp/pt/ast
W=$1; NW=$2; N=$3; I=0; F=0
while [ $F -lt $N ]; do
  T=$((F+30)); [ $T -gt $N ] && T=$N
  OUT=/tmp/pt/ast/c$(printf %02d $I).mp4
  if [ $((I%NW)) -eq $W ] && [ ! -s $OUT ]; then node _filmwork/ast/render-chunk.js $F $T ${OUT%.mp4}.part.mp4 && mv ${OUT%.mp4}.part.mp4 $OUT; fi
  I=$((I+1)); F=$T
done
echo WORKER$W-DONE
