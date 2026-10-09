/**
 * CIF Inbox Concierge  (Google Apps Script, runs inside the Foundation's Gmail account)
 *
 * 1. Every 10 minutes it looks at new inbox mail, and replies once to genuine inquiries
 *    (volunteering, mission, services, media, patient/care-partner questions, donation offers).
 * 2. Every reply invites the sender to subscribe to the Research Digest with one click.
 * 3. Senders go into the Google Contacts group "CIF Inquiries". People who click Subscribe
 *    (or confirm on the website form) go into the group "CIF Digest Subscribers".
 * 4. Optional: sendIssue() emails a digest to subscribers, each with their own unsubscribe link.
 *
 * Setup: see the instructions that came with this file. Start with DRY_RUN = true.
 */
var CFG = {
  DRY_RUN: true,                          // true = save replies as Gmail drafts; false = send them
  ORG: 'Cold Ischemia Foundation',
  SIGNOFF: 'The Cold Ischemia Foundation team',
  SITE: 'https://coldischemia.foundation',
  POSTAL: 'Cold Ischemia Foundation, Ellenton, Florida',   // put your full mailing address or PO box here
  WEBAPP_URL: '',                         // optional; paste the deployed web app URL if links ever come out wrong
  GROUP_INQUIRY: 'CIF Inquiries',
  GROUP_SUBS: 'CIF Digest Subscribers',
  LABEL_DONE: 'CIF/Auto-replied',
  LABEL_HUMAN: 'CIF/Needs-human',
  MAX_PER_RUN: 15,
  COOLDOWN_DAYS: 7,
  DAILY_CONFIRM_LIMIT: 150
};

