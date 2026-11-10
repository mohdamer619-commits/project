import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Volume2,
  VolumeX,
  AlertTriangle,
  Sparkles,
  ExternalLink,
  Navigation,
  Clock,
  BookOpen,
  CheckCircle2,
  Bell,
  ArrowRight,
  Palette,
  Radio,
  BookmarkCheck,
  Heart,
  ShieldCheck,
  Moon,
  Smartphone,
  Activity,
} from 'lucide-react';
import {
  DayPrayerSchedule,
  MakruhStatus,
  formatGregorianDate,
  formatHijriDate,
  formatPrayerTime,
} from '../utils/prayerCalc';
import { LocationData, AdhanSetting, SalahName, NotificationPreferences, ColorTheme, VibrationPreferences } from '../types';
import { PrayerCard } from './PrayerCard';
import { SolarProgress } from './SolarProgress';
import { PRAYER_HADITHS } from '../data/prayerHadiths';
import { QURAN_SURAHS } from '../data/quranData';
import { getThemeConfig } from '../data/themeData';
import { CompleteQuranSection } from './CompleteQuranSection';

interface DashboardProps {
  schedule: DayPrayerSchedule;
  location: LocationData;
  adhanSettings: AdhanSetting;
  onToggleMasterAdhan: () => void;
  onTogglePrayerAdhan: (prayer: SalahName) => void;
  makruhStatus: MakruhStatus;
  onOpenMakruhModal: () => void;
  onOpenSettings: (tab?: 'adhan' | 'notifications' | 'vibration' | 'diagnostics' | 'location' | 'appearance') => void;
  onNavigateTab: (tab: string) => void;
  todayLogs: Record<SalahName, 'prayed' | 'missed' | 'pending'>;
  onUpdatePrayerLog: (prayer: SalahName, status: 'prayed' | 'missed' | 'pending') => void;
  warningMinutes: number;
  notificationPrefs: NotificationPreferences;
  vibrationPrefs?: VibrationPreferences;
  theme: ColorTheme;
  onOpenThemeStudio: () => void;
  onOpenAdhanLibrary: () => void;
  bookmarkedAyahs?: string[];
  onToggleBookmark?: (ayahKey: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  schedule,
  location,
  adhanSettings,
  onToggleMasterAdhan,
  onTogglePrayerAdhan,
  makruhStatus,
  onOpenMakruhModal,
  onOpenSettings,
  onNavigateTab,
  todayLogs,
  onUpdatePrayerLog,
  warningMinutes = 15,
  notificationPrefs,
  vibrationPrefs,
  theme,
  onOpenThemeStudio,
  onOpenAdhanLibrary,
  bookmarkedAyahs = [],
  onToggleBookmark = () => {},
}) => {
  const now = new Date();
  const isFriday = now.getDay() === 5; // Jumu'ah
  const gregorianDate = formatGregorianDate(now);
  const [hijriDate, setHijriDate] = useState<string>(() => formatHijriDate(new Date()));

  useEffect(() => {
    const handleOffsetChange = () => {
      setHijriDate(formatHijriDate(new Date()));
    };
    window.addEventListener('nur_hijri_offset_changed', handleOffsetChange);
    return () => window.removeEventListener('nur_hijri_offset_changed', handleOffsetChange);
  }, []);

  const nextPrayer = schedule.nextPrayer;

  // Lightweight 1-second interval for live countdown
  const [secondsRemaining, setSecondsRemaining] = useState<number>(() => {
    if (!nextPrayer) return 0;
    return Math.max(0, Math.floor((nextPrayer.time.getTime() - Date.now()) / 1000));
  });

  useEffect(() => {
    const calculateSeconds = () => {
      if (nextPrayer) {
        const diff = Math.floor((nextPrayer.time.getTime() - Date.now()) / 1000);
        setSecondsRemaining(Math.max(0, diff));
      }
    };
    calculateSeconds();
    const interval = setInterval(calculateSeconds, 1000);
    return () => clearInterval(interval);
  }, [nextPrayer]);

  // Determine approaching salah (Fajr, Dhuhr, Asr, Maghrib, Isha)
  const defaultUpcomingSalah: SalahName = (
    nextPrayer?.id === 'Sunrise' ? 'Dhuhr' : (nextPrayer?.id as SalahName)
  ) || 'Fajr';

  // Selected Prayer Hadith tab (defaults dynamically to the upcoming prayer)
  const [selectedHadithSalah, setSelectedHadithSalah] = useState<SalahName>(defaultUpcomingSalah);

  // Sync selected Hadith if upcoming prayer changes
  useEffect(() => {
    setSelectedHadithSalah(defaultUpcomingSalah);
  }, [defaultUpcomingSalah]);

  const activeHadith = PRAYER_HADITHS[selectedHadithSalah] || PRAYER_HADITHS.Asr;

  // Countdown calculations
  const totalMinutesRemaining = Math.floor(secondsRemaining / 60);
  const hoursLeft = Math.floor(secondsRemaining / 3600);
  const minutesLeft = Math.floor((secondsRemaining % 3600) / 60);
  const secondsLeft = secondsRemaining % 60;

  // Approaching threshold warning condition
  const isApproaching = secondsRemaining > 0 && totalMinutesRemaining <= warningMinutes;
  const isTimeArrived = secondsRemaining <= 0;

  // Natural countdown warning message
  let countdownMessage = '';
  if (isTimeArrived) {
    countdownMessage = 'Prayer time has started — Hayya \'ala al-Salah';
  } else if (isApproaching) {
    countdownMessage = `Hurry! ${nextPrayer?.name} time is approaching`;
  } else {
    countdownMessage = `${nextPrayer?.name} begins in ${hoursLeft > 0 ? `${hoursLeft}h ` : ''}${minutesLeft}m`;
  }

  const dailyVerse = QURAN_SURAHS[0].verses[1]; // Surah Al-Fatihah, verse 2
  const nearbyMosquesUrl = `https://www.google.com/maps/search/mosques/@${location.latitude},${location.longitude},14z`;
  const themeConfig = getThemeConfig(theme);

  return (
    <div className="space-y-6">
      {/* 1. Top Hero Header: Location, Dates & Live Countdown Warning */}
      <div className={`p-6 md:p-8 rounded-3xl transition-all duration-300 relative overflow-hidden shadow-md ${
        isApproaching
          ? 'bg-gradient-to-br from-red-950 via-slate-950 to-red-950 border-2 border-red-500/80 text-white'
          : themeConfig.classes.heroGradient
      }`}>
        {/* Background decorative glow */}
        <div className={`absolute -right-12 -top-12 w-64 h-64 rounded-full border-[20px] pointer-events-none transition-colors ${
          isApproaching ? 'border-red-500/10' : themeConfig.classes.heroBorder
        }`} />

        {/* Top-Right Quick Theme Studio Access Button */}
        <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
          <button
            onClick={onOpenThemeStudio}
            title="Appearance & Themes"
            aria-label="Open Appearance & Themes"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 active:scale-95 text-white text-xs font-semibold backdrop-blur-md border border-white/20 transition shadow-sm"
          >
            <Palette className="w-3.5 h-3.5 text-amber-300" />
            <span className="hidden sm:inline">Appearance & Themes</span>
            <span className="sm:hidden">Themes</span>
          </button>
        </div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6 pt-6 sm:pt-0">
          {/* Location & Dates */}
          <div className="space-y-1.5">
            {/* Location Line */}
            <div className={`flex items-center gap-2 text-xs font-medium ${
              isApproaching ? 'text-red-300' : themeConfig.classes.heroSubtext
            }`}>
              <MapPin className="w-3.5 h-3.5" />
              <span>{location.city}, {location.country}</span>
              <button
                onClick={() => onOpenSettings('location')}
                className="underline hover:text-white transition ml-1"
              >
                (Change)
              </button>
            </div>

            {/* Hijri & Gregorian Dates */}
            <div className="flex flex-wrap items-baseline gap-2">
              <span className="text-xl md:text-2xl font-bold tracking-tight">
                {hijriDate}
              </span>
              <span className="text-xs opacity-80">· {gregorianDate}</span>
            </div>

            {/* Jumma Reminder Notice */}
            {isFriday && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-200 text-xs font-semibold mt-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Jumma Reminder — Reminder to read Surah Kahf & recite Durood upon the Prophet ﷺ</span>
              </div>
            )}
          </div>

          {/* Next Prayer Countdown Spotlight Card */}
          {nextPrayer && (
            <div className={`rounded-2xl p-4 md:p-5 border transition-all duration-300 min-w-[280px] ${
              isApproaching
                ? 'bg-red-600/25 border-red-400 shadow-lg ring-2 ring-red-500/40 backdrop-blur-md'
                : 'bg-white/10 dark:bg-black/30 border-white/15 backdrop-blur-md'
            }`}>
              <div className="flex items-center justify-between gap-2">
                <span className={`text-[11px] uppercase tracking-wider font-bold block ${
                  isApproaching ? 'text-red-300 animate-pulse' : 'text-emerald-200'
                }`}>
                  {isApproaching ? '⚠️ Urgent Prayer Warning' : 'Next Prayer Countdown'}
                </span>
                <span className="text-xs text-slate-300 font-medium">
                  {nextPrayer.timeString}
                </span>
              </div>

              {/* Prominent Warning Message */}
              <div className="mt-1 flex items-baseline justify-between gap-3">
                <h3 className="text-2xl md:text-3xl font-extrabold text-white">
                  {nextPrayer.name}
                </h3>
                <span className={`font-mono text-xl md:text-2xl font-black tabular-nums ${
                  isApproaching ? 'text-red-400 animate-pulse' : 'text-amber-300'
                }`}>
                  {hoursLeft > 0 ? `${hoursLeft.toString().padStart(2, '0')}:` : ''}
                  {minutesLeft.toString().padStart(2, '0')}:
                  {secondsLeft.toString().padStart(2, '0')}
                </span>
              </div>

              {/* Natural status notice */}
              <div className={`mt-2 text-xs font-semibold flex items-center justify-between py-1.5 px-2.5 rounded-lg ${
                isApproaching
                  ? 'bg-red-600 text-white animate-pulse'
                  : 'bg-white/10 text-emerald-100'
              }`}>
                <div className="flex items-center gap-1.5 truncate">
                  {isApproaching && <AlertTriangle className="w-3.5 h-3.5 shrink-0" />}
                  <span className="truncate">{countdownMessage}</span>
                </div>
                {!isTimeArrived && (
                  <span className="tabular-nums font-mono shrink-0 ml-1">
                    {totalMinutesRemaining}m left
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Toolbar: Adhan & Notification Status, Nearby Mosques */}
        <div className="relative z-10 mt-6 pt-4 border-t border-white/15 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onToggleMasterAdhan}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium transition ${
                adhanSettings.enabled
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white/10 text-emerald-200 hover:bg-white/20'
              }`}
            >
              {adhanSettings.enabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
              <span>Auto-Adhan: {adhanSettings.enabled ? 'On' : 'Off'}</span>
            </button>

            <button
              onClick={onOpenAdhanLibrary}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-medium transition"
            >
              <Radio className="w-3.5 h-3.5 text-emerald-300" />
              <span>Adhan Library</span>
            </button>

            <button
              onClick={() => onOpenSettings('notifications')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium transition ${
                notificationPrefs.enabled
                  ? 'bg-white/15 text-white hover:bg-white/25'
                  : 'bg-rose-950/60 text-rose-300 border border-rose-800/60'
              }`}
            >
              <Bell className="w-3.5 h-3.5" />
              <span>Notifications: {notificationPrefs.enabled ? 'Active' : 'Disabled'}</span>
            </button>

            <button
              onClick={() => onOpenSettings('vibration')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium transition ${
                vibrationPrefs?.enabled
                  ? 'bg-white/15 text-white hover:bg-white/25'
                  : 'bg-slate-800/80 text-slate-400'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5 text-indigo-300" />
              <span>Vibration: {vibrationPrefs?.enabled ? 'On' : 'Off'}</span>
            </button>

            <button
              onClick={() => onOpenSettings('diagnostics')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-emerald-200 font-medium transition"
              title="Open Alert System Diagnostics & Real-Time Test Suite"
            >
              <Activity className="w-3.5 h-3.5 text-emerald-300" />
              <span>Diagnostics & Test</span>
            </button>

            {makruhStatus.isMakruhNow && (
              <button
                onClick={onOpenMakruhModal}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-bold animate-pulse"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Prohibited Prayer Time Active</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <a
              href={nearbyMosquesUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-emerald-100 transition"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>Nearby Mosques</span>
              <ExternalLink className="w-3 h-3 ml-0.5" />
            </a>

            <button
              onClick={onOpenMakruhModal}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-emerald-100 transition"
            >
              Makruh Times Guide
            </button>
          </div>
        </div>
      </div>

      {/* 2. Night Sky & Tahajjud Hours (Solar / Lunar Movement Progress) */}
      <SolarProgress schedule={schedule} timezone={location.timezone} />

      {/* 3. Daily Prayer Schedule (Five Daily Prayers Grid) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Daily Prayer Schedule
          </h2>
          <span className="text-xs text-slate-500">
            Single-shadow Asr · Transparent timings
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {schedule.prayerList.map((prayer) => {
            const salahId = prayer.id as SalahName;
            return (
              <PrayerCard
                key={prayer.id}
                prayer={prayer}
                isAdhanActive={adhanSettings.enabled && adhanSettings.prayers[salahId]}
                onToggleAdhan={() => onTogglePrayerAdhan(salahId)}
                loggedStatus={todayLogs[salahId]}
                onUpdateStatus={(status) => onUpdatePrayerLog(salahId, status)}
              />
            );
          })}
        </div>
      </div>

      {/* 4. Pre-Time Hadith (Prayer-Time Hadith Spotlight - changes automatically as prayer approaches) */}
      <div className="p-5 md:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 flex items-center justify-center shrink-0">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Prayer-Time Hadith
                </h2>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400">
                  {selectedHadithSalah === defaultUpcomingSalah ? 'Approaching Prayer' : 'Selected Prayer'}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Authentic narration concerning the significance and rulings of {selectedHadithSalah}
              </p>
            </div>
          </div>

          {/* Interactive tabs to preview Hadith for each prayer */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl overflow-x-auto scrollbar-none self-start md:self-auto">
            {(['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'] as SalahName[]).map((p) => {
              const isSelected = selectedHadithSalah === p;
              const isUpcoming = defaultUpcomingSalah === p;
              return (
                <button
                  key={p}
                  onClick={() => setSelectedHadithSalah(p)}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition whitespace-nowrap ${
                    isSelected
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  <span>{p}</span>
                  {isUpcoming && <span className="ml-1 text-[9px] text-emerald-600 dark:text-emerald-400">●</span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Hadith Title & Urgency Badge */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm md:text-base font-bold text-slate-900 dark:text-white">
            {activeHadith.title}
          </h3>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300">
            {activeHadith.grade}
          </span>
        </div>

        {/* Arabic Text */}
        <div className="text-right py-1" dir="rtl">
          <p className="font-arabic text-xl md:text-2xl text-slate-900 dark:text-slate-100 leading-loose">
            {activeHadith.arabic}
          </p>
        </div>

        {/* English Translation */}
        <p className="text-sm md:text-base text-slate-800 dark:text-slate-200 leading-relaxed font-normal">
          "{activeHadith.english}"
        </p>

        {/* Urgency Context Note */}
        {activeHadith.urgencyNote && (
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{activeHadith.urgencyNote}</span>
          </div>
        )}

        {/* Source Citation & Sunnah.com Link */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
            <span className="font-semibold text-slate-900 dark:text-white">
              {activeHadith.collection}
            </span>
            <span>· Reference #{activeHadith.hadithNumber}</span>
          </div>

          <a
            href={activeHadith.sunnahLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 font-semibold text-emerald-700 dark:text-emerald-400 hover:underline"
          >
            <span>Verify on Sunnah.com</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* 5. Daily Sunnah Adhkar (Four Verified Categories) */}
      <div className="p-5 md:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Daily Sunnah Adhkar
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Four verified categories from primary collections
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('adhkar')}
            className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1"
          >
            <span>Open Adhkar Section</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { id: 'morning_evening', title: 'Morning & Evening', sub: '26 Sunnah Adhkar' },
            { id: 'after_salah', title: 'After Fard Salah', sub: '21 Prescribed Duas' },
            { id: 'before_sleep', title: 'Before Sleeping', sub: '14 Sunnah Practices' },
            { id: 'adhan_to_mosque', title: 'Adhan to Mosque', sub: '21 Journey Stations' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => onNavigateTab('adhkar')}
              className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-800/40 hover:border-emerald-500/50 text-left transition"
            >
              <span className="text-xs font-bold text-slate-900 dark:text-white block">
                {cat.title}
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">
                {cat.sub}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 6. Current Prayer / Voluntary Sunnah Prayers & Family Worship Hub */}
      <div className="p-5 md:p-6 rounded-3xl bg-gradient-to-br from-emerald-950 via-slate-900 to-teal-950 border border-emerald-800/50 text-white shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-emerald-800/40">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-300 shrink-0">
              <BookmarkCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold tracking-tight text-white">
                  Sunnah Rawatib & Voluntary Worship Library
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Sunnah.com Verified
                </span>
              </div>
              <p className="text-xs text-emerald-200/80 mt-0.5">
                The 12 confirmed daily Sunnahs, Duha, Tahajjud vigil, and Prophetic family worship
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('hadith')}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-amber-400 text-slate-950 hover:bg-amber-300 transition shrink-0 self-start sm:self-auto shadow-sm"
          >
            <span>Open Central Library</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Highlight Stats: Palace in Paradise */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1">
            <div className="flex items-center justify-between text-amber-300 font-bold text-[11px]">
              <span>12 Daily Rawatib Palace</span>
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <p className="text-white font-medium">
              2 Fajr · 4 Dhuhr · 2 Dhuhr · 2 Maghrib · 2 Isha
            </p>
            <span className="text-[10px] text-emerald-300/80 block">
              Direct promise: House built in Jannah (Muslim 728a)
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1">
            <div className="flex items-center justify-between text-teal-300 font-bold text-[11px]">
              <span>Duha / Ishraq Forenoon</span>
              <Clock className="w-3.5 h-3.5" />
            </div>
            <p className="text-white font-medium">
              Starts {formatPrayerTime(new Date(schedule.sunrise.getTime() + 18 * 60000), location.timezone)} · Ends {formatPrayerTime(new Date(schedule.dhuhr.getTime() - 15 * 60000), location.timezone)}
            </p>
            <span className="text-[10px] text-emerald-300/80 block">
              Suffices charity for all 360 joints (Muslim 720)
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1">
            <div className="flex items-center justify-between text-indigo-300 font-bold text-[11px]">
              <span>Tahajjud & Night Vigil</span>
              <Moon className="w-3.5 h-3.5" />
            </div>
            <p className="text-white font-medium">
              Last Third starts at {formatPrayerTime(schedule.lastThirdOfTheNight, location.timezone)}
            </p>
            <span className="text-[10px] text-emerald-300/80 block">
              Divine Descent & Answered Du’a (Bukhari 1145)
            </span>
          </div>
        </div>

        {/* Topic Quick-Access Pills */}
        <div className="flex flex-wrap gap-2 pt-1 text-xs">
          {[
            { label: '4 Before & 4 After Dhuhr (Fire Protection)', ref: 'Abu Dawud 1269' },
            { label: '4 Before Asr (Divine Mercy)', ref: 'Tirmidhi 430' },
            { label: 'Salat al-Istikhara Guide', ref: 'Bukhari 1166' },
            { label: 'Teaching Children to Pray', ref: 'Abu Dawud 495' },
            { label: 'Spousal Night Vigil', ref: 'Abu Dawud 1309' },
          ].map((pill, idx) => (
            <button
              key={idx}
              onClick={() => onNavigateTab('hadith')}
              className="px-3 py-1 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-emerald-100 text-[11px] font-medium transition flex items-center gap-1.5"
            >
              <span>{pill.label}</span>
              <span className="text-[9px] text-amber-300/90 font-mono">[{pill.ref}]</span>
            </button>
          ))}
        </div>
      </div>

      {/* 7. Quran Section: Complete Verified Quran Reader */}
      <CompleteQuranSection
        bookmarkedAyahs={bookmarkedAyahs}
        onToggleBookmark={onToggleBookmark}
        dailyVerse={dailyVerse}
      />
    </div>
  );
};
