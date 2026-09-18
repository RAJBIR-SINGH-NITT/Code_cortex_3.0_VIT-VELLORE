import { useCallback, useRef, useState } from "react";
import { IconUpload, IconFile, IconTrash, IconSpinner } from "./Icons";

function formatBytes(bytes) {
  if (!Number.isFinite(bytes)) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function FileDropzone({ file, reading, meta, error, onFile, onClear }) {
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef(null);

  const handleFiles = useCallback(
    (fileList) => {
      const f = fileList && fileList[0];
      if (f) onFile(f);
    },
    [onFile]
  );

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  if (file) {
    return (
      <div className="rounded-xl border-2 border-brand-300 bg-brand-50/60 p-5 shadow-soft">
        <div className="flex items-start gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-brand-600 text-white">
            {reading ? <IconSpinner className="h-5 w-5" /> : <IconFile className="h-6 w-6" />}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate font-display text-base font-bold text-ink-900" title={file.name}>
              {file.name}
            </p>
            <p className="mt-0.5 text-sm font-semibold text-ink-500">
              {formatBytes(file.size)}
              {reading && " · Reading file…"}
              {!reading && meta?.isPE && " · Windows executable detected"}
              {!reading && meta && !meta.isPE && " · Generic file analysis"}
            </p>
            {error && <p className="mt-1.5 text-sm font-bold text-red-600">{error}</p>}
          </div>
          <button
            type="button"
            onClick={onClear}
            aria-label="Remove selected file"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-line bg-white text-ink-400 shadow-soft transition-colors hover:bg-white hover:text-red-600"
          >
            <IconTrash className="h-4.5 w-4.5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label="Attach a file to check"
      onClick={() => inputRef.current?.click()}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          inputRef.current?.click();
        }
      }}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={onDrop}
      className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors duration-150 ${
        dragOver ? "border-brand-500 bg-brand-50" : "border-line bg-white hover:border-brand-300 hover:bg-brand-50/40"
      }`}
    >
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-100 text-brand-700">
        <IconUpload className="h-7 w-7" />
      </span>
      <p className="mt-4 font-display text-lg font-bold text-ink-900">Drop a file here, or click to browse</p>
      <p className="mt-1.5 text-sm font-semibold text-ink-400">
        Works best with Windows .exe / .dll files. Other file types get a general check.
      </p>
      <input
        ref={inputRef}
        type="file"
        className="sr-only"
        onChange={(e) => handleFiles(e.target.files)}
        aria-hidden="true"
        tabIndex={-1}
      />
    </div>
  );
}
