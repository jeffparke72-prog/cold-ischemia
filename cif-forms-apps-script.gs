

// ============================================================
// Cold Ischemia Foundation: ONE backend for every form on the site
//   • Volunteer applications (with the readiness-training summary)
//   • Volunteer training results ("Send my results to the foundation")
//   • Questions from the "Questions?" button on every page
//   • The Contact page
//   • Living Donor Journey: anonymous assessment results (tab "Donor Assessments") and contact ratings (tab "Contact Ratings"),
//     with a read-only summary at  <web app URL>?ratings=1  that the page can show once 3+ people report on a program
//   • The Advocate's Academy (academy.html): learner progress in a tab named "Course Progress" (one row per
//     learner per course, updated live), every event in "Academy Log", an email to you when someone starts or
//     finishes a course; learners get a thank-you email when they start, a congratulations email with the certificate
//     number when they pass, and an encouraging next-steps email when they do not pass yet. Every other automatic reply
//     ends with a thank-you and an invitation to keep learning (GRATITUDE).
// Every submission is emailed to OWNER_EMAIL and logged as a row in a Google
// Sheet named "CIF Website Submissions" in your Google Drive (created automatically).
// The person who wrote in gets an automatic, personal thank-you reply.
//
// DEPLOY (about 5 minutes, once):
// 1. Go to https://script.google.com/home signed in as jeffparke72@gmail.com
// 2. Click "New project". Delete the placeholder code and paste this whole file.
// 3. Click "Deploy" > "New deployment". Click the gear next to "Select type" > "Web app".
// 4. "Execute as" = Me.  "Who has access" = Anyone.
// 5. Click "Deploy", then "Authorize access" and approve (Gmail + Sheets permissions).
//    If Google says "Google hasn't verified this app": click "Advanced" > "Go to ... (unsafe)".
//    It's your own script, running in your own account.
// 6. Copy the "Web app URL" (it ends in /exec).
// 7. Paste it into cif-help.js:  formsEndpoint: "PASTE_URL_HERE"   (or send it to Claude to do it)
// Optional test: in the editor, pick the function "testEmail" and click Run.
// ============================================================

var OWNER_EMAIL = "jeffparke72@gmail.com";
var SHEET_NAME = "CIF Website Submissions";
// Added to every automatic reply, so people always know how to keep reaching out.
var FOLLOW_UP = "\n\n---\nHOW TO KEEP IN TOUCH\n" +
  "• Reply to this email any time. It comes straight to me, and your earlier message stays in the same thread.\n" +
  "• Or use the Contact page (coldischemia.foundation/contact.html), or the \"Questions?\" button on any page of the site.\n" +
  "• Expect a personal reply as soon as possible, usually within a few days. If you haven't heard back within a week, reply to this email and I will follow up.\n" +
  "• Free toolkits and guides: coldischemia.foundation/projects.html\n\n" +
  "In an emergency, call 911. In emotional crisis, call or text 988 (Suicide & Crisis Lifeline), 24/7.\n\n" +
  "For your records, here is what you sent us:\n";
// Closes every automatic reply the foundation sends: thanks first, then an invitation to keep learning.
var GRATITUDE = "\n\nOne more thing. Most people never reach out at all, and the ones who do are the reason anything in this system ever gets better. Your message tells me you are paying attention, and paying attention is where every real change begins.\n\n" +
  "So let me ask one thing of you: keep learning. The Advocate's Academy (coldischemia.foundation/academy.html) is free and self-paced. It shows how the system is paid for, who makes the decisions, and which written rules protect you, with every fact sourced so you can check it yourself. Our free toolkits (coldischemia.foundation/projects.html) turn that knowledge into letters, checklists and questions you can use this week. Every fact you learn is one more thing nobody can talk you out of. Learn it, use it, and then pass it on to the next family who needs it. That is how one informed person becomes many. Thank you for being one of them.";
var SIGNATURE = "\n\n— Jeff A. Parke\nFounder & Executive Director\nCold Ischemia Foundation\ncoldischemia.foundation";

