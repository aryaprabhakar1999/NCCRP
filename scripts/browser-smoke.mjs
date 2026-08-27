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
  assert.equal(await desktop.getByRole("button", { name: "Login" }).count(), 1);
  assert.equal(await desktop.getByRole("button", { name: "Sign up" }).count(), 1);
  await desktop.screenshot({ path: "/tmp/cyber-saathi-home.png", fullPage: true });

  await desktop.locator('[data-action="open-signup"]').click();
  await desktop.locator("#signupMobileInput").fill("9876543210");
  const mobileFieldBox = await desktop.locator("#signupMobileInput").boundingBox();
  const otpButtonBox = await desktop.locator('[data-action="send-signup-otp"]').boundingBox();
  assert.ok(otpButtonBox.y - (mobileFieldBox.y + mobileFieldBox.height) >= 10, "Login field needs a visible gap before Get OTP");
  await desktop.locator('[data-action="send-signup-otp"]').click();
  await desktop.locator("#signupOtpInput").fill("123456");
  await desktop.locator('[data-action="verify-signup-otp"]').click();
  assert.equal(await desktop.locator("#signupMobileInput").isDisabled(), true);
  assert.equal(await desktop.locator("#sendSignupOtpButton").isDisabled(), true);
  assert.equal(await desktop.locator("#signupIdentityArea.hidden").count(), 0);
  assert.equal(await desktop.locator('[data-action="fill-signup-profile"]').count(), 1);
  await desktop.locator("#signupIdentityUpload").setInputFiles({
    name: "identity-sample.png",
    mimeType: "image/png",
    buffer: Buffer.from("identity image bytes"),
  });
  await desktop.locator('[data-action="process-signup-profile"]').click();
  await desktop.locator("#signupProfileArea:not(.hidden)").waitFor();
  await desktop.locator('[data-action="save-signup"]').click();
  assert.match(await desktop.locator("#authButton").textContent(), /Signed in/);
  await desktop.locator('[data-action="start-financial-report"]').click();
  assert.equal(await desktop.locator("h2").textContent(), "Keep these details ready");
  assert.equal(await desktop.locator("details.other-inputs[open]").count(), 0);
  assert.equal(await desktop.locator('[data-action="manual-financial-continue"]').count(), 1);
  assert.equal(await desktop.locator("#prepareFinancialButton").isDisabled(), true);
  await desktop.screenshot({ path: "/tmp/cyber-saathi-prerequisites.png", fullPage: true });
  await desktop.locator('[data-action="mock-evidence-and-continue"]').click();
  assert.equal(await desktop.locator("#reportSectionContent h2").textContent(), "Personal Details");
  assert.equal(await desktop.locator(".section-nav button.current").textContent(), "1Personal DetailsAbout the complainant");
  await desktop.locator('[data-report-section="suspectDetails"]').click();
  await desktop.locator('[data-action="preview-financial-report"]').click();
  assert.equal(await desktop.locator("#reportSectionContent h2").textContent(), "Personal Details");
  await desktop.locator('[data-action="continue-report-section"][data-section="incidentDetails"]').click();
  assert.match(await desktop.locator("#financialExtractionMode").textContent(), /Sample/);
  assert.ok((await desktop.locator("#incidentDescription").inputValue()).length >= 200);
  await desktop.locator('[data-action="continue-report-section"][data-section="suspectDetails"]').click();
  assert.equal(await desktop.locator("#reportSectionContent h2").textContent(), "Suspect Details");
  assert.equal(await desktop.locator("#financialSuspectFields").count(), 1);
  assert.equal(await desktop.locator("#wcSuspectName").count(), 1);
  await desktop.locator("#shareSuspect").check();
  assert.ok(await desktop.locator("#financialSuspectFields").evaluate((el) => el.classList.contains("active")));
  await desktop.locator("#wcSuspectName").fill("Sample Suspect");
  await desktop.locator('[data-action="preview-financial-report"]').click();
  assert.equal(await desktop.locator(".preview-card").count(), 5);
  assert.match(await desktop.getByText("Same as the logged-in reporter").textContent(), /Same as/);
  assert.match(await desktop.getByText("Sample Suspect", { exact: true }).textContent(), /Sample Suspect/);
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
  assert.equal(await otherPerson.locator("h2").textContent(), "Create your reporting profile");
  await otherPerson.locator("#signupMobileInput").fill("9123456780");
  await otherPerson.locator('[data-action="send-signup-otp"]').click();
  await otherPerson.locator("#signupOtpInput").fill("123456");
  await otherPerson.locator('[data-action="verify-signup-otp"]').click();
  await otherPerson.locator('[data-action="fill-signup-profile"]').click();
  await otherPerson.locator("#signupProfileArea:not(.hidden)").waitFor();
  await otherPerson.locator('[data-action="save-signup"]').click();
  assert.equal(await otherPerson.locator("h2").textContent(), "Keep these details ready");
  assert.match(await otherPerson.locator("#reporterIdentityReadiness").textContent(), /Reporter identity ready/);
  assert.equal(await otherPerson.locator("details.other-inputs[open]").count(), 0);
  await otherPerson.locator('[data-action="manual-financial-continue"]').click();
  assert.equal(await otherPerson.locator("#reportSectionContent h2").textContent(), "Personal Details");
  await otherPerson.locator('input[name="reportFor"][value="other"]').check();
  assert.equal(await otherPerson.locator("details.reporting-user-details").count(), 1);
  assert.match(await otherPerson.locator(".reporting-user-details summary").textContent(), /Reporting user/);
  await otherPerson.locator("#relationshipToVictim").selectOption({ label: "Family member" });
  await otherPerson.locator("#victimIdentityType").selectOption("Voter ID");
  await otherPerson.locator("#victimIdentityUpload").setInputFiles({
    name: "voter-id.pdf",
    mimeType: "application/pdf",
    buffer: Buffer.from("%PDF-1.4 test identity"),
  });
  await otherPerson.locator("#victimConsent").check();
  assert.match(await otherPerson.locator("#victimIdentityDocument").textContent(), /voter-id.pdf/);
  await otherPerson.locator('[data-action="continue-report-section"][data-section="incidentDetails"]').click();
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

  await desktop.locator('[data-action="go-home"]').filter({ hasText: "Start another report" }).click();
  assert.match(await desktop.locator("#authButton").textContent(), /Signed in/);
  await desktop.locator('[data-next="trackingHome"]').click();
  await desktop.locator('[data-action="open-tracking-list"]').click();
  assert.equal(await desktop.locator("h2").textContent(), "Submitted complaint status");
  assert.equal(await desktop.locator("#loginMobileInput").count(), 0);
  await desktop.locator('[data-next="trackingHome"]').click();
  await desktop.getByRole("button", { name: "Go to home" }).click();

  await desktop.locator('[data-action="start-wc-report"]').click();
  await desktop.locator('[data-action="start-wc-signed-in"]').click();
  assert.match(await desktop.locator("#wcModeLabel").textContent(), /Signed-in report/);
  assert.equal(await desktop.locator("h2").textContent(), "Keep these details ready");
  assert.equal(await desktop.locator("details.other-inputs[open]").count(), 0);
  assert.equal(await desktop.locator('[data-action="start-wc-manual"]').count(), 1);
  assert.match(await desktop.locator(".upload-intro").textContent(), /screenshots of conversations/);
  await desktop.locator('[data-action="mock-wc-evidence"]').click();
  assert.equal(await desktop.locator("#wcSectionContent h2").textContent(), "Personal Details");
  assert.equal(await desktop.locator('[data-wc-section]').count(), 3);
  assert.equal(await desktop.locator('input[name="wcModeChoice"]').count(), 0);
  assert.equal(await desktop.locator('[data-field="name"]').inputValue(), "Ananya Sharma");
  await desktop.locator('[data-action="continue-wc-section"][data-section="incidentDetails"]').click();
  assert.equal(await desktop.locator("#wcSectionContent h2").textContent(), "Incident Details");
  assert.equal(await desktop.locator("#wcEvidenceDocuments").count(), 0);
  assert.equal(await desktop.locator(".wc-evidence-form").count(), 0);
  assert.equal(await desktop.locator("#wcTimeline").count(), 0);
  assert.equal(await desktop.locator('[data-field="category"]').count(), 1);
  assert.equal(await desktop.locator('[data-field="delayReason"]').count(), 1);
  assert.equal(await desktop.locator('[data-field="occurredAt"]').count(), 1);
  assert.equal(await desktop.locator("#wcDescription").count(), 1);
  await desktop.locator('[data-action="continue-wc-section"][data-section="suspectDetails"]').click();
  assert.equal(await desktop.locator("#wcSectionContent h2").textContent(), "Suspect Details");
  assert.equal(await desktop.locator(".warn-hint").count(), 0);
  await desktop.locator('[data-action="preview-wc-report"]').click();
  assert.equal(await desktop.locator(".preview-card").count(), 4);
  await desktop.locator("#wcCertify").check();
  await desktop.locator('[data-action="submit-wc-report"]').click();
  assert.equal(await desktop.locator("h2").textContent(), "Report prepared");
  assert.doesNotMatch(await desktop.locator("body").innerText(), /\bdemo\b/i);

  const wcAnonymous = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  await wcAnonymous.goto(baseUrl, { waitUntil: "networkidle" });
  await wcAnonymous.locator('[data-action="start-wc-report"]').click();
  await wcAnonymous.locator('[data-action="start-wc-anonymous"]').click();
  assert.equal(await wcAnonymous.locator("h2").textContent(), "Keep these details ready");
  assert.equal(await wcAnonymous.locator("details.other-inputs[open]").count(), 0);
  assert.equal(await wcAnonymous.locator('[data-action="start-wc-manual"]').count(), 1);
  assert.match(await wcAnonymous.getByText("Videos (MP4, WEBM)").textContent(), /Videos/);
  await wcAnonymous.locator('[data-action="start-wc-manual"]').click();
  assert.equal(await wcAnonymous.locator("#wcSectionContent h2").textContent(), "Incident Details");
  assert.equal(await wcAnonymous.locator('[data-wc-section]').count(), 2);
  assert.equal(await wcAnonymous.locator('[data-wc-section="personalDetails"]').count(), 0);
  assert.equal(await wcAnonymous.locator(".wc-evidence-form").count(), 0);
  assert.equal(await wcAnonymous.locator("#wcTimeline").count(), 0);
  assert.equal(await wcAnonymous.locator('[data-field="category"]').count(), 1);
  assert.equal(await wcAnonymous.locator('[data-field="delayReason"]').count(), 1);
  assert.equal(await wcAnonymous.locator('[data-field="occurredAt"]').count(), 1);
  assert.equal(await wcAnonymous.locator("#wcDescription").count(), 1);
  await wcAnonymous.locator('[data-action="continue-wc-section"][data-section="suspectDetails"]').click();
  assert.equal(await wcAnonymous.locator("#wcSectionContent h2").textContent(), "Suspect Details");
  assert.equal(await wcAnonymous.locator("#wcSuspectName").count(), 1);
  assert.equal(await wcAnonymous.locator("#wcSuspectIdType").count(), 1);
  assert.equal(await wcAnonymous.locator("#wcSuspectOtherInfo").count(), 1);
  assert.equal(await wcAnonymous.locator('[data-action="add-wc-suspect-id"]').count(), 1);
  assert.equal(await wcAnonymous.locator(".warn-hint").count(), 0);
  await wcAnonymous.locator('[data-action="preview-wc-report"]').click();
  assert.match(await wcAnonymous.getByText("Anonymous report", { exact: true }).textContent(), /Anonymous report/);
  assert.equal(await wcAnonymous.locator(".preview-card").count(), 3);
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
