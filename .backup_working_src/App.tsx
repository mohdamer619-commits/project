/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { Dashboard } from './components/Dashboard';
import { AdhkarView } from './components/AdhkarView';
import { QuranView } from './components/QuranView';
import { HadithView } from './components/HadithView';
import { QiblaCompass } from './components/QiblaCompass';
import { PrayerTracker } from './components/PrayerTracker';
import { SettingsModal } from './components/SettingsModal';
import { MakruhTimesModal } from './components/MakruhTimesModal';
import { ThemeStudioModal } from './components/ThemeStudioModal';
import { AdhanLibraryModal } from './components/AdhanLibraryModal';
import { OfflineIndicator } from './components/OfflineIndicator';
import { PrayerAlertPopup } from './components/PrayerAlertPopup';
import {
  calculatePrayerSchedule,
  getMakruhTimes,
  isLocationInIndia,
  getDefaultCalculationMethodForLocation,
} from './utils/prayerCalc';
import {
  LocationData,
  CalculationMethodKey,
  AdhanSetting,
  ColorTheme,
  ThemeMode,
  PrayerName,
  SalahName,
  NotificationPreferences,
  VibrationPreferences,
} from './types';
import { notificationScheduler } from './utils/notifications';
import { adhanPlayer, AdhanAudioOption } from './utils/audioManager';
import { DEFAULT_VIBRATION } from './utils/vibrationManager';
import { applyThemeToDOM } from './data/themeData';
import { Volume2, Square } from 'lucide-react';

// Default Location: Mecca (Makkah)
const DEFAULT_LOCATION: LocationData = {
  city: 'Mecca (Makkah)',
  country: 'Saudi Arabia',
  latitude: 21.4225,
  longitude: 39.8262,
  timezone: 'Asia/Riyadh',
  isManual: false,
};

const DEFAULT_ADHAN: AdhanSetting = {
  enabled: true,
  selectedAudio: 'madinah_qassas', // Sheikh Muhammad Marwan Qassas's Madinah Adhan
  volume: 0.85,
  prayers: {
    Fajr: true,
    Dhuhr: true,
    Asr: true,
    Maghrib: true,
    Isha: true,
  },
  notificationOnly: false,
};

const DEFAULT_NOTIFICATIONS: NotificationPreferences = {
  enabled: true,
  prayers: {
    Fajr: true,
    Dhuhr: true,
    Asr: true,
    Maghrib: true,
    Isha: true,
  },
  timing: 'both',
  beforeMinutes: 15,
};

