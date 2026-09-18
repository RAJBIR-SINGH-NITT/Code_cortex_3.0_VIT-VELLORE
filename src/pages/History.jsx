import { useCallback, useEffect, useState } from "react";
import HistoryTable from "../components/HistoryTable";
import ScanDetailModal from "../components/ScanDetailModal";
import ErrorState from "../components/ErrorState";
import { IconClock, IconArrowRight } from "../components/Icons";
import { getHistory, getScan } from "../api/triageApi";

function TableSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-soft">
      <div className="space-y-4 p-6">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="flex animate-pulse items-center gap-4">
            <div className="h-4 w-28 rounded bg-ink-900/10" />
            <div className="h-4 w-24 rounded bg-ink-900/10" />
            <div className="h-5 w-20 rounded-full bg-ink-900/10" />
            <div className="ml-auto h-4 w-16 rounded bg-ink-900/10" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function History({ historyVersion }) {
  const [scans, setScans] = useState(null); // null = loading
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);

  const load = useCallback(async () => {
    setError(null);
    setScans(null);
    try {
      const list = await getHistory();
      setScans(list);
    } catch (e) {
      setError(e?.message || "We couldn't load your previous checks.");
      setScans([]);
    }
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const list = await getHistory();
        if (active) setScans(list);
      } catch (e) {
        if (active) {
          setError(e?.message || "We couldn't load your previous checks.");
          setScans([]);
        }
      }
    })();
    return () => {
      active = false;
    };
  }, [historyVersion]);

  const openDetails = async (scan) => {
    setSelected(scan);
    try {
      const full = await getScan(scan.scanId);
      if (full) setSelected(full);
    } catch {
      // keep the row data — it already contains everything we show
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 pb-20 sm:px-6">
      <header className="animate-fade-up flex flex-wrap items-end justify-between gap-4 pt-10 sm:pt-14">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">
            Previous Checks
          </h1>
          <p className="mt-2 text-lg font-semibold text-ink-500">Everything you've checked, in one place.</p>
        </div>
        {scans !== null && scans.length > 0 && (
          <span className="rounded-full border border-line bg-white px-3.5 py-1.5 text-xs font-bold text-ink-500 shadow-soft">
            {scans.length} check{scans.length === 1 ? "" : "s"}
          </span>
        )}
      </header>

      <div className="animate-fade-up mt-8" style={{ animationDelay: "80ms" }}>
        {scans === null ? (
          <TableSkeleton />
        ) : error && scans.length === 0 ? (
          <ErrorState title="We couldn't load your checks" message={error} onRetry={load} retryLabel="Try Again" />
        ) : scans.length === 0 ? (
          <div className="flex flex-col items-center rounded-2xl border-2 border-dashed border-line bg-white/60 px-6 py-16 text-center">
            <IconClock className="h-10 w-10 text-ink-300" />
            <p className="mt-4 font-display text-xl font-bold text-ink-700">No checks yet.</p>
            <p className="mt-1.5 text-sm font-semibold text-ink-400">
              Run your first check and it will show up here.
            </p>
            <a
              href="#/analyze"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-brand-600 px-6 py-3 font-display text-sm font-bold uppercase tracking-wide text-white shadow-lift transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-700"
            >
              Analyze a sample
              <IconArrowRight className="h-4.5 w-4.5" />
            </a>
          </div>
        ) : (
          <HistoryTable scans={scans} onView={openDetails} />
        )}
      </div>

      {selected && <ScanDetailModal scan={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
