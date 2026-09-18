import { IconAlert, IconRefresh } from "./Icons";

export default function ErrorState({
  title = "We couldn't check the sample",
  message = "Something went wrong while checking the sample.",
  onRetry,
  retryLabel = "Try Again",
}) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center rounded-2xl border border-red-200 bg-red-50 px-6 py-12 text-center"
    >
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
        <IconAlert className="h-6 w-6" />
      </span>
      <p className="mt-4 font-display text-xl font-bold text-red-700">{title}</p>
      <p className="mt-1.5 max-w-md text-sm font-semibold text-ink-700">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-6 inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white px-5 py-2.5 text-sm font-bold text-red-700 shadow-soft transition-colors hover:bg-red-100"
        >
          <IconRefresh className="h-4 w-4" />
          {retryLabel}
        </button>
      )}
    </div>
  );
}
