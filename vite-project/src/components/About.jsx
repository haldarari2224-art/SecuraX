import { useState } from "react";
import {
  Search,
  Sparkles,
  User,
  Code2,
  Users,
  ShieldCheck,
  Shield,
  Lock,
  Target,
  Eye,
  Settings,
  FileText,
  BarChart3,
  Activity,
} from "lucide-react";
import Sidebar from "./Sidebar";

// Background image. Onno image chaile naam ta bodlao (src/assets e thaka lagbe).
import bg from "../assets/about.webp";

const panel =
  "rounded-2xl border border-blue-500/25 bg-[#071335]/70 backdrop-blur-md";

const STATS = [
//   { value: "1+", label: "Projects Built", icon: Code2 },
  { value: "6+", label: "Team Members", icon: Users },
  { value: "100%", label: "Focus on Security", icon: ShieldCheck },
];

const WHAT_WE_DO = [
  {
    title: "PCAP Analysis",
    text: "Upload and analyze IPsec VPN PCAP files with ease.",
    icon: FileText,
  },
  {
    title: "Threat Detection",
    text: "Identify suspicious activity and security anomalies.",
    icon: ShieldCheck,
  },
  {
    title: "Detailed Reports",
    text: "Get clear, structured reports with actionable insights.",
    icon: BarChart3,
  },
  {
    title: "User Friendly Interface",
    text: "Simple, modern and intuitive design for everyone.",
    icon: User,
  },
];

const TEAM = [
  { name: "Vinita Debnath", role: "Frontend Developer", grad: "from-purple-500 to-indigo-500", bar: "bg-purple-500" },
  { name: "Subhajit Sarkar", role: "Backend Developer", grad: "from-blue-500 to-cyan-500", bar: "bg-blue-500" },
  { name: "Aritra Halder", role: "Cybersecurity Analyst", grad: "from-fuchsia-500 to-purple-500", bar: "bg-sky-500" },
  { name: "Soumyaditya Bose", role: "Cybersecurity Analyst", grad: "from-fuchsia-500 to-purple-500", bar: "bg-sky-500" },
  { name: "Pritam Datta", role: "AI/ML Engineer", grad: "from-sky-500 to-blue-600", bar: "bg-blue-600" },
  { name: "Swastika Das", role: "AI/ML Engineer", grad: "from-violet-500 to-purple-600", bar: "bg-violet-500" },
];

function initials(name) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function IconBox({ icon: Icon, size = 26 }) {
  return (
    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-blue-500/30 bg-blue-500/10 text-blue-200">
      <Icon size={size} />
    </div>
  );
}

