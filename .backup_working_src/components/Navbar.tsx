import React from 'react';
import { Settings, Moon, Sun, Palette } from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenSettings: () => void;
  onOpenThemeStudio?: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenSettings,
  onOpenThemeStudio,
  darkMode,
  onToggleDarkMode,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-8 px-4 sm:px-6 h-16">
        {/* Zone 1: Brand Wordmark & Developer Credit */}
        <div className="flex items-center gap-2.5 whitespace-nowrap shrink-0">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-800 flex items-center justify-center shadow-sm">
            <svg viewBox="0 0 24 24" className="w-4 h-4 text-amber-300" fill="currentColor">
              <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z" />
              <path d="M12 6a6 6 0 1 0 6 6 6 6 0 0 0-6-6z" fill="#fef08a" opacity="0.9" />
            </svg>
          </div>
          <div className="flex flex-col text-left">
            <button
              onClick={() => setActiveTab('dashboard')}
              className="text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-white hover:text-emerald-700 dark:hover:text-emerald-400 transition leading-tight text-left inline-flex items-center gap-1.5"
            >
              <span>Nur al-Salat</span>
              <span className="text-slate-400 dark:text-slate-500 font-normal">|</span>
              <span className="font-arabic font-normal text-base sm:text-lg text-emerald-800 dark:text-emerald-300">نور الصلاة</span>
            </button>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium leading-tight">
              Developed by <strong className="font-semibold text-slate-700 dark:text-slate-200">Mohammed Amir Mohiuddin</strong> · <span className="italic">Built with curiosity.</span>
            </span>
          </div>
        </div>

        {/* Zone 2: 4–5 concise single-line nav links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-600 dark:text-slate-300">
          {[
            { id: 'dashboard', label: 'Dashboard' },
            { id: 'hadith', label: 'Sunnah & Worship' },
            { id: 'adhkar', label: 'Adhkar' },
            { id: 'quran', label: 'Quran' },
            { id: 'qibla', label: 'Qibla' },
            { id: 'tracker', label: 'Tracker' },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`whitespace-nowrap shrink-0 py-1 transition-colors relative ${
                  isActive
                    ? 'text-emerald-700 dark:text-emerald-400 font-bold'
                    : 'hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {tab.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600 dark:bg-emerald-400 rounded-full" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: 1 Primary Action Area */}
        <div className="flex items-center gap-2 shrink-0">
          <PWAInstallButton compact />

          {onOpenThemeStudio && (
            <button
              onClick={onOpenThemeStudio}
              title="Appearance & Themes"
              aria-label="Appearance & Themes"
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <Palette className="w-4 h-4 text-amber-500" />
            </button>
          )}

          <button
            onClick={onToggleDarkMode}
            title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          <button
            onClick={onOpenSettings}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition"
          >
            <Settings className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Settings</span>
          </button>
        </div>
      </div>
    </header>
  );
};
