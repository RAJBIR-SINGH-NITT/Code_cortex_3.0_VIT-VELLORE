import { useState } from "react";
import { IconChevronDown } from "./Icons";

const EFFECT_META = {
  malware: { text: "Pushes toward malware", className: "text-red-600", bar: "bg-red-400" },
  safe: { text: "Pushes toward safe", className: "text-brand-700", bar: "bg-brand-400" },
  neutral: { text: "Little effect", className: "text-ink-400", bar: "bg-ink-300" },
};

function formatValue(value) {
  if (value === null || value === undefined) return "—";
  if (!Number.isFinite(value)) return String(value);
  if (Math.abs(value) >= 1000) return value.toLocaleString(undefined, { maximumFractionDigits: 0 });
  if (Number.isInteger(value)) return String(value);
  return value.toFixed(2);
}

export default function EvidenceList({ result }) {
  const [showTechnical, setShowTechnical] = useState(false);
  const [showAllFeatures, setShowAllFeatures] = useState(false);
  const features = result.topShapFeatures || [];
  const top3 = features.slice(0, 3);
  const maxAbs = Math.max(0.01, ...features.map((f) => Math.abs(f.shap ?? 0)));
  const allFeatures = result.features && typeof result.features === "object" ? result.features : null;

  if (features.length === 0 && !allFeatures) return null;

  return (
    <section className="animate-fade-up mt-6 rounded-2xl border border-line bg-white shadow-soft">
      <div className="p-6 sm:p-7">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="font-display text-xl font-bold tracking-tight text-ink-900">Top evidence</h3>
          <span className="text-sm font-semibold text-ink-400">What influenced this result most</span>
        </div>

        <ul className="mt-4">
          {top3.map((f, i) => {
            const effect = EFFECT_META[f.effect] || EFFECT_META.neutral;
            return (
              <li
                key={f.feature + i}
                className="flex items-center gap-4 border-b border-line py-3.5 last:border-b-0"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-line bg-mist font-display text-sm font-bold text-ink-500">
                  {i + 1}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-base font-bold text-ink-900">{f.label}</span>
                  <span className="block truncate font-mono text-xs text-ink-400">{f.feature}</span>
                </span>
                <span className={`shrink-0 text-xs font-bold sm:text-sm ${effect.className}`}>
                  {effect.text}
                </span>
              </li>
            );
          })}
        </ul>

        <button
          type="button"
          onClick={() => setShowTechnical((v) => !v)}
          aria-expanded={showTechnical}
          className="mt-5 inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-bold text-brand-700 transition-colors hover:bg-brand-50"
        >
          Technical details
          <IconChevronDown
            className={`h-4 w-4 transition-transform duration-200 ${showTechnical ? "rotate-180" : ""}`}
          />
        </button>

        {showTechnical && (
          <div className="animate-fade-up mt-4">
            <div className="overflow-x-auto rounded-xl border border-line">
              <table className="w-full min-w-[520px] text-left text-sm">
                <thead className="bg-mist text-xs font-bold uppercase tracking-wide text-ink-500">
                  <tr>
                    <th className="px-4 py-3">Feature</th>
                    <th className="px-4 py-3">Value</th>
                    <th className="px-4 py-3">Effect</th>
                    <th className="px-4 py-3">SHAP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {features.map((f, i) => {
                    const effect = EFFECT_META[f.effect] || EFFECT_META.neutral;
                    const pct = f.shap === null ? 0 : Math.round((Math.abs(f.shap) / maxAbs) * 100);
                    return (
                      <tr key={f.feature + i} className="hover:bg-mist/60">
                        <td className="px-4 py-3">
                          <span className="block font-bold text-ink-900">{f.label}</span>
                          <span className="block font-mono text-xs text-ink-400">{f.feature}</span>
                        </td>
                        <td className="px-4 py-3 font-mono text-ink-700">{formatValue(f.value)}</td>
                        <td className={`px-4 py-3 text-xs font-bold ${effect.className}`}>{effect.text}</td>
                        <td className="px-4 py-3">
                          <span className="flex items-center gap-2">
                            <span className="h-1.5 w-16 overflow-hidden rounded-full bg-ink-900/10">
                              <span className={`block h-full ${effect.bar}`} style={{ width: `${pct}%` }} />
                            </span>
                            <span className="font-mono text-xs text-ink-500">
                              {f.shap === null ? "—" : (f.shap > 0 ? "+" : "") + f.shap.toFixed(2)}
                            </span>
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {allFeatures && (
              <div className="mt-4">
                <button
                  type="button"
                  onClick={() => setShowAllFeatures((v) => !v)}
                  aria-expanded={showAllFeatures}
                  className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-bold text-ink-500 transition-colors hover:bg-mist hover:text-ink-900"
                >
                  All input features ({Object.keys(allFeatures).length})
                  <IconChevronDown
                    className={`h-4 w-4 transition-transform duration-200 ${showAllFeatures ? "rotate-180" : ""}`}
                  />
                </button>
                {showAllFeatures && (
                  <div className="animate-fade-in mt-3 grid grid-cols-1 gap-x-6 gap-y-1.5 rounded-xl border border-line bg-mist/60 p-4 font-mono text-xs sm:grid-cols-2 lg:grid-cols-3">
                    {Object.entries(allFeatures).map(([name, value]) => (
                      <div key={name} className="flex justify-between gap-3 border-b border-line/60 py-1 last:border-b-0">
                        <span className="truncate text-ink-500">{name}</span>
                        <span className="shrink-0 font-bold text-ink-900">{formatValue(value)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <p className="mt-3 text-xs font-semibold text-ink-400">
              Classifier: {result.modelVersion} · Novelty detector: {result.noveltyModelVersion} · Positive
              SHAP pushes toward malware, negative toward safe.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
