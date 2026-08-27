import assert from "node:assert/strict";
import { stat } from "node:fs/promises";
import { chromium } from "playwright-core";

const baseUrl = process.env.BASE_URL || "http://127.0.0.1:4173/";

const browser = await chromium.launch({
  executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: true,
});

try {
  const desktop = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  await desktop.goto(baseUrl, { waitUntil: "networkidle" });
  assert.match(await desktop.title(), /Cyber Crime Reporting Portal/);
  assert.equal(await desktop.getByText("Not a government service").count(), 1);
  assert.equal(await desktop.getByRole("link", { name: /Call cybercrime helpline 1930/ }).count(), 1);
  assert.equal(await desktop.getByRole("button", { name: "Login / Sign up" }).count(), 1);
  await desktop.screenshot({ path: "/tmp/cyber-saathi-home.png", fullPage: true });

  await desktop.locator('[data-action="open-auth"]').click();
  await desktop.locator("#authMobileInput").fill("9876543210");
  const mobileFieldBox = await desktop.locator("#authMobileInput").boundingBox();
  const otpButtonBox = await desktop.locator('[data-action="send-auth-otp"]').boundingBox();
  assert.ok(otpButtonBox.y - (mobileFieldBox.y + mobileFieldBox.height) >= 10, "Login field needs a visible gap before Get OTP");
  await desktop.locator('[data-action="send-auth-otp"]').click();
  await desktop.locator("#authOtpInput").fill("123456");
  await desktop.locator('[data-action="fill-auth-profile"]').click();
  await desktop.locator('[data-action="complete-auth"]').click();
  assert.match(await desktop.locator("#authButton").textContent(), /Signed in/);
  await desktop.locator('[data-action="start-financial-report"]').click();
  assert.equal(await desktop.locator("h2").textContent(), "Keep these details ready");
  assert.equal(await desktop.locator("#prepareFinancialButton").isDisabled(), true);
  await desktop.screenshot({ path: "/tmp/cyber-saathi-prerequisites.png", fullPage: true });
  await desktop.locator('[data-action="mock-evidence-and-continue"]').click();
  assert.equal(await desktop.locator("#reportSectionContent h2").textContent(), "Personal Details");
  assert.equal(await desktop.locator(".section-nav button.current").textContent(), "1Personal DetailsAbout the complainant");
  await desktop.locator('[data-report-section="suspectDetails"]').click();
  await desktop.locator('[data-action="preview-financial-report"]').click();
  assert.equal(await desktop.locator("#reportSectionContent h2").textContent(), "Personal Details");
  await desktop.locator('[data-action="continue-report-section"][data-section="incidentDetails"]').click();
  assert.match(await desktop.locator("#financialExtractionMode").textContent(), /Synthetic sample/);
  assert.ok((await desktop.locator("#incidentDescription").inputValue()).length >= 200);
  await desktop.locator('[data-action="continue-report-section"][data-section="suspectDetails"]').click();
  assert.equal(await desktop.locator("#reportSectionContent h2").textContent(), "Suspect Details");
  await desktop.locator('[data-action="preview-financial-report"]').click();
  assert.equal(await desktop.locator(".preview-card").count(), 5);
  assert.match(await desktop.getByText("Same as the logged-in reporter").textContent(), /Same as/);
  await desktop.locator("#certify").check();
  await desktop.locator('[data-action="submit-report"]').click();
  assert.match(await desktop.locator(".ack-card").textContent(), /NCCRP-FIN-2026-10482/);
  assert.ok(await desktop.getByRole("link", { name: /1930/ }).count() >= 1);
  const downloadPromise = desktop.waitForEvent("download");
  await desktop.locator('[data-action="download-report-pdf"]').click();
  const download = await downloadPromise;
  assert.match(download.suggestedFilename(), /\.pdf$/);
  const downloadedFile = await download.path();
  assert.ok((await stat(downloadedFile)).size > 1000, "Downloaded PDF should not be empty");
  await desktop.screenshot({ path: "/tmp/cyber-saathi-complete.png", fullPage: true });

  const otherPerson = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  await otherPerson.goto(baseUrl, { waitUntil: "networkidle" });
  await otherPerson.locator('[data-action="start-financial-report"]').click();
  await otherPerson.locator('[data-action="start-new-financial"]').click();
  assert.match(await otherPerson.locator(".document-empty").textContent(), /Upload a synthetic identity/);
  await otherPerson.locator('[data-action="fill-profile"]').click();
  assert.match(await otherPerson.locator("#signupIdentityDocument").textContent(), /Sample document/);
  await otherPerson.locator('[data-action="save-profile"]').click();
  assert.match(await otherPerson.locator("#reporterIdentityReadiness").textContent(), /Reporter identity ready/);
  await otherPerson.locator("#evidenceUpload").setInputFiles({
    name: "synthetic-payment-proof.png",
    mimeType: "image/png",
    buffer: Buffer.from("synthetic image bytes"),
  });
  await otherPerson.locator("#prepareFinancialButton").click();
  await otherPerson.locator("#financialProcessingState.error").waitFor();
  await otherPerson.locator('[data-action="mock-evidence-and-continue"]').click();
  await otherPerson.locator('input[name="reportFor"][value="other"]').check();
  await otherPerson.locator("#relationshipToVictim").selectOption({ label: "Family member" });
  await otherPerson.locator("#victimIdentityType").selectOption("Voter ID");
  await otherPerson.locator("#victimIdentityUpload").setInputFiles({
    name: "synthetic-voter-id.pdf",
    mimeType: "application/pdf",
    buffer: Buffer.from("%PDF-1.4 synthetic test identity"),
  });
  await otherPerson.locator("#victimConsent").check();
  assert.match(await otherPerson.locator("#victimIdentityDocument").textContent(), /synthetic-voter-id.pdf/);
  await otherPerson.locator('[data-action="continue-report-section"][data-section="incidentDetails"]').click();
  assert.match(await otherPerson.locator("#incidentEvidenceDocuments").textContent(), /synthetic-payment-proof.png/);
  await otherPerson.locator('[data-action="continue-report-section"][data-section="suspectDetails"]').click();
  await otherPerson.locator('[data-action="preview-financial-report"]').click();
  assert.match(await otherPerson.getByText("Affected Person", { exact: true }).textContent(), /Affected Person/);
  assert.match(await otherPerson.getByText("Family member", { exact: true }).textContent(), /Family member/);
  assert.match(await otherPerson.getByText("Voter ID attached", { exact: true }).textContent(), /Voter ID attached/);
  await otherPerson.screenshot({ path: "/tmp/cyber-saathi-other-person.png", fullPage: true });
  await otherPerson.locator("#certify").check();
  await otherPerson.locator('[data-action="submit-report"]').click();
  const otherDownloadPromise = otherPerson.waitForEvent("download");
  await otherPerson.locator('[data-action="download-report-pdf"]').click();
  const otherDownload = await otherDownloadPromise;
  assert.ok((await stat(await otherDownload.path())).size > 1000, "Other-person PDF should not be empty");

  await desktop.locator('[data-action="go-home"]').click();
  assert.match(await desktop.locator("#authButton").textContent(), /Signed in/);
  await desktop.locator('[data-next="trackingHome"]').click();
  await desktop.locator('[data-action="open-tracking-list"]').click();
  assert.equal(await desktop.locator("h2").textContent(), "Submitted complaint status");
  assert.equal(await desktop.locator("#authMobileInput").count(), 0);
  await desktop.locator('[data-next="trackingHome"]').click();
  await desktop.locator('[data-action="go-home"]').click();

  await desktop.locator('[data-action="start-wc-report"]').click();
  await desktop.locator('[data-action="start-wc-signed-in"]').click();
  assert.match(await desktop.locator("#wcModeLabel").textContent(), /Signed-in report/);
  await desktop.locator('[data-next="wcEvidence"]').click();
  await desktop.locator('[data-action="mock-wc-evidence"]').click();
  assert.equal(await desktop.locator("#wcSectionContent h2").textContent(), "Personal Details");
  assert.equal(await desktop.locator('[data-field="name"]').inputValue(), "Arya Prabhakar");
  await desktop.locator('[data-action="continue-wc-section"][data-section="incidentDetails"]').click();
  assert.equal(await desktop.locator("#wcSectionContent h2").textContent(), "Incident Details");
  assert.match(await desktop.locator("#wcEvidenceDocuments").textContent(), /Synthetic-safety-screenshot/);
  await desktop.locator('[data-action="preview-wc-report"]').click();
  assert.equal(await desktop.locator(".preview-card").count(), 3);
  await desktop.locator("#wcCertify").check();
  await desktop.locator('[data-action="submit-wc-report"]').click();
  assert.equal(await desktop.locator("h2").textContent(), "Report prepared");
  assert.doesNotMatch(await desktop.locator("body").innerText(), /\bdemo\b/i);

  const wcAnonymous = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  await wcAnonymous.goto(baseUrl, { waitUntil: "networkidle" });
  await wcAnonymous.locator('[data-action="start-wc-report"]').click();
  await wcAnonymous.locator('[data-action="start-wc-anonymous"]').click();
  await wcAnonymous.locator('[data-next="wcEvidence"]').click();
  await wcAnonymous.locator('[data-action="mock-wc-evidence"]').click();
  assert.equal(await wcAnonymous.locator("#wcSectionContent h2").textContent(), "Personal Details");
  assert.equal(await wcAnonymous.locator('input[name="wcModeChoice"][value="anonymous"]').isChecked(), true);
  await wcAnonymous.locator('[data-action="continue-wc-section"][data-section="incidentDetails"]').click();
  await wcAnonymous.locator('[data-action="preview-wc-report"]').click();
  assert.match(await wcAnonymous.getByText("Anonymous report", { exact: true }).textContent(), /Anonymous report/);
  assert.doesNotMatch(await wcAnonymous.locator("body").innerText(), /\bdemo\b/i);

  const mobile = await browser.newPage({ viewport: { width: 375, height: 812 }, isMobile: true });
  await mobile.goto(baseUrl, { waitUntil: "networkidle" });
  await mobile.locator('[data-action="start-financial-report"]').click();
  await mobile.locator('[data-action="start-existing-financial"]').click();
  await mobile.locator("#mobileInput").fill("9876543210");
  await mobile.locator('[data-action="send-otp"]').click();
  await mobile.locator("#otpInput").fill("123456");
  await mobile.locator('[data-action="verify-otp"]').click();
  await mobile.locator('[data-action="mock-evidence-and-continue"]').click();
  const dimensions = await mobile.evaluate(() => ({
    page: document.documentElement.scrollWidth,
    viewport: document.documentElement.clientWidth,
  }));
  assert.ok(dimensions.page <= dimensions.viewport, `Mobile overflow: ${dimensions.page}px > ${dimensions.viewport}px`);
  assert.equal(await mobile.locator(".section-nav button").count(), 3);
  assert.equal(await mobile.locator("#reportSectionContent h2").textContent(), "Personal Details");
  assert.equal(await mobile.evaluate(() => document.activeElement?.tagName), "H2");
  await mobile.screenshot({ path: "/tmp/cyber-saathi-mobile-workspace.png", fullPage: true });

  console.log("Browser smoke test passed.");
  console.log("/tmp/cyber-saathi-home.png");
  console.log("/tmp/cyber-saathi-prerequisites.png");
  console.log("/tmp/cyber-saathi-complete.png");
  console.log("/tmp/cyber-saathi-other-person.png");
  console.log("/tmp/cyber-saathi-mobile-workspace.png");
} finally {
  await browser.close();
}
