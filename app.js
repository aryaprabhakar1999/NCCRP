const app = document.querySelector("#app");
const journeyProgress = document.querySelector("#journeyProgress");
const globalStatus = document.querySelector("#globalStatus");

const MAX_REQUEST_BYTES = 4 * 1024 * 1024;
const progressGroups = {
  financial: {
    screens: ["userType", "existingLogin", "newUser", "prereq", "financialWorkspace", "preview", "done"],
    steps: [
      ["Start", ["userType", "existingLogin", "newUser"]],
      ["Add evidence", ["prereq"]],
      ["Fill report", ["financialWorkspace"]],
      ["Finish", ["preview", "done"]],
    ],
  },
  womenChildren: {
    screens: ["womenChildren", "wcLogin", "wcStart", "wcEvidence", "wcWorkspace", "wcPreview", "wcDone"],
    steps: [
      ["Start", ["womenChildren", "wcLogin", "wcStart"]],
      ["Add evidence", ["wcEvidence"]],
      ["Fill report", ["wcWorkspace"]],
      ["Finish", ["wcPreview", "wcDone"]],
    ],
  },
};

const screens = {
  auth: "auth-template",
  home: "home-template",
  trackingHome: "tracking-home-template",
  trackingLookup: "tracking-lookup-template",
  trackingLogin: "tracking-login-template",
  trackingList: "tracking-list-template",
  trackingDetail: "tracking-detail-template",
  womenChildren: "women-template",
  wcLogin: "wc-login-template",
  wcStart: "wc-start-template",
  wcEvidence: "wc-evidence-template",
  wcWorkspace: "wc-workspace-template",
  wcReview: "wc-review-template",
  wcComplaint: "wc-complaint-template",
  wcSuspect: "wc-suspect-template",
  wcPreview: "wc-preview-template",
  wcDone: "wc-done-template",
  userType: "user-type-template",
  existingLogin: "existing-login-template",
  newUser: "new-user-template",
  prereq: "prereq-template",
  financialWorkspace: "financial-workspace-template",
  preview: "preview-template",
  done: "done-template",
};

const profileFields = [
  ["title", "Title", "select", ["Mr", "Mrs", "Dr", "Shri", "Smt", "Prof", "Miss"]],
  ["name", "Name"],
  ["mobile", "Mobile No."],
  ["dob", "Date of Birth", "date"],
  ["gender", "Gender", "select", ["Female", "Male", "Non-binary", "Prefer not to say"]],
  ["email", "Email ID", "email"],
  ["relationType", "Father / Mother / Spouse", "select", ["Father", "Mother", "Spouse"]],
  ["relationName", "Father / Mother / Spouse Name"],
  ["house", "House No."],
  ["street", "Street Name"],
  ["colony", "Colony"],
  ["city", "Vill / Town / City"],
  ["tehsil", "Tehsil"],
  ["country", "Country"],
  ["state", "State"],
  ["district", "District"],
  ["policeStation", "Police Station"],
  ["pincode", "Pincode"],
];

const victimFields = profileFields.map(([key, label, type = "text", options]) => [
  key,
  key === "mobile" ? "Mobile No. (if known)" : label,
  type,
  options,
  { optional: ["mobile", "email", "relationType", "relationName", "tehsil", "policeStation", "colony"].includes(key) },
]);

const complaintFields = [
  ["category", "Category of complaint", "fixed"],
  ["subCategory", "Sub-category", "select", [
    "Aadhar Enabled Payment System (AEPS)",
    "Business Email Compromise / Email Takeover",
    "Debit / Credit Card Fraud / Sim Swap Fraud",
    "Demat / Depository Fraud",
    "E-Wallet Related Fraud",
    "Fraud Call / Vishing",
    "Internet Banking Related Fraud",
    "UPI Related Frauds",
  ]],
  ["incidentDate", "Approximate date of incident", "date"],
  ["incidentTime", "Time of incident", "time"],
  ["delay", "Is there any delay in reporting?", "select", ["No", "Yes"]],
  ["occurredAt", "Where did the incident occur?", "select", ["UPI payment app", "Banking website", "Phone call", "Messaging app", "Marketplace", "Social media", "Other"]],
];

const transactionFields = [
  ["wallet", "Wallet / PG / PA"],
  ["account", "Account No. / Wallet ID / Merchant ID / UPI ID"],
  ["utr", "Transaction ID / UTR Number"],
  ["amount", "Amount"],
  ["date", "Transaction Date", "date"],
  ["time", "Transaction Time", "time"],
  ["reference", "Reference No."],
  ["suspectAccount", "Do you have Suspect Account Details?", "select", ["No", "Yes"]],
];

const suspectFields = [
  ["suspectName", "Suspect Name"],
  ["suspectIdType", "ID Type", "select", ["Mobile No.", "UPI ID", "Bank Account", "Email", "Social Profile", "Other"]],
  ["suspectId", "ID Number"],
  ["suspectAddress", "Suspect Address"],
];

const wcEvidenceFields = [
  ["suggestedCategory", "Suggested complaint category", "select", [
    "Rape / Gang Rape (RGR) - Sexually Abusive Content",
    "Sexually Obscene Material",
    "Sexually Explicit Act",
    "CSEAM - Child Sexual Exploitative and Abuse Material",
  ]],
  ["platform", "Platform detected", "select", ["Email", "Facebook", "Instagram", "Snapchat", "Twitter", "WhatsApp", "Website URL", "YouTube", "LinkedIn", "Telegram", "Other"]],
  ["date", "Approximate date found", "date"],
  ["time", "Time found", "time"],
  ["people", "Persons or usernames visible"],
  ["nature", "Nature of content"],
];

const wcComplaintFields = [
  ["category", "Category of complaint", "select", [
    "Rape / Gang Rape (RGR) - Sexually Abusive Content",
    "Sexually Obscene Material",
    "Sexually Explicit Act",
    "CSEAM - Child Sexual Exploitative and Abuse Material",
  ]],
  ["date", "Approximate date of incident", "date"],
  ["time", "Time", "time"],
  ["delayReason", "Reason for delay in reporting"],
  ["state", "State / UT"],
  ["district", "District"],
  ["policeStation", "Police Station"],
  ["occurredAt", "Where did the incident occur?", "select", ["Email", "Facebook", "Instagram", "Snapchat", "Twitter", "WhatsApp", "Website URL", "YouTube", "LinkedIn", "Telegram", "Other"]],
];

const wcSuspectFields = [
  ["suspectName", "Suspect Name"],
  ["suspectIdType", "ID Type", "select", ["Mobile No.", "Email", "Username", "Profile URL", "Other"]],
  ["suspectId", "ID Number"],
  ["shareAddress", "Share suspect address?", "select", ["No", "Yes"]],
  ["suspectAddress", "Suspect Address"],
];

const sampleProfile = {
  title: "Miss",
  name: "Ananya Sharma",
  mobile: "9876543210",
  dob: "1994-05-18",
  gender: "Female",
  email: "ananya.sharma@example.com",
  relationType: "Father",
  relationName: "Ramesh Sharma",
  house: "42",
  street: "Ashoka Road",
  colony: "Green Park",
  city: "New Delhi",
  tehsil: "Hauz Khas",
  country: "India",
  state: "Delhi",
  district: "South Delhi",
  policeStation: "Green Park",
  pincode: "110016",
};

const sampleVictim = {
  ...sampleProfile,
  name: "Riya Sharma",
  mobile: "",
  email: "",
  dob: "2001-09-12",
  relationType: "",
  relationName: "",
};

const mockTransactions = [
  {
    wallet: "UPI / Phone payment app",
    account: "ananya@upi",
    utr: "409812345678",
    amount: "24500",
    date: "2026-08-27",
    time: "10:42",
    reference: "PAY-8842-DEL",
    suspectAccount: "No",
  },
  {
    wallet: "Internet Banking",
    account: "XXXXXX4521",
    utr: "510934872615",
    amount: "38000",
    date: "2026-08-27",
    time: "11:09",
    reference: "IMPS-7219",
    suspectAccount: "Yes",
  },
];

const wcEvidenceSamples = [
  {
    suggestedCategory: "Sexually Obscene Material",
    platform: "Instagram",
    date: "2026-08-27",
    time: "19:20",
    people: "@unknown_profile, victim account mentioned",
    nature: "Repeated abusive messages, unwanted image sharing, and threats to post more content",
    timeline: "Screenshot 1 shows the first unwanted message in the evening. Screenshot 2 shows repeated contact from the same profile. Screenshot 3 shows a threat to share content publicly if the messages are ignored.",
  },
  {
    suggestedCategory: "CSEAM - Child Sexual Exploitative and Abuse Material",
    platform: "Telegram",
    date: "2026-08-26",
    time: "21:05",
    people: "Telegram group admin, two usernames visible",
    nature: "A group/channel appears to be sharing harmful child safety material and asking users to forward it",
    timeline: "The uploaded screenshots show a public group link, a visible admin username, timestamps across two messages, and requests for others to circulate harmful material. The reporter wants the content reviewed and removed urgently.",
  },
];

const trackingRequests = [
  {
    ack: "NCCRP-FIN-2026-10482",
    type: "Financial crime",
    status: "Under review",
    submitted: "27 Aug 2026, 10:58 AM",
    updated: "27 Aug 2026, 12:15 PM",
    next: "The complaint details and uploaded transaction evidence are being reviewed by the assigned desk.",
    timeline: [
      "Complaint submitted",
      "Acknowledgement generated",
      "Evidence review in progress",
      "Agency action pending",
    ],
  },
  {
    ack: "NCCRP-WC-2026-77190",
    type: "Women/children report",
    status: "Submitted to agency",
    submitted: "27 Aug 2026, 11:32 AM",
    updated: "27 Aug 2026, 01:05 PM",
    next: "The report has been forwarded to the appropriate agency for review and action.",
    timeline: [
      "Anonymous report submitted",
      "Evidence summary prepared",
      "Report submitted to agency",
      "Agency review pending",
    ],
  },
  {
    ack: "NCCRP-FIN-2026-55231",
    type: "Financial crime",
    status: "Action initiated",
    submitted: "26 Aug 2026, 08:44 PM",
    updated: "27 Aug 2026, 09:20 AM",
    next: "The payment trail has been marked for urgent action in this mocked status flow.",
    timeline: [
      "Complaint submitted",
      "Transaction evidence verified",
      "Action initiated",
      "Final update pending",
    ],
  },
];

