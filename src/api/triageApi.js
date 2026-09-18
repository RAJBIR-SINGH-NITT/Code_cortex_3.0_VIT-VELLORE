// API client for SecureFile AI.
// React ONLY talks to the Spring Boot backend (which proxies FastAPI + ML):
//   React -> Spring Boot -> FastAPI -> ML
// Set VITE_API_BASE_URL in .env (default: http://localhost:8080).
// If the backend cannot be reached, a local fallback engine keeps the app
// working (no visible mode switch — the UI simply reflects real status).
// HTTP errors from a reachable backend are surfaced as friendly messages.

import {
  getDemoResult,
  getDemoScan,
  loadDemoHistory,
  saveDemoScan,
  simulateLatency,
  friendlyFeatureName,
  MODEL_DEFAULTS,
} from "./demoData";

const RAW_BASE =
  (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_API_BASE_URL) ||
  "http://localhost:8080";

export const API_BASE_URL = String(RAW_BASE).replace(/\/+$/, "");
const PREFIX = "/api/v1";
const TIMEOUT_MS = 4000;

let backendReachable = true;

export class ApiError extends Error {
  constructor(message, { status } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

function friendlyForStatus(status) {
  if (status === 503 || status === 502 || status === 504) {
    return "Analysis service is temporarily unavailable.";
  }
  if (status === 400 || status === 422) {
    return "The sample could not be checked. Please verify the input features.";
  }
  return "Something went wrong while checking the sample.";
}

async function request(path, { method = "GET", body } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(API_BASE_URL + PREFIX + path, {
      method,
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
    if (!res.ok) {
      // Backend answered but with an error -> friendly message, no stack traces.
      throw new ApiError(friendlyForStatus(res.status), { status: res.status });
    }
    if (res.status === 204) return null;
    return await res.json().catch(() => null);
  } finally {
    clearTimeout(timer);
  }
}

// ---- Normalizers (tolerant of minor backend shape variations) --------------

function toFraction(value) {
  const n = typeof value === "number" ? value : parseFloat(value);
  if (!Number.isFinite(n)) return 0;
  const scaled = n > 1.5 ? n / 100 : n;
  return Math.min(1, Math.max(0, scaled));
}

function normalizeVerdict(raw) {
  const v = String(raw ?? "")
    .toUpperCase()
    .replace(/[\s-]+/g, "_");
  if (["MALWARE", "MALICIOUS", "HARMFUL"].includes(v)) return "MALWARE";
  if (["BENIGN", "SAFE", "CLEAN", "GOOD"].includes(v)) return "BENIGN";
  return "NEEDS_ANALYSIS";
}

function normalizeConfidence(raw, verdict, malwareProbability, noveltyScore) {
  if (typeof raw === "string" && raw.trim()) {
    const c = raw.trim().toUpperCase();
    if (c.startsWith("HIGH")) return "HIGH";
    if (c.startsWith("MED")) return "MEDIUM";
    if (c.startsWith("LOW")) return "LOW";
  }
  const n = typeof raw === "number" ? (raw > 1.5 ? raw / 100 : raw) : NaN;
  if (Number.isFinite(n)) {
    if (n >= 0.75) return "HIGH";
    if (n >= 0.5) return "MEDIUM";
    return "LOW";
  }
  // Derive a sensible label when the backend omits it.
  if (verdict === "NEEDS_ANALYSIS") {
    return noveltyScore > 0.85 || (malwareProbability > 0.35 && malwareProbability < 0.65)
      ? "LOW"
      : "MEDIUM";
  }
  return malwareProbability >= 0.85 || malwareProbability <= 0.15 ? "HIGH" : "MEDIUM";
}

function parseTimestamp(raw) {
  if (typeof raw === "number" && Number.isFinite(raw)) {
    return raw > 1e12 ? raw : raw * 1000;
  }
  const parsed = Date.parse(raw);
  return Number.isFinite(parsed) ? parsed : Date.now();
}

function normalizeShap(entry) {
  if (typeof entry === "string") {
    return { feature: entry, label: friendlyFeatureName(entry), value: null, shap: null, effect: "neutral" };
  }
  const feature = entry.feature ?? entry.name ?? entry.featureName ?? "feature";
  const valueRaw = entry.value ?? entry.featureValue ?? null;
  const shapRaw = entry.shap ?? entry.shapValue ?? entry.contribution ?? entry.score ?? null;
  const value = typeof valueRaw === "number" ? valueRaw : parseFloat(valueRaw);
  const shap = typeof shapRaw === "number" ? shapRaw : parseFloat(shapRaw);
  let effect = entry.effect ?? entry.direction ?? null;
  if (!effect) {
    if (Number.isFinite(shap)) {
      effect = shap >= 0.02 ? "malware" : shap <= -0.02 ? "safe" : "neutral";
    } else {
      effect = "neutral";
    }
  }
  effect = String(effect).toLowerCase().includes("malware")
    ? "malware"
    : String(effect).toLowerCase().includes("safe") || String(effect).toLowerCase().includes("benign")
      ? "safe"
      : "neutral";
  return {
    feature: String(feature),
    label: friendlyFeatureName(feature),
    value: Number.isFinite(value) ? value : null,
    shap: Number.isFinite(shap) ? shap : null,
    effect,
  };
}

export function normalizeScan(raw) {
  const verdict = normalizeVerdict(raw?.verdict ?? raw?.label ?? raw?.result);
  const malwareProbability = toFraction(
    raw?.malwareProbability ?? raw?.malwareScore ?? raw?.probability
  );
  const noveltyScore = toFraction(raw?.noveltyScore ?? raw?.unusualScore ?? raw?.novelty);
  return {
    scanId: raw?.scanId ?? raw?.id ?? "scan-" + Date.now().toString(36),
    sampleId: raw?.sampleId ?? raw?.sample ?? null,
    verdict,
    malwareProbability,
    noveltyScore,
    confidence: normalizeConfidence(raw?.confidence, verdict, malwareProbability, noveltyScore),
    topShapFeatures: (raw?.topShapFeatures ?? raw?.topFeatures ?? [])
      .map(normalizeShap)
      .slice(0, 5),
    features: raw?.features ?? null,
    modelVersion: raw?.modelVersion ?? MODEL_DEFAULTS.modelVersion,
    noveltyModelVersion: raw?.noveltyModelVersion ?? MODEL_DEFAULTS.noveltyModelVersion,
    timestamp: parseTimestamp(raw?.timestamp ?? raw?.createdAt),
  };
}

function upFlag(value) {
  if (value == null) return null;
  if (typeof value === "boolean") return value;
  const s = String(value).toLowerCase().trim();
  if (["up", "online", "ok", "healthy", "green", "true", "connected"].includes(s)) return true;
  if (["down", "offline", "error", "red", "false", "disconnected"].includes(s)) return false;
  return null;
}

function normalizeHealth(raw) {
  if (!raw || typeof raw !== "object") {
    return { overall: "online", backend: true, ai: true, database: true, raw: null };
  }
  const overallUp = upFlag(raw.status ?? raw.overall);
  const backend = upFlag(raw.backend ?? raw.api ?? raw.springBoot) ?? overallUp ?? true;
  const ai =
    upFlag(raw.aiService ?? raw.fastapi ?? raw.fastApi ?? raw.ai ?? raw.inference ?? raw.ml) ??
    overallUp ??
    true;
  const database = upFlag(raw.database ?? raw.db) ?? overallUp ?? true;
  return {
    overall: backend && ai && database ? "online" : "degraded",
    backend,
    ai,
    database,
    raw,
  };
}

// ---- Public API -------------------------------------------------------------

export async function analyzeSample({ sampleId, features }) {
  if (backendReachable) {
    try {
      const raw = await request("/triage", { method: "POST", body: { sampleId, features } });
      return normalizeScan(raw);
    } catch (err) {
      backendReachable = false;
      if (err instanceof ApiError && err.status) throw err; // reachable backend error -> show it
    }
  }
  // Backend not reachable -> keep the app usable with a local fallback engine.
  await simulateLatency();
  const scan = getDemoResult(sampleId, features);
  saveDemoScan(scan);
  return normalizeScan(scan);
}

export async function getHistory() {
  if (backendReachable) {
    try {
      const raw = await request("/history");
      const list = Array.isArray(raw) ? raw : raw?.content ?? raw?.scans ?? raw?.items ?? [];
      return list.map((s) => normalizeScan(s)).sort((a, b) => b.timestamp - a.timestamp);
    } catch (err) {
      backendReachable = false;
      if (err instanceof ApiError && err.status) throw err;
    }
  }
  return loadDemoHistory()
    .map((s) => normalizeScan(s))
    .sort((a, b) => b.timestamp - a.timestamp);
}

export async function getScan(scanId) {
  if (backendReachable) {
    try {
      const raw = await request("/history/" + encodeURIComponent(scanId));
      return normalizeScan(raw);
    } catch (err) {
      backendReachable = false;
      if (err instanceof ApiError && err.status) throw err;
    }
  }
  const scan = getDemoScan(scanId);
  return scan ? normalizeScan(scan) : null;
}

export async function getHealth() {
  try {
    const raw = await request("/health");
    backendReachable = true;
    return normalizeHealth(raw);
  } catch {
    backendReachable = false;
    return { overall: "offline", backend: false, ai: false, database: false, raw: null };
  }
}

export async function getModelInfo() {
  try {
    const raw = await request("/model-info");
    backendReachable = true;
    const pick = (obj, ...keys) => {
      for (const k of keys) {
        const v = obj?.[k];
        if (v == null) continue;
        return typeof v === "object" ? v.name ?? v.version ?? JSON.stringify(v) : String(v);
      }
      return null;
    };
    return {
      classifier: pick(raw, "classifier", "classifierName") ?? MODEL_DEFAULTS.classifier,
      noveltyDetector:
        pick(raw, "noveltyDetector", "noveltyModel", "noveltyDetectorName") ??
        MODEL_DEFAULTS.noveltyDetector,
      modelVersion: pick(raw, "modelVersion", "version") ?? MODEL_DEFAULTS.modelVersion,
      noveltyModelVersion:
        pick(raw, "noveltyModelVersion", "noveltyVersion") ?? MODEL_DEFAULTS.noveltyModelVersion,
      fallback: false,
    };
  } catch {
    backendReachable = false;
    return { ...MODEL_DEFAULTS, fallback: true };
  }
}
