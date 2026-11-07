#!/usr/bin/env node
/* Cold Ischemia Foundation: builds the site-wide release feed.
 *
 *   node _tools/build-site-feed.js            writes feed.xml, feed.json and cif-week.ics at the site root
 *   node _tools/build-site-feed.js --now 2026-11-12T15:00:00Z   pretend it is that moment (for testing)
 *
 * Sources (nothing is typed twice; each series keeps its own data):
 *   The Watch List ........ watch-list/manifest.json + watch-list/week-*.json   (Mondays 9:00 AM ET)
 *   The Gatekeeper Files .. the card array inside gatekeeper-files.html          (Thursdays 9:00 AM ET, 52 weeks)
 *   The Inside Files ...... serial/installments.json                             (Sundays)
 *   BHOC Field Notes ...... the POSTS array inside field-notes.html
 *   Research Digest ....... research-digest-feed.json
 *
 * Only items whose release moment has passed are published. Run on every push and every hour by
 * .github/workflows/build-site-feed.yml, so a release appears in the feed within the hour it opens.
 * No dependencies, no accounts, no keys.
 */
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const SITE = 'https://coldischemia.foundation';
const TZ = 'America/New_York';
const MAX_ITEMS = 120;
const argNow = process.argv.indexOf('--now');
const NOW = argNow > 0 ? new Date(process.argv[argNow + 1]) : new Date();

const SERIES = {
  watch:  { name: 'The Watch List',       page: 'watch-list.html',       day: 'Monday',   time: '9:00 AM ET' },
  gate:   { name: 'The Gatekeeper Files', page: 'gatekeeper-files.html', day: 'Thursday', time: '9:00 AM ET' },
  inside: { name: 'The Inside Files',     page: 'inside-files.html',     day: 'Sunday',   time: 'morning' },
  notes:  { name: 'BHOC Field Notes',     page: 'field-notes.html' },
  digest: { name: 'Research Digest',      page: 'research-digest.html' },
};

