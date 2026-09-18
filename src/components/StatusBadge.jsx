const STYLES = {
  online: {
    pill: "bg-brand-50 border-brand-200 text-brand-800",
    dot: "bg-brand-500",
    ping: "bg-brand-400",
    label: "Online",
    pingActive: true,
  },
  offline: {
    pill: "bg-red-50 border-red-200 text-red-700",
    dot: "bg-red-500",
    ping: "bg-red-400",
    label: "Offline",
    pingActive: false,
  },
  checking: {
    pill: "bg-mist border-line text-ink-500",
    dot: "bg-ink-300",
    ping: "bg-ink-300",
    label: "Checking…",
    pingActive: true,
  },
};

export default function StatusBadge({ status = "offline", showLabel = false }) {
  const s = STYLES[status] || STYLES.offline;
  return (
    <span
      role="status"
      aria-label={`System status: ${s.label}`}
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-bold ${s.pill}`}
    >
      {showLabel && <span className="font-semibold text-ink-500">System Status:</span>}
      <span className="relative flex h-2.5 w-2.5">
        {s.pingActive && (
          <span className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-60 ${s.ping}`} />
        )}
        <span className={`relative inline-flex h-2.5 w-2.5 rounded-full ${s.dot}`} />
      </span>
      {s.label}
    </span>
  );
}
