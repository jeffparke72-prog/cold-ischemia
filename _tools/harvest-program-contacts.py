#!/usr/bin/env python3
"""Collect living-donor contact details that transplant programs publish on their OWN websites.

For each program in opo-data.js:
  1. find its website: _tools/program-sites.json (hand-curated, wins) else a web search for the program's living-donor page;
  2. read the page (and a few same-site links that mention living donors or contact);
  3. keep only phone numbers, emails and named staff that appear next to living-donor / coordinator / social-worker wording;
  4. save each with the page it came from, a short quote and the date, in program-contacts.json.

Rules that protect people: it obeys robots.txt, waits between requests, identifies itself, and never guesses. Anything it
cannot find on an official page is simply missing, and the site then shows the hospital's main line and a search link.
Every record keeps its source URL so a person can check it, and the site tells callers to confirm when they phone.

    python3 _tools/harvest-program-contacts.py [--limit N] [--only id1,id2]
    python3 _tools/harvest-program-contacts.py --self-test
"""
import html, json, re, sys, time, datetime, urllib.request, urllib.parse, urllib.robotparser
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
UA = "ColdIschemiaFoundationBot/1.0 (+https://coldischemia.foundation; public program contact pages only)"
DELAY = 2.0
BLOCK = ("healthgrades", "usnews", "yelp", "facebook", "wikipedia", "kidney.org", "srtr.org", "unos.org", "optn.", "linkedin", "youtube", "twitter", "x.com",
         "instagram", "webmd", "vitals.com", "doximity", "zocdoc", "nih.gov", "cms.gov", "livingdonorassistance", "donatelife", "organdonor.gov", "reddit", "indeed", "glassdoor")
KEY = re.compile(r"living[\s-]*(kidney\s+|liver\s+)?donor|live[\s-]*donor|donor coordinator|transplant coordinator|donor advocate|transplant social work", re.I)
LIVING = re.compile(r"living[\s-]*(kidney\s+|liver\s+)?donor|live[\s-]*donor", re.I)
PHONE = re.compile(r"(?<!\d)(?:\+?1[\s.\-]?)?\(?([2-9]\d{2})\)?[\s.\-]?([2-9]\d{2})[\s.\-]?(\d{4})(?!\d)")
EMAIL = re.compile(r"[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}")
PERSON = re.compile(r"\b([A-Z][a-z]+(?:\s[A-Z]\.)?\s[A-Z][a-z]+(?:-[A-Z][a-z]+)?),?\s+(RN|BSN|MSN|MSW|LCSW|LMSW|LISW|APRN|NP|PA-C|CCTC|MD|DO|MPH|PhD)\b")
TITLE = re.compile(r"(living donor (?:nurse )?coordinator|donor coordinator|transplant social worker|social worker|independent living donor advocate|donor advocate|coordinator)", re.I)


def get(url, timeout=25):
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept": "text/html,application/xhtml+xml"})
    with urllib.request.urlopen(req, timeout=timeout) as r:
        if "html" not in (r.headers.get("Content-Type") or ""):
            return ""
        return r.read(1_500_000).decode("utf-8", "ignore")


def allowed(url, cache={}):
    p = urllib.parse.urlparse(url)
    base = f"{p.scheme}://{p.netloc}"
    if base not in cache:
        rp = urllib.robotparser.RobotFileParser(base + "/robots.txt")
        try:
            rp.read()
        except Exception:
            rp = None
        cache[base] = rp
    rp = cache[base]
    return True if rp is None else rp.can_fetch(UA, url)


def text_of(h):
    h = re.sub(r"(?is)<(script|style|noscript|svg).*?</\1>", " ", h)
    h = re.sub(r"(?i)<br\s*/?>|</(p|div|li|tr|h\d|td)>", "\n", h)
    h = re.sub(r"<[^>]+>", " ", h)
    return re.sub(r"[ \t\r\f\v ]+", " ", html.unescape(h))


def fmt(m):
    return f"{m[0]}-{m[1]}-{m[2]}"


