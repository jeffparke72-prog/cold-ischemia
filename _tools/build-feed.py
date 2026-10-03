#!/usr/bin/env python3
"""Builds the Cold Ischemia Foundation's live transplant & kidney news feed.

Reads the source list in _feeds/feeds.json, fetches every source, keeps only articles about
transplant policy, organ donation, kidney disease, dialysis and ESRD, and writes:
  news/feed.json  - read by transplant-news-feed.html
  news/feed.xml   - one combined RSS feed anyone can subscribe to
Run automatically every 30 minutes by .github/workflows/update-news-feed.yml (no accounts or keys needed).
A source that fails is reported and skipped; the rest still update, and older articles are kept.
"""
import calendar, datetime as dt, hashlib, html, json, os, re, sys, time, urllib.parse, urllib.request
from email.utils import format_datetime

import feedparser

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CONFIG = os.path.join(ROOT, "_feeds", "feeds.json")
OUT_JSON = os.path.join(ROOT, "news", "feed.json")
OUT_XML = os.path.join(ROOT, "news", "feed.xml")
SITE = "https://coldischemia.foundation"
KEEP_DAYS = 90
MAX_ITEMS = 400
UA = "Mozilla/5.0 (compatible; CIF-NewsFeed/1.0; +https://coldischemia.foundation/transplant-news-feed.html)"

TOPIC = re.compile(r"\b(transplant\w*|organ donor\w*|organ donation|donat\w+ (an |a )?(kidney|liver|organ)|living donor\w*|"
                   r"organ procurement|OPOs?\b|OPTN|UNOS|SRTR|xenotransplant\w*|kidney\w*|renal|nephr\w*|dialysis|"
                   r"hemodialysis|ESRD|ESKD|end[- ]stage (renal|kidney)|chronic kidney|CKD|allograft|graft (failure|survival)|"
                   r"immunosuppress\w*|waitlist|waiting list|deceased donor|organ shortage|HRSA)\b", re.I)


def now_utc():
    return dt.datetime.now(dt.timezone.utc)


def clean(text, limit=None):
    text = html.unescape(re.sub(r"<[^>]+>", " ", text or ""))
    text = re.sub(r"\s+", " ", text).strip()
    if limit and len(text) > limit:
        text = text[:limit].rsplit(" ", 1)[0] + "…"
    return text


