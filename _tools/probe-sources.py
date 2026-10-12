#!/usr/bin/env python3
"""Looks at public data sources from a machine with open internet (GitHub Actions) and writes a short report of what each
one contains, so the directory builder can be written against real column names instead of guesses.
Output: _tools/source-probe-report.txt"""
import io, json, re, sys, urllib.request, zipfile
OUT = []
def say(*a): OUT.append(" ".join(str(x) for x in a)); print(*a, flush=True)
def get(url, n=25_000_000):
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (compatible; ColdIschemiaFoundation data check)"})
    with urllib.request.urlopen(req, timeout=90) as r:
        return r.read(n), r.headers.get("Content-Type", "")

def probe_xlsx(url):
    say("\n=== XLSX", url)
    try:
        b, ct = get(url)
    except Exception as e:
        say("  FAILED:", type(e).__name__, str(e)[:160]); return
    say("  bytes:", len(b), ct)
    try:
        import openpyxl
        wb = openpyxl.load_workbook(io.BytesIO(b), read_only=True, data_only=True)
    except Exception as e:
        say("  cannot open as workbook:", type(e).__name__, str(e)[:120], b[:120]); return
    for ws in wb.worksheets:
        rows = list(ws.iter_rows(values_only=True))
        say(f"  sheet '{ws.title}': {len(rows)} rows")
        for r in rows[:4]:
            say("   ", [("" if c is None else str(c))[:40] for c in r][:30])

def probe_page(url, pat):
    say("\n=== PAGE", url)
    try:
        b, ct = get(url, 3_000_000)
    except Exception as e:
        say("  FAILED:", type(e).__name__, str(e)[:160]); return
    t = b.decode("utf-8", "ignore")
    links = sorted(set(re.findall(r'href=["\']([^"\']+)["\']', t)))
    for l in links:
        if re.search(pat, l, re.I): say("  ", l)

def main():
    probe_page("https://data.hrsa.gov/data/download", r"(ORG|OTC|OPTN|transplant|\.xlsx|\.csv)")
    for u in ("https://data.hrsa.gov/DataDownload/DD_Files/ORG_OTC_FCT_DET.xlsx",):
        probe_xlsx(u)
    say("\n=== CMS hospital general information (first record keys)")
    try:
        b, _ = get("https://data.cms.gov/provider-data/api/1/datastore/query/xubh-q36u/0?limit=1")
        say(json.dumps(json.loads(b)["results"][0])[:700])
    except Exception as e:
        say("  FAILED:", e)
    open("_tools/source-probe-report.txt", "w").write("\n".join(OUT))
main()