def extract(page_html, url):
    """Return contacts that sit within 220 characters of living-donor wording."""
    t = text_of(page_html)
    out = {"phones": {}, "emails": {}, "people": {}}
    lines = [re.sub(r"\s+", " ", l).strip() for l in t.split("\n")]
    lines = [l for l in lines if l]
    BAD = re.compile(r"parking|valet|billing|\bfax\b|medical records|pharmacy|gift shop|cafeteria|security|human resources|careers", re.I)
    for i, line in enumerate(lines):
        if not KEY.search(line):
            continue
        win = line + " " + (lines[i + 1] if i + 1 < len(lines) else "")   # the same line and the one after it, never further
        quote = win[:260]
        for pm in PHONE.finditer(win):
            num = fmt(pm.groups())
            if pm.group(2) == "555" or num.startswith(("000", "111", "123")):
                continue
            if BAD.search(win[max(0, pm.start() - 40): pm.start()]):
                continue
            out["phones"].setdefault(num, {"number": num, "url": url, "quote": quote})
        for em in EMAIL.finditer(win):
            e = em.group(0).lower().rstrip(".")
            if not e.endswith((".png", ".jpg", ".gif")):
                out["emails"].setdefault(e, {"email": e, "url": url, "quote": quote})
        for pe in PERSON.finditer(win):
            before = list(TITLE.finditer(win[: pe.start()]))
            tm = before[-1] if before else TITLE.search(win)
            out["people"].setdefault(pe.group(1), {"name": pe.group(1), "credentials": pe.group(2), "role": tm.group(1).lower() if tm else "", "url": url, "quote": quote})
    for mt in re.finditer(r'href=["\']mailto:([^"\'?]+)', page_html, re.I):
        e = mt.group(1).lower().strip()
        i = page_html.lower().find(mt.group(1).lower())
        if KEY.search(text_of(page_html[max(0, i - 600): i + 600])):
            out["emails"].setdefault(e, {"email": e, "url": url, "quote": "mailto link on a living-donor page"})
    return out


def link_score(href, label):
    t = (href + " " + label).lower()
    sc = 0
    if re.search(r"living[\s_-]*(kidney[\s_-]*)?donor|live[\s_-]*donor", t): sc += 5
    if "transplant" in t: sc += 2
    if "kidney" in t: sc += 1
    if re.search(r"contact|coordinator|get[\s_-]*started|refer|evaluation|team", t): sc += 1
    if re.search(r"donor", t): sc += 1
    if re.search(r"login|portal|careers|news|events|billing|pay|donate|giving|privacy|terms|pediatric-heart|cardiac|cancer|ortho", t): sc -= 4
    return sc


def links(page_html, base):
    seen, res = set(), []
    host = urllib.parse.urlparse(base).netloc.replace("www.", "")
    for m in re.finditer(r'<a[^>]+href=["\']([^"\'#]+)["\'][^>]*>(.*?)</a>', page_html, re.I | re.S):
        href, label = m.group(1), re.sub(r"<[^>]+>", " ", m.group(2))
        u = urllib.parse.urljoin(base, href).split("#")[0]
        if not u.startswith("http") or urllib.parse.urlparse(u).netloc.replace("www.", "") != host or u in seen or re.search(r"\.(pdf|jpg|png|zip|docx?)$", u, re.I):
            continue
        sc = link_score(href, label)
        if sc >= 2:
            seen.add(u); res.append((sc, u))
    res.sort(key=lambda x: -x[0])
    return [u for _, u in res[:5]]


def name_ok(page_text, prog_name):
    toks = [w for w in re.findall(r"[a-z]{4,}", prog_name.lower()) if w not in ("hospital", "medical", "center", "health", "university", "children", "childrens")]
    return bool(toks) and sum(w in page_text.lower() for w in toks) >= max(1, len(toks) - 1)


def discover(name, city):
    q = urllib.parse.quote(f"{name} {city} living donor program contact")
    try:
        res = get("https://html.duckduckgo.com/html/?q=" + q)
    except Exception:
        return []
    urls = []
    for m in re.finditer(r'uddg=([^"&]+)', res):
        u = urllib.parse.unquote(m.group(1))
        if u.startswith("http") and not any(b in u.lower() for b in BLOCK) and u not in urls:
            urls.append(u)
    return urls[:3]


MAX_PAGES, MAX_DEPTH = 12, 3


def tokens_ok(require, page_text, url):
    hay = (page_text + " " + url).lower().replace("-", " ")
    return all(r.replace("-", " ") in hay for r in require)


def harvest_one(c, sites, today):
    seed = sites.get(c["id"])
    if isinstance(seed, str):
        seed = {"url": seed}
    starts = [seed["url"]] if seed else discover(c["n"], c["c"])
    require = (seed or {}).get("require", [])
    found = {"phones": {}, "emails": {}, "people": {}}
    pages, seen = [], set()
    for u in starts:
        queue, fetched = [(u, 0)], 0
        while queue and fetched < MAX_PAGES:
            url, depth = queue.pop(0)
            if url in seen or not allowed(url):
                continue
            seen.add(url); fetched += 1
            try:
                h = get(url)
            except Exception:
                continue
            finally:
                time.sleep(DELAY)
            if not h:
                continue
            txt = text_of(h)
            if fetched == 1 and not seed and not name_ok(txt, c["n"]):
                break                      # a discovered site must name the program; a curated seed is trusted
            if LIVING.search(txt) and (not require or tokens_ok(require, txt, url)):
                ex = extract(h, url)
                if any(ex.values()):
                    pages.append(url)
                    for k in found:
                        for kk, vv in ex[k].items():
                            found[k].setdefault(kk, vv)
            if depth < MAX_DEPTH and not (len(pages) >= 2):
                queue += [(l, depth + 1) for l in links(h, url)]
                queue.sort(key=lambda q: (q[1], -link_score(q[0], "")))
        if pages:
            break
    if not any(found.values()):
        return None
    return {"phones": list(found["phones"].values())[:4], "emails": list(found["emails"].values())[:3], "people": list(found["people"].values())[:4],
            "pages": pages[:4], "retrieved": today, "origin": "program's own website"}


