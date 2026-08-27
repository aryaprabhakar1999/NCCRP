export const fallbackFinancial = {
  transaction: {
    wallet: "UPI / Phone payment app",
    account: "ananya@upi",
    utr: "409812345678",
    amount: "24500",
    date: "2026-08-27",
    time: "10:42",
    reference: "PAY-8842-DEL",
    suspectAccount: "No",
  },
  complaint: {
    subCategory: "UPI Related Frauds",
    incidentDate: "2026-08-27",
    incidentTime: "10:42",
    occurredAt: "UPI payment app",
    description: "I am reporting an online financial fraud where INR 24,500 was debited through a UPI payment app on 27 August 2026 at around 10:42. The visible UTR is 409812345678 and the reference shown is PAY-8842-DEL. I did not authorise this transfer. I request urgent action to trace the recipient account, help prevent further movement of funds, and register the complaint using the evidence I have provided.",
  },
  confidence: { wallet: 0.98, account: 0.86, utr: 0.94, amount: 0.98, date: 0.91, time: 0.8, reference: 0.72 },
  needsReview: ["reference"],
};

export const fallbackWomenChildren = {
  evidence: {
    suggestedCategory: "Sexually Obscene Material",
    platform: "Instagram",
    date: "2026-08-27",
    time: "19:20",
    people: "@unknown_profile and the reporter's account",
    nature: "Repeated abusive messages, unwanted image sharing, and threats to publish content",
    timeline: "The synthetic screenshots show an unwanted message, repeated contact from the same profile, and a later threat to share content publicly.",
  },
  complaint: {
    category: "Sexually Obscene Material",
    date: "2026-08-27",
    time: "19:20",
    occurredAt: "Instagram",
    description: "I am submitting this report based on synthetic evidence from Instagram. The screenshots appear to show repeated abusive messages, unwanted image sharing, and threats to publish content. The visible activity is around 27 August 2026 at 19:20. I request that the account and material shown in the evidence be reviewed urgently and that appropriate action be taken. I have reviewed this prepared draft and can change any detail before prototype submission.",
  },
  confidence: { suggestedCategory: 0.76, platform: 0.96, date: 0.82, time: 0.81, people: 0.65, nature: 0.72 },
  needsReview: ["people", "nature"],
};

export const fallbackProfile = {
  profile: {
    title: "Miss",
    name: "Ananya Sharma",
    mobile: "9876543210",
    dob: "1994-05-18",
    gender: "Female",
    email: "ananya.sharma@example.com",
    relationType: "Father",
    relationName: "Ramesh Sharma",
    house: "42",
    street: "Ashoka Road",
    colony: "Green Park",
    city: "New Delhi",
    tehsil: "Hauz Khas",
    country: "India",
    state: "Delhi",
    district: "South Delhi",
    policeStation: "Green Park",
    pincode: "110016",
  },
  confidence: { name: 0.96, dob: 0.93, gender: 0.9, address: 0.82 },
  needsReview: ["address"],
};

export function fallbackFor(flowType) {
  if (flowType === "financial") return fallbackFinancial;
  if (flowType === "women_children") return fallbackWomenChildren;
  return fallbackProfile;
}
