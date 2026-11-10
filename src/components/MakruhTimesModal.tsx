import React from 'react';
import { X, AlertTriangle, ExternalLink, Clock, BookOpen } from 'lucide-react';
import { MakruhStatus } from '../utils/prayerCalc';

interface MakruhTimesModalProps {
  isOpen: boolean;
  onClose: () => void;
  makruhStatus: MakruhStatus;
}

export const MakruhTimesModal: React.FC<MakruhTimesModalProps> = ({
  isOpen,
  onClose,
  makruhStatus,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 md:p-7 space-y-5 my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Prohibited & Disliked Prayer Times
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Active Status Alert */}
        {makruhStatus.activePeriod ? (
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200 space-y-1">
            <div className="flex items-center justify-between font-bold text-sm">
              <span>⚠️ Currently Active: {makruhStatus.activePeriod.title}</span>
              <span className="tabular-nums font-mono text-xs">
                {makruhStatus.activePeriod.startTime} – {makruhStatus.activePeriod.endTime}
              </span>
            </div>
            <p className="text-xs leading-relaxed mt-1">
              {makruhStatus.activePeriod.description}
            </p>
            <div className="pt-2">
              <a
                href={makruhStatus.activePeriod.sunnahUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-rose-700 dark:text-rose-300 font-semibold underline"
              >
                <span>Read Hadith: {makruhStatus.activePeriod.hadithRef} on Sunnah.com</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        ) : (
          <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 text-emerald-900 dark:text-emerald-200 text-xs flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
            <span>It is currently permissible to offer voluntary (Nafl) prayers in your location.</span>
          </div>
        )}

        {/* 3 Calculated Periods Breakdown */}
        <div className="space-y-3">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Today's Calculated Prohibited Periods
          </h3>

          {makruhStatus.periods.map((period) => (
            <div
              key={period.id}
              className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 space-y-1.5 text-xs"
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-900 dark:text-white">
                  {period.name}
                </span>
                <span className="font-mono font-medium text-slate-700 dark:text-slate-300 tabular-nums">
                  {period.timeSpan}
                </span>
              </div>
              <p className="text-slate-600 dark:text-slate-400">
                "{period.hadith}"
              </p>
              <div>
                <a
                  href={period.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 dark:text-emerald-400 hover:underline"
                >
                  <span>Verify narration on Sunnah.com</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Simple English Explanations & Scholarly Nuance */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 space-y-2 leading-relaxed">
          <div className="flex items-center gap-1.5 font-semibold text-slate-900 dark:text-white">
            <BookOpen className="w-3.5 h-3.5 text-slate-400" />
            <span>Islamic Jurisprudence & Scholarly Explanations</span>
          </div>
          <p>
            • <strong>Prohibited (Haram/Makruh Tahrimi) vs Disliked (Tanzihi):</strong> The Prophet ﷺ explicitly prohibited general voluntary prayers without a specific reason during the 3 periods when the sun rises, stands at midday, and sets (Sahih Muslim 831).
          </p>
          <p>
            • <strong>Scholarly Difference:</strong> Jurists differ regarding prayers that have a specific reason (such as <em>Tahiyyat al-Masjid</em> upon entering the mosque, funeral prayer, or missed obligatory prayers). The Shafi'i and Hanbali schools permit prayers with a specific cause during these times, while the Hanafi school dislikes even prayers with causes during the 3 peak periods.
          </p>
          <p>
            • <strong>Friday Exception:</strong> Many scholars (including Ash-Shafi'i) hold that the midday prohibited period does not apply on Friday for the one who is already inside the mosque waiting for Jumu'ah.
          </p>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-950 text-xs font-semibold hover:opacity-90 transition"
        >
          Close
        </button>
      </div>
    </div>
  );
};