const state = {
  current: "home",
  returnAfterAuth: "home",
  auth: {
    isSignedIn: false,
    mobile: "",
    otpSent: false,
  },
  startedAt: Date.now(),
  reporter: { ...sampleProfile },
  victim: { ...sampleVictim },
  complaint: {
    category: "Online Financial Fraud",
    subCategory: "UPI Related Frauds",
    incidentDate: "2026-08-27",
    incidentTime: "10:45",
    delay: "No",
    occurredAt: "UPI payment app",
  },
  transactions: [{ ...mockTransactions[0] }],
  suspect: {
    hasDetails: false,
    suspectName: "",
    suspectIdType: "UPI ID",
    suspectId: "",
    suspectAddress: "",
  },
  financial: {
    entry: "existing",
    evidenceReady: false,
    activeSection: "myDetails",
    completedSections: [],
    submittedAt: "",
    reportFor: "self",
    relationshipToVictim: "",
    consentConfirmed: false,
  },
  documents: {
    reporter: null,
    victim: null,
    evidence: [],
    wcEvidence: [],
  },
  wc: {
    mode: "anonymous",
    entry: "evidence",
    activeSection: "personalDetails",
    completedSections: [],
    evidenceReady: false,
    loginMobile: "",
    personal: {
      shareIdentity: "No",
      name: "",
      mobile: "",
      email: "",
      state: "Delhi",
      district: "South Delhi",
    },
    evidence: { ...wcEvidenceSamples[0] },
    complaint: {
      category: "Sexually Obscene Material",
      date: "2026-08-27",
      time: "19:20",
      delayReason: "",
      state: "Delhi",
      district: "South Delhi",
      policeStation: "",
      occurredAt: "Instagram",
      description: "",
    },
    suspect: {
      hasDetails: false,
      suspectName: "",
      suspectIdType: "Username",
      suspectId: "",
      shareAddress: "No",
      suspectAddress: "",
    },
  },
  tracking: {
    loginMobile: "",
    selectedAck: trackingRequests[0].ack,
    returnTo: "trackingList",
  },
  ai: {
    financial: { mode: "demo_fallback", confidence: {}, needsReview: [] },
    womenChildren: { mode: "demo_fallback", confidence: {}, needsReview: [] },
    profile: { mode: "demo_fallback" },
  },
};

