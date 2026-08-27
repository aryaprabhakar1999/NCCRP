import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { financialSchema, profileSchema, womenChildrenSchema } from "./schemas.js";

const configuration = {
  financial: {
    schema: financialSchema,
    formatName: "financial_evidence",
    prompt: `Extract only details visibly supported by the supplied evidence for an Indian online financial-fraud complaint.
Use YYYY-MM-DD dates and 24-hour HH:MM times. Amount must contain digits only. Do not invent missing IDs.
The incident description should be neutral, first-person, at least 200 characters, and must distinguish facts from uncertainty.
Use the closest NCCRP field labels. Give lower confidence to unclear values and list fields that need citizen review.`,
  },
  women_children: {
    schema: womenChildrenSchema,
    formatName: "women_children_evidence",
    prompt: `Prepare a neutral, non-graphic summary for an Indian cybercrime report involving women or children.
Do not repeat explicit material or make legal conclusions. Extract only visible platform, dates, usernames, and sequence of events.
Use YYYY-MM-DD and 24-hour HH:MM. The description must be supportive, factual, at least 200 characters, and editable.
Mark uncertain or inferred fields for citizen review.`,
  },
  profile: {
    schema: profileSchema,
    formatName: "profile_evidence",
    prompt: `Extract profile fields from this synthetic Indian identity-document sample only.
Use YYYY-MM-DD for date of birth. Do not infer values that are not present. Return empty strings for missing fields.
Split the address into the requested fields when possible and mark uncertain fields for review.`,
  },
};

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
    model: process.env.OPENAI_EXTRACT_MODEL || "gpt-5.6",
    input: [
      { role: "system", content: config.prompt },
      { role: "user", content },
    ],
    text: { format: zodTextFormat(config.schema, config.formatName) },
  });
  if (!response.output_parsed) throw new Error("The model did not return a usable extraction.");
  return response.output_parsed;
}
