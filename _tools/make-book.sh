#!/bin/bash
# Builds both editions and PDFs. Usage: bash _tools/make-book.sh   (needs http.server on :8765 from repo root)
set -e; cd "$(dirname "$0")/.."
for ED in essay full; do
  F=''; HTML=living-donor-guide.html; PDF=not-a-spare-living-donor-guide.pdf
  [ $ED = full ] && F='--full' && HTML=living-donor-guide-full.html && PDF=not-a-spare-extended-edition.pdf
  rm -f /tmp/_pages.json
  python3 _tools/build-book.py $F >/dev/null; node _tools/book-pdf.js $HTML $ED
  python3 - $ED <<'PY'
import re,sys,json,html
ed=sys.argv[1]; s=open('living-donor-guide.html' if ed=='essay' else 'living-donor-guide-full.html').read()
keys={}
for m in re.finditer(r'<section class="chapter[^"]*" id="(\w+)"[^>]*data-title="([^"]+)"',s): keys[m[1]]=html.unescape(m[2])
if ed=='full':
  keys['preface']='The book you were not handed'
  keys.update({'appA':'Glossary','appB':'Timeline','appC':'Where To Verify','appD':'How This Guide Was Made'})
json.dump(keys,open('/tmp/_keys.json','w'))
PY
  python3 _tools/book-merge.py $ED x /tmp/_keys.json
  python3 _tools/build-book.py $F --pages >/dev/null; node _tools/book-pdf.js $HTML $ED
  python3 _tools/book-merge.py $ED $PDF
done
