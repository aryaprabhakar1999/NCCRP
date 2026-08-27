import { readJsonBody, requirePost, sendError, sendJson } from "./_lib/http.js";
import { hasOpenAiKey, openAiClient } from "./_lib/openai.js";

export default async function handler(request, response) {
  if (!requirePost(request, response)) return;

  try {
    const body = await readJsonBody(request);
    const text = String(body.text || "").trim();
    if (!text) return sendError(response, 400, "Add text to read aloud.");
    if (text.length > 1200) return sendError(response, 400, "Read-aloud text must be under 1,200 characters.");
    if (!hasOpenAiKey()) return sendError(response, 503, "Live audio is not configured for this prototype.");

    const client = openAiClient();
    const audio = await client.audio.speech.create({
      model: process.env.OPENAI_TTS_MODEL || "gpt-4o-mini-tts",
      voice: process.env.OPENAI_TTS_VOICE || "coral",
      input: text,
      instructions: String(body.voiceStyle || "calm, clear, and reassuring").slice(0, 120),
      response_format: "mp3",
    });
    const audioBase64 = Buffer.from(await audio.arrayBuffer()).toString("base64");
    return sendJson(response, 200, {
      ok: true,
      mode: "live_openai",
      message: "Audio guidance is ready.",
      data: { audioBase64, contentType: "audio/mpeg" },
    });
  } catch {
    return sendError(response, 503, "Audio guidance is temporarily unavailable.");
  }
}
