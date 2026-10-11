#!/usr/bin/env python3
"""Announce new coldischemia.foundation content on X, LinkedIn, Facebook and Instagram.

  python3 _tools/social/social_publish.py --before <sha> --after <sha>   # dry run (default)
  python3 _tools/social/social_publish.py --before <sha> --after <sha> --live
  python3 _tools/social/social_publish.py --check                        # which platforms have credentials
  python3 _tools/social/social_publish.py --self-test

Only first-party content counts: new top-level .html pages and new files/*.pdf.
The third-party news feed (news/) is never posted. A platform is used only when
all its secrets are present. Dedupe state lives in _social/posted.json.
"""
import argparse, html, json, os, re, subprocess, sys, time, urllib.parse
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SITE = "https://coldischemia.foundation"
STATE = ROOT / "_social" / "posted.json"
CARDS = ROOT / "_social" / "cards"
CFG = json.loads((ROOT / "_social" / "config.json").read_text())
X_LIMIT, URL_LEN = 280, 23

PLATFORMS = {
    "x": ["X_API_KEY", "X_API_SECRET", "X_ACCESS_TOKEN", "X_ACCESS_SECRET"],
    "linkedin": ["LINKEDIN_ACCESS_TOKEN", "LINKEDIN_AUTHOR_URN"],
    "facebook": ["FACEBOOK_PAGE_ID", "FACEBOOK_PAGE_TOKEN"],
    "instagram": ["INSTAGRAM_USER_ID", "INSTAGRAM_TOKEN"],
}


def enabled():
    out = {}
    for p, keys in PLATFORMS.items():
        out[p] = all(os.environ.get(k) for k in keys) and p not in CFG.get("disabled", [])
    return out


# ---------- detect ----------
def added_files(before, after):
    if not before or set(before) == {"0"}:
        return []  # first push / unknown base: announce nothing
    r = subprocess.run(["git", "diff", "--name-only", "--diff-filter=A", before, after],
                       cwd=ROOT, capture_output=True, text=True, check=True)
    return [f for f in r.stdout.split() if is_announceable(f)]


def is_announceable(f):
    if f.endswith(".pdf") and f.startswith("files/"):
        return True
    return "/" not in f and f.endswith(".html") and f not in CFG["skip_pages"] \
        and not f.startswith(tuple(CFG["skip_prefixes"]))


def meta(text, name):
    for pat in (r'<meta[^>]+(?:property|name)=["\']%s["\'][^>]+content=["\']([^"\']*)' % re.escape(name),
                r'<meta[^>]+content=["\']([^"\']*)["\'][^>]+(?:property|name)=["\']%s["\']' % re.escape(name)):
        m = re.search(pat, text, re.I)
        if m:
            return html.unescape(m.group(1)).strip()
    return ""


def describe(f):
    url = f"{SITE}/{f}"
    if f.endswith(".pdf"):
        slug = Path(f).stem.replace("-", " ").title()
        return {"id": f, "url": url, "title": slug, "desc": "A new research paper from the Cold Ischemia Foundation.", "kind": "paper"}
    text = (ROOT / f).read_text(errors="ignore")
    t = meta(text, "og:title") or (re.search(r"<title>(.*?)</title>", text, re.S | re.I) or [0, ""])[1]
    d = meta(text, "og:description") or meta(text, "description")
    t = re.sub(r"\s+", " ", html.unescape(t)).strip()
    t = re.sub(r"\s*[|–—-]\s*Cold Ischemia Foundation\s*$", "", t, flags=re.I)
    return {"id": f, "url": url, "title": t or Path(f).stem, "desc": re.sub(r"\s+", " ", d), "kind": "page"}


# ---------- copy ----------
def clip(s, n):
    s = s.strip()
    return s if len(s) <= n else s[: n - 1].rsplit(" ", 1)[0].rstrip(",;:.") + "…"


def x_text(it):
    tags = " ".join(CFG["hashtags"][:2])
    lead = "New: " if it["kind"] == "page" else "New research paper: "
    fixed = len(lead) + 1 + URL_LEN + 1 + len(tags) + 2
    body = clip(it["title"] + (". " + it["desc"] if it["desc"] else ""), X_LIMIT - fixed)
    return f"{lead}{body}\n{it['url']}\n{tags}"


def x_len(t):  # X counts every URL as 23 chars
    return len(re.sub(r"https?://\S+", "x" * URL_LEN, t))


def li_escape(s):
    return re.sub(r"([\\|{}@\[\]()<>*_~])", r"\\\1", s)