/* ---------- pure helpers (testable) ---------- */
function parseFrom(from) {
  var m = String(from || '').match(/^\s*"?([^"<]*?)"?\s*<([^>]+)>\s*$/);
  var email = (m ? m[2] : String(from || '')).trim().toLowerCase();
  var name = m ? m[1].trim() : '';
  return { email: email, name: name, first: (name.split(/\s+/)[0] || '').replace(/[^A-Za-zÀ-ɏ'-]/g, '') };
}
function isAutomated(email, headers) {
  if (/(^|[._-])(no-?reply|donotreply|do-not-reply|mailer-daemon|postmaster|bounce|notifications?|newsletter|alerts?)([._-]|@)/i.test(email)) return true;
  var auto = (headers.autoSubmitted || '').toLowerCase();
  if (auto && auto !== 'no') return true;
  if (headers.listUnsubscribe || headers.listId) return true;
  if (/bulk|list|junk|auto_reply/i.test(headers.precedence || '')) return true;
  return false;
}
function classify(subject, body) {
  var t = (subject + ' ' + body).toLowerCase();
  if (/(suicid|kill myself|end my life|want to die|overdos|can'?t breathe|chest pain|severe bleeding|911)/.test(t)) return 'crisis';
  if (/(donat(e|ion)|sponsor|grant|make a gift|contribute (money|funds)|send (you )?money|fundrais)/.test(t)) return 'donate';
  if (/(volunteer|get involved|join (the |your )?(team|mission|cause|effort)|intern(ship)?|how (can|do) i help|want to help)/.test(t)) return 'volunteer';
  if (/(your services|consult|hire (you|us)|quote|pricing|price list|how much (do|does|would)|appeal letter|insurance denial|work with you)/.test(t)) return 'services';
  if (/(journalist|reporter|interview|press (inquiry|request)|media (inquiry|request)|podcast|news (story|outlet)|on the record)/.test(t)) return 'media';
  if (/(mission|about (you|your|the foundation)|who (are|is) (you|behind)|what do you do|independent|who funds|funded by|your story)/.test(t)) return 'mission';
  if (/(dialysis|transplant|kidney|living donor|caregiver|care partner|my (mom|dad|mother|father|wife|husband|son|daughter|brother|sister))/.test(t)) return 'patient';
  return 'general';
}

/* ---------- reply content ---------- */
function links() {
  var s = CFG.SITE;
  return {
    volunteer: s + '/cif-volunteer-page.html', training: s + '/volunteer-training.html', about: s + '/about.html',
    independence: s + '/independence.html', services: s + '/services.html', guide: s + '/donor-flow.html',
    digest: s + '/research-digest.html', contact: s + '/contact.html'
  };
}
function bodyFor(cat, first) {
  var L = links(), hi = first ? 'Hello ' + first + ',' : 'Hello,';
  var thanks = 'Thank you for writing to the ' + CFG.ORG + '. This is an automatic first reply so you are never left waiting; a person reads every message.';
  var parts = {
    volunteer: 'We are glad you want to help. Volunteers are how this work grows. Start here: ' + L.volunteer + ' (the volunteer page), then ' + L.training + ' (free volunteer training). Tell us your skills and how many hours you can give, and we will match you to a real task.',
    mission: 'In one line: we are a patient-led, independent advocacy organization for kidney patients, living donors and care partners. We take no donations, and no funding from drug, biologic, device or pharmaceutical companies, dialysis organizations, insurers, hospital systems, or advocacy groups funded by them. Our story: ' + L.about + '. What independence means, with sources: ' + L.independence + '.',
    services: 'Most of what we offer is free, and where it takes real work the rates are small and scaled to your local cost of living. See everything we offer, and the posted rates, here: ' + L.services + '. Reply with what you need and your deadline, and we will tell you what is free and what, if anything, would cost.',
    media: 'Thank you for your interest. Please reply with your outlet, your deadline and your questions, and a person will respond. Our sourcing standards and independence statement are at ' + L.independence + '.',
    donate: 'Thank you for wanting to support us. To protect our independence we do not accept donations, grants or sponsorships. If you want to help, the best ways are to volunteer (' + L.volunteer + '), to share our free research essays, and to tell us what is not working in kidney care where you live.',
    patient: 'We are sorry you are dealing with this. A good place to start is our free donor and patient resources: ' + L.guide + '. We are not medical experts: for medical advice, talk to your healthcare team, and in an emergency call 911. Reply with a little more about your situation and we will point you to the right tool or guide.',
    general: 'Please reply with a little more about what you are looking for, and a person will get back to you. You can also browse ' + L.about + ' and ' + L.services + '.'
  };
  return { greeting: hi, thanks: thanks, main: parts[cat] || parts.general };
}
function crisisBody(first) {
  return (first ? 'Hello ' + first + ',' : 'Hello,') + '\n\nThank you for reaching out. If you or someone else is in immediate danger or having a medical emergency, please call 911 now. If you are thinking about harming yourself, you can call or text 988 (the Suicide & Crisis Lifeline) at any hour, anywhere in the United States.\n\nWe are not medical experts, and this is an automatic message. A person from our team will read your note and follow up as soon as we can.\n\n' + CFG.SIGNOFF;
}
function subscribeBlock(email) {
  var url = signedLink('sub', email);
  return {
    text: '\n\nOne more thing, if you would like it: every few days we publish a short, sourced research essay on kidney, transplant and living-donor research that mainstream news rarely covers, with who funded each study and what it does not show. Subscribe with one click: ' + url + '\nYou can unsubscribe at any time. More: ' + links().digest,
    html: '<p style="margin:18px 0 6px">One more thing, if you would like it: every few days we publish a short, sourced research essay on kidney, transplant and living-donor research that mainstream news rarely covers, with who funded each study and what it does not show.</p><p><a href="' + url + '" style="background:#c8902a;color:#0a1628;padding:11px 18px;text-decoration:none;border-radius:4px;font-weight:bold;display:inline-block">Subscribe with one click</a></p><p style="font-size:13px;color:#666">You can unsubscribe at any time. <a href="' + links().digest + '">Read the digest</a></p>'
  };
}
function buildReply(cat, from) {
  if (cat === 'crisis') { var c = crisisBody(from.first); return { text: c, html: c.replace(/\n/g, '<br>') }; }
  var b = bodyFor(cat, from.first), sub = subscribeBlock(from.email);
  var foot = '\n\n' + CFG.SIGNOFF + '\n' + CFG.SITE;
  var text = b.greeting + '\n\n' + b.thanks + '\n\n' + b.main + sub.text + foot;
  var esc = function (s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/(https?:\/\/[^\s)]+)/g, '<a href="$1">$1</a>').replace(/\n/g, '<br>'); };
  var html = '<div style="font-family:Georgia,serif;font-size:16px;line-height:1.55;color:#1d1a16;max-width:620px"><p>' + esc(b.greeting) + '</p><p>' + esc(b.thanks) + '</p><p>' + esc(b.main) + '</p>' + sub.html + '<p style="margin-top:22px">' + esc(CFG.SIGNOFF) + '<br><a href="' + CFG.SITE + '">' + CFG.SITE.replace('https://', '') + '</a></p></div>';
  return { text: text, html: html };
}

/* ---------- signed links (one-click subscribe / unsubscribe) ---------- */
function secret_() {
  var p = PropertiesService.getScriptProperties(), s = p.getProperty('LINK_SECRET');
  if (!s) { s = Utilities.getUuid() + Utilities.getUuid(); p.setProperty('LINK_SECRET', s); }
  return s;
}
function sign_(action, email) {
  var raw = Utilities.computeHmacSha256Signature(action + '|' + email, secret_());
  return Utilities.base64EncodeWebSafe(raw).slice(0, 22);
}
function baseUrl_() { return CFG.WEBAPP_URL || ScriptApp.getService().getUrl(); }
function signedLink(action, email) {
  return baseUrl_() + '?a=' + action + '&e=' + encodeURIComponent(email) + '&t=' + sign_(action, email);
}

/* ---------- Gmail processing ---------- */
function processInbox() {
  var me = Session.getActiveUser().getEmail().toLowerCase();
  var aliases = GmailApp.getAliases().map(function (a) { return a.toLowerCase(); }).concat([me]);
  var done = label_(CFG.LABEL_DONE), human = label_(CFG.LABEL_HUMAN);
  var q = 'in:inbox is:unread -label:CIF-Auto-replied newer_than:2d -category:promotions -category:social -category:updates -category:forums';
  var threads = GmailApp.search(q, 0, CFG.MAX_PER_RUN);
  threads.forEach(function (th) {
    try {
      var msgs = th.getMessages(), last = msgs[msgs.length - 1], from = parseFrom(last.getFrom());
      if (aliases.indexOf(from.email) >= 0) return;
      if (th.getLabels().some(function (l) { return l.getName() === CFG.LABEL_DONE; })) return;
      var headers = { autoSubmitted: last.getHeader('Auto-Submitted'), listUnsubscribe: last.getHeader('List-Unsubscribe'), listId: last.getHeader('List-Id'), precedence: last.getHeader('Precedence') };
      if (isAutomated(from.email, headers)) return;
      if (GmailApp.search('in:sent to:' + from.email + ' newer_than:' + CFG.COOLDOWN_DAYS + 'd', 0, 1).length) return;
      var cat = classify(last.getSubject() || '', (last.getPlainBody() || '').slice(0, 3000));
      var r = buildReply(cat, from);
      if (CFG.DRY_RUN) th.createDraftReply(r.text, { htmlBody: r.html, name: CFG.ORG });
      else th.reply(r.text, { htmlBody: r.html, name: CFG.ORG });
      done.addToThread(th);
      if (cat === 'crisis' || cat === 'media') { human.addToThread(th); th.getMessages()[0].star(); }
      addToGroup_(from.email, from.name, CFG.GROUP_INQUIRY);
    } catch (e) { console.error('processInbox: ' + e); }
  });
}
function label_(name) { return GmailApp.getUserLabelByName(name) || GmailApp.createLabel(name); }

/* ---------- Google Contacts (People API advanced service) ---------- */
function groupResource_(name) {
  var p = PropertiesService.getScriptProperties(), key = 'g:' + name, rn = p.getProperty(key);
  if (rn) return rn;
  var list = People.ContactGroups.list({ pageSize: 200 }).contactGroups || [];
  for (var i = 0; i < list.length; i++) if (list[i].name === name) { rn = list[i].resourceName; break; }
  if (!rn) rn = People.ContactGroups.create({ contactGroup: { name: name } }).resourceName;
  p.setProperty(key, rn);
  return rn;
}
function addToGroup_(email, name, groupName) {
  var p = PropertiesService.getScriptProperties(), g = groupResource_(groupName), ckey = 'c:' + email, rn = p.getProperty(ckey);
  if (!rn) {
    People.People.searchContacts({ query: '', readMask: 'emailAddresses' });
    var found = (People.People.searchContacts({ query: email, readMask: 'emailAddresses' }).results || [])[0];
    if (found) rn = found.person.resourceName;
  }
  if (!rn) {
    var person = { emailAddresses: [{ value: email }] };
    if (name) person.names = [{ givenName: name }];
    rn = People.People.createContact(person).resourceName;
  }
  p.setProperty(ckey, rn);
  People.ContactGroups.Members.modify({ resourceNamesToAdd: [rn] }, g);
}
function removeFromGroup_(email, groupName) {
  var rn = PropertiesService.getScriptProperties().getProperty('c:' + email);
  if (rn) People.ContactGroups.Members.modify({ resourceNamesToRemove: [rn] }, groupResource_(groupName));
}

/* ---------- web app: one-click links and the website form ---------- */
function page_(title, msg) {
  return HtmlService.createHtmlOutput('<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1"><body style="font-family:Georgia,serif;background:#0a1628;color:#f3ede4;display:flex;min-height:100vh;align-items:center;justify-content:center;margin:0"><div style="max-width:520px;padding:28px;text-align:center"><h1 style="font-weight:400">' + title + '</h1><p style="line-height:1.6;color:#d8cfc4">' + msg + '</p><p><a style="color:#e8b84a" href="' + CFG.SITE + '">Back to ' + CFG.ORG + '</a></p></div></body>').setTitle(CFG.ORG);
}
function doGet(e) {
  var a = (e.parameter.a || ''), email = String(e.parameter.e || '').toLowerCase(), t = e.parameter.t || '';
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || t !== sign_(a, email)) return page_('Link not valid', 'This link is not valid or has expired. Please use the form on our website.');
  if (a === 'sub') { addToGroup_(email, '', CFG.GROUP_SUBS); return page_('You are subscribed', 'Thank you. You will receive our Research Digest essays. You can unsubscribe at any time from the link in each email.'); }
  if (a === 'unsub') { removeFromGroup_(email, CFG.GROUP_SUBS); return page_('You are unsubscribed', 'You will not receive further digest emails. Thank you for reading.'); }
  return page_('Link not valid', 'This link is not valid.');
}
function doPost(e) {   // website form: double opt-in. Body: {"email":"...", "website":""}
  var out = function (ok, msg) { return ContentService.createTextOutput(JSON.stringify({ ok: ok, message: msg })).setMimeType(ContentService.MimeType.JSON); };
  try {
    var d = JSON.parse(e.postData.contents || '{}'), email = String(d.email || '').trim().toLowerCase();
    if (d.website) return out(true, 'ok');                                    // honeypot: bots fill this
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return out(false, 'Please enter a valid email address.');
    var cache = CacheService.getScriptCache(), p = PropertiesService.getScriptProperties();
    if (cache.get('c:' + email)) return out(true, 'Check your inbox for a confirmation link.');
    var day = Utilities.formatDate(new Date(), 'UTC', 'yyyyMMdd'), n = Number(p.getProperty('cnt:' + day) || 0);
    if (n >= CFG.DAILY_CONFIRM_LIMIT) return out(false, 'Please try again tomorrow.');
    p.setProperty('cnt:' + day, String(n + 1)); cache.put('c:' + email, '1', 3600);
    var url = signedLink('sub', email);
    GmailApp.sendEmail(email, 'Confirm your subscription to the CIF Research Digest',
      'Please confirm your subscription by opening this link: ' + url + '\n\nIf you did not ask for this, ignore this email and nothing will happen.\n\n' + CFG.ORG,
      { name: CFG.ORG, htmlBody: '<p>Please confirm your subscription to the Research Digest:</p><p><a href="' + url + '" style="background:#c8902a;color:#0a1628;padding:11px 18px;text-decoration:none;border-radius:4px;font-weight:bold">Confirm my subscription</a></p><p style="color:#666;font-size:13px">If you did not ask for this, ignore this email and nothing will happen.</p>' });
    return out(true, 'Check your inbox for a confirmation link.');
  } catch (err) { return out(false, 'Something went wrong. Please try again.'); }
}

/* ---------- optional: email an issue to subscribers ---------- */
function subscribers_() {
  var g = People.ContactGroups.get(groupResource_(CFG.GROUP_SUBS), { maxMembers: 2000 }), names = g.memberResourceNames || [], out = [];
  for (var i = 0; i < names.length; i += 50) {
    var r = People.People.getBatchGet({ resourceNames: names.slice(i, i + 50), personFields: 'emailAddresses,names' });
    (r.responses || []).forEach(function (x) { var em = ((x.person || {}).emailAddresses || [])[0]; if (em) out.push(em.value.toLowerCase()); });
  }
  return out;
}
/** Run from the editor: sendIssue('Research Digest, Issue 001', '<h2>Title</h2><p>Link to the essay...</p>') */
function sendIssue(subject, htmlBody) {
  var subs = subscribers_(), quota = MailApp.getRemainingDailyQuota();
  if (subs.length > quota) throw new Error('Only ' + quota + ' emails left today for ' + subs.length + ' subscribers. Try again tomorrow.');
  subs.forEach(function (em) {
    var un = signedLink('unsub', em);
    var body = htmlBody + '<hr><p style="font-size:12px;color:#666">You receive this because you subscribed. <a href="' + un + '">Unsubscribe</a>. ' + CFG.POSTAL + '</p>';
    if (CFG.DRY_RUN) { console.log('DRY RUN would send to ' + em); return; }
    GmailApp.sendEmail(em, subject, 'Open this email in a browser that shows HTML. Unsubscribe: ' + un, { name: CFG.ORG, htmlBody: body });
  });
}

/* ---------- one-time setup and tests ---------- */
function setup() {                      // run once from the editor
  secret_(); label_(CFG.LABEL_DONE); label_(CFG.LABEL_HUMAN);
  groupResource_(CFG.GROUP_INQUIRY); groupResource_(CFG.GROUP_SUBS);
  ScriptApp.getProjectTriggers().forEach(function (t) { if (t.getHandlerFunction() === 'processInbox') ScriptApp.deleteTrigger(t); });
  ScriptApp.newTrigger('processInbox').timeBased().everyMinutes(10).create();
  console.log('Setup complete. Replies are in DRY_RUN (drafts) mode until you set DRY_RUN to false.');
}
function testClassify() {
  [['Volunteering', 'I would like to volunteer'], ['Question', 'Who funds you? What is your mission?'], ['Hi', 'Can I donate money?'], ['Help', 'My dad is on dialysis'], ['Hi', 'I need your pricing']].forEach(function (x) { console.log(x[0] + ' -> ' + classify(x[0], x[1])); });
}

/* ===== Digest sender: emails each newly published essay to subscribers ===== */
function feed_() {
  var r = UrlFetchApp.fetch(CFG.SITE + '/research-digest-feed.json?ts=' + new Date().getTime(), { muteHttpExceptions: true });
  if (r.getResponseCode() !== 200) throw new Error('Feed not reachable: ' + r.getResponseCode());
  var issues = (JSON.parse(r.getContentText()).issues || []).filter(function (i) { return i.published; });
  issues.sort(function (a, b) { return b.n - a.n; });
  return issues;
}
function issueEmail_(it, unsubUrl, preview) {
  var pad = ('00' + it.n).slice(-3);
  var subject = (preview ? '[PREVIEW] ' : '') + 'Research Digest, Issue ' + pad + ': ' + it.title;
  var text = it.title + '\n' + it.deck + '\n\nRead it: ' + it.url + '\nDownload the PDF: ' + it.pdf + '\n\nEducational, not medical advice. In an emergency, call 911.\n\nUnsubscribe: ' + unsubUrl + '\n' + CFG.POSTAL;
  var html = '<div style="font-family:Georgia,serif;font-size:17px;line-height:1.6;color:#1d1a16;max-width:620px"><p style="font:12px monospace;letter-spacing:2px;color:#a8761c;margin:0">' + CFG.ORG.toUpperCase() + ' &middot; RESEARCH DIGEST &middot; ISSUE ' + pad + '</p><h1 style="font-size:28px;line-height:1.2;margin:10px 0">' + it.title + '</h1><p style="font-style:italic;color:#555">' + it.deck + '</p><p style="margin:24px 0"><a href="' + it.url + '" style="background:#c8902a;color:#0a1628;padding:12px 20px;text-decoration:none;border-radius:4px;font-weight:bold;display:inline-block">Read the essay</a> &nbsp; <a href="' + it.pdf + '" style="color:#a8761c">Download the PDF</a></p><p style="font-size:14px;color:#666">Educational, not medical advice. Talk to your healthcare team. In an emergency, call 911.</p><hr style="border:0;border-top:1px solid #ddd"><p style="font-size:12px;color:#777">You receive this because you subscribed. <a href="' + unsubUrl + '">Unsubscribe</a>. ' + CFG.POSTAL + '</p></div>';
  return { subject: subject, text: text, html: html };
}
function preview_(it) {
  var me = Session.getActiveUser().getEmail(), m = issueEmail_(it, signedLink('unsub', me), true);
  GmailApp.sendEmail(me, m.subject, m.text, { name: CFG.ORG, htmlBody: m.html });
}
function checkForNewIssue() {
  var p = PropertiesService.getScriptProperties(), issues = feed_();
  if (!issues.length) return;
  var latest = issues[0], done = Number(p.getProperty('DIGEST_DONE') || 0), target = Number(p.getProperty('DIGEST_ACTIVE') || 0);
  if (!target && latest.n > done) { target = latest.n; p.setProperty('DIGEST_ACTIVE', String(target)); }
  if (!target) return;
  var it = issues.filter(function (i) { return i.n === target; })[0] || latest;
  if (CFG.DRY_RUN) {                       // test mode: send the preview to yourself only
    preview_(it); p.setProperty('DIGEST_DONE', String(target)); p.deleteProperty('DIGEST_ACTIVE'); return;
  }
  var subs = subscribers_(), left = MailApp.getRemainingDailyQuota() - 3, pending = 0;
  subs.forEach(function (em) {
    var key = 's:' + target + ':' + em;
    if (p.getProperty(key)) return;        // already sent this issue to this person
    if (left <= 0) { pending++; return; }  // out of quota today; the next run continues
    var m = issueEmail_(it, signedLink('unsub', em), false);
    GmailApp.sendEmail(em, m.subject, m.text, { name: CFG.ORG, htmlBody: m.html });
    p.setProperty(key, '1'); left--;
  });
  if (!pending) { p.setProperty('DIGEST_DONE', String(target)); p.deleteProperty('DIGEST_ACTIVE'); }
}
function setupDigestSender() {             // run once: only issues published from now on are emailed
  var issues = feed_(), p = PropertiesService.getScriptProperties();
  p.setProperty('DIGEST_DONE', String(issues.length ? issues[0].n : 0)); p.deleteProperty('DIGEST_ACTIVE');
  ScriptApp.getProjectTriggers().forEach(function (t) { if (t.getHandlerFunction() === 'checkForNewIssue') ScriptApp.deleteTrigger(t); });
  ScriptApp.newTrigger('checkForNewIssue').timeBased().everyHours(1).create();
  console.log('Digest sender ready. Baseline issue: ' + (issues.length ? issues[0].n : 0) + '. DRY_RUN=' + CFG.DRY_RUN);
}
function sendLatestIssueNow() {            // manual: (re)send the newest issue to subscribers who have not had it
  var issues = feed_(); if (!issues.length) return;
  PropertiesService.getScriptProperties().setProperty('DIGEST_ACTIVE', String(issues[0].n));
  checkForNewIssue();
}
