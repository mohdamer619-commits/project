import React from 'react';
import { CheckCircle2, XCircle, Calendar, Award } from 'lucide-react';
import { SalahName } from '../types';

interface PrayerTrackerProps {
  prayerLogs: Record<string, Record<SalahName, 'prayed' | 'missed' | 'pending'>>;
  onUpdateLog: (dateKey: string, prayer: SalahName, status: 'prayed' | 'missed' | 'pending') => void;
}

export const PrayerTracker: React.FC<PrayerTrackerProps> = ({ prayerLogs, onUpdateLog }) => {
  const prayers: SalahName[] = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
  const todayKey = new Date().toISOString().slice(0, 10);

  // Generate last 7 days keys
  const past7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return {
      dateKey: d.toISOString().slice(0, 10),
      dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
      dayNumber: d.getDate(),
      isToday: d.toISOString().slice(0, 10) === todayKey,
    };
  });

  // Calculate 7-day completion count
  let totalTracked = 0;
  let totalPrayed = 0;
  past7Days.forEach(({ dateKey }) => {
    const log = prayerLogs[dateKey] || {};
    prayers.forEach((p) => {
      totalTracked++;
      if (log[p] === 'prayed') {
        totalPrayed++;
      }
    });
  });

  const weeklyPercentage = Math.round((totalPrayed / totalTracked) * 100);
  const todayLog = prayerLogs[todayKey] || {};
  const todayCompletedCount = prayers.filter((p) => todayLog[p] === 'prayed').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Salah Tracker & Habit Reflection
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          A gentle, encouraging space to record your prayers and nurture spiritual consistency
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Today's Progress</span>
            <Calendar className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white tabular-nums">
              {todayCompletedCount} / 5
            </span>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
              {Math.round((todayCompletedCount / 5) * 100)}% completed
            </span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">7-Day Consistency</span>
            <Award className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white tabular-nums">
              {totalPrayed} / {totalTracked}
            </span>
            <span className="text-xs text-slate-500 font-medium">({weeklyPercentage}%)</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-center">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Spiritual Reminder</span>
          <p className="text-xs text-slate-700 dark:text-slate-300 mt-1 italic">
            "The most beloved of deeds to Allah are those that are most consistent, even if they are few."
          </p>
        </div>
      </div>

      {/* Today's Prayers Checklist */}
      <div className="p-5 md:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <h2 className="text-base font-semibold text-slate-900 dark:text-white mb-4">
          Today's Daily Salah Checklist
        </h2>

        <div className="space-y-3">
          {prayers.map((prayer) => {
            const status = todayLog[prayer] || 'pending';

            return (
              <div
                key={prayer}
                className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-800/40"
              >
                <div>
                  <span className="text-sm font-semibold text-slate-900 dark:text-white">
                    {prayer}
                  </span>
                  <span className="text-[11px] text-slate-400 block">Obligatory (Fard)</span>
                </div>

                {/* 3 Status Buttons */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onUpdateLog(todayKey, prayer, 'prayed')}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                      status === 'prayed'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Prayed</span>
                  </button>

                  <button
                    onClick={() => onUpdateLog(todayKey, prayer, 'missed')}
                    className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition ${
                      status === 'missed'
                        ? 'bg-rose-600 text-white shadow-sm'
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Missed</span>
                  </button>

                  <button
                    onClick={() => onUpdateLog(todayKey, prayer, 'pending')}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition ${
                      status === 'pending'
                        ? 'bg-slate-300 dark:bg-slate-700 text-slate-800 dark:text-slate-200'
                        : 'bg-white dark:bg-slate-800 text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    Reset
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 7-Day Visual Matrix */}
      <div className="p-5 md:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-x-auto">
        <h2 className="text-base font-semibold text-slate-900 dark:text-white mb-3">
          Weekly Activity Grid
        </h2>

        <table className="w-full text-xs text-left">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400">
              <th className="py-2.5 font-medium">Day</th>
              {prayers.map((p) => (
                <th key={p} className="py-2.5 text-center font-medium">
                  {p}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {past7Days.map(({ dateKey, dayName, dayNumber, isToday }) => {
              const dayRecord = prayerLogs[dateKey] || {};
              return (
                <tr key={dateKey} className={isToday ? 'bg-emerald-50/40 dark:bg-emerald-950/20 font-medium' : ''}>
                  <td className="py-3 text-slate-700 dark:text-slate-300 whitespace-nowrap">
                    {dayName} {dayNumber} {isToday && <span className="text-emerald-600 text-[10px] ml-1">(Today)</span>}
                  </td>
                  {prayers.map((prayer) => {
                    const status = dayRecord[prayer] || 'pending';
                    return (
                      <td key={prayer} className="py-3 text-center">
                        {status === 'prayed' ? (
                          <span className="inline-block w-4 h-4 rounded-full bg-emerald-500" title="Prayed" />
                        ) : status === 'missed' ? (
                          <span className="inline-block w-4 h-4 rounded-full bg-rose-400" title="Missed" />
                        ) : (
                          <span className="inline-block w-4 h-4 rounded-full bg-slate-200 dark:bg-slate-700" title="Pending" />
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
