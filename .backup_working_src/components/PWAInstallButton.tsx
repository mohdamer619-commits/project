import React, { useState } from 'react';
import { Download, Share2, Monitor, Smartphone, Apple, Check, ExternalLink, X, Info } from 'lucide-react';
import { usePWAInstall, PlatformType } from '../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  compact?: boolean;
  showIconOnly?: boolean;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  compact = false,
  showIconOnly = false,
}) => {
  const { isInstallable, isInstalled, isIOS, isAndroid, isWindows, platform, install } =
    usePWAInstall();
  const [showModal, setShowModal] = useState(false);
  const [selectedTab, setSelectedTab] = useState<PlatformType>(
    platform === 'other' ? 'android' : platform
  );

  // If already running in standalone mode (installed app), hide the header button
  if (isInstalled) {
    return (
      <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 rounded-lg border border-emerald-200 dark:border-emerald-800/60">
        <Check className="w-3 h-3 text-emerald-600" />
        <span>Installed App</span>
      </div>
    );
  }

  const handleButtonClick = async () => {
    if (isInstallable) {
      const success = await install();
      if (!success) {
        // If dismissed or failed, show modal guide with instructions
        setSelectedTab(platform === 'other' ? 'android' : platform);
        setShowModal(true);
      }
    } else {
      setSelectedTab(platform === 'other' ? 'android' : platform);
      setShowModal(true);
    }
  };

  return (
    <>
      <button
        onClick={handleButtonClick}
        title="Install Nur al-Salat on Android, iOS, or Windows"
        aria-label="Install Nur al-Salat App"
        className={`flex items-center gap-2 font-medium text-emerald-800 bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-950/80 dark:text-emerald-300 dark:hover:bg-emerald-900 transition-all rounded-xl whitespace-nowrap active:scale-95 shadow-sm ${
          showIconOnly
            ? 'p-2'
            : compact
            ? 'px-3 py-1.5 text-xs'
            : 'px-3.5 py-2 text-xs font-semibold'
        }`}
      >
        <Download className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
        {!showIconOnly && (
          <span>
            {isInstallable
              ? 'Install App'
              : isIOS
              ? 'Install on iPhone'
              : isWindows
              ? 'Install on Windows'
              : 'Install App'}
          </span>
        )}
      </button>

      {/* Multi-Platform Installation Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto animate-fadeIn">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-2xl border border-slate-200 dark:border-slate-800 my-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-800 flex items-center justify-center text-white shadow-sm">
                  <Download className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Install Nur al-Salat
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Runs offline on Android, iOS & Windows
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Platform Selector Tabs */}
            <div className="grid grid-cols-3 gap-2 mt-4 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl text-xs font-semibold">
              <button
                onClick={() => setSelectedTab('android')}
                className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg transition ${
                  selectedTab === 'android'
                    ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Android</span>
                {isAndroid && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                )}
              </button>

              <button
                onClick={() => setSelectedTab('ios')}
                className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg transition ${
                  selectedTab === 'ios'
                    ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <Apple className="w-3.5 h-3.5" />
                <span>iOS / iPad</span>
                {isIOS && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                )}
              </button>

              <button
                onClick={() => setSelectedTab('windows')}
                className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg transition ${
                  selectedTab === 'windows'
                    ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
                <span>Windows</span>
                {isWindows && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                )}
              </button>
            </div>

            {/* Tab Contents */}
            <div className="mt-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800/70">
              {/* Android Tab */}
              {selectedTab === 'android' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide">
                      Android Installation (Chrome / Samsung Internet)
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                      APK-Free PWA
                    </span>
                  </div>

                  {isInstallable && (
                    <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
                      <div className="text-xs text-emerald-900 dark:text-emerald-200">
                        Browser is ready for 1-click install.
                      </div>
                      <button
                        onClick={async () => {
                          await install();
                          setShowModal(false);
                        }}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition"
                      >
                        Install Now
                      </button>
                    </div>
                  )}

                  <ol className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
                    <li className="flex items-start gap-2.5">
                      <span className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-600 text-white font-bold text-[10px] shrink-0 mt-0.5">
                        1
                      </span>
                      <span>
                        Tap the browser menu icon <strong>(⋮ three vertical dots)</strong> in the top-right corner.
                      </span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-600 text-white font-bold text-[10px] shrink-0 mt-0.5">
                        2
                      </span>
                      <span>
                        Select <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.
                      </span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-600 text-white font-bold text-[10px] shrink-0 mt-0.5">
                        3
                      </span>
                      <span>
                        Confirm <strong>"Install"</strong>. Nur al-Salat will now launch directly from your home screen or app drawer with full standalone display.
                      </span>
                    </li>
                  </ol>
                </div>
              )}

              {/* iOS / iPadOS Tab */}
              {selectedTab === 'ios' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide">
                      iPhone & iPad (Safari)
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300">
                      iOS Web App
                    </span>
                  </div>

                  <ol className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
                    <li className="flex items-start gap-2.5">
                      <span className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-600 text-white font-bold text-[10px] shrink-0 mt-0.5">
                        1
                      </span>
                      <span>
                        Open this page in <strong>Safari</strong> (Apple does not support Home Screen installation in third-party in-app browsers).
                      </span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-600 text-white font-bold text-[10px] shrink-0 mt-0.5">
                        2
                      </span>
                      <span>
                        Tap the <strong>Share button</strong> <Share2 className="inline w-3.5 h-3.5 mx-0.5 text-blue-500" /> (square with upward arrow) in the bottom navigation bar.
                      </span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-600 text-white font-bold text-[10px] shrink-0 mt-0.5">
                        3
                      </span>
                      <span>
                        Scroll down and tap <strong>"Add to Home Screen"</strong> (with the ➕ icon).
                      </span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-600 text-white font-bold text-[10px] shrink-0 mt-0.5">
                        4
                      </span>
                      <span>
                        Tap <strong>"Add"</strong> in the top-right. Nur al-Salat will open full-screen with native gestures and offline cached prayer schedules.
                      </span>
                    </li>
                  </ol>
                </div>
              )}

              {/* Windows Tab */}
              {selectedTab === 'windows' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide">
                      Windows 11 / 10 (Edge / Chrome)
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                      Native Desktop App
                    </span>
                  </div>

                  {isInstallable && (
                    <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
                      <div className="text-xs text-emerald-900 dark:text-emerald-200">
                        Desktop install prompt ready.
                      </div>
                      <button
                        onClick={async () => {
                          await install();
                          setShowModal(false);
                        }}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition"
                      >
                        Install on Windows
                      </button>
                    </div>
                  )}

                  <ol className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
                    <li className="flex items-start gap-2.5">
                      <span className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-600 text-white font-bold text-[10px] shrink-0 mt-0.5">
                        1
                      </span>
                      <span>
                        In <strong>Microsoft Edge</strong> or <strong>Google Chrome</strong>, look at the right side of the address bar at the top.
                      </span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-600 text-white font-bold text-[10px] shrink-0 mt-0.5">
                        2
                      </span>
                      <span>
                        Click the <strong>"App available. Install Nur al-Salat"</strong> icon (represented by ⊕ or ⊞ with computer monitor).
                      </span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-600 text-white font-bold text-[10px] shrink-0 mt-0.5">
                        3
                      </span>
                      <span>
                        Click <strong>"Install"</strong>. The app will launch in its own native desktop window and can be pinned to your <strong>Windows Taskbar</strong> and <strong>Start Menu</strong>.
                      </span>
                    </li>
                  </ol>
                </div>
              )}
            </div>

            {/* Offline & Features Highlight */}
            <div className="mt-4 p-3 rounded-xl bg-slate-100 dark:bg-slate-800/80 flex items-start gap-2.5 text-[11px] text-slate-600 dark:text-slate-300">
              <Info className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                <strong>100% Offline Capable:</strong> Once installed on Android, iOS, or Windows, prayer times are calculated mathematically directly on your device, and authentic Adhkar/Quran text remains fully accessible anywhere without internet.
              </span>
            </div>

            {/* Footer Close */}
            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
