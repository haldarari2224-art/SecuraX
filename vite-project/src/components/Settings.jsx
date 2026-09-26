import { useState } from "react";
import {
  Settings as SettingsIcon,
  Sun,
  Moon,
  Shield,
  ShieldCheck,
  Lock,
  Globe,
  ChevronDown,
  Eye,
  EyeOff,
  CloudUpload,
  BrainCircuit,
  Cloud,
  Link2,
  Database,
  Bell,
  Save,
  RotateCcw,
  Calendar,
  FileText,
  AlertTriangle,
  Layers,
  Lightbulb,
  CheckCircle2,
  Clock,
  Check,
  Cpu,
  Sparkles,
} from "lucide-react";
import Sidebar from "./Sidebar";
import bg from "../assets/eye.jpg";
import { useSettings, DEFAULT_SETTINGS } from "../context/SettingsContext";

/* ---------- Reusable card component ---------- */
function Card({ icon: Icon, title, subtitle, className = "", children }) {
  return (
    <section
      className={`rounded-2xl border border-blue-500/20 bg-[#071335]/70 p-5 backdrop-blur-md transition-all ${className}`}
    >
      <header className="flex items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-blue-500/30 bg-blue-500/10 text-blue-300">
          <Icon size={22} />
        </div>
        <div className="min-w-0">
          <h2 className="font-semibold text-white">{title}</h2>
          <p className="text-xs text-slate-400">{subtitle}</p>
        </div>
      </header>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function Toggle({ checked, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 ${
        checked ? "bg-blue-600" : "bg-slate-600"
      }`}
    >
      <span
        className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
          checked ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}

function ToggleRow({ icon: Icon, title, desc, checked, onChange }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5">
      <div className="flex min-w-0 items-start gap-3">
        {Icon && <Icon size={16} className="mt-0.5 shrink-0 text-slate-300" />}
        <div className="min-w-0">
          <div className="text-sm font-medium text-slate-100">{title}</div>
          {desc && <div className="mt-0.5 text-xs text-slate-400">{desc}</div>}
        </div>
      </div>
      <Toggle label={title} checked={checked} onChange={onChange} />
    </div>
  );
}

function SelectField({ id, label, value, onChange, options, icon: Icon, hint }) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-medium text-slate-100">
        {label}
      </label>
      <div className="relative">
        {Icon && (
          <Icon
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-300"
          />
        )}
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`h-11 w-full appearance-none rounded-lg border border-blue-500/30 bg-[#050d2b]/70 pr-10 text-sm text-slate-100 outline-none focus:border-blue-400 focus-visible:ring-2 focus-visible:ring-blue-500/60 ${
            Icon ? "pl-10" : "pl-4"
          }`}
        >
          {options.map(([v, l]) => (
            <option key={v} value={v} className="bg-slate-900 text-white">
              {l}
            </option>
          ))}
        </select>
        <ChevronDown
          size={16}
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-300"
        />
      </div>
      {hint && <p className="mt-1.5 text-xs text-slate-400">{hint}</p>}
    </div>
  );
}

const inputClass =
  "h-11 w-full rounded-lg border border-blue-500/30 bg-[#050d2b]/70 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-blue-400 focus-visible:ring-2 focus-visible:ring-blue-500/60";

/* ---------- Settings Main Page Component ---------- */
export default function Settings() {
  const { settings, updateSetting, saveSettings, resetSettings, t } = useSettings();

  const [psk, setPsk] = useState("");
  const [showPsk, setShowPsk] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  function toggleFormat(key) {
    const next = { ...settings.formats, [key]: !settings.formats[key] };
    if (!Object.values(next).some(Boolean)) return;
    updateSetting("formats", next);
    setSaved(false);
  }

  function handleSave() {
    try {
      if (settings.apiUrl && settings.apiUrl.startsWith("http")) {
        new URL(settings.apiUrl);
      }
    } catch {
      setError("Please enter a valid API URL (e.g. /api or http://localhost:8000/api)");
      setSaved(false);
      return;
    }
    setError("");
    saveSettings();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  function handleReset() {
    resetSettings();
    setPsk("");
    setError("");
    setSaved(false);
  }

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-fixed text-white transition-colors duration-300"
      style={{
        backgroundImage: `linear-gradient(rgba(4,10,32,0.85), rgba(4,10,32,0.85)), url(${bg})`,
      }}
    >
      <div className="flex min-h-screen">
        <Sidebar />

        <div className="flex min-w-0 flex-1 flex-col">
          <main className="flex-1 p-5 md:p-8">
            {/* ===== Page heading ===== */}
            <div className="flex flex-wrap items-center justify-between gap-5">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-blue-500/40 bg-blue-500/10 text-blue-200">
                  <SettingsIcon size={30} />
                </div>
                <div>
                  <h1 className="text-3xl font-bold leading-tight">{t("settings_title")}</h1>
                  <p className="mt-1 text-sm text-slate-300">
                    {t("settings_subtitle")}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative flex h-16 w-16 items-center justify-center text-blue-400">
                  <Shield size={60} strokeWidth={1.5} />
                  <Lock size={22} className="absolute text-blue-200" />
                </div>
                <div>
                  <div className="text-sm font-semibold">{t("data_secure")}</div>
                  <div className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-300">
                    {t("e2e_enabled")}
                    <span className="h-2 w-2 rounded-full bg-emerald-400" aria-hidden="true" />
                  </div>
                </div>
              </div>
            </div>

            {/* ===== Row 1: General Settings + Security ===== */}
            <div className="mt-6 grid gap-5 lg:grid-cols-5">
              <Card
                icon={SettingsIcon}
                title={t("general_settings")}
                subtitle={t("general_sub")}
                className="lg:col-span-3"
              >
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-6">
                    <div>
                      <div className="mb-2 text-sm font-medium text-slate-100">
                        {t("app_theme")}
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          ["dark", t("theme_dark"), Moon],
                          ["light", t("theme_light"), Sun],
                        ].map(([value, label, Icon]) => (
                          <button
                            key={value}
                            type="button"
                            aria-pressed={settings.theme === value}
                            onClick={() => updateSetting("theme", value)}
                            className={`flex h-11 items-center justify-center gap-2 rounded-lg border text-sm font-medium transition cursor-pointer ${
                              settings.theme === value
                                ? "border-blue-400 bg-blue-600 text-white shadow-[0_0_14px_rgba(59,130,246,0.5)]"
                                : "border-blue-500/30 text-slate-200 hover:bg-blue-500/10"
                            }`}
                          >
                            <Icon size={16} /> {label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <SelectField
                      id="language"
                      label={t("language")}
                      icon={Globe}
                      value={settings.language}
                      onChange={(val) => updateSetting("language", val)}
                      options={[
                        ["English", "English (Global)"],
                        ["Bangla", "বাংলা (Bengali)"],
                        ["Hindi", "हिन्दी (Hindi)"],
                      ]}
                    />
                  </div>

                  <div className="sm:border-l sm:border-blue-500/15 sm:pl-6">
                    <ToggleRow
                      title={t("auto_refresh")}
                      desc={t("auto_refresh_desc")}
                      checked={settings.autoRefresh}
                      onChange={(val) => updateSetting("autoRefresh", val)}
                    />
                    <div className="mt-3">
                      <ToggleRow
                        title={t("show_notifications")}
                        desc={t("show_notifications_desc")}
                        checked={settings.showNotifications}
                        onChange={(val) => updateSetting("showNotifications", val)}
                      />
                    </div>
                  </div>
                </div>
              </Card>

              <Card
                icon={ShieldCheck}
                title={t("security_privacy")}
                subtitle={t("security_privacy_sub")}
                className="lg:col-span-2"
              >
                <div className="space-y-4">
                  <SelectField
                    id="ike"
                    label={t("default_ike")}
                    value={settings.ikeVersion}
                    onChange={(val) => updateSetting("ikeVersion", val)}
                    options={[
                      ["auto", "Auto-detect (IKEv1 & IKEv2)"],
                      ["ikev1", "IKEv1 only"],
                      ["ikev2", "IKEv2 only"],
                    ]}
                  />

                  <div>
                    <label htmlFor="psk" className="mb-2 block text-sm font-medium text-slate-100">
                      {t("psk_label")}
                    </label>
                    <div className="relative">
                      <input
                        id="psk"
                        type={showPsk ? "text" : "password"}
                        value={psk}
                        onChange={(e) => setPsk(e.target.value)}
                        placeholder={t("psk_placeholder")}
                        autoComplete="off"
                        className={`${inputClass} pl-4 pr-11`}
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
                    <p className="mt-1.5 text-xs text-slate-400">
                      {t("psk_hint")}
                    </p>
                  </div>

                  <SelectField
                    id="decrypt"
                    label={t("decryption_mode")}
                    value={settings.decryptionMode}
                    onChange={(val) => updateSetting("decryptionMode", val)}
                    options={[
                      ["auto", "Auto Detect (Recommended)"],
                      ["manual", "Manual (use provided PSK)"],
                      ["off", "Disabled (Headers Only)"],
                    ]}
                    hint={t("decryption_mode_hint")}
                  />
                </div>
              </Card>
            </div>

            {/* ===== Row 2: File Upload + AI Settings + Backend ===== */}
            <div className="mt-5 grid gap-5 lg:grid-cols-3">
              <Card
                icon={CloudUpload}
                title={t("file_upload_settings")}
                subtitle={t("file_upload_sub")}
              >
                <div className="space-y-5">
                  <SelectField
                    id="maxsize"
                    label={t("max_file_size")}
                    value={settings.maxFileSize}
                    onChange={(val) => updateSetting("maxFileSize", val)}
                    options={[
                      ["10", "10 MB (Small Captures)"],
                      ["50", "50 MB (Standard Enterprise)"],
                      ["100", "100 MB (Large Gateway)"],
                      ["250", "250 MB (High Volume)"],
                      ["500", "500 MB (Full Datacenter Dump)"],
                    ]}
                    hint={`${t("max_file_size_hint")} (Current: ${settings.maxFileSize} MB)`}
                  />

                  <fieldset>
                    <legend className="mb-2 text-sm font-medium text-slate-100">
                      {t("supported_formats")}
                    </legend>
                    <div className="flex flex-wrap gap-x-5 gap-y-2">
                      {["pcap", "pcapng", "cap"].map((f) => (
                        <label
                          key={f}
                          className="flex cursor-pointer items-center gap-2 text-sm text-slate-200"
                        >
                          <input
                            type="checkbox"
                            checked={settings.formats[f]}
                            onChange={() => toggleFormat(f)}
                            className="h-4 w-4 accent-blue-600"
                          />
                          .{f}
                        </label>
                      ))}
                    </div>
                  </fieldset>
                </div>
              </Card>

              <Card
                icon={BrainCircuit}
                title={t("ai_analysis_settings")}
                subtitle={t("ai_analysis_sub")}
              >
                <div className="space-y-4">
                  <SelectField
                    id="aimodel"
                    label={t("ai_model")}
                    icon={Cpu}
                    value={settings.aiModel || "gemini-1.5-flash"}
                    onChange={(val) => updateSetting("aiModel", val)}
                    options={[
                      ["gemini-1.5-flash", "Gemini 1.5 Flash (Fast & Recommended)"],
                      ["gemini-1.5-pro", "Gemini 1.5 Pro (Deep Cryptographic Audit)"],
                      ["offline-expert", "Offline Expert Rules Engine (Zero Cloud)"],
                    ]}
                  />

                  <SelectField
                    id="mode"
                    label={t("analysis_mode")}
                    value={settings.analysisMode}
                    onChange={(val) => updateSetting("analysisMode", val)}
                    options={[
                      ["fast", "Fast (High-level Header Scan)"],
                      ["balanced", "Balanced (Standard Compliance Audit)"],
                      ["deep", "Deep (Full Byte Entropy & ESN Rollback Check)"],
                    ]}
                    hint={t("analysis_mode_hint")}
                  />

                  <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-3">
                    <ToggleRow
                      icon={Sparkles}
                      title={t("ai_thinking")}
                      desc={t("ai_thinking_desc")}
                      checked={settings.aiThinking}
                      onChange={(val) => updateSetting("aiThinking", val)}
                    />
                  </div>

                  <div>
                    <ToggleRow
                      icon={AlertTriangle}
                      title={t("detect_anomalies")}
                      checked={settings.detectAnomalies}
                      onChange={(val) => updateSetting("detectAnomalies", val)}
                    />
                    <ToggleRow
                      icon={Layers}
                      title={t("classify_traffic")}
                      checked={settings.classifyTraffic}
                      onChange={(val) => updateSetting("classifyTraffic", val)}
                    />
                    <ToggleRow
                      icon={Lightbulb}
                      title={t("generate_insights")}
                      checked={settings.generateInsights}
                      onChange={(val) => updateSetting("generateInsights", val)}
                    />
                  </div>
                </div>
              </Card>

              <Card
                icon={Cloud}
                title={t("backend_api_settings")}
                subtitle={t("backend_api_sub")}
              >
                <div className="space-y-4">
                  <div>
                    <label htmlFor="api" className="mb-2 block text-sm font-medium text-slate-100">
                      {t("api_base_url")}
                    </label>
                    <div className="relative">
                      <Link2
                        size={16}
                        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-300"
                      />
                      <input
                        id="api"
                        type="text"
                        value={settings.apiUrl}
                        onChange={(e) => updateSetting("apiUrl", e.target.value)}
                        placeholder="/api"
                        className={`${inputClass} pl-10 pr-3`}
                      />
                    </div>
                    <p className="mt-1.5 text-xs text-slate-400">
                      Default is relative <code className="text-blue-300">/api</code> (Single-link deployment)
                    </p>
                  </div>

                  <SelectField
                    id="timeout"
                    label={t("api_timeout")}
                    value={settings.apiTimeout}
                    onChange={(val) => updateSetting("apiTimeout", val)}
                    options={[
                      ["10", "10 seconds"],
                      ["30", "30 seconds (Default)"],
                      ["60", "60 seconds"],
                      ["120", "120 seconds (Large PCAPs)"],
                    ]}
                  />

                  <ToggleRow
                    title={t("enable_cors")}
                    desc={t("cors_desc")}
                    checked={settings.enableCors}
                    onChange={(val) => updateSetting("enableCors", val)}
                  />
                </div>
              </Card>
            </div>

            {/* ===== Row 3: Data Retention + Notifications + Save ===== */}
            <div className="mt-5 grid gap-5 lg:grid-cols-3">
              <Card
                icon={Database}
                title={t("data_report_settings")}
                subtitle={t("data_report_sub")}
              >
                <div className="space-y-5">
                  <SelectField
                    id="retention"
                    label={t("retention_period")}
                    icon={Calendar}
                    value={settings.retention}
                    onChange={(val) => updateSetting("retention", val)}
                    options={[
                      ["7", "7 days"],
                      ["30", "30 days (Default)"],
                      ["90", "90 days (Compliance)"],
                      ["365", "1 year (Long-term)"],
                      ["never", "Keep forever"],
                    ]}
                    hint={t("retention_hint")}
                  />
                  <SelectField
                    id="format"
                    label={t("report_format")}
                    icon={FileText}
                    value={settings.reportFormat}
                    onChange={(val) => updateSetting("reportFormat", val)}
                    options={[
                      ["html", "Interactive HTML (Printable)"],
                      ["pdf", "PDF Document"],
                      ["json", "Raw JSON Data"],
                    ]}
                    hint={t("report_format_hint")}
                  />
                </div>
              </Card>

              <Card
                icon={Bell}
                title={t("notification_settings")}
                subtitle={t("notification_sub")}
              >
                <ToggleRow
                  icon={CheckCircle2}
                  title={t("notify_complete")}
                  checked={settings.notifyComplete}
                  onChange={(val) => updateSetting("notifyComplete", val)}
                />
                <ToggleRow
                  icon={AlertTriangle}
                  title={t("notify_high_risk")}
                  checked={settings.notifyHighRisk}
                  onChange={(val) => updateSetting("notifyHighRisk", val)}
                />
                <ToggleRow
                  icon={Bell}
                  title={t("notify_system")}
                  checked={settings.notifySystem}
                  onChange={(val) => updateSetting("notifySystem", val)}
                />
                <ToggleRow
                  icon={Clock}
                  title={t("notify_daily")}
                  checked={settings.notifyDaily}
                  onChange={(val) => updateSetting("notifyDaily", val)}
                />
              </Card>

              <Card icon={Save} title={t("save_settings")} subtitle={t("save_sub")}>
                <div className="space-y-3">
                  <button
                    onClick={handleSave}
                    className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-sm font-semibold text-white shadow-lg shadow-blue-900/40 transition hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 cursor-pointer"
                  >
                    <Save size={18} /> {t("save_button")}
                  </button>
                  <button
                    onClick={handleReset}
                    className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-blue-500/40 text-sm text-slate-100 transition hover:bg-blue-500/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 cursor-pointer"
                  >
                    <RotateCcw size={16} /> {t("reset_button")}
                  </button>

                  {error && (
                    <p role="alert" className="text-sm text-red-300">
                      {error}
                    </p>
                  )}
                  {saved && (
                    <p role="status" className="flex items-center gap-1.5 text-sm text-emerald-300">
                      <Check size={16} /> {t("saved_msg")}
                    </p>
                  )}
                </div>
              </Card>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}