import { IconSpinner } from "./Icons";

export default function LoadingState({
  title = "Checking your sample...",
  subtitle = "Comparing it with what the model has learned.",
}) {
  return (
    <div
      aria-live="polite"
      className="flex flex-col items-center rounded-2xl border border-line bg-white px-6 py-14 text-center shadow-soft"
    >
      <IconSpinner className="h-10 w-10 text-brand-600" />
      <p className="mt-5 font-display text-xl font-bold text-ink-900">{title}</p>
      <p className="mt-1.5 text-sm font-semibold text-ink-500">{subtitle}</p>
    </div>
  );
}
