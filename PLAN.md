# OpenAI Multimodal Integration Plan

## Summary
Convert the current static prototype into a Vercel-ready app with a small server-side API layer that connects to OpenAI models for evidence parsing, voice-note transcription, document/sheet extraction, incident-draft generation. The browser must never receive the OpenAI API key.

Sources: [Responses API](https://developers.openai.com/api/reference/cli/resources/responses/methods/create), [file/image inputs](https://developers.openai.com/api/reference/resources/files), [audio transcription examples](https://developers.openai.com/api/reference/ruby).

## Key Architecture
- Move from pure static files to a Vercel Node app:
  - Keep `index.html`, `styles.css`, and `app.js`.
  - Add `/api/extract-evidence`, `/api/transcribe-audio`.
  - Store `OPENAI_API_KEY` only as a Vercel environment variable.
- Use OpenAI Responses API for structured extraction from:
  - Screenshots and images: payment receipts, UPI screenshots, chat screenshots, social screenshots.
  - PDFs: Aadhaar/profile mock extraction and evidence documents.
  - Extracted text from docs/sheets.
- Use server-side parsers before calling OpenAI for office files:
  - `.docx`: extract text server-side, then send text to model.
  - `.xlsx` / `.csv`: convert relevant rows/cells to compact text/JSON, then send to model.
  - `.pdf`: pass as file input when suitable; fallback to text extraction if needed.
- Use audio transcription for voice notes:
  - Upload voice note to `/api/transcribe-audio`.
  - Return transcript plus a cleaned incident-description draft.

## Input Screen Updates
- Replace each current “mock parse” upload area with a shared evidence input component:
  - File upload accepts `image/*`, `.pdf`, `.docx`, `.xlsx`, `.csv`, and common audio formats like `.mp3`, `.m4a`, `.wav`, `.webm`.
  - Add optional text box: “Paste message, URL, SMS, or notes.”
  - Add optional voice-note control: upload/record voice note.
  - Keep a visible fallback button: “Use demo sample” for hackathon demos if API is unavailable.
- Financial crime evidence screen:
  - Label accepted inputs as payment screenshots, bank SMS, transaction receipts, PDF statements, spreadsheets, and voice notes.
  - Parsed output continues to fill transaction fields, amount, date/time, bank/app, sender/recipient, reference number, and draft complaint text.
- Women/children evidence screen:
  - Label accepted inputs as chat screenshots, social media screenshots, saved images, PDFs, documents, links/notes, and voice notes.
  - Parsed output fills platform, date/time, category suggestion, people/usernames, timeline, and draft description.
  - Add a “Read this aloud” button for reassuring instructions and preview summary.
- Aadhaar/profile screen:
  - Keep Aadhaar extraction optional.
  - Use OpenAI parsing only to prefill name, gender, DOB, father/spouse name, and address.
  - Do not store uploaded Aadhaar after extraction; show “processed and discarded” in UI.

## API Contracts
- `POST /api/extract-evidence`
  - Input: `multipart/form-data` with `flowType`, files, and optional pasted text.
  - `flowType`: `financial`, `women_children`, or `profile`.
  - Output: structured JSON matching existing app state fields, plus `confidence` and `needsReview` flags.
- `POST /api/transcribe-audio`
  - Input: audio file and `flowType`.
  - Output: transcript, extracted fields where possible, and draft description.
  - Input: `{ text, voiceStyle }`.
  - Output: playable audio file/blob.
- All API responses must include:
  - `ok`
  - `mode`: `live_openai` or `demo_fallback`
  - `message`
  - `data`

## Safety And Privacy
- Add server-side file limits:
  - Images/PDF/docs/sheets: max 10 MB each.
  - Audio: max 10 MB.
  - Max 5 files per extraction request.
- Do not persist uploaded files in this version.
- Do not log raw Aadhaar, payment IDs, uploaded content, or transcripts.
- Send only the minimum required content to OpenAI.
- Keep the UI copy honest: “AI prepared this draft. Please review before submitting.”
- For women/children reports, avoid graphic generated text; summarize neutrally and supportively.
- Keep all real submission behavior mocked.

## Test Plan
- Financial flow parses an uploaded image/PDF and fills transaction fields.
- Financial flow parses pasted SMS text and fills UTR, amount, date, and bank/app.
- Women/children flow parses screenshot/doc text and fills platform, category suggestion, timeline, and draft.
- Voice note upload returns transcript and draft description.
- Text-to-speech plays a short instruction or preview summary.
- API failure falls back to existing demo sample data without blocking the flow.
- Invalid file type and oversized file show clear errors.
- API key is absent from client bundle and only used server-side.
- Existing mock flows still work without OpenAI credentials.
- Deploy to Vercel and test using public URL.

## Assumptions
- Use Vercel for the live API-backed demo, because ChatGPT Sites-style static hosting cannot safely hold `OPENAI_API_KEY`.
- Use configurable model names through environment variables:
  - `OPENAI_EXTRACT_MODEL` for multimodal extraction.
  - `OPENAI_TRANSCRIBE_MODEL` for audio transcription.
- Keep the current UI as the base and progressively upgrade upload buttons from mocked parsing to live OpenAI-backed parsing with demo fallback.