/* ---------- time helpers (wall-clock time in New York, correct across daylight saving) ---------- */
const fmtParts = new Intl.DateTimeFormat('en-US', { timeZone: TZ, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' });
function partsET(d) { const o = {}; fmtParts.formatToParts(d).forEach(p => { o[p.type] = +p.value; }); return o; }
function et(y, mo, d, h = 9, mi = 0) {
  const want = Date.UTC(y, mo - 1, d, h, mi);
  let t = want + 5 * 3600e3;
  for (let i = 0; i < 3; i++) { const p = partsET(new Date(t)); t += want - Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute); }
  return new Date(t);
}
function nextWeekdayET(after, weekday /*0=Sun*/, h = 9) {
  const p = partsET(after);
  for (let k = 0; k < 9; k++) {
    const c = et(p.year, p.month, p.day + k, h);
    const dow = new Date(Date.UTC(p.year, p.month - 1, p.day + k)).getUTCDay();
    if (dow === weekday && c > after) return c;
  }
  return null;
}
const rfc822 = d => d.toUTCString().replace('GMT', '+0000');
const iso = d => d.toISOString().replace('.000Z', 'Z');

/* ---------- small utilities ---------- */
const read = p => fs.readFileSync(path.join(ROOT, p), 'utf8');
const exists = p => fs.existsSync(path.join(ROOT, p));
const xml = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
const clean = s => String(s == null ? '' : s).replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
const warn = m => console.warn('  note: ' + m);
function jsArray(src, name) {
  const m = new RegExp('const\\s+' + name + '\\s*=\\s*\\[').exec(src);
  if (!m) return null;
  let i = m.index + m[0].length - 1, depth = 0, str = null, esc = false;
  for (let j = i; j < src.length; j++) {
    const c = src[j];
    if (str) { if (esc) esc = false; else if (c === '\\') esc = true; else if (c === str) str = null; continue; }
    if (c === '"' || c === "'" || c === '`') { str = c; continue; }
    if (c === '[') depth++;
    else if (c === ']' && --depth === 0) return vm.runInNewContext('(' + src.slice(i, j + 1) + ')', {}, { timeout: 1000 });
  }
  return null;
}

const items = [];
const status = {};
function add(it) { if (it.date <= NOW) items.push(it); }

/* ---------- The Watch List ---------- */
(function () {
  const S = SERIES.watch;
  let man = { weeks: [] };
  try { man = JSON.parse(read('watch-list/manifest.json')); } catch (e) { warn('Watch List manifest unreadable: ' + e.message); }
  const weeks = (man.weeks || []).slice().sort((a, b) => new Date(a.release) - new Date(b.release));
  const released = weeks.filter(w => new Date(w.release) <= NOW);
  released.forEach((w, i) => {
    let title = `Edition No. ${i + 1}`, summary = 'Fifty companies scored on the public record of complaints, enforcement actions, lawsuits and recalls.';
    try {
      const d = JSON.parse(read('watch-list/' + w.file));
      const cs = (d.companies || []).slice().sort((a, b) => (b.cci || 0) - (a.cci || 0));
      const all = [].concat(...(d.companies || []).map(c => c.items || []));
      const nw = all.filter(x => x.is_new).length;
      if (cs[0]) title += `: ${cs[0].name} leads the ledger`;
      summary = `This edition logs ${all.length} documented items, ${nw} of them new this week.` +
        (cs.length >= 3 ? ` The top three: ${cs[0].name}, ${cs[1].name} and ${cs[2].name}.` : '') +
        ' Every item links to its public source.';
    } catch (e) { warn('Watch List week file missing: ' + w.file); }
    add({ id: 'watch-list-' + w.id, series: 'watch', title: `${S.name} · ${title}`, short: title, summary, url: `${SITE}/${S.page}#edition=${w.id}`, date: new Date(w.release) });
  });
  const future = weeks.find(w => new Date(w.release) > NOW);
  const nx = future ? new Date(future.release) : (man.next_release && new Date(man.next_release) > NOW ? new Date(man.next_release) : nextWeekdayET(NOW, 1));
  status.watch = { next: { date: iso(nx), label: `Edition No. ${released.length + 1}` }, count: released.length, state: 'scheduled' };
})();

/* ---------- The Gatekeeper Files ---------- */
(function () {
  const S = SERIES.gate;
  let cards = null;
  try { cards = jsArray(read(S.page), 'C'); } catch (e) { warn('Gatekeeper cards unreadable: ' + e.message); }
  if (!cards) { warn('Gatekeeper card array not found'); cards = []; }
  const total = cards.length || 52;
  const open = n => et(2026, 11, 5 + 7 * (n - 1), 9);
  let opened = 0;
  cards.forEach((c, i) => {
    const n = i + 1, d = open(n);
    if (d > NOW) return;
    opened = n;
    add({ id: 'gatekeeper-week-' + n, series: 'gate', title: `${S.name} · Week ${n}: ${clean(c.g)}`, short: `Week ${n}: ${clean(c.g)}`,
      summary: clean(c.p) + ' Flip the card for the hidden rule behind it and the fix.', url: `${SITE}/${S.page}#week-${n}`, date: d });
  });
  status.gate = opened < total
    ? { next: { date: iso(open(opened + 1)), label: `Week ${opened + 1} of ${total}` }, count: opened, total, state: 'scheduled' }
    : { next: null, count: opened, total, state: 'complete' };
})();

/* ---------- The Inside Files ---------- */
(function () {
  const S = SERIES.inside;
  let d = { installments: [] };
  try { d = JSON.parse(read('serial/installments.json')); } catch (e) { warn('Inside Files data unreadable: ' + e.message); }
  const pub = (d.installments || []).filter(x => x.status === 'published' && x.publish);
  const releaseOf = s => { const [y, m, dd] = s.split('-').map(Number); return new Date(Date.UTC(y, m - 1, dd, 12, 0)); };
  let last = null;
  pub.forEach(x => {
    const date = releaseOf(x.publish);
    if (date > NOW) return;
    last = x;
    add({ id: 'inside-files-' + x.n, series: 'inside', title: `${S.name} · Installment ${x.n}: ${clean(x.title)}`, short: `Installment ${x.n}: ${clean(x.title)}`,
      summary: clean(x.dek), url: `${SITE}/${S.page}#i${x.n}/read`, date });
  });
  const planned = (d.series && d.series.planned) || 12;
  const nx = last && last.next;
  if (nx && nx.date) {
    const nd = releaseOf(nx.date), already = pub.some(x => x.n === nx.n && releaseOf(x.publish) <= NOW);
    status.inside = already ? { next: null, count: pub.length, total: planned, state: 'scheduled' }
      : nd > NOW ? { next: { date: iso(nd), label: `Installment ${nx.n}`, teaser: clean(nx.teaser) }, count: last.n, total: planned, state: 'scheduled' }
      : { next: { date: null, label: `Installment ${nx.n}`, teaser: clean(nx.teaser) }, count: last.n, total: planned, state: 'in-verification' };
  } else status.inside = { next: null, count: last ? last.n : 0, total: planned, state: last && last.n >= planned ? 'complete' : 'in-verification' };
})();

/* ---------- BHOC Field Notes ---------- */
(function () {
  const S = SERIES.notes;
  let posts = null;
  try { posts = jsArray(read(S.page), 'POSTS'); } catch (e) { warn('Field Notes list unreadable: ' + e.message); }
  const MON = { Jan: 1, Feb: 2, Mar: 3, Apr: 4, May: 5, Jun: 6, Jul: 7, Aug: 8, Sep: 9, Oct: 10, Nov: 11, Dec: 12 };
  (posts || []).forEach(p => {
    const m = /^(\d{1,2})\s+([A-Za-z]{3})\w*\s+(\d{4})$/.exec(String(p.date || '').trim());
    if (!m || !exists(`field-note-${p.n}.html`)) return;
    add({ id: 'field-note-' + p.n, series: 'notes', title: `${S.name} · No. ${p.n}: ${clean(p.title)}`, short: `No. ${p.n}: ${clean(p.title)}`,
      summary: clean(p.dek), url: `${SITE}/field-note-${p.n}.html`, date: et(+m[3], MON[m[2]], +m[1], 9) });
  });
})();

/* ---------- Research Digest ---------- */
(function () {
  const S = SERIES.digest;
  let d = { issues: [] };
  try { d = JSON.parse(read('research-digest-feed.json')); } catch (e) { warn('Research Digest list unreadable: ' + e.message); }
  const MONTHS = ['january','february','march','april','may','june','july','august','september','october','november','december'];
  (d.issues || []).filter(x => x.published).forEach(x => {
    let date = x.date ? new Date(x.date) : null;
    if (!date) { const m = /(january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{4})/i.exec(x.deck || ''); if (m) date = et(+m[2], MONTHS.indexOf(m[1].toLowerCase()) + 1, 1, 9); }
    if (!date || isNaN(date)) return;
    const n = String(x.n).padStart(3, '0');
    add({ id: 'research-digest-' + n, series: 'digest', title: `${S.name} · Issue ${n}: ${clean(x.title)}`, short: `Issue ${n}: ${clean(x.title)}`,
      summary: clean(x.deck), url: x.url || `${SITE}/${S.page}`, date });
  });
})();

/* ---------- write feed.xml (RSS 2.0) ---------- */
items.sort((a, b) => b.date - a.date || a.id.localeCompare(b.id));
const out = items.slice(0, MAX_ITEMS);
const built = out.length ? out[0].date : NOW;
const rss = ['<?xml version="1.0" encoding="UTF-8"?>',
  '<?xml-stylesheet type="text/xsl" href="feed.xsl"?>',
  '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">',
  '<channel>',
  '<title>Cold Ischemia Foundation · This Week</title>',
  `<link>${SITE}/this-week.html</link>`,
  `<atom:link href="${SITE}/feed.xml" rel="self" type="application/rss+xml"/>`,
  '<description>Every release from the Cold Ischemia Foundation, the moment it opens: The Watch List (Mondays), The Gatekeeper Files (Thursdays), The Inside Files (Sundays), BHOC Field Notes and the Research Digest.</description>',
  '<language>en-us</language>',
  `<lastBuildDate>${rfc822(built)}</lastBuildDate>`,
  '<ttl>60</ttl>',
  `<image><url>${SITE}/cold-ischemia-logo.png</url><title>Cold Ischemia Foundation · This Week</title><link>${SITE}/this-week.html</link></image>`];
out.forEach(it => {
  rss.push('<item>',
    `<title>${xml(it.title)}</title>`,
    `<link>${xml(it.url)}</link>`,
    `<guid isPermaLink="false">${xml(it.id)}</guid>`,
    `<pubDate>${rfc822(it.date)}</pubDate>`,
    `<category>${xml(SERIES[it.series].name)}</category>`,
    `<description>${xml(it.summary)}</description>`,
    `<content:encoded>${xml(`<p>${xml(it.summary)}</p><p><a href="${xml(it.url)}">Read it on coldischemia.foundation</a></p>`)}</content:encoded>`,
    '</item>');
});
rss.push('</channel>', '</rss>');

/* ---------- write feed.json (read by the calendar on the site) ---------- */
const json = {
  version: 1, updated: iso(built), feed_url: `${SITE}/feed.xml`, calendar_url: `${SITE}/cif-week.ics`,
  series: Object.fromEntries(Object.entries(SERIES).map(([k, s]) => [k, Object.assign({ name: s.name, url: `${SITE}/${s.page}`, day: s.day || null, time: s.time || null }, status[k] || {})])),
  items: out.map(it => ({ id: it.id, series: it.series, title: it.short, summary: it.summary, url: it.url, date: iso(it.date) })),
};

/* ---------- write cif-week.ics (calendar subscription with release-time reminders) ---------- */
const icsDate = d => iso(d).replace(/[-:]/g, '');
const fold = l => { const o = []; while (Buffer.byteLength(l) > 74) { let k = 74; while (Buffer.byteLength(l.slice(0, k)) > 74) k--; o.push(l.slice(0, k)); l = ' ' + l.slice(k); } o.push(l); return o.join('\r\n'); };
const ice = s => String(s).replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
const ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Cold Ischemia Foundation//This Week//EN', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH',
  'X-WR-CALNAME:Cold Ischemia Foundation · Releases', 'X-WR-TIMEZONE:America/New_York',
  'X-WR-CALDESC:Release times for The Watch List\\, The Gatekeeper Files and The Inside Files.',
  'REFRESH-INTERVAL;VALUE=DURATION:PT6H', 'X-PUBLISHED-TTL:PT6H',
  'BEGIN:VTIMEZONE', 'TZID:America/New_York',
  'BEGIN:DAYLIGHT', 'TZOFFSETFROM:-0500', 'TZOFFSETTO:-0400', 'TZNAME:EDT', 'DTSTART:19700308T020000', 'RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=2SU', 'END:DAYLIGHT',
  'BEGIN:STANDARD', 'TZOFFSETFROM:-0400', 'TZOFFSETTO:-0500', 'TZNAME:EST', 'DTSTART:19701101T020000', 'RRULE:FREQ=YEARLY;BYMONTH=11;BYDAY=1SU', 'END:STANDARD',
  'END:VTIMEZONE'];