function render(screen) {
  document.querySelector(".toast")?.remove();
  state.current = screen;
  const template = document.querySelector(`#${screens[screen]}`);
  app.replaceChildren(template.content.cloneNode(true));

  if (screen === "trackingList") renderTrackingList();
  if (screen === "trackingDetail") renderTrackingDetail();
  if (screen === "auth") renderAuth();
  if (screen === "wcStart") renderWcStart();
  if (screen === "wcReview") renderWcReview();
  if (screen === "wcComplaint") renderWcComplaint();
  if (screen === "wcSuspect") renderWcSuspect();
  if (screen === "wcWorkspace") renderWcWorkspace();
  if (screen === "wcPreview") renderWcPreview();
  if (screen === "wcDone") document.querySelector("#wcFinalTime").textContent = formatElapsed();
  if (screen === "newUser") {
    renderForm(".profile-form", profileFields, state.reporter);
    renderSignupIdentity();
  }
  if (screen === "prereq") setupPrerequisites();
  if (screen === "financialWorkspace") renderFinancialWorkspace();
  if (screen === "preview") renderPreview();
  if (screen === "done") document.querySelector("#finalTime").textContent = formatElapsed();
  updateAuthButton();

  updateProgress(screen);
  window.scrollTo({ top: 0, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  requestAnimationFrame(() => {
    const heading = app.querySelector("h1, h2");
    if (heading) {
      heading.tabIndex = -1;
      heading.focus({ preventScroll: true });
    }
  });
}

function updateProgress(screen) {
  const journey = Object.values(progressGroups).find((group) => group.screens.includes(screen));
  if (!journey) {
    journeyProgress.classList.add("hidden");
    journeyProgress.replaceChildren();
    return;
  }
  const activeIndex = Math.max(0, journey.steps.findIndex(([, screensInStep]) => screensInStep.includes(screen)));
  journeyProgress.classList.remove("hidden");
  journeyProgress.replaceChildren(...journey.steps.map(([label], index) => {
    const step = document.createElement("span");
    step.className = `progress-step ${index < activeIndex ? "complete" : index === activeIndex ? "current" : ""}`;
    step.textContent = `${index + 1}. ${label}`;
    if (index === activeIndex) step.setAttribute("aria-current", "step");
    return step;
  }));
}

function updateAuthButton() {
  const button = document.querySelector("#authButton");
  if (!button) return;
  button.textContent = state.auth.isSignedIn ? `Signed in: ${state.auth.mobile || state.reporter.mobile}` : "Login / Sign up";
}

function makeControl([key, label, type = "text", options, settings = {}], values, className = "") {
  const wrapper = document.createElement("label");
  if (className) wrapper.className = className;
  wrapper.textContent = label;

  let field;
  if (type === "select") {
    field = document.createElement("select");
    options.forEach((option) => {
      const item = document.createElement("option");
      item.value = option;
      item.textContent = option;
      field.append(item);
    });
  } else if (type === "fixed") {
    field = document.createElement("input");
    field.readOnly = true;
  } else {
    field = document.createElement("input");
    field.type = type;
  }

  field.dataset.field = key;
  field.value = values[key] ?? "";
  field.id = `${state.current}-${key}`;
  if (!settings.optional && !["policeStation", "delayReason", "suspectAddress", "reference", "people", "nature", "email", "tehsil", "colony"].includes(key) && !key.startsWith("suspect") && !state.current.toLowerCase().includes("suspect")) {
    field.required = true;
    wrapper.append(document.createTextNode(" "));
    const required = document.createElement("small");
    required.textContent = "Required";
    wrapper.append(required);
  }
  wrapper.append(field);
  return wrapper;
}

function renderForm(selector, fields, values, className = "") {
  const form = document.querySelector(selector);
  form.replaceChildren(...fields.map((field) => makeControl(field, values, className)));
}

function collectForm(selector, target) {
  document.querySelectorAll(`${selector} [data-field]`).forEach((field) => {
    target[field.dataset.field] = field.value.trim();
  });
}

function validateRequired(selector) {
  const fields = Array.from(document.querySelectorAll(`${selector} [required]`));
  fields.forEach((field) => field.setAttribute("aria-invalid", String(!field.value.trim())));
  const invalid = fields.find((field) => !field.value.trim());
  if (!invalid) return true;
  showMessage("Please complete the highlighted required field.");
  invalid.focus();
  return false;
}

function findTrackingRequest(ack) {
  return trackingRequests.find((request) => request.ack.toLowerCase() === String(ack).trim().toLowerCase());
}

function releaseDocument(document) {
  if (document?.previewUrl) URL.revokeObjectURL(document.previewUrl);
}

function retainIdentityDocument(role, file, type, demo = false) {
  releaseDocument(state.documents[role]);
  state.documents[role] = {
    type,
    name: file?.name || `Synthetic ${type} sample.pdf`,
    size: file?.size || 0,
    file: file || null,
    previewUrl: file ? URL.createObjectURL(file) : "",
    mimeType: file?.type || "application/pdf",
    demo,
  };
}

function retainEvidenceDocuments(files) {
  state.documents.evidence.forEach(releaseDocument);
  state.documents.evidence = files.map((file) => ({
    type: "Evidence",
    name: file.name,
    size: file.size,
    file,
    previewUrl: URL.createObjectURL(file),
    mimeType: file.type,
    demo: false,
  }));
}

function retainWcEvidenceDocuments(files) {
  state.documents.wcEvidence.forEach(releaseDocument);
  state.documents.wcEvidence = files.map((file) => ({
    type: "Evidence",
    name: file.name,
    size: file.size,
    file,
    previewUrl: URL.createObjectURL(file),
    mimeType: file.type,
    demo: false,
  }));
}

function renderDocumentDisplay(selector, docInfo, emptyText = "No document attached") {
  const holder = typeof selector === "string" ? document.querySelector(selector) : selector;
  if (!holder) return;
  holder.replaceChildren();
  if (!docInfo) {
    const empty = document.createElement("p");
    empty.className = "document-empty";
    empty.textContent = emptyText;
    holder.append(empty);
    return;
  }

  const card = document.createElement("article");
  card.className = "document-card";
  if (docInfo.previewUrl && docInfo.mimeType?.startsWith("image/")) {
    const image = document.createElement("img");
    image.src = docInfo.previewUrl;
    image.alt = `Preview of ${docInfo.name}`;
    card.append(image);
  } else {
    const icon = document.createElement("span");
    icon.className = "document-icon";
    icon.setAttribute("aria-hidden", "true");
    icon.textContent = "ID";
    card.append(icon);
  }
  const details = document.createElement("div");
  const name = document.createElement("strong");
  const meta = document.createElement("small");
  name.textContent = docInfo.name;
  meta.textContent = `${docInfo.type}${docInfo.size ? ` · ${Math.max(1, Math.round(docInfo.size / 1024))} KB` : " · Sample document"}`;
  details.append(name, meta);
  card.append(details);
  if (docInfo.previewUrl) {
    const view = document.createElement("a");
    view.href = docInfo.previewUrl;
    view.target = "_blank";
    view.rel = "noopener";
    view.textContent = "View";
    card.append(view);
  }
  holder.append(card);
}

function renderSignupIdentity() {
  const type = document.querySelector("#reporterIdentityType");
  if (state.documents.reporter?.type) type.value = state.documents.reporter.type;
  renderDocumentDisplay("#signupIdentityDocument", state.documents.reporter, "Upload a synthetic identity document to continue.");
}

function renderAuth() {
  renderForm(".auth-profile-form", profileFields, state.reporter);
  const mobile = document.querySelector("#authMobileInput");
  mobile.value = state.auth.mobile || state.reporter.mobile || "";
  if (state.auth.otpSent) document.querySelector("#authOtpArea").classList.remove("hidden");
  const type = document.querySelector("#authIdentityType");
  if (state.documents.reporter?.type) type.value = state.documents.reporter.type;
  renderDocumentDisplay("#authIdentityDocument", state.documents.reporter, "Use a synthetic identity document or sample details.");
}

function setupPrerequisites() {
  const files = document.querySelector("#evidenceUpload");
  const audio = document.querySelector("#financialAudioUpload");
  const text = document.querySelector("#financialPastedText");
  const selected = document.querySelector("#selectedFinancialFiles");
  const prepare = document.querySelector("#prepareFinancialButton");
  const demo = document.querySelector('[data-action="mock-evidence-and-continue"]');
  const identityStatus = document.querySelector("#reporterIdentityReadiness");
  const reporterDocument = state.documents.reporter;
  identityStatus.textContent = reporterDocument
    ? `Reporter identity ready: ${reporterDocument.type}`
    : "Reporter identity document is still required";
  identityStatus.classList.toggle("readiness-missing", !reporterDocument);

  const update = () => {
    const fileList = [...files.files, ...audio.files];
    selected.textContent = fileList.length
      ? fileList.map((file) => `${file.name} (${Math.max(1, Math.round(file.size / 1024))} KB)`).join(", ")
      : "No files selected";
    const hasInput = files.files.length > 0 || audio.files.length > 0 || text.value.trim().length > 0;
    prepare.disabled = (!hasInput && !state.financial.evidenceReady) || !reporterDocument;
    demo.disabled = !reporterDocument;
    if (state.financial.evidenceReady && !hasInput) prepare.textContent = "Continue to report";
  };

  files.addEventListener("change", update);
  audio.addEventListener("change", update);
  text.addEventListener("input", update);
  update();
}

function sectionMarkup(section) {
  if (section === "myDetails") {
    const otherPersonFields = state.financial.reportFor === "other" ? `
      <section class="person-group" aria-labelledby="victimDetailsHeading">
        <div class="person-group-heading">
          <div><p class="eyebrow">Affected person</p><h3 id="victimDetailsHeading">Their details</h3></div>
          <span class="role-badge">Victim</span>
        </div>
        <label>Relationship to the affected person
          <select id="relationshipToVictim" required>
            <option value="">Choose relationship</option>
            <option>Parent or guardian</option>
            <option>Spouse or partner</option>
            <option>Family member</option>
            <option>Friend</option>
            <option>Authorised representative</option>
            <option>Other</option>
          </select>
        </label>
        <div class="form-grid victim-form"></div>
        <div class="identity-row">
          <label>Identity document type
            <select id="victimIdentityType">
              <option value="Aadhaar">Aadhaar</option>
              <option value="PAN card">PAN card</option>
              <option value="Driving licence">Driving licence</option>
              <option value="Voter ID">Voter ID</option>
            </select>
          </label>
          <label>Attach synthetic affected-person ID
            <input id="victimIdentityUpload" type="file" accept="image/*,.pdf" />
          </label>
        </div>
        <div id="victimIdentityDocument" class="document-display"></div>
        <label class="inline-check consent-check"><input id="victimConsent" type="checkbox" /> I confirm I have consent or appropriate authority to prepare this report for this person.</label>
      </section>
    ` : "";
    return `
      <p class="eyebrow">Section 1 of 3</p>
      <h2>Personal Details</h2>
      <p class="section-intro">First tell us who was affected. This keeps the logged-in reporter separate from the victim when they are different people.</p>
      <fieldset class="report-for-choice">
        <legend>Who was affected?</legend>
        <label><input type="radio" name="reportFor" value="self" ${state.financial.reportFor === "self" ? "checked" : ""} /> Me</label>
        <label><input type="radio" name="reportFor" value="other" ${state.financial.reportFor === "other" ? "checked" : ""} /> Another person</label>
      </fieldset>
      <section class="person-group" aria-labelledby="reporterDetailsHeading">
        <div class="person-group-heading">
          <div><p class="eyebrow">Logged-in reporter</p><h3 id="reporterDetailsHeading">Your details</h3></div>
          <span class="role-badge">${state.financial.reportFor === "self" ? "Reporter and victim" : "Reporter"}</span>
        </div>
        <div class="form-grid complainant-form workspace-profile-form"></div>
        <div id="reporterIdentityDocument" class="document-display"></div>
      </section>
      ${otherPersonFields}
      <div class="section-actions">
        <button class="primary" type="button" data-action="continue-report-section" data-section="incidentDetails">Save and continue</button>
      </div>
    `;
  }
  if (section === "incidentDetails") {
    return `
      <p class="eyebrow">Section 2 of 3</p>
      <h2>Incident Details</h2>
      <div id="financialExtractionMode" class="mode-badge">AI prepared · Needs your review</div>
      <p class="support-note">Check the amount and UTR carefully. AI can make mistakes, and every field remains editable.</p>
      <section class="retained-evidence" aria-labelledby="retainedEvidenceHeading">
        <h3 id="retainedEvidenceHeading">Attached evidence</h3>
        <div id="incidentEvidenceDocuments" class="document-grid"></div>
      </section>
      <h3 class="form-section-title">What happened</h3>
      <div class="form-grid complaint-form"></div>
      <label class="wide-field">Incident description
        <textarea id="incidentDescription" minlength="200" maxlength="1500"></textarea>
        <small id="descriptionCount">0 / 200 minimum</small>
      </label>
      <div class="section-heading-row">
        <h3 class="form-section-title">Transactions</h3>
        <button class="link-button" type="button" data-action="add-workspace-transaction">Add transaction</button>
      </div>
      <div id="transactionForms"></div>
      <div class="section-actions">
        <button class="secondary" type="button" data-action="change-report-section" data-section="myDetails">Back</button>
        <button class="primary" type="button" data-action="continue-report-section" data-section="suspectDetails">Save and continue</button>
      </div>
    `;
  }
  return `
    <p class="eyebrow">Section 3 of 3 · Optional</p>
    <h2>Suspect Details</h2>
    <p class="section-intro">Share only what you know. You can skip this section without blocking the report.</p>
    <label class="inline-check"><input id="shareSuspect" type="checkbox" /> I have suspect details to share</label>
    <div class="form-grid suspect-form muted-section"></div>
    <div class="section-actions">
      <button class="secondary" type="button" data-action="change-report-section" data-section="incidentDetails">Back</button>
      <button class="primary" type="button" data-action="preview-financial-report">Preview report</button>
    </div>
  `;
}

function renderFinancialWorkspace() {
  const content = document.querySelector("#reportSectionContent");
  content.innerHTML = sectionMarkup(state.financial.activeSection);
  document.querySelectorAll("[data-report-section]").forEach((button) => {
    const section = button.dataset.reportSection;
    const current = section === state.financial.activeSection;
    button.classList.toggle("current", current);
    button.classList.toggle("complete", state.financial.completedSections.includes(section));
    if (current) button.setAttribute("aria-current", "step");
  });

  if (state.financial.activeSection === "myDetails") {
    renderForm(".workspace-profile-form", profileFields, state.reporter);
    renderDocumentDisplay("#reporterIdentityDocument", state.documents.reporter, "Reporter identity document is required.");
    if (state.financial.reportFor === "other") {
      renderForm(".victim-form", victimFields, state.victim);
      document.querySelector("#relationshipToVictim").value = state.financial.relationshipToVictim;
      document.querySelector("#victimConsent").checked = state.financial.consentConfirmed;
      if (state.documents.victim?.type) document.querySelector("#victimIdentityType").value = state.documents.victim.type;
      renderDocumentDisplay("#victimIdentityDocument", state.documents.victim, "Affected person’s identity document is required.");
    }
  } else if (state.financial.activeSection === "incidentDetails") {
    updateModeBadge("#financialExtractionMode", state.ai.financial);
    renderForm(".complaint-form", complaintFields, state.complaint);
    const description = document.querySelector("#incidentDescription");
    description.value = state.complaint.description || draftDescription();
    updateDescriptionCount();
    description.addEventListener("input", updateDescriptionCount);
    renderTransactionForms();
    applyTransactionConfidence();
    renderEvidenceDocuments();
  } else {
    renderSuspect();
  }
}

function renderEvidenceDocuments() {
  const holder = document.querySelector("#incidentEvidenceDocuments");
  if (!holder) return;
  holder.replaceChildren();
  if (!state.documents.evidence.length) {
    const empty = document.createElement("p");
    empty.className = "document-empty";
    empty.textContent = state.ai.financial.mode === "demo_fallback" ? "Synthetic evidence sample" : "Evidence was provided as pasted text.";
    holder.append(empty);
    return;
  }
  state.documents.evidence.forEach((item) => {
    const slot = document.createElement("div");
    holder.append(slot);
    renderDocumentDisplay(slot, item);
  });
}

function wcSectionMarkup(section) {
  if (section === "personalDetails") {
    const signedIn = state.wc.mode === "login" && state.auth.isSignedIn;
    return `
      <p class="eyebrow">Section 1 of 2</p>
      <h2>Personal Details</h2>
      <aside class="danger-card" aria-label="Immediate danger guidance">
        <strong>Are you or someone else in immediate danger?</strong>
        <span>Call India’s emergency number <a href="tel:112">112</a>. This prototype cannot provide emergency help.</span>
      </aside>
      <p class="section-intro">${signedIn ? "Your signed-in details are prefilled. You can still choose how much contact information appears in this report." : "You can stay anonymous. Add contact details only if you want them included in this prototype report."}</p>
      <fieldset class="report-for-choice">
        <legend>How do you want to file?</legend>
        <label><input type="radio" name="wcModeChoice" value="anonymous" ${state.wc.mode === "anonymous" ? "checked" : ""} /> Anonymous</label>
        <label><input type="radio" name="wcModeChoice" value="login" ${state.wc.mode === "login" ? "checked" : ""} /> Use signed-in details</label>
      </fieldset>
      <div class="form-grid wc-personal-form"></div>
      <div class="section-actions">
        <button class="primary" type="button" data-action="continue-wc-section" data-section="incidentDetails">Save and continue</button>
      </div>
    `;
  }
  return `
    <p class="eyebrow">Section 2 of 2</p>
    <h2>Incident Details</h2>
    <div id="wcExtractionMode" class="mode-badge">AI prepared · Needs your review</div>
    <p class="support-note">Everything below is editable. AI can make mistakes, and you can remove anything that does not feel safe to include.</p>
    <section class="retained-evidence" aria-labelledby="wcRetainedEvidenceHeading">
      <h3 id="wcRetainedEvidenceHeading">Attached evidence</h3>
      <div id="wcEvidenceDocuments" class="document-grid"></div>
    </section>
    <h3 class="form-section-title">Evidence summary</h3>
    <div class="form-grid wc-evidence-form"></div>
    <label class="wide-field">Sequence of events
      <textarea id="wcTimeline"></textarea>
    </label>
    <h3 class="form-section-title">Complaint details</h3>
    <div class="form-grid wc-complaint-form"></div>
    <label class="wide-field">Additional information about the incident
      <textarea id="wcDescription" minlength="200" maxlength="1500"></textarea>
      <small id="wcDescriptionCount">0 / 200 minimum</small>
    </label>
    <div class="section-actions">
      <button class="secondary" type="button" data-action="change-wc-section" data-section="personalDetails">Back</button>
      <button class="secondary" type="button" data-action="speak-wc-guidance">Read guidance aloud</button>
      <button class="primary" type="button" data-action="preview-wc-report">Preview report</button>
    </div>
  `;
}

function renderWcWorkspace() {
  const content = document.querySelector("#wcSectionContent");
  content.innerHTML = wcSectionMarkup(state.wc.activeSection);
  document.querySelectorAll("[data-wc-section]").forEach((button) => {
    const section = button.dataset.wcSection;
    const current = section === state.wc.activeSection;
    button.classList.toggle("current", current);
    button.classList.toggle("complete", state.wc.completedSections.includes(section));
    if (current) button.setAttribute("aria-current", "step");
  });

  if (state.wc.activeSection === "personalDetails") {
    const fields = [
      ["shareIdentity", "Share identity in this report?", "select", ["No", "Yes"]],
      ["name", "Name", "text", undefined, { optional: state.wc.mode === "anonymous" }],
      ["mobile", "Mobile No.", "tel", undefined, { optional: true }],
      ["email", "Email ID", "email", undefined, { optional: true }],
      ["state", "State / UT"],
      ["district", "District"],
    ];
    if (state.wc.mode === "login" && state.auth.isSignedIn) {
      state.wc.personal = {
        ...state.wc.personal,
        shareIdentity: "Yes",
        name: state.reporter.name,
        mobile: state.auth.mobile || state.reporter.mobile,
        email: state.reporter.email,
        state: state.reporter.state,
        district: state.reporter.district,
      };
    }
    renderForm(".wc-personal-form", fields, state.wc.personal);
  } else {
    updateModeBadge("#wcExtractionMode", state.ai.womenChildren);
    renderForm(".wc-evidence-form", wcEvidenceFields, state.wc.evidence);
    document.querySelector("#wcTimeline").value = state.wc.evidence.timeline || "";
    renderForm(".wc-complaint-form", wcComplaintFields, state.wc.complaint);
    const description = document.querySelector("#wcDescription");
    description.value = state.wc.complaint.description || draftWcDescription();
    updateWcDescriptionCount();
    description.addEventListener("input", updateWcDescriptionCount);
    renderWcEvidenceDocuments();
  }
}

function renderWcEvidenceDocuments() {
  const holder = document.querySelector("#wcEvidenceDocuments");
  if (!holder) return;
  holder.replaceChildren();
  if (!state.documents.wcEvidence.length) {
    const empty = document.createElement("p");
    empty.className = "document-empty";
    empty.textContent = state.ai.womenChildren.mode === "demo_fallback" ? "Synthetic evidence sample" : "Evidence was provided as pasted text.";
    holder.append(empty);
    return;
  }
  state.documents.wcEvidence.forEach((item) => {
    const slot = document.createElement("div");
    holder.append(slot);
    renderDocumentDisplay(slot, item);
  });
}

function saveWcSection(section, validate = true) {
  if (section === "personalDetails") {
    collectForm(".wc-personal-form", state.wc.personal);
    if (validate && state.wc.personal.shareIdentity === "Yes" && !state.wc.personal.name.trim()) {
      showMessage("Add a name or choose not to share identity.");
      document.querySelector('[data-field="name"]')?.focus();
      return false;
    }
  } else {
    if (validate && (!validateRequired(".wc-evidence-form") || !validateRequired(".wc-complaint-form"))) return false;
    collectForm(".wc-evidence-form", state.wc.evidence);
    state.wc.evidence.timeline = document.querySelector("#wcTimeline").value.trim();
    collectForm(".wc-complaint-form", state.wc.complaint);
    state.wc.complaint.description = document.querySelector("#wcDescription").value.trim();
    if (validate && state.wc.complaint.description.length < 200) {
      showMessage("Additional information must be at least 200 characters.");
      document.querySelector("#wcDescription")?.focus();
      return false;
    }
  }
  if (validate && !state.wc.completedSections.includes(section)) state.wc.completedSections.push(section);
  return true;
}

function changeWcSection(nextSection, validateCurrent = true) {
  if (!saveWcSection(state.wc.activeSection, validateCurrent)) return;
  state.wc.activeSection = nextSection;
  render("wcWorkspace");
}

function applyTransactionConfidence() {
  const firstCard = document.querySelector(".transaction-card");
  if (!firstCard) return;
  firstCard.querySelectorAll("[data-field]").forEach((field) => {
    const key = field.dataset.field;
    if ((state.ai.financial.confidence[key] ?? 1) < 0.75 || state.ai.financial.needsReview.includes(key)) {
      field.closest("label")?.classList.add("confidence-low");
    }
  });
}

function saveFinancialSection(section, validate = true) {
  if (section === "myDetails") {
    if (validate && !validateRequired(".workspace-profile-form")) return false;
    collectForm(".workspace-profile-form", state.reporter);
    if (validate && !state.documents.reporter) {
      showMessage("Attach the reporter’s synthetic identity document before continuing.");
      document.querySelector("#reporterIdentityDocument")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return false;
    }
    if (state.financial.reportFor === "self" && validate) {
      state.victim = { ...state.reporter };
    } else {
      if (validate && !validateRequired(".victim-form")) return false;
      collectForm(".victim-form", state.victim);
      const relationship = document.querySelector("#relationshipToVictim");
      const consent = document.querySelector("#victimConsent");
      state.financial.relationshipToVictim = relationship?.value || "";
      state.financial.consentConfirmed = Boolean(consent?.checked);
      relationship?.setAttribute("aria-invalid", String(!state.financial.relationshipToVictim));
      if (validate && !state.financial.relationshipToVictim) {
        showMessage("Choose your relationship to the affected person.");
        relationship?.focus();
        return false;
      }
      if (validate && !state.documents.victim) {
        showMessage("Attach a synthetic identity document for the affected person.");
        document.querySelector("#victimIdentityUpload")?.focus();
        return false;
      }
      if (validate && !state.financial.consentConfirmed) {
        showMessage("Confirm consent or authority to prepare this report.");
        consent?.focus();
        return false;
      }
    }
  } else if (section === "incidentDetails") {
    if (validate && (!validateRequired(".complaint-form") || !validateRequired("#transactionForms"))) return false;
    syncComplaint();
    syncTransactions();
    if (validate && state.complaint.description.length < 200) {
      showMessage("Incident description must be at least 200 characters.");
      document.querySelector("#incidentDescription")?.focus();
      return false;
    }
  } else {
    state.suspect.hasDetails = document.querySelector("#shareSuspect").checked;
    collectForm(".suspect-form", state.suspect);
  }
  if (validate && !state.financial.completedSections.includes(section)) state.financial.completedSections.push(section);
  return true;
}

function changeFinancialSection(nextSection, validateCurrent = true) {
  if (!saveFinancialSection(state.financial.activeSection, validateCurrent)) return;
  state.financial.activeSection = nextSection;
  render("financialWorkspace");
}

function renderExtraction() {
  updateModeBadge("#financialExtractionMode", state.ai.financial);
  const body = document.querySelector("#transactionReview");
  const transaction = state.transactions[0];
  body.replaceChildren(
    ...transactionFields.map(([key, label, type, options]) => {
      const row = document.createElement("tr");
      const heading = document.createElement("td");
      heading.textContent = label;
      const value = document.createElement("td");
      const control = makeControl([key, label, type, options], transaction);
      if ((state.ai.financial.confidence[key] ?? 1) < 0.75 || state.ai.financial.needsReview.includes(key)) {
        value.classList.add("confidence-low");
        const note = document.createElement("small");
        note.textContent = "Please check this value";
        control.append(note);
      }
      value.append(control);
      row.append(heading, value);
      return row;
    })
  );
}

function renderComplaint() {
  renderForm(".complaint-form", complaintFields, state.complaint);
  const description = document.querySelector("#incidentDescription");
  description.value = state.complaint.description || draftDescription();
  updateDescriptionCount();
  description.addEventListener("input", updateDescriptionCount);
}

function renderTransactionForms() {
  const holder = document.querySelector("#transactionForms");
  holder.replaceChildren();
  state.transactions.forEach((transaction, index) => {
    const card = document.createElement("section");
    card.className = "transaction-card";
    const title = document.createElement("h3");
    title.textContent = `Transaction ${index + 1}`;
    const grid = document.createElement("div");
    grid.className = "form-grid";
    transactionFields.forEach((field) => grid.append(makeControl(field, transaction)));
    card.append(title, grid);
    holder.append(card);
  });
}

function renderSuspect() {
  renderForm(".suspect-form", suspectFields, state.suspect);
  const checkbox = document.querySelector("#shareSuspect");
  const form = document.querySelector(".suspect-form");
  checkbox.checked = state.suspect.hasDetails;
  form.classList.toggle("active", checkbox.checked);
  checkbox.addEventListener("change", () => {
    state.suspect.hasDetails = checkbox.checked;
    form.classList.toggle("active", checkbox.checked);
  });
}

function renderWcStart() {
  const label = document.querySelector("#wcModeLabel");
  label.textContent = state.wc.mode === "anonymous" ? "Anonymous report" : "Signed-in report";
}

function renderWcReview() {
  updateModeBadge("#wcExtractionMode", state.ai.womenChildren);
  renderForm(".wc-evidence-form", wcEvidenceFields, state.wc.evidence);
  document.querySelector("#wcTimeline").value = state.wc.evidence.timeline || "";
}

function updateModeBadge(selector, aiState) {
  const badge = document.querySelector(selector);
  if (!badge) return;
  const isLive = aiState.mode === "live_openai";
  badge.textContent = isLive ? "AI prepared · Needs your review" : "Synthetic sample · Needs your review";
  badge.classList.toggle("demo", !isLive);
}

function renderWcComplaint() {
  if (!state.wc.complaint.description) state.wc.complaint.description = draftWcDescription();
  renderForm(".wc-complaint-form", wcComplaintFields, state.wc.complaint);
  const description = document.querySelector("#wcDescription");
  description.value = state.wc.complaint.description;
  updateWcDescriptionCount();
  description.addEventListener("input", updateWcDescriptionCount);
}

function renderWcSuspect() {
  renderForm(".wc-suspect-form", wcSuspectFields, state.wc.suspect);
  const checkbox = document.querySelector("#wcShareSuspect");
  const form = document.querySelector(".wc-suspect-form");
  const photo = document.querySelector("#wcSuspectPhoto");
  checkbox.checked = state.wc.suspect.hasDetails;
  form.classList.toggle("active", checkbox.checked);
  photo.classList.toggle("active", checkbox.checked);
  checkbox.addEventListener("change", () => {
    state.wc.suspect.hasDetails = checkbox.checked;
    form.classList.toggle("active", checkbox.checked);
    photo.classList.toggle("active", checkbox.checked);
  });
}

function renderWcPreview() {
  const preview = document.querySelector("#wcPreviewContent");
  preview.replaceChildren(
    previewCard("Personal Details", state.wc.mode === "anonymous" ? {
      Mode: "Anonymous report",
      "Identity shared": state.wc.personal.shareIdentity,
      State: state.wc.personal.state,
      District: state.wc.personal.district,
      Name: state.wc.personal.shareIdentity === "Yes" ? state.wc.personal.name : "Not shared",
      Mobile: state.wc.personal.shareIdentity === "Yes" ? state.wc.personal.mobile || "Not provided" : "Not shared",
      Email: state.wc.personal.shareIdentity === "Yes" ? state.wc.personal.email || "Not provided" : "Not shared",
    } : {
      Mode: "Signed-in report",
      Name: state.wc.personal.name || state.reporter.name,
      Mobile: state.wc.personal.mobile || state.auth.mobile || state.reporter.mobile,
      Email: state.wc.personal.email || state.reporter.email,
      State: state.wc.personal.state,
      District: state.wc.personal.district,
    }, "personalDetails"),
    previewCard("Incident Details", {
      Category: state.wc.complaint.category,
      "Incident date": state.wc.complaint.date,
      Time: state.wc.complaint.time,
      "Reason for delay": state.wc.complaint.delayReason || "Not provided",
      "State / UT": state.wc.complaint.state,
      District: state.wc.complaint.district,
      "Police Station": state.wc.complaint.policeStation || "Not provided",
      "Occurred at": state.wc.complaint.occurredAt,
      Description: state.wc.complaint.description,
    }, "incidentDetails"),
    previewCard("Evidence summary", {
      Platform: state.wc.evidence.platform,
      "Visible people/usernames": state.wc.evidence.people,
      "Nature of content": state.wc.evidence.nature,
      Timeline: state.wc.evidence.timeline,
      "Attached files": state.documents.wcEvidence.length ? state.documents.wcEvidence.map((file) => file.name).join(", ") : "Synthetic or pasted evidence",
    }, "incidentDetails")
  );
  preview.querySelectorAll(".preview-edit").forEach((button) => {
    button.dataset.action = "edit-wc-section";
  });
}

function renderTrackingList() {
  const list = document.querySelector("#trackingList");
  list.replaceChildren(
    ...trackingRequests.map((request) => {
      const card = document.createElement("button");
      card.type = "button";
      card.className = "request-card";
      card.dataset.action = "open-tracking-detail";
      card.dataset.ack = request.ack;
      card.innerHTML = `
        <span class="status-pill">${request.status}</span>
        <strong>${request.type}</strong>
        <small>${request.ack}</small>
        <span>Submitted ${request.submitted}</span>
      `;
      return card;
    })
  );
}

function renderTrackingDetail() {
  const request = findTrackingRequest(state.tracking.selectedAck) || trackingRequests[0];
  document.querySelector("#trackingDetailTitle").textContent = request.ack;
  const content = document.querySelector("#trackingDetailContent");
  content.replaceChildren(
    trackingStatusCard(request),
    previewCard("Request details", {
      "Complaint type": request.type,
      "Submitted on": request.submitted,
      "Last updated": request.updated,
      "Next expected action": request.next,
    }),
    trackingTimelineCard(request.timeline)
  );
}

function renderTrackingLookupResult(request, enteredAck) {
  const result = document.querySelector("#trackingLookupResult");
  if (!request) {
    result.replaceChildren(
    previewCard("Not found in sample data", {
        "Entered number": enteredAck || "Not provided",
        "Try one of these": trackingRequests.map((item) => item.ack).join(", "),
      })
    );
    return;
  }

  result.replaceChildren(
    trackingStatusCard(request),
    previewCard("Request details", {
      "Complaint type": request.type,
      "Submitted on": request.submitted,
      "Last updated": request.updated,
      "Next expected action": request.next,
    }),
    trackingTimelineCard(request.timeline)
  );
}

function trackingStatusCard(request) {
  const card = document.createElement("section");
  card.className = "preview-card status-card";
  card.innerHTML = `
    <h3>Current status</h3>
    <span class="status-pill large">${request.status}</span>
    <p>${request.ack}</p>
  `;
  return card;
}

function trackingTimelineCard(items) {
  const card = document.createElement("section");
  card.className = "preview-card";
  const heading = document.createElement("h3");
  heading.textContent = "Status timeline";
  const list = document.createElement("ol");
  list.className = "timeline";
  items.forEach((item) => {
    const entry = document.createElement("li");
    entry.textContent = item;
    list.append(entry);
  });
  card.append(heading, list);
  return card;
}

function renderPreview() {
  const preview = document.querySelector("#previewContent");
  preview.replaceChildren(
    previewCard("Filed By", {
      Name: state.reporter.name,
      Mobile: state.reporter.mobile,
      Email: state.reporter.email || "Not provided",
      Gender: state.reporter.gender,
      "Date of Birth": state.reporter.dob,
      "Father / Mother / Spouse": `${state.reporter.relationType}: ${state.reporter.relationName}`,
      Address: [state.reporter.house, state.reporter.street, state.reporter.colony, state.reporter.city, state.reporter.district, state.reporter.state, state.reporter.pincode].filter(Boolean).join(", "),
      "Identity document": state.documents.reporter ? `${state.documents.reporter.type} attached` : "Missing",
    }, "myDetails"),
    previewCard("Affected Person", state.financial.reportFor === "self" ? {
      Status: "Same as the logged-in reporter",
      Name: state.reporter.name,
      "Identity document": `${state.documents.reporter?.type || "Identity"} attached`,
    } : {
      Name: state.victim.name,
      Mobile: state.victim.mobile || "Not provided",
      Email: state.victim.email || "Not provided",
      "Date of Birth": state.victim.dob,
      Address: [state.victim.house, state.victim.street, state.victim.colony, state.victim.city, state.victim.district, state.victim.state, state.victim.pincode].filter(Boolean).join(", "),
      Relationship: state.financial.relationshipToVictim,
      "Consent / authority": state.financial.consentConfirmed ? "Confirmed" : "Not confirmed",
      "Identity document": state.documents.victim ? `${state.documents.victim.type} attached` : "Missing",
    }, "myDetails"),
    previewCard("Incident Details", {
      Category: state.complaint.category,
      "Sub-category": state.complaint.subCategory,
      "Incident date": state.complaint.incidentDate,
      "Incident time": state.complaint.incidentTime,
      Delay: state.complaint.delay,
      "Occurred at": state.complaint.occurredAt,
      Description: state.complaint.description,
    }, "incidentDetails"),
    previewCard("Transactions", Object.fromEntries(state.transactions.map((transaction, index) => [
      `Transaction ${index + 1}`,
      `${transaction.amount} via ${transaction.wallet}, UTR ${transaction.utr}, ${transaction.date} ${transaction.time}`,
    ])), "incidentDetails"),
    previewCard("Suspect Details", state.suspect.hasDetails ? {
      Name: state.suspect.suspectName || "Not provided",
      "ID type": state.suspect.suspectIdType,
      "ID number": state.suspect.suspectId || "Not provided",
      Address: state.suspect.suspectAddress || "Not provided",
    } : { Status: "Skipped by citizen" }, "suspectDetails")
  );
}

function previewCard(title, values, editSection = "") {
  const card = document.createElement("section");
  card.className = "preview-card";
  const heading = document.createElement("h3");
  heading.textContent = title;
  const list = document.createElement("dl");

  Object.entries(values).forEach(([key, value]) => {
    const dt = document.createElement("dt");
    const dd = document.createElement("dd");
    dt.textContent = key;
    dd.textContent = value || "Not provided";
    list.append(dt, dd);
  });

  card.append(heading, list);
  if (editSection) {
    const edit = document.createElement("button");
    edit.type = "button";
    edit.className = "preview-edit";
    edit.dataset.action = "edit-report-section";
    edit.dataset.section = editSection;
    edit.textContent = `Edit ${title}`;
    card.append(edit);
  }
  return card;
}

function draftDescription() {
  const transaction = state.transactions[0];
  return `I am reporting an online financial fraud where an amount of INR ${transaction.amount} was debited through ${transaction.wallet} on ${transaction.date} at around ${transaction.time}. The visible transaction ID or UTR is ${transaction.utr}, and the reference number shown in the uploaded evidence is ${transaction.reference}. I did not authorize this fraudulent transfer and I am requesting urgent action to trace the recipient account, block further movement of funds, and register my complaint based on the attached evidence.`;
}

function draftWcDescription() {
  const evidence = state.wc.evidence;
  if (state.wc.entry === "manual") {
    return "I am submitting this report to request help with an online incident involving harmful or abusive content. I will provide the platform, approximate date and time, location details, and any suspect information I feel comfortable sharing. I request that the material, account, link, or profile be reviewed urgently and that appropriate action be taken based on the information provided in this prototype report.";
  }
  return `I am submitting this report based on the uploaded evidence from ${evidence.platform}. The screenshots appear to show ${evidence.nature.toLowerCase()} involving ${evidence.people}. The visible timestamps indicate activity around ${evidence.date} at ${evidence.time}. I request that the material, account, link, or group shown in the evidence be reviewed urgently and that appropriate action be taken. I have reviewed this AI-prepared draft and can edit any detail before submitting the prototype report.`;
}

function updateDescriptionCount() {
  const description = document.querySelector("#incidentDescription");
  const count = document.querySelector("#descriptionCount");
  count.textContent = `${description.value.length} / 200 minimum`;
  count.style.color = description.value.length >= 200 ? "var(--teal-dark)" : "var(--red)";
}

function updateWcDescriptionCount() {
  const description = document.querySelector("#wcDescription");
  const count = document.querySelector("#wcDescriptionCount");
  count.textContent = `${description.value.length} / 200 minimum`;
  count.style.color = description.value.length >= 200 ? "var(--teal-dark)" : "var(--red)";
}

function formatElapsed() {
  const seconds = Math.floor((Date.now() - state.startedAt) / 1000);
  const mins = String(Math.floor(seconds / 60)).padStart(2, "0");
  const secs = String(seconds % 60).padStart(2, "0");
  return `${mins}:${secs}`;
}

function showMessage(text) {
  const existing = document.querySelector(".toast");
  if (existing) existing.remove();
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = text;
  Object.assign(toast.style, {
    position: "fixed",
    right: "16px",
    bottom: "16px",
    zIndex: 50,
    maxWidth: "320px",
    padding: "13px 15px",
    background: "#0b4f4a",
    color: "white",
    borderRadius: "8px",
    boxShadow: "0 16px 36px rgba(0,0,0,0.18)",
    fontWeight: "800",
  });
  document.body.append(toast);
  globalStatus.textContent = text;
  setTimeout(() => toast.remove(), 2600);
}

function getFilesTotalBytes(...inputs) {
  return inputs.reduce((total, input) => total + Array.from(input?.files || []).reduce((sum, file) => sum + file.size, 0), 0);
}

function setProcessing(selector, message, isError = false) {
  const element = document.querySelector(selector);
  if (!element) return;
  element.textContent = message;
  element.classList.remove("hidden");
  element.classList.toggle("error", isError);
  globalStatus.textContent = message;
}

function assertUploadSize(...inputs) {
  if (getFilesTotalBytes(...inputs) > MAX_REQUEST_BYTES) {
    throw new Error("Files are over the 4 MB total limit. Please use a smaller file or paste the important text.");
  }
}

async function postForm(url, formData, timeoutMs = 45000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { method: "POST", body: formData, signal: controller.signal });
    const payload = await response.json().catch(() => null);
    if (!response.ok || !payload?.ok) throw new Error(payload?.message || "The AI service could not process this request.");
    return payload;
  } catch (error) {
    if (error.name === "AbortError") throw new Error("Processing took too long. You can use the synthetic sample instead.");
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

async function extractEvidence(flowType, fileInput, pastedText) {
  const formData = new FormData();
  formData.append("flowType", flowType);
  if (pastedText?.trim()) formData.append("pastedText", pastedText.trim());
  Array.from(fileInput?.files || []).forEach((file) => formData.append("files", file));
  return postForm("/api/extract-evidence", formData);
}

async function transcribeEvidence(flowType, audioInput) {
  if (!audioInput?.files?.[0]) return null;
  const formData = new FormData();
  formData.append("flowType", flowType);
  formData.append("audio", audioInput.files[0]);
  return postForm("/api/transcribe-audio", formData, 60000);
}

function applyFinancialExtraction(payload, transcription) {
  const data = payload.data || {};
  if (data.transaction) state.transactions = [{ ...state.transactions[0], ...data.transaction }];
  if (data.complaint) state.complaint = { ...state.complaint, ...data.complaint };
  if (transcription?.data?.draftDescription) state.complaint.description = transcription.data.draftDescription;
  state.ai.financial = {
    mode: transcription?.mode === "demo_fallback" ? "demo_fallback" : payload.mode,
    confidence: data.confidence || {},
    needsReview: data.needsReview || [],
  };
}

function applyWcExtraction(payload, transcription) {
  const data = payload.data || {};
  if (data.evidence) state.wc.evidence = { ...state.wc.evidence, ...data.evidence };
  if (data.complaint) state.wc.complaint = { ...state.wc.complaint, ...data.complaint };
  if (transcription?.data?.draftDescription) state.wc.complaint.description = transcription.data.draftDescription;
  state.wc.entry = "evidence";
  state.ai.womenChildren = {
    mode: transcription?.mode === "demo_fallback" ? "demo_fallback" : payload.mode,
    confidence: data.confidence || {},
    needsReview: data.needsReview || [],
  };
}

async function processFinancialEvidence() {
  const files = document.querySelector("#evidenceUpload");
  const audio = document.querySelector("#financialAudioUpload");
  const pastedText = document.querySelector("#financialPastedText").value;
  try {
    if (!state.documents.reporter) throw new Error("Complete the reporter identity step before preparing the report.");
    if (state.financial.evidenceReady && !files.files.length && !audio.files.length && !pastedText.trim()) {
      state.financial.activeSection = "myDetails";
      render("financialWorkspace");
      return;
    }
    assertUploadSize(files, audio);
    if (!files.files.length && !audio.files.length && !pastedText.trim()) {
      throw new Error("Add a file, paste a message, record a voice note, or choose “Use synthetic sample”.");
    }
    retainEvidenceDocuments([...files.files, ...audio.files]);
    setProcessing("#financialProcessingState", "Securely organising your evidence…");
    const transcription = await transcribeEvidence("financial", audio);
    const combinedText = [pastedText, transcription?.data?.transcript].filter(Boolean).join("\n\nVoice note transcript:\n");
    const extraction = await extractEvidence("financial", files, combinedText);
    applyFinancialExtraction(extraction, transcription);
    state.financial.evidenceReady = true;
    state.financial.activeSection = "myDetails";
    render("financialWorkspace");
    showMessage(extraction.message);
  } catch (error) {
    setProcessing("#financialProcessingState", error.message, true);
  }
}

async function processWcEvidence() {
  const files = document.querySelector("#wcEvidenceUpload");
  const audio = document.querySelector("#wcAudioUpload");
  const pastedText = document.querySelector("#wcPastedText").value;
  try {
    assertUploadSize(files, audio);
    if (!files.files.length && !audio.files.length && !pastedText.trim()) {
      throw new Error("Add something you already have, or choose “Use synthetic sample”.");
    }
    retainWcEvidenceDocuments([...files.files, ...audio.files]);
    setProcessing("#wcProcessingState", "Preparing a neutral draft. You stay in control…");
    const transcription = await transcribeEvidence("women_children", audio);
    const combinedText = [pastedText, transcription?.data?.transcript].filter(Boolean).join("\n\nVoice note transcript:\n");
    const extraction = await extractEvidence("women_children", files, combinedText);
    applyWcExtraction(extraction, transcription);
    state.wc.evidenceReady = true;
    state.wc.activeSection = "personalDetails";
    render("wcWorkspace");
    showMessage(extraction.message);
  } catch (error) {
    setProcessing("#wcProcessingState", error.message, true);
  }
}

async function processProfile() {
  const input = document.querySelector("#reporterIdentityUpload");
  const type = document.querySelector("#reporterIdentityType").value;
  await processProfileFrom(input, type, "#signupIdentityDocument", "newUser");
}

async function processProfileFrom(input, type, displaySelector, returnScreen) {
  try {
    assertUploadSize(input);
    if (!input.files.length) throw new Error("Choose a synthetic identity image or PDF, or use the sample.");
    retainIdentityDocument("reporter", input.files[0], type);
    const payload = await extractEvidence("profile", input, "");
    state.reporter = { ...state.reporter, ...(payload.data.profile || {}) };
    state.ai.profile.mode = payload.mode;
    render(returnScreen);
    showMessage("Profile fields prepared. The document is retained only for this browser session.");
  } catch (error) {
    renderDocumentDisplay(displaySelector, state.documents.reporter);
    showMessage(error.message);
  }
}

async function processVictimIdentity(input, type) {
  retainIdentityDocument("victim", input.files[0], type);
  renderDocumentDisplay("#victimIdentityDocument", state.documents.victim);
  try {
    assertUploadSize(input);
    const payload = await extractEvidence("profile", input, "");
    state.victim = payload.mode === "demo_fallback"
      ? { ...sampleVictim }
      : { ...state.victim, ...(payload.data.profile || {}) };
    state.ai.profile.mode = payload.mode;
    render("financialWorkspace");
    showMessage("Affected person’s details were prepared from the retained document. Please review them.");
  } catch (error) {
    showMessage(`${error.message} The document is retained; enter or review the details manually.`);
  }
}

async function speakText(text) {
  try {
    showMessage("Preparing audio guidance…");
    const response = await fetch("/api/text-to-speech", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, voiceStyle: "calm and reassuring" }),
    });
    const payload = await response.json();
    if (!response.ok || !payload.ok || !payload.data?.audioBase64) throw new Error(payload.message || "Audio is unavailable.");
    const audio = new Audio(`data:${payload.data.contentType || "audio/mpeg"};base64,${payload.data.audioBase64}`);
    await audio.play();
  } catch (error) {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.92;
      window.speechSynthesis.speak(utterance);
      showMessage("Using this device’s built-in voice for guidance.");
      return;
    }
    showMessage(`${error.message} The written guidance remains available.`);
  }
}

