import { buildModelContent } from "./_lib/content.js";
import { fallbackFor } from "./_lib/fallbacks.js";
import { parseMultipart, requirePost, sendError, sendJson } from "./_lib/http.js";
import { extractStructured, hasOpenAiKey } from "./_lib/openai.js";

const flows = new Set(["financial", "women_children", "profile"]);

export default async function handler(request, response) {
  if (!requirePost(request, response)) return;

  let upload;
  try {
    upload = await parseMultipart(request);
    const flowType = upload.fields.flowType;
    if (!flows.has(flowType)) return sendError(response, 400, "Choose a valid report type.");
    if (!upload.files.length && !upload.fields.pastedText?.trim()) {
      return sendError(response, 400, "Add a supported file or paste some text.");
    }

    if (!hasOpenAiKey()) {
      return sendJson(response, 200, {
        ok: true,
        mode: "demo_fallback",
        message: "OpenAI is not configured, so sample data was used.",
        data: fallbackFor(flowType),
      });
    }

    const content = await buildModelContent(upload.files, upload.fields.pastedText);
    if (!content.length) return sendError(response, 400, "No supported evidence content was found.");

    if (flowType === "profile" && upload.fields.documentType) {
      content.unshift({
        type: "input_text",
        text: `Document type selected by citizen: ${upload.fields.documentType}. Prefer labels typical of that Indian ID.`,
      });
    }

    try {
      const data = await extractStructured(flowType, content);
      return sendJson(response, 200, {
        ok: true,
        mode: "live_openai",
        message: "Evidence was organised by AI. Review every field before continuing.",
        data,
      });
    } catch {
      return sendJson(response, 200, {
        ok: true,
        mode: "demo_fallback",
        message: "Live extraction was unavailable, so sample data was used.",
        data: fallbackFor(flowType),
      });
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "The evidence could not be processed.";
    return sendError(response, 400, message);
  } finally {
    if (upload?.files) {
      upload.files.forEach((file) => file.buffer?.fill(0));
    }
  }
}
