import { useEffect, useMemo, useState } from "react";
import { getHistory } from "../api/triageApi";
import { getPreviewResults } from "../api/demoData";
import {
  IconArrowRight,
  IconBug,
  IconShieldCheck,
  IconSearch,
  IconActivity,
  IconServer,
  IconChip,
  IconDatabase,
} from "../components/Icons";
import { VERDICT_META } from "../components/verdictMeta";
import ScoreBar from "../components/ScoreBar";
import VerdictPill from "../components/VerdictPill";

const LEGEND_TEXT = {
  BENIGN: "The file looks safe based on the data we know.",
  MALWARE: "The file looks harmful.",
  NEEDS_ANALYSIS: "The file looks unusual or the result is not clear. More checking is recommended.",
};

function HeroDemo() {
  const previews = useMemo(() => getPreviewResults(), []);
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      return;
    }
    const id = setInterval(() => setIdx((i) => (i + 1) % previews.length), 3400);
    return () => clearInterval(id);
  }, [previews.length]);

  const scan = previews[idx];
  const meta = VERDICT_META[scan.verdict];
  const Icon = meta.Icon;

  return (
    <div className="relative">
      <div className="relative overflow-hidden rounded-2xl border border-line bg-white p-5 shadow-lift sm:p-6">
        <div className="dot-grid pointer-events-none absolute inset-0 opacity-40" aria-hidden="true" />
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-14 animate-scan bg-gradient-to-b from-transparent via-brand-200/40 to-transparent"
          aria-hidden="true"
        />

        <div className="relative flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wide text-ink-400">Result preview</span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-mist px-2.5 py-1 text-[11px] font-bold text-ink-500">
            <span className="h-1.5 w-1.5 animate-breathe rounded-full bg-brand-500" aria-hidden="true" />
            Live example
          </span>
        </div>

        <div
          key={idx}
          className={`animate-pop relative mt-4 rounded-xl border-2 p-4 sm:p-5 ${meta.cardClass}`}
        >
          <div className="flex items-center gap-3">
            <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${meta.iconWrapClass}`}>
              <Icon className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <p className={`font-display text-xl font-bold tracking-tight sm:text-2xl ${meta.titleClass}`}>
                {meta.title}
              </p>
              <p className="truncate text-xs font-semibold text-ink-500 sm:text-sm">{meta.heading}</p>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <ScoreBar compact label="Malware Score" value={scan.malwareProbability} tone="danger" />
            <ScoreBar compact label="Unusual Score" value={scan.noveltyScore} tone="warn" />
          </div>
          <div className="mt-3.5 flex items-center justify-between">
            <span className="rounded-full border border-line bg-white/80 px-2.5 py-1 text-[11px] font-bold text-ink-500">
              {scan.confidence} CONFIDENCE
            </span>
            <span className="text-[11px] font-bold text-ink-400">Model xgb-v1</span>
          </div>
        </div>

        <div className="relative mt-4 flex flex-wrap gap-2">
          {["XGBoost classifier", "Isolation Forest novelty", "SHAP evidence"].map((chip) => (
            <span
              key={chip}
              className="rounded-full border border-line bg-mist px-3 py-1 text-[11px] font-bold text-ink-500"
            >
              {chip}
            </span>
          ))}
        </div>
      </div>
      <p className="mt-3 text-center text-sm font-semibold text-ink-400">
        What you'll see after every check — clear, not cryptic.
      </p>
    </div>
  );
}

function ServiceDot({ ok }) {
  if (ok === true) {
    return (
      <span className="inline-flex items-center gap-2 text-sm font-bold text-brand-700">
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-400 opacity-60" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-brand-500" />
        </span>
        Online
      </span>
    );
  }
  if (ok === false) {
    return (
      <span className="inline-flex items-center gap-2 text-sm font-bold text-red-600">
        <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
        Offline
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-2 text-sm font-bold text-ink-400">
      <span className="h-2.5 w-2.5 animate-breathe rounded-full bg-ink-300" />
      Checking…
    </span>
  );
}

export default function Home({ health, modelInfo, historyVersion }) {
  const [scans, setScans] = useState([]);

  useEffect(() => {
    let active = true;
    getHistory()
      .then((list) => active && setScans(list))
      .catch(() => active && setScans([]));
    return () => {
      active = false;
    };
  }, [historyVersion]);

  const stats = useMemo(
    () => ({
      total: scans.length,
      malware: scans.filter((s) => s.verdict === "MALWARE").length,
      safe: scans.filter((s) => s.verdict === "BENIGN").length,
      needs: scans.filter((s) => s.verdict === "NEEDS_ANALYSIS").length,
    }),
    [scans]
  );

  const statTiles = [
    { label: "Total Checks", value: stats.total, Icon: IconActivity, tile: "bg-mist text-ink-700", number: "text-ink-900" },
    { label: "Malware", value: stats.malware, Icon: IconBug, tile: "bg-red-100 text-red-600", number: "text-red-700" },
    { label: "Safe", value: stats.safe, Icon: IconShieldCheck, tile: "bg-brand-100 text-brand-700", number: "text-brand-700" },
    { label: "Needs Analysis", value: stats.needs, Icon: IconSearch, tile: "bg-amber-100 text-amber-600", number: "text-amber-700" },
  ];

  const services = [
    { name: "Backend", desc: "Spring Boot API", Icon: IconServer, ok: health?.backend ?? null },
    { name: "AI Service", desc: "FastAPI inference", Icon: IconChip, ok: health?.ai ?? null },
    { name: "Database", desc: "Scan history storage", Icon: IconDatabase, ok: health?.database ?? null },
  ];

  const legend = ["BENIGN", "NEEDS_ANALYSIS", "MALWARE"].map((v) => ({ verdict: v, ...VERDICT_META[v] }));

  return (
    <div className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
      {/* Hero */}
      <section className="grid items-center gap-10 py-12 sm:py-16 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14 lg:py-20">
        <div className="animate-fade-up">
          <span className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-3.5 py-1.5 text-xs font-bold text-brand-800">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-400 opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-500" />
            </span>
            AI malware triage for Windows files
          </span>

          <h1 className="mt-5 font-display text-[2.6rem] font-bold leading-[1.05] tracking-tight text-ink-900 sm:text-6xl">
            Check a file before you{" "}
            <span className="relative inline-block">
              trust
              <svg
                className="absolute -bottom-1.5 left-0 w-full text-brand-400"
                viewBox="0 0 120 12"
                fill="none"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <path d="M3 9c28-5.5 74-6.5 114-2.5" stroke="currentColor" strokeWidth="4.5" strokeLinecap="round" />
              </svg>
            </span>{" "}
            it.
          </h1>

          <p className="mt-5 max-w-md text-lg font-semibold text-ink-500">
            We check whether the file looks harmful and whether its structure looks unusual.
          </p>

          <div className="mt-7 max-w-md rounded-xl border border-line bg-white p-5 shadow-soft">
            <p className="text-xs font-bold uppercase tracking-wide text-ink-400">Two things are checked</p>
            <ol className="mt-3 space-y-3">
              {["Does the file look harmful?", "Does the file look unusual?"].map((text, i) => (
                <li key={text} className="flex items-center gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-600 font-display text-xs font-bold text-white">
                    {i + 1}
                  </span>
                  <span className="text-base font-bold text-ink-900">{text}</span>
                </li>
              ))}
            </ol>
          </div>

          <div className="mt-8">
            <a
              href="#/analyze"
              className="inline-flex items-center gap-2.5 rounded-xl bg-brand-600 px-7 py-4 font-display text-base font-bold uppercase tracking-wide text-white shadow-lift transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-700 sm:text-lg"
            >
              Analyze a Sample
              <IconArrowRight className="h-5 w-5" />
            </a>
            <p className="mt-3 text-sm font-semibold text-ink-400">Attach a file, or try a ready-made sample.</p>
          </div>
        </div>

        <div className="animate-fade-up" style={{ animationDelay: "120ms" }}>
          <HeroDemo />
        </div>
      </section>

      {/* Three outcomes */}
      <section className="mt-6 sm:mt-10">
        <h2 className="font-display text-2xl font-bold tracking-tight text-ink-900 sm:text-3xl">
          One of three answers.
        </h2>
        <p className="mt-1.5 text-base font-semibold text-ink-500">Every check ends with a clear result.</p>
        <div className="mt-6 space-y-3">
          {legend.map((item, i) => {
            const Icon = item.Icon;
            return (
              <div
                key={item.verdict}
                className="animate-fade-up flex flex-col gap-3 rounded-xl border border-line bg-white p-4 shadow-soft transition-shadow hover:shadow-lift sm:flex-row sm:items-center sm:gap-4 sm:p-5"
                style={{ animationDelay: `${i * 90}ms` }}
              >
                <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${item.iconWrapClass}`}>
                  <Icon className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-display text-base font-bold tracking-tight text-ink-900">{item.title}</p>
                  <p className="text-sm font-semibold text-ink-500">{LEGEND_TEXT[item.verdict]}</p>
                </div>
                <VerdictPill verdict={item.verdict} />
              </div>
            );
          })}
        </div>
      </section>

      {/* Summary stats */}
      <section className="mt-14 sm:mt-16">
        <h2 className="font-display text-2xl font-bold tracking-tight text-ink-900 sm:text-3xl">So far</h2>
        <div className="mt-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {statTiles.map((tile, i) => {
            const Icon = tile.Icon;
            return (
              <div
                key={tile.label}
                className="animate-fade-up rounded-xl border border-line bg-white p-5 shadow-soft transition-transform duration-200 hover:-translate-y-0.5"
                style={{ animationDelay: `${i * 70}ms` }}
              >
                <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${tile.tile}`}>
                  <Icon className="h-4.5 w-4.5" />
                </span>
                <p className={`mt-3 font-display text-3xl font-bold tabular-nums ${tile.number}`}>{tile.value}</p>
                <p className="mt-0.5 text-sm font-bold text-ink-500">{tile.label}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* System status + about */}
      <section className="mt-14 grid gap-6 sm:mt-16 lg:grid-cols-2">
        <div className="rounded-2xl border border-line bg-white p-6 shadow-soft sm:p-7">
          <h2 className="font-display text-xl font-bold tracking-tight text-ink-900">System status</h2>
          <div className="mt-2 divide-y divide-line">
            {services.map((service) => {
              const Icon = service.Icon;
              return (
                <div key={service.name} className="flex items-center justify-between gap-4 py-3.5">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-mist text-ink-500">
                      <Icon className="h-4.5 w-4.5" />
                    </span>
                    <div>
                      <p className="text-sm font-bold text-ink-900">{service.name}</p>
                      <p className="text-xs font-semibold text-ink-400">{service.desc}</p>
                    </div>
                  </div>
                  <ServiceDot ok={service.ok} />
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl border border-line bg-white p-6 shadow-soft sm:p-7">
          <h2 className="font-display text-xl font-bold tracking-tight text-ink-900">About the analysis</h2>
          <p className="mt-1.5 text-sm font-semibold text-ink-400">
            The models run on the backend — nothing is installed on your machine.
          </p>
          <dl className="mt-4 space-y-3">
            {[
              { label: "Classifier", value: modelInfo?.classifier || "XGBoost" },
              { label: "Novelty Detector", value: modelInfo?.noveltyDetector || "Isolation Forest" },
            ].map((row) => (
              <div key={row.label} className="flex items-center justify-between gap-4 rounded-lg bg-mist px-4 py-3">
                <dt className="text-sm font-bold text-ink-500">{row.label}</dt>
                <dd className="font-display text-sm font-bold text-ink-900">{row.value}</dd>
              </div>
            ))}
            {[
              { label: "Model Version", value: modelInfo?.modelVersion || "xgb-v1" },
              { label: "Novelty Model", value: modelInfo?.noveltyModelVersion || "iforest-v1" },
            ].map((row) => (
              <div key={row.label} className="flex items-center justify-between gap-4 rounded-lg bg-mist px-4 py-3">
                <dt className="text-sm font-bold text-ink-500">{row.label}</dt>
                <dd className="rounded-md border border-line bg-white px-2.5 py-1 font-mono text-xs font-bold text-brand-700">
                  {row.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
    </div>
  );
}
