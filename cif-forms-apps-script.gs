// ============================================================
// Cold Ischemia Foundation: ONE backend for every form on the site
//   • Volunteer applications (with the readiness-training summary)
//   • Volunteer training results ("Send my results to the foundation")
//   • Questions from the "Questions?" button on every page
//   • The Contact page
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
  volunteer: "Volunteer & Involvement", media: "Media & Press", donate: "Donations & Partnerships",
  patient: "Patient & Care Partner Support", research: "Research & Policy", general: "General Inquiry"
};

// Keep identical to the CATEGORIES responses in contact.html.
var CATEGORY_RESPONSES = {
  volunteer: "Thank you for your interest in volunteering with the Cold Ischemia Foundation. CIF is built almost entirely on the labor of people who have lived through kidney disease, dialysis, or transplantation, or who care for someone who has — your willingness to contribute time and skill is exactly what keeps an independent, non-industry-funded organization like ours able to operate at all.\n\nI'd encourage you to complete our full Volunteer Readiness Assessment and application, where you can tell us more about your background and the areas where you'd like to help — research, patient support, communications, or program development. A member of our team reviews every application personally and will follow up directly.\n\nThank you for choosing to stand with the 808,000+ Americans living with end-stage kidney disease who rarely have anyone in their corner who isn't selling them something.",
  media: "Thank you for reaching out on a press or media matter. The Cold Ischemia Foundation exists specifically to put verified, patient-grounded, non-industry-funded information into public reporting on kidney disease, dialysis, and transplant policy — a beat that is chronically underserved because so much of the available commentary is funded, directly or indirectly, by the dialysis and pharmaceutical industries it should be scrutinizing.\n\nI am glad to speak on the record, provide background, or connect you with patients and care partners willing to share their experience. Please include your outlet, your deadline, and the specific angle you're pursuing in your message, and I will respond personally as quickly as I can.",
  donate: "Thank you for considering a gift or partnership with the Cold Ischemia Foundation. CIF operates with zero pharmaceutical or dialysis-industry funding by design — every dollar we took from that industry would be a dollar of independence we couldn't get back, and independence is the entire premise of this organization.\n\nThat also means we depend directly on people who believe patients deserve an advocate that isn't compromised. Tell me more about what you have in mind and I will follow up with the specifics — including how your support would be used and what transparency you can expect in return.",
  patient: "Thank you for writing, and I'm sorry if it's kidney disease that's brought you here — it usually is. The Cold Ischemia Foundation was built by people who have lived through dialysis and transplantation ourselves, precisely because so much of what patients and care partners are handed is written by people who never have.\n\nOur free toolkits and the Research Library cover dialysis access, transplant navigation, patient rights, and the financial and legal pressure points most people are never warned about. Tell me more about where you or your loved one are in this process and what you're up against, and I will point you to what's most useful — or simply talk it through with you directly.",
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
      MailApp.sendEmail({ to: email, subject: "Thank you — Cold Ischemia Foundation", body: reply + SIGNATURE, replyTo: OWNER_EMAIL });
    }

    log_(type, who, email, d);
    return json_({ status: "ok" });
  } catch (err) {
    try { MailApp.sendEmail(OWNER_EMAIL, "[CIF Website] A form submission failed", String(err) + "\n\n" + (e && e.postData ? e.postData.contents : "")); } catch (x) {}
    return json_({ status: "error", message: String(err) });
  }
}

function doGet() { return json_({ status: "ok", service: "CIF forms" }); }

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

function log_(type, who, email, d) {
  try {
    var props = PropertiesService.getScriptProperties();
    var id = props.getProperty("SHEET_ID"), ss;
    if (id) { try { ss = SpreadsheetApp.openById(id); } catch (x) { ss = null; } }
    if (!ss) {
      ss = SpreadsheetApp.create(SHEET_NAME);
      ss.getSheets()[0].appendRow(["Received", "Type", "Name", "Email", "Details"]);
      ss.getSheets()[0].setFrozenRows(1);
      props.setProperty("SHEET_ID", ss.getId());
    }
    ss.getSheets()[0].appendRow([new Date(), type, who, email, format_(d)]);
  } catch (x) {}
}

function json_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }

// Run this once from the editor to confirm email works.
function testEmail() {
  doPost({ postData: { contents: JSON.stringify({ formType: "question", name: "Test", email: "", message: "This is a test from the Apps Script editor.", page: "editor" }) }, parameter: {} });
}
