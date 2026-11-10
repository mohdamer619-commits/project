import React from 'react';
import { Volume2, VolumeX, CheckCircle2, AlertTriangle, Clock } from 'lucide-react';
import { PrayerTimeItem, PrayerName } from '../types';
import { SalahClock } from './SalahClock';

interface PrayerCardProps {
  prayer: PrayerTimeItem;
  isAdhanActive: boolean;
  onToggleAdhan: () => void;
  loggedStatus?: 'prayed' | 'missed' | 'pending';
  onUpdateStatus?: (status: 'prayed' | 'missed' | 'pending') => void;
}

export const PrayerCard: React.FC<PrayerCardProps> = ({
  prayer,
  isAdhanActive,
  onToggleAdhan,
  loggedStatus = 'pending',
  onUpdateStatus,
}) => {
  const now = new Date().getTime();
  const endTimeMs = prayer.endTime ? prayer.endTime.getTime() : null;
  const minutesLeftInPeriod = endTimeMs ? Math.max(0, Math.floor((endTimeMs - now) / 60000)) : null;

  // Urgent warning when prayer period is running out (< 20 mins left)
  const isTimeRunningOut = prayer.isCurrent && minutesLeftInPeriod !== null && minutesLeftInPeriod > 0 && minutesLeftInPeriod <= 20;

  // Natural state message
  let statusMessage = '';
  if (prayer.isCurrent) {
    if (minutesLeftInPeriod !== null) {
      if (isTimeRunningOut) {
        statusMessage = `Hurry! Time is running out for ${prayer.name} (${minutesLeftInPeriod} mins left)`;
      } else {
        statusMessage = `${prayer.name} — ${minutesLeftInPeriod} minutes left`;
      }
    } else {
      statusMessage = `Current prayer period`;
    }
  } else if (prayer.isNext) {
    const minutesToStart = Math.max(0, Math.floor((prayer.time.getTime() - now) / 60000));
    statusMessage = `${prayer.name} begins in ${minutesToStart} minutes`;
  } else if (prayer.status === 'passed') {
    statusMessage = `This prayer time has ended`;
  }

  return (
    <div
      className={`relative rounded-2xl border transition-all duration-200 overflow-hidden ${
        prayer.isCurrent
          ? isTimeRunningOut
            ? 'border-red-400 dark:border-red-600 bg-red-500/5 dark:bg-red-950/20 shadow-md ring-1 ring-red-500/20'
            : 'border-emerald-500/50 dark:border-emerald-500/40 bg-emerald-50/40 dark:bg-emerald-950/20 shadow-sm ring-1 ring-emerald-500/20'
          : prayer.isNext
          ? 'border-indigo-300 dark:border-indigo-700/60 bg-white dark:bg-slate-900/90 shadow-sm'
          : 'border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/50'
      }`}
    >
      {/* Top Banner for Urgent Ending Warning */}
      {isTimeRunningOut && (
        <div className="bg-red-600 text-white px-3.5 py-1.5 flex items-center justify-between text-xs font-semibold animate-pulse">
          <div className="flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            <span>Hurry! Time is running out for {prayer.name}</span>
          </div>
          <span className="tabular-nums font-mono">{minutesLeftInPeriod}m remaining</span>
        </div>
      )}

      <div className="p-4 md:p-5">
        <div className="flex items-start justify-between gap-2">
          {/* Prayer Identity */}
          <div>
            <div className="flex items-baseline gap-2">
              <h3 className="text-lg md:text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                {prayer.name}
              </h3>
              <span className="text-xs font-arabic text-emerald-700 dark:text-emerald-400">
                {prayer.arabicName}
              </span>
            </div>

            {/* Natural message indicator */}
            <p
              className={`text-xs mt-1 font-medium ${
                isTimeRunningOut
                  ? 'text-red-600 dark:text-red-400'
                  : prayer.isCurrent
                  ? 'text-emerald-700 dark:text-emerald-400'
                  : prayer.isNext
                  ? 'text-indigo-600 dark:text-indigo-400'
                  : 'text-slate-400 dark:text-slate-500'
              }`}
            >
              {statusMessage}
            </p>
          </div>

          {/* Time & Adhan Alert Button */}
          <div className="flex items-center gap-2">
            <button
              onClick={onToggleAdhan}
              title={isAdhanActive ? 'Adhan alert active' : 'Adhan alert muted'}
              className={`p-2 rounded-xl transition-colors ${
                isAdhanActive
                  ? 'text-emerald-700 bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-950/70 dark:text-emerald-300'
                  : 'text-slate-400 hover:text-slate-600 bg-slate-100 dark:bg-slate-800 dark:text-slate-500'
              }`}
            >
              {isAdhanActive ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {onUpdateStatus && (
              <button
                onClick={() => {
                  const nextStatus = loggedStatus === 'prayed' ? 'pending' : 'prayed';
                  onUpdateStatus(nextStatus);
                }}
                title={loggedStatus === 'prayed' ? 'Marked as Prayed' : 'Mark as Prayed'}
                className={`p-2 rounded-xl transition-colors ${
                  loggedStatus === 'prayed'
                    ? 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/60 dark:text-emerald-300'
                    : 'text-slate-300 hover:text-slate-500 bg-slate-100 dark:bg-slate-800'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Clock & Timings Section */}
        <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-3">
          {/* 12, 3, 6, 9 Small Analog Clock with Valid Time Frame */}
          <SalahClock
            startTime={prayer.time}
            endTime={prayer.endTime}
            isCurrent={prayer.isCurrent}
            status={prayer.status}
            size={68}
          />

          {/* Timings */}
          <div className="flex-1 min-w-0 space-y-1.5">
            <div>
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 block uppercase tracking-wider">
                Begins (Entered)
              </span>
              <span className="text-sm md:text-base font-extrabold text-slate-900 dark:text-slate-100 tabular-nums truncate block">
                {prayer.timeString}
              </span>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 block uppercase tracking-wider">
                Calculated End
              </span>
              <span className="text-xs md:text-sm font-semibold text-slate-600 dark:text-slate-300 tabular-nums truncate block">
                {prayer.endTimeString || 'Next Prayer'}
              </span>
            </div>
          </div>
        </div>

        {/* Explicit Written Description: Entered at X — Ends at Y */}
        <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800/70">
          <p className="text-[11px] font-semibold text-slate-800 dark:text-slate-200 leading-snug">
            {prayer.status === 'passed'
              ? `Entered at ${prayer.timeString} — Ended at ${prayer.endTimeString || 'Next'}`
              : prayer.isCurrent
              ? `Entered at ${prayer.timeString} — Ends at ${prayer.endTimeString || 'Next'}`
              : `Enters at ${prayer.timeString} — Ends at ${prayer.endTimeString || 'Next'}`}
          </p>
          <span className="text-[10px] text-slate-400 dark:text-slate-500 block mt-0.5">
            Valid frame: {prayer.timeString} to {prayer.endTimeString || 'Next'}
          </span>
        </div>

        {/* Scholarly Explanations Footer */}
        {prayer.scholarlyNote && (
          <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400 leading-snug flex items-start gap-1">
            <Clock className="w-3 h-3 text-slate-400 shrink-0 mt-0.5" />
            <span>{prayer.scholarlyNote}</span>
          </div>
        )}
      </div>
    </div>
  );
};
