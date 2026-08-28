const app = document.querySelector("#app");
const journeyProgress = document.querySelector("#journeyProgress");
const globalStatus = document.querySelector("#globalStatus");

const MAX_REQUEST_BYTES = 4 * 1024 * 1024;
const progressGroups = {
  financial: {
    screens: ["userType", "existingLogin", "newUser", "signup", "prereq", "financialWorkspace", "preview", "done"],
    steps: [
      ["Start", ["userType", "existingLogin", "newUser", "signup"]],
      ["Add evidence", ["prereq"]],
      ["Fill report", ["financialWorkspace"]],
      ["Finish", ["preview", "done"]],
    ],
  },
  womenChildren: {
    screens: ["womenChildren", "wcLogin", "wcStart", "wcEvidence", "wcWorkspace", "wcPreview", "wcDone"],
    steps: [
      ["Start", ["womenChildren", "wcLogin"]],
      ["Add evidence", ["wcStart", "wcEvidence"]],
      ["Fill report", ["wcWorkspace"]],
      ["Finish", ["wcPreview", "wcDone"]],
    ],
  },
};

const screens = {
  login: "login-template",
  signup: "signup-template",
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
  ["date", "Approximate date of incident / receiving / viewing of content", "date"],
  ["time", "Approximate time", "time"],
  ["delayReason", "Reason for delay in reporting", "text", undefined, { optional: true }],
  ["state", "State / UT"],
  ["district", "District"],
  ["policeStation", "Police Station", "text", undefined, { optional: true }],
  ["occurredAt", "Where did the incident occur?", "select", ["Email", "Facebook", "Instagram", "Snapchat", "Twitter", "WhatsApp", "Website URL", "YouTube", "LinkedIn", "Telegram", "Other"]],
];

const wcSuspectIdTypes = [
  "Mobile No.",
  "Email",
  "Driving Licence",
  "Aadhaar",
  "PAN",
  "Voter ID",
  "Passport",
  "Username",
  "Profile URL",
  "Other",
];

function emptySuspectDetails() {
  return {
    suspectName: "",
    identities: [],
    draftIdType: "Driving Licence",
    draftIdNumber: "",
    photoName: "",
    otherInfo: "",
  };
}

function emptyWcSuspect() {
  return emptySuspectDetails();
}

function activeSuspectStore() {
  return state.current === "financialWorkspace" ? state.suspect : state.wc.suspect;
}

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
    otpVerified: false,
    profileReady: false,
    mode: "login",
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
    ...emptySuspectDetails(),
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
    suspect: emptyWcSuspect(),
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
  if (screen === "login") renderLogin();
  if (screen === "signup") renderSignup();
  if (screen === "wcStart") {
    renderWcStart();
    setupWcPrerequisites();
  }
  if (screen === "wcReview") renderWcReview();
  if (screen === "wcComplaint") renderWcComplaint();
  if (screen === "wcSuspect") renderWcSuspect();
  if (screen === "wcWorkspace") renderWcWorkspace();
  if (screen === "wcPreview") renderWcPreview();
  if (screen === "wcDone") document.querySelector("#wcFinalTime").textContent = formatElapsed();
  if (screen === "newUser") renderNewUser();
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
  const controls = document.querySelector("#authControls");
  if (!controls) return;
  if (state.auth.isSignedIn) {
    controls.innerHTML = `<button id="authButton" class="auth-button" type="button" data-action="open-login">Signed in: ${state.auth.mobile || state.reporter.mobile}</button>`;
    return;
  }
  controls.innerHTML = `
    <button id="loginButton" class="auth-button" type="button" data-action="open-login">Login</button>
    <button id="signupButton" class="auth-button" type="button" data-action="open-signup">Sign up</button>
  `;
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
  showMessage("Please complete the highlighted required field.", "error");
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
    name: file?.name || `${type} sample.pdf`,
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
  renderDocumentDisplay("#signupIdentityDocument", state.documents.reporter, "Upload an identity document to continue.");
}

function renderNewUser() {
  renderSignupIdentity();
  const profileArea = document.querySelector("#newUserProfileArea");
  if (state.auth.profileReady) {
    profileArea?.classList.remove("hidden");
    renderForm(".profile-form", profileFields, state.reporter);
  } else {
    profileArea?.classList.add("hidden");
  }
}

function renderLogin() {
  const mobile = document.querySelector("#loginMobileInput");
  mobile.value = state.auth.mobile || "";
  if (state.auth.otpSent) document.querySelector("#loginOtpArea").classList.remove("hidden");
}

function renderSignup() {
  const mobile = document.querySelector("#signupMobileInput");
  mobile.value = state.auth.mobile || state.reporter.mobile || "";
  if (state.auth.otpSent) document.querySelector("#signupOtpArea").classList.remove("hidden");
  const identityArea = document.querySelector("#signupIdentityArea");
  const profileArea = document.querySelector("#signupProfileArea");
  const step1Badge = document.querySelector("#signupStep1Badge");
  const step1Controls = [
    mobile,
    document.querySelector("#sendSignupOtpButton"),
    document.querySelector("#signupOtpInput"),
    document.querySelector("#verifySignupOtpButton"),
  ];
  if (state.auth.otpVerified) {
    step1Controls.forEach((el) => {
      if (el) el.disabled = true;
    });
    step1Badge?.classList.remove("hidden");
    identityArea.classList.remove("hidden");
    const type = document.querySelector("#signupIdentityType");
    if (state.documents.reporter?.type) type.value = state.documents.reporter.type;
    renderDocumentDisplay("#signupAuthIdentityDocument", state.documents.reporter, "Upload an identity document to continue.");
    requestAnimationFrame(() => {
      identityArea.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
        block: "start",
      });
    });
  } else {
    step1Controls.forEach((el) => {
      if (el) el.disabled = false;
    });
    step1Badge?.classList.add("hidden");
    identityArea.classList.add("hidden");
  }
  if (state.auth.profileReady) {
    profileArea.classList.remove("hidden");
    renderForm(".signup-profile-form", profileFields, state.reporter);
  } else {
    profileArea.classList.add("hidden");
  }
}

