import React, { useState } from 'react';
import { Bookmark, BookmarkCheck, ExternalLink, Type, Search, ArrowRight } from 'lucide-react';
import { QURAN_SURAHS, SurahSummary } from '../data/quranData';
import { QuranVerse } from '../types';

interface QuranViewProps {
  bookmarkedAyahs: string[];
  onToggleBookmark: (verseKey: string) => void;
}

export const QuranView: React.FC<QuranViewProps> = ({
  bookmarkedAyahs,
  onToggleBookmark,
}) => {
  const [selectedSurahNumber, setSelectedSurahNumber] = useState<number>(1);
  const [fontSizeClass, setFontSizeClass] = useState<'normal' | 'large' | 'huge'>('large');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterBookmarkedOnly, setFilterBookmarkedOnly] = useState(false);

  const currentSurah: SurahSummary =
    QURAN_SURAHS.find((s) => s.number === selectedSurahNumber) || QURAN_SURAHS[0];

  const getVerseKey = (verse: QuranVerse) => `${verse.surahNumber}:${verse.ayahNumber}`;

  // Filter verses
  const displayedVerses = currentSurah.verses.filter((verse) => {
    const key = getVerseKey(verse);
    if (filterBookmarkedOnly && !bookmarkedAyahs.includes(key)) return false;

    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      verse.arabic.includes(q) ||
      verse.translation.toLowerCase().includes(q) ||
      (verse.transliteration && verse.transliteration.toLowerCase().includes(q))
    );
  });

  const getArabicSizeClass = () => {
    switch (fontSizeClass) {
      case 'normal':
        return 'text-xl leading-relaxed';
      case 'large':
        return 'text-2xl md:text-3xl leading-loose';
      case 'huge':
        return 'text-3xl md:text-4xl leading-loose';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Surah Selector */}
      <div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-2">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              The Noble Quran
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Complete offline access to essential chapters, authentic translations, and direct verse references on Quran.com
            </p>
          </div>

          {/* Font Resizer */}
          <div className="flex items-center gap-2 self-start md:self-auto">
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <Type className="w-3.5 h-3.5" /> Size:
            </span>
            <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
              <button
                onClick={() => setFontSizeClass('normal')}
                className={`px-2 py-0.5 text-xs font-medium rounded-lg transition ${
                  fontSizeClass === 'normal'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                A
              </button>
              <button
                onClick={() => setFontSizeClass('large')}
                className={`px-2.5 py-0.5 text-sm font-semibold rounded-lg transition ${
                  fontSizeClass === 'large'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                A+
              </button>
              <button
                onClick={() => setFontSizeClass('huge')}
                className={`px-3 py-0.5 text-base font-bold rounded-lg transition ${
                  fontSizeClass === 'huge'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                A++
              </button>
            </div>
          </div>
        </div>

        {/* Surahs Horizontal Chips */}
        <div className="mt-3 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {QURAN_SURAHS.map((surah) => {
            const isSelected = surah.number === selectedSurahNumber;
            return (
              <button
                key={surah.number}
                onClick={() => {
                  setSelectedSurahNumber(surah.number);
                  setSearchQuery('');
                }}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 transition-colors ${
                  isSelected
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <span className="w-5 h-5 rounded-full bg-black/10 dark:bg-white/10 flex items-center justify-center text-[10px] font-mono">
                  {surah.number}
                </span>
                <span>{surah.name}</span>
                <span className="font-arabic text-xs ml-1 opacity-80">{surah.arabicName}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Surah Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-900 to-teal-950 text-white shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-emerald-300 text-xs font-medium">
              <span>Surah {currentSurah.number}</span>
              <span>·</span>
              <span>{currentSurah.revelationType}</span>
              <span>·</span>
              <span>{currentSurah.numberOfAyahs} Ayahs</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold mt-1">
              {currentSurah.name} ({currentSurah.englishTranslation})
            </h2>
          </div>

          <div className="text-right">
            <span className="font-arabic text-3xl md:text-4xl text-amber-300">
              {currentSurah.arabicName}
            </span>
            <div className="mt-1">
              <a
                href={`https://quran.com/${currentSurah.number}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-emerald-200 hover:text-white underline"
              >
                <span>Read Full Surah on Quran.com</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>

        {/* Filter Toolbar inside Surah banner */}
        <div className="mt-4 pt-3 border-t border-emerald-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilterBookmarkedOnly(!filterBookmarkedOnly)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-medium transition ${
                filterBookmarkedOnly
                  ? 'bg-amber-400 text-slate-950'
                  : 'bg-emerald-800/80 hover:bg-emerald-800 text-emerald-100'
              }`}
            >
              <Bookmark className="w-3 h-3" />
              <span>{filterBookmarkedOnly ? 'Showing Bookmarks' : 'Filter Bookmarks'}</span>
            </button>
          </div>

          {/* Search Ayah */}
          <div className="relative min-w-[200px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-emerald-300" />
            <input
              type="text"
              placeholder="Search in this Surah..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1 text-xs rounded-xl border border-emerald-700 bg-emerald-950/60 text-white placeholder-emerald-400/70 focus:outline-none focus:ring-1 focus:ring-amber-400"
            />
          </div>
        </div>
      </div>

      {/* Verses List */}
      <div className="space-y-4">
        {displayedVerses.map((verse) => {
          const key = getVerseKey(verse);
          const isBookmarked = bookmarkedAyahs.includes(key);

          return (
            <div
              key={key}
              className={`rounded-2xl border transition-all duration-150 p-5 md:p-6 ${
                isBookmarked
                  ? 'border-amber-300 dark:border-amber-700/60 bg-amber-50/20 dark:bg-amber-950/15'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm'
              }`}
            >
              {/* Verse Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/80">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 flex items-center justify-center text-xs font-mono font-bold">
                    {verse.surahNumber}:{verse.ayahNumber}
                  </span>
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    {verse.surahName}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onToggleBookmark(key)}
                    title={isBookmarked ? 'Remove Bookmark' : 'Add Bookmark'}
                    className={`p-1.5 rounded-lg transition ${
                      isBookmarked
                        ? 'text-amber-500 bg-amber-100 dark:bg-amber-950/70'
                        : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {isBookmarked ? (
                      <BookmarkCheck className="w-4 h-4 fill-amber-500" />
                    ) : (
                      <Bookmark className="w-4 h-4" />
                    )}
                  </button>

                  <a
                    href={verse.quranLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="View on Quran.com"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>

              {/* Arabic Verse Text */}
              <div className="my-5 text-right" dir="rtl">
                <p className={`font-arabic text-slate-900 dark:text-slate-100 ${getArabicSizeClass()}`}>
                  {verse.arabic}
                </p>
              </div>

              {/* Transliteration */}
              {verse.transliteration && (
                <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400 italic mb-2 leading-relaxed">
                  "{verse.transliteration}"
                </p>
              )}

              {/* English Translation */}
              <p className="text-sm md:text-base text-slate-800 dark:text-slate-200 leading-relaxed font-normal">
                {verse.translation}
              </p>

              {/* Footnote with exact link */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                <span>Sahih International Translation</span>
                <a
                  href={verse.quranLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400 hover:underline font-medium"
                >
                  <span>Verify on Quran.com</span>
                  <ArrowRight className="w-3 h-3" />
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
