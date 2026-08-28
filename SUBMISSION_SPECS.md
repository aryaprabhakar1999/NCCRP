# Submission specs (Build What Moves India)

## Four extraction response states

| State | UI message |
|-------|------------|
| High confidence | We found these details. Please review before submitting. |
| Low confidence | We found most details. N detail(s) need your attention. |
| Nothing extracted | We couldn't read the details clearly. You can still report this—review and complete the fields below. |
| Wrong file | This doesn't look like payment or incident evidence. Try a bank SMS, receipt, payment-app screenshot, or conversation screenshot. |

## Architecture (one page)

```
Citizen uploads evidence (or enters manually)
  → Session-only processing (not stored after refresh / new report)
  → OpenAI multimodal extract (gpt-4o-mini) + optional Whisper voice note
  → Deterministic checks (required fields, description length, UTR presence when claimed)
  → Field confidence / needsReview flags
  → Citizen verification (AI prepares; citizen decides)
  → Structured prototype complaint
  → Mock submit + prototype acknowledgement only
```

Labels: **AI** = extract/transcribe · **Deterministic** = validation · **Citizen** = review/edit/submit · **Government** = not integrated (link out to 1930 / cybercrime.gov.in).

## Section purpose copy (in product)

### Financial
- **Keep these details ready:** You can manually fill the report by having these details ready. For assistance and easier filling, upload the documents and attachments—AI will read and fill the form. You can simply review and submit them.
- **Personal Details:** Tell us who is filing and who was affected. This separates the reporting user from the victim when they are different people, and keeps identity documents ready for a real complaint later.
- **Incident Details:** Describe what happened and check money-movement facts (amount, UTR, date, app). AI may prefill from your evidence—you must review every field before continuing.
- **Suspect Details:** Optional. Share only suspect information you are sure about. Skipping this does not block the prototype report.
- **Preview:** Final check of the AI-assisted draft. Nothing is sent to the official portal; submit only creates a prototype acknowledgement for this demo.
- **Done:** Confirmation that the prototype journey finished. Use the next-step guidance for a real fraud (1930 / cybercrime.gov.in).

### Women & children
- **Keep these details ready:** Add screenshots or notes you feel safe sharing, or enter details manually. You stay in control of how much you reveal.
- **Personal Details (signed-in):** Choose how much of your signed-in identity appears in this report. You can limit contact details if that feels safer.
- **Incident Details:** Record what happened in plain language—category, when, where, and additional information. Share only what feels safe; this drafts the complaint narrative.
- **Suspect Details:** Optional identifiers, photo, or notes that may help an investigation. Skip if unsure.
- **Preview / Done:** Review before prototype submission; for danger call 112; for a real report use the official portal.

## Personal experience statement (draft, &lt;100 words)

When my father nearly lost his savings to a fraudster, my sister tried to report it on the National Cyber Crime Reporting Portal. Under pressure—and while calming a frightened parent—she could not get through the long form. We moved the money into a fixed deposit to stop further withdrawals. The crime was never formally reported. Victims already have screenshots and SMS; they should not have to retype everything when they are most distressed.

## Project summary draft (≤250 words)

**Who:** Indian citizens facing online financial fraud (and related cyber harm), often under time pressure.

**Hard today:** Official reporting asks people to turn evidence they already have into many structured fields. Under stress, that journey is slow and easy to abandon—only 17.7% of Indians aged 15+ report being able to use the cybercrime reporting portal (Ministry of Statistics, 2025).

**What we changed:** This independent prototype reverses the flow—upload a payment screenshot, SMS, or voice note; AI organises a draft; the citizen reviews and edits; then a mock submit produces a prototype acknowledgement.

**Why better:** Less distress-time typing, mobile-friendly steps, clear next actions (1930 / cybercrime.gov.in), and honest mock OTP and sample paths when live AI is unavailable.

**Works vs mocked:** OpenAI extract/transcribe can run live with an API key; OTP, acknowledgement numbers, and official submission are mocked. Files stay in the browser session only.

**Safe at scale:** Consent, minimisation of ID images, encryption, short retention, human review, and official integration only through approved channels—never scrape or impersonate government systems.

Word count: verify before paste into the form.

## You still own

- NCRP baseline recordings + timing table
- Five-trial prototype benchmark (median)
- Unassisted user test
- 2-minute video
- Incognito check of public URL
- Submit before 28 Aug 2026, 8:00 PM IST
