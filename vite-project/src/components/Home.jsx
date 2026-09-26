import { Link } from "react-router-dom";
import {
  Upload,
  Eye,
  CloudUpload,
  BarChart3,
  ShieldCheck,
  FileText,
  ArrowRight,
} from "lucide-react";
import Sidebar from "./Sidebar";

// Hero image. Onno image chaile naam ta bodlao (src/assets e thaka lagbe).
import heroImage from "../assets/ray.jpg";

const PROTOCOLS = ["IKE", "ESP", "AES", "DH", "PFS"];

const FEATURES = [
  {
    title: "Upload PCAP File",
    text: "Upload your captured network traffic file for analysis.",
    icon: CloudUpload,
    color: "bg-blue-500",
    to: "/upload",
  },
  {
    title: "AI-Powered Analysis",
    text: "Automatically detect protocol types, configurations and traffic patterns.",
    icon: BarChart3,
    color: "bg-emerald-500",
    to: "/analysis",
  },
  {
    title: "Security Assessment",
    text: "Evaluate cryptography, key exchange, and potential vulnerabilities.",
    icon: ShieldCheck,
    color: "bg-sky-500",
    to: "/security",
  },
  {
    title: "Detailed Reports",
    text: "Get comprehensive executive and technical reports with recommendations.",
    icon: FileText,
    color: "bg-pink-500",
    to: "/reports",
  },
];

const STATS = [
  { value: "+99%", label: "Accuracy" },
  { value: "< 2 min", label: "Analysis Time" },
  { value: "100%", label: "Protocol Coverage" },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-[#070b16] text-slate-200">
      <div className="flex min-h-screen">
        <Sidebar />

        <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
          {/* ===== HERO ===== */}
          <section className="relative overflow-hidden rounded-3xl border border-white/10">
            {/* Hero image */}
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${heroImage})` }}
              aria-hidden="true"
            />
            {/* Baam dike dark fade, jate lekha porishkar dekhay */}
            <div
              className="absolute inset-0 bg-gradient-to-r from-[#070b16] via-[#070b16]/80 to-transparent"
              aria-hidden="true"
            />

            {/* Protocol chips */}
            <ul
              className="absolute right-6 top-1/2 hidden -translate-y-1/2 flex-col gap-3 lg:flex"
              aria-label="Supported protocols"
            >
              {PROTOCOLS.map((p) => (
                <li
                  key={p}
                  className="rounded-md border border-white/10 bg-black/40 px-3 py-1.5 text-center text-xs font-bold text-white backdrop-blur"
                >
                  {p}
                </li>
              ))}
            </ul>

            {/* Hero text */}
            <div className="relative max-w-2xl px-6 py-12 sm:px-10 lg:px-14 lg:py-16">
              <span className="inline-block rounded-full border border-blue-400/50 bg-blue-500/10 px-3 py-1 text-xs font-semibold tracking-wide text-blue-200">
                AI POWERED
              </span>

              <h1 className="mt-4 text-4xl font-bold leading-[1.05] sm:text-5xl lg:text-[52px]">
                <span className="text-red-400">SecuraX</span>
                <br />
                <span className="bg-gradient-to-r from-indigo-200 via-purple-300 to-red-400 bg-clip-text text-transparent">
                  Security Analyzer
                </span>
              </h1>

              <p className="mt-4 text-base font-semibold text-slate-100 sm:text-lg">
                Analyze. Detect. Assess. Secure.
              </p>

              <p className="mt-4 max-w-xl text-sm leading-relaxed text-slate-300 sm:text-base">
                Upload your PCAP file, and let our AI-powered engine analyze IPsec VPN
                protocols, identify configurations, and assess security posture with
                actionable insights.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  to="/upload"
                  className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-900/30 transition hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
                >
                  <Upload size={16} />
                  Upload PCAP File
                </Link>

                <Link
                  to="/view"
                  className="flex items-center gap-2 rounded-lg border border-white/20 bg-black/20 px-5 py-2.5 text-sm font-semibold text-slate-100 transition hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
                >
                  <Eye size={16} />
                  View Sample
                </Link>
              </div>
            </div>
          </section>

          {/* ===== FEATURE CARDS ===== */}
          <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {FEATURES.map(({ title, text, icon: Icon, color, to }) => (
              <Link
                key={title}
                to={to}
                className="group flex flex-col rounded-2xl border border-white/10 bg-[#0a1020]/80 p-5 transition duration-200 hover:-translate-y-1 hover:border-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
              >
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-xl text-white ${color}`}
                >
                  <Icon size={22} />
                </div>
                <h3 className="mt-4 text-base font-semibold text-white">{title}</h3>
                <p className="mt-1.5 flex-1 text-sm leading-relaxed text-slate-400">
                  {text}
                </p>
                <ArrowRight
                  size={18}
                  className="mt-4 text-slate-400 transition group-hover:translate-x-1 group-hover:text-white"
                />
              </Link>
            ))}
          </section>

          {/* ===== STATS BOX ===== */}
          <section className="mt-6 rounded-2xl border border-white/10 bg-gradient-to-br from-[#1a1338]/90 to-[#0a1020]/90 p-6 backdrop-blur">
            <h2 className="text-xl font-bold text-white sm:text-2xl">
              Stronger VPN Security with AI
            </h2>

            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-3">
              {STATS.map(({ value, label }) => (
                <div key={label}>
                  <p className="text-3xl font-bold text-white sm:text-4xl">{value}</p>
                  <p className="mt-1 text-sm text-blue-400">{label}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 flex items-center justify-between gap-4 border-t border-white/10 pt-4">
              <p className="text-sm text-slate-300">
                From raw packets to valuable insights.
              </p>
              <Link
                to="/insights"
                aria-label="Upload a PCAP file"
                className="text-blue-400 transition hover:translate-x-1 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
              >
                <ArrowRight size={18} />
              </Link>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}