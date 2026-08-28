import test from "node:test";
import assert from "node:assert/strict";
import {
  extractSuspectHintsFromText,
  normalizeIndianMobile,
  suspectHintsToExtractedFields,
} from "../lib/suspectHints.js";

test("extracts financial voice-note suspect name and mobile", () => {
  const hints = extractSuspectHintsFromText(
    "Someone named Ravi Kumar called from 9876512340. Money left my UPI account."
  );
  assert.equal(hints.name, "Ravi Kumar");
  assert.equal(hints.mobile, "9876512340");
  assert.deepEqual(suspectHintsToExtractedFields(hints), {
    suspectName: "Ravi Kumar",
    suspectMobile: "9876512340",
  });
});

test("extracts women-children voice-note username and mobile", () => {
  const hints = extractSuspectHintsFromText(
    "Threats from an Instagram account named unknown_profile. They also messaged from mobile 9123456780."
  );
  assert.equal(hints.username, "@unknown_profile");
  assert.equal(hints.mobile, "9123456780");
});

test("normalizes Indian mobile variants", () => {
  assert.equal(normalizeIndianMobile("+91 98765 12340"), "9876512340");
  assert.equal(normalizeIndianMobile("09876512340"), "9876512340");
  assert.equal(normalizeIndianMobile("12345"), "");
});
