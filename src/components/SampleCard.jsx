import { IconShieldCheck, IconBug, IconSearch, IconCheck } from "./Icons";

const ICONS = { shield: IconShieldCheck, bug: IconBug, search: IconSearch };

const TONES = {
  brand: {
    tile: "bg-brand-100 text-brand-700",
    ring: "border-brand-500 ring-2 ring-brand-500/25",
    check: "bg-brand-600 text-white",
  },
  danger: {
    tile: "bg-red-100 text-red-600",
    ring: "border-red-400 ring-2 ring-red-400/25",
    check: "bg-red-600 text-white",
  },
  warn: {
    tile: "bg-amber-100 text-amber-600",
    ring: "border-amber-400 ring-2 ring-amber-400/25",
    check: "bg-amber-500 text-white",
  },
};

export default function SampleCard({ sample, selected = false, onSelect }) {
  const Icon = ICONS[sample.icon] || IconSearch;
  const tone = TONES[sample.tone] || TONES.brand;

  return (
    <button
      type="button"
      onClick={() => onSelect(sample)}
      aria-pressed={selected}
      className={`group relative w-full rounded-xl border-2 bg-white p-5 text-left shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lift ${
        selected ? tone.ring : "border-line hover:border-brand-300"
      }`}
    >
      <span
        aria-hidden="true"
        className={`absolute right-3.5 top-3.5 flex h-6 w-6 items-center justify-center rounded-full transition-all duration-200 ${
          selected ? `${tone.check} scale-100 opacity-100` : "scale-50 opacity-0"
        }`}
      >
        <IconCheck className="h-3.5 w-3.5" />
      </span>

      <span
        className={`flex h-12 w-12 items-center justify-center rounded-lg transition-transform duration-200 group-hover:scale-105 ${tone.tile}`}
      >
        <Icon className="h-6 w-6" />
      </span>
      <span className="mt-4 block font-display text-lg font-bold tracking-tight text-ink-900">
        {sample.title}
      </span>
      <span className="mt-1 block text-sm font-semibold text-ink-500">{sample.tagline}</span>
    </button>
  );
}
