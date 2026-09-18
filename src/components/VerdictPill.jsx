import { verdictMeta } from "./verdictMeta";

export default function VerdictPill({ verdict }) {
  const meta = verdictMeta(verdict);
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-bold ${meta.pillClass}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
      {meta.badge}
    </span>
  );
}
