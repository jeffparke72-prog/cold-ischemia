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
STOP = set("the of and at for a hospital hospitals medical center centre health healthcare system campus s inc llc clinic".split())
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


def is_peds(*names):
    return any(re.search(r"\bchild", str(n or ""), re.I) for n in names)


def is_va(*names):
    return any(re.search(r"\b(va|veterans?)\b", str(n or ""), re.I) for n in names)


def overlap(a, b):
    A, B = toks(a), toks(b)
    return len(A & B) / min(len(A), len(B)) if A and B else 0.0


def score_pair(center, h, alias=None):
    """Return (score, ok) for one HRSA center against one CMS hospital in the same state."""
    names = [center["name"]] + ([alias] if alias else [])
    # different kinds of hospital are never the same hospital: children's vs adult, VA vs non-VA
    if is_peds(*names) != is_peds(h["facility_name"]) and not is_peds(alias):
        return 0.0, False
    if is_va(*names) != is_va(h["facility_name"]):
        return 0.0, False
    nj = max(jac(n, h["facility_name"]) for n in names)
    ov = max(overlap(n, h["facility_name"]) for n in names)
    ck, hk = street_key(center["address"]), street_key(h["address"])
    same_zip = bool(center["zip"]) and zip5(h["zip_code"]) == center["zip"]
    same_city = center["city"].lower() == str(h["citytown"]).lower()
    same_addr = bool(ck and hk and ck == hk and same_zip)
    sc = nj + 0.5 * same_zip + 0.5 * same_addr + 0.25 * same_city
    ok = (same_addr and ov >= 0.5) or (same_zip and ov >= 0.67 and nj >= 0.34) or (same_city and nj >= 0.6) or nj >= 0.85 or (alias is not None and (same_zip or same_city) and nj >= 0.5)
    return sc, ok


def build(centers, cms, today, overrides=None):
    overrides = overrides or {}
    by = {}
    for h in cms: by.setdefault(h["state"], []).append(h)
    states = {s: [] for s in STATES}
    kept = [c for c in centers if c["state"] in states and not overrides.get(c["name"], {}).get("closed")]
    cands = []
    for ci, c in enumerate(kept):
        alias = overrides.get(c["name"], {}).get("alias")
        for h in by.get(c["state"], []):
            if not phone(h["telephone_number"]): continue
            sc, ok = score_pair(c, h, alias)
            if ok: cands.append((sc, ci, h))
    cands.sort(key=lambda t: -t[0])
    assigned, used = {}, {}
    for ci, c in enumerate(kept):                 # hand-picked CMS record (see directory-overrides.json): used as is
        cid = overrides.get(c["name"], {}).get("cms_id")
        if cid:
            for h in by.get(c["state"], []):
                if h["facility_id"] == cid and phone(h["telephone_number"]):
                    assigned[ci] = (1.75, h); break
    for sc, ci, h in [t for t in cands if t[1] not in assigned]:   # best pairs first; one hospital record serves one center unless they share a street address
        if ci in assigned: continue
        owner = used.get(h["facility_id"])
        if owner is not None and street_key(kept[owner]["address"]) != street_key(kept[ci]["address"]): continue
        assigned[ci] = (sc, h); used.setdefault(h["facility_id"], ci)
    for ci, c in enumerate(kept):
        m = {}
        if ci in assigned:
            sc, h = assigned[ci]
            m = dict(phone=phone(h["telephone_number"]), cms_name=h["facility_name"], cms_id=h["facility_id"], confidence=round(min(sc / 1.75, 1.0), 2))
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
    al = [dict(code="A1", name="Children's of Alabama", address="1600 7th Ave S", city="Birmingham", state="AL", zip="35233", lat=1, lon=1, opo=""),
          dict(code="A2", name="University of Alabama Hospital", address="1802 6th Ave S", city="Birmingham", state="AL", zip="35233", lat=1, lon=1, opo="")]
    cm = [dict(facility_name="UNIVERSITY OF ALABAMA HOSPITAL", address="1802 6TH AVE SOUTH", citytown="BIRMINGHAM", state="AL", zip_code="35233", telephone_number="(205) 934-4011", facility_id="010033"),
          dict(facility_name="CHILDREN'S OF ALABAMA", address="1600 7TH AVE SOUTH", citytown="BIRMINGHAM", state="AL", zip_code="35233", telephone_number="(205) 638-9100", facility_id="013300")]
    r = build(al, cm, "2026-01-01")["AL"]
    assert {x["name"]: x["phone"] for x in r} == {"Children's of Alabama": "205-638-9100", "University of Alabama Hospital": "205-934-4011"}, r
    co = [dict(code="C1", name="University of Colorado Hospital/Health Science Center", address="1635 Aurora Ct", city="Aurora", state="CO", zip="80045", lat=1, lon=1, opo="")]
    cm2 = [dict(facility_name="CHILDREN'S HOSPITAL COLORADO", address="13123 E 16TH AVE", citytown="AURORA", state="CO", zip_code="80045", telephone_number="(720) 777-1234", facility_id="x1")]
    assert "phone" not in build(co, cm2, "2026-01-01")["CO"][0]   # a children's hospital is never an adult hospital's phone
    vaa = [dict(code="V1", name="University Hospital, University of New Mexico Health Sciences Center", address="2211 Lomas Blvd NE", city="Albuquerque", state="NM", zip="87106", lat=1, lon=1, opo="")]
    cm3 = [dict(facility_name="VA NEW MEXICO HEALTHCARE SYSTEM", address="1501 SAN PEDRO DR SE", citytown="ALBUQUERQUE", state="NM", zip_code="87108", telephone_number="(505) 265-1711", facility_id="x2")]
    assert "phone" not in build(vaa, cm3, "2026-01-01", {"University Hospital, University of New Mexico Health Sciences Center": {"alias": "University of New Mexico Hospital"}})["NM"][0]
    nyu = [dict(code="N1", name="New York University Medical Center", address="550 1st Ave", city="New York", state="NY", zip="10016", lat=1, lon=1, opo="")]
    cm4 = [dict(facility_name="NYU LANGONE HOSPITALS", address="550 FIRST AVENUE", citytown="NEW YORK", state="NY", zip_code="10016", telephone_number="(212) 263-7300", facility_id="330214"),
           dict(facility_name="BELLEVUE HOSPITAL CENTER", address="462 FIRST AVENUE", citytown="NEW YORK", state="NY", zip_code="10016", telephone_number="(212) 561-4132", facility_id="330204")]
    got = build(nyu, cm4, "2026-01-01", {"New York University Medical Center": {"cms_id": "330214"}})["NY"][0]
    assert got["phone"] == "212-263-7300" and got["cms_id"] == "330214", got
    assert "phone" not in build(nyu, cm4, "2026-01-01")["NY"][0]   # without the hand-picked id the names are too different to match
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