function setupPrerequisites() {
  const files = document.querySelector("#evidenceUpload");
  const audio = document.querySelector("#financialAudioUpload");
  const text = document.querySelector("#financialPastedText");
  const selected = document.querySelector("#selectedFinancialFiles");
  const prepare = document.querySelector("#prepareFinancialButton");
  const demo = document.querySelector('[data-action="mock-evidence-and-continue"]');
  const manual = document.querySelector("#manualFinancialButton");
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
    if (manual) manual.disabled = !reporterDocument;
    if (state.financial.evidenceReady && !hasInput) prepare.textContent = "Continue to report";
    else prepare.textContent = "Upload and create report";
  };

  files.addEventListener("change", update);
  audio.addEventListener("change", update);
  text.addEventListener("input", update);
  update();
}

function setupWcPrerequisites() {
  const files = document.querySelector("#wcEvidenceUpload");
  const audio = document.querySelector("#wcAudioUpload");
  const text = document.querySelector("#wcPastedText");
  const selected = document.querySelector("#selectedWcFiles");
  const prepare = document.querySelector("#prepareWcButton");
  if (!files || !prepare) return;

  const update = () => {
    const fileList = [...files.files, ...(audio?.files || [])];
    if (selected) {
      selected.textContent = fileList.length
        ? fileList.map((file) => `${file.name} (${Math.max(1, Math.round(file.size / 1024))} KB)`).join(", ")
        : "No files selected";
    }
    const hasInput = files.files.length > 0 || (audio?.files?.length || 0) > 0 || (text?.value.trim().length || 0) > 0;
    prepare.disabled = !hasInput && !state.wc.evidenceReady;
    if (state.wc.evidenceReady && !hasInput) prepare.textContent = "Continue to report";
    else prepare.textContent = "Upload and create report";
  };

  files.addEventListener("change", update);
  audio?.addEventListener("change", update);
  text?.addEventListener("input", update);
  update();
}

function sectionMarkup(section) {
  if (section === "myDetails") {
    const reportingUserBlock = `
      <div class="person-group-heading">
        <div><p class="eyebrow">Reporting user</p><h3 id="reporterDetailsHeading">Your details</h3></div>
        <span class="role-badge">${state.financial.reportFor === "self" ? "Reporter and victim" : "Reporter"}</span>
      </div>
      <div class="form-grid complainant-form workspace-profile-form"></div>
      <div id="reporterIdentityDocument" class="document-display"></div>
    `;
    const reporterSection = state.financial.reportFor === "other"
      ? `<details class="person-group reporting-user-details">
          <summary class="person-group-heading reporting-user-summary">
            <div><p class="eyebrow">Reporting user</p><strong>Your details</strong></div>
            <span class="role-badge">Reporter</span>
          </summary>
          <div class="form-grid complainant-form workspace-profile-form"></div>
          <div id="reporterIdentityDocument" class="document-display"></div>
        </details>`
      : `<section class="person-group" aria-labelledby="reporterDetailsHeading">${reportingUserBlock}</section>`;
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
          <label>Attach affected-person ID
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
      <p class="section-intro">First tell us who was affected. This keeps the reporting user separate from the victim when they are different people.</p>
      <fieldset class="report-for-choice">
        <legend>Who was affected?</legend>
        <label><input type="radio" name="reportFor" value="self" ${state.financial.reportFor === "self" ? "checked" : ""} /> Me</label>
        <label><input type="radio" name="reportFor" value="other" ${state.financial.reportFor === "other" ? "checked" : ""} /> Another person</label>
      </fieldset>
      ${reporterSection}
      ${otherPersonFields}
      <div class="section-actions">
        <button class="secondary" type="button" data-action="back-to-evidence">Back</button>
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
    <div id="financialSuspectFields" class="muted-section">
      ${suspectDetailsFieldsMarkup()}
    </div>
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
    empty.textContent = state.ai.financial.mode === "demo_fallback" ? "Sample evidence" : "Evidence was provided as pasted text.";
    holder.append(empty);
    return;
  }
  state.documents.evidence.forEach((item) => {
    const slot = document.createElement("div");
    holder.append(slot);
    renderDocumentDisplay(slot, item);
  });
}

function wcWorkspaceSections() {
  if (state.wc.mode === "login" && state.auth.isSignedIn) {
    return [
      ["personalDetails", "Personal Details", "About you"],
      ["incidentDetails", "Incident Details", "What happened"],
      ["suspectDetails", "Suspect Details", "Optional information"],
    ];
  }
  return [
    ["incidentDetails", "Incident Details", "What happened"],
    ["suspectDetails", "Suspect Details", "Optional information"],
  ];
}

function wcDefaultSection() {
  return state.wc.mode === "login" && state.auth.isSignedIn ? "personalDetails" : "incidentDetails";
}

