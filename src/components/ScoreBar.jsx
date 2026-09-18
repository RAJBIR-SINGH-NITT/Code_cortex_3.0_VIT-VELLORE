import { useEffect, useState } from "react";

const FILL = {
  danger: "bg-red-500",
  warn: "bg-amber-500",
  brand: "bg-brand-500",
  neutral: "bg-ink-300",
};

const VALUE_TEXT = {
  danger: "text-red-700",
  warn: "text-amber-700",
  brand: "text-brand-700",
  neutral: "text-ink-700",
};

export default function ScoreBar({ label, caption, value = 0, tone = "brand", compact = false }) {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setWidth(Math.round(value * 100)));
    return () => cancelAnimationFrame(frame);
  }, [value]);

  const pct = Math.round(value * 100);

  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <span className={`font-bold text-ink-900 ${compact ? "text-xs" : "text-sm sm:text-base"}`}>
          {label}
        </span>
        <span
          className={`font-display font-bold tabular-nums ${VALUE_TEXT[tone] || VALUE_TEXT.brand} ${
            compact ? "text-sm" : "text-xl sm:text-2xl"
          }`}
        >
          {pct}%
        </span>
      </div>
      <div
        role="meter"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
        aria-label={`${label}: ${pct}%`}
        className={`mt-1.5 w-full overflow-hidden rounded-full bg-ink-900/10 ${compact ? "h-2" : "h-3"}`}
      >
        <div
          className={`h-full rounded-full transition-[width] duration-1000 ease-out ${FILL[tone] || FILL.brand}`}
          style={{ width: `${width}%` }}
        />
      </div>
      {!compact && caption && (
        <p className="mt-1.5 text-xs font-semibold text-ink-400">{caption}</p>
      )}
    </div>
  );
}
