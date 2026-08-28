export function normalizeIndianMobile(value) {
  const digits = String(value || "").replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("91")) return digits.slice(2);
  if (digits.length === 11 && digits.startsWith("0")) return digits.slice(1);
  if (digits.length === 10 && /^[6-9]/.test(digits)) return digits;
  return "";
}

export function extractSuspectHintsFromText(text) {
  const raw = String(text || "");
  if (!raw.trim()) return null;
  const hints = { name: "", mobile: "", email: "", username: "", otherInfo: "" };

  const mobileMatch = raw.match(/(?:\+91[\s-]*)?(?:0)?([6-9]\d{9})\b/);
  if (mobileMatch) hints.mobile = mobileMatch[1];

  const emailMatch = raw.match(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i);
  if (emailMatch) hints.email = emailMatch[0];

  const usernameMatch = raw.match(/(?:instagram|facebook|twitter|telegram)\s+(?:account\s+)?(?:named|called|is|:)\s*@?([A-Za-z0-9._]{3,30})/i)
    || raw.match(/(?:account|handle|profile|username)\s*(?:named|called|is|:)\s*@?([A-Za-z0-9._]{3,30})/i)
    || raw.match(/@([A-Za-z0-9._]{3,30})\b/);
  if (usernameMatch) {
    const handle = usernameMatch[1].replace(/[.,;:]+$/g, "");
    if (handle.length >= 3) hints.username = handle.startsWith("@") ? handle : `@${handle}`;
  }

  const nameStop = "called|from|on|who|and|said|with|at|mobile|number|phone|contacted|messaged";
  const personName = `([A-Za-z][A-Za-z']*(?:\\s+(?!${nameStop})[A-Za-z][A-Za-z']*){0,2})`;
  const namePatterns = [
    new RegExp(`(?:suspect(?:'s)?|scammer(?:'s)?|fraudster(?:'s)?)\\s+name(?:\\s+is|\\s+was)?\\s*[:\\-]?\\s*${personName}`, "i"),
    new RegExp(`(?:someone|person|man|woman|caller)\\s+named\\s+${personName}`, "i"),
    new RegExp(`(?:named|called(?:\\s+himself|\\s+herself)?)\\s+${personName}`, "i"),
    new RegExp(`(?:name(?:\\s+is|\\s+was)?)\\s+${personName}`, "i"),
  ];
  for (const pattern of namePatterns) {
    const match = raw.match(pattern);
    if (match?.[1]) {
      hints.name = match[1].replace(/\s+/g, " ").trim().replace(/[.,;:]+$/, "");
      break;
    }
  }

  if (!hints.name && !hints.mobile && !hints.email && !hints.username) return null;
  return hints;
}

export function suspectHintsToExtractedFields(hints) {
  if (!hints) return {};
  const fields = {};
  if (hints.name) fields.suspectName = hints.name;
  if (hints.mobile) fields.suspectMobile = hints.mobile;
  if (hints.email) fields.email = hints.email;
  if (hints.username) fields.suspectUsername = hints.username;
  if (hints.otherInfo) fields.otherInfo = hints.otherInfo;
  return fields;
}
