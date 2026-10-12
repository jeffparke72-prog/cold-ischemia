#!/usr/bin/env python3
"""For every kidney transplant center that has no phone yet, list the closest hospital records in CMS (same ZIP, same city,
and best name matches in the state) so a person can pick the right one and record its CMS id in _tools/directory-overrides.json.
Output: _tools/missing-candidates.txt"""
import importlib.util, json, re, sys
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location("b", ROOT / "_tools" / "build-state-directory.py"); b = importlib.util.module_from_spec(spec); spec.loader.exec_module(b)
ov = json.loads((ROOT / "_tools" / "directory-overrides.json").read_text())
kc = json.loads((ROOT / "kidney-centers.json").read_text())
cms = b.fetch_cms(); by = {}
for h in cms: by.setdefault(h["state"], []).append(h)
out = []
for st, v in sorted(kc["states"].items()):
    for c in v:
        if c.get("phone"): continue
        alias = ov.get(c["name"], {}).get("alias")
        out.append(f"\n### {st} | {c['name']} | {c['address']}, {c['city']} {c['zip']}" + (f" | alias: {alias}" if alias else ""))
        rows = []
        for h in by.get(st, []):
            nj = max(b.jac(n, h["facility_name"]) for n in [c["name"]] + ([alias] if alias else []))
            z = b.zip5(h["zip_code"]) == c["zip"]; city = c["city"].lower() == str(h["citytown"]).lower()
            rows.append((nj + (0.6 if z else 0) + (0.3 if city else 0), h, z, city))
        for sc, h, z, city in sorted(rows, key=lambda r: -r[0])[:6]:
            out.append(f"   {sc:.2f} {'ZIP ' if z else '    '}{'CITY' if city else '    '} id={h['facility_id']} | {h['facility_name']} | {h['address']}, {h['citytown']} {h['zip_code']} | {h['telephone_number']} | {h.get('hospital_type','')}")
(ROOT / "_tools" / "missing-candidates.txt").write_text("\n".join(out)); print("\n".join(out)[:2000])
