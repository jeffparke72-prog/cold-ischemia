#!/usr/bin/env python3
"""Validates serial/installments.json against the rules of The Inside Files and writes inside-files.xml (RSS).

    python3 _tools/serial_build.py            # validate + write the feed (exit 1 on any rule failure)
    python3 _tools/serial_build.py --self-test

Rules enforced (see .claude/skills/cif-whistleblower-serial/SKILL.md):
  - the event that prompted the installment (hook_date) is no more than window_days before publish
  - every cited source exists, has https URL, publisher, date and type
  - grade A needs primary_read=true; grade B needs two distinct publishers; no claim without a source
  - every figure has alt text; every chart has data; every installment has a 'what we do not know' section and a reply
  - installments are weekly, in order; 900-1,700 words each
"""
import json, re, sys, datetime as dt, html
from pathlib import Path
from email.utils import format_datetime

ROOT = Path(__file__).resolve().parents[1]
SITE = "https://coldischemia.foundation"


def words(inst):
    return len(re.sub(r"<[^>]+>|\{S\d+\}", " ", " ".join(s["html"] for s in inst["sections"])).split())


def validate(j, today=None):
    errs, warn = [], []
    src = j["sources"]
    for k, s in src.items():
        for f in ("title", "publisher", "date", "type", "url"):
            if not s.get(f): errs.append(f"{k}: missing {f}")
        if not str(s.get("url", "")).startswith("https://"): errs.append(f"{k}: URL must be https")
    prev = None
    for i in j["installments"]:
        n = i["n"]; tag = f"installment {n}"
        pub, hook = dt.date.fromisoformat(i["publish"]), dt.date.fromisoformat(i["hook_date"])
        if (pub - hook).days > i.get("window_days", 90): errs.append(f"{tag}: hook event is {(pub - hook).days} days old (limit {i.get('window_days', 90)})")
        if (pub - hook).days < 0: errs.append(f"{tag}: hook event is after publication")
        if prev and (pub - prev).days != 7: warn.append(f"{tag}: not exactly 7 days after the previous installment")
        prev = pub
        w = words(i)
        if not 900 <= w <= 1700: errs.append(f"{tag}: {w} words (want 900-1,700)")
        ids = {s["id"] for s in i["sections"]}
        for need in ("unknown", "reply"):
            if need not in ids: errs.append(f"{tag}: missing section '{need}'")
        for s in i["sections"]:
            for m in re.findall(r"\{(S\d+)\}", s["html"]):
                if m not in src: errs.append(f"{tag}: cites unknown source {m}")
        for e in i["evidence"]:
            pubs = {src[x]["publisher"] for x in e["sources"] if x in src}
            if not e["sources"]: errs.append(f"{tag} {e['id']}: no source")
            if e["grade"] == "A" and not e.get("primary_read"): errs.append(f"{tag} {e['id']}: grade A needs primary_read=true")
            if e["grade"] == "B" and len(pubs) < 2: errs.append(f"{tag} {e['id']}: grade B needs two distinct publishers")
            if e["grade"] not in j["grades"]: errs.append(f"{tag} {e['id']}: unknown grade")
        for f in i.get("figures", []):
            if len(f.get("alt", "")) < 20: errs.append(f"{tag}: figure {f.get('src')} needs alt text")
            if not (ROOT / f["src"]).exists(): errs.append(f"{tag}: figure file missing {f['src']}")
        for c in i["charts"]:
            if c["type"] not in ("timeline", "waffle", "elapsed", "counter", "reply"): errs.append(f"{tag}: unknown chart type {c['type']}")
        if not i.get("glossary"): warn.append(f"{tag}: no glossary")
        if re.search(r"\b(is guilty|are guilty|committed fraud|murdered)\b", " ".join(s["html"] for s in i["sections"]), re.I):
            errs.append(f"{tag}: conclusory wrongdoing language; use 'alleged' until a court or agency rules")
    return errs, warn


def feed(j):
    items = []
    for i in sorted(j["installments"], key=lambda x: x["n"], reverse=True):
        d = dt.datetime.fromisoformat(i["publish"] + "T12:00:00+00:00")
        items.append(f"<item><title>{html.escape('Installment ' + str(i['n']) + ': ' + i['title'])}</title><link>{SITE}/inside-files.html#i{i['n']}/read</link><guid isPermaLink=\"false\">inside-files-{i['n']}</guid><pubDate>{format_datetime(d)}</pubDate><description>{html.escape(i['dek'])}</description></item>")
    return ('<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>The Inside Files</title>'
            f'<link>{SITE}/inside-files.html</link><description>{html.escape(j["series"]["tagline"])}</description><language>en-us</language>' + "".join(items) + "</channel></rss>")


def self_test():
    base = json.loads((ROOT / "serial" / "installments.json").read_text())
    errs, _ = validate(base); assert not errs, errs
    bad = json.loads(json.dumps(base)); bad["installments"][0]["hook_date"] = "2026-01-01"
    assert any("days old" in e for e in validate(bad)[0])
    bad = json.loads(json.dumps(base)); bad["installments"][0]["evidence"][0]["grade"] = "A"
    assert any("primary_read" in e for e in validate(bad)[0])
    bad = json.loads(json.dumps(base)); bad["installments"][0]["sections"][0]["html"] += " {S99}"
    assert any("unknown source" in e for e in validate(bad)[0])
    bad = json.loads(json.dumps(base)); bad["installments"][0]["sections"][0]["html"] += " The company is guilty."
    assert any("conclusory" in e for e in validate(bad)[0])
    assert "<item>" in feed(base)
    print("self-test OK")


if __name__ == "__main__":
    if "--self-test" in sys.argv: self_test(); sys.exit()
    j = json.loads((ROOT / "serial" / "installments.json").read_text())
    errs, warn = validate(j)
    for w in warn: print("warning:", w)
    for e in errs: print("ERROR:", e)
    if errs: sys.exit(1)
    (ROOT / "inside-files.xml").write_text(feed(j))
    print(f"ok: {len(j['installments'])} installment(s), feed written")