def long_text(it):
    tags = " ".join(CFG["hashtags"])
    return f"{it['title']}\n\n{clip(it['desc'], 600)}\n\nRead it: {it['url']}\n\n{tags}".replace("\n\n\n", "\n\n")


# ---------- image card for Instagram ----------
def make_card(it):
    from PIL import Image, ImageDraw, ImageFont
    CARDS.mkdir(parents=True, exist_ok=True)
    out = CARDS / (re.sub(r"[^a-z0-9]+", "-", it["id"].lower()).strip("-") + ".jpg")
    im = Image.new("RGB", (1080, 1080), "#0b1f33")
    dr = ImageDraw.Draw(im)
    def font(sz, bold=False):
        for p in ("/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf" if bold else "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",):
            if os.path.exists(p):
                return ImageFont.truetype(p, sz)
        return ImageFont.load_default()
    dr.rectangle([0, 0, 1080, 14], fill="#c8102e")
    dr.text((80, 90), "COLD ISCHEMIA FOUNDATION", font=font(30), fill="#9fb6cc")
    y, f = 260, font(64, True)
    words, line = it["title"].split(), ""
    for w in words:
        if dr.textlength(line + " " + w, font=f) > 920 and line:
            dr.text((80, y), line, font=f, fill="white"); y += 84; line = w
        else:
            line = (line + " " + w).strip()
    dr.text((80, y), line, font=f, fill="white")
    dr.text((80, 960), "coldischemia.foundation", font=font(34), fill="#9fb6cc")
    im.save(out, quality=92)
    return out


def push_paths(paths, msg):
    if not os.environ.get("GITHUB_ACTIONS"):
        return
    run_git = lambda *a: subprocess.run(["git", *a], cwd=ROOT, check=True)
    run_git("config", "user.name", "cif-social-bot"); run_git("config", "user.email", "actions@users.noreply.github.com")
    run_git("add", *paths)
    if subprocess.run(["git", "diff", "--cached", "--quiet"], cwd=ROOT).returncode:
        run_git("commit", "-m", msg + " [skip ci]")
        for _ in range(3):
            if subprocess.run(["git", "pull", "--rebase", "-q", "origin", "main"], cwd=ROOT).returncode == 0 and \
               subprocess.run(["git", "push", "-q", "origin", "HEAD:main"], cwd=ROOT).returncode == 0:
                return
            time.sleep(5)
        raise RuntimeError("could not push " + msg)


def wait_live(url, tries=30):
    import requests
    for _ in range(tries):
        try:
            if requests.get(url, timeout=15).status_code == 200:
                return True
        except requests.RequestException:
            pass
        time.sleep(10)
    return False


# ---------- posting ----------
def post_x(it, env):
    from requests_oauthlib import OAuth1Session
    s = OAuth1Session(env["X_API_KEY"], env["X_API_SECRET"], env["X_ACCESS_TOKEN"], env["X_ACCESS_SECRET"])
    r = s.post("https://api.twitter.com/2/tweets", json={"text": x_text(it)}, timeout=30)
    r.raise_for_status(); return r.json()["data"]["id"]


def post_linkedin(it, env):
    import requests
    h = {"Authorization": "Bearer " + env["LINKEDIN_ACCESS_TOKEN"], "X-Restli-Protocol-Version": "2.0.0",
         "LinkedIn-Version": env.get("LINKEDIN_API_VERSION") or CFG["linkedin_version"], "Content-Type": "application/json"}
    body = {"author": env["LINKEDIN_AUTHOR_URN"], "commentary": li_escape(long_text(it)),
            "visibility": "PUBLIC", "lifecycleState": "PUBLISHED", "isReshareDisabledByAuthor": False,
            "distribution": {"feedDistribution": "MAIN_FEED", "targetEntities": [], "thirdPartyDistributionChannels": []},
            "content": {"article": {"source": it["url"], "title": clip(it["title"], 200), "description": clip(it["desc"], 250)}}}
    r = requests.post("https://api.linkedin.com/rest/posts", headers=h, json=body, timeout=30)
    r.raise_for_status(); return r.headers.get("x-restli-id", "ok")


def post_facebook(it, env):
    import requests
    r = requests.post(f"https://graph.facebook.com/{CFG['graph_version']}/{env['FACEBOOK_PAGE_ID']}/feed",
                      data={"message": long_text(it).replace("Read it: " + it["url"], "Read it:"), "link": it["url"],
                            "access_token": env["FACEBOOK_PAGE_TOKEN"]}, timeout=30)
    r.raise_for_status(); return r.json()["id"]


