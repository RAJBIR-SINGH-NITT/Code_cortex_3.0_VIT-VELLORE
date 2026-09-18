// Demo dataset + offline demo engine for SecureFile AI.
// Used ONLY when the Spring Boot backend is unreachable, so the UI can still be
// demonstrated. When the backend is running, every call goes through Spring Boot
// (React -> Spring Boot -> FastAPI -> ML). Nothing here calls FastAPI directly.

const HISTORY_KEY = "securefileai.demo-history.v1";

export const MODEL_DEFAULTS = {
  classifier: "XGBoost",
  noveltyDetector: "Isolation Forest",
  modelVersion: "xgb-v1",
  noveltyModelVersion: "iforest-v1",
};

// Friendly names for the features that matter most to the story.
export const FEATURE_LABELS = {
  SectionsMeanEntropy: "Average section randomness",
  SectionsMaxEntropy: "Most random section",
  SectionsMinEntropy: "Least random section",
  SectionsNb: "Number of sections",
  ImportsNb: "Number of imports",
  ExportsNb: "Number of exports",
  ResourcesNb: "Embedded resources",
  ResourcesMeanEntropy: "Average resource randomness",
  ResourcesMaxEntropy: "Most random resource",
  CheckSum: "Header checksum",
  LoadConfigurationSize: "Load configuration size",
  VersionInformationSize: "Version information",
  SizeOfCode: "Code size",
  SizeOfImage: "File image size",
  SizeOfInitializedData: "Initialized data size",
  AddressOfEntryPoint: "Entry point offset",
  DllCharacteristics: "Security flags",
  ImageBase: "Preferred load address",
  SectionsMeanSize: "Average section size",
};

export function friendlyFeatureName(name) {
  if (!name) return "Unknown feature";
  if (FEATURE_LABELS[name]) return FEATURE_LABELS[name];
  return String(name)
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/_/g, " ")
    .replace(/^./, (c) => c.toUpperCase());
}

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

function buildFeatures(overrides) {
  // A realistic extracted-PE-feature baseline (EMBER-style feature set).
  const base = {
    Machine: 332,
    Subsystem: 2,
    DllCharacteristics: 33120,
    Characteristics: 258,
    MajorLinkerVersion: 14,
    MinorLinkerVersion: 0,
    MajorOperatingSystemVersion: 6,
    MinorOperatingSystemVersion: 0,
    MajorImageVersion: 6,
    MinorImageVersion: 0,
    MajorSubsystemVersion: 6,
    MinorSubsystemVersion: 0,
    SizeOfCode: 181760,
    SizeOfInitializedData: 253952,
    SizeOfUninitializedData: 0,
    SizeOfHeaders: 1024,
    SizeOfImage: 471040,
    AddressOfEntryPoint: 98432,
    BaseOfCode: 4096,
    ImageBase: 5368709120,
    SectionAlignment: 4096,
    FileAlignment: 512,
    CheckSum: 486742,
    NumberOfRvaAndSizes: 16,
    SectionsNb: 6,
    SectionsMeanEntropy: 5.42,
    SectionsMinEntropy: 3.88,
    SectionsMaxEntropy: 6.45,
    SectionsMeanSize: 68096,
    SectionsMinSize: 4608,
    SectionsMaxSize: 176128,
    ImportsNb: 142,
    ExportsNb: 0,
    ResourcesNb: 12,
    ResourcesMeanEntropy: 4.63,
    ResourcesMinEntropy: 1.92,
    ResourcesMaxEntropy: 6.21,
    ResourcesMeanSize: 8412,
    LoadConfigurationSize: 168,
    VersionInformationSize: 812,
  };
  return { ...base, ...overrides };
}

