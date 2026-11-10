import React from 'react';
import { X, Sun, Moon, Monitor, Check, Sparkles } from 'lucide-react';
import { ColorTheme, ThemeMode } from '../types';
import { THEME_LIST, getThemeConfig, ThemeConfig } from '../data/themeData';

interface ThemeStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme: ColorTheme;
  onSelectTheme: (theme: ColorTheme) => void;
  currentMode: ThemeMode;
  onSelectMode: (mode: ThemeMode) => void;
  isDarkEffective: boolean;
}

export const ThemeStudioModal: React.FC<ThemeStudioModalProps> = ({
  isOpen,
  onClose,
  currentTheme,
  onSelectTheme,
  currentMode,
  onSelectMode,
  isDarkEffective,
}) => {
  if (!isOpen) return null;

  const activeConfig = getThemeConfig(currentTheme);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-3xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 md:p-8 space-y-6 my-8 max-h-[92vh] overflow-y-auto transition-all">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">🎨</span>
              <h2 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                Appearance & Themes
              </h2>
            </div>
            <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Select from 8 crafted colour palettes and configure your appearance mode
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close Theme Studio"
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Appearance Mode Switcher (Light / Dark / System) */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                Appearance Mode
              </span>
              <span className="text-xs text-slate-600 dark:text-slate-300">
                Active: <strong className="capitalize">{currentMode}</strong>
                {currentMode === 'system' && ` (resolves to ${isDarkEffective ? 'Dark' : 'Light'})`}
              </span>
            </div>

            {/* 3 Mode Buttons */}
            <div className="flex items-center gap-1.5 p-1 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
              <button
                onClick={() => onSelectMode('light')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  currentMode === 'light'
                    ? 'bg-amber-500 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Sun className="w-3.5 h-3.5" />
                <span>Light</span>
              </button>

              <button
                onClick={() => onSelectMode('dark')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  currentMode === 'dark'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Moon className="w-3.5 h-3.5" />
                <span>Dark</span>
              </button>

              <button
                onClick={() => onSelectMode('system')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  currentMode === 'system'
                    ? 'bg-slate-800 text-white dark:bg-slate-700 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
                <span>System</span>
              </button>
            </div>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            All 8 colour themes seamlessly adapt to both Light and Dark mode with guaranteed high contrast and readable prayer warnings.
          </p>
        </div>

        {/* 8 Themes Grid */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              8 Selectable Colour Themes
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Current: <strong className="text-slate-900 dark:text-white">{activeConfig.name}</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {THEME_LIST.map((th: ThemeConfig) => {
              const isSelected = activeConfig.id === th.id;
              const cardBg = isDarkEffective ? th.chips.bgDark : th.chips.bgLight;
              const textColor = isDarkEffective ? th.chips.textDark : th.chips.textLight;

              return (
                <button
                  key={th.id}
                  onClick={() => onSelectTheme(th.id)}
                  className={`group relative p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer overflow-hidden flex flex-col justify-between gap-3 ${
                    isSelected
                      ? 'border-2 shadow-md ring-2 ring-offset-1 ring-offset-white dark:ring-offset-slate-900'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900/90'
                  }`}
                  style={{
                    borderColor: isSelected ? th.chips.primary : undefined,
                  }}
                >
                  {/* Top: Name, Tagline & Checkmark */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900 dark:text-white">
                          {th.name}
                        </span>
                        {isSelected && (
                          <span
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold text-white shadow-xs"
                            style={{ backgroundColor: th.chips.primary }}
                          >
                            <Check className="w-3 h-3" />
                            <span>Active</span>
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block mt-0.5">
                        {th.tagline}
                      </span>
                    </div>

                    {/* Radio circle */}
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center border shrink-0 transition ${
                        isSelected
                          ? 'text-white'
                          : 'border-slate-300 dark:border-slate-700 group-hover:border-slate-400'
                      }`}
                      style={{
                        backgroundColor: isSelected ? th.chips.primary : 'transparent',
                        borderColor: isSelected ? th.chips.primary : undefined,
                      }}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5" />}
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {th.description}
                  </p>

                  {/* Visual Swatch Chips (Background, Primary, Accent, Text) */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <div
                        className="w-5 h-5 rounded-md border border-black/10 shadow-xs"
                        style={{ backgroundColor: th.chips.primary }}
                        title="Primary Color"
                      />
                      <div
                        className="w-5 h-5 rounded-md border border-black/10 shadow-xs"
                        style={{ backgroundColor: th.chips.accent }}
                        title="Accent Color"
                      />
                      <div
                        className="w-5 h-5 rounded-md border border-black/10 shadow-xs"
                        style={{ backgroundColor: cardBg }}
                        title="Surface Color"
                      />
                      <div
                        className="w-5 h-5 rounded-md border border-black/10 shadow-xs flex items-center justify-center text-[10px] font-bold"
                        style={{ backgroundColor: cardBg, color: textColor }}
                        title="Text Color"
                      >
                        Aa
                      </div>
                    </div>

                    {/* Mini live sample pill */}
                    <div
                      className="px-2.5 py-1 rounded-lg text-[10px] font-semibold border flex items-center gap-1"
                      style={{
                        backgroundColor: cardBg,
                        color: textColor,
                        borderColor: `${th.chips.primary}40`,
                      }}
                    >
                      <Sparkles className="w-2.5 h-2.5" style={{ color: th.chips.accent }} />
                      <span>Preview</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer info & close */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <p className="text-slate-500 dark:text-slate-400">
            Preferences save instantly to your device with <strong>zero reload required</strong>.
          </p>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-semibold bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:opacity-90 transition self-end sm:self-auto"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
