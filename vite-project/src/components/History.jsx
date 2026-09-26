import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Clock,
  FileText,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Eye,
  RefreshCw,
  FolderOpen,
  ArrowRight,
  PlusCircle,
} from "lucide-react";
import Sidebar from "./Sidebar";
import bg from "../assets/history.jpg";
import { getHistory, loadSample } from "../api";

export default function History() {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  async function fetchHistory() {
    setLoading(true);
    try {
      const items = await getHistory();
      setHistory(items);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function handleSelectReport(id) {
    localStorage.setItem("currentAnalysisId", id);
    navigate("/analysis");
  }

  async function handleLoadSample(key) {
    setLoading(true);
    try {
      const res = await loadSample(key);
      localStorage.setItem("currentAnalysisId", res.id);
      navigate("/analysis");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

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
                <span className="rounded-md border border-blue-400/40 bg-blue-500/15 px-2.5 py-0.5 text-xs font-semibold text-blue-300">
                  AUDIT LOGS
                </span>
                <span className="text-xs text-slate-400">Persistent Records</span>
              </div>
              <h1 className="mt-1 text-2xl md:text-3xl font-bold tracking-tight">
                Capture & Assessment History
              </h1>
              <p className="text-xs md:text-sm text-slate-300">
                Browse and re-open previous network traffic assessments and audit results.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={fetchHistory}
                className="flex items-center gap-2 rounded-xl border border-blue-500/30 bg-[#071335]/80 px-3.5 py-2 text-xs font-semibold text-slate-200 hover:bg-white/10 transition-all"
              >
                <RefreshCw size={14} /> Refresh
              </button>
              <Link
                to="/upload"
                className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs md:text-sm font-semibold text-white hover:bg-blue-500 shadow-md shadow-blue-900/30 transition-all"
              >
                <PlusCircle size={16} /> New Analysis
              </Link>
            </div>
          </div>

          {/* Table Container */}
          <div className="rounded-2xl border border-blue-500/20 bg-[#071335]/75 backdrop-blur-md p-6">
            {loading ? (
              <div className="flex flex-col items-center justify-center p-12 text-slate-400">
                <RefreshCw className="h-8 w-8 animate-spin text-blue-400 mb-3" />
                <span>Loading audit records...</span>
              </div>
            ) : history.length === 0 ? (
              <div className="p-12 text-center">
                <FolderOpen className="mx-auto h-12 w-12 text-slate-500 mb-3" />
                <h3 className="text-lg font-bold text-white">No Previous Audits Found</h3>
                <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto mt-1 mb-6">
                  Upload a .pcap file or launch one of our built-in test captures to generate your first security assessment.
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                  <button
                    onClick={() => handleLoadSample("vulnerable_legacy")}
                    className="rounded-lg border border-red-500/40 bg-red-950/40 px-4 py-2 text-xs font-semibold text-red-200 hover:bg-red-900/40"
                  >
                    Load Vulnerable Capture
                  </button>
                  <button
                    onClick={() => handleLoadSample("modern_compliant")}
                    className="rounded-lg border border-emerald-500/40 bg-emerald-950/40 px-4 py-2 text-xs font-semibold text-emerald-200 hover:bg-emerald-900/40"
                  >
                    Load Compliant Capture
                  </button>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-blue-500/20 text-slate-400">
                      <th className="pb-3 font-semibold">Capture / Target</th>
                      <th className="pb-3 font-semibold">Timestamp</th>
                      <th className="pb-3 font-semibold">Packets</th>
                      <th className="pb-3 font-semibold">Score / Grade</th>
                      <th className="pb-3 font-semibold">Critical Findings</th>
                      <th className="pb-3 font-semibold text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-blue-500/10">
                    {history.map((item) => {
                      const scoreColor =
                        item.score >= 80 ? "text-emerald-400 bg-emerald-500/20 border-emerald-500/40" :
                        item.score >= 60 ? "text-amber-400 bg-amber-500/20 border-amber-500/40" :
                        "text-red-400 bg-red-500/20 border-red-500/40";

                      return (
                        <tr key={item.id} className="hover:bg-white/5 transition-colors">
                          <td className="py-3.5 font-medium text-white">
                            <div className="flex items-center gap-2">
                              <FileText size={16} className="text-blue-400" />
                              <span className="font-mono text-xs">{item.filename}</span>
                            </div>
                          </td>
                          <td className="py-3.5 text-slate-300 font-mono text-xs">{item.timestamp}</td>
                          <td className="py-3.5 text-slate-300">
                            {item.total_packets?.toLocaleString() ?? 0}
                          </td>
                          <td className="py-3.5">
                            <span className={`inline-flex items-center gap-1 rounded border px-2 py-0.5 text-xs font-bold ${scoreColor}`}>
                              {item.score ?? 100}/100 ({item.grade ?? "A"})
                            </span>
                          </td>
                          <td className="py-3.5">
                            {item.critical_count > 0 ? (
                              <span className="text-red-400 font-bold">{item.critical_count} Critical</span>
                            ) : (
                              <span className="text-emerald-400 font-semibold">0 Critical</span>
                            )}
                          </td>
                          <td className="py-3.5 text-right">
                            <button
                              onClick={() => handleSelectReport(item.id)}
                              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600/30 border border-blue-500/40 px-3 py-1.5 text-xs font-semibold text-blue-200 hover:bg-blue-600 hover:text-white transition-all"
                            >
                              <Eye size={13} /> View Audit
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}