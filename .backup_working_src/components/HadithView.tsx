import React, { useState } from 'react';
import { SunnahWorshipView } from './SunnahWorshipView';
import { DayPrayerSchedule } from '../utils/prayerCalc';
import { HADITH_COLLECTIONS } from '../data/hadithData';
import { ExternalLink, BookOpen, Layers, Sparkles } from 'lucide-react';

interface HadithViewProps {
  schedule?: DayPrayerSchedule;
  timezone?: string;
  onNavigateToTab?: (tab: string) => void;
}

export const HadithView: React.FC<HadithViewProps> = ({ schedule, timezone, onNavigateToTab }) => {
  const [activeMainMode, setActiveMainMode] = useState<'sunnah_library' | 'general_hadiths'>('sunnah_library');

  return (
    <div className="space-y-6">
      {/* Top Toggle Switch between Sunnah Library and General Compendium */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveMainMode('sunnah_library')}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all ${
              activeMainMode === 'sunnah_library'
                ? 'bg-emerald-700 text-white shadow-md shadow-emerald-700/20'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-slate-300'
            }`}
          >
            <BookOpen className="w-4 h-4 text-amber-300" />
            <span>Sunnah, Hadith & Family Worship Library</span>
          </button>

          <button
            onClick={() => setActiveMainMode('general_hadiths')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-bold transition-all ${
              activeMainMode === 'general_hadiths'
                ? 'bg-emerald-700 text-white shadow-md shadow-emerald-700/20'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-slate-300'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>General Hadith Compendium ({HADITH_COLLECTIONS.length})</span>
          </button>
        </div>

        <span className="hidden md:inline-block text-[11px] font-semibold text-slate-500 dark:text-slate-400">
          Sunnah.com Verified Primary Sources
        </span>
      </div>

      {activeMainMode === 'sunnah_library' ? (
        <SunnahWorshipView schedule={schedule} timezone={timezone} onNavigateToTab={onNavigateToTab} />
      ) : (
        /* Legacy General Compendium Display */
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              General Prayer & Worship Hadith Compendium
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Foundational Hadith narrations on the pillars of prayer, virtues of Jumu’ah, night vigil, and mosque etiquette.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {HADITH_COLLECTIONS.map((item) => (
              <div
                key={item.id}
                className="p-5 md:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-400">
                      {item.category}
                    </span>
                    <h3 className="text-sm md:text-base font-semibold text-slate-900 dark:text-white">
                      {item.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      Grade: {item.grade}
                    </span>
                    <a
                      href={item.sunnahLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline"
                    >
                      <span>Verify on Sunnah.com</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>

                {item.arabic && (
                  <div className="text-right py-2" dir="rtl">
                    <p className="font-amiri text-lg md:text-xl text-slate-900 dark:text-slate-100 leading-loose">
                      {item.arabic}
                    </p>
                  </div>
                )}

                <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                  "{item.english}"
                </p>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {item.collection} — Hadith {item.hadithNumber}
                  </span>
                  <span className="text-[11px] text-slate-400">Verified authentic Sunnah</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
