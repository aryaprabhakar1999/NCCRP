import { toFile } from "openai";
import { fallbackFinancial, fallbackWomenChildren } from "./_lib/fallbacks.js";
import { parseMultipart, requirePost, sendError, sendJson } from "./_lib/http.js";
import { hasOpenAiKey, openAiClient } from "./_lib/openai.js";
import { extractSuspectHintsFromText, suspectHintsToExtractedFields } from "../lib/suspectHints.js";

function fallbackAudio(flowType) {
  if (flowType === "women_children") {
    return {
      transcript: "Voice note: I want to report repeated unwanted messages and threats from an Instagram account named unknown_profile. They also messaged from mobile 9123456780.",
      draftDescription: fallbackWomenChildren.complaint.description,
      extractedFields: {
        suspectUsername: "@unknown_profile",
        suspectMobile: "9123456780",
      },
    };
  }
  return {
    transcript: "Voice note: Someone named Ravi Kumar called from 9876512340. Twenty-four thousand five hundred rupees left my account through UPI without my permission.",
    draftDescription: fallbackFinancial.complaint.description,
    extractedFields: {
      suspectName: "Ravi Kumar",
      suspectMobile: "9876512340",
    },
  };
}

async function prepareDraft(client, flowType, transcript) {
  const safety = flowType === "women_children"
    ? "Use neutral, non-graphic and supportive language. Do not repeat explicit content."
    : "Clearly state the transaction facts and request urgent review.";
  const response = await client.responses.create({
    model: process.env.OPENAI_EXTRACT_MODEL || "gpt-4o-mini",
    input: [
      {
        role: "system",
        content: `Turn a citizen's voice-note transcript into an editable first-person Indian cybercrime incident description of 200–900 characters. ${safety} Include any spoken suspect name, mobile number, username, or platform when present. Do not invent details.`,
      },
      { role: "user", content: transcript },
    ],
  });
  return response.output_text?.trim() || transcript;
}

export default async function handler(request, response) {
  if (!requirePost(request, response)) return;

  let upload;
  try {
    upload = await parseMultipart(request);
    const flowType = upload.fields.flowType;
    if (!["financial", "women_children"].includes(flowType)) {
      return sendError(response, 400, "Choose a valid report type.");
    }
    const audio = upload.files.find((file) => file.fieldName === "audio");
    if (!audio) return sendError(response, 400, "Add one supported voice-note file.");

    if (!hasOpenAiKey()) {
      return sendJson(response, 200, {
        ok: true,
        mode: "demo_fallback",
        message: "OpenAI is not configured, so a sample transcript was used.",
        data: fallbackAudio(flowType),
      });
    }

    try {
      const client = openAiClient();
      const file = await toFile(audio.buffer, audio.filename, { type: audio.mimeType });
      const transcription = await client.audio.transcriptions.create({
        file,
        model: process.env.OPENAI_TRANSCRIBE_MODEL || "whisper-1",
      });
      const transcript = transcription.text?.trim();
      if (!transcript) throw new Error("No speech was detected.");
      const draftDescription = await prepareDraft(client, flowType, transcript);
      const extractedFields = suspectHintsToExtractedFields(extractSuspectHintsFromText(transcript));
      return sendJson(response, 200, {
        ok: true,
        mode: "live_openai",
        message: "Voice note transcribed. Review the transcript and prepared draft.",
        data: { transcript, draftDescription, extractedFields },
      });
    } catch {
      return sendJson(response, 200, {
        ok: true,
        mode: "demo_fallback",
        message: "Live transcription was unavailable, so a sample transcript was used.",
        data: fallbackAudio(flowType),
      });
    }
  } catch (error) {
    return sendError(response, 400, error instanceof Error ? error.message : "The voice note could not be processed.");
  } finally {
    if (upload?.files) upload.files.forEach((file) => file.buffer?.fill(0));
  }
}
