import { useState, useEffect } from "react";
import {
  FileText,
  Download,
  Printer,
  Copy,
  Check,
  Shield,
  FileCode,
  Terminal,
  Server,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import Sidebar from "./Sidebar";
import bg from "../assets/reports.jpeg";
import { getAnalysis, getHtmlReportUrl } from "../api";

export default function Reports() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [configTab, setConfigTab] = useState("strongswan"); // strongswan | cisco_ios | fortinet
  const [copied, setCopied] = useState(false);

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
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function handleCopyConfig(text) {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleExportJson() {
    if (!data) return;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `securax_audit_${data.id || "report"}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handlePrintHtml() {
    const reportUrl = getHtmlReportUrl(data?.id || "latest");
    window.open(reportUrl, "_blank");
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
              <div className="text-lg font-semibold text-slate-200">Compiling Executive Security Report...</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { security, ai, filename, timestamp, id } = data;
  const actionPlan = ai?.action_plan || [];
  const configs = ai?.remediation_configs || {};

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
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <span className="rounded-md border border-pink-500/40 bg-pink-500/15 px-2.5 py-0.5 text-xs font-semibold text-pink-300">
                  REPORTS & REMEDIATION
                </span>
                <span className="text-xs text-slate-400">Generated: {timestamp}</span>
              </div>
              <h1 className="mt-1 text-2xl md:text-3xl font-bold tracking-tight">
                Executive & Technical Audit Report
              </h1>
              <p className="text-xs md:text-sm text-slate-300">
                Report ID: <span className="font-mono text-blue-300">{id}</span> &bull; File: {filename}
              </p>
            </div>

            {/* Export Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handlePrintHtml}
                className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs md:text-sm font-semibold text-white hover:bg-blue-500 shadow-md shadow-blue-900/30 transition-all"
              >
                <Printer size={16} /> Open Formal HTML Report
              </button>
              <button
                onClick={handleExportJson}
                className="flex items-center gap-2 rounded-xl border border-blue-500/30 bg-[#071335]/80 px-4 py-2 text-xs md:text-sm font-semibold text-slate-200 hover:bg-white/10 transition-all"
              >
                <Download size={16} /> Export JSON
              </button>
            </div>
          </div>

          {/* Executive Summary Card */}
          <div className="mb-8 rounded-2xl border border-blue-500/20 bg-[#071335]/75 backdrop-blur-md p-6">
            <h2 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <Shield className="text-blue-400" size={20} />
              AI Executive Security Assessment Summary
            </h2>
            <p className="text-sm leading-relaxed text-slate-200">
              {ai?.executive_summary || "Audit complete. Review findings below."}
            </p>

            <div className="mt-4 flex flex-wrap gap-4 pt-4 border-t border-blue-500/20 text-xs">
              <div>
                <span className="text-slate-400">Security Score:</span>{" "}
                <span className="font-bold text-white">{security?.score ?? 100}/100</span>
              </div>
              <div>
                <span className="text-slate-400">Posture Rating:</span>{" "}
                <span className="font-bold text-blue-300">{security?.badge}</span>
              </div>
              <div>
                <span className="text-slate-400">Total Vulnerabilities:</span>{" "}
                <span className="font-bold text-red-300">{security?.total_findings ?? 0}</span>
              </div>
            </div>
          </div>

          {/* Actionable Remediation Plan */}
          <div className="mb-8 rounded-2xl border border-blue-500/20 bg-[#071335]/70 backdrop-blur-md p-6">
            <h2 className="text-lg font-bold text-white mb-1">
              Prioritized Remediation Action Plan
            </h2>
            <p className="text-xs text-slate-400 mb-4">
              Step-by-step technical hardening required to achieve compliance.
            </p>

            <div className="space-y-3">
              {actionPlan.map((act) => (
                <div
                  key={act.step}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-blue-500/20 bg-blue-950/20 p-4 text-xs sm:text-sm"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-600/30 font-bold text-blue-300 border border-blue-500/40">
                      {act.step}
                    </div>
                    <div>
                      <div className="font-bold text-white">{act.title}</div>
                      <div className="mt-0.5 text-slate-300">{act.text}</div>
                    </div>
                  </div>

                  <span
                    className={`self-start sm:self-center shrink-0 rounded border px-2.5 py-0.5 text-[11px] font-bold uppercase ${
                      act.priority === "High"
                        ? "border-red-500/40 bg-red-500/20 text-red-300"
                        : "border-blue-500/40 bg-blue-500/20 text-blue-300"
                    }`}
                  >
                    {act.priority} Priority
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Auto-Generated Hardened Configurations */}
          <div className="rounded-2xl border border-blue-500/20 bg-[#071335]/70 backdrop-blur-md p-6">
            <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <FileCode className="text-emerald-400" size={20} />
                  Auto-Generated Hardened VPN Configurations
                </h2>
                <p className="text-xs text-slate-400">
                  Drop-in replacement configuration templates for enterprise gateways enforcing NIST SP 800-77 Rev 1.
                </p>
              </div>

              {/* Copy Button */}
              <button
                onClick={() => handleCopyConfig(configs[configTab])}
                className="flex items-center gap-2 rounded-lg border border-blue-500/30 bg-blue-600/20 px-3.5 py-2 text-xs font-semibold text-blue-200 hover:bg-blue-600/30 transition-all self-start sm:self-auto"
              >
                {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                {copied ? "Copied to Clipboard!" : "Copy Configuration"}
              </button>
            </div>

            {/* Platform Tabs */}
            <div className="flex border-b border-blue-500/20 gap-2 mb-4">
              {[
                { id: "strongswan", label: "strongSwan / Linux", icon: Server },
                { id: "cisco_ios", label: "Cisco IOS-XE", icon: Terminal },
                { id: "fortinet", label: "Fortinet FortiGate", icon: Terminal },
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setConfigTab(id)}
                  className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold transition-colors border-b-2 -mb-px ${
                    configTab === id
                      ? "border-emerald-400 text-emerald-300 bg-emerald-500/10 rounded-t-lg"
                      : "border-transparent text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Icon size={14} />
                  {label}
                </button>
              ))}
            </div>

            {/* Code Block */}
            <div className="relative rounded-xl border border-blue-500/30 bg-[#03081a] p-4 font-mono text-xs text-slate-200 overflow-x-auto">
              <pre className="leading-relaxed">
                {configs[configTab] || "# No configuration generated for this platform"}
              </pre>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}