export const SAMPLES = [
  {
    key: "demo-safe",
    shortKey: "safe",
    title: "Safe Sample",
    tagline: "Looks normal",
    tone: "brand",
    icon: "shield",
    features: buildFeatures({}),
  },
  {
    key: "demo-malware",
    shortKey: "malware",
    title: "Malware Sample",
    tagline: "Looks harmful",
    tone: "danger",
    icon: "bug",
    features: buildFeatures({
      DllCharacteristics: 0,
      MajorLinkerVersion: 6,
      MinorLinkerVersion: 0,
      MajorOperatingSystemVersion: 5,
      MinorOperatingSystemVersion: 1,
      MajorImageVersion: 5,
      MinorImageVersion: 1,
      MajorSubsystemVersion: 5,
      MinorSubsystemVersion: 1,
      SizeOfCode: 2146304,
      SizeOfInitializedData: 4096,
      SizeOfImage: 2215936,
      AddressOfEntryPoint: 2101248,
      ImageBase: 4194304,
      CheckSum: 0,
      SectionsNb: 4,
      SectionsMeanEntropy: 7.55,
      SectionsMinEntropy: 7.12,
      SectionsMaxEntropy: 7.93,
      SectionsMeanSize: 528384,
      SectionsMinSize: 512,
      SectionsMaxSize: 2146304,
      ImportsNb: 12,
      ResourcesNb: 1,
      ResourcesMeanEntropy: 7.82,
      ResourcesMinEntropy: 7.82,
      ResourcesMaxEntropy: 7.82,
      ResourcesMeanSize: 311296,
      LoadConfigurationSize: 0,
      VersionInformationSize: 0,
    }),
  },
  {
    key: "demo-unusual",
    shortKey: "unusual",
    title: "Unusual Sample",
    tagline: "Needs a closer look",
    tone: "warn",
    icon: "search",
    features: buildFeatures({
      DllCharacteristics: 320,
      MajorLinkerVersion: 9,
      SizeOfCode: 645120,
      SizeOfInitializedData: 1835008,
      SizeOfUninitializedData: 65536,
      SizeOfImage: 3411968,
      AddressOfEntryPoint: 1507328,
      ImageBase: 4194304,
      CheckSum: 0,
      SectionsNb: 9,
      SectionsMeanEntropy: 6.31,
      SectionsMinEntropy: 0.0,
      SectionsMaxEntropy: 7.95,
      SectionsMeanSize: 312320,
      SectionsMinSize: 64,
      SectionsMaxSize: 1638400,
      ImportsNb: 287,
      ExportsNb: 41,
      ResourcesNb: 96,
      ResourcesMeanEntropy: 6.9,
      ResourcesMinEntropy: 0.0,
      ResourcesMaxEntropy: 7.99,
      ResourcesMeanSize: 2148,
      LoadConfigurationSize: 88,
      VersionInformationSize: 0,
    }),
  },
];

export const SAMPLES_BY_KEY = Object.fromEntries(SAMPLES.map((s) => [s.key, s]));

const SAMPLE_LABELS = {
  "demo-safe": "Safe sample",
  "demo-malware": "Malware sample",
  "demo-unusual": "Unusual sample",
};

export function sampleLabelFor(sampleId) {
  if (!sampleId) return "Unknown sample";
  if (SAMPLE_LABELS[sampleId]) return SAMPLE_LABELS[sampleId];
  if (String(sampleId).startsWith("file:")) {
    const name = String(sampleId).slice(5);
    try {
      return decodeURIComponent(name);
    } catch {
      return name;
    }
  }
  if (String(sampleId).startsWith("custom")) return "Custom sample";
  return String(sampleId);
}

// Pre-computed results for the three demo samples (mirrors the backend DTO).
const DEMO_RESULTS = {
  "demo-safe": {
    verdict: "BENIGN",
    malwareProbability: 0.04,
    noveltyScore: 0.12,
    confidence: "HIGH",
    topShapFeatures: [
      { feature: "ImportsNb", value: 142, shap: -0.28 },
      { feature: "SectionsMeanEntropy", value: 5.42, shap: -0.21 },
      { feature: "ResourcesNb", value: 12, shap: -0.14 },
      { feature: "VersionInformationSize", value: 812, shap: -0.09 },
      { feature: "CheckSum", value: 486742, shap: -0.07 },
    ],
  },
  "demo-malware": {
    verdict: "MALWARE",
    malwareProbability: 0.97,
    noveltyScore: 0.44,
    confidence: "HIGH",
    topShapFeatures: [
      { feature: "SectionsMeanEntropy", value: 7.55, shap: 0.42 },
      { feature: "ImportsNb", value: 12, shap: 0.33 },
      { feature: "CheckSum", value: 0, shap: 0.18 },
      { feature: "ResourcesNb", value: 1, shap: 0.11 },
      { feature: "LoadConfigurationSize", value: 0, shap: 0.09 },
    ],
  },
  "demo-unusual": {
    verdict: "NEEDS_ANALYSIS",
    malwareProbability: 0.71,
    noveltyScore: 0.97,
    confidence: "LOW",
    topShapFeatures: [
      { feature: "SectionsMeanEntropy", value: 6.31, shap: 0.31 },
      { feature: "ImportsNb", value: 287, shap: 0.22 },
      { feature: "ResourcesNb", value: 96, shap: 0.17 },
      { feature: "ResourcesMaxEntropy", value: 7.99, shap: 0.12 },
      { feature: "ExportsNb", value: 41, shap: 0.08 },
    ],
  },
};