def get(url, timeout=30):
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept": "application/rss+xml, application/atom+xml, application/xml, text/xml, application/json, */*"})
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return r.read()


def entry_time(e):
    for key in ("published_parsed", "updated_parsed", "created_parsed"):
        t = e.get(key)
        if t:
            return dt.datetime.fromtimestamp(calendar.timegm(t), dt.timezone.utc)
    return None


def from_rss(src):
    raw = get(src["url"])
    parsed = feedparser.parse(raw)
    if parsed.bozo and not parsed.entries:
        raise ValueError("not a readable RSS/Atom feed (%s)" % getattr(parsed, "bozo_exception", "unknown"))
    items = []
    for e in parsed.entries[:60]:
        title = clean(e.get("title"))
        link = e.get("link") or ""
        if not title or not link:
            continue
        summary = clean(e.get("summary") or e.get("description"), 320)
        if src.get("filter") and not TOPIC.search(title + " " + summary):
            continue
        outlet = ""
        if isinstance(e.get("source"), dict):
            outlet = e["source"].get("title", "")
        when = entry_time(e)
        items.append({"title": title, "link": link, "summary": summary, "outlet": outlet,
                      "published": when.isoformat() if when else None})
    return items


def from_pubmed(src):
    base = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/"
    q = urllib.parse.urlencode({"db": "pubmed", "term": src["term"], "sort": "pub_date", "retmax": 40, "retmode": "json", "tool": "cif-newsfeed", "email": "jeffparke72@gmail.com"})
    ids = json.loads(get(base + "esearch.fcgi?" + q))["esearchresult"]["idlist"]
    if not ids:
        return []
    time.sleep(0.4)
    q = urllib.parse.urlencode({"db": "pubmed", "id": ",".join(ids), "retmode": "json", "tool": "cif-newsfeed", "email": "jeffparke72@gmail.com"})
    res = json.loads(get(base + "esummary.fcgi?" + q))["result"]
    items = []
    for pmid in ids:
        r = res.get(pmid) or {}
        title = clean(r.get("title"))
        if not title:
            continue
        when = None
        for key in ("sortpubdate", "epubdate", "pubdate"):
            v = (r.get(key) or "").strip()
            m = re.match(r"(\d{4})/(\d{2})/(\d{2})", v)
            if m:
                when = dt.datetime(int(m[1]), int(m[2]), int(m[3]), 12, tzinfo=dt.timezone.utc)
                break
        authors = ", ".join(a.get("name", "") for a in (r.get("authors") or [])[:3])
        items.append({"title": title, "link": "https://pubmed.ncbi.nlm.nih.gov/%s/" % pmid,
                      "summary": clean("%s%s. %s" % (authors, " et al" if len(r.get("authors") or []) > 3 else "", r.get("fulljournalname") or r.get("source") or "")),
                      "outlet": r.get("source") or "", "published": when.isoformat() if when else None})
    return items


def main():
    cfg = json.load(open(CONFIG, encoding="utf-8"))
    old = {}
    if os.path.exists(OUT_JSON):
        try:
            for it in json.load(open(OUT_JSON, encoding="utf-8")).get("items", []):
                old[it["id"]] = it
        except Exception:
            pass
    fetched_at = now_utc()
    statuses, fresh = [], {}
    for src in cfg["feeds"]:
        if src.get("enabled") is False:
            continue
        st = {"name": src["name"], "category": src.get("category", "News"), "url": src["url"], "ok": False, "count": 0, "error": None}
        try:
            items = from_pubmed(src) if src.get("type") == "pubmed" else from_rss(src)
            for it in items:
                key = re.sub(r"[?#].*$", "", it["link"]) if "news.google.com" not in it["link"] else it["title"].lower()
                it["id"] = hashlib.sha1(key.encode("utf-8")).hexdigest()[:16]
                it["source"] = src["name"]
                it["category"] = st["category"]
                prev = old.get(it["id"])
                it["first_seen"] = prev["first_seen"] if prev else fetched_at.isoformat()
                if not it["published"]:
                    it["published"] = it["first_seen"]
                fresh[it["id"]] = it
            st["ok"], st["count"] = True, len(items)
        except Exception as ex:  # one failing source never stops the others
            st["error"] = ("%s: %s" % (type(ex).__name__, ex))[:200]
        statuses.append(st)
        print(("OK   %3d  " % st["count"] if st["ok"] else "FAIL      ") + src["name"] + ("" if st["ok"] else "  -> " + st["error"]), flush=True)
        time.sleep(0.5)

    merged = dict(old)
    merged.update(fresh)
    cutoff = fetched_at - dt.timedelta(days=KEEP_DAYS)
    live_sources = {s["name"] for s in cfg["feeds"] if s.get("enabled") is not False}
    items = [it for it in merged.values()
             if it.get("source") in live_sources and dt.datetime.fromisoformat(it["published"]) >= cutoff]
    items.sort(key=lambda it: it["published"], reverse=True)
    items = items[:MAX_ITEMS]

    os.makedirs(os.path.dirname(OUT_JSON), exist_ok=True)
    data = {"updated": fetched_at.isoformat(), "sources": statuses, "items": items}
    with open(OUT_JSON, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=0)

    def esc(s):
        return html.escape(s or "", quote=True)
    rss = ['<?xml version="1.0" encoding="UTF-8"?>', '<rss version="2.0"><channel>',
           "<title>Cold Ischemia Foundation: Transplant &amp; Kidney Wire</title>",
           "<link>%s/transplant-news-feed.html</link>" % SITE,
           "<description>Live transplant policy, organ donation, kidney disease, dialysis and ESRD research and news, from %d public sources.</description>" % len(statuses),
           "<lastBuildDate>%s</lastBuildDate>" % format_datetime(fetched_at)]
    for it in items[:100]:
        rss.append("<item><title>%s</title><link>%s</link><guid isPermaLink=\"false\">%s</guid><pubDate>%s</pubDate><category>%s</category><description>%s</description></item>" % (
            esc(it["title"]), esc(it["link"]), it["id"], format_datetime(dt.datetime.fromisoformat(it["published"])), esc(it["category"]), esc((it["source"] + ". " + it["summary"]).strip())))
    rss.append("</channel></rss>")
    open(OUT_XML, "w", encoding="utf-8").write("\n".join(rss))

    ok = sum(1 for s in statuses if s["ok"])
    print("\n%d of %d sources OK, %d articles in the feed" % (ok, len(statuses), len(items)))
    if ok == 0:
        sys.exit(1)


if __name__ == "__main__":
    main()
