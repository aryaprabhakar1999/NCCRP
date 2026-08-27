import mammoth from "mammoth";
import { strFromU8, unzipSync } from "fflate";
import { extensionOf } from "./http.js";

const MAX_TEXT_CHARS = 24_000;
const imageExtensions = new Set([".png", ".jpg", ".jpeg", ".webp", ".gif"]);

function compactText(text) {
  return String(text || "").replace(/\0/g, "").replace(/[ \t]+/g, " ").trim().slice(0, MAX_TEXT_CHARS);
}

function decodeXml(value) {
  return String(value || "")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'");
}

function spreadsheetToText(buffer) {
  const archive = unzipSync(new Uint8Array(buffer));
  const sharedXml = archive["xl/sharedStrings.xml"] ? strFromU8(archive["xl/sharedStrings.xml"]) : "";
  const sharedStrings = Array.from(sharedXml.matchAll(/<si\b[^>]*>([\s\S]*?)<\/si>/g), (match) =>
    decodeXml(Array.from(match[1].matchAll(/<t\b[^>]*>([\s\S]*?)<\/t>/g), (text) => text[1]).join(""))
  );

  const output = [];
  Object.entries(archive)
    .filter(([name]) => /^xl\/worksheets\/sheet\d+\.xml$/.test(name))
    .sort(([left], [right]) => left.localeCompare(right, undefined, { numeric: true }))
    .forEach(([name, bytes]) => {
      output.push(`Sheet: ${name.split("/").pop()}`);
      const xml = strFromU8(bytes);
      for (const rowMatch of xml.matchAll(/<row\b[^>]*>([\s\S]*?)<\/row>/g)) {
        const cells = [];
        for (const cellMatch of rowMatch[1].matchAll(/<c\b([^>]*)>([\s\S]*?)<\/c>/g)) {
          const attributes = cellMatch[1];
          const body = cellMatch[2];
          const reference = /\br="([^"]+)"/.exec(attributes)?.[1] || "?";
          const raw = /<v\b[^>]*>([\s\S]*?)<\/v>/.exec(body)?.[1]
            ?? /<t\b[^>]*>([\s\S]*?)<\/t>/.exec(body)?.[1]
            ?? "";
          const value = /\bt="s"/.test(attributes) ? sharedStrings[Number(raw)] ?? raw : decodeXml(raw);
          if (value !== "") cells.push(`${reference}=${value}`);
        }
        if (cells.length) output.push(cells.join(" | "));
      }
    });
  return compactText(output.join("\n"));
}

export async function buildModelContent(files, pastedText) {
  const content = [];
  const textParts = [];
  if (pastedText) textParts.push(`Citizen-provided text:\n${compactText(pastedText)}`);

  for (const file of files) {
    const extension = extensionOf(file.filename);
    if (imageExtensions.has(extension)) {
      content.push({
        type: "input_image",
        image_url: `data:${file.mimeType};base64,${file.buffer.toString("base64")}`,
        detail: "auto",
      });
    } else if (extension === ".pdf") {
      content.push({
        type: "input_file",
        filename: file.filename,
        file_data: `data:application/pdf;base64,${file.buffer.toString("base64")}`,
      });
    } else if (extension === ".docx") {
      const result = await mammoth.extractRawText({ buffer: file.buffer });
      textParts.push(`Extracted from ${file.filename}:\n${compactText(result.value)}`);
    } else if (extension === ".xlsx") {
      textParts.push(`Extracted from ${file.filename}:\n${spreadsheetToText(file.buffer)}`);
    } else if (extension === ".csv") {
      textParts.push(`Extracted from ${file.filename}:\n${compactText(file.buffer.toString("utf8"))}`);
    }
  }

  if (textParts.length) content.unshift({ type: "input_text", text: textParts.join("\n\n") });
  return content;
}
