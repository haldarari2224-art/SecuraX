import { useState } from "react";
import { Link } from "react-router-dom";
import {
  CloudUpload,
  FileText,
  Network,
  ShieldCheck,
  Lightbulb,
  Activity,
  Layers,
  Lock,
  AlertTriangle,
  BarChart3,
  ShieldAlert,
  BrainCircuit,
  ChevronDown,
  ChevronRight,
  ArrowRight,
  Play,
  Shield,
  KeyRound,
  Eye,
  Settings,
  MessageSquare,
  Send,
  Sparkles,
  RefreshCw,
  Cpu,
} from "lucide-react";
import Sidebar from "./Sidebar";
import { askAI } from "../api";
import { useSettings } from "../context/SettingsContext";

// Background image. Onno image chaile naam ta bodlao (src/assets e thaka lagbe).
import bg from "../assets/insights.webp";

const panel =
  "rounded-2xl border border-blue-500/20 bg-[#071335]/70 backdrop-blur-md";

/* ---------- Data (real project e backend theke ashbe) ---------- */
const STEPS = [
  { title: "PCAP Upload", text: "Upload your captured network traffic file.", icon: CloudUpload },
  { title: "Packet Parsing", text: "Analyze and decode raw packets.", icon: FileText },
  { title: "Protocol Detection", text: "Identify IPsec protocols and configurations.", icon: Network },
  { title: "Security Analysis", text: "Check cryptography, key exchange, and potential vulnerabilities.", icon: ShieldCheck },
  { title: "Insights", text: "Generate actionable security insights.", icon: Lightbulb },
];

const STATS = [
  {
    label: "Total Packets",
    value: "48,732",
    note: "Captured from PCAP",
    icon: Layers,
    accent: "border-l-blue-500",
    iconCls: "bg-blue-500/15 text-blue-300",
  },
  {
    label: "IPsec Packets",
    value: "12,846",
    note: "26.4% of total",
    pct: 26.4,
    icon: ShieldCheck,
    accent: "border-l-emerald-500",
    iconCls: "bg-emerald-500/15 text-emerald-300",
    bar: "bg-emerald-400",
  },
  {
    label: "Encrypted Traffic",
    value: "11,920",
    note: "24.5% of total",
    pct: 24.5,
    icon: Lock,
    accent: "border-l-purple-500",
    iconCls: "bg-purple-500/15 text-purple-300",
    bar: "bg-purple-400",
  },
  {
    label: "Suspicious Events",
    value: "7",
    note: "0.01% of total",
    pct: 0.01,
    icon: AlertTriangle,
    accent: "border-l-red-500",
    iconCls: "bg-red-500/15 text-red-300",
    bar: "bg-red-400",
  },
];

const TRAFFIC_LABELS = ["15:00", "15:05", "15:10", "15:15", "15:20"];
const INBOUND = [2.2, 2.8, 3.6, 3.0, 4.4, 5.8, 4.6, 3.9, 4.5, 5.2, 3.6, 4.9, 6.4, 4.3, 3.4, 4.6, 3.2];
const OUTBOUND = [1.4, 1.8, 2.2, 1.9, 2.4, 2.9, 2.4, 1.9, 2.6, 3.0, 2.2, 2.6, 3.2, 2.5, 1.9, 2.4, 2.7];

const PROTOCOLS = [
  { name: "IKE", pct: 32.1, count: "15,647", color: "#3b82f6", icon: Network, tile: "border-blue-500/40 bg-blue-500/10", text: "text-blue-400" },
  { name: "ESP", pct: 28.7, count: "13,980", color: "#a855f7", icon: Shield, tile: "border-purple-500/40 bg-purple-500/10", text: "text-purple-400" },
  { name: "AES", pct: 18.4, count: "8,967", color: "#06b6d4", icon: ShieldCheck, tile: "border-cyan-500/40 bg-cyan-500/10", text: "text-cyan-400" },
  { name: "DH", pct: 12.3, count: "5,987", color: "#f59e0b", icon: KeyRound, tile: "border-amber-500/40 bg-amber-500/10", text: "text-amber-400" },
  { name: "PFS", pct: 8.5, count: "4,151", color: "#ec4899", icon: Eye, tile: "border-pink-500/40 bg-pink-500/10", text: "text-pink-400" },
];