function suspectDetailsFieldsMarkup() {
  const idOptions = wcSuspectIdTypes.map((type) => `<option value="${type}">${type}</option>`).join("");
  return `
    <label>Suspect Name
      <input id="wcSuspectName" type="text" autocomplete="off" />
    </label>
    <div class="suspect-id-row">
      <label>ID Type
        <select id="wcSuspectIdType">${idOptions}</select>
      </label>
      <label id="wcSuspectIdNumberWrap">
        <span id="wcSuspectIdNumberLabel">Driving licence number</span>
        <input id="wcSuspectIdNumber" type="text" autocomplete="off" />
      </label>
      <button class="secondary" type="button" data-action="add-wc-suspect-id">ADD</button>
    </div>
    <ul id="wcSuspectIdentityList" class="suspect-identity-list" aria-label="Added suspect identifiers"></ul>
    <label class="wide-field">Please upload any photograph of suspect
      <input id="wcSuspectPhotoUpload" type="file" accept=".jpg,.jpeg,.png,image/jpeg,image/png" />
      <small>Upload JPG/JPEG/PNG file of max 5 MB.</small>
    </label>
    <p id="wcSuspectPhotoName" class="selected-files">No file chosen</p>
    <button class="secondary" type="button" data-action="upload-wc-suspect-photo">Upload</button>
    <label class="wide-field">Any other information / details
      <textarea id="wcSuspectOtherInfo" maxlength="250" rows="4"></textarea>
      <small id="wcSuspectOtherCount">Maximum of 250 characters - 250 characters left.</small>
    </label>
  `;
}

function wcSectionMarkup(section) {
  const sections = wcWorkspaceSections();
  const index = Math.max(0, sections.findIndex(([id]) => id === section));
  const total = sections.length;
  const eyebrow = `Section ${index + 1} of ${total}`;

  if (section === "personalDetails") {
    return `
      <p class="eyebrow">${eyebrow}</p>
      <h2>Personal Details</h2>
      <aside class="danger-card" aria-label="Immediate danger guidance">
        <strong>Are you or someone else in immediate danger?</strong>
        <span>Call India’s emergency number <a href="tel:112">112</a>. This prototype cannot provide emergency help.</span>
      </aside>
      <p class="section-intro">Your signed-in details are prefilled. You can still choose how much contact information appears in this report.</p>
      <div class="form-grid wc-personal-form"></div>
      <div class="section-actions">
        <button class="secondary" type="button" data-action="back-to-wc-evidence">Back</button>
        <button class="primary" type="button" data-action="continue-wc-section" data-section="incidentDetails">Save and continue</button>
      </div>
    `;
  }

  if (section === "suspectDetails") {
    const backSection = "incidentDetails";
    return `
      <p class="eyebrow">${eyebrow}</p>
      <h2>Suspect Details</h2>
      <p class="support-note">Please share the details of the suspect. Any information provided will be kept confidential and may help during the investigation.</p>
      ${suspectDetailsFieldsMarkup()}
      <div class="section-actions">
        <button class="secondary" type="button" data-action="change-wc-section" data-section="${backSection}">Back</button>
        <button class="primary" type="button" data-action="preview-wc-report">Preview report</button>
      </div>
    `;
  }

  const backSection = state.wc.mode === "login" && state.auth.isSignedIn ? "personalDetails" : "";
  return `
    <p class="eyebrow">${eyebrow}</p>
    <h2>Incident Details</h2>
    <p class="support-note">Kindly fill in the form with details of the crime. Share only what feels safe.</p>
    <div class="form-grid wc-complaint-form"></div>
    <label class="wide-field">Please provide any additional information about the incident
      <textarea id="wcDescription" minlength="200" maxlength="1500"></textarea>
      <small id="wcDescriptionCount">Insert at least 200 characters. Maximum 1500.</small>
    </label>
    <div class="section-actions">
      ${backSection
    ? `<button class="secondary" type="button" data-action="change-wc-section" data-section="${backSection}">Back</button>`
    : `<button class="secondary" type="button" data-action="back-to-wc-evidence">Back</button>`}
      <button class="primary" type="button" data-action="continue-wc-section" data-section="suspectDetails">Save and continue</button>
    </div>
  `;
}

function renderWcWorkspace() {
  const allowed = wcWorkspaceSections().map(([id]) => id);
  if (!allowed.includes(state.wc.activeSection)) state.wc.activeSection = wcDefaultSection();

  const nav = document.querySelector("#wcSectionNav");
  nav.replaceChildren(...wcWorkspaceSections().map(([id, label, hint], index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.dataset.wcSection = id;
    button.innerHTML = `<span>${index + 1}</span><strong>${label}</strong><small>${hint}</small>`;
    return button;
  }));
  const help = document.querySelector("#wcSidebarHelp");
  if (help) {
    help.textContent = state.wc.mode === "login" && state.auth.isSignedIn
      ? "Review your signed-in details, then the incident and any suspect information."
      : "You can stay anonymous. Share only what feels safe.";
  }

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
      ["name", "Name"],
      ["mobile", "Mobile No.", "tel", undefined, { optional: true }],
      ["email", "Email ID", "email", undefined, { optional: true }],
      ["state", "State / UT"],
      ["district", "District"],
    ];
    state.wc.personal = {
      ...state.wc.personal,
      shareIdentity: "Yes",
      name: state.reporter.name,
      mobile: state.auth.mobile || state.reporter.mobile,
      email: state.reporter.email,
      state: state.reporter.state,
      district: state.reporter.district,
    };
    renderForm(".wc-personal-form", fields, state.wc.personal);
  } else if (state.wc.activeSection === "suspectDetails") {
    renderWcSuspect();
  } else {
    renderForm(".wc-complaint-form", wcComplaintFields, state.wc.complaint);
    const description = document.querySelector("#wcDescription");
    description.value = state.wc.complaint.description || draftWcDescription();
    updateWcDescriptionCount();
    description.addEventListener("input", updateWcDescriptionCount);
  }
}

