import React, { useState, useEffect } from 'react';
import {
  Bell,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Volume2,
  Clock,
  ShieldCheck,
  Smartphone,
  Apple,
  Monitor,
  RefreshCw,
  X,
  Play,
} from 'lucide-react';
import {
  AdhanSetting,
  NotificationPreferences,
  VibrationPreferences,
  SalahName,
} from '../types';
import { DayPrayerSchedule } from '../utils/prayerCalc';
import { notificationScheduler } from '../utils/notifications';
import { adhanPlayer, ADHAN_OPTIONS } from '../utils/audioManager';

interface NotificationPermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSettings: (tab?: 'notifications') => void;
  schedule: DayPrayerSchedule;
  adhanSettings: AdhanSetting;
  notificationPrefs: NotificationPreferences;
  onUpdateNotificationPrefs: (newPrefs: NotificationPreferences) => void;
  vibrationPrefs?: VibrationPreferences;
}

type ModalStep = 'prompt' | 'requesting' | 'granted' | 'denied';

export const NotificationPermissionModal: React.FC<NotificationPermissionModalProps> = ({
  isOpen,
  onClose,
  onOpenSettings,
  schedule,
  adhanSettings,
  notificationPrefs,
  onUpdateNotificationPrefs,
  vibrationPrefs,
}) => {
  const [step, setStep] = useState<ModalStep>('prompt');
  const [isCheckingAudio, setIsCheckingAudio] = useState(false);
  const [audioLoaded, setAudioLoaded] = useState<boolean>(true);
  const [isTestingSound, setIsTestingSound] = useState(false);

  // Platform detection
  const isIOS =
    typeof window !== 'undefined' &&
    /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase());
  const isAndroid =
    typeof window !== 'undefined' &&
    /android/.test(window.navigator.userAgent.toLowerCase());

  // Check initial permission status if opened
  useEffect(() => {
    if (!isOpen) return;

    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        setStep('granted');
        verifySchedulingAndAudio();
      } else if (Notification.permission === 'denied') {
        // If already explicitly denied before opening, show guide right away
        setStep('denied');
      } else {
        setStep('prompt');
      }
    } else {
      setStep('prompt');
    }
  }, [isOpen]);

  const verifySchedulingAndAudio = async () => {
    setIsCheckingAudio(true);
    try {
      const isLoaded = await adhanPlayer.checkAudioLoaded(adhanSettings.selectedAudio);
      setAudioLoaded(isLoaded);

      // Rebuild and ensure scheduler is synchronized with the schedule
      notificationScheduler.scheduleForToday(
        schedule,
        adhanSettings,
        { ...notificationPrefs, enabled: true },
        vibrationPrefs
      );
    } catch {
      setAudioLoaded(false);
    } finally {
      setIsCheckingAudio(false);
    }
  };

  const handleEnableNotifications = async () => {
    setStep('requesting');

    try {
      const permission = await notificationScheduler.requestPermission();

      if (permission === 'granted') {
        // 1. Confirm notifications are enabled in state
        onUpdateNotificationPrefs({
          ...notificationPrefs,
          enabled: true,
        });

        // 2. Mark prompt as completed
        try {
          localStorage.setItem('nur_notif_prompt_interacted', 'true');
          localStorage.setItem('nur_notif_prompt_choice', 'granted');
        } catch {
          // ignore
        }

        // 3. Ensure Nur al-Salat can deliver notifications and audio
        await verifySchedulingAndAudio();

        setStep('granted');
      } else {
        // Permission was denied or dismissed by browser
        try {
          localStorage.setItem('nur_notif_prompt_choice', 'denied');
        } catch {
          // ignore
        }
        setStep('denied');
      }
    } catch {
      setStep('denied');
    }
  };

  const handleMaybeLater = () => {
    try {
      localStorage.setItem('nur_notif_prompt_interacted', 'true');
      localStorage.setItem('nur_notif_prompt_choice', 'maybe_later');
    } catch {
      // ignore
    }
    onClose();
  };

  const handleRecheckPermission = async () => {
    setStep('requesting');
    try {
      const report = await notificationScheduler.recheckPermissions();
      if (report.rawPermission === 'granted') {
        onUpdateNotificationPrefs({
          ...notificationPrefs,
          enabled: true,
        });
        try {
          localStorage.setItem('nur_notif_prompt_interacted', 'true');
          localStorage.setItem('nur_notif_prompt_choice', 'granted');
        } catch {
          // ignore
        }
        await verifySchedulingAndAudio();
        setStep('granted');
      } else {
        setStep('denied');
      }
    } catch {
      setStep('denied');
    }
  };

  const handleTestSound = async () => {
    setIsTestingSound(true);
    try {
      await notificationScheduler.testAlarmSystem(adhanSettings, vibrationPrefs);
    } finally {
      setTimeout(() => setIsTestingSound(false), 2000);
    }
  };

  const selectedAdhanOption =
    ADHAN_OPTIONS.find((o) => o.id === adhanSettings.selectedAudio) || ADHAN_OPTIONS[0];

  const nextPrayer = schedule.nextPrayer;

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="notif-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-200"
    >
      <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-7 space-y-5 transition-all">
        {/* STEP 1: INITIAL ONBOARDING PROMPT */}
        {step === 'prompt' && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white flex items-center justify-center shadow-md shadow-emerald-600/20">
                <Bell className="w-6 h-6 animate-pulse" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300/40 dark:border-emerald-700/40">
                Prayer Alerts & Adhan
              </span>
            </div>

            <div className="space-y-2">
              <h3
                id="notif-modal-title"
                className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-snug"
              >
                Never miss a prayer. Enable notifications to receive Adhan alerts when each prayer time begins.
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Nur al-Salat will notify you at the exact dawn, noon, afternoon, sunset, and night prayer times with your chosen authentic Adhan recitation.
              </p>
            </div>

            {/* Feature Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-slate-700 dark:text-slate-300">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-start gap-2.5">
                <Volume2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-slate-900 dark:text-white text-[11px]">Authentic Vocal Adhan</strong>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">
                    Plays Madinah, Makkah, or Dawn Adhan at Salah time.
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-slate-900 dark:text-white text-[11px]">15-Min Pre-Alert</strong>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">
                    Advance reminder to complete Wudu and prepare.
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-start gap-2.5">
                <Smartphone className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-slate-900 dark:text-white text-[11px]">Haptic Vibration</strong>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">
                    Gentle physical vibration alerts on supported devices.
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-slate-900 dark:text-white text-[11px]">100% Private</strong>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">
                    Calculated and scheduled completely on your device.
                  </span>
                </div>
              </div>
            </div>

            {/* Two Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-2.5">
              <button
                onClick={handleEnableNotifications}
                className="w-full sm:flex-1 py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-bold text-xs sm:text-sm transition shadow-md shadow-emerald-700/20 flex items-center justify-center gap-2"
              >
                <Bell className="w-4 h-4" />
                <span>Enable Notifications</span>
              </button>

              <button
                onClick={handleMaybeLater}
                className="w-full sm:w-auto py-3 px-5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs sm:text-sm transition"
              >
                Maybe Later
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: REQUESTING PERMISSION STATE */}
        {step === 'requesting' && (
          <div className="py-8 text-center space-y-4">
            <div className="w-12 h-12 rounded-full border-3 border-emerald-600 border-t-transparent animate-spin mx-auto" />
            <div className="space-y-1">
              <h4 className="text-base font-bold text-slate-900 dark:text-white">
                Requesting Notification Permission...
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                Please tap <strong>"Allow"</strong> on the prompt displayed by your device or browser.
              </p>
            </div>
          </div>
        )}

        {/* STEP 3: GRANTED CONFIRMATION & VERIFICATION STATE */}
        {step === 'granted' && (
          <div className="space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block">
                  Permissions Granted
                </span>
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">
                  Prayer Alerts Configured
                </h3>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Nur al-Salat is scheduled to deliver prayer notifications and play your selected Adhan recitation.
            </p>

            {/* Verification Checklist Card */}
            <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 space-y-2.5 text-xs">
              <div className="flex items-center justify-between text-emerald-900 dark:text-emerald-200 font-semibold pb-1.5 border-b border-emerald-200/50 dark:border-emerald-800/40">
                <span>Alert Capabilities Overview</span>
                <span className="text-[10px] font-mono uppercase bg-emerald-200/60 dark:bg-emerald-800/60 px-2 py-0.5 rounded-full text-emerald-800 dark:text-emerald-200">
                  Scheduled
                </span>
              </div>

              <div className="grid grid-cols-1 gap-2 text-[11px] text-slate-700 dark:text-slate-300">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400">System Notification:</span>
                  <span className="font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Granted
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Selected Adhan Sound:</span>
                  <span className="font-bold text-slate-900 dark:text-white truncate max-w-[200px]">
                    {selectedAdhanOption.name}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Foreground Vocal Adhan:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    Ready (Plays when app is open)
                  </span>
                </div>

                <div className="flex items-start justify-between gap-2 pt-1 border-t border-emerald-200/40 dark:border-emerald-800/30">
                  <span className="text-slate-500 dark:text-slate-400 shrink-0">Background Behavior:</span>
                  <span className="text-[10px] font-medium text-slate-600 dark:text-slate-300 text-right">
                    {isAndroid
                      ? 'Plays audio in background when Battery is set to "Unrestricted"; otherwise chimes via notification.'
                      : isIOS
                      ? 'Delivers system notification sound & vibration (iOS restricts background web audio).'
                      : 'Plays vocal Adhan & delivers system notifications while browser runs.'}
                  </span>
                </div>

                {nextPrayer && (
                  <div className="flex items-center justify-between pt-1 border-t border-emerald-200/40 dark:border-emerald-800/30">
                    <span className="text-slate-500 dark:text-slate-400">Next Scheduled Prayer:</span>
                    <span className="font-mono font-bold text-emerald-700 dark:text-emerald-300">
                      {nextPrayer.name} at {nextPrayer.timeString}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Test Alarm Pipeline & Done Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-2.5">
              <button
                onClick={handleTestSound}
                disabled={isTestingSound}
                className="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 font-semibold text-xs text-slate-700 dark:text-slate-200 transition flex items-center justify-center gap-2"
              >
                <Play className="w-3.5 h-3.5 text-emerald-600" />
                <span>{isTestingSound ? 'Testing Alarm...' : 'Test Sound & Vibration'}</span>
              </button>

              <button
                onClick={() => {
                  adhanPlayer.stop();
                  onClose();
                }}
                className="w-full sm:w-auto py-2.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition shadow-xs"
              >
                Done
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: PERMISSION BLOCKED / DENIED STEP-BY-STEP GUIDANCE */}
        {step === 'denied' && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                <AlertCircle className="w-7 h-7" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 block">
                  Action Required
                </span>
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">
                  Notification Permission Is Blocked
                </h3>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Your browser or device has notifications turned off for Nur al-Salat. To receive Adhan alerts at prayer times, please enable notifications in your device settings.
            </p>

            {/* Dynamic Step-by-Step Device Guidance */}
            {isAndroid && (
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-2.5 text-xs">
                <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                  <Smartphone className="w-4 h-4 text-emerald-600" />
                  <span>How to Enable on Android:</span>
                </div>
                <ol className="list-decimal list-inside space-y-1.5 text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                  <li>
                    Tap the <strong>tune/padlock icon 🔒</strong> in your browser address bar (or go to <strong>Android Settings &gt; Apps &gt; Chrome (or Nur al-Salat) &gt; Notifications</strong>).
                  </li>
                  <li>
                    Toggle <strong>"Allow Notifications"</strong> to <strong>ON</strong>.
                  </li>
                  <li>
                    <em>(Recommended)</em> Under <strong>Battery</strong>, select <strong>"Unrestricted"</strong> so Adhan audio plays when your screen is locked.
                  </li>
                  <li>
                    Return here and tap <strong>"Recheck Permission"</strong> below.
                  </li>
                </ol>
              </div>
            )}

            {isIOS && (
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-2.5 text-xs">
                <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                  <Apple className="w-4 h-4 text-emerald-600" />
                  <span>How to Enable on iPhone (iOS Safari):</span>
                </div>
                <ol className="list-decimal list-inside space-y-1.5 text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                  <li>
                    iPhone web notifications require iOS 16.4+ and adding the app to your Home Screen (tap Share ⎋ &gt; <strong>"Add to Home Screen"</strong>).
                  </li>
                  <li>
                    Open <strong>iPhone Settings &gt; Notifications &gt; Safari</strong> (or Nur al-Salat).
                  </li>
                  <li>
                    Toggle <strong>"Allow Notifications"</strong> to <strong>ON</strong>.
                  </li>
                  <li>
                    Return to the app and tap <strong>"Recheck Permission"</strong> below.
                  </li>
                </ol>
              </div>
            )}

            {!isAndroid && !isIOS && (
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-2.5 text-xs">
                <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                  <Monitor className="w-4 h-4 text-emerald-600" />
                  <span>How to Enable in Your Browser:</span>
                </div>
                <ol className="list-decimal list-inside space-y-1.5 text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                  <li>
                    Click the <strong>padlock or site permissions icon 🔒</strong> in your browser address bar next to the website URL.
                  </li>
                  <li>
                    Change <strong>Notifications</strong> from "Block" to <strong>"Allow"</strong>.
                  </li>
                  <li>
                    Click <strong>"Recheck Permission"</strong> below once updated.
                  </li>
                </ol>
              </div>
            )}

            {/* Action Buttons for Denied Flow */}
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-2.5">
              <button
                onClick={handleRecheckPermission}
                className="w-full sm:flex-1 py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-bold text-xs sm:text-sm transition shadow-md shadow-emerald-700/20 flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Recheck Permission</span>
              </button>

              <button
                onClick={() => {
                  onClose();
                  onOpenSettings('notifications');
                }}
                className="w-full sm:w-auto py-3 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs transition"
              >
                Open App Notification Settings
              </button>

              <button
                onClick={handleMaybeLater}
                className="w-full sm:w-auto py-2.5 px-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 text-xs font-medium transition"
              >
                Dismiss for Now
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
