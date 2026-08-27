const app = document.querySelector("#app");
const elapsedTime = document.querySelector("#elapsedTime");

const screens = {
  home: "home-template",
  womenChildren: "women-template",
  wcLogin: "wc-login-template",
  wcStart: "wc-start-template",
  wcEvidence: "wc-evidence-template",
  wcReview: "wc-review-template",
  wcComplaint: "wc-complaint-template",
  wcSuspect: "wc-suspect-template",
  wcPreview: "wc-preview-template",
  wcDone: "wc-done-template",
  userType: "user-type-template",
  existingLogin: "existing-login-template",
  newUser: "new-user-template",
  prereq: "prereq-template",
  extraction: "extraction-template",
  complaint: "complaint-template",
  transactions: "transactions-template",
  suspect: "suspect-template",
  complainant: "complainant-template",
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

const state = {
  current: "home",
  startedAt: Date.now(),
  profile: { ...sampleProfile },
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
  wc: {
    mode: "anonymous",
    entry: "evidence",
    loginMobile: "",
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
};

function render(screen) {
  state.current = screen;
  const template = document.querySelector(`#${screens[screen]}`);
  app.replaceChildren(template.content.cloneNode(true));

  if (screen === "wcStart") renderWcStart();
  if (screen === "wcReview") renderWcReview();
  if (screen === "wcComplaint") renderWcComplaint();
  if (screen === "wcSuspect") renderWcSuspect();
  if (screen === "wcPreview") renderWcPreview();
  if (screen === "wcDone") document.querySelector("#wcFinalTime").textContent = formatElapsed();
  if (screen === "newUser") renderForm(".profile-form", profileFields, state.profile);
  if (screen === "extraction") renderExtraction();
  if (screen === "complaint") renderComplaint();
  if (screen === "transactions") renderTransactionForms();
  if (screen === "suspect") renderSuspect();
  if (screen === "complainant") renderForm(".complainant-form", profileFields, state.profile);
  if (screen === "preview") renderPreview();
  if (screen === "done") document.querySelector("#finalTime").textContent = formatElapsed();

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function makeControl([key, label, type = "text", options], values, className = "") {
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

function renderExtraction() {
  const body = document.querySelector("#transactionReview");
  const transaction = state.transactions[0];
  body.replaceChildren(
    ...transactionFields.map(([key, label, type, options]) => {
      const row = document.createElement("tr");
      const heading = document.createElement("td");
      heading.textContent = label;
      const value = document.createElement("td");
      value.append(makeControl([key, label, type, options], transaction));
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
  label.textContent = state.wc.mode === "anonymous" ? "Anonymous report" : "Logged-in demo report";
}

function renderWcReview() {
  renderForm(".wc-evidence-form", wcEvidenceFields, state.wc.evidence);
  document.querySelector("#wcTimeline").value = state.wc.evidence.timeline || "";
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
    previewCard("Report mode", {
      Mode: state.wc.mode === "anonymous" ? "Anonymous report" : "Logged-in demo report",
      Mobile: state.wc.mode === "login" ? state.wc.loginMobile || "Mock login completed" : "Not collected",
    }),
    previewCard("Complaint", {
      Category: state.wc.complaint.category,
      "Incident date": state.wc.complaint.date,
      Time: state.wc.complaint.time,
      "Reason for delay": state.wc.complaint.delayReason || "Not provided",
      "State / UT": state.wc.complaint.state,
      District: state.wc.complaint.district,
      "Police Station": state.wc.complaint.policeStation || "Not provided",
      "Occurred at": state.wc.complaint.occurredAt,
      Description: state.wc.complaint.description,
    }),
    previewCard("Evidence summary", {
      Platform: state.wc.evidence.platform,
      "Visible people/usernames": state.wc.evidence.people,
      "Nature of content": state.wc.evidence.nature,
      Timeline: state.wc.evidence.timeline,
    }),
    previewCard("Suspect", state.wc.suspect.hasDetails ? {
      Name: state.wc.suspect.suspectName || "Not provided",
      "ID type": state.wc.suspect.suspectIdType,
      "ID number": state.wc.suspect.suspectId || "Not provided",
      "Share address": state.wc.suspect.shareAddress,
      Address: state.wc.suspect.shareAddress === "Yes" ? state.wc.suspect.suspectAddress || "Not provided" : "Not shared",
    } : { Status: "Skipped by citizen" })
  );
}

function renderPreview() {
  collectForm(".complainant-form", state.profile);
  const preview = document.querySelector("#previewContent");
  preview.replaceChildren(
    previewCard("Complaint", {
      Category: state.complaint.category,
      "Sub-category": state.complaint.subCategory,
      "Incident date": state.complaint.incidentDate,
      "Incident time": state.complaint.incidentTime,
      Delay: state.complaint.delay,
      "Occurred at": state.complaint.occurredAt,
      Description: state.complaint.description,
    }),
    previewCard("Transactions", Object.fromEntries(state.transactions.map((transaction, index) => [
      `Transaction ${index + 1}`,
      `${transaction.amount} via ${transaction.wallet}, UTR ${transaction.utr}, ${transaction.date} ${transaction.time}`,
    ]))),
    previewCard("Complainant", {
      Name: state.profile.name,
      Mobile: state.profile.mobile,
      Gender: state.profile.gender,
      "Date of Birth": state.profile.dob,
      "Father / Mother / Spouse": `${state.profile.relationType}: ${state.profile.relationName}`,
      Address: [state.profile.house, state.profile.street, state.profile.colony, state.profile.city, state.profile.district, state.profile.state, state.profile.pincode].filter(Boolean).join(", "),
    }),
    previewCard("Suspect", state.suspect.hasDetails ? {
      Name: state.suspect.suspectName || "Not provided",
      "ID type": state.suspect.suspectIdType,
      "ID number": state.suspect.suspectId || "Not provided",
      Address: state.suspect.suspectAddress || "Not provided",
    } : { Status: "Skipped by citizen" })
  );
}

function previewCard(title, values) {
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
  return card;
}

function draftDescription() {
  const transaction = state.transactions[0];
  return `I am reporting an online financial fraud where an amount of INR ${transaction.amount} was debited through ${transaction.wallet} on ${transaction.date} at around ${transaction.time}. The visible transaction ID or UTR is ${transaction.utr}, and the reference number shown in the uploaded evidence is ${transaction.reference}. I did not authorize this fraudulent transfer and I am requesting urgent action to trace the recipient account, block further movement of funds, and register my complaint based on the attached evidence.`;
}

function draftWcDescription() {
  const evidence = state.wc.evidence;
  if (state.wc.entry === "manual") {
    return "I am submitting this report to request help with an online incident involving harmful or abusive content. I will provide the platform, approximate date and time, location details, and any suspect information I feel comfortable sharing. I request that the material, account, link, or profile be reviewed urgently and that appropriate action be taken based on the information provided in this demo report.";
  }
  return `I am submitting this report based on the uploaded evidence from ${evidence.platform}. The screenshots appear to show ${evidence.nature.toLowerCase()} involving ${evidence.people}. The visible timestamps indicate activity around ${evidence.date} at ${evidence.time}. I request that the material, account, link, or group shown in the evidence be reviewed urgently and that appropriate action be taken. I have reviewed this AI-prepared draft and can edit any detail before submitting the demo report.`;
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
  setTimeout(() => toast.remove(), 2600);
}

function mockEvidence(index = 0) {
  state.transactions = [{ ...mockTransactions[index % mockTransactions.length] }];
  state.complaint.description = draftDescription();
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

function handleAction(action, target) {
  if (action === "go-home") {
    state.startedAt = Date.now();
    render("home");
    return;
  }
  if (action === "start-wc-anonymous") {
    state.wc.mode = "anonymous";
    state.wc.loginMobile = "";
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
      showMessage("Use demo OTP 123456.");
      return;
    }
    state.wc.mode = "login";
    render("wcStart");
    return;
  }
  if (action === "start-wc-manual") {
    resetWcManualComplaint();
    render("wcComplaint");
    return;
  }
  if (action === "wc-complaint-back") {
    render(state.wc.entry === "evidence" ? "wcReview" : "wcStart");
    return;
  }
  if (action === "mock-wc-evidence") {
    mockWcEvidence();
    render("wcReview");
    return;
  }
  if (action === "refresh-wc-evidence") {
    const next = state.wc.evidence.platform === wcEvidenceSamples[0].platform ? 1 : 0;
    mockWcEvidence(next);
    render("wcReview");
    return;
  }
  if (action === "save-wc-review") {
    syncWcReview();
    render("wcComplaint");
    return;
  }
  if (action === "save-wc-complaint") {
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
  if (action === "send-otp") {
    const mobile = document.querySelector("#mobileInput").value.trim();
    if (!/^\d{10}$/.test(mobile)) {
      showMessage("Enter a 10-digit mobile number.");
      return;
    }
    state.profile.mobile = mobile;
    document.querySelector("#otpArea").classList.remove("hidden");
    showMessage("Mock OTP generated: 123456");
    return;
  }
  if (action === "verify-otp") {
    if (document.querySelector("#otpInput").value.trim() !== "123456") {
      showMessage("Use demo OTP 123456.");
      return;
    }
    render("prereq");
    return;
  }
  if (action === "mock-aadhaar" || action === "fill-profile") {
    state.profile = { ...sampleProfile };
    render("newUser");
    showMessage(action === "mock-aadhaar" ? "Aadhaar fields extracted and file discarded." : "Sample profile filled.");
    return;
  }
  if (action === "save-profile") {
    collectForm(".profile-form", state.profile);
    render("prereq");
    return;
  }
  if (action === "mock-evidence") {
    mockEvidence();
    render("extraction");
    return;
  }
  if (action === "refresh-evidence") {
    const next = state.transactions[0].utr === mockTransactions[0].utr ? 1 : 0;
    mockEvidence(next);
    render("extraction");
    return;
  }
  if (action === "add-transaction") {
    syncExtraction();
    state.transactions.push({ ...mockTransactions[1] });
    render("transactions");
    return;
  }
  if (action === "save-transaction") {
    syncExtraction();
    state.complaint.description = draftDescription();
    render("complaint");
    return;
  }
  if (action === "save-complaint") {
    syncComplaint();
    if (state.complaint.description.length < 200) {
      showMessage("Incident description must be at least 200 characters.");
      return;
    }
    render("transactions");
    return;
  }
  if (action === "add-transaction-form") {
    syncTransactions();
    state.transactions.push({ ...mockTransactions[state.transactions.length % mockTransactions.length] });
    render("transactions");
    return;
  }
  if (action === "save-transactions") {
    syncTransactions();
    render("suspect");
    return;
  }
  if (action === "save-suspect") {
    collectForm(".suspect-form", state.suspect);
    render("complainant");
    return;
  }
  if (action === "save-complainant") {
    collectForm(".complainant-form", state.profile);
    render("preview");
    return;
  }
  if (action === "submit-report") {
    if (!document.querySelector("#certify").checked) {
      showMessage("Please confirm the certification checkbox.");
      return;
    }
    render("done");
  }
}

document.addEventListener("click", (event) => {
  const target = event.target.closest("button");
  if (!target) return;
  if (target.dataset.next) render(target.dataset.next);
  if (target.dataset.action) handleAction(target.dataset.action, target);
});

setInterval(() => {
  elapsedTime.textContent = formatElapsed();
}, 1000);

render("home");
