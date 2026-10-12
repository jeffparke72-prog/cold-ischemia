#!/usr/bin/env python3
"""Builds kidney-centers.json: every U.S. kidney transplant center, grouped by state, with address, coordinates and a main
phone number from federal records.

Sources (both federal, both public):
  - HRSA Organ Transplantation Center file (ORG_OTC_FCT_DET.xlsx): center name, address, city, state, ZIP, latitude, longitude.
  - CMS Hospital General Information (dataset xubh-q36u): the hospital's main telephone number, matched by state, ZIP, address and name.
A center whose phone cannot be matched with confidence keeps no phone (never guessed); the page then sends people to the hospital's website.

    python3 _tools/build-state-directory.py            # download both files, write kidney-centers.json and the report
    python3 _tools/build-state-directory.py --self-test
"""
import io, json, re, sys, time, datetime, urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
HRSA = "https://data.hrsa.gov/DataDownload/DD_Files/ORG_OTC_FCT_DET.xlsx"
CMS = "https://data.cms.gov/provider-data/api/1/datastore/query/xubh-q36u/0"
STOP = set("the of and at for hospital hospitals medical center centre health system university campus children childrens s inc llc clinic regional memorial".split())
STATES = {"AL": "Alabama", "AK": "Alaska", "AZ": "Arizona", "AR": "Arkansas", "CA": "California", "CO": "Colorado", "CT": "Connecticut", "DE": "Delaware", "DC": "District of Columbia", "FL": "Florida", "GA": "Georgia", "HI": "Hawaii", "ID": "Idaho", "IL": "Illinois", "IN": "Indiana", "IA": "Iowa", "KS": "Kansas", "KY": "Kentucky", "LA": "Louisiana", "ME": "Maine", "MD": "Maryland", "MA": "Massachusetts", "MI": "Michigan", "MN": "Minnesota", "MS": "Mississippi", "MO": "Missouri", "MT": "Montana", "NE": "Nebraska", "NV": "Nevada", "NH": "New Hampshire", "NJ": "New Jersey", "NM": "New Mexico", "NY": "New York", "NC": "North Carolina", "ND": "North Dakota", "OH": "Ohio", "OK": "Oklahoma", "OR": "Oregon", "PA": "Pennsylvania", "RI": "Rhode Island", "SC": "South Carolina", "SD": "South Dakota", "TN": "Tennessee", "TX": "Texas", "UT": "Utah", "VT": "Vermont", "VA": "Virginia", "WA": "Washington", "WV": "West Virginia", "WI": "Wisconsin", "WY": "Wyoming", "PR": "Puerto Rico"}


def get(url, n=60_000_000):
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (compatible; ColdIschemiaFoundation directory build)"})
    with urllib.request.urlopen(req, timeout=120) as r:
        return r.read(n)


def toks(s):
    s = re.sub(r"[^a-z0-9 ]", " ", str(s).lower().replace("&", " and ").replace("'", ""))
    return {w for w in s.split() if w not in STOP}


def jac(a, b):
    A, B = toks(a), toks(b)
    return len(A & B) / len(A | B) if A and B else 0.0


def zip5(z):
    m = re.match(r"\s*(\d{5})", str(z or "")); return m.group(1) if m else ""


def street_key(addr):
    m = re.match(r"\s*(\d+)\s+(?:[nsew]\.?\s+)?([a-z]+)", str(addr or "").lower())
    return (m.group(1), m.group(2)) if m else None


def phone(p):
    d = re.sub(r"\D", "", str(p or "")); d = d[1:] if len(d) == 11 and d[0] == "1" else d
    return f"{d[:3]}-{d[3:6]}-{d[6:]}" if len(d) == 10 else None


def read_hrsa(raw):
    import openpyxl
    ws = openpyxl.load_workbook(io.BytesIO(raw), read_only=True, data_only=True).worksheets[0]
    rows = list(ws.iter_rows(values_only=True)); head = [str(h or "").strip() for h in rows[0]]
    def col(name, nth=0):
        idx = [i for i, h in enumerate(head) if h == name]; return idx[nth] if len(idx) > nth else None
    c = dict(name=col("OTC Name"), code=col("OTC Code"), addr=col("Address", 1), city=col("City", 1), zip=col("ZIP", 1), svc=next((i for i, h in enumerate(head) if h.startswith("Organ Transplantation Center Service Type")), None),
             state=col("Common State Abbreviation"), lon=col("Longitude"), lat=col("Latitude"), opo=col("OPO Name"), pcode=col("Common Postal Code"))
    for k in ("name", "code", "svc", "state"):
        if c[k] is None: raise SystemExit(f"HRSA file layout changed: column for {k} not found in {head}")
    seen, out = {}, []
    for r in rows[1:]:
        if not r or str(r[c["svc"]] or "").strip().lower() != "kidney": continue
        code = str(r[c["code"]]).strip()
        if code in seen: continue
        seen[code] = 1
        g = lambda k: (r[c[k]] if c[k] is not None else None)
        f = lambda v: float(v) if v not in (None, "") else None
        out.append(dict(code=code, name=str(g("name")).strip(), address=str(g("addr") or "").strip(), city=str(g("city") or "").strip(), state=str(g("state") or "").strip(), zip=zip5(g("zip") or g("pcode")),
                        lat=f(g("lat")), lon=f(g("lon")), opo=str(g("opo") or "").strip()))
    return out


def fetch_cms():
    out, off = [], 0
    while True:
        rows = json.loads(get(f"{CMS}?limit=500&offset={off}", 20_000_000)).get("results", []); out += rows
        if len(rows) < 500: return out
        off += 500; time.sleep(0.4)


