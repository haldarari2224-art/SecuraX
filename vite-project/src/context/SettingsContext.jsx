import React, { createContext, useContext, useState, useEffect } from "react";
import { translations } from "../utils/i18n";

const STORAGE_KEY = "securax-settings";

export const DEFAULT_SETTINGS = {
  theme: "dark",
  language: "English",
  autoRefresh: true,
  showNotifications: true,
  ikeVersion: "auto",
  decryptionMode: "auto",
  maxFileSize: "50", // MB
  formats: { pcap: true, pcapng: true, cap: false },
  analysisMode: "balanced",
  aiThinking: true, // Multi-step chain of thought
  aiModel: "gemini-1.5-flash",
  detectAnomalies: true,
  classifyTraffic: true,
  generateInsights: true,
  apiUrl: "/api",
  apiTimeout: "30",
  enableCors: true,
  retention: "30",
  reportFormat: "pdf",
  notifyComplete: true,
  notifyHighRisk: true,
  notifySystem: true,
  notifyDaily: false,
};

const SettingsContext = createContext({
  settings: DEFAULT_SETTINGS,
  updateSetting: () => {},
  saveSettings: () => {},
  resetSettings: () => {},
  t: (key) => key,
});

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      return {
        ...DEFAULT_SETTINGS,
        ...saved,
        formats: { ...DEFAULT_SETTINGS.formats, ...(saved.formats || {}) },
      };
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  // Apply theme immediately on mount or change
  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    if (settings.theme === "light") {
      root.classList.add("theme-light");
      root.classList.remove("theme-dark");
      body.classList.add("theme-light");
      body.classList.remove("theme-dark");
    } else {
      root.classList.add("theme-dark");
      root.classList.remove("theme-light");
      body.classList.add("theme-dark");
      body.classList.remove("theme-light");
    }
    // Also save in standalone key for instant load
    localStorage.setItem("securax-theme", settings.theme);
  }, [settings.theme]);

  // Update a single setting in state
  const updateSetting = (key, value) => {
    setSettings((prev) => {
      const next = { ...prev, [key]: value };
      // Also sync immediately to localStorage so other tabs / reloads get it
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch (e) {
        console.error(e);
      }
      return next;
    });
  };

  const saveSettings = (newSettings) => {
    const toSave = newSettings || settings;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    setSettings(toSave);
  };

  const resetSettings = () => {
    localStorage.removeItem(STORAGE_KEY);
    setSettings(DEFAULT_SETTINGS);
  };

  // Translation helper
  const t = (key) => {
    const lang = settings.language || "English";
    const dict = translations[lang] || translations.English;
    return dict[key] || translations.English[key] || key;
  };

  return (
    <SettingsContext.Provider
      value={{
        settings,
        updateSetting,
        saveSettings,
        resetSettings,
        t,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}
