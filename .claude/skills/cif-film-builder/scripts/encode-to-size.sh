#!/bin/bash
# Usage: encode-to-size.sh master.mp4 out.mp4 [target_MB=27]
# Two-pass H.264 so the file lands under the size limit for sending (chat attachments cap at 30 MB). Needs ffmpeg only.
set -e
IN="$1"; OUT="$2"; MB="${3:-27}"
DUR=$(ffmpeg -i "$IN" 2>&1 | grep -o 'Duration: [0-9:.]*' | head -1 | cut -d' ' -f2 | awk -F: '{print $1*3600+$2*60+$3}')
VK=$(awk -v mb="$MB" -v d="$DUR" 'BEGIN{printf "%d", (mb*8192/d)-128}')
echo "duration ${DUR}s -> video ${VK} kbps"
LOG=$(mktemp -u /tmp/pass-XXXXXX)
ffmpeg -v error -y -i "$IN" -c:v libx264 -preset slow -b:v ${VK}k -pass 1 -passlogfile "$LOG" -an -f null /dev/null
ffmpeg -v error -y -i "$IN" -c:v libx264 -preset slow -b:v ${VK}k -maxrate $((VK*3/2))k -bufsize $((VK*3))k -pass 2 -passlogfile "$LOG" -pix_fmt yuv420p -c:a aac -b:a 128k -movflags +faststart "$OUT"
rm -f "$LOG"*; ls -la "$OUT"