function loadPdfLibrary() {
  if (window.CyberSaathiPDF) return Promise.resolve(window.CyberSaathiPDF);
  return new Promise((resolve, reject) => {
    const existing = document.querySelector('script[data-pdf-library]');
    if (existing) {
      existing.addEventListener("load", () => resolve(window.CyberSaathiPDF), { once: true });
      existing.addEventListener("error", () => reject(new Error("PDF tools could not be loaded.")), { once: true });
      return;
    }
    const script = document.createElement("script");
    script.src = "pdf.bundle.js";
    script.dataset.pdfLibrary = "true";
    script.onload = () => resolve(window.CyberSaathiPDF);
    script.onerror = () => reject(new Error("PDF tools could not be loaded."));
    document.head.append(script);
  });
}

async function downloadReportPdf() {
  const PdfDocument = await loadPdfLibrary();
  if (!PdfDocument) throw new Error("PDF tools are unavailable.");
  const doc = new PdfDocument({ unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 18;
  const contentWidth = pageWidth - margin * 2;
  let y = 20;

  const ensureSpace = (height = 12) => {
    if (y + height <= pageHeight - 18) return;
    doc.addPage();
    y = 20;
  };
  const write = (text, options = {}) => {
    const size = options.size || 10;
    const style = options.style || "normal";
    const indent = options.indent || 0;
    const lines = doc.splitTextToSize(String(text || "Not provided"), contentWidth - indent);
    const lineHeight = size * 0.45;
    ensureSpace(lines.length * lineHeight + 3);
    doc.setFont("helvetica", style);
    doc.setFontSize(size);
    doc.setTextColor(options.muted ? 82 : 25, options.muted ? 98 : 40, options.muted ? 92 : 36);
    doc.text(lines, margin + indent, y);
    y += lines.length * lineHeight + (options.after ?? 3);
  };
  const section = (title) => {
    ensureSpace(18);
    y += 3;
    doc.setDrawColor(15, 118, 110);
    doc.setLineWidth(0.6);
    doc.line(margin, y, pageWidth - margin, y);
    y += 8;
    write(title, { size: 14, style: "bold", after: 5 });
  };
  const field = (label, value) => {
    write(label, { size: 8, style: "bold", muted: true, after: 1 });
    write(value || "Not provided", { size: 10, after: 4 });
  };

  doc.setFillColor(15, 118, 110);
  doc.rect(0, 0, pageWidth, 10, "F");
  write("CYBER CRIME REPORTING PORTAL", { size: 16, style: "bold", after: 2 });
  write("Independent hackathon prototype — not an official government report", { size: 9, muted: true, after: 6 });
  field("Sample acknowledgement", "NCCRP-FIN-2026-10482");
  field("Prepared on", state.financial.submittedAt || new Date().toLocaleString("en-IN"));

  section("Filed By");
  field("Name", state.reporter.name);
  field("Mobile", state.reporter.mobile);
  field("Email", state.reporter.email);
  field("Date of birth", state.reporter.dob);
  field("Address", [state.reporter.house, state.reporter.street, state.reporter.colony, state.reporter.city, state.reporter.district, state.reporter.state, state.reporter.pincode].filter(Boolean).join(", "));
  field("Identity document", state.documents.reporter ? `${state.documents.reporter.type} attached (document content excluded from PDF)` : "Missing");

  section("Affected Person");
  if (state.financial.reportFor === "self") {
    field("Reporting relationship", "Self");
    field("Name", state.reporter.name);
    field("Identity document", `${state.documents.reporter?.type || "Identity"} attached (document content excluded from PDF)`);
  } else {
    field("Name", state.victim.name);
    field("Mobile", state.victim.mobile || "Not provided");
    field("Email", state.victim.email || "Not provided");
    field("Date of birth", state.victim.dob);
    field("Address", [state.victim.house, state.victim.street, state.victim.colony, state.victim.city, state.victim.district, state.victim.state, state.victim.pincode].filter(Boolean).join(", "));
    field("Reporter relationship", state.financial.relationshipToVictim);
    field("Consent / authority", state.financial.consentConfirmed ? "Confirmed" : "Not confirmed");
    field("Identity document", state.documents.victim ? `${state.documents.victim.type} attached (document content excluded from PDF)` : "Missing");
  }

  section("Incident Details");
  field("Category", `${state.complaint.category} — ${state.complaint.subCategory}`);
  field("Incident date and time", `${state.complaint.incidentDate} ${state.complaint.incidentTime}`);
  field("Where it occurred", state.complaint.occurredAt);
  field("Incident description", state.complaint.description);
  state.transactions.forEach((transaction, index) => {
    write(`Transaction ${index + 1}`, { size: 11, style: "bold", after: 3 });
    field("Payment route", transaction.wallet);
    field("Account / UPI / wallet", transaction.account);
    field("Amount", `INR ${transaction.amount}`);
    field("UTR / Transaction ID", transaction.utr);
    field("Transaction date and time", `${transaction.date} ${transaction.time}`);
    field("Reference", transaction.reference);
  });

  section("Suspect Details");
  if (!state.suspect.hasDetails) {
    write("Skipped by the citizen.", { muted: true });
  } else {
    field("Name", state.suspect.suspectName);
    field("ID type", state.suspect.suspectIdType);
    field("ID number", state.suspect.suspectId);
    field("Address", state.suspect.suspectAddress);
  }

  ensureSpace(24);
  y += 8;
  write("This PDF was generated locally from synthetic prototype report data. No complaint was submitted to NCCRP.", { size: 9, style: "bold", muted: true });
  doc.save("Cyber-Crime-Reporting-Portal-sample-report-NCCRP-FIN-2026-10482.pdf");
  const status = document.querySelector("#pdfStatus");
  if (status) status.textContent = "PDF downloaded. It contains the report summary, not your uploaded files.";
}

function mockEvidence(index = 0) {
  state.transactions = [{ ...mockTransactions[index % mockTransactions.length] }];
  state.complaint.description = draftDescription();
  state.ai.financial = { mode: "demo_fallback", confidence: {}, needsReview: [] };
  if (!state.documents.evidence.length) {
    state.documents.evidence = [{
      type: "Evidence",
      name: "Synthetic-UPI-payment-screenshot.png",
      size: 0,
      file: null,
      previewUrl: "",
      mimeType: "image/png",
      demo: true,
    }];
  }
}

function syncExtraction() {
  document.querySelectorAll("#transactionReview [data-field]").forEach((field) => {
    state.transactions[0][field.dataset.field] = field.value.trim();
  });
}

function syncComplaint() {
  collectForm(".complaint-form", state.complaint);
  state.complaint.description = document.querySelector("#incidentDescription").value.trim();
}

function syncTransactions() {
  const cards = document.querySelectorAll(".transaction-card");
  state.transactions = Array.from(cards).map((card) => {
    const transaction = {};
    card.querySelectorAll("[data-field]").forEach((field) => {
      transaction[field.dataset.field] = field.value.trim();
    });
    return transaction;
  });
}

function mockWcEvidence(index = 0) {
  state.wc.entry = "evidence";
  state.wc.evidence = { ...wcEvidenceSamples[index % wcEvidenceSamples.length] };
  state.wc.complaint.category = state.wc.evidence.suggestedCategory;
  state.wc.complaint.date = state.wc.evidence.date;
  state.wc.complaint.time = state.wc.evidence.time;
  state.wc.complaint.occurredAt = state.wc.evidence.platform;
  state.wc.complaint.description = draftWcDescription();
  state.ai.womenChildren = { mode: "demo_fallback", confidence: {}, needsReview: [] };
  if (!state.documents.wcEvidence.length) {
    state.documents.wcEvidence = [{
      type: "Evidence",
      name: "Synthetic-safety-screenshot.png",
      size: 0,
      file: null,
      previewUrl: "",
      mimeType: "image/png",
      demo: true,
    }];
  }
}

function syncWcReview() {
  collectForm(".wc-evidence-form", state.wc.evidence);
  state.wc.evidence.timeline = document.querySelector("#wcTimeline").value.trim();
  state.wc.complaint.category = state.wc.evidence.suggestedCategory;
  state.wc.complaint.date = state.wc.evidence.date;
  state.wc.complaint.time = state.wc.evidence.time;
  state.wc.complaint.occurredAt = state.wc.evidence.platform;
  state.wc.complaint.description = draftWcDescription();
}

function syncWcComplaint() {
  collectForm(".wc-complaint-form", state.wc.complaint);
  state.wc.complaint.description = document.querySelector("#wcDescription").value.trim();
}

function resetWcManualComplaint() {
  state.wc.entry = "manual";
  state.wc.evidence = {
    suggestedCategory: "Sexually Obscene Material",
    platform: "Other",
    date: "2026-08-27",
    time: "19:20",
    people: "Not provided",
    nature: "Not provided",
    timeline: "No evidence was uploaded in the manual path.",
  };
  state.wc.complaint = {
    category: "Sexually Obscene Material",
    date: "2026-08-27",
    time: "19:20",
    delayReason: "",
    state: "Delhi",
    district: "South Delhi",
    policeStation: "",
    occurredAt: "Other",
    description: "",
  };
  state.wc.complaint.description = draftWcDescription();
}

async function handleAction(action, target) {
  if (action === "go-home") {
    if (!state.auth.isSignedIn) releaseDocument(state.documents.reporter);
    releaseDocument(state.documents.victim);
    state.documents.evidence.forEach(releaseDocument);
    state.documents.wcEvidence.forEach(releaseDocument);
    state.documents = { reporter: state.auth.isSignedIn ? state.documents.reporter : null, victim: null, evidence: [], wcEvidence: [] };
    state.startedAt = Date.now();
    state.financial.evidenceReady = false;
    state.financial.activeSection = "myDetails";
    state.financial.completedSections = [];
    state.financial.submittedAt = "";
    state.financial.reportFor = "self";
    state.financial.relationshipToVictim = "";
    state.financial.consentConfirmed = false;
    if (!state.auth.isSignedIn) state.reporter = { ...sampleProfile };
    state.victim = { ...sampleVictim };
    state.complaint = {
      category: "Online Financial Fraud",
      subCategory: "UPI Related Frauds",
      incidentDate: "2026-08-27",
      incidentTime: "10:45",
      delay: "No",
      occurredAt: "UPI payment app",
      description: "",
    };
    state.transactions = [{ ...mockTransactions[0] }];
    state.suspect = { hasDetails: false, suspectName: "", suspectIdType: "UPI ID", suspectId: "", suspectAddress: "" };
    render("home");
    return;
  }
  if (action === "open-auth") {
    state.returnAfterAuth = state.current;
    render("auth");
    return;
  }
  if (action === "auth-back") {
    render(state.returnAfterAuth || "home");
    return;
  }
  if (action === "send-auth-otp") {
    const mobile = document.querySelector("#authMobileInput").value.trim();
    if (!/^\d{10}$/.test(mobile)) {
      showMessage("Enter a 10-digit mobile number.");
      return;
    }
    state.auth.mobile = mobile;
    state.reporter.mobile = mobile;
    state.auth.otpSent = true;
    document.querySelector("#authOtpArea").classList.remove("hidden");
    showMessage("Mocked OTP generated: 123456");
    return;
  }
  if (action === "process-auth-profile") {
    const upload = document.querySelector("#authIdentityUpload");
    const signupUpload = document.querySelector("#reporterIdentityUpload");
    if (signupUpload && upload?.files?.[0]) {
      const transfer = new DataTransfer();
      transfer.items.add(upload.files[0]);
      signupUpload.files = transfer.files;
    }
    await processProfileFrom(upload, document.querySelector("#authIdentityType").value, "#authIdentityDocument", "auth");
    return;
  }
  if (action === "fill-auth-profile") {
    const otpValue = document.querySelector("#authOtpInput")?.value || "";
    state.reporter = { ...sampleProfile, mobile: state.auth.mobile || sampleProfile.mobile };
    retainIdentityDocument("reporter", null, document.querySelector("#authIdentityType")?.value || "Aadhaar", true);
    render("auth");
    const otpInput = document.querySelector("#authOtpInput");
    if (otpInput) otpInput.value = otpValue;
    showMessage("Synthetic identity sample added.");
    return;
  }
  if (action === "complete-auth") {
    if (!state.auth.otpSent && !/^\d{10}$/.test(document.querySelector("#authMobileInput").value.trim())) {
      showMessage("Verify a 10-digit mobile number first.");
      return;
    }
    if (document.querySelector("#authOtpArea:not(.hidden)") && document.querySelector("#authOtpInput").value.trim() !== "123456") {
      showMessage("Use mocked OTP 123456.");
      return;
    }
    if (!validateRequired(".auth-profile-form")) return;
    if (!state.documents.reporter) {
      showMessage("Add a synthetic identity document or use the sample.");
      return;
    }
    collectForm(".auth-profile-form", state.reporter);
    state.auth.isSignedIn = true;
    state.auth.mobile = state.auth.mobile || state.reporter.mobile;
    if (state.returnAfterAuth === "wcWorkspace") state.wc.mode = "login";
    showMessage("You are signed in for this session.");
    render(state.returnAfterAuth && state.returnAfterAuth !== "auth" ? state.returnAfterAuth : "home");
    return;
  }
  if (action === "start-financial-report") {
    if (state.auth.isSignedIn) {
      state.financial.entry = "existing";
      render("prereq");
    } else {
      render("userType");
    }
    return;
  }
  if (action === "start-wc-report") {
    render("womenChildren");
    return;
  }
  if (action === "open-tracking-list") {
    if (state.auth.isSignedIn) render("trackingList");
    else {
      state.returnAfterAuth = "trackingList";
      render("auth");
    }
    return;
  }
  if (action === "fill-sample-ack") {
    document.querySelector("#ackInput").value = trackingRequests[0].ack;
    renderTrackingLookupResult(trackingRequests[0], trackingRequests[0].ack);
    return;
  }
  if (action === "lookup-ack") {
    const enteredAck = document.querySelector("#ackInput").value.trim();
    const request = findTrackingRequest(enteredAck);
    if (request) state.tracking.selectedAck = request.ack;
    renderTrackingLookupResult(request, enteredAck);
    return;
  }
  if (action === "send-tracking-otp") {
    const mobile = document.querySelector("#trackingMobileInput").value.trim();
    if (!/^\d{10}$/.test(mobile)) {
      showMessage("Enter a 10-digit mobile number.");
      return;
    }
    state.tracking.loginMobile = mobile;
    document.querySelector("#trackingOtpArea").classList.remove("hidden");
    showMessage("Mock OTP generated: 123456");
    return;
  }
  if (action === "verify-tracking-otp") {
    if (document.querySelector("#trackingOtpInput").value.trim() !== "123456") {
      showMessage("Use mocked OTP 123456.");
      return;
    }
    state.auth.isSignedIn = true;
    state.auth.mobile = state.tracking.loginMobile;
    retainIdentityDocument("reporter", null, "Voter ID", true);
    render("trackingList");
    return;
  }
  if (action === "open-tracking-detail") {
    state.tracking.selectedAck = target.dataset.ack;
    state.tracking.returnTo = state.current === "trackingList" ? "trackingList" : "trackingLookup";
    render("trackingDetail");
    return;
  }
  if (action === "tracking-detail-back") {
    render(state.tracking.returnTo || "trackingHome");
    return;
  }
  if (action === "start-wc-anonymous") {
    state.wc.mode = "anonymous";
    state.wc.loginMobile = "";
    state.wc.personal.shareIdentity = "No";
    render("wcStart");
    return;
  }
  if (action === "start-wc-signed-in") {
    if (!state.auth.isSignedIn) {
      state.returnAfterAuth = "womenChildren";
      render("auth");
      return;
    }
    state.wc.mode = "login";
    state.wc.loginMobile = state.auth.mobile;
    render("wcStart");
    return;
  }
  if (action === "send-wc-otp") {
    const mobile = document.querySelector("#wcMobileInput").value.trim();
    if (!/^\d{10}$/.test(mobile)) {
      showMessage("Enter a 10-digit mobile number.");
      return;
    }
    state.wc.loginMobile = mobile;
    document.querySelector("#wcOtpArea").classList.remove("hidden");
    showMessage("Mock OTP generated: 123456");
    return;
  }
  if (action === "verify-wc-otp") {
    if (document.querySelector("#wcOtpInput").value.trim() !== "123456") {
      showMessage("Use mocked OTP 123456.");
      return;
    }
    state.wc.mode = "login";
    state.auth.isSignedIn = true;
    state.auth.mobile = state.wc.loginMobile;
    render("wcStart");
    return;
  }
  if (action === "start-wc-manual") {
    resetWcManualComplaint();
    state.wc.evidenceReady = true;
    state.wc.activeSection = "personalDetails";
    render("wcWorkspace");
    return;
  }
  if (action === "wc-complaint-back") {
    render(state.wc.entry === "evidence" ? "wcReview" : "wcStart");
    return;
  }
  if (action === "mock-wc-evidence") {
    mockWcEvidence();
    state.wc.evidenceReady = true;
    state.wc.activeSection = "personalDetails";
    render("wcWorkspace");
    return;
  }
  if (action === "process-wc-evidence") {
    await processWcEvidence();
    return;
  }
  if (action === "speak-wc-guidance") {
    await speakText("You are in control. Review each prepared detail, change anything that is incorrect, and share only what feels safe.");
    return;
  }
  if (action === "refresh-wc-evidence") {
    const next = state.wc.evidence.platform === wcEvidenceSamples[0].platform ? 1 : 0;
    mockWcEvidence(next);
    render("wcReview");
    return;
  }
  if (action === "save-wc-review") {
    if (!validateRequired(".wc-evidence-form")) return;
    syncWcReview();
    render("wcComplaint");
    return;
  }
  if (action === "change-wc-section") {
    changeWcSection(target.dataset.section, false);
    return;
  }
  if (action === "continue-wc-section") {
    changeWcSection(target.dataset.section, true);
    return;
  }
  if (action === "preview-wc-report") {
    if (!saveWcSection("incidentDetails", true)) return;
    render("wcPreview");
    return;
  }
  if (action === "edit-wc-section") {
    state.wc.activeSection = target.dataset.section || "personalDetails";
    render("wcWorkspace");
    return;
  }
  if (action === "save-wc-complaint") {
    if (!validateRequired(".wc-complaint-form")) return;
    syncWcComplaint();
    if (state.wc.complaint.description.length < 200) {
      showMessage("Additional information must be at least 200 characters.");
      return;
    }
    render("wcSuspect");
    return;
  }
  if (action === "save-wc-suspect") {
    state.wc.suspect.hasDetails = document.querySelector("#wcShareSuspect").checked;
    collectForm(".wc-suspect-form", state.wc.suspect);
    render("wcPreview");
    return;
  }
  if (action === "submit-wc-report") {
    if (!document.querySelector("#wcCertify").checked) {
      showMessage("Please confirm the certification checkbox.");
      return;
    }
    render("wcDone");
    return;
  }
  if (action === "start-existing-financial") {
    state.financial.entry = "existing";
    state.financial.reportFor = "self";
    retainIdentityDocument("reporter", null, "Voter ID", true);
    render("existingLogin");
    return;
  }
  if (action === "start-new-financial") {
    state.financial.entry = "new";
    state.financial.reportFor = "self";
    releaseDocument(state.documents.reporter);
    releaseDocument(state.documents.victim);
    state.documents.reporter = null;
    state.documents.victim = null;
    render("newUser");
    return;
  }
  if (action === "send-otp") {
    const mobile = document.querySelector("#mobileInput").value.trim();
    if (!/^\d{10}$/.test(mobile)) {
      showMessage("Enter a 10-digit mobile number.");
      return;
    }
    state.reporter.mobile = mobile;
    document.querySelector("#otpArea").classList.remove("hidden");
    showMessage("Mock OTP generated: 123456");
    return;
  }
  if (action === "verify-otp") {
    if (document.querySelector("#otpInput").value.trim() !== "123456") {
      showMessage("Use mocked OTP 123456.");
      return;
    }
    state.financial.entry = "existing";
    state.auth.isSignedIn = true;
    state.auth.mobile = state.reporter.mobile;
    if (!state.documents.reporter) retainIdentityDocument("reporter", null, "Aadhaar", true);
    render("prereq");
    return;
  }
  if (action === "mock-aadhaar" || action === "fill-profile") {
    state.reporter = { ...sampleProfile };
    retainIdentityDocument("reporter", null, document.querySelector("#reporterIdentityType")?.value || "Aadhaar", true);
    render("newUser");
    showMessage(action === "mock-aadhaar" ? "Aadhaar fields extracted from a synthetic sample." : "Sample profile filled.");
    return;
  }
  if (action === "process-profile") {
    await processProfile();
    return;
  }
  if (action === "save-profile") {
    if (!validateRequired(".profile-form")) return;
    if (!state.documents.reporter) {
      showMessage("Attach a synthetic identity document or use the synthetic sample.");
      document.querySelector("#reporterIdentityUpload")?.focus();
      return;
    }
    collectForm(".profile-form", state.reporter);
    state.financial.entry = "new";
    render("prereq");
    return;
  }
  if (action === "financial-prereq-back") {
    render(state.financial.entry === "new" ? "newUser" : "existingLogin");
    return;
  }
  if (action === "mock-evidence-and-continue") {
    if (!state.documents.reporter) {
      showMessage("Complete the reporter identity step before using the synthetic evidence sample.");
      return;
    }
    mockEvidence();
    state.financial.evidenceReady = true;
    state.financial.activeSection = "myDetails";
    render("financialWorkspace");
    return;
  }
  if (action === "process-financial-evidence") {
    await processFinancialEvidence();
    return;
  }
  if (action === "change-report-section") {
    changeFinancialSection(target.dataset.section, false);
    return;
  }
  if (action === "back-to-evidence") {
    saveFinancialSection(state.financial.activeSection, false);
    render("prereq");
    return;
  }
  if (action === "continue-report-section") {
    changeFinancialSection(target.dataset.section, true);
    return;
  }
  if (action === "add-workspace-transaction") {
    saveFinancialSection("incidentDetails", false);
    state.transactions.push({ ...mockTransactions[state.transactions.length % mockTransactions.length] });
    render("financialWorkspace");
    return;
  }
  if (action === "preview-financial-report") {
    if (!saveFinancialSection("suspectDetails", true)) return;
    const missingSection = ["myDetails", "incidentDetails"].find((section) => !state.financial.completedSections.includes(section));
    if (missingSection) {
      state.financial.activeSection = missingSection;
      render("financialWorkspace");
      showMessage("Complete this required section before previewing the report.");
      return;
    }
    render("preview");
    return;
  }
  if (action === "edit-report-section") {
    state.financial.activeSection = target.dataset.section || "myDetails";
    render("financialWorkspace");
    return;
  }
  if (action === "submit-report") {
    if (!document.querySelector("#certify").checked) {
      showMessage("Please confirm the certification checkbox.");
      return;
    }
    state.financial.submittedAt = new Date().toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
    render("done");
    return;
  }
  if (action === "download-report-pdf") {
    try {
      target.disabled = true;
      target.textContent = "Preparing PDF…";
      await downloadReportPdf();
      target.textContent = "Download report again";
    } catch (error) {
      target.textContent = "Try PDF download again";
      showMessage(error.message);
    } finally {
      target.disabled = false;
    }
    return;
  }
}

document.addEventListener("click", (event) => {
  const target = event.target.closest("button");
  if (!target) return;
  if (target.dataset.next) render(target.dataset.next);
  if (target.dataset.action) handleAction(target.dataset.action, target);
  if (target.dataset.reportSection) changeFinancialSection(target.dataset.reportSection, false);
  if (target.dataset.wcSection) changeWcSection(target.dataset.wcSection, false);
});

document.addEventListener("change", async (event) => {
  const target = event.target;
  if (target.matches('input[name="reportFor"]')) {
    saveFinancialSection("myDetails", false);
    state.financial.reportFor = target.value;
    state.financial.completedSections = state.financial.completedSections.filter((section) => section !== "myDetails");
    render("financialWorkspace");
    return;
  }
  if (target.matches('input[name="wcModeChoice"]')) {
    if (target.value === "login" && !state.auth.isSignedIn) {
      state.returnAfterAuth = "wcWorkspace";
      render("auth");
      return;
    }
    saveWcSection("personalDetails", false);
    state.wc.mode = target.value;
    state.wc.completedSections = state.wc.completedSections.filter((section) => section !== "personalDetails");
    render("wcWorkspace");
    return;
  }
  if (target.id === "victimIdentityUpload" && target.files?.[0]) {
    const type = document.querySelector("#victimIdentityType").value;
    await processVictimIdentity(target, type);
    return;
  }
  if (target.id === "victimIdentityType" && state.documents.victim) {
    state.documents.victim.type = target.value;
    renderDocumentDisplay("#victimIdentityDocument", state.documents.victim);
  }
});

render("home");
