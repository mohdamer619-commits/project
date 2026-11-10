import React, { useState, useEffect } from 'react';
import {
  X,
  MapPin,
  Volume2,
  Play,
  Square,
  Bell,
  Palette,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  Check,
  Clock,
  BellOff,
  BellRing,
  Smartphone,
  Monitor,
  Apple,
  Download,
  Info,
  Activity,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Timer,
  Zap,
} from 'lucide-react';
import {
  LocationData,
  CalculationMethodKey,
  AdhanSetting,
  ColorTheme,
  ThemeMode,
  AdhanAudioId,
  NotificationPreferences,
  SalahName,
  ReminderTiming,
  VibrationPreferences,
  VibrationPatternType,
} from '../types';
import { WORLD_CITIES } from '../data/cities';
import { ADHAN_OPTIONS, adhanPlayer, unlockAudioEngine } from '../utils/audioManager';
import { notificationScheduler, AlertDiagnosticReport } from '../utils/notifications';
import { vibrationManager } from '../utils/vibrationManager';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { THEME_LIST, getThemeConfig } from '../data/themeData';
import { getSavedHijriOffset, saveHijriOffset, calculateHijriDate } from '../utils/prayerCalc';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'adhan' | 'notifications' | 'vibration' | 'diagnostics' | 'location' | 'appearance' | 'platforms';
  location: LocationData;
  onUpdateLocation: (newLoc: LocationData) => void;
  calculationMethod: CalculationMethodKey;
  onUpdateCalculationMethod: (method: CalculationMethodKey) => void;
  adhanSettings: AdhanSetting;
  onUpdateAdhanSettings: (newSettings: AdhanSetting) => void;
  notificationPrefs: NotificationPreferences;
  onUpdateNotificationPrefs: (newPrefs: NotificationPreferences) => void;
  vibrationPrefs?: VibrationPreferences;
  onUpdateVibrationPrefs?: (newPrefs: VibrationPreferences) => void;
  warningMinutes: number;
  onUpdateWarningMinutes: (minutes: number) => void;
  theme: ColorTheme;
  onUpdateTheme: (newTheme: ColorTheme) => void;
  themeMode?: ThemeMode;
  onUpdateThemeMode?: (mode: ThemeMode) => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenThemeStudio?: () => void;
  onOpenAdhanLibrary?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'adhan',
  location,
  onUpdateLocation,
  calculationMethod,
  onUpdateCalculationMethod,
  adhanSettings,
  onUpdateAdhanSettings,
  notificationPrefs,
  onUpdateNotificationPrefs,
  vibrationPrefs,
  onUpdateVibrationPrefs,
  warningMinutes,
  onUpdateWarningMinutes,
  theme,
  onUpdateTheme,
  themeMode = 'system',
  onUpdateThemeMode,
  darkMode,
  onToggleDarkMode,
  onOpenThemeStudio,
  onOpenAdhanLibrary,
}) => {
  const { isInstallable, isInstalled, isIOS, isAndroid, isWindows, platform, install } =
    usePWAInstall();
  const [activeTab, setActiveTab] = useState<
    'adhan' | 'notifications' | 'vibration' | 'diagnostics' | 'location' | 'appearance' | 'platforms'
  >(initialTab);

  useEffect(() => {
    if (isOpen && initialTab) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  const [isDetectingGPS, setIsDetectingGPS] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(adhanPlayer.isPlaying());
  const [activePlayingId, setActivePlayingId] = useState<AdhanAudioId | null>(
    adhanPlayer.getActiveId()
  );

  // Live alert system diagnostics
  const [diagnostics, setDiagnostics] = useState<AlertDiagnosticReport>(() =>
    notificationScheduler.getDiagnosticReport()
  );
  const [testFeedback, setTestFeedback] = useState<string | null>(null);
  const [hijriOffset, setHijriOffsetState] = useState<number>(() => getSavedHijriOffset());

  const handleUpdateHijriOffset = (offset: number) => {
    saveHijriOffset(offset);
    setHijriOffsetState(offset);
    window.dispatchEvent(new Event('nur_hijri_offset_changed'));
  };

  useEffect(() => {
    return notificationScheduler.subscribeDiagnostics((report) => {
      setDiagnostics(report);
    });
  }, []);

  useEffect(() => {
    return adhanPlayer.subscribe((playing, id) => {
      setIsPlaying(playing);
      setActivePlayingId(id);
    });
  }, []);

  if (!isOpen) return null;

  // Real GPS detection
  const handleDetectGPS = () => {
    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by your browser.');
      return;
    }
    setIsDetectingGPS(true);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsDetectingGPS(false);
        const { latitude, longitude } = pos.coords;
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
        onUpdateLocation({
          city: 'Current GPS Location',
          country: 'Auto-detected',
          latitude,
          longitude,
          timezone,
          isManual: false,
        });
      },
      (err) => {
        setIsDetectingGPS(false);
        if (err.code === 1) {
          setGpsError('Location permission was denied. Please select a city manually below.');
        } else {
          setGpsError('Unable to retrieve GPS coordinates. Please select a city manually below.');
        }
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Preview Audio
  const handleTogglePreview = async (audioId: AdhanAudioId) => {
    if (activePlayingId === audioId && isPlaying) {
      adhanPlayer.stop();
    } else {
      await adhanPlayer.play(audioId, adhanSettings.volume);
    }
  };

  const handleRequestNotification = async () => {
    const status = await notificationScheduler.requestPermission();
    if (status === 'granted') {
      alert('Notification permission granted! Sensible, non-intrusive reminders are now active.');
    } else {
      alert('Notification permission was not granted by your browser.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-2xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 md:p-7 space-y-6 my-8 max-h-[90vh] overflow-y-auto">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Application Settings
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Configure authentic Adhan audio, prayer notification reminders, and location
            </p>
          </div>
          <button
            onClick={() => {
              adhanPlayer.stop();
              onClose();
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('adhan')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold rounded-xl transition whitespace-nowrap ${
              activeTab === 'adhan'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Volume2 className="w-4 h-4" />
            <span>Adhan Audio</span>
          </button>

          <button
            onClick={() => setActiveTab('notifications')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold rounded-xl transition whitespace-nowrap ${
              activeTab === 'notifications'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Bell className="w-4 h-4" />
            <span>Notifications</span>
          </button>

          <button
            onClick={() => setActiveTab('vibration')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold rounded-xl transition whitespace-nowrap ${
              activeTab === 'vibration'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>Vibration</span>
          </button>

          <button
            onClick={() => setActiveTab('diagnostics')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold rounded-xl transition whitespace-nowrap ${
              activeTab === 'diagnostics'
                ? 'bg-emerald-600 text-white shadow-sm font-bold'
                : 'text-emerald-700 dark:text-emerald-400 hover:text-emerald-900 dark:hover:text-emerald-200'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Diagnostics & Tests</span>
          </button>

          <button
            onClick={() => setActiveTab('location')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold rounded-xl transition whitespace-nowrap ${
              activeTab === 'location'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>Location & Calc</span>
          </button>

          <button
            onClick={() => setActiveTab('appearance')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold rounded-xl transition whitespace-nowrap ${
              activeTab === 'appearance'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Palette className="w-4 h-4" />
            <span>Themes</span>
          </button>

          <button
            onClick={() => setActiveTab('platforms')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold rounded-xl transition whitespace-nowrap ${
              activeTab === 'platforms'
                ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>Platforms & About</span>
          </button>
        </div>

        {/* TAB 1: ADHAN AUDIO SETTINGS */}
        {activeTab === 'adhan' && (
          <div className="space-y-6">
            {/* Master Toggle */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-sm font-bold text-slate-900 dark:text-white block">
                  Automatic Adhan Playback
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 block">
                  Calls the full vocal Adhan automatically when prayer time begins
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={adhanSettings.enabled}
                  onChange={(e) =>
                    onUpdateAdhanSettings({ ...adhanSettings, enabled: e.target.checked })
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600" />
              </label>
            </div>

            {/* Quick Access to Expanded Adhan Library */}
            {onOpenAdhanLibrary && (
              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-600/15 via-teal-600/10 to-transparent border border-emerald-500/30 flex items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 block">
                    🕌 Expanded Adhan Library
                  </span>
                  <span className="text-[11px] text-slate-600 dark:text-slate-300 block mt-0.5">
                    Browse authentic recordings from Makkah, Madinah, and Sheikh Mishary Rashid Alafasy, or assign separate recordings per prayer.
                  </span>
                </div>
                <button
                  onClick={() => {
                    onClose();
                    onOpenAdhanLibrary();
                  }}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shrink-0 shadow-xs transition"
                >
                  Open Library
                </button>
              </div>
            )}

            {/* Quick Link to Diagnostics & Health Suite */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-teal-500/10 via-emerald-500/10 to-transparent border border-emerald-500/25 flex items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 block">
                  🔍 Alert System Diagnostics & Testing
                </span>
                <span className="text-[11px] text-slate-600 dark:text-slate-300 block mt-0.5">
                  Verify notification permissions, Service Worker, device vibration, and authentic vocal Adhan audio playback.
                </span>
              </div>
              <button
                onClick={() => setActiveTab('diagnostics')}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shrink-0 shadow-xs transition"
              >
                Run Diagnostics
              </button>
            </div>

            {/* Individual Prayer Toggles */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Enable Adhan for Each Prayer
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {(['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'] as SalahName[]).map((prayer) => {
                  const isActive = adhanSettings.prayers[prayer];
                  return (
                    <button
                      key={prayer}
                      onClick={() =>
                        onUpdateAdhanSettings({
                          ...adhanSettings,
                          prayers: {
                            ...adhanSettings.prayers,
                            [prayer]: !isActive,
                          },
                        })
                      }
                      className={`p-3 rounded-xl border text-center transition ${
                        isActive
                          ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 font-semibold'
                          : 'border-slate-200 dark:border-slate-800 text-slate-400 bg-slate-50 dark:bg-slate-900'
                      }`}
                    >
                      <span className="text-xs block">{prayer}</span>
                      <span className="text-[10px] mt-1 block">
                        {isActive ? 'Active' : 'Off'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Audio Reciter Selection */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                  Authentic Full Vocal Adhan Recordings
                </span>
                <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">
                  100% Vocal · No Synthesized Music
                </span>
              </div>

              <div className="space-y-2">
                {ADHAN_OPTIONS.map((opt) => {
                  const isSelected = adhanSettings.selectedAudio === opt.id;
                  const isAudioPreviewing = activePlayingId === opt.id && isPlaying;

                  return (
                    <div
                      key={opt.id}
                      className={`p-3.5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-50/60 dark:bg-emerald-950/30 ring-1 ring-emerald-500/30'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
                      }`}
                    >
                      <div
                        className="flex-1 cursor-pointer"
                        onClick={() =>
                          onUpdateAdhanSettings({ ...adhanSettings, selectedAudio: opt.id })
                        }
                      >
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs md:text-sm font-semibold text-slate-900 dark:text-white">
                            {opt.name}
                          </span>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                            {opt.type === 'youtube' ? 'YouTube Vocal Recording' : 'Authentic Vocal MP3'}
                          </span>
                        </div>
                        <span className="text-xs text-slate-500 block mt-0.5">· {opt.reciter} ({opt.location})</span>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                          {opt.description}
                        </p>
                        {opt.youtubeUrl && (
                          <a
                            href={opt.youtubeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] text-red-600 dark:text-red-400 font-medium hover:underline mt-1"
                          >
                            <span>Watch Muhammad Marwan Qassas on YouTube</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {/* Preview button */}
                        <button
                          onClick={() => handleTogglePreview(opt.id)}
                          className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                            isAudioPreviewing
                              ? 'bg-amber-600 text-white'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                          }`}
                        >
                          {isAudioPreviewing ? (
                            <>
                              <Square className="w-3 h-3 fill-white" />
                              <span>Stop</span>
                            </>
                          ) : (
                            <>
                              <Play className="w-3 h-3" />
                              <span>Preview</span>
                            </>
                          )}
                        </button>

                        {/* Select radio */}
                        <button
                          onClick={() =>
                            onUpdateAdhanSettings({ ...adhanSettings, selectedAudio: opt.id })
                          }
                          className={`w-6 h-6 rounded-full flex items-center justify-center border transition ${
                            isSelected
                              ? 'border-emerald-600 bg-emerald-600 text-white'
                              : 'border-slate-300 dark:border-slate-700'
                          }`}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Volume Slider */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                <span className="flex items-center gap-1.5">
                  <Volume2 className="w-4 h-4 text-slate-400" />
                  <span>Adhan Volume</span>
                </span>
                <span className="font-mono tabular-nums">{Math.round(adhanSettings.volume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={adhanSettings.volume}
                onChange={(e) =>
                  onUpdateAdhanSettings({ ...adhanSettings, volume: parseFloat(e.target.value) })
                }
                className="w-full accent-emerald-600 cursor-pointer"
              />
            </div>
          </div>
        )}

        {/* TAB 2: DEDICATED PRAYER NOTIFICATIONS SETTINGS */}
        {activeTab === 'notifications' && (
          <div className="space-y-6">
            {/* Master Notification Toggle */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-sm font-bold text-slate-900 dark:text-white block">
                  Prayer Notifications & Reminders
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 block">
                  Master switch to enable or disable all scheduled device notifications
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notificationPrefs.enabled}
                  onChange={(e) =>
                    onUpdateNotificationPrefs({ ...notificationPrefs, enabled: e.target.checked })
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600" />
              </label>
            </div>

            {/* Instant Mute Action */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <div className="text-xs">
                <span className="font-semibold text-slate-900 dark:text-white block">
                  Instant Mute / Silence Reminders
                </span>
                <span className="text-slate-500 dark:text-slate-400 text-[11px]">
                  Disables all reminders without affecting prayer timings or in-app countdowns
                </span>
              </div>
              <button
                onClick={() =>
                  onUpdateNotificationPrefs({ ...notificationPrefs, enabled: false })
                }
                disabled={!notificationPrefs.enabled}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition disabled:opacity-40"
              >
                <BellOff className="w-3.5 h-3.5" />
                <span>Disable All</span>
              </button>
            </div>

            {/* Individual Prayer Notification Toggles */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Enable Notifications per Prayer
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {(['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'] as SalahName[]).map((prayer) => {
                  const isActive = notificationPrefs.prayers[prayer];
                  return (
                    <button
                      key={prayer}
                      onClick={() =>
                        onUpdateNotificationPrefs({
                          ...notificationPrefs,
                          prayers: {
                            ...notificationPrefs.prayers,
                            [prayer]: !isActive,
                          },
                        })
                      }
                      className={`p-3 rounded-xl border text-center transition ${
                        isActive && notificationPrefs.enabled
                          ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 font-semibold'
                          : 'border-slate-200 dark:border-slate-800 text-slate-400 bg-slate-50 dark:bg-slate-900'
                      }`}
                    >
                      <span className="text-xs block">{prayer}</span>
                      <span className="text-[10px] mt-1 block">
                        {isActive && notificationPrefs.enabled ? 'Enabled' : 'Off'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Reminder Timing Preference */}
            <div className="space-y-2.5">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Reminder Timing
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {[
                  { id: 'both' as ReminderTiming, title: 'Both (Recommended)', desc: 'Before & at prayer time' },
                  { id: 'before_time' as ReminderTiming, title: 'Before Prayer Only', desc: 'Advance preparation alert' },
                  { id: 'at_time' as ReminderTiming, title: 'At Prayer Time Only', desc: 'Alert when prayer begins' },
                ].map((item) => {
                  const isSelected = notificationPrefs.timing === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() =>
                        onUpdateNotificationPrefs({ ...notificationPrefs, timing: item.id })
                      }
                      className={`p-3 rounded-2xl border text-left transition ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-50/60 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 font-semibold'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <span className="text-xs block font-bold">{item.title}</span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">{item.desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Configurable Advance Reminder Interval */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span>Advance Reminder Interval</span>
                </span>
                <span className="font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
                  {notificationPrefs.beforeMinutes} minutes before
                </span>
              </div>
              <div className="flex items-center gap-2 pt-1">
                {[5, 10, 15, 20, 30].map((mins) => (
                  <button
                    key={mins}
                    onClick={() =>
                      onUpdateNotificationPrefs({ ...notificationPrefs, beforeMinutes: mins })
                    }
                    className={`flex-1 py-1.5 rounded-xl text-xs font-semibold transition ${
                      notificationPrefs.beforeMinutes === mins
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                    }`}
                  >
                    {mins}m
                  </button>
                ))}
              </div>
            </div>

            {/* Configurable In-App Red Warning Threshold */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                <span className="flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-rose-500" />
                  <span>In-App Red Warning Countdown Threshold</span>
                </span>
                <span className="font-mono tabular-nums text-rose-600 dark:text-rose-400">
                  {warningMinutes} minutes remaining
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                When the upcoming prayer is within this time, the countdown turns red with "Hurry! [Prayer] is approaching".
              </p>
              <div className="flex items-center gap-2 pt-1">
                {[5, 10, 15, 20, 30].map((mins) => (
                  <button
                    key={mins}
                    onClick={() => onUpdateWarningMinutes(mins)}
                    className={`flex-1 py-1.5 rounded-xl text-xs font-semibold transition ${
                      warningMinutes === mins
                        ? 'bg-rose-600 text-white shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                    }`}
                  >
                    {mins}m
                  </button>
                ))}
              </div>
            </div>

            {/* Anti-Spam Guarantee & Do Not Disturb Notice */}
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-950 dark:text-emerald-200 space-y-1.5 leading-relaxed">
              <div className="flex items-center gap-1.5 font-bold">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Anti-Spam & Battery Protection Guarantee</span>
              </div>
              <p>
                Nur al-Salat never sends repeated countdown notifications every minute. It triggers only the single reminder you explicitly scheduled (one advance reminder and/or one at prayer time).
              </p>
              <p>
                Notifications respect your device's <strong>Do Not Disturb</strong> and silent profiles.
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
                <button
                  onClick={handleRequestNotification}
                  className="w-full sm:flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs transition shadow-2xs"
                >
                  <BellRing className="w-3.5 h-3.5" />
                  <span>Request / Test Device Permission</span>
                </button>
                <button
                  onClick={() => setActiveTab('diagnostics')}
                  className="w-full sm:flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-emerald-500/40 text-emerald-800 dark:text-emerald-300 font-semibold text-xs transition hover:bg-emerald-50 dark:hover:bg-slate-700"
                >
                  <Activity className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Run Live System Diagnostics</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB: INDEPENDENT PRAYER-TIME VIBRATION SETTINGS */}
        {activeTab === 'vibration' && (
          <div className="space-y-6">
            {/* Master Vibration Toggle */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Prayer-Time Haptic Vibration
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Vibrates your phone when prayer time arrives, even if device is set to silent or Do Not Disturb
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  if (onUpdateVibrationPrefs && vibrationPrefs) {
                    const next = !vibrationPrefs.enabled;
                    onUpdateVibrationPrefs({ ...vibrationPrefs, enabled: next });
                    if (next) vibrationManager.test(vibrationPrefs.pattern);
                  }
                }}
                className={`px-4 py-2 text-xs font-semibold rounded-xl transition shadow-sm ${
                  vibrationPrefs?.enabled
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                {vibrationPrefs?.enabled ? 'Vibration: On' : 'Vibration: Off'}
              </button>
            </div>

            {/* Test Haptics Button */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200/80 dark:border-indigo-800/50">
              <div className="text-xs text-indigo-950 dark:text-indigo-200">
                <span className="font-bold block">Feel Your Phone's Haptic Response</span>
                <span className="text-[11px] text-indigo-800 dark:text-indigo-300">
                  Hardware Vibration API: {vibrationManager.isSupported() ? 'Supported on this device' : 'Active via Android ServiceWorker'}
                </span>
              </div>
              <button
                onClick={() => {
                  vibrationManager.test(vibrationPrefs?.pattern || 'standard');
                }}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-sm transition"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Test Vibration Now</span>
              </button>
            </div>

            {/* Individual Prayer Vibration Toggles */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Enable Vibration per Prayer
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {(['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'] as SalahName[]).map((prayer) => {
                  const isActive = vibrationPrefs ? vibrationPrefs.prayers[prayer] : true;
                  return (
                    <button
                      key={prayer}
                      onClick={() => {
                        if (onUpdateVibrationPrefs && vibrationPrefs) {
                          onUpdateVibrationPrefs({
                            ...vibrationPrefs,
                            prayers: {
                              ...vibrationPrefs.prayers,
                              [prayer]: !isActive,
                            },
                          });
                          vibrationManager.test(vibrationPrefs.pattern);
                        }
                      }}
                      className={`p-3 rounded-xl border text-center transition ${
                        isActive && vibrationPrefs?.enabled
                          ? 'border-indigo-500 bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200 font-semibold'
                          : 'border-slate-200 dark:border-slate-800 text-slate-400 bg-slate-50 dark:bg-slate-900'
                      }`}
                    >
                      <span className="text-xs block">{prayer}</span>
                      <span className="text-[10px] mt-1 block">
                        {isActive && vibrationPrefs?.enabled ? 'Vibrates' : 'Off'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Vibration Pattern Selector */}
            <div className="space-y-2.5">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Vibration Haptic Pattern
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {[
                  {
                    id: 'standard' as VibrationPatternType,
                    title: 'Standard Islamic Cadence',
                    desc: 'Three distinct 500ms pulses with 250ms pauses',
                    timing: '500ms · 250ms · 500ms · 250ms · 500ms',
                  },
                  {
                    id: 'gentle' as VibrationPatternType,
                    title: 'Gentle / Discreet',
                    desc: 'Two soft 200ms pulses ideal for work or masjid',
                    timing: '200ms · 150ms · 200ms',
                  },
                  {
                    id: 'pulse' as VibrationPatternType,
                    title: 'Rhythmic Pulse',
                    desc: 'Syncopated cadence alerting without harshness',
                    timing: '150ms · 100ms · 150ms · 300ms · 150ms',
                  },
                  {
                    id: 'urgent' as VibrationPatternType,
                    title: 'Urgent / Continuous',
                    desc: 'Prominent long 1-second pulses to ensure wakefulness',
                    timing: '1000ms · 300ms · 1000ms · 300ms · 1000ms',
                  },
                ].map((item) => {
                  const isSelected = (vibrationPrefs?.pattern || 'standard') === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        if (onUpdateVibrationPrefs && vibrationPrefs) {
                          onUpdateVibrationPrefs({ ...vibrationPrefs, pattern: item.id });
                          vibrationManager.test(item.id);
                        }
                      }}
                      className={`p-3.5 rounded-2xl border text-left transition ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200 font-semibold ring-1 ring-indigo-500/20'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold block">{item.title}</span>
                        {isSelected && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-600 text-white">
                            Selected
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-1">
                        {item.desc}
                      </span>
                      <span className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400 block mt-1">
                        {item.timing}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Advance Reminder Vibration Checkbox */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white block">
                  Vibrate for Advance Reminder
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">
                  Send a gentle haptic pulse when the advance preparation reminder fires
                </span>
              </div>

              <input
                type="checkbox"
                checked={vibrationPrefs?.vibrateBefore ?? false}
                onChange={(e) => {
                  if (onUpdateVibrationPrefs && vibrationPrefs) {
                    onUpdateVibrationPrefs({
                      ...vibrationPrefs,
                      vibrateBefore: e.target.checked,
                    });
                  }
                }}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
              />
            </div>

            {/* Full Alarm Pipeline Test Button */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-indigo-500/10 to-teal-500/10 border border-indigo-500/20 text-xs space-y-2">
              <span className="font-bold text-slate-900 dark:text-white block">
                Full Prayer Alarm Verification (Sound + Notification + Haptic)
              </span>
              <p className="text-slate-600 dark:text-slate-300">
                Trigger a complete live simulation of the prayer-time alarm on your current device to verify that audio plays, vibration activates, and notification delivers.
              </p>
              <button
                onClick={() => {
                  if (vibrationPrefs) {
                    notificationScheduler.testAlarmSystem(adhanSettings, vibrationPrefs);
                  }
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>Trigger Complete Alarm Pipeline Test</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB: DIAGNOSTICS & ALERT SYSTEM VERIFICATION */}
        {activeTab === 'diagnostics' && (
          <div className="space-y-6">
            {/* Header description */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-transparent border border-emerald-500/20">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Live Alert System Diagnostics & Real-Time Test Suite
                </h3>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                Verify that notifications, haptic vibration, and Adhan audio triggers work properly on this specific browser and operating system.
              </p>
            </div>

            {/* Test Feedback Banner */}
            {testFeedback && (
              <div className="p-3.5 rounded-2xl bg-emerald-600 text-white text-xs font-semibold flex items-center justify-between shadow-md animate-fade-in">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{testFeedback}</span>
                </div>
                <button
                  onClick={() => setTestFeedback(null)}
                  className="p-1 rounded-lg hover:bg-white/20 text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* 10 Live Diagnostic Health Status Indicators */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                  10 Live Diagnostic Health Indicators
                </span>
                <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                  Real-time System Verification
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* 1. Notification Permission */}
                <div className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <Bell className="w-4 h-4 text-slate-500" />
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        1. Notification Permission
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 block">
                      OS permission status: {diagnostics.rawPermission}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        diagnostics.notificationPermission === 'Enabled'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                      }`}
                    >
                      {diagnostics.notificationPermission}
                    </span>
                    {diagnostics.notificationPermission !== 'Enabled' && (
                      <button
                        onClick={async () => {
                          const res = await notificationScheduler.requestPermission();
                          setTestFeedback(`Notification permission requested: ${res}`);
                        }}
                        className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-emerald-600 hover:bg-emerald-700 text-white transition shadow-2xs"
                      >
                        Authorize
                      </button>
                    )}
                  </div>
                </div>

                {/* 2. Notification Scheduling */}
                <div className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-slate-500" />
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        2. Notification Scheduling
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 block">
                      Autonomous background timer loop
                    </span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                      diagnostics.notificationScheduling === 'Active'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : diagnostics.notificationScheduling === 'Disabled'
                        ? 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
                        : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                    }`}
                  >
                    {diagnostics.notificationScheduling}
                  </span>
                </div>

                {/* 3. Service Worker */}
                <div className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <Smartphone className="w-4 h-4 text-slate-500" />
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        3. Service Worker
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 block">
                      Background PWA execution engine
                    </span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                      diagnostics.serviceWorker === 'Active'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : diagnostics.serviceWorker === 'Not applicable'
                        ? 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                    }`}
                  >
                    {diagnostics.serviceWorker}
                  </span>
                </div>

                {/* 4. Vibration */}
                <div className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <Zap className="w-4 h-4 text-indigo-500" />
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        4. Vibration
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 block">
                      Haptic motor web API access
                    </span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                      diagnostics.vibration === 'Available'
                        ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300'
                        : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
                    }`}
                  >
                    {diagnostics.vibration}
                  </span>
                </div>

                {/* 5. Adhan Audio */}
                <div className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <Volume2 className="w-4 h-4 text-emerald-500" />
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        5. Adhan Audio
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 block">
                      Authentic vocal audio files loaded
                    </span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                      diagnostics.adhanAudio === 'Loaded'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                    }`}
                  >
                    {diagnostics.adhanAudio}
                  </span>
                </div>

                {/* 6. Background Execution */}
                <div className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <Activity className="w-4 h-4 text-slate-500" />
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        6. Background Execution
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 block">
                      Operating system wake capability
                    </span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                      diagnostics.backgroundExecution === 'Supported'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                    }`}
                  >
                    {diagnostics.backgroundExecution}
                  </span>
                </div>

                {/* 7. Next Scheduled Prayer & Time */}
                <div className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between gap-3 sm:col-span-2">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-emerald-600" />
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        7. Next Scheduled Prayer & Time
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 block">
                      Target trigger for upcoming prayer
                    </span>
                  </div>
                  <span className="text-xs font-bold font-mono text-emerald-700 dark:text-emerald-300 text-right">
                    {diagnostics.nextScheduledPrayer
                      ? `${diagnostics.nextScheduledPrayer.name} at ${diagnostics.nextScheduledPrayer.timeString} (in ${Math.floor(diagnostics.nextScheduledPrayer.msRemaining / 3600000)}h ${Math.floor((diagnostics.nextScheduledPrayer.msRemaining % 3600000) / 60000)}m)`
                      : 'None scheduled'}
                  </span>
                </div>

                {/* 8. Last Scheduling Attempt */}
                <div className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-slate-900 dark:text-white block">
                      8. Last Scheduling Attempt
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      Scheduler initialization time
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-600 dark:text-slate-300 font-semibold">
                    {diagnostics.lastSchedulingAttempt
                      ? diagnostics.lastSchedulingAttempt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
                      : 'Active on launch'}
                  </span>
                </div>

                {/* 9. Last Notification Delivery */}
                <div className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-slate-900 dark:text-white block">
                      9. Last Notification Delivery
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      Most recent system notification
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-600 dark:text-slate-300 font-semibold truncate max-w-[150px] text-right">
                    {diagnostics.lastNotificationDelivery
                      ? `${diagnostics.lastNotificationDelivery.prayerName} (${diagnostics.lastNotificationDelivery.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`
                      : 'None yet today'}
                  </span>
                </div>

                {/* 10. Last Successful Adhan Playback */}
                <div className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-slate-900 dark:text-white block">
                      10. Last Successful Adhan Playback
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      Most recent vocal Adhan call
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-600 dark:text-slate-300 font-semibold truncate max-w-[150px] text-right">
                    {diagnostics.lastSuccessfulAdhanPlayback
                      ? `${diagnostics.lastSuccessfulAdhanPlayback.name} (${diagnostics.lastSuccessfulAdhanPlayback.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`
                      : 'None yet today'}
                  </span>
                </div>

                {/* 11. Last Error, if any */}
                <div className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-slate-900 dark:text-white block">
                      Last Error Status
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      Background alert engine exceptions
                    </span>
                  </div>
                  <span className={`text-[11px] font-mono font-semibold truncate max-w-[150px] text-right ${
                    diagnostics.lastError ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
                  }`}>
                    {diagnostics.lastError ? diagnostics.lastError : 'None (System nominal)'}
                  </span>
                </div>
              </div>
            </div>

            {/* Screen Wake Lock / Keep-Alive Switch (Home & Mosque Display Mode) */}
            {diagnostics.wakeLockSupported && (
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-1.5">
                    <Monitor className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      Screen Keep-Alive (Masjid & Nightstand Clock Mode)
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">
                    Prevents the phone display from sleeping, guaranteeing 100% precision execution without background throttling.
                  </span>
                </div>

                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={diagnostics.wakeLockActive}
                    onChange={(e) => {
                      notificationScheduler.toggleWakeLock(e.target.checked);
                      setTestFeedback(
                        e.target.checked
                          ? 'Screen Keep-Alive activated. Phone screen will remain on.'
                          : 'Screen Keep-Alive released.'
                      );
                    }}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600" />
                </label>
              </div>
            )}

            {/* 6 Functional Diagnostic Action & Test Buttons */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                  6 Functional Diagnostic Test Buttons
                </span>
                <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                  Click to test each alert subsystem
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                {/* 1. Test Notification */}
                <button
                  onClick={async () => {
                    const ok = await notificationScheduler.testNotification();
                    setTestFeedback(
                      ok
                        ? 'Notification dispatched! Check your system notification shade/drawer.'
                        : 'Notification blocked or permission denied. Please click "Authorize" above.'
                    );
                  }}
                  className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-emerald-500 dark:hover:border-emerald-500 transition text-left flex items-center justify-between group shadow-2xs"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                      <Bell className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-900 dark:text-white block">
                        1. Test Notification
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        Fajr notification test
                      </span>
                    </div>
                  </div>
                  <Play className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 transition shrink-0" />
                </button>

                {/* 2. Test Vibration */}
                <button
                  onClick={() => {
                    const ok = notificationScheduler.testVibration();
                    setTestFeedback(
                      ok
                        ? `Vibration cadence (${vibrationPrefs?.pattern || 'standard'}) triggered.`
                        : 'Vibration API unavailable on this browser/desktop.'
                    );
                  }}
                  className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-500 dark:hover:border-indigo-500 transition text-left flex items-center justify-between group shadow-2xs"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                      <Zap className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-900 dark:text-white block">
                        2. Test Vibration
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        Device haptic pulse
                      </span>
                    </div>
                  </div>
                  <Play className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 transition shrink-0" />
                </button>

                {/* 3. Test Selected Adhan */}
                <button
                  onClick={async () => {
                    const ok = await notificationScheduler.testSelectedAdhan();
                    setTestFeedback(
                      ok
                        ? 'Playing selected vocal Adhan. Tap stop button if needed.'
                        : 'Audio context blocked. Tap Unlock Audio first.'
                    );
                  }}
                  className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-amber-500 dark:hover:border-amber-500 transition text-left flex items-center justify-between group shadow-2xs"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                      <Volume2 className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-900 dark:text-white block">
                        3. Test Selected Adhan
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        Plays authentic vocal call
                      </span>
                    </div>
                  </div>
                  <Play className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-600 transition shrink-0" />
                </button>

                {/* 4. Schedule Test Alert in 2 Minutes */}
                <button
                  onClick={() => {
                    notificationScheduler.scheduleTestAlert2Minutes();
                    setTestFeedback('Test alert scheduled for 2 minutes from now. You can lock your phone or switch apps now!');
                  }}
                  className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-emerald-500 dark:hover:border-emerald-500 transition text-left flex items-center justify-between group shadow-2xs"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                      <Timer className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-900 dark:text-white block">
                        4. Test in 2 Minutes
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        Lock phone to verify
                      </span>
                    </div>
                  </div>
                  <Play className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 transition shrink-0" />
                </button>

                {/* 5. Recheck Permissions */}
                <button
                  onClick={async () => {
                    const report = await notificationScheduler.recheckPermissions();
                    setDiagnostics(report);
                    setTestFeedback('System permissions & hardware APIs re-polled successfully.');
                  }}
                  className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-500 dark:hover:border-blue-500 transition text-left flex items-center justify-between group shadow-2xs"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                      <RefreshCw className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-900 dark:text-white block">
                        5. Recheck Permissions
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        Re-scan OS API status
                      </span>
                    </div>
                  </div>
                  <Play className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 transition shrink-0" />
                </button>

                {/* 6. Rebuild Prayer Notification Schedule */}
                <button
                  onClick={() => {
                    const ok = notificationScheduler.rebuildSchedule();
                    setTestFeedback(
                      ok
                        ? 'Prayer notification schedule rebuilt and re-armed for today.'
                        : 'Could not rebuild schedule: preferences or schedule loading.'
                    );
                  }}
                  className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-teal-500 dark:hover:border-teal-500 transition text-left flex items-center justify-between group shadow-2xs"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
                      <Activity className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-900 dark:text-white block">
                        6. Rebuild Schedule
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        Re-arm today\'s alarms
                      </span>
                    </div>
                  </div>
                  <Play className="w-3.5 h-3.5 text-slate-400 group-hover:text-teal-600 transition shrink-0" />
                </button>
              </div>

              {/* Full Synchronous Alarm Test Banner */}
              <button
                onClick={async () => {
                  await notificationScheduler.testAlarmSystem(adhanSettings, vibrationPrefs);
                  setTestFeedback('Fired all 3: Notification + Vibration + Adhan Audio simultaneously.');
                }}
                className="w-full p-3 rounded-2xl border border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 text-left flex items-center justify-between group shadow-2xs"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                    <Zap className="w-4 h-4 fill-white" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-emerald-950 dark:text-emerald-200 block">
                      Test All 3 Synchronously (Notification + Vibration + Vocal Adhan)
                    </span>
                    <span className="text-[10px] text-emerald-700 dark:text-emerald-400 block">
                      Full synchronous prayer alert pipeline verification
                    </span>
                  </div>
                </div>
                <Play className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400 fill-current" />
              </button>
            </div>

            {/* Timed Background Simulation Runner */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-1.5">
                    <Timer className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      Lock-Screen / Background Delivery Simulation
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    Test what happens when your phone is locked or in your pocket. Start a simulation timer, then lock your screen or switch apps. The app will trigger notification, vibration, and Adhan when the timer completes.
                  </p>
                </div>
              </div>

              {diagnostics.simulationState.isActive ? (
                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
                    <div>
                      <span className="text-xs font-bold text-amber-900 dark:text-amber-200 block">
                        Simulation Running: Firing in {diagnostics.simulationState.remainingSeconds}s
                      </span>
                      <span className="text-[10px] text-amber-800 dark:text-amber-300 block">
                        You can lock your phone or switch apps now to verify background delivery!
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      notificationScheduler.cancelPrayerSimulation();
                      setTestFeedback('Simulation cancelled.');
                    }}
                    className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition shrink-0"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => {
                      notificationScheduler.startPrayerSimulation(60, 'Asr');
                      setTestFeedback('60-second background simulation started! Lock your phone now.');
                    }}
                    className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition flex items-center justify-center gap-1.5 shadow-2xs"
                  >
                    <Timer className="w-3.5 h-3.5" />
                    <span>Simulate in 60s (Lock Phone)</span>
                  </button>

                  <button
                    onClick={() => {
                      notificationScheduler.scheduleTestAlert2Minutes();
                      setTestFeedback('120-second background simulation started! Lock your phone now.');
                    }}
                    className="flex-1 py-2 px-3 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 text-xs font-semibold transition flex items-center justify-center gap-1.5"
                  >
                    <Timer className="w-3.5 h-3.5" />
                    <span>Simulate in 120s (2 Minutes)</span>
                  </button>
                </div>
              )}
            </div>

            {/* Live Delivery History / Telemetry Log */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                  Recent Alarm Trigger History & Logs
                </span>
                <span className="text-[10px] text-slate-400">
                  {diagnostics.logs.length} logged events
                </span>
              </div>

              {diagnostics.logs.length === 0 ? (
                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400 bg-white dark:bg-slate-900">
                  No alert triggers recorded yet today. Use the test buttons above to verify delivery.
                </div>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto p-1 border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900">
                  {diagnostics.logs.map((log) => (
                    <div
                      key={log.id}
                      className="p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 text-xs space-y-1 bg-slate-50/50 dark:bg-slate-800/40"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 dark:text-white">
                          {log.prayerName}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">
                          {log.timestamp.toLocaleTimeString()}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                        <span
                          className={`px-1.5 py-0.5 rounded font-medium ${
                            log.notificationStatus === 'sent_sw' || log.notificationStatus === 'sent_direct'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : log.notificationStatus === 'disabled'
                              ? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                              : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                          }`}
                        >
                          Notif: {log.notificationStatus}
                        </span>

                        <span
                          className={`px-1.5 py-0.5 rounded font-medium ${
                            log.vibrationStatus === 'vibrated'
                              ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300'
                              : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                          }`}
                        >
                          Vib: {log.vibrationStatus}
                        </span>

                        <span
                          className={`px-1.5 py-0.5 rounded font-medium ${
                            log.audioStatus === 'playing'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                          }`}
                        >
                          Audio: {log.audioStatus}
                        </span>
                      </div>

                      {log.note && (
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                          {log.note}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Comprehensive Platform Limitations & Reliability Guide */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-3 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
              <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Operating System Guidelines & Background Execution Rules</span>
              </div>

              <div className="space-y-2 text-[11px]">
                <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                  <strong className="text-slate-900 dark:text-white block">🤖 Android (Chrome & Installed PWA):</strong>
                  Android PWAs support notifications via ServiceWorker and hardware vibration. To ensure alarms trigger even during deep Doze sleep mode:
                  <ul className="list-disc list-inside mt-1 text-slate-500 dark:text-slate-400 space-y-0.5">
                    <li>Install the app to your Home Screen.</li>
                    <li>Go to Android Settings &gt; Apps &gt; Chrome (or Nur al-Salat) &gt; Battery &gt; Set to <strong>"Unrestricted"</strong>.</li>
                    <li>Ensure "Do Not Disturb" allows notifications or set Nur al-Salat as an exception.</li>
                  </ul>
                </div>

                <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                  <strong className="text-slate-900 dark:text-white block">🍎 Apple iOS & iPadOS (Safari):</strong>
                  Apple strictly restricts background timers when the screen is turned off:
                  <ul className="list-disc list-inside mt-1 text-slate-500 dark:text-slate-400 space-y-0.5">
                    <li>Requires iOS 16.4+ and adding to Home Screen via Share ⎋ &gt; "Add to Home Screen".</li>
                    <li>Safari requires tapping anywhere in the app at least once per session to unlock the Web Audio engine for vocal Adhan calls.</li>
                    <li>For overnight Fajr alarms, keeping the app open with <strong>Screen Keep-Alive</strong> ensures 100% audible delivery.</li>
                  </ul>
                </div>

                <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                  <strong className="text-slate-900 dark:text-white block">💻 Microsoft Windows 11 / 10 & Desktop:</strong>
                  Notifications deliver directly to the Windows Action Center:
                  <ul className="list-disc list-inside mt-1 text-slate-500 dark:text-slate-400 space-y-0.5">
                    <li>Pin Nur al-Salat to your Taskbar as an installed app in Edge or Chrome.</li>
                    <li>Desktop notifications appear with audio and taskbar badge reminders.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: LOCATION & CALCULATION SETTINGS */}
        {activeTab === 'location' && (
          <div className="space-y-6">
            {/* GPS Detection */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-bold text-slate-900 dark:text-white block">
                    Automatic Location Detection (GPS)
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 block mt-0.5">
                    Current: {location.city}, {location.country} ({location.latitude.toFixed(4)}°, {location.longitude.toFixed(4)}°)
                  </span>
                </div>
                <button
                  onClick={handleDetectGPS}
                  disabled={isDetectingGPS}
                  className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition disabled:opacity-50"
                >
                  {isDetectingGPS ? 'Detecting...' : 'Detect GPS'}
                </button>
              </div>

              {gpsError && (
                <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">
                  {gpsError}
                </p>
              )}
            </div>

            {/* Manual City Selector */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Or Select from Major World Cities
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-1 border border-slate-200 dark:border-slate-800 rounded-2xl">
                {WORLD_CITIES.map((city) => {
                  const isSelected = location.city === city.city;
                  return (
                    <button
                      key={city.city}
                      onClick={() => {
                        onUpdateLocation({
                          city: city.city,
                          country: city.country,
                          latitude: city.latitude,
                          longitude: city.longitude,
                          timezone: city.timezone,
                          isManual: true,
                        });
                        onUpdateCalculationMethod(city.preferredMethod);
                      }}
                      className={`p-2.5 rounded-xl text-left border text-xs transition ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200 font-semibold'
                          : 'border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                      }`}
                    >
                      <span className="block font-medium truncate">{city.city}</span>
                      <span className="text-[10px] text-slate-400 block">{city.country}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Calculation Method */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Astronomical Calculation Authority
              </span>
              <select
                value={calculationMethod}
                onChange={(e) =>
                  onUpdateCalculationMethod(e.target.value as CalculationMethodKey)
                }
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-1 focus:ring-emerald-500"
              >
                <option value="MuslimWorldLeague">Muslim World League (MWL) — Fajr 18°, Isha 17° (Europe, Global)</option>
                <option value="UmmAlQura">Umm al-Qura University, Makkah — Fajr 18.5°, Isha 90 min (Saudi Arabia / Gulf)</option>
                <option value="Egyptian">Egyptian General Authority of Survey — Fajr 19.5°, Isha 17.5° (Africa, Middle East)</option>
                <option value="NorthAmerica">Islamic Society of North America (ISNA) — Fajr 15°, Isha 15° (USA & Canada)</option>
                <option value="Karachi">University of Islamic Sciences, Karachi — Fajr 18°, Isha 18° (Pakistan, Bangladesh, India)</option>
                <option value="Dubai">Dubai / UAE Official Method</option>
                <option value="Kuwait">Kuwait Official Method</option>
                <option value="Qatar">Qatar Official Method</option>
                <option value="Singapore">MUIS Singapore — Fajr 20°, Isha 18°</option>
                <option value="Tehran">Institute of Geophysics, University of Tehran</option>
              </select>
            </div>

            {/* Asr Single Shadow Transparency notice */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Asr Calculation Method</span>
              </div>
              <p>
                Nur al-Salat calculates Asr using the <strong>single-shadow method</strong> (when an object's shadow equals its original noon shadow plus one length of the object), in strict accordance with your settings.
              </p>
            </div>

            {/* Islamic Hijri Calendar Calibration (Hilal Sightings) */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-bold text-slate-900 dark:text-white block">
                    Islamic Hijri Calendar Calibration (Hilal Sightings)
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 block mt-0.5">
                    Adjust calendar by -2 to +2 days to match regional crescent moon sightings or local religious authorities.
                  </span>
                </div>
                <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 shrink-0">
                  {hijriOffset === 0 ? 'Standard (0)' : `${hijriOffset > 0 ? '+' : ''}${hijriOffset} day${Math.abs(hijriOffset) > 1 ? 's' : ''}`}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-500 dark:text-slate-400">Current Calibrated Date:</span>
                <span className="text-sm font-bold text-emerald-700 dark:text-emerald-300">
                  {calculateHijriDate(new Date(), hijriOffset).formatted}
                </span>
              </div>

              <div className="flex items-center gap-2 pt-1">
                {[-2, -1, 0, 1, 2].map((offsetVal) => (
                  <button
                    key={offsetVal}
                    onClick={() => handleUpdateHijriOffset(offsetVal)}
                    className={`flex-1 py-1.5 rounded-xl text-xs font-semibold transition ${
                      hijriOffset === offsetVal
                        ? 'bg-emerald-600 text-white shadow-xs font-bold'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                    }`}
                  >
                    {offsetVal === 0 ? 'Standard (0)' : `${offsetVal > 0 ? '+' : ''}${offsetVal}d`}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 leading-snug">
                100% deterministic Umm al-Qura astronomical algorithm. Guaranteed never to display "BC", Gregorian month mixups, or device locale errors.
              </p>
            </div>
          </div>
        )}

        {/* TAB 4: THEMES & APPEARANCE */}
        {activeTab === 'appearance' && (
          <div className="space-y-6">
            {/* Quick Launch Theme Studio */}
            {onOpenThemeStudio && (
              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-emerald-500/10 to-transparent border border-amber-500/30 flex items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white block">
                    🎨 Interactive Theme Studio
                  </span>
                  <span className="text-[11px] text-slate-600 dark:text-slate-300 block mt-0.5">
                    Explore live interactive cards, color swatches and instant previews for all 8 palettes.
                  </span>
                </div>
                <button
                  onClick={() => {
                    onClose();
                    onOpenThemeStudio();
                  }}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-900 text-white dark:bg-white dark:text-slate-900 shrink-0 shadow-xs transition"
                >
                  Open Studio
                </button>
              </div>
            )}

            {/* Appearance Mode (Light / Dark / System) */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-bold text-slate-900 dark:text-white block">
                    Appearance Mode
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 block">
                    Independent of color theme — all 8 themes support Light and Dark
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-1">
                {[
                  { id: 'light' as ThemeMode, label: 'Light', icon: '☀️' },
                  { id: 'dark' as ThemeMode, label: 'Dark', icon: '🌙' },
                  { id: 'system' as ThemeMode, label: 'System', icon: '💻' },
                ].map((m) => {
                  const isCurrent = themeMode === m.id;
                  return (
                    <button
                      key={m.id}
                      onClick={() => onUpdateThemeMode && onUpdateThemeMode(m.id)}
                      className={`py-2 px-3 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1.5 ${
                        isCurrent
                          ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                          : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <span>{m.icon}</span>
                      <span>{m.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 8 Color Palettes Choices */}
            <div className="space-y-3">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                8 Selectable Colour Themes
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-72 overflow-y-auto p-1 border border-slate-200 dark:border-slate-800 rounded-2xl">
                {THEME_LIST.map((th) => {
                  const isSelected = theme === th.id;
                  return (
                    <button
                      key={th.id}
                      onClick={() => onUpdateTheme(th.id)}
                      className={`p-3.5 rounded-2xl border text-left flex items-start gap-3 transition ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/40 ring-1 ring-emerald-500'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300'
                      }`}
                    >
                      <div
                        className="w-8 h-8 rounded-xl shrink-0 mt-0.5 flex items-center justify-center text-white font-bold text-xs shadow-xs"
                        style={{ backgroundColor: th.chips.primary }}
                      >
                        {isSelected ? <Check className="w-4 h-4 text-white" /> : 'Aa'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-xs md:text-sm font-bold text-slate-900 dark:text-white truncate">
                            {th.name}
                          </span>
                          {isSelected && (
                            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                              Active
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5 leading-snug">
                          {th.description}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: PLATFORMS (ANDROID, IOS, WINDOWS) */}
        {activeTab === 'platforms' && (
          <div className="space-y-6">
            {/* Current Environment Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-teal-500/10 to-transparent border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                    Device Environment
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-600 text-white">
                    {isInstalled ? 'Installed App' : 'Browser Mode'}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                  {platform === 'android' && 'Android Mobile / Tablet'}
                  {platform === 'ios' && 'Apple iOS / iPadOS Device'}
                  {platform === 'windows' && 'Microsoft Windows PC / Laptop'}
                  {platform === 'other' && 'Desktop / Web Browser'}
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                  {isInstalled
                    ? 'Running as an installed standalone Progressive Web App with offline engine active.'
                    : 'Install Nur al-Salat to launch instantly from your home screen or taskbar without browser borders.'}
                </p>
              </div>

              {!isInstalled && isInstallable && (
                <button
                  onClick={() => install()}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shrink-0 shadow-sm transition flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Install App Now</span>
                </button>
              )}
            </div>

            {/* Three Platforms Breakdown */}
            <div className="space-y-4">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Cross-Platform Support (Android · iOS · Windows)
              </span>

              {/* Android Card */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="text-xs md:text-sm font-bold text-slate-900 dark:text-white">
                      Android (Samsung, Pixel, Xiaomi, OnePlus)
                    </h5>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Installs directly via Chrome, Edge, or Samsung Internet without APK sideloading
                    </p>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-600 dark:text-slate-300">
                  <div className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Home screen & app drawer launcher icon</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Safe-area padding for gesture bar & camera punch-hole</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Background & foreground prayer calculations</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Vocal Adhan audio & local prayer notifications</span>
                  </div>
                </div>
              </div>

              {/* iOS Card */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 flex items-center justify-center shrink-0">
                    <Apple className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="text-xs md:text-sm font-bold text-slate-900 dark:text-white">
                      iOS & iPadOS (iPhone and iPad)
                    </h5>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Safari Web App with high-resolution Apple Touch Icon and notch safe-areas
                    </p>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-600 dark:text-slate-300">
                  <div className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Share ⎋ &gt; "Add to Home Screen" 1-tap launch</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Dynamic Island & notch padding (viewport-fit=cover)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>No Safari search bar or URL chrome</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Offline caching for full travel & flight usage</span>
                  </div>
                </div>
              </div>

              {/* Windows Card */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 flex items-center justify-center shrink-0">
                    <Monitor className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="text-xs md:text-sm font-bold text-slate-900 dark:text-white">
                      Windows 11 / 10 (PC, Laptop, Surface Tablet)
                    </h5>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Native Windows application window via Microsoft Edge or Google Chrome
                    </p>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-600 dark:text-slate-300">
                  <div className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Pin to Windows Taskbar & Start Menu</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Right-click Taskbar Jump Lists (Salah, Qibla, Quran, Adhkar)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Widescreen multi-column layout with 12-3-6-9 Salah clock</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Windows desktop audio playback for Adhan calls</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Offline Engine Guarantee */}
            <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800/80 flex items-start gap-3 text-xs text-slate-700 dark:text-slate-300">
              <Info className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong>Astronomical Engine Works 100% Offline:</strong> All prayer timings, Asr single-shadow calculations, Makruh forbidden prayer time blocks, authentic morning & evening Adhkar, and Quranic texts are stored locally in the Progressive Web App service worker. No network connection is needed once installed.
              </div>
            </div>

            {/* Developer Identity & Credit */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-transparent border border-emerald-500/25 flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4 text-center sm:text-left">
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-800 dark:text-emerald-400 block">
                  Developed by
                </span>
                <h4 className="text-sm md:text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
                  Mohammed Amir Mohiuddin
                </h4>
                <p className="text-xs italic text-slate-600 dark:text-slate-300 leading-relaxed font-serif">
                  Built with curiosity. Driven by ideas. Improved through learning.
                </p>
              </div>
              <div className="shrink-0 flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 text-[11px] font-semibold">
                <span>Nur al-Salat</span>
              </div>
            </div>
          </div>
        )}

        {/* Footer with Developer Credit & Close */}
        <div className="pt-3.5 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="space-y-0.5">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 dark:text-slate-500 block">
              Developed by
            </span>
            <span className="text-xs font-bold text-slate-900 dark:text-white block tracking-tight">
              Mohammed Amir Mohiuddin
            </span>
            <p className="text-[11px] italic text-slate-500 dark:text-slate-400 leading-snug">
              Built with curiosity. Driven by ideas. Improved through learning.
            </p>
          </div>

          <button
            onClick={() => {
              adhanPlayer.stop();
              onClose();
            }}
            className="w-full sm:w-auto px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-950 text-white text-xs font-semibold transition shrink-0 shadow-xs"
          >
            Save & Done
          </button>
        </div>
      </div>
    </div>
  );
};