function renderWcEvidenceDocuments() {
  const holder = document.querySelector("#wcEvidenceDocuments");
  if (!holder) return;
  holder.replaceChildren();
  if (!state.documents.wcEvidence.length) {
    const empty = document.createElement("p");
    empty.className = "document-empty";
    empty.textContent = state.ai.womenChildren.mode === "demo_fallback" ? "Sample evidence" : "Evidence was provided as pasted text.";
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
      showMessage("Add a name or choose not to share identity.", "error");
      document.querySelector('[data-field="name"]')?.focus();
      return false;
    }
  } else if (section === "suspectDetails") {
    collectWcSuspectSection();
  } else if (section === "incidentDetails") {
    if (validate && !validateRequired(".wc-complaint-form")) return false;
    collectForm(".wc-complaint-form", state.wc.complaint);
    state.wc.complaint.description = document.querySelector("#wcDescription").value.trim();
    if (validate && state.wc.complaint.description.length < 200) {
      showMessage("Additional information must be at least 200 characters.", "error");
      document.querySelector("#wcDescription")?.focus();
      return false;
    }
  }
  if (validate && !state.wc.completedSections.includes(section)) state.wc.completedSections.push(section);
  return true;
}

function changeWcSection(nextSection, validateCurrent = true) {
  const allowed = wcWorkspaceSections().map(([id]) => id);
  if (!allowed.includes(nextSection)) nextSection = wcDefaultSection();
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
      showMessage("Attach the reporter’s identity document before continuing.", "error");
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
        showMessage("Choose your relationship to the affected person.", "error");
        relationship?.focus();
        return false;
      }
      if (validate && !state.documents.victim) {
        showMessage("Attach an identity document for the affected person.", "error");
        document.querySelector("#victimIdentityUpload")?.focus();
        return false;
      }
      if (validate && !state.financial.consentConfirmed) {
        showMessage("Confirm consent or authority to prepare this report.", "error");
        consent?.focus();
        return false;
      }
    }
  } else if (section === "incidentDetails") {
    if (validate && (!validateRequired(".complaint-form") || !validateRequired("#transactionForms"))) return false;
    syncComplaint();
    syncTransactions();
    if (validate && state.complaint.description.length < 200) {
      showMessage("Incident description must be at least 200 characters.", "error");
      document.querySelector("#incidentDescription")?.focus();
      return false;
    }
  } else {
    state.suspect.hasDetails = document.querySelector("#shareSuspect")?.checked || false;
    if (state.suspect.hasDetails) collectWcSuspectSection();
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
  const checkbox = document.querySelector("#shareSuspect");
  const fields = document.querySelector("#financialSuspectFields");
  if (!checkbox || !fields) return;
  checkbox.checked = state.suspect.hasDetails;
  fields.classList.toggle("active", checkbox.checked);
  checkbox.addEventListener("change", () => {
    state.suspect.hasDetails = checkbox.checked;
    fields.classList.toggle("active", checkbox.checked);
  });
  if (state.suspect.hasDetails) renderWcSuspect();
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
  badge.textContent = isLive ? "AI prepared · Needs your review" : "Sample · Needs your review";
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

function wcSuspectIdNumberLabel(type) {
  const labels = {
    "Mobile No.": "Mobile number",
    Email: "Email address",
    "Driving Licence": "Driving licence number",
    Aadhaar: "Aadhaar number",
    PAN: "PAN number",
    "Voter ID": "Voter ID number",
    Passport: "Passport number",
    Username: "Username",
    "Profile URL": "Profile URL",
    Other: "ID number",
  };
  return labels[type] || "ID number";
}

function collectWcSuspectSection() {
  const store = activeSuspectStore();
  const name = document.querySelector("#wcSuspectName");
  const other = document.querySelector("#wcSuspectOtherInfo");
  const idType = document.querySelector("#wcSuspectIdType");
  const idNumber = document.querySelector("#wcSuspectIdNumber");
  if (name) store.suspectName = name.value.trim();
  if (other) store.otherInfo = other.value.trim();
  if (idType) store.draftIdType = idType.value;
  if (idNumber) store.draftIdNumber = idNumber.value.trim();
}

function updateWcSuspectOtherCount() {
  const other = document.querySelector("#wcSuspectOtherInfo");
  const count = document.querySelector("#wcSuspectOtherCount");
  if (!other || !count) return;
  const remaining = Math.max(0, 250 - other.value.length);
  count.textContent = `Maximum of 250 characters - ${remaining} characters left.`;
}

function renderWcSuspectIdentityList() {
  const list = document.querySelector("#wcSuspectIdentityList");
  const store = activeSuspectStore();
  if (!list) return;
  list.replaceChildren();
  if (!store.identities.length) {
    const empty = document.createElement("li");
    empty.className = "document-empty";
    empty.textContent = "No suspect identifiers added yet.";
    list.append(empty);
    return;
  }
  store.identities.forEach((item, index) => {
    const row = document.createElement("li");
    row.className = "suspect-identity-item";
    row.innerHTML = `<strong>${item.idType}</strong><span>${item.idNumber}</span>`;
    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "ghost";
    remove.textContent = "Remove";
    remove.dataset.action = "remove-wc-suspect-id";
    remove.dataset.index = String(index);
    row.append(remove);
    list.append(row);
  });
}

function renderWcSuspect() {
  const store = activeSuspectStore();
  const name = document.querySelector("#wcSuspectName");
  const idType = document.querySelector("#wcSuspectIdType");
  const idNumber = document.querySelector("#wcSuspectIdNumber");
  const idLabel = document.querySelector("#wcSuspectIdNumberLabel");
  const other = document.querySelector("#wcSuspectOtherInfo");
  const photoName = document.querySelector("#wcSuspectPhotoName");
  if (name) name.value = store.suspectName || "";
  if (idType) idType.value = store.draftIdType || "Driving Licence";
  if (idNumber) idNumber.value = store.draftIdNumber || "";
  if (idType && idLabel) {
    idLabel.textContent = wcSuspectIdNumberLabel(idType.value);
    idType.addEventListener("change", () => {
      idLabel.textContent = wcSuspectIdNumberLabel(idType.value);
      store.draftIdType = idType.value;
    });
  }
  if (other) {
    other.value = store.otherInfo || "";
    updateWcSuspectOtherCount();
    other.addEventListener("input", updateWcSuspectOtherCount);
  }
  if (photoName) photoName.textContent = store.photoName || "No file chosen";
  renderWcSuspectIdentityList();
}

function renderWcPreview() {
  const preview = document.querySelector("#wcPreviewContent");
  const cards = [];
  const signedIn = state.wc.mode === "login" && state.auth.isSignedIn;
  if (state.wc.mode === "anonymous") {
    cards.push(previewCard("Personal Details", {
      Mode: "Anonymous report",
      Status: "Identity not collected for this filing path",
    }, "incidentDetails"));
  } else {
    cards.push(previewCard("Personal Details", {
      Mode: "Signed-in report",
      Name: state.wc.personal.name || state.reporter.name,
      Mobile: state.wc.personal.mobile || state.auth.mobile || state.reporter.mobile,
      Email: state.wc.personal.email || state.reporter.email || "Not provided",
      State: state.wc.personal.state,
      District: state.wc.personal.district,
    }, "personalDetails"));
  }
  cards.push(
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
    }, "incidentDetails")
  );
  if (signedIn) {
    cards.push(previewCard("Evidence summary", {
      Platform: state.wc.evidence.platform,
      "Visible people/usernames": state.wc.evidence.people,
      "Nature of content": state.wc.evidence.nature,
      Timeline: state.wc.evidence.timeline,
      "Attached files": state.documents.wcEvidence.length ? state.documents.wcEvidence.map((file) => file.name).join(", ") : "Sample or pasted evidence",
    }, "incidentDetails"));
  }
  const hasSuspect = Boolean(
    state.wc.suspect.suspectName
    || state.wc.suspect.identities.length
    || state.wc.suspect.photoName
    || state.wc.suspect.otherInfo
  );
  cards.push(previewCard("Suspect Details", hasSuspect ? {
    Name: state.wc.suspect.suspectName || "Not provided",
    Identifiers: state.wc.suspect.identities.length
      ? state.wc.suspect.identities.map((item) => `${item.idType}: ${item.idNumber}`).join("; ")
      : "Not provided",
    Photograph: state.wc.suspect.photoName || "Not uploaded",
    "Other information": state.wc.suspect.otherInfo || "Not provided",
  } : { Status: "No suspect details added" }, "suspectDetails"));
  preview.replaceChildren(...cards);
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
      Identifiers: state.suspect.identities?.length
        ? state.suspect.identities.map((item) => `${item.idType}: ${item.idNumber}`).join("; ")
        : "Not provided",
      Photograph: state.suspect.photoName || "Not uploaded",
      "Other information": state.suspect.otherInfo || "Not provided",
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
  if (!description || !count) return;
  const remaining = Math.max(0, 1500 - description.value.length);
  count.textContent = description.value.length >= 200
    ? `Maximum of 1500 characters — ${remaining} characters left.`
    : `Insert at least 200 characters. Maximum 1500 — ${description.value.length} entered.`;
  count.style.color = description.value.length >= 200 ? "var(--teal-dark)" : "var(--red)";
}

