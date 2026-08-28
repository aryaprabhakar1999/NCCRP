import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { financialSchema, profileSchema, womenChildrenSchema } from "./schemas.js";

const configuration = {
  financial: {
    schema: financialSchema,
    formatName: "financial_evidence",
    prompt: `Extract only details supported by the supplied evidence for an Indian online financial-fraud complaint.
Evidence may include payment screenshots AND a "Voice note transcript" section — treat spoken details as evidence.
Use YYYY-MM-DD dates and 24-hour HH:MM times. Amount must contain digits only. Do not invent missing IDs.
Fill suspect.name, suspect.mobile, suspect.email, suspect.username, and suspect.otherInfo when the scammer/suspect is named or identified in text, screenshots, or the voice transcript. Use empty strings when unknown. Prefer a 10-digit Indian mobile when spoken or written.
The incident description should be neutral, first-person, at least 200 characters, and must distinguish facts from uncertainty. Include suspect name or mobile in the description when the citizen mentioned them.
Use the closest NCCRP field labels. Give lower confidence to unclear values and list fields that need citizen review.`,
  },
  women_children: {
    schema: womenChildrenSchema,
    formatName: "women_children_evidence",
    prompt: `Prepare a neutral, non-graphic summary for an Indian cybercrime report involving women or children.
Do not repeat explicit material or make legal conclusions. Extract only visible platform, dates, usernames, and sequence of events.
Evidence may include screenshots AND a "Voice note transcript" — treat spoken suspect name, mobile, username, or profile details as evidence.
Fill suspect.name, suspect.mobile, suspect.email, suspect.username, and suspect.otherInfo when mentioned; otherwise use empty strings.
Use YYYY-MM-DD and 24-hour HH:MM. The description must be supportive, factual, at least 200 characters, and editable.
Mark uncertain or inferred fields for citizen review.`,
  },
  profile: {
    schema: profileSchema,
    formatName: "profile_evidence",
    prompt: `You are reading an Indian identity document image or PDF (Aadhaar, PAN, Voter ID, Driving Licence, or similar).
Extract every visible personal field carefully. Read small print, bilingual labels (Hindi/English), and address lines.

Rules:
- Use only values visible on the document. Do not invent mobile, email, police station, or tehsil if absent.
- Return empty strings for fields that are not visible.
- Date of birth must be YYYY-MM-DD (convert DD/MM/YYYY or DD-MM-YYYY).
- Gender: map M/Male/पुरुष to "Male"; F/Female/महिला to "Female". If unclear, leave empty and list gender in needsReview.
- Title: Miss/Mrs/Ms/Mr/Mx when clearly implied by gender/name style; otherwise empty.
- Name: full name as printed (Latin script preferred when both scripts appear).
- Relation: if Father/Husband/Mother name is printed (S/O, D/O, W/O, C/O), set relationType and relationName.
- Address: split when possible into house, street, colony, city, tehsil, district, state, pincode, country.
  - If the address is one block, put the full readable address into street and still fill city/state/district/pincode when visible.
  - Pincode is the 6-digit Indian PIN when present.
  - Country is "India" when the document is an Indian ID.
- Never copy Aadhaar/PAN/Voter full ID numbers into any profile field.
- Set confidence low and add needsReview for unclear name, dob, gender, or address.`,
  },
};

function normalizeGender(value) {
  const raw = String(value || "").trim().toLowerCase();
  if (!raw) return "";
  if (/^(f|female|महिला|stree|stri)$/i.test(raw) || raw.includes("female") || raw.includes("महिला")) return "Female";
  if (/^(m|male|पुरुष|purush)$/i.test(raw) || raw.includes("male") || raw.includes("पुरुष")) return "Male";
  if (raw.includes("non-binary") || raw.includes("nonbinary")) return "Non-binary";
  if (["Female", "Male", "Non-binary", "Prefer not to say"].includes(value)) return value;
  return "";
}

function normalizeDob(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
  const match = raw.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{4})$/);
  if (!match) return raw;
  const day = match[1].padStart(2, "0");
  const month = match[2].padStart(2, "0");
  return `${match[3]}-${month}-${day}`;
}

function normalizeProfileResult(data) {
  if (!data?.profile) return data;
  const profile = { ...data.profile };
  profile.gender = normalizeGender(profile.gender);
  profile.dob = normalizeDob(profile.dob);
  profile.pincode = String(profile.pincode || "").replace(/\D/g, "").slice(0, 6);
  if (!profile.country && (profile.state || profile.district || profile.pincode)) profile.country = "India";
  if (!profile.street && (profile.house || profile.colony || profile.city)) {
    profile.street = [profile.house, profile.colony, profile.city].filter(Boolean).join(", ");
  }
  const needsReview = new Set(data.needsReview || []);
  if (!profile.gender) needsReview.add("gender");
  if (!profile.street && !profile.colony && !profile.city) needsReview.add("address");
  return {
    ...data,
    profile,
    needsReview: [...needsReview],
  };
}

export function hasOpenAiKey() {
  return Boolean(process.env.OPENAI_API_KEY);
}

export function openAiClient() {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

export async function extractStructured(flowType, content) {
  const config = configuration[flowType];
  if (!config) throw new Error("Unknown reporting flow.");
  const client = openAiClient();
  const response = await client.responses.parse({
    model: process.env.OPENAI_EXTRACT_MODEL || "gpt-4o-mini",
    input: [
      { role: "system", content: config.prompt },
      { role: "user", content },
    ],
    text: { format: zodTextFormat(config.schema, config.formatName) },
  });
  if (!response.output_parsed) throw new Error("The model did not return a usable extraction.");
  if (flowType === "profile") return normalizeProfileResult(response.output_parsed);
  return response.output_parsed;
}