def match_phone(center, cms_by_state, alias=None):
    best, bs = None, 0.0
    ck = street_key(center["address"])
    for h in cms_by_state.get(center["state"], []):
        nj = max(jac(center["name"], h["facility_name"]), jac(alias, h["facility_name"]) if alias else 0)
        same_zip = bool(center["zip"]) and zip5(h["zip_code"]) == center["zip"]
        same_city = center["city"].lower() == str(h["citytown"]).lower()
        hk = street_key(h["address"]); same_addr = bool(ck and hk and ck == hk and same_zip)
        sc = nj + 0.5 * same_zip + 0.5 * same_addr + 0.25 * same_city
        ok = (same_addr and nj >= 0.1) or (same_zip and nj >= 0.34) or (same_city and nj >= 0.6) or nj >= 0.85 or (alias and (same_zip or same_city) and nj >= 0.5)
        if ok and sc > bs: best, bs = h, sc
    if not best or not phone(best["telephone_number"]): return None
    return dict(phone=phone(best["telephone_number"]), cms_name=best["facility_name"], cms_id=best["facility_id"], confidence=round(min(bs / 1.75, 1.0), 2))


def build(centers, cms, today, overrides=None):
    overrides = overrides or {}
    by = {}
    for h in cms: by.setdefault(h["state"], []).append(h)
    states = {s: [] for s in STATES}
    for c in centers:
        if c["state"] not in states: continue
        ov = overrides.get(c["name"], {})
        if ov.get("closed"):
            continue
        m = match_phone(c, by, ov.get("alias")) or {}
        states[c["state"]].append(dict(c, **m, line="main hospital line" if m else None))
    for s in states: states[s].sort(key=lambda x: x["name"])
    return states


def report(states):
    lines = ["state | kidney centers | with a phone"]
    for s, v in sorted(states.items()): lines.append(f"{s} | {len(v)} | {sum(1 for x in v if x.get('phone'))}")
    tot = sum(len(v) for v in states.values()); ph = sum(1 for v in states.values() for x in v if x.get("phone"))
    lines.append(f"TOTAL | {tot} | {ph}")
    lines.append("\nstates with no kidney center: " + ", ".join(s for s, v in sorted(states.items()) if not v))
    lines.append("\ncenters without a phone:")
    for s, v in sorted(states.items()):
        for x in v:
            if not x.get("phone"): lines.append(f"  {s} {x['name']} ({x['city']}, zip {x['zip']})")
    return "\n".join(lines)


def self_test():
    assert phone("(334) 793-8701") == "334-793-8701" and phone("12") is None
    assert street_key("55 Fruit St") == ("55", "fruit") and street_key("1108 N. Ross Clark Circle") == ("1108", "ross")
    center = dict(code="MAMG", name="Massachusetts General Hospital", address="55 Fruit St", city="Boston", state="MA", zip="02114", lat=42.36, lon=-71.07, opo="NEOB")
    cms = [dict(facility_name="MASSACHUSETTS GENERAL HOSPITAL", address="55 FRUIT STREET", citytown="BOSTON", state="MA", zip_code="02114", telephone_number="(617) 726-2000", facility_id="220071"),
           dict(facility_name="MASS EYE AND EAR", address="243 CHARLES ST", citytown="BOSTON", state="MA", zip_code="02114", telephone_number="(617) 523-7900", facility_id="x"),
           dict(facility_name="MASSACHUSETTS GENERAL HOSPITAL", address="1 OTHER RD", citytown="SALEM", state="NY", zip_code="12345", telephone_number="(212) 000-0000", facility_id="y")]
    st = build([center, dict(center, code="ZZ", name="Nowhere Clinic", address="9 Elm St", zip="99999", state="WY", city="Cody")], cms, "2026-01-01")
    assert st["MA"][0]["phone"] == "617-726-2000" and st["MA"][0]["cms_id"] == "220071", st["MA"]
    assert "phone" not in st["WY"][0] and st["AK"] == [], st["WY"]
    assert "TOTAL | 2 | 1" in report(st)
    st2 = build([dict(center, name="Hahnemann University Hospital")], cms, "2026-01-01", {"Hahnemann University Hospital": {"closed": True}})
    assert st2["MA"] == []
    st3 = build([dict(center, name="Weird Old Name", address="1 Nope Rd")], cms, "2026-01-01", {"Weird Old Name": {"alias": "Massachusetts General Hospital"}})
    assert st3["MA"][0]["phone"] == "617-726-2000", st3["MA"]
    print("self-test OK")


def main():
    if "--self-test" in sys.argv: return self_test()
    today = datetime.date.today().isoformat()
    centers = read_hrsa(get(HRSA)); cms = fetch_cms()
    if len(centers) < 150 or len(cms) < 4000: sys.exit(f"suspicious sizes: {len(centers)} kidney centers, {len(cms)} CMS hospitals; not writing")
    ov = json.loads((ROOT / "_tools" / "directory-overrides.json").read_text())
    states = build(centers, cms, today, ov)
    (ROOT / "kidney-centers.json").write_text(json.dumps(dict(updated=today, sources=["HRSA Organ Transplantation Center file (ORG_OTC_FCT_DET)", "CMS Hospital General Information (xubh-q36u)"], names=STATES, states=states), indent=0, sort_keys=True))
    r = report(states); (ROOT / "_tools" / "state-directory-report.txt").write_text(r); print(r[:3000])


if __name__ == "__main__":
    main()