var LABELS = {
  fname: "Full name", name: "Name", email: "Email", phone: "Phone", location: "City & state",
  qMotivation: "Why advocacy work", qDiscovery: "How they found CIF", qFit: "Why CIF specifically",
  qDifficult: "Supporting someone through a difficult time", qConnection: "Connection to kidney disease",
  tracks: "Tracks of interest", qSkills: "Skills & experience", hours: "Hours per month",
  duration: "How long they can sustain it", qConflict: "Possible conflicts of interest",
  refName: "Reference name", refContact: "Reference contact", trainingSummary: "Readiness training summary",
  subject: "Subject", message: "Message", category: "Category", page: "Sent from page", summary: "Training summary"
};

var CATEGORY_LABELS = {
  innovation: "Innovation & Research", volunteer: "Volunteer & Involvement", media: "Media & Press", donate: "Support & Partnerships",
  patient: "Patient & Care Partner Support", research: "Research & Policy", general: "General Inquiry"
};

// Keep identical to the CATEGORIES responses in contact.html.
var CATEGORY_RESPONSES = {
  volunteer: "Thank you for your interest in volunteering with the Cold Ischemia Foundation. CIF is built almost entirely on the labor of people who have lived through kidney disease, dialysis, or transplantation, or who care for someone who has — your willingness to contribute time and skill is exactly what keeps an independent, non-industry-funded organization like ours able to operate at all.\n\nI'd encourage you to complete our full Volunteer Readiness Assessment and application, where you can tell us more about your background and the areas where you'd like to help — research, patient support, communications, or program development. A member of our team reviews every application personally and will follow up directly.\n\nThank you for choosing to stand with the 808,000+ Americans living with end-stage kidney disease who rarely have anyone in their corner who isn't selling them something.",
  media: "Thank you for reaching out on a press or media matter. The Cold Ischemia Foundation exists specifically to put verified, patient-grounded, non-industry-funded information into public reporting on kidney disease, dialysis, and transplant policy — a beat that is chronically underserved because so much of the available commentary is funded, directly or indirectly, by the dialysis and pharmaceutical industries it should be scrutinizing.\n\nI am glad to speak on the record, provide background, or connect you with patients and care partners willing to share their experience. Please include your outlet, your deadline, and the specific angle you're pursuing in your message, and I will respond personally as quickly as I can.",
  donate: "Thank you for wanting to support the Cold Ischemia Foundation. CIF does not accept donations, gifts, grants, or sponsorships of any kind. That independence is the entire premise of this organization: the patients and care partners who write to us are the only constituency we answer to.\n\nThe most powerful support you can give costs nothing. Share our free toolkits with someone who needs them, tell your story if you are willing, or volunteer your time and skills. If you are proposing a non-financial partnership, tell me more and I will respond personally.",
  patient: "Thank you for writing, and I'm sorry if it's kidney disease that's brought you here — it usually is. The Cold Ischemia Foundation was built by people who have lived through dialysis and transplantation ourselves, precisely because so much of what patients and care partners are handed is written by people who never have.\n\nOur free toolkits and the Research Library cover dialysis access, transplant navigation, patient rights, and the financial and legal pressure points most people are never warned about. Tell me more about where you or your loved one are in this process and what you're up against, and I will point you to what's most useful — or simply talk it through with you directly.",
  innovation: "Thank you for reaching out about innovation and research. The Cold Ischemia Foundation follows emerging transplant science, including oxygen-carrier research such as BHOC, machine perfusion, and new ways to preserve donated organs, and explains it in plain language for patients and care partners.\n\nWe are an independent, non-clinical advocacy organization. We do not run clinical trials, enroll patients, or endorse products, and we accept no funding from the companies developing them. That independence is what lets us describe new science honestly.\n\nIf you are a researcher, clinician, or developer, tell me what you are working on, what stage it is at, and what you hope for from CIF: a patient and care-partner perspective, a review of plain-language materials, or a conversation about what families need. If you are a patient or care partner asking whether a new technology is available to you, please also talk with your transplant team. I am glad to help you prepare the questions to bring to them.",
  research: "Thank you for your interest in CIF's research and policy work. Our analyses — including work on physician self-referral in vascular access, home dialysis legislation, and structural reform of the U.S. transplant system — are built using Lean Six Sigma methodology and are held to a standard of sourcing meant to survive contact with legislative staff, journalists, and industry pushback alike.\n\nIf you have a specific research question, a citation request, or are working on related legislation or reporting, let me know the specifics and I'll respond directly.",
  general: "Thank you for contacting the Cold Ischemia Foundation. I read every message that comes through this page personally. CIF is an independent, patient- and care-partner-led advocacy organization confronting structural failures in American kidney care — we take no pharmaceutical or dialysis-industry funding, which means the people writing to us are the only constituency we answer to. I'll review what you've shared and follow up directly as soon as I can."
};

