import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  FileCheck2,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowRight,
  RefreshCw,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  Flame,
} from "lucide-react";
import Sidebar from "./Sidebar";
import bg from "../assets/security.jpg";
import { getAnalysis } from "../api";

export default function Security() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterLevel, setFilterLevel] = useState("all"); // all | critical | high | medium | low
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    fetchActiveData();
  }, []);

  async function fetchActiveData() {
    setLoading(true);
    const activeId = localStorage.getItem("currentAnalysisId") || "latest";
    try {
      const res = await getAnalysis(activeId);
      setData(res);
      if (res?.security?.findings?.length > 0) {
        setExpandedId(res.security.findings[0].id);
      }
    } catch (err) {
      console.error("Failed to load security audit:", err);
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
              <div className="text-lg font-semibold text-slate-200">Evaluating Cryptographic & Compliance Rules...</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { security, filename, timestamp } = data;
  const findings = security?.findings || [];
  const passedChecks = security?.passed_checks || [];
  const compliance = security?.compliance || [];

  const filteredFindings =
    filterLevel === "all"
      ? findings
      : findings.filter((f) => f.level === filterLevel);

  const score = security?.score ?? 100;
  const scoreBadgeColor =
    score >= 80 ? "from-emerald-500 to-teal-600" :
    score >= 60 ? "from-amber-500 to-orange-600" :
    "from-red-600 to-rose-700";

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
          {/* Header */}
          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <span className="rounded-md border border-red-500/40 bg-red-500/15 px-2.5 py-0.5 text-xs font-semibold text-red-300">
                  SECURITY ASSESSMENT
                </span>
                <span className="text-xs text-slate-400">{timestamp}</span>
              </div>
              <h1 className="mt-1 text-2xl md:text-3xl font-bold tracking-tight">
                Vulnerability & Compliance Audit
              </h1>
              <p className="text-xs md:text-sm text-slate-300">
                Audited against NIST SP 800-77 Rev 1, RFC 8221, RFC 8247, and CIS IPsec v1.2
              </p>
            </div>

            <Link
              to="/reports"
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs md:text-sm font-semibold text-white hover:bg-blue-500 shadow-md shadow-blue-900/30 transition-all self-start sm:self-auto"
            >
              <FileCheck2 size={16} /> Generate Executive Report
            </Link>
          </div>

          {/* Top Security Score Banner */}
          <div className="mb-8 rounded-2xl border border-blue-500/20 bg-[#071335]/75 backdrop-blur-md p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <div
                  className={`flex h-20 w-20 shrink-0 flex-col items-center justify-center rounded-2xl bg-gradient-to-br ${scoreBadgeColor} text-white shadow-lg`}
                >
                  <span className="text-3xl font-extrabold leading-none">{score}</span>
                  <span className="text-[10px] uppercase font-bold tracking-wider mt-0.5">/ 100</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold">{security?.badge}</h2>
                    <span className="rounded bg-white/10 px-2 py-0.5 text-xs font-mono font-bold">
                      Grade: {security?.grade}
                    </span>
                  </div>
                  <p className="mt-1 max-w-xl text-xs sm:text-sm text-slate-300">
                    {score < 70
                      ? "The analyzed IPsec VPN contains critical cryptographic vulnerabilities or cleartext PSK exposures that fail zero-trust network mandates."
                      : "The VPN configuration demonstrates high cryptographic resilience with only minor hardening recommendations."}
                  </p>
                </div>
              </div>

              {/* Severity Pill Counts */}
              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="rounded-xl border border-red-500/30 bg-red-950/40 p-2.5 min-w-[70px]">
                  <div className="text-lg font-bold text-red-400">{security?.critical_count ?? 0}</div>
                  <div className="text-[10px] font-semibold uppercase text-red-300">Critical</div>
                </div>
                <div className="rounded-xl border border-orange-500/30 bg-orange-950/40 p-2.5 min-w-[70px]">
                  <div className="text-lg font-bold text-orange-400">{security?.high_count ?? 0}</div>
                  <div className="text-[10px] font-semibold uppercase text-orange-300">High</div>
                </div>
                <div className="rounded-xl border border-amber-500/30 bg-amber-950/40 p-2.5 min-w-[70px]">
                  <div className="text-lg font-bold text-amber-400">{security?.medium_count ?? 0}</div>
                  <div className="text-[10px] font-semibold uppercase text-amber-300">Medium</div>
                </div>
                <div className="rounded-xl border border-blue-500/30 bg-blue-950/40 p-2.5 min-w-[70px]">
                  <div className="text-lg font-bold text-blue-400">{security?.low_count ?? 0}</div>
                  <div className="text-[10px] font-semibold uppercase text-blue-300">Low</div>
                </div>
              </div>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs text-slate-400 mr-2">Filter Findings:</span>
              {[
                { id: "all", label: `All (${findings.length})` },
                { id: "critical", label: `Critical (${security?.critical_count ?? 0})` },
                { id: "high", label: `High (${security?.high_count ?? 0})` },
                { id: "medium", label: `Medium (${security?.medium_count ?? 0})` },
              ].map(({ id, label }) => (
                <button
                  key={id}
                  onClick={() => setFilterLevel(id)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                    filterLevel === id
                      ? "bg-blue-600 text-white"
                      : "bg-[#071335]/70 text-slate-300 hover:bg-white/10"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <span className="text-xs text-slate-400">Target: {filename}</span>
          </div>

          {/* Vulnerability Findings Accordion */}
          <div className="mb-8 space-y-3">
            {filteredFindings.length === 0 ? (
              <div className="rounded-2xl border border-emerald-500/30 bg-[#071335]/70 p-8 text-center">
                <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-400" />
                <h3 className="mt-3 text-lg font-bold text-white">No Vulnerabilities for this Filter!</h3>
                <p className="mt-1 text-xs text-slate-300">No security issues matching the selected severity level were identified.</p>
              </div>
            ) : (
              filteredFindings.map((f) => {
                const isExpanded = expandedId === f.id;
                const levelBadge =
                  f.level === "critical"
                    ? "bg-red-500/20 text-red-300 border-red-500/40"
                    : f.level === "high"
                    ? "bg-orange-500/20 text-orange-300 border-orange-500/40"
                    : "bg-amber-500/20 text-amber-300 border-amber-500/40";

                return (
                  <div
                    key={f.id}
                    className={`rounded-2xl border transition-all ${
                      isExpanded
                        ? "border-blue-500/50 bg-[#071335]/90 shadow-lg shadow-black/40"
                        : "border-blue-500/20 bg-[#071335]/60 hover:border-blue-500/40"
                    }`}
                  >
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : f.id)}
                      className="flex w-full items-center justify-between p-4 sm:p-5 text-left"
                    >
                      <div className="flex items-start gap-3.5">
                        <div className="mt-0.5">
                          {f.level === "critical" ? (
                            <Flame className="h-5 w-5 text-red-400" />
                          ) : (
                            <AlertTriangle className="h-5 w-5 text-orange-400" />
                          )}
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono text-xs text-slate-400">{f.id}</span>
                            <span className={`rounded border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${levelBadge}`}>
                              {f.level} (CVSS {f.cvss})
                            </span>
                            <span className="rounded bg-blue-500/10 px-2 py-0.5 text-[10px] font-mono text-blue-300">
                              {f.standard}
                            </span>
                          </div>
                          <h3 className="mt-1 text-sm sm:text-base font-bold text-white">{f.title}</h3>
                        </div>
                      </div>

                      <div className="ml-3 shrink-0 text-slate-400">
                        {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="border-t border-blue-500/20 px-5 pb-5 pt-4 text-xs sm:text-sm space-y-3">
                        <div>
                          <span className="font-semibold text-slate-300">Technical Description:</span>
                          <p className="mt-0.5 text-slate-300 leading-relaxed">{f.description}</p>
                        </div>

                        <div className="rounded-xl border border-red-500/20 bg-red-950/20 p-3">
                          <span className="font-semibold text-red-300">Exploit Impact:</span>
                          <p className="mt-0.5 text-red-200/90">{f.impact}</p>
                        </div>

                        <div className="rounded-xl border border-emerald-500/20 bg-emerald-950/20 p-3">
                          <span className="font-semibold text-emerald-300">Recommended Remediation:</span>
                          <p className="mt-0.5 text-emerald-200/90">{f.remediation}</p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Compliance Audit Matrix */}
          <div className="mb-8 rounded-2xl border border-blue-500/20 bg-[#071335]/70 backdrop-blur-md p-5 sm:p-6">
            <h2 className="text-base sm:text-lg font-bold text-white mb-1">
              Regulatory Framework Compliance Matrix
            </h2>
            <p className="text-xs text-slate-400 mb-4">
              Automated validation against federal and international networking benchmarks.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-blue-500/20 text-slate-400">
                    <th className="pb-3 font-semibold">Standard / Specification</th>
                    <th className="pb-3 font-semibold">Audit Status</th>
                    <th className="pb-3 font-semibold">Compliance Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-blue-500/10">
                  {compliance.map((c, idx) => (
                    <tr key={idx}>
                      <td className="py-3 font-bold text-white">{c.standard}</td>
                      <td className="py-3">
                        {c.status === "COMPLIANT" || c.status === "PASS" ? (
                          <span className="inline-flex items-center gap-1 rounded bg-emerald-500/20 px-2 py-0.5 text-xs font-semibold text-emerald-300 border border-emerald-500/40">
                            <CheckCircle2 size={13} /> {c.status}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded bg-red-500/20 px-2 py-0.5 text-xs font-semibold text-red-300 border border-red-500/40">
                            <XCircle size={13} /> {c.status}
                          </span>
                        )}
                      </td>
                      <td className="py-3 text-slate-300">{c.details}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Passed Checks Section */}
          {passedChecks.length > 0 && (
            <div className="rounded-2xl border border-blue-500/20 bg-[#071335]/70 backdrop-blur-md p-5 sm:p-6">
              <h2 className="text-base sm:text-lg font-bold text-white mb-3 flex items-center gap-2">
                <CheckCircle2 className="text-emerald-400" size={20} />
                Passed Cryptographic Audits ({passedChecks.length})
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {passedChecks.map((p, idx) => (
                  <div key={idx} className="rounded-xl border border-emerald-500/20 bg-emerald-950/15 p-3 text-xs">
                    <div className="font-semibold text-emerald-300">{p.check}</div>
                    <div className="mt-0.5 text-slate-300">{p.details}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}