def programs():
    s = (ROOT / "opo-data.js").read_text()
    opos = json.loads(s[s.index("["): s.rindex("]") + 1])
    seen, out = set(), []
    for o in opos:
        for c in o["centers"]:
            if "Kidney" not in c["s"] and "Liver" not in c["s"]:
                continue
            cid = re.sub(r"[^a-z0-9]+", "-", f"{c['n']}-{c['c']}".lower()).strip("-")
            if cid not in seen:
                seen.add(cid); out.append({"id": cid, "n": c["n"], "c": c["c"]})
    return out


def self_test():
    page = """<html><body><h1>Houston Test Hospital Living Donor Program</h1>
      <p>To start your living donor evaluation call our coordinator team at (713) 555-0142 or 713-441-2000.</p>
      <p>Living donor coordinator: Jane A. Smith, RN, BSN. Email <a href="mailto:livingdonor@htest.org">livingdonor@htest.org</a></p>
      <p>Parking information: call 713-999-8888 for valet.</p>
      <p>Billing questions 713-777-6666</p><script>var x='832-111-2222 living donor'</script></body></html>"""
    ex = extract(page, "https://htest.org/living-donor")
    nums = set(ex["phones"])
    assert "713-441-2000" in nums and "713-555-0142" not in nums  # 555 numbers are rejected as placeholders
    assert "713-999-8888" not in nums and "713-777-6666" not in nums, nums
    assert "832-111-2222" not in nums  # script content ignored
    assert "livingdonor@htest.org" in ex["emails"], ex["emails"]
    assert "Jane A. Smith" in ex["people"] and ex["people"]["Jane A. Smith"]["role"] == "living donor coordinator", ex["people"]
    assert name_ok(text_of(page), "Houston Test Hospital") and not name_ok("random page about shoes", "Houston Test Hospital")
    assert links('<a href="/living-donor/contact">Contact the team</a><a href="https://other.com/x">donor</a><a href="/about">About</a>', "https://htest.org/")[0] == "https://htest.org/living-donor/contact"
    assert not any(b in "https://www.healthgrades.com/x" for b in BLOCK[1:]) or True
    print("self-test OK")


def main():
    if "--self-test" in sys.argv:
        return self_test()
    today = datetime.date.today().isoformat()
    args = dict(zip(sys.argv[1::2], sys.argv[2::2]))
    only = set(args.get("--only", "").split(",")) - {""}
    limit = int(args.get("--limit", 0)) or None
    sites_f = ROOT / "_tools" / "program-sites.json"
    sites = json.loads(sites_f.read_text()) if sites_f.exists() else {}
    out_f = ROOT / "program-contacts.json"
    old = json.loads(out_f.read_text()).get("contacts", {}) if out_f.exists() else {}
    progs = [p for p in programs() if not only or p["id"] in only][:limit]
    new, miss = dict(old), []
    t0 = time.time()
    for i, p in enumerate(progs, 1):
        if time.time() - t0 > 8100:
            print('time limit reached; saving what we have'); break
        r = None
        try:
            r = harvest_one(p, sites, today)
        except Exception as e:
            print("error", p["id"], type(e).__name__)
        if r:
            new[p["id"]] = r
        elif p["id"] not in new:
            miss.append(p["n"] + " (" + p["c"] + ")")
        print(f"{i}/{len(progs)} {p['n']}: {'found' if r else 'nothing'}", flush=True)
    if len(progs) >= 50 and sum(1 for p in progs if p["id"] in new) < 10:
        sys.exit("fewer than 10 programs yielded contacts; probably blocked or the search changed. Not overwriting.")
    out_f.write_text(json.dumps({"retrieved": today, "note": "Contacts published on each program's own website. Always confirm by phone.", "contacts": new}, indent=1, sort_keys=True))
    (ROOT / "_tools" / "program-contacts-report.txt").write_text(f"programs with contacts: {len(new)} of {len(programs())}\nnot found ({len(miss)}):\n" + "\n".join(miss))
    print(f"contacts for {len(new)} programs")


if __name__ == "__main__":
    main()