var REPLIES = {
  application: "Thank you for applying to volunteer with the Cold Ischemia Foundation, and for taking the readiness training seriously. Every application is read in full by a person, not filtered by a system. You can expect to hear from us personally, typically within two weeks.\n\nIn the meantime, our free toolkits and guides are yours to use whether or not you end up volunteering.",
  training: "Thank you for completing the Cold Ischemia Foundation's Volunteer Readiness Training and sending us your results. That took honesty and real time, and we noticed.\n\nIf you haven't yet, the next step is the volunteer application at coldischemia.foundation/cif-volunteer-page.html#apply. Your training summary attaches to it automatically when you apply from the same device.",
  question: "Thank you for your question. It came straight to me, and I read every one personally. I'll get back to you as soon as I can, usually within a day or two.\n\nIf this is about someone in immediate danger, please call 911. If you or someone you love is in emotional crisis, call or text 988 (Suicide & Crisis Lifeline), 24/7."
};

function doPost(e) {
  try {
    var d = parse_(e);
    var type = d.formType || (d.fname || d.qMotivation ? "application" : (d.category ? "contact" : "question"));
    if (type === "course") return json_(course_(d));
    if (type === "donor-assessment" || type === "contact-rating") {   // anonymous, no email sent, tab per type
      tab_(type === "donor-assessment" ? "Donor Assessments" : "Contact Ratings", type === "donor-assessment" ?
        ["Received", "Organ", "State", "Score", "Band", "Medical", "Lifestyle", "Emotional", "Logistics", "Knowledge", "Themes", "Paired", "Non-directed"] :
        ["Received", "Id", "Contact", "City", "Listed phone", "Outcome", "Stars", "Direct line given", "Respect checks met"],
        type === "donor-assessment" ?
        [new Date(), d.organ, d.state, d.score, d.band, d.medical, d.lifestyle, d.emotional, d.logistics, d.knowledge, d.themes, d.paired, d.nonDirected] :
        [new Date(), d.id, d.contact, d.city, d.listedPhone, d.outcome, d.stars, d.directLine, d.respect]);
      return json_({ status: "ok" });
    }
    var who = d.fname || d.name || "Someone";
    var email = String(d.email || "").trim();
    var subject, intro, reply;

    if (type === "application") {
      subject = "[CIF Volunteer Application] " + who + (d.trainingSummary ? " — " + verdict_(d.trainingSummary) : " — no training summary");
      intro = "New volunteer application";
      reply = REPLIES.application;
    } else if (type === "training") {
      subject = "[CIF Training Results] " + who + " — " + verdict_(d.summary || "");
      intro = "Volunteer Readiness Training completed";
      reply = REPLIES.training;
    } else if (type === "question") {
      subject = "[CIF Question] " + who + (d.page ? " — from " + d.page : "");
      intro = "New question from the website";
      reply = REPLIES.question;
    } else {
      var cat = CATEGORY_RESPONSES.hasOwnProperty(d.category) ? d.category : "general";
      subject = "[CIF Contact] " + (d.subject || "General Inquiry") + " — " + CATEGORY_LABELS[cat];
      intro = "New contact form submission";
      reply = CATEGORY_RESPONSES[cat];
      type = "contact";
    }

    var body = intro + " on coldischemia.foundation\n" + new Date() + "\n\n" + format_(d) +
               (email ? "\n\nReply directly to this email to answer " + who + "." : "");
    var mail = { to: OWNER_EMAIL, subject: subject, body: body };
    if (email.indexOf("@") > 0) mail.replyTo = email;
    MailApp.sendEmail(mail);

    if (email.indexOf("@") > 0) {
      var yours = String(d.message || d.summary || "").trim();
      MailApp.sendEmail({ to: email, subject: "Thank you — Cold Ischemia Foundation" + (d.subject ? ": " + d.subject : ""),
        body: reply + GRATITUDE + SIGNATURE + FOLLOW_UP + (yours ? "\n" + yours.replace(/^/gm, "> ") : "\n(your application or form details)") , replyTo: OWNER_EMAIL });
    }

    log_(type, who, email, d);
    return json_({ status: "ok" });
  } catch (err) {
    try { MailApp.sendEmail(OWNER_EMAIL, "[CIF Website] A form submission failed", String(err) + "\n\n" + (e && e.postData ? e.postData.contents : "")); } catch (x) {}
    return json_({ status: "error", message: String(err) });
  }
}

