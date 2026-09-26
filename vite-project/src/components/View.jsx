import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileCode,
  ShieldCheck,
  ShieldAlert,
  Zap,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import Sidebar from "./Sidebar";
import bg from "../assets/view.avif";
import { auditConfig } from "../api";

const CISCO_SAMPLE = `! Cisco IOS IPsec VPN Configuration
crypto ikev2 proposal PROP-LEGACY
 encryption 3des
 integrity md5
 group 1

crypto ikev2 policy POLICY-LEGACY
 proposal PROP-LEGACY

crypto ipsec transform-set TS-LEGACY esp-3des esp-md5-hmac
 mode tunnel

crypto map CRYPTO-MAP 10 ipsec-isakmp
 set peer 203.0.113.1
 set transform-set TS-LEGACY
 set ikev2-profile PROFILE-LEGACY
! Pre-shared key: admin123
`;

const STRONGSWAN_SAMPLE = `# /etc/ipsec.conf - strongSwan Configuration
conn site-to-site
    keyexchange=ikev2
    ike=aes256gcm16-prfsha384-ecp384,aes256-sha384-modp2048!
    esp=aes256gcm16-ecp384!
    left=192.168.1.1
    right=203.0.113.1
    rekey=yes
    lifetime=1h
    auto=start
`;

export default function View() {
  const navigate = useNavigate();
  const [configText, setConfigText] = useState(CISCO_SAMPLE);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleAudit() {
    if (!configText.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await auditConfig(configText);
      localStorage.setItem("currentAnalysisId", res.id);
      navigate("/security");
    } catch (err) {
      console.error(err);
      setError("Audit failed: " + err.message);
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
          <div className="mb-6">
            <div className="flex items-center gap-3">
              <span className="rounded-md border border-cyan-400/40 bg-cyan-500/15 px-2.5 py-0.5 text-xs font-semibold text-cyan-300">
                STATIC ANALYSIS
              </span>
              <span className="text-xs text-slate-400">Pre-Deployment Auditing</span>
            </div>
            <h1 className="mt-1 text-2xl md:text-3xl font-bold tracking-tight">
              Static IPsec Configuration Auditor
            </h1>
            <p className="text-xs md:text-sm text-slate-300">
              Audit Cisco IOS, strongSwan, Fortinet, or PfSense configuration files for vulnerabilities before deployment.
            </p>
          </div>

          <div className="rounded-2xl border border-blue-500/20 bg-[#071335]/75 backdrop-blur-md p-6">
            <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="text-xs text-slate-300">
                Paste your router/firewall configuration text below:
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setConfigText(CISCO_SAMPLE)}
                  className="rounded-lg border border-blue-500/30 bg-blue-950/40 px-3 py-1.5 text-xs font-medium text-blue-200 hover:bg-blue-900/40 transition-colors"
                >
                  Load Cisco Sample
                </button>
                <button
                  type="button"
                  onClick={() => setConfigText(STRONGSWAN_SAMPLE)}
                  className="rounded-lg border border-emerald-500/30 bg-emerald-950/40 px-3 py-1.5 text-xs font-medium text-emerald-200 hover:bg-emerald-900/40 transition-colors"
                >
                  Load strongSwan Sample
                </button>
              </div>
            </div>

            <textarea
              value={configText}
              onChange={(e) => setConfigText(e.target.value)}
              rows={16}
              className="w-full rounded-xl border border-blue-500/30 bg-[#03081a] p-4 font-mono text-xs sm:text-sm text-slate-200 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
              placeholder="Paste Cisco IOS, strongSwan, PfSense config here..."
            />

            {error && (
              <div className="mt-3 rounded-lg border border-red-500/40 bg-red-950/30 p-3 text-xs text-red-300">
                {error}
              </div>
            )}

            <div className="mt-5 flex justify-end">
              <button
                onClick={handleAudit}
                disabled={loading || !configText.trim()}
                className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-500 shadow-lg shadow-blue-900/40 transition-all disabled:opacity-50"
              >
                <Zap size={18} />
                {loading ? "Auditing Configuration..." : "Run Security Audit"}
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}