import { IconShieldCheck, IconBug, IconSearch } from "./Icons";

// Single source of truth for how each verdict looks and reads across the app.
export const VERDICT_META = {
  BENIGN: {
    title: "BENIGN",
    badge: "Safe",
    heading: "This file looks safe based on the learned data.",
    why: "The model found strong evidence that this sample looks benign and familiar.",
    tone: "brand",
    Icon: IconShieldCheck,
    cardClass: "bg-brand-50 border-brand-200",
    iconWrapClass: "bg-brand-600 text-white",
    titleClass: "text-brand-800",
    dividerClass: "border-brand-200",
    pillClass: "bg-brand-100 text-brand-800",
  },
  MALWARE: {
    title: "MALWARE",
    badge: "Malware",
    heading: "This file looks harmful.",
    why: "The model found strong evidence that this sample looks malicious.",
    tone: "danger",
    Icon: IconBug,
    cardClass: "bg-red-50 border-red-200",
    iconWrapClass: "bg-red-600 text-white",
    titleClass: "text-red-700",
    dividerClass: "border-red-200",
    pillClass: "bg-red-100 text-red-700",
  },
  NEEDS_ANALYSIS: {
    title: "NEEDS ANALYSIS",
    badge: "Needs Analysis",
    heading: "This file looks unusual or the result is unclear.",
    why: "The model was not confident enough, or the sample looked very different from the training data.",
    tone: "warn",
    Icon: IconSearch,
    cardClass: "bg-amber-50 border-amber-200",
    iconWrapClass: "bg-amber-500 text-white",
    titleClass: "text-amber-700",
    dividerClass: "border-amber-200",
    pillClass: "bg-amber-100 text-amber-800",
  },
};

export const CONFIDENCE_CLASS = {
  HIGH: "bg-brand-100 text-brand-800 border-brand-200",
  MEDIUM: "bg-amber-100 text-amber-800 border-amber-200",
  LOW: "bg-ink-900/5 text-ink-700 border-line",
};

export function verdictMeta(verdict) {
  return VERDICT_META[verdict] || VERDICT_META.NEEDS_ANALYSIS;
}