// Row writer for the anonymous tabs. Cells starting with = + - @ are neutralised so a visitor cannot inject formulas.
function tab_(name, header, row) {
  var props = PropertiesService.getScriptProperties();
  var id = props.getProperty("SHEET_ID"), ss = null;
  if (id) { try { ss = SpreadsheetApp.openById(id); } catch (x) { ss = null; } }
  if (!ss) { ss = SpreadsheetApp.create(SHEET_NAME); ss.getSheets()[0].appendRow(["Received", "Type", "Name", "Email", "Details"]); props.setProperty("SHEET_ID", ss.getId()); }
  var sh = ss.getSheetByName(name);
  if (!sh) { sh = ss.insertSheet(name); sh.appendRow(header); sh.setFrozenRows(1); }
  sh.appendRow(row.map(function (v) { v = (v instanceof Date) ? v : String(v == null ? "" : v).slice(0, 200); return (typeof v === "string" && /^[=+\-@]/.test(v)) ? "'" + v : v; }));
}

// ?ratings=1 returns, per contact id, how many people reported and what share reached a person.
// Only contacts with 3+ reports are returned. Direct lines are NOT published automatically: copy a number
// you have checked into contact-ratings.json yourself.
function doGet(e) {
  if (e && e.parameter && e.parameter.course) return json_({ status: "ok", course: true });
  if (e && e.parameter && e.parameter.ratings) {
    var out = {};
    try {
      var id = PropertiesService.getScriptProperties().getProperty("SHEET_ID");
      var sh = SpreadsheetApp.openById(id).getSheetByName("Contact Ratings");
      if (sh) sh.getDataRange().getValues().slice(1).forEach(function (r) {
        var o = out[r[1]] || (out[r[1]] = { reports: 0, reached: 0, rs: 0 }); o.reports++; if (r[5] === "reached") o.reached++; o.rs += String(r[8] || "").split(",").filter(String).length;
      });
    } catch (x) {}
    var res = {};
    Object.keys(out).forEach(function (k) { if (out[k].reports >= 3) res[k] = { reports: out[k].reports, reached: out[k].reached / out[k].reports, respect: out[k].rs / out[k].reports }; });
    return json_({ status: "ok", contacts: res });
  }
  return json_({ status: "ok", service: "CIF forms" });
}

