import { useRef, useState } from "react";
import SampleCard from "../components/SampleCard";
import FileDropzone from "../components/FileDropzone";
import AnalyzeButton from "../components/AnalyzeButton";
import VerdictCard from "../components/VerdictCard";
import EvidenceList from "../components/EvidenceList";
import LoadingState from "../components/LoadingState";
import ErrorState from "../components/ErrorState";
import { IconChip, IconChevronDown, IconFileSearch, IconInfo, IconRefresh } from "../components/Icons";
import { SAMPLES, SAMPLES_BY_KEY } from "../api/demoData";
import { analyzeSample } from "../api/triageApi";
import { extractFeaturesFromFile } from "../utils/peFeatures";

function EmptyResult() {
  return (
    <div className="flex flex-col items-center rounded-2xl border-2 border-dashed border-line bg-white/60 px-6 py-14 text-center">
      <IconFileSearch className="h-10 w-10 text-ink-300" />
      <p className="mt-4 font-display text-xl font-bold text-ink-700">Your result will appear here.</p>
      <p className="mt-1.5 text-sm font-semibold text-ink-400">Attach a file or choose a sample to begin.</p>
    </div>
  );
}

export default function Analyze({ onAnalyzed }) {
  // Source of truth for what will be checked: "file" | "sample" | null.
  const [source, setSource] = useState(null);
  const [selectedKey, setSelectedKey] = useState(null);

  const [file, setFile] = useState(null);
  const [fileFeatures, setFileFeatures] = useState(null);
  const [fileMeta, setFileMeta] = useState(null);
  const [fileReading, setFileReading] = useState(false);
  const [fileError, setFileError] = useState(null);

  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [text, setText] = useState("");
  const [customEdited, setCustomEdited] = useState(false);
  const [jsonError, setJsonError] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const resultRef = useRef(null);

  const selectSample = (sample) => {
    setSource("sample");
    setSelectedKey(sample.key);
    setFile(null);
    setFileFeatures(null);
    setFileMeta(null);
    setFileError(null);
    setCustomEdited(false);
    setJsonError(false);
    setText(JSON.stringify(sample.features, null, 2));
  };

  const handleFile = async (f) => {
    setSource("file");
    setSelectedKey(null);
    setFile(f);
    setFileFeatures(null);
    setFileMeta(null);
    setFileError(null);
    setCustomEdited(false);
    setJsonError(false);
    setResult(null);
    setError(null);
    setFileReading(true);
    try {
      const { features, meta } = await extractFeaturesFromFile(f);
      setFileFeatures(features);
      setFileMeta(meta);
      setText(JSON.stringify(features, null, 2));
    } catch (e) {
      const messages = {
        "empty-file": "That file appears to be empty.",
        "file-too-large": "That file is too large to check here (max 60 MB).",
        "read-failed": "We couldn't read that file. Please try another one.",
      };
      setFileError(messages[e?.message] || "We couldn't read that file. Please try another one.");
    } finally {
      setFileReading(false);
    }
  };

  const clearFile = () => {
    setFile(null);
    setFileFeatures(null);
    setFileMeta(null);
    setFileError(null);
    setSource(null);
    setText("");
    setCustomEdited(false);
  };

  const onTextChange = (value) => {
    setText(value);
    setCustomEdited(true);
    setJsonError(false);
  };

  const resetToSource = () => {
    if (source === "file" && fileFeatures) {
      setText(JSON.stringify(fileFeatures, null, 2));
    } else if (source === "sample" && selectedKey) {
      setText(JSON.stringify(SAMPLES_BY_KEY[selectedKey].features, null, 2));
    }
    setCustomEdited(false);
    setJsonError(false);
  };

  const run = async () => {
    let features;
    let sampleId;

    if (customEdited) {
      try {
        features = JSON.parse(text);
        if (typeof features !== "object" || features === null || Array.isArray(features)) {
          throw new Error("not an object");
        }
      } catch {
        setJsonError(true);
        return;
      }
      sampleId = "custom-" + Date.now().toString(36);
    } else if (source === "file") {
      if (!fileFeatures) return;
      features = fileFeatures;
      sampleId = "file:" + encodeURIComponent(file?.name || "uploaded-file");
    } else if (source === "sample") {
      if (!selectedKey) return;
      features = SAMPLES_BY_KEY[selectedKey].features;
      sampleId = selectedKey;
    } else {
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const scan = await analyzeSample({ sampleId, features });
      setResult(scan);
      onAnalyzed?.();
      requestAnimationFrame(() => {
        resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    } catch (e) {
      setError(e?.message || "Something went wrong while checking the sample.");
    } finally {
      setLoading(false);
    }
  };

  const selectedSample = selectedKey ? SAMPLES_BY_KEY[selectedKey] : null;
  const canRun =
    !loading &&
    !fileReading &&
    (customEdited || (source === "file" && fileFeatures) || (source === "sample" && selectedKey));

  let statusLine = "Attach a file or choose a sample to begin.";
  if (fileReading) statusLine = "";
  else if (customEdited) statusLine = "Custom features will be checked.";
  else if (source === "file" && file) statusLine = `Selected file: ${file.name}`;
  else if (selectedSample) statusLine = `Selected: ${selectedSample.title}`;

  return (
    <div className="mx-auto max-w-4xl px-4 pb-20 sm:px-6">
      <header className="animate-fade-up pt-10 sm:pt-14">
        <h1 className="font-display text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">
          Analyze a Sample
        </h1>
        <p className="mt-2 text-lg font-semibold text-ink-500">
          Attach a file, or choose a sample if you don't have one handy.
        </p>
        <p className="mt-3 inline-flex items-center gap-2 rounded-full border border-line bg-white px-3.5 py-1.5 text-xs font-bold text-ink-500">
          <IconInfo className="h-4 w-4 shrink-0 text-brand-600" />
          Your file stays in your browser — only its extracted features are sent for checking.
        </p>
      </header>

      {/* Step 1: attach a file */}
      <section className="animate-fade-up mt-9" style={{ animationDelay: "60ms" }}>
        <p className="text-xs font-bold uppercase tracking-wide text-ink-400">1 · Attach a file</p>
        <div className="mt-3">
          <FileDropzone
            file={file}
            reading={fileReading}
            meta={fileMeta}
            error={fileError}
            onFile={handleFile}
            onClear={clearFile}
          />
        </div>
      </section>

      {/* Step 2: or pick a sample */}
      <section className="animate-fade-up mt-8" style={{ animationDelay: "100ms" }}>
        <div className="flex items-center gap-3">
          <span className="h-px flex-1 bg-line" />
          <p className="text-xs font-bold uppercase tracking-wide text-ink-400">or try a sample</p>
          <span className="h-px flex-1 bg-line" />
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {SAMPLES.map((sample) => (
            <SampleCard
              key={sample.key}
              sample={sample}
              selected={selectedKey === sample.key && source === "sample" && !customEdited}
              onSelect={selectSample}
            />
          ))}
        </div>

        {/* Advanced input */}
        <div className="mt-4 overflow-hidden rounded-xl border border-line bg-white shadow-soft">
          <button
            type="button"
            onClick={() => setAdvancedOpen((v) => !v)}
            aria-expanded={advancedOpen}
            className="flex w-full items-center justify-between px-5 py-4 text-left transition-colors hover:bg-mist/60"
          >
            <span className="flex items-center gap-2.5 text-base font-bold text-ink-900">
              <IconChip className="h-5 w-5 text-brand-600" />
              Advanced input
              <span className="hidden text-xs font-semibold text-ink-400 sm:inline">
                view or edit the extracted feature JSON
              </span>
            </span>
            <IconChevronDown
              className={`h-5 w-5 text-ink-400 transition-transform duration-200 ${advancedOpen ? "rotate-180" : ""}`}
            />
          </button>
          {advancedOpen && (
            <div className="animate-fade-in border-t border-line px-5 pb-5 pt-4">
              <textarea
                value={text}
                onChange={(e) => onTextChange(e.target.value)}
                spellCheck={false}
                aria-label="Extracted file features as JSON"
                placeholder="Attach a file or select a sample above to load its extracted features, or paste your own JSON here."
                className="h-64 w-full resize-y rounded-lg border border-line bg-mist p-4 font-mono text-xs leading-relaxed text-ink-900 placeholder:font-body placeholder:text-sm placeholder:text-ink-400 focus:border-brand-400"
              />
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs font-semibold text-ink-400">
                  Changes switch the check to a custom sample.
                </p>
                <button
                  type="button"
                  onClick={resetToSource}
                  disabled={!source}
                  className="text-sm font-bold text-brand-700 underline-offset-2 hover:underline disabled:cursor-not-allowed disabled:text-ink-300"
                >
                  Reset to selection
                </button>
              </div>
              {jsonError && (
                <p role="alert" className="mt-2 text-sm font-bold text-red-600">
                  The custom input is not valid JSON.
                </p>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Step 3: run the check */}
      <section className="animate-fade-up mt-10" style={{ animationDelay: "140ms" }}>
        <p className="text-xs font-bold uppercase tracking-wide text-ink-400">2 · Run the check</p>
        <div className="mt-3 flex flex-wrap items-center gap-4">
          <AnalyzeButton onClick={run} disabled={!canRun} loading={loading}>
            Check Sample
          </AnalyzeButton>
          <p className="text-sm font-bold text-ink-400" aria-live="polite">
            {statusLine}
          </p>
        </div>
      </section>

      {/* Result */}
      <div ref={resultRef} aria-live="polite" className="mt-10 scroll-mt-24">
        {loading ? (
          <LoadingState />
        ) : error ? (
          <ErrorState message={error} onRetry={run} />
        ) : result ? (
          <>
            <VerdictCard result={result} />
            <EvidenceList result={result} />
            <div className="mt-7 flex justify-center">
              <button
                type="button"
                onClick={() => {
                  setResult(null);
                  setError(null);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="inline-flex items-center gap-2 rounded-lg border border-line bg-white px-5 py-2.5 text-sm font-bold text-ink-700 shadow-soft transition-colors hover:bg-mist"
              >
                <IconRefresh className="h-4 w-4" />
                Check another sample
              </button>
            </div>
          </>
        ) : (
          <EmptyResult />
        )}
      </div>
    </div>
  );
}