function vevent(uid, start, mins, summary, desc, url, rrule) {
  const p = partsET(start), pad = n => String(n).padStart(2, '0');
  const local = `${p.year}${pad(p.month)}${pad(p.day)}T${pad(p.hour)}${pad(p.minute)}00`;
  const end = partsET(new Date(start.getTime() + mins * 60e3));
  const localEnd = `${end.year}${pad(end.month)}${pad(end.day)}T${pad(end.hour)}${pad(end.minute)}00`;
  ics.push('BEGIN:VEVENT', `UID:${uid}@coldischemia.foundation`, `DTSTAMP:${icsDate(new Date(Date.UTC(2026, 10, 7)))}`,
    `DTSTART;TZID=America/New_York:${local}`, `DTEND;TZID=America/New_York:${localEnd}`);
  if (rrule) ics.push('RRULE:' + rrule);
  ics.push(fold('SUMMARY:' + ice(summary)), fold('DESCRIPTION:' + ice(desc + '\n' + url)), fold('URL:' + url), 'TRANSP:TRANSPARENT',
    'BEGIN:VALARM', 'ACTION:DISPLAY', fold('DESCRIPTION:' + ice(summary + ' is out now')), 'TRIGGER:PT0M', 'END:VALARM', 'END:VEVENT');
}
vevent('watch-list-weekly', et(2026, 11, 9, 9), 30, 'The Watch List: new edition', 'A new edition of the weekly public accountability ledger of 50 companies opens now.', `${SITE}/watch-list.html`, 'FREQ=WEEKLY;BYDAY=MO');
vevent('gatekeeper-files-weekly', et(2026, 11, 5, 9), 30, 'The Gatekeeper Files: new week', 'A new kidney care problem, the hidden rule behind it, and the fix.', `${SITE}/gatekeeper-files.html`, `FREQ=WEEKLY;BYDAY=TH;COUNT=${status.gate.total || 52}`);
if (status.inside && status.inside.next && status.inside.next.date) {
  const d = new Date(status.inside.next.date);
  vevent('inside-files-' + status.inside.next.label.replace(/\D/g, ''), d, 30, `The Inside Files: ${status.inside.next.label}`, status.inside.next.teaser || 'A new installment of the serial investigation.', `${SITE}/inside-files.html`);
}
ics.push('END:VCALENDAR');

fs.writeFileSync(path.join(ROOT, 'feed.xml'), rss.join('\n') + '\n');
fs.writeFileSync(path.join(ROOT, 'feed.json'), JSON.stringify(json, null, 1) + '\n');
fs.writeFileSync(path.join(ROOT, 'cif-week.ics'), ics.join('\r\n') + '\r\n');
const by = {}; out.forEach(i => { by[i.series] = (by[i.series] || 0) + 1; });
console.log(`feed built at ${iso(NOW)}: ${out.length} items`, by);
console.log('next:', Object.fromEntries(Object.entries(status).map(([k, v]) => [k, v.next ? (v.next.date || v.state) : v.state])));