function parse_(e) {
  var d = {};
  if (e && e.postData && e.postData.contents) {
    var c = e.postData.contents;
    if (/^\s*\{/.test(c)) { try { d = JSON.parse(c); } catch (x) {} }
  }
  if (e && e.parameter) for (var k in e.parameter) if (!(k in d)) d[k] = e.parameter[k];
  return d;
}

function format_(d) {
  var out = [];
  for (var k in d) {
    if (k === "formType") continue;
    var v = d[k];
    if (Object.prototype.toString.call(v) === "[object Array]") v = v.join(", ");
    v = String(v == null ? "" : v).trim();
    if (!v) continue;
    var label = LABELS[k] || k;
    out.push(v.indexOf("\n") > -1 || v.length > 70 ? label + ":\n" + v + "\n" : label + ": " + v);
  }
  return out.join("\n");
}

function verdict_(s) {
  var m = String(s).match(/Verdict:\s*([^\n]+)/);
  return m ? m[1].trim() : "results attached";
}

// The one Google Sheet every form writes to (created automatically the first time).
function book_() {
  var props = PropertiesService.getScriptProperties();
  var id = props.getProperty("SHEET_ID"), ss;
  if (id) { try { ss = SpreadsheetApp.openById(id); } catch (x) { ss = null; } }
  if (!ss) {
    ss = SpreadsheetApp.create(SHEET_NAME);
    ss.getSheets()[0].appendRow(["Received", "Type", "Name", "Email", "Details"]);
    ss.getSheets()[0].setFrozenRows(1);
    props.setProperty("SHEET_ID", ss.getId());
  }
  return ss;
}
function safe_(v) { v = (v instanceof Date) ? v : String(v == null ? "" : v).slice(0, 300); return (typeof v === "string" && /^[=+\-@]/.test(v)) ? "'" + v : v; }

// ---------------- The Advocate's Academy ----------------
// Events from academy.html: "start" (first time a learner opens a course), "module" (a module's knowledge check
// is finished) and "complete" (the final assessment is submitted). One row per learner per course in
// "Course Progress", updated in place; every event appended to "Academy Log".
var COURSE_HEADER = ["Learner ID", "Name", "Email", "Role", "Course", "Started", "Last activity", "Progress %",
  "Modules done", "Module scores", "Final score", "Passed", "Certificate", "Completed", "Final attempts"];
function course_(d) {
  var ss = book_(), now = new Date();
  var sh = ss.getSheetByName("Course Progress");
  if (!sh) { sh = ss.insertSheet("Course Progress"); sh.appendRow(COURSE_HEADER); sh.setFrozenRows(1); }
  var log = ss.getSheetByName("Academy Log");
  if (!log) { log = ss.insertSheet("Academy Log"); log.appendRow(["Received", "Event", "Name", "Email", "Role", "Course", "Progress %", "Module", "Module score", "Final score", "Passed"]); log.setFrozenRows(1); }
  log.appendRow([now, d.event, d.name, d.learnerEmail, d.role, d.courseTitle, d.progress, d.module || "", d.moduleScore || "", d.finalScore || "", d.passed || ""].map(safe_));

  var rows = sh.getDataRange().getValues(), at = -1;
  for (var i = 1; i < rows.length; i++) if (rows[i][0] === d.learnerId && rows[i][4] === d.courseTitle) { at = i + 1; break; }
  var old = at > 0 ? rows[at - 1] : null;
  var firstPass = d.passed === "yes" && !(old && old[11] === "yes");
  var row = [d.learnerId, d.name, d.learnerEmail, d.role, d.courseTitle, old ? old[5] : now, now, d.progress,
    d.modulesDone, d.moduleScores, d.finalScore || (old ? old[10] : ""), d.passed || (old ? old[11] : ""),
    d.certificate || (old ? old[12] : ""), firstPass ? now : (old ? old[13] : ""), d.event === "complete" ? (d.attempt || "") : (old ? old[14] : "")].map(safe_);
  if (at > 0) sh.getRange(at, 1, 1, row.length).setValues([row]); else sh.appendRow(row);

  var who = d.name + " <" + d.learnerEmail + ">", link = ss.getUrl();
  if (d.event === "start" && !old) {
    MailApp.sendEmail({ to: OWNER_EMAIL, replyTo: d.learnerEmail, subject: "[CIF Academy] Started: " + d.name + " · " + d.courseTitle,
      body: who + " (" + d.role + ") just started " + d.courseTitle + ".\n\nLive progress for every learner: " + link + " (tab \"Course Progress\")\n\nReply to this email to write to them directly." });
    if (String(d.learnerEmail).indexOf("@") > 0) {
      MailApp.sendEmail({ to: d.learnerEmail, replyTo: OWNER_EMAIL, subject: "Thank you for starting " + d.courseTitle + " · The Advocate's Academy",
        body: "Dear " + d.name + ",\n\nThank you for choosing to start " + d.courseTitle + ". I mean that. You are giving some of your time to understand a system that most people only ever experience from the receiving end, and that choice matters more than you might think.\n\n" +
          "Here is what is ahead. The course has three modules, each about ten to twelve minutes, and each one ends with a ten-question knowledge check. Every fact is sourced, so you can open the evidence yourself and use it with confidence. Your progress saves on the device you are using, so you can stop and pick up any time at coldischemia.foundation/academy.html. Score 70 percent or better on the final assessment and you will earn a certificate with your own number.\n\n" +
          "One request as you go: write down anything that surprises you. Those surprises are usually the exact places where patients and families have been kept in the dark, and they are where your new knowledge will do the most good, for you and for the people you help.\n\n" +
          "With real gratitude. I am glad you are here." + SIGNATURE + FOLLOW_UP.split("For your records")[0] });
    }
  }
  if (d.event === "complete") {
    MailApp.sendEmail({ to: OWNER_EMAIL, replyTo: d.learnerEmail,
      subject: "[CIF Academy] " + (d.passed === "yes" ? "PASSED" : "Not yet passed") + ": " + d.name + " · " + d.courseTitle + " · final " + (d.thisAttemptScore || d.finalScore),
      body: who + " (" + d.role + ") submitted the final assessment for " + d.courseTitle + ".\n\nThis attempt: " + (d.thisAttemptScore || "") +
        "\nBest result: " + d.finalScore + (d.passed === "yes" ? " (passed)" : "") + "\nModule checks: " + d.moduleScores + " (" + d.modulesDone + " done)" +
        "\nCourse progress: " + d.progress + "%" + (d.certificate ? "\nCertificate: " + d.certificate : "") + "\n\nAll learners: " + link });
    if (firstPass && String(d.learnerEmail).indexOf("@") > 0) {
      MailApp.sendEmail({ to: d.learnerEmail, replyTo: OWNER_EMAIL, subject: "Congratulations, and thank you · " + d.courseTitle,
        body: "Dear " + d.name + ",\n\nCongratulations, and thank you. You completed " + d.courseTitle + " in The Advocate's Academy with a final score of " + d.finalScore + ". Your certificate number is " + d.certificate + ", and you can view and print your certificate any time at coldischemia.foundation/academy.html on the device you used.\n\n" +
          "I want you to know how much that means to me. Every person who finishes this course becomes someone who can explain the system to the next family, ask the question nobody else thought to ask, and point to the written rule that protects them. That is how understanding spreads, and understanding is what changes outcomes.\n\n" +
          "Now please put it to work. Share one thing you learned with someone who needs it this week. If you have not taken all three courses yet, the others are waiting for you at coldischemia.foundation/academy.html, and each one builds on the last. And if you ever need help with a specific problem, reply to this email. It comes straight to me.\n\n" +
          "Thank you for finishing what you started, and for caring enough to learn it." + SIGNATURE + FOLLOW_UP.split("For your records")[0] });
    } else if (d.passed !== "yes" && String(d.learnerEmail).indexOf("@") > 0) {
      MailApp.sendEmail({ to: d.learnerEmail, replyTo: OWNER_EMAIL, subject: "Thank you for finishing " + d.courseTitle + ": your next step",
        body: "Dear " + d.name + ",\n\nThank you for working all the way through " + d.courseTitle + ". You scored " + (d.thisAttemptScore || d.finalScore) + " on the final assessment. The certificate takes 70 percent, so not this time, and please do not read that as a failure. This material is genuinely hard. Much of it was never written to be understood by the public, and reaching the end tells me you are serious about learning it.\n\n" +
          "Here is the best way to close the gap. Open the course again at coldischemia.foundation/academy.html. Read the explanation under each question you missed, because the explanations are where most of the learning happens. Revisit the modules where your knowledge-check scores were lowest. Then take the final again whenever you are ready. There is no limit and no penalty, and your best score is the one that counts.\n\n" +
          "I am grateful you are doing this, and I am in your corner. If any part of the course was confusing, reply and tell me. Your feedback makes it better for the next person." + SIGNATURE + FOLLOW_UP.split("For your records")[0] });
    }
  }
  return { status: "ok" };
}

function log_(type, who, email, d) {
  try { book_().getSheets()[0].appendRow([new Date(), type, who, email, format_(d)]); } catch (x) {}
}

function json_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }

// Run this once from the editor to confirm email works.
function testEmail() {
  doPost({ postData: { contents: JSON.stringify({ formType: "question", name: "Test", email: "", message: "This is a test from the Apps Script editor.", page: "editor" }) }, parameter: {} });
}