function formatElapsed() {
  const seconds = Math.floor((Date.now() - state.startedAt) / 1000);
  const mins = String(Math.floor(seconds / 60)).padStart(2, "0");
  const secs = String(seconds % 60).padStart(2, "0");
  return `${mins}:${secs}`;
}

function showMessage(text, tone = "info") {
  const existing = document.querySelector(".toast");
  if (existing) existing.remove();
  const toast = document.createElement("div");
  toast.className = `toast toast-${tone === "error" ? "error" : "info"}`;
  toast.setAttribute("role", "status");
  toast.textContent = text;
  document.body.append(toast);
  globalStatus.textContent = text;
  setTimeout(() => toast.remove(), 3200);
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
    if (error.name === "AbortError") throw new Error("Processing took too long. You can use the sample instead.");
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

async function extractEvidence(flowType, fileInput, pastedText, extras = {}) {
  const formData = new FormData();
  formData.append("flowType", flowType);
  if (pastedText?.trim()) formData.append("pastedText", pastedText.trim());
  if (extras.documentType) formData.append("documentType", extras.documentType);
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
      throw new Error("Add a file, paste a message, record a voice note, or choose “Use sample”.");
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
  const pastedText = document.querySelector("#wcPastedText")?.value || "";
  try {
    if (state.wc.evidenceReady && !files?.files.length && !audio?.files.length && !pastedText.trim()) {
      state.wc.activeSection = wcDefaultSection();
      render("wcWorkspace");
      return;
    }
    assertUploadSize(files, audio);
    if (!files.files.length && !audio.files.length && !pastedText.trim()) {
      throw new Error("Add something you already have, or choose “Use sample”.");
    }
    retainWcEvidenceDocuments([...files.files, ...audio.files]);
    setProcessing("#wcProcessingState", "Preparing a neutral draft. You stay in control…");
    try {
      const transcription = await transcribeEvidence("women_children", audio);
      const combinedText = [pastedText, transcription?.data?.transcript].filter(Boolean).join("\n\nVoice note transcript:\n");
      const extraction = await extractEvidence("women_children", files, combinedText);
      applyWcExtraction(extraction, transcription);
      showMessage(extraction.message);
    } catch {
      mockWcEvidence();
      showMessage("Sample data was used to prepare a starting draft. Review every field.");
    }
    state.wc.evidenceReady = true;
    state.wc.activeSection = wcDefaultSection();
    render("wcWorkspace");
  } catch (error) {
    setProcessing("#wcProcessingState", error.message, true);
  }
}

async function processProfile() {
  const input = document.querySelector("#reporterIdentityUpload");
  const type = document.querySelector("#reporterIdentityType").value;
  await processProfileFrom(input, type, "#signupIdentityDocument", "newUser");
}

async function processSignupProfile() {
  const input = document.querySelector("#signupIdentityUpload");
  const type = document.querySelector("#signupIdentityType").value;
  await processProfileFrom(input, type, "#signupAuthIdentityDocument", "signup");
}

async function processProfileFrom(input, type, displaySelector, returnScreen) {
  try {
    assertUploadSize(input);
    if (!input.files.length) throw new Error("Choose an identity image or PDF.");
    retainIdentityDocument("reporter", input.files[0], type);
    try {
      const payload = await extractEvidence("profile", input, "", { documentType: type });
      state.reporter = { ...state.reporter, ...(payload.data.profile || {}) };
      state.ai.profile.mode = payload.mode;
    } catch {
      state.reporter = {
        ...sampleProfile,
        mobile: state.auth.mobile || state.reporter.mobile || sampleProfile.mobile,
      };
      state.ai.profile.mode = "demo_fallback";
    }
    state.auth.profileReady = true;
    render(returnScreen);
    showMessage("Profile fields prepared. Review and save when ready.");
  } catch (error) {
    renderDocumentDisplay(displaySelector, state.documents.reporter);
    showMessage(error.message, "error");
  }
}

async function processVictimIdentity(input, type) {
  retainIdentityDocument("victim", input.files[0], type);
  renderDocumentDisplay("#victimIdentityDocument", state.documents.victim);
  try {
    assertUploadSize(input);
    const payload = await extractEvidence("profile", input, "", { documentType: type });
    state.victim = payload.mode === "demo_fallback"
      ? { ...sampleVictim }
      : { ...state.victim, ...(payload.data.profile || {}) };
    state.ai.profile.mode = payload.mode;
    render("financialWorkspace");
    showMessage("Affected person’s details were prepared from the retained document. Please review them.");
  } catch (error) {
    showMessage(`${error.message} The document is retained; enter or review the details manually.`, "error");
  }
}

async function loadPdfLibrary() {
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
    field(
      "Identifiers",
      state.suspect.identities?.length
        ? state.suspect.identities.map((item) => `${item.idType}: ${item.idNumber}`).join("; ")
        : "Not provided"
    );
    field("Photograph", state.suspect.photoName || "Not uploaded");
    field("Other information", state.suspect.otherInfo || "Not provided");
  }

  ensureSpace(24);
  y += 8;
  write("This PDF was generated locally from prototype report data. No complaint was submitted to NCCRP.", { size: 9, style: "bold", muted: true });
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
      name: "UPI-payment-screenshot.png",
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
      name: "safety-screenshot.png",
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
    state.suspect = { hasDetails: false, ...emptySuspectDetails() };
    state.wc.suspect = emptyWcSuspect();
    state.wc.evidenceReady = false;
    state.wc.completedSections = [];
    state.wc.activeSection = "incidentDetails";
    render("home");
    return;
  }
  if (action === "open-login") {
    if (state.auth.isSignedIn) {
      showMessage(`Signed in as ${state.auth.mobile || state.reporter.mobile}.`);
      return;
    }
    state.returnAfterAuth = state.current;
    state.auth.mode = "login";
    state.auth.otpSent = false;
    state.auth.otpVerified = false;
    render("login");
    return;
  }
  if (action === "open-signup") {
    state.returnAfterAuth = state.current;
    state.auth.mode = "signup";
    state.auth.otpSent = false;
    state.auth.otpVerified = false;
    state.auth.profileReady = false;
    render("signup");
    return;
  }
  if (action === "auth-back") {
    if (state.returnAfterAuth === "prereq" && !state.auth.isSignedIn) {
      render("userType");
      return;
    }
    render(state.returnAfterAuth || "home");
    return;
  }
  if (action === "send-login-otp") {
    const mobile = document.querySelector("#loginMobileInput").value.trim();
    if (!/^\d{10}$/.test(mobile)) {
      showMessage("Enter a 10-digit mobile number.", "error");
      return;
    }
    state.auth.mobile = mobile;
    state.auth.otpSent = true;
    state.auth.otpVerified = false;
    document.querySelector("#loginOtpArea").classList.remove("hidden");
    showMessage("Mocked OTP generated: 123456");
    return;
  }
  if (action === "verify-login-otp") {
    if (!state.auth.otpSent) {
      showMessage("Get an OTP first.", "error");
      return;
    }
    if (document.querySelector("#loginOtpInput").value.trim() !== "123456") {
      showMessage("Use mocked OTP 123456.", "error");
      return;
    }
    state.auth.otpVerified = true;
    state.auth.isSignedIn = true;
    state.reporter.mobile = state.auth.mobile || state.reporter.mobile;
    showMessage("You are signed in for this session.");
    render(state.returnAfterAuth && state.returnAfterAuth !== "login" && state.returnAfterAuth !== "signup" ? state.returnAfterAuth : "home");
    return;
  }
  if (action === "send-signup-otp") {
    const mobile = document.querySelector("#signupMobileInput").value.trim();
    if (!/^\d{10}$/.test(mobile)) {
      showMessage("Enter a 10-digit mobile number.", "error");
      return;
    }
    state.auth.mobile = mobile;
    state.reporter.mobile = mobile;
    state.auth.otpSent = true;
    state.auth.otpVerified = false;
    document.querySelector("#signupOtpArea").classList.remove("hidden");
    showMessage("Mocked OTP generated: 123456");
    return;
  }
  if (action === "verify-signup-otp") {
    if (!state.auth.otpSent) {
      showMessage("Get an OTP first.", "error");
      return;
    }
    if (document.querySelector("#signupOtpInput").value.trim() !== "123456") {
      showMessage("Use mocked OTP 123456.", "error");
      return;
    }
    state.auth.otpVerified = true;
    render("signup");
    showMessage("Mobile verified. Upload an identity document next.");
    return;
  }
  if (action === "fill-signup-profile") {
    if (!state.auth.otpVerified) {
      showMessage("Verify your mobile OTP before adding identity details.", "error");
      return;
    }
    state.reporter = {
      ...sampleProfile,
      mobile: state.auth.mobile || sampleProfile.mobile,
    };
    retainIdentityDocument("reporter", null, document.querySelector("#signupIdentityType")?.value || "Aadhaar", true);
    state.auth.profileReady = true;
    render("signup");
    showMessage("Sample identity added. Review and save when ready.");
    return;
  }
  if (action === "process-signup-profile") {
    if (!state.auth.otpVerified) {
      showMessage("Verify your mobile OTP before extracting identity details.", "error");
      return;
    }
    await processSignupProfile();
    return;
  }
  if (action === "save-signup") {
    if (!state.auth.otpVerified) {
      showMessage("Verify a 10-digit mobile number first.", "error");
      return;
    }
    if (!state.auth.profileReady || !state.documents.reporter) {
      showMessage("Extract identity details before saving.", "error");
      return;
    }
    if (!validateRequired(".signup-profile-form")) return;
    collectForm(".signup-profile-form", state.reporter);
    state.auth.isSignedIn = true;
    state.auth.mobile = state.auth.mobile || state.reporter.mobile;
    if (state.returnAfterAuth === "wcWorkspace") state.wc.mode = "login";
    if (state.returnAfterAuth === "prereq") state.financial.entry = "new";
    showMessage("Profile saved. You are signed in for this session.");
    render(state.returnAfterAuth && state.returnAfterAuth !== "login" && state.returnAfterAuth !== "signup" ? state.returnAfterAuth : "home");
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
      state.auth.mode = "login";
      state.auth.otpSent = false;
      state.auth.otpVerified = false;
      render("login");
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
      showMessage("Enter a 10-digit mobile number.", "error");
      return;
    }
    state.tracking.loginMobile = mobile;
    document.querySelector("#trackingOtpArea").classList.remove("hidden");
    showMessage("Mock OTP generated: 123456");
    return;
  }
  if (action === "verify-tracking-otp") {
    if (document.querySelector("#trackingOtpInput").value.trim() !== "123456") {
      showMessage("Use mocked OTP 123456.", "error");
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
      state.auth.mode = "login";
      state.auth.otpSent = false;
      state.auth.otpVerified = false;
      render("login");
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
      showMessage("Enter a 10-digit mobile number.", "error");
      return;
    }
    state.wc.loginMobile = mobile;
    document.querySelector("#wcOtpArea").classList.remove("hidden");
    showMessage("Mock OTP generated: 123456");
    return;
  }
  if (action === "verify-wc-otp") {
    if (document.querySelector("#wcOtpInput").value.trim() !== "123456") {
      showMessage("Use mocked OTP 123456.", "error");
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
    state.wc.activeSection = wcDefaultSection();
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
    state.wc.activeSection = wcDefaultSection();
    render("wcWorkspace");
    return;
  }
  if (action === "back-to-wc-evidence") {
    saveWcSection(state.wc.activeSection, false);
    render("wcStart");
    return;
  }
  if (action === "process-wc-evidence") {
    await processWcEvidence();
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
  if (action === "add-wc-suspect-id") {
    collectWcSuspectSection();
    const store = activeSuspectStore();
    const idType = store.draftIdType || "Driving Licence";
    const idNumber = store.draftIdNumber;
    if (!idNumber) {
      showMessage("Enter an ID number before adding.", "error");
      document.querySelector("#wcSuspectIdNumber")?.focus();
      return;
    }
    store.identities.push({ idType, idNumber });
    store.draftIdNumber = "";
    const input = document.querySelector("#wcSuspectIdNumber");
    if (input) input.value = "";
    renderWcSuspectIdentityList();
    showMessage("Suspect identifier added.");
    return;
  }
  if (action === "remove-wc-suspect-id") {
    const store = activeSuspectStore();
    const index = Number(target.dataset.index);
    if (!Number.isNaN(index)) store.identities.splice(index, 1);
    renderWcSuspectIdentityList();
    return;
  }
  if (action === "upload-wc-suspect-photo") {
    const store = activeSuspectStore();
    const input = document.querySelector("#wcSuspectPhotoUpload");
    const file = input?.files?.[0];
    if (!file) {
      showMessage("Choose a JPG or PNG photograph first.", "error");
      return;
    }
    if (!/\.(jpe?g|png)$/i.test(file.name) && !/^image\/(jpeg|png)$/i.test(file.type)) {
      showMessage("Upload a JPG/JPEG/PNG photograph only.", "error");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showMessage("Suspect photograph must be 5 MB or smaller.", "error");
      return;
    }
    store.photoName = file.name;
    const label = document.querySelector("#wcSuspectPhotoName");
    if (label) label.textContent = file.name;
    showMessage("Suspect photograph attached for this session.");
    return;
  }
  if (action === "preview-wc-report") {
    if (!saveWcSection("suspectDetails", true)) return;
    if (!state.wc.completedSections.includes("incidentDetails")) {
      state.wc.activeSection = "incidentDetails";
      render("wcWorkspace");
      showMessage("Complete Incident Details before previewing the report.", "error");
      return;
    }
    if (state.wc.mode === "login" && state.auth.isSignedIn && !state.wc.completedSections.includes("personalDetails")) {
      state.wc.activeSection = "personalDetails";
      render("wcWorkspace");
      showMessage("Complete Personal Details before previewing the report.", "error");
      return;
    }
    render("wcPreview");
    return;
  }
  if (action === "edit-wc-section") {
    state.wc.activeSection = target.dataset.section || wcDefaultSection();
    render("wcWorkspace");
    return;
  }
  if (action === "save-wc-complaint") {
    if (!validateRequired(".wc-complaint-form")) return;
    syncWcComplaint();
    if (state.wc.complaint.description.length < 200) {
      showMessage("Additional information must be at least 200 characters.", "error");
      return;
    }
    render("wcSuspect");
    return;
  }
  if (action === "save-wc-suspect") {
    collectWcSuspectSection();
    render("wcPreview");
    return;
  }
  if (action === "submit-wc-report") {
    if (!document.querySelector("#wcCertify").checked) {
      showMessage("Please confirm the certification checkbox.", "error");
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
    state.auth.profileReady = false;
    state.auth.otpSent = false;
    state.auth.otpVerified = false;
    state.auth.mode = "signup";
    releaseDocument(state.documents.reporter);
    releaseDocument(state.documents.victim);
    state.documents.reporter = null;
    state.documents.victim = null;
    state.returnAfterAuth = "prereq";
    render("signup");
    return;
  }
  if (action === "send-otp") {
    const mobile = document.querySelector("#mobileInput").value.trim();
    if (!/^\d{10}$/.test(mobile)) {
      showMessage("Enter a 10-digit mobile number.", "error");
      return;
    }
    state.reporter.mobile = mobile;
    document.querySelector("#otpArea").classList.remove("hidden");
    showMessage("Mock OTP generated: 123456");
    return;
  }
  if (action === "verify-otp") {
    if (document.querySelector("#otpInput").value.trim() !== "123456") {
      showMessage("Use mocked OTP 123456.", "error");
      return;
    }
    state.financial.entry = "existing";
    state.auth.isSignedIn = true;
    state.auth.mobile = state.reporter.mobile;
    if (!state.documents.reporter) retainIdentityDocument("reporter", null, "Aadhaar", true);
    render("prereq");
    return;
  }
  if (action === "mock-aadhaar") {
    state.reporter = { ...sampleProfile };
    retainIdentityDocument("reporter", null, document.querySelector("#reporterIdentityType")?.value || "Aadhaar", true);
    state.auth.profileReady = true;
    render("newUser");
    showMessage("Aadhaar fields extracted from a sample.");
    return;
  }
  if (action === "process-profile") {
    await processProfile();
    return;
  }
  if (action === "save-profile") {
    if (!state.auth.profileReady && !state.documents.reporter) {
      showMessage("Extract identity details before saving.", "error");
      document.querySelector("#reporterIdentityUpload")?.focus();
      return;
    }
    if (!validateRequired(".profile-form")) return;
    if (!state.documents.reporter) {
      showMessage("Attach an identity document before saving.", "error");
      document.querySelector("#reporterIdentityUpload")?.focus();
      return;
    }
    collectForm(".profile-form", state.reporter);
    state.financial.entry = "new";
    state.auth.isSignedIn = true;
    state.auth.mobile = state.reporter.mobile;
    render("prereq");
    return;
  }
  if (action === "financial-prereq-back") {
    if (state.auth.isSignedIn) {
      render("home");
      return;
    }
    render(state.financial.entry === "new" ? "userType" : "existingLogin");
    return;
  }
  if (action === "mock-evidence-and-continue") {
    if (!state.documents.reporter) {
      showMessage("Complete the reporter identity step before using the sample.", "error");
      return;
    }
    mockEvidence();
    state.financial.evidenceReady = true;
    state.financial.activeSection = "myDetails";
    render("financialWorkspace");
    return;
  }
  if (action === "manual-financial-continue") {
    if (!state.documents.reporter) {
      showMessage("Complete the reporter identity step before continuing.", "error");
      return;
    }
    if (!state.complaint.description?.trim()) state.complaint.description = draftDescription();
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
      showMessage("Complete this required section before previewing the report.", "error");
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
      showMessage("Please confirm the certification checkbox.", "error");
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
      showMessage(error.message, "error");
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