export default function About() {
  const [query, setQuery] = useState("");

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-fixed text-slate-200"
      style={{
        backgroundImage: `linear-gradient(rgba(4,10,32,0.88), rgba(4,10,32,0.88)), url(${bg})`,
      }}
    >
      <div className="flex min-h-screen">
        <Sidebar />

        <div className="flex min-w-0 flex-1 flex-col">
          {/* ===== Top bar ===== */}
          <header className="flex h-16 items-center gap-4 border-b border-blue-500/15 bg-[#050d2b]/70 px-4 backdrop-blur-md md:px-6">
            <label className="flex h-10 max-w-md flex-1 items-center gap-2 rounded-lg border border-blue-500/30 bg-[#071335]/70 px-3">
              <Search size={16} className="text-blue-300" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search..."
                aria-label="Search"
                className="w-full bg-transparent text-sm text-slate-100 outline-none placeholder:text-slate-400"
              />
            </label>

            <div className="ml-auto flex items-center gap-4">
              <span className="hidden items-center gap-1.5 rounded-full border border-purple-400/50 bg-purple-500/15 px-3 py-1.5 text-xs font-semibold text-purple-200 sm:flex">
                <Sparkles size={14} /> AI POWERED
              </span>
              <button
                aria-label="Account"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-blue-500/30 bg-blue-600/30 text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
              >
                <User size={20} />
              </button>
            </div>
          </header>

          <main className="flex-1 space-y-5 p-4 sm:p-6 lg:p-8">
            {/* ===== Hero ===== */}
            <section className="grid items-center gap-8 border-b border-blue-500/20 pb-8 lg:grid-cols-2">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold tracking-wide text-blue-300">
                  <Sparkles size={14} /> ABOUT US
                </div>

                <h1 className="mt-3 text-4xl font-bold leading-tight text-white sm:text-5xl">
                  Securing Networks,
                  <br />
                  <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                    Empowering Tomorrow
                  </span>
                </h1>

                <p className="mt-4 max-w-lg text-sm leading-relaxed text-slate-300 sm:text-base">
                  We are a team of passionate developers, cybersecurity enthusiasts, and problem
                  solvers, building intelligent tools to make network security analysis simple,
                  accurate, and accessible.
                </p>

                <ul className="mt-6 flex flex-wrap gap-x-8 gap-y-4">
                  {STATS.map(({ value, label, icon: Icon }) => (
                    <li key={label} className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-blue-500/30 bg-blue-500/10 text-blue-200">
                        <Icon size={22} />
                      </div>
                      <div>
                        <div className="text-2xl font-bold leading-none text-white">{value}</div>
                        <div className="mt-1 text-sm text-slate-400">{label}</div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Shield graphic */}
              <div className="relative flex min-h-72 items-center justify-center">
                <div
                  className="absolute h-56 w-56 rounded-full bg-blue-500/25 blur-3xl"
                  aria-hidden="true"
                />
                <div
                  className="absolute bottom-10 h-14 w-80 rounded-[50%] border border-blue-400/40"
                  aria-hidden="true"
                />
                <div className="relative flex items-center justify-center" aria-hidden="true">
                  <Shield
                    size={200}
                    strokeWidth={1.2}
                    fill="rgba(59,130,246,0.25)"
                    className="text-blue-400 drop-shadow-[0_0_25px_rgba(59,130,246,0.9)]"
                  />
                  <Lock size={70} className="absolute text-blue-100" />
                </div>

                <div className="absolute bottom-0 right-0 flex items-center gap-3 rounded-xl border border-blue-500/40 bg-[#071335]/80 px-4 py-3 backdrop-blur-md sm:right-2">
                  <Activity size={26} className="text-purple-400" />
                  <div>
                    <div className="text-sm font-semibold text-white">
                      Analyze · Detect · Secure
                    </div>
                    <div className="text-xs text-slate-400">IPsec VPN. Smarter. Safer.</div>
                  </div>
                </div>
              </div>
            </section>

            {/* ===== Mission, Vision, What We Do ===== */}
            <div className="grid gap-5 lg:grid-cols-[1fr_1.1fr]">
              <div className="space-y-5">
                <section className={`${panel} flex gap-4 p-6`}>
                  <IconBox icon={Target} />
                  <div>
                    <h2 className="text-xl font-semibold text-white">Our Mission</h2>
                    <p className="mt-2 text-sm leading-relaxed text-slate-300">
                      To simplify network security analysis and help organizations identify
                      potential threats in their IPsec VPN traffic using modern technology and
                      AI-driven insights.
                    </p>
                  </div>
                </section>

                <section className={`${panel} flex gap-4 p-6`}>
                  <IconBox icon={Eye} />
                  <div>
                    <h2 className="text-xl font-semibold text-white">Our Vision</h2>
                    <p className="mt-2 text-sm leading-relaxed text-slate-300">
                      A safer digital world where network security is proactive, intelligent, and
                      accessible to all.
                    </p>
                  </div>
                </section>
              </div>

              <section className={`${panel} p-6`}>
                <div className="flex items-center gap-4">
                  <IconBox icon={Settings} />
                  <h2 className="text-xl font-semibold text-white">What We Do</h2>
                </div>

                <ul className="mt-5 space-y-4">
                  {WHAT_WE_DO.map(({ title, text, icon: Icon }) => (
                    <li key={title} className="flex items-center gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-blue-500/30 bg-blue-500/10 text-blue-200">
                        <Icon size={22} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">{title}</h3>
                        <p className="text-sm text-slate-400">{text}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            </div>

            {/* ===== Our Team ===== */}
            <section className={`${panel} flex flex-wrap items-center gap-8 p-6`}>
              <div className="max-w-xs">
                <div className="flex items-center gap-4">
                  <IconBox icon={Users} />
                  <h2 className="text-xl font-semibold text-white">Our Team</h2>
                </div>
                <p className="mt-3 text-sm text-slate-400">
                  A small team with a big dream — to build solutions that make a real impact.
                </p>
              </div>

              <ul className="flex flex-1 flex-wrap justify-around gap-6">
                {TEAM.map(({ name, role, grad, bar }) => (
                  <li key={name} className="flex w-32 flex-col items-center text-center">
                    {/* Real photo chaile: <img src={photo} alt={name} className="h-16 w-16 rounded-full object-cover" /> */}
                    <div
                      className={`flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br text-lg font-bold text-white ring-2 ring-blue-400/50 ${grad}`}
                      aria-hidden="true"
                    >
                      {initials(name)}
                    </div>
                    <div className="mt-3 text-sm font-semibold text-white">{name}</div>
                    <div className="mt-0.5 text-xs text-slate-400">{role}</div>
                    <span className={`mt-2 h-1 w-10 rounded-full ${bar}`} />
                  </li>
                ))}
              </ul>
            </section>

            {/* ===== Bottom banner ===== */}
            <section className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-indigo-400/50 bg-gradient-to-r from-[#0b1a5c]/90 via-[#1a2a86]/80 to-[#3b2a9c]/80 p-6 backdrop-blur-md">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center text-blue-200">
                  <ShieldCheck size={38} strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Together for a Safer Network</h3>
                  <p className="mt-1 max-w-xl text-sm text-slate-300">
                    We believe in the power of technology, teamwork, and innovation to build a more
                    secure digital future.
                  </p>
                </div>
              </div>

              <div
                className="-rotate-6 bg-gradient-to-r from-cyan-300 to-blue-400 bg-clip-text pr-4 text-4xl font-bold italic text-transparent"
                style={{ fontFamily: "'Brush Script MT', 'Segoe Script', cursive" }}
              >
                Thank You!
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}