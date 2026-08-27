import { z } from "zod";

const confidence = z.number().min(0).max(1);
const financialSubCategory = z.enum([
  "Aadhar Enabled Payment System (AEPS)",
  "Business Email Compromise / Email Takeover",
  "Debit / Credit Card Fraud / Sim Swap Fraud",
  "Demat / Depository Fraud",
  "E-Wallet Related Fraud",
  "Fraud Call / Vishing",
  "Internet Banking Related Fraud",
  "UPI Related Frauds",
]);
const financialLocation = z.enum(["UPI payment app", "Banking website", "Phone call", "Messaging app", "Marketplace", "Social media", "Other"]);
const wcCategory = z.enum([
  "Rape / Gang Rape (RGR) - Sexually Abusive Content",
  "Sexually Obscene Material",
  "Sexually Explicit Act",
  "CSEAM - Child Sexual Exploitative and Abuse Material",
]);
const platform = z.enum(["Email", "Facebook", "Instagram", "Snapchat", "Twitter", "WhatsApp", "Website URL", "YouTube", "LinkedIn", "Telegram", "Other"]);

export const financialSchema = z.object({
  transaction: z.object({
    wallet: z.string(),
    account: z.string(),
    utr: z.string(),
    amount: z.string(),
    date: z.string(),
    time: z.string(),
    reference: z.string(),
    suspectAccount: z.enum(["No", "Yes"]),
  }),
  complaint: z.object({
    subCategory: financialSubCategory,
    incidentDate: z.string(),
    incidentTime: z.string(),
    occurredAt: financialLocation,
    description: z.string(),
  }),
  confidence: z.object({
    wallet: confidence,
    account: confidence,
    utr: confidence,
    amount: confidence,
    date: confidence,
    time: confidence,
    reference: confidence,
  }),
  needsReview: z.array(z.enum(["wallet", "account", "utr", "amount", "date", "time", "reference"])),
});

export const womenChildrenSchema = z.object({
  evidence: z.object({
    suggestedCategory: wcCategory,
    platform,
    date: z.string(),
    time: z.string(),
    people: z.string(),
    nature: z.string(),
    timeline: z.string(),
  }),
  complaint: z.object({
    category: wcCategory,
    date: z.string(),
    time: z.string(),
    occurredAt: platform,
    description: z.string(),
  }),
  confidence: z.object({
    suggestedCategory: confidence,
    platform: confidence,
    date: confidence,
    time: confidence,
    people: confidence,
    nature: confidence,
  }),
  needsReview: z.array(z.enum(["suggestedCategory", "platform", "date", "time", "people", "nature"])),
});

export const profileSchema = z.object({
  profile: z.object({
    title: z.string(),
    name: z.string(),
    mobile: z.string(),
    dob: z.string(),
    gender: z.string(),
    email: z.string(),
    relationType: z.string(),
    relationName: z.string(),
    house: z.string(),
    street: z.string(),
    colony: z.string(),
    city: z.string(),
    tehsil: z.string(),
    country: z.string(),
    state: z.string(),
    district: z.string(),
    policeStation: z.string(),
    pincode: z.string(),
  }),
  confidence: z.object({
    name: confidence,
    dob: confidence,
    gender: confidence,
    address: confidence,
  }),
  needsReview: z.array(z.enum(["name", "dob", "gender", "address"])),
});
