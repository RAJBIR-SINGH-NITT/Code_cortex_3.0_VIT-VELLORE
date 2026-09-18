import VerdictPill from "./VerdictPill";
import { IconChevronRight } from "./Icons";
import { sampleLabelFor } from "../api/demoData";

function formatDate(ts) {
  try {
    return new Date(ts).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
}

function MiniScore({ value, className }) {
  const pct = Math.round(value * 100);
  return (
    <span className="flex items-center gap-2">
      <span className="h-1.5 w-14 overflow-hidden rounded-full bg-ink-900/10">
        <span className={`block h-full rounded-full ${className}`} style={{ width: `${pct}%` }} />
      </span>
      <span className="w-10 text-sm font-bold tabular-nums text-ink-700">{pct}%</span>
    </span>
  );
}

export default function HistoryTable({ scans, onView }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-soft">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left">
          <thead className="bg-mist/80 text-xs font-bold uppercase tracking-wide text-ink-500">
            <tr>
              <th className="px-5 py-3.5">Date</th>
              <th className="px-5 py-3.5">Sample</th>
              <th className="px-5 py-3.5">Result</th>
              <th className="px-5 py-3.5">Malware Score</th>
              <th className="px-5 py-3.5">Unusual Score</th>
              <th className="px-5 py-3.5">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {scans.map((scan) => (
              <tr
                key={scan.scanId}
                tabIndex={0}
                onClick={() => onView(scan)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onView(scan);
                  }
                }}
                aria-label={`View details for check on ${formatDate(scan.timestamp)}`}
                className="cursor-pointer transition-colors hover:bg-brand-50/60 focus-visible:bg-brand-50/60"
              >
                <td className="whitespace-nowrap px-5 py-4 text-sm font-bold text-ink-900">
                  {formatDate(scan.timestamp)}
                </td>
                <td className="whitespace-nowrap px-5 py-4 text-sm font-semibold text-ink-500">
                  {sampleLabelFor(scan.sampleId)}
                </td>
                <td className="px-5 py-4">
                  <VerdictPill verdict={scan.verdict} />
                </td>
                <td className="px-5 py-4">
                  <MiniScore value={scan.malwareProbability} className="bg-red-500" />
                </td>
                <td className="px-5 py-4">
                  <MiniScore value={scan.noveltyScore} className="bg-amber-500" />
                </td>
                <td className="px-5 py-4">
                  <span className="inline-flex items-center gap-1 text-sm font-bold text-brand-700">
                    View
                    <IconChevronRight className="h-4 w-4" />
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
