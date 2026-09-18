import { useEffect, useRef } from "react";
import VerdictCard from "./VerdictCard";
import EvidenceList from "./EvidenceList";
import { IconX } from "./Icons";

export default function ScanDetailModal({ scan, onClose }) {
  const closeRef = useRef(null);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  if (!scan) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label="Check details"
    >
      <div
        className="animate-fade-in absolute inset-0 bg-ink-900/45 backdrop-blur-[2px]"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="animate-pop relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-mist p-4 shadow-lift sm:p-6">
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Close details"
          className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-line bg-white text-ink-500 shadow-soft transition-colors hover:bg-mist hover:text-ink-900"
        >
          <IconX className="h-4.5 w-4.5" />
        </button>

        <VerdictCard result={scan} />
        <EvidenceList result={scan} />

        <p className="mt-4 px-1 text-center text-xs font-semibold text-ink-400">
          Full scan ID: <span className="font-mono">{scan.scanId}</span>
        </p>
      </div>
    </div>
  );
}
