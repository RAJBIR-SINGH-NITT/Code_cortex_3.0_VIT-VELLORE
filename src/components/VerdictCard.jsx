import { useState } from "react";
import ScoreBar from "./ScoreBar";
import { verdictMeta, CONFIDENCE_CLASS } from "./verdictMeta";
import { IconChevronDown, IconInfo } from "./Icons";
import { sampleLabelFor } from "../api/demoData";

function formatTime(ts) {
  try {
    return new Date(ts).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

export default function VerdictCard({ result }) {
  const [showWhy, setShowWhy] = useState(false);
  const meta = verdictMeta(result.verdict);
  const Icon = meta.Icon;

  return (
    <section
      aria-label="Analysis result"
      className={`animate-pop rounded-2xl border-2 p-6 shadow-lift sm:p-8 ${meta.cardClass}`}
    >
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
        <span
          className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full shadow-soft ${meta.iconWrapClass}`}
        >
          <Icon className="h-7 w-7" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <h2 className={`font-display text-3xl font-bold tracking-tight sm:text-4xl ${meta.titleClass}`}>
              {meta.title}
            </h2>
          </div>
          <p className="mt-2 text-lg font-semibold text-ink-700">{meta.heading}</p>
        </div>
      </div>

      <div className={`mt-6 border-t sm:mt-7 ${meta.dividerClass}`} />

      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        <ScoreBar
          label="Malware Score"
          caption="How harmful does the classifier think it looks?"
          value={result.malwareProbability}
          tone="danger"
        />
        <ScoreBar
          label="Unusual Score"
          caption="How different does it look from the files the model learned from?"
          value={result.noveltyScore}
          tone="warn"
        />
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold tracking-wide ${
            CONFIDENCE_CLASS[result.confidence] || CONFIDENCE_CLASS.LOW
          }`}
        >
          <IconInfo className="h-3.5 w-3.5" />
          {result.confidence} CONFIDENCE
        </span>

        <button
          type="button"
          onClick={() => setShowWhy((v) => !v)}
          aria-expanded={showWhy}
          className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-white/80 px-4 py-2 text-sm font-bold text-ink-700 shadow-soft transition-colors hover:bg-white"
        >
          {showWhy ? "Hide Why" : "View Why"}
          <IconChevronDown
            className={`h-4 w-4 transition-transform duration-200 ${showWhy ? "rotate-180" : ""}`}
          />
        </button>
      </div>

      {showWhy && (
        <div className="animate-fade-up mt-4 rounded-xl border border-line bg-white/80 p-4 sm:p-5">
          <h3 className="font-display text-sm font-bold uppercase tracking-wide text-ink-500">
            Why this result?
          </h3>
          <p className="mt-1.5 text-base font-semibold leading-relaxed text-ink-700">{meta.why}</p>
        </div>
      )}

      <div className="mt-6 flex flex-wrap gap-x-5 gap-y-1.5 border-t border-line/70 pt-4 text-xs font-semibold text-ink-400">
        {result.sampleId && <span>Sample: {sampleLabelFor(result.sampleId)}</span>}
        <span>Model: {result.modelVersion}</span>
        <span>Checked: {formatTime(result.timestamp)}</span>
        <span className="font-mono">ID: {String(result.scanId).slice(0, 8)}</span>
      </div>
    </section>
  );
}