function newScanId() {
  try {
    if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  } catch {
    /* ignore */
  }
  return "scan-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
}

export function simulateLatency() {
  const ms = 1100 + Math.random() * 700;
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Heuristic result for a custom (edited) or uploaded feature vector.
function buildCustomResult(features) {
  const num = (key, fallback) => {
    const raw = features ? features[key] : undefined;
    const n = typeof raw === "number" ? raw : parseFloat(raw);
    return Number.isFinite(n) ? n : fallback;
  };

  const entropy = num("SectionsMeanEntropy", 5.4);
  const imports = num("ImportsNb", 120);
  const resources = num("ResourcesNb", 8);
  const sections = num("SectionsNb", 6);
  const checksum = num("CheckSum", 1);
  const versionInfo = num("VersionInformationSize", 1);

  const contributions = [];
  const push = (feature, value, shap) => contributions.push({ feature, value, shap });

  let p = 0.16;
  const entropyPush = clamp((entropy - 5.9) / 1.9, -0.25, 1) * 0.55;
  p += entropyPush;
  push("SectionsMeanEntropy", entropy, +entropyPush.toFixed(2));

  const importPush = clamp((60 - imports) / 60, 0, 1) * 0.3;
  p += importPush;
  push("ImportsNb", imports, +importPush.toFixed(2));

  if (checksum === 0) {
    p += 0.12;
    push("CheckSum", 0, 0.12);
  } else {
    push("CheckSum", checksum, -0.06);
    p -= 0.02;
  }
  if (versionInfo === 0) {
    p += 0.06;
    push("VersionInformationSize", 0, 0.06);
  }
  const resPush = -clamp((resources - 4) / 20, 0, 1) * 0.06;
  p += resPush;
  push("ResourcesNb", resources, +resPush.toFixed(2));

  p = clamp(p, 0.02, 0.98);

  let n = 0;
  n += (Math.abs(entropy - 5.4) / 2.4) * 0.45;
  n += (Math.abs(imports - 140) / 260) * 0.25;
  n += (Math.abs(resources - 12) / 80) * 0.15;
  n += (Math.abs(sections - 6) / 8) * 0.15;
  n = clamp(n, 0.03, 0.99);

  let verdict;
  if (p >= 0.62 && n <= 0.85) verdict = "MALWARE";
  else if (p <= 0.38 && n <= 0.75) verdict = "BENIGN";
  else verdict = "NEEDS_ANALYSIS";

  const extreme = p >= 0.85 || p <= 0.15;
  const confidence =
    verdict === "NEEDS_ANALYSIS"
      ? n > 0.85 || (p > 0.35 && p < 0.65)
        ? "LOW"
        : "MEDIUM"
      : extreme
        ? "HIGH"
        : "MEDIUM";

  contributions.sort((a, b) => Math.abs(b.shap) - Math.abs(a.shap));

  return {
    verdict,
    malwareProbability: +p.toFixed(2),
    noveltyScore: +n.toFixed(2),
    confidence,
    topShapFeatures: contributions.slice(0, 5),
  };
}

export function getDemoResult(sampleId, features) {
  const preset = DEMO_RESULTS[sampleId];
  const body = preset
    ? {
        ...preset,
        topShapFeatures: preset.topShapFeatures.map((f) => ({ ...f })),
      }
    : buildCustomResult(features || {});

  return {
    scanId: newScanId(),
    sampleId: sampleId || "custom",
    verdict: body.verdict,
    malwareProbability: body.malwareProbability,
    noveltyScore: body.noveltyScore,
    confidence: body.confidence,
    topShapFeatures: body.topShapFeatures,
    features: features || (preset ? SAMPLES_BY_KEY[sampleId]?.features : null),
    modelVersion: MODEL_DEFAULTS.modelVersion,
    noveltyModelVersion: MODEL_DEFAULTS.noveltyModelVersion,
    timestamp: new Date().toISOString(),
  };
}

export function getPreviewResults() {
  return SAMPLES.map((s) => getDemoResult(s.key, s.features));
}

// ---- Demo history store (localStorage) ------------------------------------

export function loadDemoHistory() {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

export function saveDemoScan(scan) {
  try {
    const list = [scan, ...loadDemoHistory()].slice(0, 60);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(list));
  } catch {
    /* storage unavailable — demo history simply won't persist */
  }
}

export function getDemoScan(scanId) {
  return loadDemoHistory().find((s) => s && s.scanId === scanId) || null;
}
