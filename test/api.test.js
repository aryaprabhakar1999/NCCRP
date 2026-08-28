import test from "node:test";
import assert from "node:assert/strict";
import { Readable } from "node:stream";
import { strToU8, zipSync } from "fflate";
import extractHandler from "../api/extract-evidence.js";
import transcribeHandler from "../api/transcribe-audio.js";
import { buildModelContent } from "../api/_lib/content.js";
import { fallbackFinancial, fallbackProfile, fallbackWomenChildren } from "../api/_lib/fallbacks.js";
import { assertAllowedFile, MAX_REQUEST_BYTES } from "../api/_lib/http.js";
import { financialSchema, profileSchema, womenChildrenSchema } from "../api/_lib/schemas.js";

function mockResponse() {
  return {
    statusCode: 200,
    headers: {},
    payload: null,
    status(code) { this.statusCode = code; return this; },
    setHeader(name, value) { this.headers[name] = value; },
    json(payload) { this.payload = payload; return this; },
  };
}

function multipartRequest(fields, files = []) {
  const boundary = "----CyberSaathiTestBoundary";
  const chunks = [];
  Object.entries(fields).forEach(([name, value]) => {
    chunks.push(Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="${name}"\r\n\r\n${value}\r\n`));
  });
  files.forEach((file) => {
    chunks.push(Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="${file.fieldName}"; filename="${file.filename}"\r\nContent-Type: ${file.mimeType}\r\n\r\n`));
    chunks.push(file.buffer);
    chunks.push(Buffer.from("\r\n"));
  });
  chunks.push(Buffer.from(`--${boundary}--\r\n`));
  const request = Readable.from(chunks);
  request.method = "POST";
  request.headers = { "content-type": `multipart/form-data; boundary=${boundary}` };
  return request;
}

test("synthetic fallbacks conform to strict response schemas", () => {
  assert.equal(financialSchema.parse(fallbackFinancial).transaction.utr, "409812345678");
  assert.equal(womenChildrenSchema.parse(fallbackWomenChildren).evidence.platform, "Instagram");
  assert.equal(profileSchema.parse(fallbackProfile).profile.name, "Ananya Sharma");
  assert.ok(fallbackFinancial.complaint.description.length >= 200);
  assert.ok(fallbackWomenChildren.complaint.description.length >= 200);
});

test("content builder keeps pasted text and CSV evidence compact", async () => {
  const content = await buildModelContent([
    {
      filename: "transactions.csv",
      mimeType: "text/csv",
      buffer: Buffer.from("amount,utr\n24500,409812345678"),
    },
  ], "UPI debit SMS");
  assert.equal(content.length, 1);
  assert.match(content[0].text, /UPI debit SMS/);
  assert.match(content[0].text, /409812345678/);
});

test("content builder extracts shared strings and cells from XLSX", async () => {
  const workbook = zipSync({
    "xl/sharedStrings.xml": strToU8("<sst><si><t>UTR</t></si><si><t>409812345678</t></si></sst>"),
    "xl/worksheets/sheet1.xml": strToU8("<worksheet><sheetData><row><c r=\"A1\" t=\"s\"><v>0</v></c><c r=\"B1\" t=\"s\"><v>1</v></c></row></sheetData></worksheet>"),
  });
  const content = await buildModelContent([
    { filename: "evidence.xlsx", mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", buffer: Buffer.from(workbook) },
  ], "");
  assert.match(content[0].text, /A1=UTR/);
  assert.match(content[0].text, /B1=409812345678/);
});

test("file validation accepts planned formats and rejects executables", () => {
  assert.doesNotThrow(() => assertAllowedFile({ filename: "receipt.pdf" }));
  assert.doesNotThrow(() => assertAllowedFile({ filename: "voice.webm" }));
  assert.throws(() => assertAllowedFile({ filename: "malware.exe" }), /Unsupported file type/);
  assert.equal(MAX_REQUEST_BYTES, 4 * 1024 * 1024);
});

test("evidence endpoint returns an honest synthetic fallback without an API key", async () => {
  const originalKey = process.env.OPENAI_API_KEY;
  delete process.env.OPENAI_API_KEY;
  const request = multipartRequest({ flowType: "financial", pastedText: "INR 24500 UTR 409812345678" });
  const response = mockResponse();
  await extractHandler(request, response);
  if (originalKey) process.env.OPENAI_API_KEY = originalKey;
  assert.equal(response.statusCode, 200);
  assert.equal(response.payload.ok, true);
  assert.equal(response.payload.mode, "demo_fallback");
  assert.equal(response.payload.data.transaction.utr, "409812345678");
});

test("audio endpoint falls back safely without an API key", async () => {
  const originalKey = process.env.OPENAI_API_KEY;
  delete process.env.OPENAI_API_KEY;
  const request = multipartRequest(
    { flowType: "women_children" },
    [{ fieldName: "audio", filename: "note.webm", mimeType: "audio/webm", buffer: Buffer.from("synthetic-audio") }],
  );
  const response = mockResponse();
  await transcribeHandler(request, response);
  if (originalKey) process.env.OPENAI_API_KEY = originalKey;
  assert.equal(response.payload.mode, "demo_fallback");
  assert.match(response.payload.data.transcript, /Voice note/);
  assert.equal(response.payload.data.extractedFields.suspectMobile, "9123456780");
  assert.ok(response.payload.data.draftDescription.length >= 200);
});

test("financial audio fallback includes suspect name and mobile for mapping", async () => {
  const originalKey = process.env.OPENAI_API_KEY;
  delete process.env.OPENAI_API_KEY;
  const request = multipartRequest(
    { flowType: "financial" },
    [{ fieldName: "audio", filename: "note.webm", mimeType: "audio/webm", buffer: Buffer.from("synthetic-audio") }],
  );
  const response = mockResponse();
  await transcribeHandler(request, response);
  if (originalKey) process.env.OPENAI_API_KEY = originalKey;
  assert.equal(response.payload.data.extractedFields.suspectName, "Ravi Kumar");
  assert.equal(response.payload.data.extractedFields.suspectMobile, "9876512340");
  assert.match(response.payload.data.transcript, /Ravi Kumar/);
});

test("evidence fallback includes suspect object for financial and women-children flows", () => {
  assert.equal(fallbackFinancial.suspect.name, "Ravi Kumar");
  assert.equal(fallbackFinancial.suspect.mobile, "9876512340");
  assert.equal(fallbackWomenChildren.suspect.username, "@unknown_profile");
  assert.equal(financialSchema.parse(fallbackFinancial).suspect.mobile, "9876512340");
  assert.equal(womenChildrenSchema.parse(fallbackWomenChildren).suspect.username, "@unknown_profile");
});

test("evidence endpoint rejects unsupported files before model processing", async () => {
  const request = multipartRequest(
    { flowType: "financial" },
    [{ fieldName: "files", filename: "unsafe.exe", mimeType: "application/octet-stream", buffer: Buffer.from("not-an-image") }],
  );
  const response = mockResponse();
  await extractHandler(request, response);
  assert.equal(response.statusCode, 400);
  assert.equal(response.payload.ok, false);
  assert.match(response.payload.message, /Unsupported file type/);
});