const LEVELS = {
  critical: { label: "CRITICAL", badge: "border-red-500/40 bg-red-500/15 text-red-300", icon: "bg-red-500/80" },
  high: { label: "HIGH", badge: "border-orange-500/40 bg-orange-500/15 text-orange-300", icon: "bg-orange-500/80" },
  medium: { label: "MEDIUM", badge: "border-amber-500/40 bg-amber-500/15 text-amber-300", icon: "bg-amber-500/80" },
  low: { label: "LOW", badge: "border-blue-500/40 bg-blue-500/15 text-blue-300", icon: "bg-blue-500/80" },
};

const TOTAL_EVENTS = 7;
const FINDINGS = [
  { level: "critical", title: "Weak DH Group Detected", text: "DH group 1 (768-bit) found in IKE negotiation.", time: "15:12" },
  { level: "high", title: "Rekeying Not Configured", text: "Long-lived SAs without rekeying policy.", time: "15:08" },
  { level: "high", title: "Deprecated Encryption", text: "AES-GCM not used, fallback to AES-CBC detected.", time: "15:06" },
  { level: "medium", title: "PFS Not Enforced", text: "Perfect Forward Secrecy not enabled in some SAs.", time: "15:03" },
  { level: "low", title: "Unusual Traffic Pattern", text: "Unexpected volume from 10.10.10.5.", time: "14:58" },
];

const PRIORITY = {
  High: "border-red-500/40 bg-red-500/15 text-red-300",
  Medium: "border-blue-500/40 bg-blue-500/15 text-blue-300",
};

const INSIGHTS = [
  { title: "Strengthen Key Exchange", text: "Use DH group 14 or higher and enable PFS for better forward secrecy.", priority: "High", icon: ShieldCheck },
  { title: "Enable Rekeying Policy", text: "Configure regular rekeying (e.g., 1 hour) to limit session exposure.", priority: "High", icon: Lock },
  { title: "Upgrade Encryption Suite", text: "Replace AES-CBC with AES-GCM for stronger security.", priority: "Medium", icon: Settings },
  { title: "Monitor Suspicious Traffic", text: "Investigate traffic from 10.10.10.5 and check for potential anomalies.", priority: "Medium", icon: Eye },
];

/* ---------- Charts ---------- */
function TrafficChart() {
  const W = 400, H = 210, L = 36, R = 10, T = 12, B = 28;
  const pw = W - L - R;
  const ph = H - T - B;
  const max = 8;
  const x = (i) => L + (i / (INBOUND.length - 1)) * pw;
  const y = (v) => T + ph - (v / max) * ph;

  const line = (data) =>
    data.reduce((d, v, i) => {
      if (i === 0) return `M ${x(0)} ${y(v)}`;
      const cx = (x(i - 1) + x(i)) / 2;
      return `${d} C ${cx} ${y(data[i - 1])}, ${cx} ${y(v)}, ${x(i)} ${y(v)}`;
    }, "");
  const area = (data) =>
    `${line(data)} L ${x(data.length - 1)} ${y(0)} L ${x(0)} ${y(0)} Z`;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="h-auto w-full"
      role="img"
      aria-label="Line chart of inbound and outbound packets over time"
    >
      <defs>
        <linearGradient id="inFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="outFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#a855f7" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
        </linearGradient>
      </defs>

      {[0, 2, 4, 6, 8].map((t) => (
        <g key={t}>
          <line x1={L} x2={W - R} y1={y(t)} y2={y(t)} stroke="rgba(148,163,184,0.15)" />
          <text x={L - 6} y={y(t) + 3} textAnchor="end" fontSize="9" fill="#94a3b8">
            {t === 0 ? "0" : `${t}K`}
          </text>
        </g>
      ))}

      {TRAFFIC_LABELS.map((l, i) => (
        <text
          key={l}
          x={L + (i / (TRAFFIC_LABELS.length - 1)) * pw}
          y={H - 8}
          textAnchor="middle"
          fontSize="9"
          fill="#94a3b8"
        >
          {l}
        </text>
      ))}

      <path d={area(INBOUND)} fill="url(#inFill)" />
      <path d={area(OUTBOUND)} fill="url(#outFill)" />
      <path d={line(INBOUND)} fill="none" stroke="#3b82f6" strokeWidth="2" />
      <path d={line(OUTBOUND)} fill="none" stroke="#a855f7" strokeWidth="2" />
    </svg>
  );
}

