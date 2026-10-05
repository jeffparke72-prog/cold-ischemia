"""python3 _tools/book-merge.py <prefix> <out.pdf> [pages.json]  merges cover+body+back; with pages.json arg, writes TOC page numbers map by scanning the body."""
import sys, re, json, pymupdf
pre, out = sys.argv[1], sys.argv[2]
if len(sys.argv) > 3:   # scan mode
    d = pymupdf.open('/tmp/%s-body.pdf' % pre)
    keys = {a: b.replace('\u2019',"'") for a, b in json.load(open(sys.argv[3])).items()}
    txt = [' '.join(p.get_text().split()).replace('\u2019',"'") for p in d]
    istoc = [sum(1 for k in keys.values() if k in t) >= 3 for t in txt]
    res = {}
    for i, k in keys.items():
        for n, t in enumerate(txt):
            if not istoc[n] and k in t[:260]: res[i] = n + 1; break
    json.dump(res, open('/tmp/_pages.json', 'w')); print(res); sys.exit()
c = pymupdf.open('/tmp/%s-cover.pdf' % pre); b = pymupdf.open('/tmp/%s-body.pdf' % pre); k = pymupdf.open('/tmp/%s-back.pdf' % pre)
o = pymupdf.open(); o.insert_pdf(c, from_page=0, to_page=0); o.insert_pdf(b); o.insert_pdf(k, from_page=0, to_page=0)
o.set_metadata({'title': 'Not a Spare: The Living Kidney Donor’s Field Guide', 'author': 'Cold Ischemia Foundation', 'subject': 'Living kidney donation in the United States'})
o.save(out, garbage=4, deflate=True); print(out, len(o), 'pages')