def post_instagram(it, env):
    import requests
    g = f"https://graph.facebook.com/{CFG['graph_version']}"
    card = make_card(it)
    push_paths([card.relative_to(ROOT).as_posix()], "Social card: " + it["id"])
    img = f"{SITE}/{card.relative_to(ROOT).as_posix()}"
    if not wait_live(img):
        raise RuntimeError("card image never went live: " + img)
    cap = clip(it["title"] + "\n\n" + it["desc"], 1800) + f"\n\nLink in bio: {SITE}\n\n" + " ".join(CFG["hashtags"])
    r = requests.post(f"{g}/{env['INSTAGRAM_USER_ID']}/media",
                      data={"image_url": img, "caption": cap, "access_token": env["INSTAGRAM_TOKEN"]}, timeout=30)
    r.raise_for_status(); cid = r.json()["id"]
    for _ in range(20):
        st = requests.get(f"{g}/{cid}", params={"fields": "status_code", "access_token": env["INSTAGRAM_TOKEN"]}, timeout=30).json()
        if st.get("status_code") == "FINISHED": break
        if st.get("status_code") == "ERROR": raise RuntimeError("Instagram container error")
        time.sleep(5)
    r = requests.post(f"{g}/{env['INSTAGRAM_USER_ID']}/media_publish",
                      data={"creation_id": cid, "access_token": env["INSTAGRAM_TOKEN"]}, timeout=30)
    r.raise_for_status(); return r.json()["id"]


POSTERS = {"x": post_x, "linkedin": post_linkedin, "facebook": post_facebook, "instagram": post_instagram}


def load_state():
    return json.loads(STATE.read_text()) if STATE.exists() else {}


def run(items, live):
    state, on, env, failures = load_state(), enabled(), os.environ, 0
    if not live and not any(on.values()):
        on = {k: True for k in on}  # preview every platform when no credentials are set
    items = [i for i in items if not all(p in state.get(i["id"], {}) for p in on if on[p])][: CFG["max_per_run"]]
    if not items:
        print("Nothing new to announce."); return 0
    if live and any(on.values()):
        wait_live(items[0]["url"])  # site must be deployed before links are shared
    for it in items:
        print(f"\n== {it['id']}: {it['title']}")
        for p, ok in on.items():
            if not ok or p in state.get(it["id"], {}):
                continue
            if not live:
                print(f"[dry-run:{p}]\n{x_text(it) if p == 'x' else long_text(it)}\n"); continue
            for attempt in range(3):
                try:
                    state.setdefault(it["id"], {})[p] = {"post": POSTERS[p](it, env), "at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())}
                    print(f"posted on {p}"); break
                except Exception as e:  # keep going; one platform must not block the others
                    print(f"{p} attempt {attempt+1} failed: {type(e).__name__}: {str(e)[:200]}")
                    time.sleep(5 * (attempt + 1))
            else:
                failures += 1
        if live:
            STATE.write_text(json.dumps(state, indent=1, sort_keys=True))
    return 1 if failures else 0


def self_test():
    it = {"id": "x.html", "url": SITE + "/x.html", "title": "A" * 300, "desc": "B" * 300, "kind": "page"}
    assert x_len(x_text(it)) <= X_LIMIT, x_len(x_text(it))
    assert li_escape("a (b) *c* _d_ #t") == r"a \(b\) \*c\* \_d\_ #t"
    assert is_announceable("files/new.pdf") and is_announceable("new-page.html")
    assert not is_announceable("404.html") and not is_announceable("news/feed.json") and not is_announceable("sub/p.html")
    assert added_files("", "HEAD") == [] and added_files("0" * 40, "HEAD") == []
    assert clip("short", 10) == "short" and len(clip("word " * 50, 40)) <= 40
    print("self-test OK")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--before"); ap.add_argument("--after", default="HEAD")
    ap.add_argument("--live", action="store_true"); ap.add_argument("--check", action="store_true")
    ap.add_argument("--self-test", action="store_true"); ap.add_argument("--only", nargs="*", help="announce these files regardless of git")
    a = ap.parse_args()
    if a.self_test: return self_test()
    if a.check:
        for p, ok in enabled().items():
            print(f"{p:10} {'READY' if ok else 'missing: ' + ', '.join(k for k in PLATFORMS[p] if not os.environ.get(k))}")
        return
    files = a.only if a.only else added_files(a.before, a.after)
    sys.exit(run([describe(f) for f in files], a.live))


if __name__ == "__main__":
    main()
