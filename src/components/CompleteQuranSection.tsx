import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  BookOpen,
  Search,
  Bookmark,
  BookmarkCheck,
  Type,
  Eye,
  EyeOff,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Layers,
  ArrowUpDown,
  Compass,
  Check,
  Info,
  ExternalLink,
} from 'lucide-react';
import { QURAN_SURAHS_META, QURAN_JUZ_META, SurahMeta, FullSurahData, QuranAyah } from '../data/quranMeta';
import { loadSurahData } from '../utils/quranLoader';

interface CompleteQuranSectionProps {
  bookmarkedAyahs?: string[];
  onToggleBookmark?: (verseKey: string) => void;
  dailyVerse?: {
    surahNumber: number;
    ayahNumber: number;
    surahName: string;
    arabic: string;
    translation: string;
    quranLink: string;
  };
}

export const CompleteQuranSection: React.FC<CompleteQuranSectionProps> = ({
  bookmarkedAyahs = ['2:255', '2:285', '2:286'],
  onToggleBookmark,
  dailyVerse,
}) => {
  // Reading state with persistence
  const [selectedSurahNumber, setSelectedSurahNumber] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('nur_quran_last_surah');
      return saved ? parseInt(saved, 10) : 1;
    } catch {
      return 1;
    }
  });

  const [currentSurah, setCurrentSurah] = useState<FullSurahData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'read' | 'surahList' | 'juzList'>('read');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterBookmarkedOnly, setFilterBookmarkedOnly] = useState(false);
  const [jumpAyahInput, setJumpAyahInput] = useState('');

  // Presentation Preferences with persistence
  const [showTranslation, setShowTranslation] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('nur_quran_show_translation');
      return saved !== null ? saved === 'true' : true;
    } catch {
      return true;
    }
  });

  const [arabicFontSize, setArabicFontSize] = useState<'normal' | 'large' | 'huge'>(() => {
    try {
      const saved = localStorage.getItem('nur_quran_ar_font');
      return (saved as 'normal' | 'large' | 'huge') || 'large';
    } catch {
      return 'large';
    }
  });

  const [showAttributionModal, setShowAttributionModal] = useState(false);

  // Sync preferences
  useEffect(() => {
    localStorage.setItem('nur_quran_last_surah', selectedSurahNumber.toString());
  }, [selectedSurahNumber]);

  useEffect(() => {
    localStorage.setItem('nur_quran_show_translation', showTranslation.toString());
  }, [showTranslation]);

  useEffect(() => {
    localStorage.setItem('nur_quran_ar_font', arabicFontSize);
  }, [arabicFontSize]);

  // Load active Surah
  useEffect(() => {
    let isCancelled = false;
    setIsLoading(true);

    loadSurahData(selectedSurahNumber)
      .then((data) => {
        if (!isCancelled) {
          setCurrentSurah(data);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        console.error('Failed to load Surah:', err);
        if (!isCancelled) setIsLoading(false);
      });

    return () => {
      isCancelled = true;
    };
  }, [selectedSurahNumber]);

  // Current Surah metadata
  const currentMeta: SurahMeta = useMemo(() => {
    return (
      QURAN_SURAHS_META.find((s) => s.number === selectedSurahNumber) || QURAN_SURAHS_META[0]
    );
  }, [selectedSurahNumber]);

  // Filtered Surahs in Surah Directory
  const filteredSurahsList = useMemo(() => {
    if (!searchQuery.trim()) return QURAN_SURAHS_META;
    const q = searchQuery.toLowerCase().trim();
    return QURAN_SURAHS_META.filter(
      (s) =>
        s.number.toString() === q ||
        s.name.toLowerCase().includes(q) ||
        s.englishTranslation.toLowerCase().includes(q) ||
        s.arabicName.includes(q)
    );
  }, [searchQuery]);

  // Filtered Verses in Reader
  const displayedVerses = useMemo(() => {
    if (!currentSurah || !currentSurah.verses) return [];
    return currentSurah.verses.filter((v) => {
      const key = `${v.surahNumber}:${v.ayahNumber}`;
      if (filterBookmarkedOnly && !bookmarkedAyahs.includes(key)) {
        return false;
      }
      if (!searchQuery.trim() || viewMode !== 'read') return true;
      const q = searchQuery.toLowerCase().trim();
      return (
        v.ayahNumber.toString() === q ||
        v.arabic.includes(q) ||
        v.translation.toLowerCase().includes(q)
      );
    });
  }, [currentSurah, filterBookmarkedOnly, bookmarkedAyahs, searchQuery, viewMode]);

  // Jump to Ayah handler
  const handleJumpToAyah = (e: React.FormEvent) => {
    e.preventDefault();
    const target = parseInt(jumpAyahInput.trim(), 10);
    if (!isNaN(target) && target >= 1 && target <= currentMeta.numberOfAyahs) {
      const el = document.getElementById(`ayah-${currentMeta.number}-${target}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      setJumpAyahInput('');
    }
  };

  const handleSelectJuz = (juzNum: number) => {
    const juz = QURAN_JUZ_META.find((j) => j.juz === juzNum);
    if (juz) {
      setSelectedSurahNumber(juz.surah);
      setViewMode('read');
      setTimeout(() => {
        const el = document.getElementById(`ayah-${juz.surah}-${juz.ayah}`);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 300);
    }
  };

  // Font sizing classes
  const getArabicTextClass = () => {
    switch (arabicFontSize) {
      case 'normal':
        return 'text-xl leading-relaxed';
      case 'huge':
        return 'text-3xl md:text-4xl leading-loose';
      case 'large':
      default:
        return 'text-2xl md:text-3xl leading-loose';
    }
  };

  const handleToggle = (key: string) => {
    if (onToggleBookmark) {
      onToggleBookmark(key);
    }
  };

  return (
    <div className="w-full max-w-full overflow-hidden rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
      {/* 1. Header with Daily Reflection Banner */}
      {dailyVerse && (
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/20">
          <div className="flex items-center justify-between gap-2 pb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Daily Quranic Reflection · {dailyVerse.surahName} {dailyVerse.surahNumber}:{dailyVerse.ayahNumber}</span>
            </span>
            <button
              onClick={() => {
                setSelectedSurahNumber(dailyVerse.surahNumber);
                setViewMode('read');
                setTimeout(() => {
                  const el = document.getElementById(`ayah-${dailyVerse.surahNumber}-${dailyVerse.ayahNumber}`);
                  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 300);
              }}
              className="text-xs text-emerald-700 dark:text-emerald-400 hover:underline font-semibold inline-flex items-center gap-1"
            >
              <span>Jump to Ayah</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          <div className="text-right py-1" dir="rtl">
            <p className="font-arabic text-lg sm:text-xl text-slate-900 dark:text-slate-100 leading-relaxed">
              {dailyVerse.arabic}
            </p>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 italic">
            "{dailyVerse.translation}"
          </p>
        </div>
      )}

      {/* 2. Main Quran Reader Header & Control Bar */}
      <div className="p-4 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-800 text-white flex items-center justify-center shadow-sm shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                  The Noble Quran (القرآن الكريم)
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300/40 dark:border-emerald-700/40 hidden sm:inline">
                  Verified Uthmani · 114 Surahs · 6,236 Ayahs
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Authentic Uthmani Arabic · Maulana Maududi Translation
              </p>
            </div>
          </div>

          {/* View Mode Tabs */}
          <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl self-start sm:self-auto text-xs font-semibold">
            <button
              onClick={() => setViewMode('read')}
              className={`px-3 py-1.5 rounded-lg transition ${
                viewMode === 'read'
                  ? 'bg-white dark:bg-slate-700 text-emerald-800 dark:text-emerald-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Read Surah
            </button>
            <button
              onClick={() => setViewMode('surahList')}
              className={`px-3 py-1.5 rounded-lg transition ${
                viewMode === 'surahList'
                  ? 'bg-white dark:bg-slate-700 text-emerald-800 dark:text-emerald-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Surahs (114)
            </button>
            <button
              onClick={() => setViewMode('juzList')}
              className={`px-3 py-1.5 rounded-lg transition ${
                viewMode === 'juzList'
                  ? 'bg-white dark:bg-slate-700 text-emerald-800 dark:text-emerald-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Juz (30)
            </button>
          </div>
        </div>

        {/* 3. Surah Navigation & Toolbar Controls */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/80">
          {/* Quick Surah Dropdown Selector */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={selectedSurahNumber}
              onChange={(e) => {
                setSelectedSurahNumber(parseInt(e.target.value, 10));
                setViewMode('read');
              }}
              className="w-full sm:w-64 p-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-1 focus:ring-emerald-500"
            >
              {QURAN_SURAHS_META.map((s) => (
                <option key={s.number} value={s.number}>
                  {s.number}. {s.name} ({s.arabicName}) — {s.numberOfAyahs} Ayahs
                </option>
              ))}
            </select>

            {/* Quick Prev / Next Surah */}
            <div className="flex items-center gap-1 shrink-0">
              <button
                disabled={selectedSurahNumber <= 1}
                onClick={() => {
                  setSelectedSurahNumber((prev) => Math.max(1, prev - 1));
                  setViewMode('read');
                }}
                title="Previous Surah"
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 disabled:opacity-40 transition"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                disabled={selectedSurahNumber >= 114}
                onClick={() => {
                  setSelectedSurahNumber((prev) => Math.min(114, prev + 1));
                  setViewMode('read');
                }}
                title="Next Surah"
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 disabled:opacity-40 transition"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Reading Controls: Font Size, Toggles & Bookmarks Filter */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Arabic Font Resizer */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
              <span className="text-[10px] text-slate-400 pl-1.5 pr-0.5">Arabic:</span>
              <button
                onClick={() => setArabicFontSize('normal')}
                className={`px-2 py-0.5 rounded-lg text-xs font-semibold transition ${
                  arabicFontSize === 'normal'
                    ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                A
              </button>
              <button
                onClick={() => setArabicFontSize('large')}
                className={`px-2 py-0.5 rounded-lg text-xs font-semibold transition ${
                  arabicFontSize === 'large'
                    ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                A+
              </button>
              <button
                onClick={() => setArabicFontSize('huge')}
                className={`px-2 py-0.5 rounded-lg text-xs font-semibold transition ${
                  arabicFontSize === 'huge'
                    ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                A++
              </button>
            </div>

            {/* Translation Toggle */}
            <button
              onClick={() => setShowTranslation((prev) => !prev)}
              title={showTranslation ? 'Hide English Translation' : 'Show English Translation'}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl font-medium border transition ${
                showTranslation
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500'
              }`}
            >
              {showTranslation ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              <span>Translation</span>
            </button>

            {/* Bookmarks Filter */}
            <button
              onClick={() => setFilterBookmarkedOnly((prev) => !prev)}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl font-medium border transition ${
                filterBookmarkedOnly
                  ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500'
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${filterBookmarkedOnly ? 'fill-amber-400' : ''}`} />
              <span>Saved</span>
            </button>

            {/* Source Info Button */}
            <button
              onClick={() => setShowAttributionModal(true)}
              title="Verified Content Attributions & Authenticity"
              className="p-1.5 rounded-xl text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition"
            >
              <Info className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Jump to Ayah Form */}
        {viewMode === 'read' && (
          <form onSubmit={handleJumpToAyah} className="flex items-center gap-2 pt-1 text-xs">
            <span className="text-slate-500 dark:text-slate-400 font-medium">
              Surah {currentMeta.number} has {currentMeta.numberOfAyahs} Ayahs:
            </span>
            <input
              type="number"
              min="1"
              max={currentMeta.numberOfAyahs}
              placeholder="Ayah #"
              value={jumpAyahInput}
              onChange={(e) => setJumpAyahInput(e.target.value)}
              className="w-20 p-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
            />
            <button
              type="submit"
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 font-semibold text-slate-700 dark:text-slate-200 transition"
            >
              Jump
            </button>
          </form>
        )}
      </div>

      {/* 4. CONTENT SECTIONS ACCORDING TO VIEW MODE */}

      {/* A. SURAH DIRECTORY (All 114 Surahs) */}
      {viewMode === 'surahList' && (
        <div className="p-4 sm:p-6 border-t border-slate-100 dark:border-slate-800 space-y-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Surah name, English meaning, or number (1-114)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-[500px] overflow-y-auto pr-1">
            {filteredSurahsList.map((surah) => {
              const isSelected = surah.number === selectedSurahNumber;
              return (
                <button
                  key={surah.number}
                  onClick={() => {
                    setSelectedSurahNumber(surah.number);
                    setViewMode('read');
                    setSearchQuery('');
                  }}
                  className={`p-3 rounded-2xl border text-left flex items-center justify-between gap-2 transition ${
                    isSelected
                      ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 shadow-xs'
                      : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-800/40 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-xs text-slate-700 dark:text-slate-300 shrink-0">
                      {surah.number}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {surah.name}
                      </h4>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                        {surah.englishTranslation} · {surah.numberOfAyahs} Ayahs
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-arabic text-sm text-emerald-800 dark:text-emerald-300 block">
                      {surah.arabicName}
                    </span>
                    <span className="text-[9px] uppercase tracking-wider text-slate-400">
                      {surah.revelationType}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* B. JUZ DIRECTORY (All 30 Juz) */}
      {viewMode === 'juzList' && (
        <div className="p-4 sm:p-6 border-t border-slate-100 dark:border-slate-800 space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 max-h-[500px] overflow-y-auto pr-1">
            {QURAN_JUZ_META.map((j) => {
              const startSurahMeta = QURAN_SURAHS_META.find((s) => s.number === j.surah);
              return (
                <button
                  key={j.juz}
                  onClick={() => handleSelectJuz(j.juz)}
                  className="p-3 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-800/40 hover:border-emerald-500 text-left transition"
                >
                  <div className="flex items-center justify-between pb-1">
                    <span className="text-xs font-extrabold text-emerald-700 dark:text-emerald-400">
                      Juz {j.juz}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Part {j.juz}/30
                    </span>
                  </div>
                  <p className="text-[11px] font-medium text-slate-800 dark:text-slate-200 truncate">
                    Starts: {startSurahMeta ? startSurahMeta.name : `Surah ${j.surah}`} {j.ayah}
                  </p>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">
                    Surah {j.surah}:{j.ayah}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* C. SURAH READING VIEW (Verse-by-Verse Reader) */}
      {viewMode === 'read' && (
        <div className="border-t border-slate-100 dark:border-slate-800">
          {/* Surah Header Card with Authentic Bismillah */}
          <div className="p-5 sm:p-8 bg-gradient-to-b from-emerald-50/50 to-white dark:from-emerald-950/20 dark:to-slate-900 border-b border-slate-100 dark:border-slate-800 text-center space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-semibold">
              <span>Surah {currentMeta.number}</span>
              <span>·</span>
              <span>{currentMeta.revelationType}</span>
              <span>·</span>
              <span>{currentMeta.numberOfAyahs} Ayahs</span>
              <span>·</span>
              <span>{currentMeta.rukus} Rukus</span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {currentMeta.name} — <span className="font-arabic font-normal text-emerald-800 dark:text-emerald-300">{currentMeta.arabicName}</span>
            </h3>

            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              English Meaning: "{currentMeta.englishTranslation}"
            </p>

            {/* Authentic Bismillah for all chapters except Surah 9 (At-Tawbah) */}
            {currentMeta.number !== 9 && (
              <div className="pt-3" dir="rtl">
                <p className="font-arabic text-2xl sm:text-3xl text-slate-900 dark:text-slate-100 leading-loose select-none">
                  بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 not-italic" dir="ltr">
                  In the name of Allah, the Entirely Merciful, the Especially Merciful
                </p>
              </div>
            )}
          </div>

          {/* Verses Container */}
          {isLoading ? (
            <div className="p-12 text-center text-xs text-slate-500 dark:text-slate-400 space-y-2">
              <div className="w-8 h-8 rounded-full border-2 border-emerald-600 border-t-transparent animate-spin mx-auto" />
              <p>Loading verified Uthmani Arabic text and Maududi translation...</p>
            </div>
          ) : displayedVerses.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-500 dark:text-slate-400">
              No verses match your current filter.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {displayedVerses.map((verse) => {
                const verseKey = `${verse.surahNumber}:${verse.ayahNumber}`;
                const isBookmarked = bookmarkedAyahs.includes(verseKey);

                return (
                  <div
                    key={verseKey}
                    id={`ayah-${verse.surahNumber}-${verse.ayahNumber}`}
                    className={`p-4 sm:p-6 transition-colors ${
                      isBookmarked
                        ? 'bg-amber-50/20 dark:bg-amber-950/10'
                        : 'hover:bg-slate-50/60 dark:hover:bg-slate-800/20'
                    }`}
                  >
                    {/* Verse Header Info & Bookmark Action */}
                    <div className="flex items-center justify-between pb-3 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold font-mono px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {verse.surahNumber}:{verse.ayahNumber}
                        </span>
                        <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 hidden sm:inline">
                          Juz {verse.juz}
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleToggle(verseKey)}
                          title={isBookmarked ? 'Remove Bookmark' : 'Bookmark Verse'}
                          className={`p-1.5 rounded-lg border transition ${
                            isBookmarked
                              ? 'bg-amber-100 border-amber-300 text-amber-700 dark:bg-amber-950 dark:border-amber-700 dark:text-amber-300'
                              : 'border-slate-200 dark:border-slate-700 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                          }`}
                        >
                          <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-amber-500' : ''}`} />
                        </button>

                        <a
                          href={verse.quranLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="View on Quran.com"
                          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>

                    {/* 1. ORIGINAL ARABIC QURAN (Prominently Displayed in Uthmani Script) */}
                    <div className="py-2 text-right" dir="rtl">
                      <p className={`font-arabic text-slate-900 dark:text-slate-100 ${getArabicTextClass()}`}>
                        {verse.arabic}
                        <span className="inline-flex items-center justify-center font-arabic text-emerald-700 dark:text-emerald-400 mr-2 text-xl select-none">
                          ۝{verse.ayahNumber.toLocaleString('ar-EG')}
                        </span>
                      </p>
                    </div>

                    {/* 2. ENGLISH TRANSLATION – MAULANA ABUL A'LA MAUDUDI (Tafhim al-Qur'an, trans. Zafar Ishaq Ansari) */}
                    {showTranslation && (
                      <div className="pt-2 text-left border-t border-slate-100/80 dark:border-slate-800/50 mt-2">
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                            Maududi (Tafhim al-Qur'an)
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed">
                          {verse.translation}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Surah Footer Navigation */}
          <div className="p-4 sm:p-6 bg-slate-50/60 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <button
              disabled={selectedSurahNumber <= 1}
              onClick={() => {
                setSelectedSurahNumber((prev) => Math.max(1, prev - 1));
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 disabled:opacity-40 hover:bg-slate-50 transition shadow-xs"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Previous Surah</span>
            </button>

            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Surah {currentMeta.number} of 114
            </span>

            <button
              disabled={selectedSurahNumber >= 114}
              onClick={() => {
                setSelectedSurahNumber((prev) => Math.min(114, prev + 1));
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 disabled:opacity-40 hover:bg-slate-50 transition shadow-xs"
            >
              <span>Next Surah</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* 5. Attribution & Source Verification Modal */}
      {showAttributionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Info className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Quran Text Sources & Attributions
                </h3>
              </div>
              <button
                onClick={() => setShowAttributionModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                <h4 className="font-bold text-slate-900 dark:text-white">
                  1. Arabic Quran (Verified Uthmani Script)
                </h4>
                <p className="mt-1">
                  Source: <strong>Tanzil Project (tanzil.net)</strong>.
                </p>
                <p className="mt-0.5 text-[11px] text-slate-500">
                  Licence: Creative Commons Attribution 3.0 License. Preserves authentic Madina Mushaf Unicode glyphs and diacritics.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                <h4 className="font-bold text-slate-900 dark:text-white">
                  2. English Translation – Maulana Abul A'la Maududi
                </h4>
                <p className="mt-1">
                  Work: <em>Towards Understanding the Qur'an (Tafhim al-Qur'an)</em>.
                </p>
                <p className="mt-0.5 text-[11px] text-slate-500">
                  Translated by <strong>Dr. Zafar Ishaq Ansari</strong>. Hosted in the Tanzil translation archive (en.maududi).
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowAttributionModal(false)}
              className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
