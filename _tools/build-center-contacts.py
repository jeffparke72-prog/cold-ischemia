#!/usr/bin/env python3
"""Attach a public, dated main phone number to each transplant program listed in opo-data.js.

Source: CMS Provider Data Catalog, "Hospital General Information" (dataset xubh-q36u), a U.S. government
record updated by CMS. It lists each hospital's main telephone number. It does NOT list transplant social
workers or living-donor coordinators, so the page labels these numbers "main hospital line" and tells people
what to ask for. Matching is by state-of-service, city and name similarity; low-confidence matches are dropped
(never guessed) and written to the report so a person can check them.

    python3 _tools/build-center-contacts.py            # fetch from CMS and write center-contacts.json
    python3 _tools/build-center-contacts.py --self-test
"""
import json, re, sys, time, urllib.request, urllib.parse, datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
API = "https://data.cms.gov/provider-data/api/1/datastore/query/xubh-q36u/0"
STOP = set("the of and at for hospital hospitals medical center centre health system university campus children childrens s inc llc clinic regional memorial".split())
MIN_SCORE = 0.75


def norm(s):
    s = re.sub(r"[^a-z0-9 ]", " ", s.lower().replace("&", " and ").replace("'", ""))
    return [w for w in s.split() if w not in STOP]


def score(a, b):
    A, B = set(norm(a)), set(norm(b))
    return len(A & B) / len(A | B) if A and B else 0.0


def clean_phone(p):
    d = re.sub(r"\D", "", str(p or ""))
    d = d[1:] if len(d) == 11 and d[0] == "1" else d
    return f"{d[:3]}-{d[3:6]}-{d[6:]}" if len(d) == 10 else None


def key(rec, *names):
    low = {k.lower().replace(" ", "_"): v for k, v in rec.items()}
    for n in names:
        if low.get(n):
            return low[n]
    return ""


def fetch_all():
    out, off = [], 0
    while True:
        url = f"{API}?limit=500&offset={off}"
        with urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": "cif-center-contacts"}), timeout=60) as r:
            rows = json.load(r).get("results", [])
        out += rows
        if len(rows) < 500:
            return out
        off += 500
        time.sleep(0.5)


def load_opos():
    s = (ROOT / "opo-data.js").read_text()
    return json.loads(s[s.index("["): s.rindex("]") + 1])


def match(opos, hospitals, today):
    hs = [{"name": key(h, "facility_name"), "city": key(h, "citytown", "city", "city/town"), "state": key(h, "state"),
           "phone": clean_phone(key(h, "telephone_number", "phone_number")), "id": key(h, "facility_id", "provider_id")} for h in hospitals]
    hs = [h for h in hs if h["phone"] and h["name"]]
    result, report = {}, {"matched": 0, "unmatched": []}
    for o in opos:
        states = set(o.get("serves") or []) | {o["state"]}
        for c in o["centers"]:
            cid = re.sub(r"[^a-z0-9]+", "-", f"{c['n']}-{c['c']}".lower()).strip("-")
            best, bs = None, 0
            for h in hs:
                if h["state"] not in states:
                    continue
                sc = score(c["n"], h["name"]) + (0.25 if h["city"].lower() == c["c"].lower() else 0)
                if sc > bs:
                    best, bs = h, sc
            same_city = bool(best) and best["city"].lower() == c["c"].lower()
            # Same city: name similarity >= 0.6. Different or unknown city: the names must be essentially identical (>= 0.9).
            # A wrong number is worse than no number, so near-misses fall through to a search link.
            if best and (bs - 0.25 * same_city >= (MIN_SCORE if same_city else 0.9)) and not re.search(r"behavioral|psychiatric|rehab", best["name"], re.I):
                result[cid] = {"phone": best["phone"], "line": "main hospital line", "matched": best["name"], "city": best["city"], "state": best["state"],
                               "source": "CMS Provider Data Catalog, Hospital General Information", "ccn": best["id"], "retrieved": today, "confidence": round(min(bs, 1.25) / 1.25, 2)}
                report["matched"] += 1
            else:
                report["unmatched"].append(f"{c['n']} ({c['c']})")
    return result, report


def self_test():
    assert norm("The Children's Hospital of Alabama") == ["alabama"]
    assert clean_phone("(205) 731-9200") == "205-731-9200" and clean_phone("12") is None
    opos = [{"state": "TX", "serves": ["TX"], "centers": [{"n": "Houston Methodist Hospital", "c": "Houston", "s": ["Kidney"]}, {"n": "Nowhere Clinic", "c": "Austin", "s": ["Kidney"]}]}]
    hosp = [{"facility_name": "HOUSTON METHODIST HOSPITAL", "citytown": "HOUSTON", "state": "TX", "telephone_number": "(713) 790-3311", "facility_id": "450358"},
            {"facility_name": "HOUSTON METHODIST HOSPITAL", "citytown": "HOUSTON", "state": "CA", "telephone_number": "(111) 111-1111", "facility_id": "x"},
            {"facility_name": "Austin General", "citytown": "Austin", "state": "TX", "telephone_number": "5125550100", "facility_id": "y"}]
    res, rep = match(opos, hosp, "2026-01-01")
    assert list(res) == ["houston-methodist-hospital-houston"], res
    assert res["houston-methodist-hospital-houston"]["phone"] == "713-790-3311"
    assert rep["unmatched"] == ["Nowhere Clinic (Austin)"]
    wrong = [{"facility_name": "SAINT BARNABAS BEHAVIORAL HEALTH CENTER", "citytown": "TOMS RIVER", "state": "NJ", "telephone_number": "7325550100", "facility_id": "z"}]
    r2, _ = match([{"state": "NJ", "serves": ["NJ"], "centers": [{"n": "Saint Barnabas Medical Center", "c": "New Providence", "s": ["Kidney"]}]}], wrong, "2026-01-01")
    assert r2 == {}, r2
    print("self-test OK")


def main():
    if "--self-test" in sys.argv:
        return self_test()
    today = datetime.date.today().isoformat()
    hospitals = fetch_all()
    if len(hospitals) < 4000:
        sys.exit(f"CMS returned only {len(hospitals)} hospitals; refusing to overwrite center-contacts.json")
    res, rep = match(load_opos(), hospitals, today)
    if rep["matched"] < 100:
        sys.exit(f"only {rep['matched']} programs matched; the data format may have changed. Not writing.")
    (ROOT / "center-contacts.json").write_text(json.dumps({"retrieved": today, "source": "CMS Provider Data Catalog (xubh-q36u)", "contacts": res}, indent=1, sort_keys=True))
    (ROOT / "_social").mkdir(exist_ok=True)
    (ROOT / "_tools" / "center-contacts-report.txt").write_text(f"matched {rep['matched']}\nunmatched ({len(rep['unmatched'])}):\n" + "\n".join(rep["unmatched"]))
    print(f"matched {rep['matched']} of {rep['matched'] + len(rep['unmatched'])}")


if __name__ == "__main__":
    main()
