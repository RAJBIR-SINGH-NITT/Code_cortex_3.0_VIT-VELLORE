import { IconShieldCheck, IconSpinner } from "./Icons";

export default function AnalyzeButton({ onClick, disabled = false, loading = false, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      aria-busy={loading}
      className={`inline-flex items-center gap-2.5 rounded-xl px-7 py-4 font-display text-base font-bold uppercase tracking-wide text-white shadow-lift transition-all duration-200 sm:text-lg ${
        disabled || loading
          ? "cursor-not-allowed bg-ink-300"
          : "bg-brand-600 hover:-translate-y-0.5 hover:bg-brand-700 active:translate-y-0 active:scale-[0.99]"
      }`}
    >
      {loading ? (
        <>
          <IconSpinner className="h-5 w-5" />
          Checking the sample...
        </>
      ) : (
        <>
          <IconShieldCheck className="h-5 w-5" />
          {children || "Check Sample"}
        </>
      )}
    </button>
  );
}
