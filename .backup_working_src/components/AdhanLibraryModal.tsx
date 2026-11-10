import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Volume2,
  VolumeX,
  Play,
  Square,
  Check,
  Search,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  Sparkles,
  Info,
  Clock,
  Radio,
  Sliders,
} from 'lucide-react';
import { AdhanSetting, AdhanAudioId, SalahName } from '../types';
import { ADHAN_OPTIONS, adhanPlayer, AdhanAudioOption } from '../utils/audioManager';

interface AdhanLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  adhanSettings: AdhanSetting;
  onUpdateAdhanSettings: (newSettings: AdhanSetting) => void;
}

export const AdhanLibraryModal: React.FC<AdhanLibraryModalProps> = ({
  isOpen,
  onClose,
  adhanSettings,
  onUpdateAdhanSettings,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<
    'all' | 'makkah' | 'madinah' | 'fajr' | 'international'
  >('all');
  const [isPlaying, setIsPlaying] = useState<boolean>(adhanPlayer.isPlaying());
  const [activePlayingId, setActivePlayingId] = useState<AdhanAudioId | null>(
    adhanPlayer.getActiveId()
  );
  const [infoModalItem, setInfoModalItem] = useState<AdhanAudioOption | null>(null);

  // Sync playback state with singleton manager
  useEffect(() => {
    return adhanPlayer.subscribe((playing, id) => {
      setIsPlaying(playing);
      setActivePlayingId(id);
    });
  }, []);

  if (!isOpen) return null;

  // Filtered recordings list
  const filteredOptions = ADHAN_OPTIONS.filter((opt) => {
    const matchesSearch =
      opt.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opt.reciter.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opt.location.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === 'all' || opt.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const handleTogglePreview = async (opt: AdhanAudioOption) => {
    if (!opt.isAvailable) {
      setInfoModalItem(opt);
      return;
    }

    if (activePlayingId === opt.id && isPlaying) {
      adhanPlayer.stop();
    } else {
      await adhanPlayer.play(opt.id, adhanSettings.volume);
    }
  };

  const handleSelectRecording = (id: AdhanAudioId) => {
    const opt = ADHAN_OPTIONS.find((o) => o.id === id);
    if (!opt || !opt.isAvailable) {
      if (opt) setInfoModalItem(opt);
      return;
    }

    onUpdateAdhanSettings({
      ...adhanSettings,
      selectedAudio: id,
    });
  };

  const handleSetPrayerAudio = (prayer: SalahName, audioId: AdhanAudioId) => {
    const currentMap = adhanSettings.prayerAudios || {
      Fajr: 'fajr_authentic',
      Dhuhr: 'madinah_qassas',
      Asr: 'original_makkah',
      Maghrib: 'mishary_alafasy',
      Isha: 'original_madinah',
    };

    onUpdateAdhanSettings({
      ...adhanSettings,
      useSeparatePerPrayer: true,
      prayerAudios: {
        ...currentMap,
        [prayer]: audioId,
      },
    });
  };

  const prayersList: SalahName[] = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-4xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 md:p-8 space-y-6 my-8 max-h-[92vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">🕌</span>
              <h2 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                Adhan Audio Library
              </h2>
            </div>
            <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Authentic vocal Adhan recordings from Al-Masjid al-Haram, Al-Masjid an-Nabawi, and verified Muadhins
            </p>
          </div>
          <button
            onClick={() => {
              adhanPlayer.stop();
              onClose();
            }}
            aria-label="Close Adhan Library"
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Master Controls & Mode Switcher */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Master Toggle */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                Automatic Adhan Playback
              </span>
              <span className="text-xs text-slate-700 dark:text-slate-300 font-semibold block mt-0.5">
                {adhanSettings.enabled ? 'Enabled (Calls prayer on time)' : 'Disabled (Silent)'}
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

          {/* Volume Control */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
              <span className="flex items-center gap-1.5">
                <Volume2 className="w-4 h-4 text-emerald-600" />
                <span>Adhan Playback Volume</span>
              </span>
              <span className="font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
                {Math.round(adhanSettings.volume * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={adhanSettings.volume}
              onChange={(e) => {
                const vol = parseFloat(e.target.value);
                adhanPlayer.setVolume(vol);
                onUpdateAdhanSettings({ ...adhanSettings, volume: vol });
              }}
              className="w-full accent-emerald-600 cursor-pointer"
            />
          </div>
        </div>

        {/* Global vs. Separate Prayer Selection Mode */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                Recording Assignment Strategy
              </span>
              <span className="text-xs text-slate-600 dark:text-slate-300">
                Choose how recordings are mapped to the 5 daily prayers
              </span>
            </div>

            <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
              <button
                onClick={() =>
                  onUpdateAdhanSettings({ ...adhanSettings, useSeparatePerPrayer: false })
                }
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  !adhanSettings.useSeparatePerPrayer
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                One for All Prayers
              </button>

              <button
                onClick={() =>
                  onUpdateAdhanSettings({
                    ...adhanSettings,
                    useSeparatePerPrayer: true,
                    prayerAudios: adhanSettings.prayerAudios || {
                      Fajr: 'fajr_authentic',
                      Dhuhr: 'madinah_qassas',
                      Asr: 'original_makkah',
                      Maghrib: 'mishary_alafasy',
                      Isha: 'original_madinah',
                    },
                  })
                }
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  adhanSettings.useSeparatePerPrayer
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Custom Per Prayer
              </button>
            </div>
          </div>

          {/* If separate per prayer is active, show the 5 prayer selectors */}
          {adhanSettings.useSeparatePerPrayer && (
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
              {prayersList.map((prayer) => {
                const currentPrayerAudioId =
                  adhanSettings.prayerAudios?.[prayer] || adhanSettings.selectedAudio;
                const assignedOpt =
                  ADHAN_OPTIONS.find((o) => o.id === currentPrayerAudioId) || ADHAN_OPTIONS[0];

                return (
                  <div
                    key={prayer}
                    className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {prayer}
                      </span>
                      {prayer === 'Fajr' && (
                        <span className="text-[9px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-1.5 py-0.5 rounded">
                          Dawn
                        </span>
                      )}
                    </div>

                    <select
                      value={currentPrayerAudioId}
                      onChange={(e) =>
                        handleSetPrayerAudio(prayer, e.target.value as AdhanAudioId)
                      }
                      className="w-full text-[11px] p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-medium"
                    >
                      {ADHAN_OPTIONS.filter((o) => o.isAvailable).map((opt) => (
                        <option key={opt.id} value={opt.id}>
                          {opt.name}
                        </option>
                      ))}
                    </select>

                    <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                      {assignedOpt.reciter}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Filter and Search Bar */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by Qari, Muadhin or holy sanctuary..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
              {[
                { id: 'all', label: 'All' },
                { id: 'makkah', label: 'Makkah' },
                { id: 'madinah', label: 'Madinah' },
                { id: 'fajr', label: 'Fajr Dawn' },
                { id: 'international', label: 'International' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                    selectedCategory === cat.id
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Recordings Cards Grid */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Showing {filteredOptions.length} vocal recordings</span>
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>100% Genuine Human Vocal · Zero Synthesized Melodies</span>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {filteredOptions.map((opt) => {
              const isSelected = adhanSettings.selectedAudio === opt.id;
              const isPreviewing = activePlayingId === opt.id && isPlaying;

              return (
                <div
                  key={opt.id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
                    isSelected
                      ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/30 ring-1 ring-emerald-500/40'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
                  }`}
                >
                  <div>
                    {/* Top row: Name & Badges */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                          {opt.name}
                        </h4>
                        <span className="text-xs text-slate-500 dark:text-slate-400 block mt-0.5">
                          {opt.reciter} · {opt.location}
                        </span>
                      </div>

                      {/* Status badge */}
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                          opt.isAvailable
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                            : 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300'
                        }`}
                      >
                        {opt.statusBadge}
                      </span>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                      {opt.description}
                    </p>

                    {/* YouTube verified video link */}
                    {opt.youtubeUrl && (
                      <a
                        href={opt.youtubeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600 dark:text-rose-400 hover:underline mt-2"
                      >
                        <span>Watch Muhammad Marwan Qassas recitation on YouTube</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                    {/* Preview Button */}
                    <button
                      onClick={() => handleTogglePreview(opt)}
                      className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
                        isPreviewing
                          ? 'bg-amber-600 text-white'
                          : opt.isAvailable
                          ? 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      {isPreviewing ? (
                        <>
                          <Square className="w-3.5 h-3.5 fill-white" />
                          <span>Stop Playback</span>
                        </>
                      ) : opt.isAvailable ? (
                        <>
                          <Play className="w-3.5 h-3.5" />
                          <span>Listen Preview</span>
                        </>
                      ) : (
                        <>
                          <Info className="w-3.5 h-3.5" />
                          <span>Licensing Details</span>
                        </>
                      )}
                    </button>

                    {/* Select Radio Button */}
                    {opt.isAvailable ? (
                      <button
                        onClick={() => handleSelectRecording(opt.id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                          isSelected
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5" />}
                        <span>{isSelected ? 'Selected' : 'Select'}</span>
                      </button>
                    ) : (
                      <span className="text-[11px] font-medium text-slate-400">
                        Pending License
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Authenticity Guarantee & Mobile Browser Policy Note */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 space-y-2">
          <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Islamic Authenticity Guarantee & Device Notice</span>
          </div>
          <p className="leading-relaxed">
            Nur al-Salat is strictly dedicated to genuine human vocal Adhan recordings. Piano, synthesizers, instrumental background music, and AI-generated placeholder audio are strictly prohibited.
          </p>
          <p className="leading-relaxed text-[11px] text-slate-500 dark:text-slate-400">
            <strong>Operating System Notice:</strong> Modern mobile operating systems (especially Apple iOS Safari) enforce strict auto-play restrictions on audio playback while the phone is locked or the browser is in the background. On iOS, install the app via <em>Share → Add to Home Screen</em> for improved background reliability and notification delivery.
          </p>
        </div>

        {/* Modal Footer */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-500 dark:text-slate-400">
            Selected audio is saved locally to your device.
          </span>
          <button
            onClick={() => {
              adhanPlayer.stop();
              onClose();
            }}
            className="px-5 py-2 rounded-xl text-xs font-semibold bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:opacity-90 transition"
          >
            Done
          </button>
        </div>
      </div>

      {/* Info Modal for License Pending Recordings */}
      {infoModalItem && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {infoModalItem.name}
              </h3>
              <button
                onClick={() => setInfoModalItem(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {infoModalItem.authenticityNote}
            </p>
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-800 text-[11px] text-amber-900 dark:text-amber-200 leading-relaxed">
              In accordance with our strict authenticity guidelines, we never substitute an unrelated recording or synthesize audio. We are actively verifying official open distribution permissions for this reciter.
            </div>
            <button
              onClick={() => setInfoModalItem(null)}
              className="w-full py-2 rounded-xl text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition"
            >
              Understood
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