function Donut() {
  const r = 40;
  const c = 2 * Math.PI * r;
  let offset = 0;
  return (
    <svg
      viewBox="0 0 100 100"
      className="h-40 w-40 shrink-0"
      role="img"
      aria-label="Donut chart of protocol distribution"
    >
      <g transform="rotate(-90 50 50)">
        {PROTOCOLS.map((p) => {
          const len = (p.pct / 100) * c;
          const el = (
            <circle
              key={p.name}
              cx="50"
              cy="50"
              r={r}
              fill="none"
              stroke={p.color}
              strokeWidth="12"
              strokeDasharray={`${len - 0.8} ${c - len + 0.8}`}
              strokeDashoffset={-offset}
            />
          );
          offset += len;
          return el;
        })}
      </g>
      <text x="50" y="49" textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="700">
        48,732
      </text>
      <text x="50" y="59" textAnchor="middle" fill="#94a3b8" fontSize="5">
        Total Packets
      </text>
    </svg>
  );
}

function ProtocolBars() {
  const top = Math.max(...PROTOCOLS.map((p) => p.pct));
  return (
    <ul className="mt-4 w-full space-y-3">
      {PROTOCOLS.map((p) => (
        <li key={p.name}>
          <div className="flex justify-between text-xs text-slate-200">
            <span>{p.name}</span>
            <span>{p.pct}%</span>
          </div>
          <div className="mt-1 h-2 rounded-full bg-white/10">
            <div
              className="h-full rounded-full"
              style={{ width: `${(p.pct / top) * 100}%`, backgroundColor: p.color }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

/* ---------- Page ---------- */
export default function Insights() {
  const { settings, t } = useSettings();
  const [view, setView] = useState("donut");
  const [question, setQuestion] = useState("");
  const [answering, setAnswering] = useState(false);
  const [chatLog, setChatLog] = useState([
    {
      q: "What is the primary risk detected in this IPsec session?",
      a: "The most critical vulnerability is the presence of 3DES/MD5 and IKEv1 Aggressive Mode. Aggressive Mode sends the PSK authentication hash unencrypted in the second packet, allowing adversaries to crack the pre-shared key offline using GPU clusters.",
    },
  ]);

  async function handleSendQuestion(qText) {
    const prompt = qText || question;
    if (!prompt.trim() || answering) return;
    setAnswering(true);
    setQuestion("");
    const activeId = localStorage.getItem("currentAnalysisId") || "latest";
    try {
      const res = await askAI(prompt, activeId);
      setChatLog((prev) => [...prev, { q: prompt, a: res.answer }]);
    } catch (err) {
      setChatLog((prev) => [
        ...prev,
        { q: prompt, a: "Error contacting AI assistant: " + err.message },
      ]);
    } finally {
      setAnswering(false);
    }
  }

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-fixed text-slate-200"
      style={{
        backgroundImage: `linear-gradient(rgba(4,10,32,0.88), rgba(4,10,32,0.88)), url(${bg})`,
      }}
    >
      <div className="flex min-h-screen">
        <Sidebar />

        <main className="min-w-0 flex-1 space-y-5 p-4 sm:p-6 lg:p-8">
          {/* ===== Heading ===== */}
          <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white sm:text-4xl">
                From Raw{" "}
                <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Packets to Valuable Insights
                </span>
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-cyan-100/80 sm:text-base">
                Our AI-powered engine transforms captured network traffic into meaningful security
                insights, helping you understand, detect and secure your IPsec VPN environment.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="flex items-center gap-1.5 rounded-full border border-blue-500/40 bg-blue-500/10 px-3 py-1.5 text-xs font-semibold text-blue-300">
                <Cpu size={14} /> Model: {settings?.aiModel === "gemini-1.5-pro" ? "Gemini 1.5 Pro" : settings?.aiModel === "offline-expert" ? "Offline Rules Engine" : "Gemini 1.5 Flash"}
              </span>
              {settings?.aiThinking && (
                <span className="flex items-center gap-1.5 rounded-full border border-purple-500/40 bg-purple-500/15 px-3 py-1.5 text-xs font-semibold text-purple-300">
                  <Sparkles size={14} className="animate-pulse" /> Deep Thinking: Active
                </span>
              )}
              <span className="flex items-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-500/15 px-3 py-1.5 text-xs font-semibold text-emerald-300">
                <ShieldCheck size={14} /> Mode: {(settings?.analysisMode || "balanced").toUpperCase()}
              </span>
            </div>
          </header>

          {/* ===== Pipeline steps ===== */}
          <section className={`${panel} p-6`}>
            <ol className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-0">
              {STEPS.map(({ title, text, icon: Icon }, i) => (
                <li key={title} className="contents">
                  <div className="flex flex-col items-center text-center lg:w-48 lg:shrink-0">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-blue-500 bg-blue-500/15 text-blue-300 shadow-[0_0_18px_rgba(59,130,246,0.35)]">
                      <Icon size={28} />
                    </div>
                    <h3 className="mt-3 font-semibold text-white">{title}</h3>
                    <p className="mt-1 max-w-[12rem] text-sm text-slate-400">{text}</p>
                    <span className="mt-3 flex h-6 w-6 items-center justify-center rounded-full border border-blue-400 bg-blue-500/20 text-xs font-semibold text-blue-200">
                      {i + 1}
                    </span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div
                      className="mt-8 hidden flex-1 items-center text-blue-400 lg:flex"
                      aria-hidden="true"
                    >
                      <div className="h-px flex-1 bg-blue-500/40" />
                      <ChevronRight size={16} />
                      <div className="h-px flex-1 bg-blue-500/40" />
                    </div>
                  )}
                </li>
              ))}
            </ol>
          </section>

          {/* ===== Stat cards ===== */}
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {STATS.map((s) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.label}
                  className={`${panel} flex items-center gap-4 border-l-4 p-5 ${s.accent}`}
                >
                  <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full ${s.iconCls}`}>
                    <Icon size={26} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm text-slate-300">{s.label}</div>
                    <div className="text-3xl font-bold text-white">{s.value}</div>
                    {s.pct !== undefined ? (
                      <div className="mt-1 flex items-center gap-3">
                        <div className="h-1.5 w-20 rounded-full bg-white/10">
                          <div
                            className={`h-full rounded-full ${s.bar}`}
                            style={{ width: `${Math.max(s.pct, 3)}%` }}
                          />
                        </div>
                        <span className="text-xs text-slate-400">{s.note}</span>
                      </div>
                    ) : (
                      <div className="mt-1 flex items-center gap-2 text-xs text-slate-400">
                        <Activity size={16} className="text-blue-400" />
                        {s.note}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </section>

          {/* ===== Analysis row ===== */}
          <div className="grid gap-5 lg:grid-cols-[1.7fr_1fr_0.9fr]">
            {/* Traffic & Protocol Analysis */}
            <section className={`${panel} p-5`}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="flex items-center gap-2 text-lg font-bold text-white">
                  <BarChart3 size={22} className="text-blue-400" />
                  Traffic &amp; Protocol Analysis
                </h2>
                <div className="relative">
                  <select
                    aria-label="Chart view"
                    value={view}
                    onChange={(e) => setView(e.target.value)}
                    className="h-9 appearance-none rounded-lg border border-blue-500/30 bg-[#050d2b]/70 pl-3 pr-8 text-xs text-slate-100 outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60"
                  >
                    <option value="donut" className="bg-slate-900">Protocol Distribution</option>
                    <option value="bars" className="bg-slate-900">Protocol Comparison</option>
                  </select>
                  <ChevronDown
                    size={14}
                    className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-300"
                  />
                </div>
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div className="rounded-xl border border-blue-500/15 bg-[#050d2b]/50 p-4">
                  <h3 className="mb-2 text-sm font-semibold text-white">
                    Traffic Flow (Packets over Time)
                  </h3>
                  <TrafficChart />
                  <div className="mt-1 flex justify-center gap-5 text-xs text-slate-300">
                    <span className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-blue-500" /> Inbound
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-purple-500" /> Outbound
                    </span>
                  </div>
                </div>

                <div className="rounded-xl border border-blue-500/15 bg-[#050d2b]/50 p-4">
                  <h3 className="mb-2 text-sm font-semibold text-white">
                    {view === "donut" ? "Protocol Distribution" : "Protocol Comparison"}
                  </h3>
                  {view === "donut" ? (
                    <div className="flex flex-wrap items-center justify-center gap-4">
                      <Donut />
                      <ul className="space-y-2 text-sm">
                        {PROTOCOLS.map((p) => (
                          <li key={p.name} className="flex items-center gap-2">
                            <span
                              className="h-2.5 w-2.5 rounded-full"
                              style={{ backgroundColor: p.color }}
                            />
                            <span className="w-8 text-slate-200">{p.name}</span>
                            <span className="text-slate-400">{p.pct}%</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <ProtocolBars />
                  )}
                </div>
              </div>

              {/* Protocol breakdown */}
              <div className="mt-4 rounded-xl border border-blue-500/15 bg-[#050d2b]/50 p-4">
                <h3 className="mb-3 text-sm font-semibold text-white">Protocol Breakdown</h3>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
                  {PROTOCOLS.map((p) => {
                    const Icon = p.icon;
                    return (
                      <div key={p.name} className={`rounded-xl border p-3 ${p.tile}`}>
                        <Icon size={20} className={p.text} />
                        <div className="mt-2 text-xs font-semibold text-slate-200">{p.name}</div>
                        <div className="text-lg font-bold text-white">{p.count}</div>
                        <div className={`text-xs ${p.text}`}>{p.pct}%</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>

            {/* Security Findings */}
            <section className={`${panel} p-5`}>
              <div className="flex items-center justify-between gap-2">
                <h2 className="flex items-center gap-2 text-lg font-bold text-white">
                  <ShieldAlert size={22} className="text-blue-400" />
                  Security Findings
                </h2>
                <span className="rounded-md border border-blue-500/30 bg-blue-500/10 px-2 py-1 text-xs text-slate-200">
                  {TOTAL_EVENTS} Events
                </span>
              </div>

              <ul className="mt-4 space-y-3">
                {FINDINGS.map((f) => {
                  const lv = LEVELS[f.level];
                  return (
                    <li key={f.title} className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span
                            className={`flex h-5 w-5 items-center justify-center rounded-full text-white ${lv.icon}`}
                          >
                            <AlertTriangle size={11} />
                          </span>
                          <span className={`rounded border px-1.5 py-0.5 text-[10px] font-bold ${lv.badge}`}>
                            {lv.label}
                          </span>
                        </div>
                        <span className="text-xs text-slate-400">{f.time}</span>
                      </div>
                      <div className="mt-2 text-sm font-semibold text-white">{f.title}</div>
                      <div className="mt-0.5 text-xs text-slate-400">{f.text}</div>
                    </li>
                  );
                })}
              </ul>

              <Link
                to="/security"
                className="mt-4 inline-flex items-center gap-1.5 text-sm text-blue-400 hover:text-blue-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
              >
                View All Findings <ArrowRight size={16} />
              </Link>
            </section>

            {/* AI Insights */}
            <section className={`${panel} p-5`}>
              <div className="flex items-center justify-between gap-2">
                <h2 className="flex items-center gap-2 text-lg font-bold text-white">
                  <BrainCircuit size={22} className="text-blue-400" />
                  AI Insights
                </h2>
                <span className="rounded-md border border-blue-500/30 bg-blue-500/10 px-2 py-1 text-xs text-blue-200">
                  Powered by AI
                </span>
              </div>

              <ul className="mt-4 space-y-3">
                {INSIGHTS.map(({ title, text, priority, icon: Icon }) => (
                  <li
                    key={title}
                    className="flex gap-3 rounded-lg border border-white/10 bg-white/[0.03] p-3"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-500/15 text-blue-300">
                      <Icon size={20} />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-white">{title}</div>
                      <div className="mt-0.5 text-xs text-slate-400">{text}</div>
                      <span
                        className={`mt-2 inline-block rounded border px-2 py-0.5 text-[11px] ${PRIORITY[priority]}`}
                      >
                        {priority} Priority
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          {/* ===== SecuraX Interactive AI Security Advisor ===== */}
          <section className={`${panel} p-6`}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-blue-500/20 pb-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600/30 text-blue-300 border border-blue-500/40">
                  <BrainCircuit size={22} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    SecuraX Interactive AI Security Advisor
                    <Sparkles size={16} className="text-amber-400" />
                  </h2>
                  <p className="text-xs text-slate-300">
                    Ask questions about detected vulnerabilities, cryptographic weaknesses, or remediation steps.
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Prompt Chips */}
            <div className="mb-4 flex flex-wrap gap-2 text-xs">
              <span className="text-slate-400 self-center">Suggestions:</span>
              {[
                "Why is IKEv1 Aggressive mode dangerous?",
                "Explain Sweet32 vulnerability on 3DES",
                "What Diffie-Hellman group should we use?",
                "How do we enable Perfect Forward Secrecy (PFS)?",
              ].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => handleSendQuestion(s)}
                  className="rounded-lg border border-blue-500/30 bg-blue-950/40 px-2.5 py-1 text-blue-200 hover:bg-blue-900/50 transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>

            {/* Chat History */}
            <div className="space-y-3 max-h-[360px] overflow-y-auto pr-2 mb-4">
              {chatLog.map((c, idx) => (
                <div key={idx} className="space-y-2 text-xs sm:text-sm">
                  {/* User question */}
                  <div className="flex justify-end">
                    <div className="max-w-[85%] rounded-xl bg-blue-600 px-4 py-2.5 text-white font-medium shadow-md shadow-blue-900/30">
                      {c.q}
                    </div>
                  </div>
                  {/* AI Response */}
                  <div className="flex justify-start">
                    <div className="max-w-[90%] rounded-xl border border-blue-500/20 bg-blue-950/50 p-4 text-slate-200 whitespace-pre-line leading-relaxed">
                      {c.a}
                    </div>
                  </div>
                </div>
              ))}
              {answering && (
                <div className="flex items-center gap-2 text-xs text-blue-300 py-2">
                  <RefreshCw className="h-4 w-4 animate-spin text-blue-400" />
                  SecuraX AI is analyzing cryptographic specifications...
                </div>
              )}
            </div>

            {/* Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendQuestion();
              }}
              className="flex gap-2"
            >
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ask about this IPsec tunnel (e.g. 'How do I fix weak DH group in Cisco?')..."
                className="flex-1 rounded-xl border border-blue-500/30 bg-[#03081a] px-4 py-2.5 text-xs sm:text-sm text-slate-100 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
              />
              <button
                type="submit"
                disabled={answering || !question.trim()}
                className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-50 transition-all shadow-md shadow-blue-900/30"
              >
                <Send size={16} /> Send
              </button>
            </form>
          </section>

          {/* ===== Bottom call to action ===== */}
          <section
            className={`${panel} flex flex-wrap items-center justify-between gap-4 p-5`}
          >
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-blue-500/40 bg-blue-500/15 text-blue-300">
                <FileText size={22} />
              </div>
              <div>
                <h3 className="font-semibold text-white">Ready for a deeper look?</h3>
                <p className="text-sm text-slate-400">
                  View the complete analysis report with detailed technical information,
                  visualizations and recommendations.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                to="/reports"
                className="flex h-11 items-center gap-2 rounded-lg border border-white/25 px-5 text-sm font-semibold text-white transition hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
              >
                <FileText size={16} /> View Detailed Report
              </Link>
              <Link
                to="/upload"
                className="flex h-11 items-center gap-2 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-500 px-5 text-sm font-semibold text-white shadow-lg shadow-blue-900/30 transition hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
              >
                <Play size={16} /> Run New Analysis
              </Link>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}