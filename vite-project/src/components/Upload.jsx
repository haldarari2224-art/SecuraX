import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  CloudUpload,
  Search,
  Sparkles,
  User,
  FolderOpen,
  Zap,
  Eye,
  EyeOff,
  ChevronDown,
  Settings,
  X,
  FileCheck2,
  Play,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";
import Sidebar from "./Sidebar";
import bg from "../assets/goat.avif";
import { uploadPcap, loadSample } from "../api";

const MAX_SIZE = 500 * 1024 * 1024; // 500MB
const ALLOWED_EXT = [".pcap", ".pcapng"];

const IKE_OPTIONS = [
  { value: "auto", label: "Auto-detect (IKEv1 & IKEv2)" },
  { value: "ikev1", label: "IKEv1 only" },
  { value: "ikev2", label: "IKEv2 only" },
];

import { useSettings } from "../context/SettingsContext";

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

export default function Upload() {
  const { settings, t } = useSettings();
  const navigate = useNavigate();
  const inputRef = useRef(null);

  const maxBytes = (parseInt(settings?.maxFileSize, 10) || 50) * 1024 * 1024;
  const allowedExtensions = Object.entries(settings?.formats || { pcap: true, pcapng: true })
    .filter(([_, enabled]) => enabled)
    .map(([ext]) => `.${ext}`);

  const [query, setQuery] = useState("");
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);
  const [ikeVersion, setIkeVersion] = useState(settings?.ikeVersion || "auto");
  const [psk, setPsk] = useState("");
  const [showPsk, setShowPsk] = useState(false);
  const [progress, setProgress] = useState(null); // null = idle, 0-100 = running
  const [statusMessage, setStatusMessage] = useState("");
  const [loadingSample, setLoadingSample] = useState(false);

  const analyzing = progress !== null && progress < 100;
  const done = progress === 100;

  function validateAndSet(f) {
    if (!f) return;
    const name = f.name.toLowerCase();
    const isAllowed = allowedExtensions.length > 0
      ? allowedExtensions.some((ext) => name.endsWith(ext))
      : name.endsWith(".pcap") || name.endsWith(".pcapng");

    if (!isAllowed) {
      setError(`Unsupported file type. Allowed formats: ${allowedExtensions.join(", ") || ".pcap, .pcapng"}`);
      return;
    }
    if (f.size > maxBytes) {
      setError(`File is ${formatSize(f.size)}. Exceeds your configured limit of ${settings?.maxFileSize || 50} MB (you can increase this in Settings).`);
      return;
    }
    setError("");
    setProgress(null);
    setFile(f);
  }

  function onDrop(e) {
    e.preventDefault();
    setDragging(false);
    validateAndSet(e.dataTransfer.files?.[0]);
  }

  function clearFile() {
    setFile(null);
    setProgress(null);
    setError("");
    setStatusMessage("");
    if (inputRef.current) inputRef.current.value = "";
  }

  async function startAnalysis() {
    if (!file || analyzing) return;
    setError("");
    setProgress(15);
    setStatusMessage("Uploading capture file to SecuraX backend...");

    try {
      const progTimer = setInterval(() => {
        setProgress((prev) => (prev < 85 ? prev + 15 : prev));
      }, 300);

      const result = await uploadPcap(file, ikeVersion, psk);
      clearInterval(progTimer);

      setProgress(100);
      setStatusMessage(`Analysis complete! Score: ${result.score}/100 (${result.grade})`);
      localStorage.setItem("currentAnalysisId", result.analysis_id);
    } catch (err) {
      console.error(err);
      setError(`Analysis error: ${err.message || "Failed to analyze capture"}`);
      setProgress(null);
      setStatusMessage("");
    }
  }

  async function handleLoadSample(scenarioKey) {
    setLoadingSample(true);
    setError("");
    setStatusMessage(`Loading pre-configured scenario: ${scenarioKey}...`);
    try {
      const data = await loadSample(scenarioKey);
      localStorage.setItem("currentAnalysisId", data.id);
      navigate("/analysis");
    } catch (err) {
      setError("Failed to load sample: " + err.message);
    } finally {
      setLoadingSample(false);
    }
  }

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-fixed text-white"
      style={{
        backgroundImage: `linear-gradient(rgba(4,10,32,0.8), rgba(4,10,32,0.8)), url(${bg})`,
      }}
    >
      <div className="flex min-h-screen">
        <Sidebar />

        <div className="flex min-w-0 flex-1 flex-col">
          {/* Top bar */}
          

          {/* Content */}
          <main className="flex-1 p-5 md:p-8">
            {/* Page heading */}
            <div className="mb-6 flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-blue-600/30 text-blue-300">
                <CloudUpload size={28} />
              </div>
              <div>
                <h1 className="text-3xl font-bold leading-tight">{t("upload_title")}</h1>
                <p className="mt-1 max-w-xl text-sm text-slate-300">
                  {t("upload_sub")}
                </p>
              </div>
            </div>

            {/* Drop zone */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
              className={`flex min-h-60 flex-col items-center justify-center rounded-2xl border-2 border-dashed px-4 py-8 text-center backdrop-blur-md transition-all ${
                dragging
                  ? "border-blue-300 bg-blue-800/50 shadow-[0_0_30px_rgba(59,130,246,0.35)]"
                  : "border-blue-500/60 bg-blue-950/50"
              }`}
            >
              <input
                ref={inputRef}
                type="file"
                accept=".pcap,.pcapng"
                className="hidden"
                onChange={(e) => validateAndSet(e.target.files?.[0])}
              />

              {file ? (
                <div className="flex flex-col items-center gap-3">
                  <FileCheck2 size={48} className="text-emerald-400" />
                  <div>
                    <div className="break-all text-lg font-semibold">{file.name}</div>
                    <div className="mt-1 text-sm text-slate-300">{formatSize(file.size)}</div>
                  </div>
                  <button
                    onClick={clearFile}
                    disabled={analyzing}
                    className="flex h-9 items-center gap-1.5 rounded-lg border border-blue-500/40 px-4 text-sm text-slate-100 hover:bg-blue-500/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <X size={16} /> Remove file
                  </button>
                </div>
              ) : (
                <>
                  <CloudUpload size={56} strokeWidth={1.5} className="text-blue-400" />
                  <div className="mt-3 text-xl font-semibold">
                    {dragging ? "Drop the file to upload" : t("dropzone_title")}
                  </div>
                  <div className="mt-1.5 text-sm text-slate-300">
                    {t("dropzone_sub")} {settings?.maxFileSize || 50} MB
                  </div>
                  <button
                    onClick={() => inputRef.current?.click()}
                    className="mt-5 flex h-11 items-center gap-2 rounded-lg bg-blue-600 px-6 text-sm font-semibold text-white hover:bg-blue-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 cursor-pointer"
                  >
                    <FolderOpen size={18} /> {t("browse_files")}
                  </button>
                </>
              )}

              {error && (
                <div role="alert" className="mt-4 text-sm text-red-300">
                  {error}
                </div>
              )}
            </div>

            {/* Analysis options */}
            <section className="mt-6 rounded-2xl border border-blue-500/20 bg-[#071335]/70 p-5 backdrop-blur-md">
              <h2 className="flex items-center gap-2 text-lg font-bold">
                <Settings size={20} className="text-slate-300" />
                Analysis Options
              </h2>

              <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
                <div>
                  <label htmlFor="ike" className="mb-2 block text-sm font-semibold">
                    IKE Version Detection
                  </label>
                  <div className="relative">
                    <select
                      id="ike"
                      value={ikeVersion}
                      onChange={(e) => setIkeVersion(e.target.value)}
                      className="h-11 w-full appearance-none rounded-lg border border-blue-500/30 bg-[#071335]/80 px-4 pr-10 text-sm text-slate-100 outline-none focus:border-blue-400 focus-visible:ring-2 focus-visible:ring-blue-500/60"
                    >
                      {IKE_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value} className="bg-slate-900">
                          {o.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      size={16}
                      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-300"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="psk" className="mb-2 block text-sm font-semibold">
                    Pre-shared Key{" "}
                    <span className="font-normal text-slate-300">(Optional for Decryption)</span>
                  </label>
                  <div className="relative">
                    <input
                      id="psk"
                      type={showPsk ? "text" : "password"}
                      value={psk}
                      onChange={(e) => setPsk(e.target.value)}
                      placeholder="Enter PSK if available"
                      autoComplete="off"
                      className="h-11 w-full rounded-lg border border-blue-500/30 bg-[#071335]/80 pl-4 pr-11 text-sm text-slate-100 outline-none placeholder:text-slate-400 focus:border-blue-400 focus-visible:ring-2 focus-visible:ring-blue-500/60"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPsk(!showPsk)}
                      aria-label={showPsk ? "Hide pre-shared key" : "Show pre-shared key"}
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded text-slate-300 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
                    >
                      {showPsk ? <Eye size={18} /> : <EyeOff size={18} />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Quick Sample Test Banner */}
              <div className="mt-8 rounded-xl border border-blue-500/20 bg-blue-950/40 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-blue-200">{t("dont_have_pcap")}</h3>
                    <p className="text-xs text-slate-400">{t("dont_have_pcap_sub")}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={analyzing || loadingSample}
                      onClick={() => handleLoadSample("vulnerable_legacy")}
                      className="flex items-center gap-1.5 rounded-lg border border-red-500/40 bg-red-950/40 px-3 py-1.5 text-xs font-medium text-red-200 hover:bg-red-900/50 transition-colors cursor-pointer"
                    >
                      <ShieldAlert size={14} />
                      {t("btn_vulnerable")}
                    </button>
                    <button
                      type="button"
                      disabled={analyzing || loadingSample}
                      onClick={() => handleLoadSample("compliant_modern")}
                      className="flex items-center gap-1.5 rounded-lg border border-emerald-500/40 bg-emerald-950/40 px-3 py-1.5 text-xs font-medium text-emerald-200 hover:bg-emerald-900/50 transition-colors cursor-pointer"
                    >
                      <ShieldCheck size={14} />
                      {t("btn_compliant")}
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-col-reverse gap-4 md:flex-row md:items-center md:justify-end">
                {progress !== null && (
                  <div className="flex-1" aria-live="polite">
                    <div className="mb-1.5 text-sm text-slate-300">
                      {statusMessage || (done ? "Analysis complete" : `Analyzing ${file?.name}... ${progress}%`)}
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-slate-700/60">
                      <div
                        className={`h-full transition-all duration-200 ${
                          done ? "bg-emerald-400" : "bg-blue-500"
                        }`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                )}

                {done ? (
                  <button
                    onClick={() => navigate("/analysis")}
                    className="flex h-11 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-6 text-sm font-semibold text-white hover:bg-emerald-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
                  >
                    <Eye size={18} /> View Results
                  </button>
                ) : (
                  <button
                    onClick={startAnalysis}
                    disabled={!file || analyzing || loadingSample}
                    className="flex h-11 items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 text-sm font-semibold text-white hover:bg-blue-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Zap size={18} />
                    {analyzing ? "Analyzing..." : "Start Security Analysis"}
                  </button>
                )}
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}