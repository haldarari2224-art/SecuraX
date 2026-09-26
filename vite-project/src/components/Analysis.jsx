import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  BarChart3,
  Layers,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Lock,
  Network,
  Activity,
  KeyRound,
  Eye,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  FileText,
  Sliders,
} from "lucide-react";
import Sidebar from "./Sidebar";
import bg from "../assets/analysis.avif";
import { getAnalysis, loadSample } from "../api";

export default function Analysis() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("proposals"); // proposals | ike | esp | timeline

  useEffect(() => {
    fetchActiveData();
  }, []);

  async function fetchActiveData() {
    setLoading(true);
    const activeId = localStorage.getItem("currentAnalysisId") || "latest";
    try {
      const res = await getAnalysis(activeId);
      setData(res);
    } catch (err) {
      console.error("Failed to load analysis:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSwitchScenario(key) {
    setLoading(true);
    try {
      const res = await loadSample(key);
      localStorage.setItem("currentAnalysisId", res.id);
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  if (loading || !data) {
    return (
      <div
        className="min-h-screen bg-cover bg-center bg-fixed text-white"
        style={{
          backgroundImage: `linear-gradient(rgba(4,10,32,0.85), rgba(4,10,32,0.85)), url(${bg})`,
        }}
      >
        <div className="flex min-h-screen">
          <Sidebar />
          <div className="flex flex-1 items-center justify-center p-8">
            <div className="flex flex-col items-center gap-4">
              <RefreshCw className="h-10 w-10 animate-spin text-blue-400" />
              <div className="text-lg font-semibold text-slate-200">Decoding IPsec Protocol Telemetry...</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { summary, protocols, proposals, ike_sessions, esp_tunnels, timeline, security } = data;

  const scoreColor =
    security?.score >= 80 ? "text-emerald-400 border-emerald-500/40 bg-emerald-500/10" :
    security?.score >= 60 ? "text-amber-400 border-amber-500/40 bg-amber-500/10" :
    "text-red-400 border-red-500/40 bg-red-500/10";

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-fixed text-white"
      style={{
        backgroundImage: `linear-gradient(rgba(4,10,32,0.88), rgba(4,10,32,0.88)), url(${bg})`,
      }}
    >
      <div className="flex min-h-screen">
        <Sidebar />

        <main className="flex-1 min-w-0 p-5 md:p-8">
          {/* Top Bar / Header */}
          <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <span className="rounded-md border border-blue-400/40 bg-blue-500/15 px-2.5 py-0.5 text-xs font-semibold text-blue-300">
                  DEEP PACKET INSPECTION
                </span>
                <span className="text-xs text-slate-400">Captured: {data.timestamp}</span>
              </div>
              <h1 className="mt-1 text-2xl md:text-3xl font-bold tracking-tight">
                Protocol & Traffic Analysis
              </h1>
              <p className="text-xs md:text-sm text-slate-300">
                Target: <span className="font-mono text-blue-300">{data.filename}</span>
              </p>
            </div>

            {/* Quick Switch / Action Buttons */}
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={() => handleSwitchScenario("vulnerable_legacy")}
                className="rounded-lg border border-red-500/30 bg-red-950/30 px-3 py-1.5 text-xs font-medium text-red-200 hover:bg-red-900/40"
              >
                Sample: Vulnerable
              </button>
              <button
                onClick={() => handleSwitchScenario("modern_compliant")}
                className="rounded-lg border border-emerald-500/30 bg-emerald-950/30 px-3 py-1.5 text-xs font-medium text-emerald-200 hover:bg-emerald-900/40"
              >
                Sample: Modern
              </button>
              <Link
                to="/security"
                className={`flex items-center gap-2 rounded-lg border px-3.5 py-1.5 text-xs font-bold ${scoreColor}`}
              >
                <Shield size={16} />
                Score: {security?.score ?? 100}/100 ({security?.grade ?? "A"})
              </Link>
            </div>
          </div>

          {/* Key KPI Stats Grid */}
          <div className="mb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-xl border border-blue-500/20 bg-[#071335]/75 backdrop-blur-md p-4 border-l-4 border-l-blue-500">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-400">Total Packets</span>
                <Layers className="h-4 w-4 text-blue-400" />
              </div>
              <div className="mt-2 text-2xl font-bold">{summary?.total_packets?.toLocaleString() ?? 0}</div>
              <div className="mt-1 text-xs text-slate-400">
                IPsec: <span className="font-semibold text-blue-300">{summary?.ipsec_packets?.toLocaleString() ?? 0}</span> ({summary?.ipsec_percentage}%)
              </div>
            </div>

            <div className="rounded-xl border border-blue-500/20 bg-[#071335]/75 backdrop-blur-md p-4 border-l-4 border-l-purple-500">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-400">Encrypted Traffic</span>
                <Lock className="h-4 w-4 text-purple-400" />
              </div>
              <div className="mt-2 text-2xl font-bold">{summary?.encrypted_packets?.toLocaleString() ?? 0}</div>
              <div className="mt-1 text-xs text-slate-400">
                Coverage: <span className="font-semibold text-purple-300">{summary?.encrypted_percentage}%</span> of captured
              </div>
            </div>

            <div className="rounded-xl border border-blue-500/20 bg-[#071335]/75 backdrop-blur-md p-4 border-l-4 border-l-cyan-500">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-400">Payload Entropy</span>
                <Activity className="h-4 w-4 text-cyan-400" />
              </div>
              <div className="mt-2 text-2xl font-bold">{summary?.avg_entropy ?? 7.8} <span className="text-sm font-normal text-slate-400">/ 8.0</span></div>
              <div className="mt-1 text-xs text-slate-400">
                Status: <span className="font-semibold text-cyan-300">{summary?.avg_entropy > 7.5 ? "True Ciphertext" : "Low Entropy Warning"}</span>
              </div>
            </div>

            <div className="rounded-xl border border-blue-500/20 bg-[#071335]/75 backdrop-blur-md p-4 border-l-4 border-l-emerald-500">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-400">Security Posture</span>
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
              </div>
              <div className="mt-2 text-2xl font-bold">{security?.grade ?? "A"} <span className="text-xs font-normal text-slate-400">({security?.badge})</span></div>
              <div className="mt-1 text-xs text-slate-400">
                Critical Findings: <span className={`font-semibold ${security?.critical_count > 0 ? "text-red-400" : "text-emerald-400"}`}>{security?.critical_count ?? 0}</span>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="mb-6 flex border-b border-blue-500/20 gap-2">
            {[
              { id: "proposals", label: "Cryptographic Proposals", icon: KeyRound },
              { id: "ike", label: "IKE Handshake & Exchanges", icon: Network },
              { id: "esp", label: "ESP Tunnels & Anti-Replay", icon: Shield },
              { id: "timeline", label: "Traffic Throughput Timeline", icon: BarChart3 },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-medium transition-colors border-b-2 -mb-px ${
                  activeTab === id
                    ? "border-blue-500 text-blue-400 bg-blue-500/10 rounded-t-lg"
                    : "border-transparent text-slate-400 hover:text-slate-200"
                }`}
              >
                <Icon size={16} />
                {label}
              </button>
            ))}
          </div>

          {/* Tab Content 1: Proposals */}
          {activeTab === "proposals" && (
            <div className="rounded-2xl border border-blue-500/20 bg-[#071335]/70 backdrop-blur-md p-5">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-100">Dissected Security Association (SA) Transforms</h3>
                  <p className="text-xs text-slate-400">Negotiated encryption ciphers, integrity hashes, Diffie-Hellman groups, and forward secrecy.</p>
                </div>
                <span className="rounded-md border border-blue-500/30 bg-blue-500/10 px-2.5 py-1 text-xs text-blue-300">
                  {proposals?.length ?? 0} Proposals Found
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-blue-500/20 text-slate-400">
                      <th className="pb-3 font-semibold">Transform Type</th>
                      <th className="pb-3 font-semibold">Negotiated Value</th>
                      <th className="pb-3 font-semibold">Key Length</th>
                      <th className="pb-3 font-semibold">Security Assessment</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-blue-500/10">
                    {proposals?.map((p, idx) => (
                      <>
                        <tr key={`${idx}-enc`}>
                          <td className="py-3 font-medium text-slate-300">Encryption Cipher</td>
                          <td className="py-3 font-mono font-bold text-white">{p.encryption}</td>
                          <td className="py-3 text-slate-300">{p.key_length} bits</td>
                          <td className="py-3">
                            {p.encryption.includes("3DES") || p.encryption.includes("DES") ? (
                              <span className="inline-flex items-center gap-1 rounded bg-red-500/20 px-2 py-0.5 text-xs font-semibold text-red-300 border border-red-500/40">
                                <AlertTriangle size={12} /> Vulnerable (Sweet32 / 64-bit)
                              </span>
                            ) : p.encryption.includes("GCM") ? (
                              <span className="inline-flex items-center gap-1 rounded bg-emerald-500/20 px-2 py-0.5 text-xs font-semibold text-emerald-300 border border-emerald-500/40">
                                <ShieldCheck size={12} /> High Strength (AEAD)
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded bg-blue-500/20 px-2 py-0.5 text-xs font-semibold text-blue-300 border border-blue-500/40">
                                Standard (CBC Mode)
                              </span>
                            )}
                          </td>
                        </tr>

                        <tr key={`${idx}-hash`}>
                          <td className="py-3 font-medium text-slate-300">Integrity / Hash</td>
                          <td className="py-3 font-mono font-bold text-white">{p.integrity}</td>
                          <td className="py-3 text-slate-300">{p.integrity.includes("512") ? "512" : p.integrity.includes("384") ? "384" : p.integrity.includes("256") ? "256" : "128/160"} bits</td>
                          <td className="py-3">
                            {p.integrity.includes("MD5") ? (
                              <span className="inline-flex items-center gap-1 rounded bg-red-500/20 px-2 py-0.5 text-xs font-semibold text-red-300 border border-red-500/40">
                                <AlertTriangle size={12} /> Broken (Collision Insecure)
                              </span>
                            ) : p.integrity.includes("SHA-1") ? (
                              <span className="inline-flex items-center gap-1 rounded bg-amber-500/20 px-2 py-0.5 text-xs font-semibold text-amber-300 border border-amber-500/40">
                                <AlertTriangle size={12} /> Deprecated (SHAttered)
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded bg-emerald-500/20 px-2 py-0.5 text-xs font-semibold text-emerald-300 border border-emerald-500/40">
                                <ShieldCheck size={12} /> Secure (SHA-2 / MAC)
                              </span>
                            )}
                          </td>
                        </tr>

                        <tr key={`${idx}-dh`}>
                          <td className="py-3 font-medium text-slate-300">Diffie-Hellman Group</td>
                          <td className="py-3 font-mono font-bold text-white">{p.dh_group}</td>
                          <td className="py-3 text-slate-300">{p.dh_group.includes("768") ? "768-bit" : p.dh_group.includes("1024") ? "1024-bit" : p.dh_group.includes("2048") ? "2048-bit" : "ECP 256+"}</td>
                          <td className="py-3">
                            {p.dh_group.includes("Group 1") || p.dh_group.includes("Group 2") ? (
                              <span className="inline-flex items-center gap-1 rounded bg-red-500/20 px-2 py-0.5 text-xs font-semibold text-red-300 border border-red-500/40">
                                <AlertTriangle size={12} /> Vulnerable to Logjam (&lt; 2048-bit)
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded bg-emerald-500/20 px-2 py-0.5 text-xs font-semibold text-emerald-300 border border-emerald-500/40">
                                <ShieldCheck size={12} /> Robust Modulus
                              </span>
                            )}
                          </td>
                        </tr>

                        <tr key={`${idx}-pfs`}>
                          <td className="py-3 font-medium text-slate-300">Perfect Forward Secrecy (PFS)</td>
                          <td className="py-3 font-mono font-bold text-white">{p.pfs ? "Enabled" : "Disabled"}</td>
                          <td className="py-3 text-slate-300">-</td>
                          <td className="py-3">
                            {!p.pfs ? (
                              <span className="inline-flex items-center gap-1 rounded bg-amber-500/20 px-2 py-0.5 text-xs font-semibold text-amber-300 border border-amber-500/40">
                                <AlertTriangle size={12} /> Missing Forward Secrecy
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded bg-emerald-500/20 px-2 py-0.5 text-xs font-semibold text-emerald-300 border border-emerald-500/40">
                                <ShieldCheck size={12} /> Active (Session Independent)
                              </span>
                            )}
                          </td>
                        </tr>
                      </>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab Content 2: IKE Exchanges */}
          {activeTab === "ike" && (
            <div className="rounded-2xl border border-blue-500/20 bg-[#071335]/70 backdrop-blur-md p-5">
              <div className="mb-4">
                <h3 className="text-base font-bold text-slate-100">IKE Exchange Handshake Sequence</h3>
                <p className="text-xs text-slate-400">Captured Phase 1 (Main/Aggressive Mode) and Phase 2 (Quick Mode / Child SA) negotiations.</p>
              </div>

              <div className="space-y-3">
                {ike_sessions?.map((s, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-blue-500/20 bg-blue-950/30 p-4"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-600/20 text-blue-300 border border-blue-500/30">
                        <Network size={20} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-white">{s.exchange_type}</span>
                          <span className="rounded bg-blue-500/20 px-2 py-0.5 text-[11px] font-mono text-blue-300">
                            {s.version}
                          </span>
                          {s.exchange_type.includes("Aggressive") && (
                            <span className="rounded bg-red-500/20 px-2 py-0.5 text-[11px] font-bold text-red-300 border border-red-500/40">
                              CLEAR-HASH LEAK RISK
                            </span>
                          )}
                        </div>
                        <div className="mt-1 font-mono text-xs text-slate-300">
                          {s.src} &rarr; {s.dst}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-slate-300">
                      <div>
                        <span className="text-slate-500">Init SPI:</span> {s.initiator_spi}
                      </div>
                      <div>
                        <span className="text-slate-500">Msg ID:</span> {s.msg_id}
                      </div>
                      <div>
                        <span className="text-slate-500">Flags:</span> {s.flags}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab Content 3: ESP Tunnels */}
          {activeTab === "esp" && (
            <div className="rounded-2xl border border-blue-500/20 bg-[#071335]/70 backdrop-blur-md p-5">
              <div className="mb-4">
                <h3 className="text-base font-bold text-slate-100">ESP Active Encapsulation Tunnels</h3>
                <p className="text-xs text-slate-400">Security Parameter Index (SPI), sequence counter monotonic checks, and replay detection.</p>
              </div>

              <div className="space-y-4">
                {esp_tunnels?.map((t, idx) => (
                  <div key={idx} className="rounded-xl border border-blue-500/20 bg-blue-950/20 p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-blue-500/15 pb-3">
                      <div className="font-mono font-semibold text-blue-300 text-sm">
                        Tunnel: {t.tunnel}
                      </div>
                      <div className="flex items-center gap-2">
                        {t.replay_violations > 0 ? (
                          <span className="rounded bg-red-500/20 px-2 py-0.5 text-xs font-semibold text-red-300 border border-red-500/40">
                            {t.replay_violations} Replay Violations
                          </span>
                        ) : (
                          <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-xs font-semibold text-emerald-300 border border-emerald-500/40">
                            Anti-Replay Passed
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div>
                        <span className="text-slate-400">Total Packets:</span>
                        <div className="font-mono text-sm font-bold text-white">{t.packets?.toLocaleString()}</div>
                      </div>
                      <div>
                        <span className="text-slate-400">Traffic Volume:</span>
                        <div className="font-mono text-sm font-bold text-white">{(t.bytes / (1024 * 1024)).toFixed(2)} MB</div>
                      </div>
                      <div className="col-span-2">
                        <span className="text-slate-400">Active SPIs:</span>
                        <div className="font-mono text-xs text-slate-200 mt-0.5">
                          {t.spis?.join(", ") || "0x3a4b5c6d"}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab Content 4: Timeline */}
          {activeTab === "timeline" && (
            <div className="rounded-2xl border border-blue-500/20 bg-[#071335]/70 backdrop-blur-md p-5">
              <div className="mb-4">
                <h3 className="text-base font-bold text-slate-100">Traffic Throughput & Packet Rate</h3>
                <p className="text-xs text-slate-400">Aggregated inbound vs outbound bandwidth over time.</p>
              </div>

              <div className="space-y-3">
                {timeline?.map((pt, idx) => (
                  <div key={idx} className="flex items-center gap-3 text-xs">
                    <span className="w-14 font-mono text-slate-400">{pt.time}</span>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between text-[11px] text-blue-300">
                        <span>Inbound: {pt.inbound_kb} KB/s</span>
                        <div className="h-1.5 w-3/4 rounded-full bg-slate-800 overflow-hidden">
                          <div
                            className="h-full bg-blue-500 rounded-full"
                            style={{ width: `${Math.min(100, pt.inbound_kb * 15)}%` }}
                          />
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-purple-300">
                        <span>Outbound: {pt.outbound_kb} KB/s</span>
                        <div className="h-1.5 w-3/4 rounded-full bg-slate-800 overflow-hidden">
                          <div
                            className="h-full bg-purple-500 rounded-full"
                            style={{ width: `${Math.min(100, pt.outbound_kb * 15)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bottom Callout to Security Assessment */}
          <div className="mt-8 rounded-2xl border border-blue-500/30 bg-gradient-to-r from-blue-900/40 via-purple-900/30 to-blue-950/40 p-6 backdrop-blur-md flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-white">Next Step: Security Assessment & Compliance</h3>
              <p className="text-xs md:text-sm text-slate-300 max-w-xl mt-1">
                View cryptographic CVE vulnerability checks (Sweet32, Logjam, cleartext PSK hashes), NIST SP 800-77 Rev 1 compliance audit, and AI remediation guidance.
              </p>
            </div>
            <Link
              to="/security"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-500 shadow-lg shadow-blue-900/40 transition-all shrink-0"
            >
              Security Findings ({security?.total_findings ?? 0})
              <ArrowRight size={18} />
            </Link>
          </div>
        </main>
      </div>
    </div>
  );
}