export default function App() {
  // Navigation with PWA shortcut deep-link support
  const [activeTab, setActiveTab] = useState<string>(() => {
    try {
      const urlTab = new URLSearchParams(window.location.search).get('tab');
      if (urlTab && ['dashboard', 'adhkar', 'quran', 'hadith', 'sunnah', 'qibla', 'tracker'].includes(urlTab)) {
        return urlTab === 'sunnah' ? 'hadith' : urlTab;
      }
    } catch {
      // ignore
    }
    return 'dashboard';
  });

  // Modals
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isThemeStudioOpen, setIsThemeStudioOpen] = useState<boolean>(false);
  const [isAdhanLibraryOpen, setIsAdhanLibraryOpen] = useState<boolean>(false);
  const [settingsInitialTab, setSettingsInitialTab] = useState<
    'adhan' | 'notifications' | 'vibration' | 'diagnostics' | 'location' | 'appearance' | 'platforms'
  >('adhan');
  const [isMakruhModalOpen, setIsMakruhModalOpen] = useState<boolean>(false);

  // Active Adhan Playback
  const [isAdhanPlaying, setIsAdhanPlaying] = useState<boolean>(adhanPlayer.isPlaying());
  const [activeAdhanOpt, setActiveAdhanOpt] = useState<AdhanAudioOption | null>(adhanPlayer.getActiveOption());

  useEffect(() => {
    return adhanPlayer.subscribe((playing, _id, opt) => {
      setIsAdhanPlaying(playing);
      setActiveAdhanOpt(opt);
    });
  }, []);

  // Time ticker (refreshes every 15 seconds)
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 15000);
    return () => clearInterval(timer);
  }, []);

  // Persistent user state
  const [location, setLocation] = useState<LocationData>(() => {
    try {
      const saved = localStorage.getItem('nur_location');
      return saved ? JSON.parse(saved) : DEFAULT_LOCATION;
    } catch {
      return DEFAULT_LOCATION;
    }
  });

  const [calculationMethod, setCalculationMethod] = useState<CalculationMethodKey>(() => {
    try {
      const savedMethod = localStorage.getItem('nur_calc_method') as CalculationMethodKey | null;
      const isManual = localStorage.getItem('nur_calc_manual_override') === 'true';

      // If user has explicitly chosen a method in settings, respect it permanently
      if (isManual && savedMethod) {
        return savedMethod;
      }

      // Check current saved location or client timezone
      const savedLoc = localStorage.getItem('nur_location');
      const parsedLoc: LocationData | null = savedLoc ? JSON.parse(savedLoc) : null;
      const effectiveLoc = parsedLoc || DEFAULT_LOCATION;

      if (isLocationInIndia(effectiveLoc)) {
        return 'Karachi';
      }

      if (typeof Intl !== 'undefined') {
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
        if (tz === 'Asia/Kolkata' || tz === 'Asia/Calcutta') {
          return 'Karachi';
        }
      }

      return savedMethod || 'UmmAlQura';
    } catch {
      return 'UmmAlQura';
    }
  });

  const [adhanSettings, setAdhanSettings] = useState<AdhanSetting>(() => {
    try {
      const saved = localStorage.getItem('nur_adhan');
      return saved ? JSON.parse(saved) : DEFAULT_ADHAN;
    } catch {
      return DEFAULT_ADHAN;
    }
  });

  const [notificationPrefs, setNotificationPrefs] = useState<NotificationPreferences>(() => {
    try {
      const saved = localStorage.getItem('nur_notifications');
      return saved ? JSON.parse(saved) : DEFAULT_NOTIFICATIONS;
    } catch {
      return DEFAULT_NOTIFICATIONS;
    }
  });

  const [vibrationPrefs, setVibrationPrefs] = useState<VibrationPreferences>(() => {
    try {
      const saved = localStorage.getItem('nur_vibration');
      return saved ? JSON.parse(saved) : DEFAULT_VIBRATION;
    } catch {
      return DEFAULT_VIBRATION;
    }
  });

  const [warningMinutes, setWarningMinutes] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('nur_warning_minutes');
      return saved ? parseInt(saved, 10) : 15;
    } catch {
      return 15;
    }
  });

  const [theme, setTheme] = useState<ColorTheme>(() => {
    try {
      const saved = localStorage.getItem('nur_theme');
      return (saved as ColorTheme) || 'emerald';
    } catch {
      return 'emerald';
    }
  });

  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    try {
      const saved = localStorage.getItem('nur_theme_mode');
      return (saved as ThemeMode) || 'system';
    } catch {
      return 'system';
    }
  });

  const [darkMode, setDarkMode] = useState<boolean>(() => {
    try {
      const savedMode = localStorage.getItem('nur_theme_mode') || 'system';
      if (savedMode === 'dark') return true;
      if (savedMode === 'light') return false;
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch {
      return false;
    }
  });

  const [adhkarProgress, setAdhkarProgress] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem('nur_adhkar_progress');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [adhkarCompleted, setAdhkarCompleted] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('nur_adhkar_completed');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [prayerLogs, setPrayerLogs] = useState<
    Record<string, Record<SalahName, 'prayed' | 'missed' | 'pending'>>
  >(() => {
    try {
      const saved = localStorage.getItem('nur_prayer_logs');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [bookmarkedAyahs, setBookmarkedAyahs] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('nur_quran_bookmarks');
      return saved ? JSON.parse(saved) : ['2:255', '2:285', '2:286'];
    } catch {
      return ['2:255', '2:285', '2:286'];
    }
  });

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('nur_location', JSON.stringify(location));
  }, [location]);

  useEffect(() => {
    localStorage.setItem('nur_calc_method', calculationMethod);
  }, [calculationMethod]);

  useEffect(() => {
    localStorage.setItem('nur_adhan', JSON.stringify(adhanSettings));
  }, [adhanSettings]);

  useEffect(() => {
    localStorage.setItem('nur_notifications', JSON.stringify(notificationPrefs));
  }, [notificationPrefs]);

  useEffect(() => {
    localStorage.setItem('nur_vibration', JSON.stringify(vibrationPrefs));
  }, [vibrationPrefs]);

  useEffect(() => {
    localStorage.setItem('nur_warning_minutes', warningMinutes.toString());
  }, [warningMinutes]);

  // Sync theme & appearance mode to DOM and localStorage
  useEffect(() => {
    localStorage.setItem('nur_theme', theme);
    localStorage.setItem('nur_theme_mode', themeMode);
    const resolvedIsDark = applyThemeToDOM(theme, themeMode);
    setDarkMode(resolvedIsDark);
  }, [theme, themeMode]);

  // Listen for system color scheme changes when mode is 'system'
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemChange = () => {
      if (themeMode === 'system') {
        const resolvedIsDark = applyThemeToDOM(theme, 'system');
        setDarkMode(resolvedIsDark);
      }
    };
    mediaQuery.addEventListener('change', handleSystemChange);
    return () => mediaQuery.removeEventListener('change', handleSystemChange);
  }, [theme, themeMode]);

  useEffect(() => {
    localStorage.setItem('nur_adhkar_progress', JSON.stringify(adhkarProgress));
  }, [adhkarProgress]);

  useEffect(() => {
    localStorage.setItem('nur_adhkar_completed', JSON.stringify(adhkarCompleted));
  }, [adhkarCompleted]);

  useEffect(() => {
    localStorage.setItem('nur_prayer_logs', JSON.stringify(prayerLogs));
  }, [prayerLogs]);

  useEffect(() => {
    localStorage.setItem('nur_quran_bookmarks', JSON.stringify(bookmarkedAyahs));
  }, [bookmarkedAyahs]);

  // Attempt initial GPS check if not already configured manually
  useEffect(() => {
    if (!location.isManual && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
          const detectedLoc: LocationData = {
            city: 'Current Location',
            country: 'GPS Detected',
            latitude,
            longitude,
            timezone,
            isManual: false,
          };
          setLocation(detectedLoc);

          // If detected in India and user hasn't explicitly locked another method, default to Karachi
          const isManualOverride = localStorage.getItem('nur_calc_manual_override') === 'true';
          if (!isManualOverride && isLocationInIndia(detectedLoc)) {
            setCalculationMethod('Karachi');
          }
        },
        () => {
          // Keep current/default location if denied or error
        },
        { timeout: 8000 }
      );
    }
  }, []);

  // Calculate reactive prayer schedule
  const schedule = useMemo(() => {
    return calculatePrayerSchedule(location, calculationMethod, currentTime);
  }, [location, calculationMethod, currentTime]);

  // Calculate makruh times
  const makruhStatus = useMemo(() => {
    return getMakruhTimes(schedule, location.timezone);
  }, [schedule, location.timezone]);

  // Schedule local notifications, vibration alerts, and Adhan triggers
  useEffect(() => {
    notificationScheduler.scheduleForToday(
      schedule,
      adhanSettings,
      notificationPrefs,
      vibrationPrefs
    );
  }, [schedule, adhanSettings, notificationPrefs, vibrationPrefs]);

  // Adhkar Handlers
  const handleIncrementAdhkar = (id: string, maxCount: number) => {
    setAdhkarProgress((prev) => {
      const current = prev[id] || 0;
      const next = current + 1;
      if (next >= maxCount) {
        setAdhkarCompleted((cPrev) => ({ ...cPrev, [id]: true }));
      }
      return { ...prev, [id]: next };
    });
  };

  const handleResetAdhkarItem = (id: string) => {
    setAdhkarProgress((prev) => ({ ...prev, [id]: 0 }));
    setAdhkarCompleted((prev) => ({ ...prev, [id]: false }));
  };

  const handleResetAdhkarCategory = (categoryId: string) => {
    // Reset keys that belong to this category
    setAdhkarProgress((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((key) => {
        if (
          (categoryId === 'morning_evening' && key.startsWith('me_')) ||
          (categoryId === 'after_salah' && key.startsWith('as_')) ||
          (categoryId === 'before_sleep' && key.startsWith('bs_')) ||
          (categoryId === 'adhan_to_mosque' && key.startsWith('atm_'))
        ) {
          next[key] = 0;
        }
      });
      return next;
    });

    setAdhkarCompleted((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((key) => {
        if (
          (categoryId === 'morning_evening' && key.startsWith('me_')) ||
          (categoryId === 'after_salah' && key.startsWith('as_')) ||
          (categoryId === 'before_sleep' && key.startsWith('bs_')) ||
          (categoryId === 'adhan_to_mosque' && key.startsWith('atm_'))
        ) {
          next[key] = false;
        }
      });
      return next;
    });
  };

  const handleToggleAdhkarComplete = (id: string) => {
    setAdhkarCompleted((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Prayer Tracker Handlers
  const todayKey = new Date().toISOString().slice(0, 10);
  const todayLogs = prayerLogs[todayKey] || ({} as Record<SalahName, 'prayed' | 'missed' | 'pending'>);

  const handleUpdatePrayerLog = (
    prayer: SalahName,
    status: 'prayed' | 'missed' | 'pending'
  ) => {
    setPrayerLogs((prev) => {
      const dayRecord = prev[todayKey] || ({} as Record<SalahName, 'prayed' | 'missed' | 'pending'>);
      return {
        ...prev,
        [todayKey]: {
          ...dayRecord,
          [prayer]: status,
        },
      };
    });
  };

  const handleToggleBookmark = (verseKey: string) => {
    setBookmarkedAyahs((prev) =>
      prev.includes(verseKey) ? prev.filter((k) => k !== verseKey) : [...prev, verseKey]
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 transition-colors duration-200">
      {/* Top Bar Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenThemeStudio={() => setIsThemeStudioOpen(true)}
        darkMode={darkMode}
        onToggleDarkMode={() => {
          const next = darkMode ? 'light' : 'dark';
          setThemeMode(next);
        }}
      />

      {/* Visible In-App Heads-Up Prayer Notification Card */}
      <PrayerAlertPopup onNavigateToSchedule={() => setActiveTab('dashboard')} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 md:py-8 pb-24 md:pb-12">
        {activeTab === 'dashboard' && (
          <Dashboard
            schedule={schedule}
            location={location}
            adhanSettings={adhanSettings}
            onToggleMasterAdhan={() =>
              setAdhanSettings((s) => ({ ...s, enabled: !s.enabled }))
            }
            onTogglePrayerAdhan={(p: SalahName) =>
              setAdhanSettings((s) => ({
                ...s,
                prayers: { ...s.prayers, [p]: !s.prayers[p] },
              }))
            }
            makruhStatus={makruhStatus}
            onOpenMakruhModal={() => setIsMakruhModalOpen(true)}
            onOpenSettings={(tab) => {
              if (tab) setSettingsInitialTab(tab);
              setIsSettingsOpen(true);
            }}
            onNavigateTab={(tab) => setActiveTab(tab)}
            todayLogs={todayLogs}
            onUpdatePrayerLog={handleUpdatePrayerLog}
            warningMinutes={warningMinutes}
            notificationPrefs={notificationPrefs}
            vibrationPrefs={vibrationPrefs}
            theme={theme}
            onOpenThemeStudio={() => setIsThemeStudioOpen(true)}
            onOpenAdhanLibrary={() => setIsAdhanLibraryOpen(true)}
          />
        )}

        {activeTab === 'adhkar' && (
          <AdhkarView
            progress={adhkarProgress}
            completed={adhkarCompleted}
            onIncrementCount={handleIncrementAdhkar}
            onResetItem={handleResetAdhkarItem}
            onResetCategory={handleResetAdhkarCategory}
            onToggleComplete={handleToggleAdhkarComplete}
          />
        )}

        {activeTab === 'quran' && (
          <QuranView
            bookmarkedAyahs={bookmarkedAyahs}
            onToggleBookmark={handleToggleBookmark}
          />
        )}

        {activeTab === 'hadith' && (
          <HadithView
            schedule={schedule}
            timezone={location.timezone}
            onNavigateToTab={(tab) => setActiveTab(tab)}
          />
        )}

        {activeTab === 'qibla' && <QiblaCompass location={location} />}

        {activeTab === 'tracker' && (
          <PrayerTracker
            prayerLogs={prayerLogs}
            onUpdateLog={(dateKey, prayer, status) =>
              setPrayerLogs((prev) => ({
                ...prev,
                [dateKey]: {
                  ...(prev[dateKey] || {}),
                  [prayer]: status,
                },
              }))
            }
          />
        )}
      </main>

      {/* Floating Active Adhan Playback Banner */}
      {isAdhanPlaying && activeAdhanOpt && (
        <div className="fixed bottom-18 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:max-w-md z-50 p-4 rounded-2xl bg-slate-900/95 text-white shadow-2xl border border-emerald-500/40 backdrop-blur-md flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/30 border border-emerald-500/50 flex items-center justify-center text-emerald-400 shrink-0">
              <Volume2 className="w-5 h-5 animate-pulse" />
            </div>
            <div className="overflow-hidden">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                  Calling Adhan (Live Vocal)
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              </div>
              <h4 className="text-xs md:text-sm font-semibold truncate text-white">
                {activeAdhanOpt.name}
              </h4>
              <p className="text-[11px] text-slate-400 truncate">
                {activeAdhanOpt.reciter} · {activeAdhanOpt.location}
              </p>
            </div>
          </div>

          <button
            onClick={() => adhanPlayer.stop()}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shrink-0 transition shadow-sm active:scale-95"
          >
            <Square className="w-3.5 h-3.5 fill-white" />
            <span>Stop</span>
          </button>
        </div>
      )}

      {/* Mobile Bottom Navigation Bar */}
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        initialTab={settingsInitialTab}
        location={location}
        onUpdateLocation={(newLoc) => {
          setLocation(newLoc);
          const isManual = localStorage.getItem('nur_calc_manual_override') === 'true';
          if (!isManual && isLocationInIndia(newLoc)) {
            setCalculationMethod('Karachi');
          }
        }}
        calculationMethod={calculationMethod}
        onUpdateCalculationMethod={(m) => {
          localStorage.setItem('nur_calc_manual_override', 'true');
          setCalculationMethod(m);
        }}
        adhanSettings={adhanSettings}
        onUpdateAdhanSettings={(s) => setAdhanSettings(s)}
        notificationPrefs={notificationPrefs}
        onUpdateNotificationPrefs={(np) => setNotificationPrefs(np)}
        vibrationPrefs={vibrationPrefs}
        onUpdateVibrationPrefs={(vp) => setVibrationPrefs(vp)}
        warningMinutes={warningMinutes}
        onUpdateWarningMinutes={(wm) => setWarningMinutes(wm)}
        theme={theme}
        onUpdateTheme={(t) => setTheme(t)}
        themeMode={themeMode}
        onUpdateThemeMode={(m) => setThemeMode(m)}
        darkMode={darkMode}
        onToggleDarkMode={() => {
          const next = darkMode ? 'light' : 'dark';
          setThemeMode(next);
        }}
        onOpenThemeStudio={() => setIsThemeStudioOpen(true)}
        onOpenAdhanLibrary={() => setIsAdhanLibraryOpen(true)}
      />

      {/* Interactive Theme Studio Modal */}
      <ThemeStudioModal
        isOpen={isThemeStudioOpen}
        onClose={() => setIsThemeStudioOpen(false)}
        currentTheme={theme}
        onSelectTheme={(t) => setTheme(t)}
        currentMode={themeMode}
        onSelectMode={(m) => setThemeMode(m)}
        isDarkEffective={darkMode}
      />

      {/* Expanded Authentic Adhan Library Modal */}
      <AdhanLibraryModal
        isOpen={isAdhanLibraryOpen}
        onClose={() => setIsAdhanLibraryOpen(false)}
        adhanSettings={adhanSettings}
        onUpdateAdhanSettings={(s) => setAdhanSettings(s)}
      />

      {/* Makruh Times Modal */}
      <MakruhTimesModal
        isOpen={isMakruhModalOpen}
        onClose={() => setIsMakruhModalOpen(false)}
        makruhStatus={makruhStatus}
      />

      {/* Offline Status Connectivity Banner */}
      <OfflineIndicator />
    </div>
  );
}
