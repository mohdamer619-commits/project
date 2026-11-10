import React, { useState, useEffect } from 'react';
import { Bell, Clock, X, ChevronRight, Volume2 } from 'lucide-react';
import { notificationScheduler, PrayerAlertPopupData } from '../utils/notifications';

interface PrayerAlertPopupProps {
  onNavigateToSchedule?: () => void;
}

export const PrayerAlertPopup: React.FC<PrayerAlertPopupProps> = ({
  onNavigateToSchedule,
}) => {
  const [activeAlert, setActiveAlert] = useState<PrayerAlertPopupData | null>(null);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const unsubscribe = notificationScheduler.subscribePopupAlert((alertData) => {
      setActiveAlert(alertData);
      setIsDismissed(false);
    });

    // Also listen to window custom event as dual-channel
    const handleEvent = (e: Event) => {
      const custom = e as CustomEvent<PrayerAlertPopupData>;
      if (custom.detail) {
        setActiveAlert(custom.detail);
        setIsDismissed(false);
      }
    };

    window.addEventListener('nur_prayer_popup_alert', handleEvent);

    return () => {
      unsubscribe();
      window.removeEventListener('nur_prayer_popup_alert', handleEvent);
    };
  }, []);

  // Auto-dismiss after 15 seconds
  useEffect(() => {
    if (activeAlert && !isDismissed) {
      const timer = setTimeout(() => {
        setIsDismissed(true);
      }, 15000);
      return () => clearTimeout(timer);
    }
  }, [activeAlert, isDismissed]);

  if (!activeAlert || isDismissed) {
    return null;
  }

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="fixed top-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 animate-in slide-in-from-top-4 duration-300 pointer-events-auto"
    >
      <div className="rounded-2xl p-4 bg-slate-900/95 text-white border border-emerald-500/50 shadow-2xl backdrop-blur-md ring-1 ring-emerald-500/20">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
              activeAlert.isAdvance
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
            }`}>
              {activeAlert.isAdvance ? (
                <Bell className="w-5 h-5 animate-bounce" />
              ) : (
                <Volume2 className="w-5 h-5 animate-pulse" />
              )}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                  activeAlert.isAdvance
                    ? 'bg-amber-500/20 text-amber-300'
                    : 'bg-emerald-500/20 text-emerald-300'
                }`}>
                  {activeAlert.isAdvance ? 'Approaching Prayer' : 'Prayer Started'}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {activeAlert.timeString}
                </span>
              </div>

              <h4 className="text-sm font-bold text-white tracking-tight">
                {activeAlert.title}
              </h4>

              <p className="text-xs text-slate-300 leading-relaxed">
                {activeAlert.message}
              </p>

              {onNavigateToSchedule && (
                <button
                  onClick={() => {
                    setIsDismissed(true);
                    onNavigateToSchedule();
                  }}
                  className="mt-2 text-xs font-semibold text-emerald-400 hover:text-emerald-300 inline-flex items-center gap-1 transition"
                >
                  <span>View Today's Schedule</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          <button
            onClick={() => setIsDismissed(true)}
            aria-label="Dismiss notification"
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
