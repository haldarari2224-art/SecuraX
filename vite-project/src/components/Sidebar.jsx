import { NavLink } from "react-router-dom";
import {
  Home,
  CloudUpload,
  BarChart3,
  FileText,
  Clock,
  Settings,
  ShieldCheck,
  BrainCircuit,
  User,
  ShieldAlert,
  FileCode,
} from "lucide-react";

import { useSettings } from "../context/SettingsContext";

const navItems = [
  { key: "nav_home", defaultLabel: "Home", icon: Home, to: "/" },
  { key: "nav_upload", defaultLabel: "Upload PCAP", icon: CloudUpload, to: "/upload" },
  { key: "nav_analysis", defaultLabel: "Analysis Results", icon: BarChart3, to: "/analysis" },
  { key: "nav_security", defaultLabel: "Security Audit", icon: ShieldAlert, to: "/security" },
  { key: "nav_reports", defaultLabel: "Reports", icon: FileText, to: "/reports" },
  { key: "nav_history", defaultLabel: "History", icon: Clock, to: "/history" },
  { key: "nav_config", defaultLabel: "Config Auditor", icon: FileCode, to: "/view" },
  { key: "nav_insights", defaultLabel: "AI Insights", icon: BrainCircuit, to: "/insights" },
  { key: "nav_settings", defaultLabel: "Settings", icon: Settings, to: "/settings" },
  { key: "nav_about", defaultLabel: "About Us", icon: User, to: "/about" },
];

function NetworkGraphic() {
  const nodes = [
    [20, 40], [55, 25], [90, 55], [40, 85], [110, 100],
    [15, 120], [75, 130], [130, 30], [60, 60], [100, 15],
  ];
  const links = [
    [0, 1], [1, 2], [2, 3], [3, 0], [2, 4], [3, 5], [5, 6],
    [6, 4], [1, 7], [7, 2], [8, 1], [8, 3], [9, 1], [9, 7], [8, 6],
  ];
  return (
    <svg viewBox="0 0 150 150" width="170" height="170" aria-hidden="true">
      {links.map(([a, b], i) => (
        <line
          key={i}
          x1={nodes[a][0]} y1={nodes[a][1]}
          x2={nodes[b][0]} y2={nodes[b][1]}
          stroke="#3b82f6" strokeWidth="0.6" opacity="0.4"
        />
      ))}
      {nodes.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={i % 3 === 0 ? 2.8 : 1.7} fill="#3b82f6" opacity="0.9" />
      ))}
    </svg>
  );
}

export default function Sidebar() {
  const { t } = useSettings();

  return (
    <aside className="relative hidden w-65 shrink-0 flex-col overflow-hidden border-r border-blue-500/15 bg-[#050d2b]/70 backdrop-blur-md md:flex">
      <div className="flex items-center gap-3 px-6 pb-6 pt-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-600/30">
          <ShieldCheck size={28} />
        </div>
        <div className="leading-tight">
          <div className="text-lg font-bold">SecuraX</div>
          <div className="text-sm text-slate-300">{t("brand_sub")}</div>
        </div>
      </div>

      <nav className="flex flex-col gap-1 px-3" aria-label="Main">
        {navItems.map(({ key, defaultLabel, icon: Icon, to }) => (
          <NavLink
            key={key}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              `flex items-center gap-4 rounded-xl px-4 py-3.5 text-[15px] transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 ${
                isActive
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-900/30 font-medium"
                  : "text-slate-200 hover:bg-white/5"
              }`
            }
          >
            <Icon size={22} />
            <span>{t(key) || defaultLabel}</span>
          </NavLink>
        ))}
      </nav>

      <div className="pointer-events-none absolute -left-6 bottom-6">
        <NetworkGraphic />
      </div>
    </aside>
  );
}