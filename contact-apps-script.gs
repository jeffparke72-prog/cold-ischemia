// ============================================================
// Cold Ischemia Foundation — Contact Form backend
// Deploy this as a Google Apps Script Web App under jeffparke72@gmail.com,
// the SAME way the volunteer form's script was deployed.
//
// DEPLOY STEPS:
// 1. Go to https://script.google.com/home while signed in as jeffparke72@gmail.com
// 2. Click "New project"
// 3. Delete the placeholder code and paste this entire file in
// 4. Click "Deploy" (top right) > "New deployment"
// 5. Click the gear icon next to "Select type" and choose "Web app"
// 6. Set "Execute as" = Me (jeffparke72@gmail.com)
// 7. Set "Who has access" = Anyone
// 8. Click "Deploy", then "Authorize access" and approve the permissions
// 9. Copy the "Web app URL" it gives you
// 10. Open contact.html, find the line:
//        const CONTACT_ENDPOINT = "PASTE_YOUR_APPS_SCRIPT_WEB_APP_URL_HERE";
//     and paste the URL in between the quotes, then re-upload contact.html to GitHub.
// ============================================================

var OWNER_EMAIL = "jeffparke72@gmail.com";

var CATEGORY_LABELS = {
  volunteer: "Volunteer & Involvement",
  media: "Media & Press",
  donate: "Donations & Partnerships",
  patient: "Patient & Care Partner Support",
  research: "Research & Policy",
  general: "General Inquiry"
};

// Keep this text identical to the CATEGORIES array in contact.html so the
// on-page instant response and the emailed follow-up always match.
var CATEGORY_RESPONSES = {
  volunteer: "Thank you for your interest in volunteering with the Cold Ischemia Foundation. CIF is built almost entirely on the labor of people who have lived through kidney disease, dialysis, or transplantation, or who care for someone who has — your willingness to contribute time and skill is exactly what keeps an independent, non-industry-funded organization like ours able to operate at all.\n\nI'd encourage you to complete our full Volunteer Readiness Assessment and application, where you can tell us more about your background and the areas where you'd like to help — research, patient support, communications, or program development. A member of our team reviews every application personally and will follow up directly.\n\nThank you for choosing to stand with the 808,000+ Americans living with end-stage kidney disease who rarely have anyone in their corner who isn't selling them something.",
  media: "Thank you for reaching out on a press or media matter. The Cold Ischemia Foundation exists specifically to put verified, patient-grounded, non-industry-funded information into public reporting on kidney disease, dialysis, and transplant policy — a beat that is chronically underserved because so much of the available commentary is funded, directly or indirectly, by the dialysis and pharmaceutical industries it should be scrutinizing.\n\nI am glad to speak on the record, provide background, or connect you with patients and care partners willing to share their experience. Please include your outlet, your deadline, and the specific angle you're pursuing in your message, and I will respond personally as quickly as I can.",
  donate: "Thank you for considering a gift or partnership with the Cold Ischemia Foundation. CIF operates with zero pharmaceutical or dialysis-industry funding by design — every dollar we took from that industry would be a dollar of independence we couldn't get back, and independence is the entire premise of this organization.\n\nThat also means we depend directly on people who believe patients deserve an advocate that isn't compromised. Tell me more about what you have in mind and I will follow up with the specifics — including how your support would be used and what transparency you can expect in return.",
  patient: "Thank you for writing, and I'm sorry if it's kidney disease that's brought you here — it usually is. The Cold Ischemia Foundation was built by people who have lived through dialysis and transplantation ourselves, precisely because so much of what patients and care partners are handed is written by people who never have.\n\nOur free toolkits and the Research Library cover dialysis access, transplant navigation, patient rights, and the financial and legal pressure points most people are never warned about. Tell me more about where you or your loved one are in this process and what you're up against, and I will point you to what's most useful — or simply talk it through with you directly.",
  research: "Thank you for your interest in CIF's research and policy work. Our analyses — including work on physician self-referral in vascular access, home dialysis legislation, and structural reform of the U.S. transplant system — are built using Lean Six Sigma methodology and are held to a standard of sourcing meant to survive contact with legislative staff, journalists, and industry pushback alike.\n\nIf you have a specific research question, a citation request, or are working on related legislation or reporting, let me know the specifics and I'll respond directly.",
  general: "Thank you for contacting the Cold Ischemia Foundation. I read every message that comes through this page personally. CIF is an independent, patient- and care-partner-led advocacy organization confronting structural failures in American kidney care — we take no pharmaceutical or dialysis-industry funding, which means the people writing to us are the only constituency we answer to. I'll review what you've shared and follow up directly as soon as I can."
};

function doPost(e) {
  try {
    var params = e.parameter;
    var name = params.name || "Not provided";
    var email = params.email || "";
    var subject = params.subject || "General Inquiry";
    var message = params.message || "";
    var category = params.category || "general";
    if (!CATEGORY_RESPONSES.hasOwnProperty(category)) category = "general";

    var categoryLabel = CATEGORY_LABELS[category];
    var replyText = CATEGORY_RESPONSES[category];

    // 1. Notify Jeff with the full inquiry
    MailApp.sendEmail({
      to: OWNER_EMAIL,
      subject: "[CIF Contact] " + subject + " — " + categoryLabel,
      body: "New contact form submission on coldischemia.foundation\n\n" +
            "Name: " + name + "\n" +
            "Email: " + email + "\n" +
            "Category (auto-detected): " + categoryLabel + "\n" +
            "Subject: " + subject + "\n\n" +
            "Message:\n" + message
    });

    // 2. Auto-reply to the sender with the same tailored response shown on-page
    if (email && email.indexOf("@") > -1) {
      MailApp.sendEmail({
        to: email,
        subject: "Thank you for contacting the Cold Ischemia Foundation",
        body: replyText + "\n\n— Jeff A. Parke\nFounder & Executive Director\nCold Ischemia Foundation\ncoldischemia.foundation"
      });
    }

    return ContentService.createTextOutput(JSON.stringify({status: "ok"}))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({status: "error", message: String(err)}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
