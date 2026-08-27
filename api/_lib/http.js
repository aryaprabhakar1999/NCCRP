import Busboy from "busboy";

export const MAX_REQUEST_BYTES = 4 * 1024 * 1024;
export const MAX_FILES = 5;

const allowedExtensions = new Set([
  ".png", ".jpg", ".jpeg", ".webp", ".gif", ".pdf", ".docx", ".xlsx", ".csv",
  ".mp3", ".m4a", ".wav", ".webm", ".ogg", ".mp4",
]);

export function sendJson(response, status, payload) {
  response.status(status);
  response.setHeader("Cache-Control", "no-store");
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.json(payload);
}

export function sendError(response, status, message, mode = "demo_fallback") {
  sendJson(response, status, { ok: false, mode, message, data: null });
}

export function requirePost(request, response) {
  if (request.method === "POST") return true;
  response.setHeader("Allow", "POST");
  sendError(response, 405, "This endpoint accepts POST requests only.");
  return false;
}

export function extensionOf(filename = "") {
  const index = filename.lastIndexOf(".");
  return index >= 0 ? filename.slice(index).toLowerCase() : "";
}

export function assertAllowedFile(file) {
  if (!allowedExtensions.has(extensionOf(file.filename))) {
    throw new Error(`Unsupported file type: ${extensionOf(file.filename) || "unknown"}.`);
  }
}

export function parseMultipart(request) {
  return new Promise((resolve, reject) => {
    const contentType = request.headers["content-type"] || "";
    if (!contentType.includes("multipart/form-data")) {
      reject(new Error("Expected a multipart form upload."));
      return;
    }

    const fields = {};
    const files = [];
    let totalBytes = 0;
    let parseError = null;
    let parser;

    try {
      parser = Busboy({
        headers: request.headers,
        limits: {
          files: MAX_FILES,
          fileSize: MAX_REQUEST_BYTES,
          fields: 10,
          fieldSize: 100_000,
        },
      });
    } catch {
      reject(new Error("The upload could not be read."));
      return;
    }

    parser.on("field", (name, value) => {
      fields[name] = value;
    });

    parser.on("file", (fieldName, stream, info) => {
      const chunks = [];
      const file = {
        fieldName,
        filename: info.filename || "upload",
        mimeType: info.mimeType || "application/octet-stream",
        buffer: null,
      };

      stream.on("data", (chunk) => {
        totalBytes += chunk.length;
        if (totalBytes > MAX_REQUEST_BYTES) {
          parseError = new Error("Files exceed the 4 MB total request limit.");
          return;
        }
        chunks.push(chunk);
      });
      stream.on("limit", () => {
        parseError = new Error("A file exceeds the 4 MB limit.");
      });
      stream.on("end", () => {
        if (!parseError) {
          file.buffer = Buffer.concat(chunks);
          try {
            assertAllowedFile(file);
            files.push(file);
          } catch (error) {
            parseError = error;
          }
        }
      });
    });

    parser.on("filesLimit", () => {
      parseError = new Error(`Upload no more than ${MAX_FILES} files at once.`);
    });
    parser.on("error", () => reject(new Error("The upload was interrupted.")));
    parser.on("finish", () => {
      if (parseError) reject(parseError);
      else resolve({ fields, files });
    });

    request.pipe(parser);
  });
}

export async function readJsonBody(request, maxBytes = 32_000) {
  if (request.body && typeof request.body === "object") return request.body;
  if (typeof request.body === "string") return JSON.parse(request.body);

  const chunks = [];
  let size = 0;
  for await (const chunk of request) {
    size += chunk.length;
    if (size > maxBytes) throw new Error("Request body is too large.");
    chunks.push(chunk);
  }
  return JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");
}
