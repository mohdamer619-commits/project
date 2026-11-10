import React, { useState } from 'react';
import {
  ExternalLink,
  RotateCcw,
  CheckCircle2,
  BookOpen,
  Search,
  Check,
  ChevronRight,
  Sun,
  Moon,
  Sparkles,
} from 'lucide-react';
import { ADHKAR_CATEGORIES } from '../data/adhkarData';
import { AdhkarItem, AdhkarCategory } from '../types';

interface AdhkarViewProps {
  progress: Record<string, number>;
  completed: Record<string, boolean>;
  onIncrementCount: (id: string, maxCount: number) => void;
  onResetItem: (id: string) => void;
  onResetCategory: (categoryId: string) => void;
  onToggleComplete: (id: string) => void;
}

export const AdhkarView: React.FC<AdhkarViewProps> = ({
  progress,
  completed,
  onIncrementCount,
  onResetItem,
  onResetCategory,
  onToggleComplete,
}) => {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('morning_evening');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'incomplete' | 'completed'>('all');

  const currentCategory: AdhkarCategory =
    ADHKAR_CATEGORIES.find((cat) => cat.id === selectedCategoryId) || ADHKAR_CATEGORIES[0];

  // Calculate category stats
  const totalItems = currentCategory.items.length;
  const completedItemsCount = currentCategory.items.filter((item) => {
    const isChecked = completed[item.id];
    const currentCount = progress[item.id] || 0;
    return isChecked || currentCount >= item.repetitionCount;
  }).length;
  const progressPercent = totalItems > 0 ? Math.round((completedItemsCount / totalItems) * 100) : 0;

  // Filter items
  const filteredItems = currentCategory.items.filter((item) => {
    const isDone = completed[item.id] || (progress[item.id] || 0) >= item.repetitionCount;
    if (filterMode === 'completed' && !isDone) return false;
    if (filterMode === 'incomplete' && isDone) return false;

    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (item.title && item.title.toLowerCase().includes(q)) ||
      item.translation.toLowerCase().includes(q) ||
      (item.transliteration && item.transliteration.toLowerCase().includes(q)) ||
      item.arabic.includes(q) ||
      item.sourceCollection.toLowerCase().includes(q) ||
      item.hadithReference.toLowerCase().includes(q)
    );
  });

  const getCategoryIcon = (catId: string) => {
    switch (catId) {
      case 'morning_evening':
        return <Sun className="w-4 h-4 text-amber-500" />;
      case 'after_salah':
        return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case 'before_sleep':
        return <Moon className="w-4 h-4 text-indigo-400" />;
      case 'adhan_to_mosque':
        return <Sparkles className="w-4 h-4 text-teal-500" />;
      default:
        return <BookOpen className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Category Switcher */}
      <div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-2">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Authentic Adhkar & Supplications
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Primary source collections from Bukhari, Muslim, Tirmidhi, Abu Dawud, An-Nasa’i, and Ibn Majah
            </p>
          </div>

          <button
            onClick={() => onResetCategory(selectedCategoryId)}
            className="self-start md:self-auto flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Category Progress</span>
          </button>
        </div>

        {/* 4 Distinct Category Sheets Tabs (Preserved exactly as provided in the PDF attachments) */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {ADHKAR_CATEGORIES.map((cat) => {
            const isSelected = cat.id === selectedCategoryId;
            const catDoneCount = cat.items.filter(
              (item) => completed[item.id] || (progress[item.id] || 0) >= item.repetitionCount
            ).length;
            const catPercent = Math.round((catDoneCount / cat.items.length) * 100);

            return (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategoryId(cat.id);
                  setSearchQuery('');
                }}
                className={`text-left p-3.5 rounded-2xl border transition-all duration-150 ${
                  isSelected
                    ? 'border-emerald-600 bg-emerald-50/70 dark:bg-emerald-950/40 dark:border-emerald-500 shadow-sm ring-1 ring-emerald-500/30'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getCategoryIcon(cat.id)}
                    <span className="text-xs font-semibold text-slate-900 dark:text-white">
                      {cat.title}
                    </span>
                  </div>
                  <ChevronRight
                    className={`w-3.5 h-3.5 transition-transform ${
                      isSelected ? 'text-emerald-600 rotate-90' : 'text-slate-400'
                    }`}
                  />
                </div>

                <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                  <span className="font-arabic text-xs text-emerald-800 dark:text-emerald-400">
                    {cat.arabicTitle}
                  </span>
                  <span className="tabular-nums font-medium">
                    {catDoneCount} / {cat.items.length} ({catPercent}%)
                  </span>
                </div>

                {/* Progress bar */}
                <div className="mt-2 w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-600 rounded-full transition-all duration-300"
                    style={{ width: `${catPercent}%` }}
                  />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Category Banner & Controls */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {currentCategory.title}
              </h2>
              <span className="text-xs font-arabic text-emerald-700 dark:text-emerald-400">
                {currentCategory.arabicTitle}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {currentCategory.description}
            </p>
          </div>

          {/* Filter and Search Box */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Filter buttons */}
            <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
              <button
                onClick={() => setFilterMode('all')}
                className={`px-2.5 py-1 text-xs font-medium rounded-lg transition ${
                  filterMode === 'all'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                All ({totalItems})
              </button>
              <button
                onClick={() => setFilterMode('incomplete')}
                className={`px-2.5 py-1 text-xs font-medium rounded-lg transition ${
                  filterMode === 'incomplete'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Remaining ({totalItems - completedItemsCount})
              </button>
              <button
                onClick={() => setFilterMode('completed')}
                className={`px-2.5 py-1 text-xs font-medium rounded-lg transition ${
                  filterMode === 'completed'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Done ({completedItemsCount})
              </button>
            </div>

            {/* Search Input */}
            <div className="relative min-w-[200px]">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search dhikr or reference..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Category progress indicator bar */}
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <span>Overall category completion</span>
          <span className="font-semibold text-emerald-700 dark:text-emerald-400 tabular-nums">
            {completedItemsCount} / {totalItems} completed ({progressPercent}%)
          </span>
        </div>
      </div>

      {/* Adhkar Items List */}
      <div className="space-y-4">
        {filteredItems.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500">
            No Adhkar match your current filter. Try selecting "All" or clearing your search.
          </div>
        ) : (
          filteredItems.map((item: AdhkarItem) => {
            const currentCount = progress[item.id] || 0;
            const isDone = completed[item.id] || currentCount >= item.repetitionCount;

            return (
              <div
                key={item.id}
                className={`rounded-2xl border transition-all duration-150 p-5 md:p-6 ${
                  isDone
                    ? 'border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/20 dark:bg-emerald-950/15'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm'
                }`}
              >
                {/* Item Top Bar */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800/80">
                  <div className="flex items-center gap-2">
                    {item.numberPrefix && (
                      <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-100/70 dark:bg-emerald-950/80 px-2 py-0.5 rounded-md">
                        #{item.numberPrefix}
                      </span>
                    )}
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                      {item.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Mark as Done Checkbox Button */}
                    <button
                      onClick={() => onToggleComplete(item.id)}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition ${
                        isDone
                          ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>{isDone ? 'Completed' : 'Mark Done'}</span>
                    </button>

                    <button
                      onClick={() => onResetItem(item.id)}
                      title="Reset count"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Arabic Text Display */}
                <div className="my-4 text-right" dir="rtl">
                  <p className="font-arabic text-xl md:text-2xl text-slate-900 dark:text-slate-100 leading-loose">
                    {item.arabic}
                  </p>
                </div>

                {/* Transliteration */}
                {item.transliteration && (
                  <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400 italic mb-2 leading-relaxed">
                    "{item.transliteration}"
                  </p>
                )}

                {/* English Translation */}
                <p className="text-xs md:text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-normal">
                  {item.translation}
                </p>

                {/* Scholarly context / Notes */}
                {item.notes && (
                  <div className="mt-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs text-slate-600 dark:text-slate-400">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Note: </span>
                    {item.notes}
                  </div>
                )}

                {/* Bottom Bar: Repetition Counter & Source Link */}
                <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
                  {/* Verified Sources with links */}
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="font-medium text-slate-600 dark:text-slate-400">
                      {item.sourceCollection} {item.hadithReference}
                    </span>
                    {item.authenticity && (
                      <span className="text-[11px] px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-medium">
                        {item.authenticity}
                      </span>
                    )}

                    {item.sunnahLink && (
                      <a
                        href={item.sunnahLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 dark:text-emerald-400 hover:underline ml-1"
                      >
                        <span>Verify on Sunnah.com</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}

                    {item.quranLink && (
                      <a
                        href={item.quranLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-600 dark:text-blue-400 hover:underline ml-1"
                      >
                        <span>View on Quran.com</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>

                  {/* Interactive Repetition Counter */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onIncrementCount(item.id, item.repetitionCount)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-transform active:scale-95 ${
                        isDone
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
                      }`}
                    >
                      <span>Repeat</span>
                      <span className="tabular-nums font-mono px-1.5 py-0.5 rounded bg-black/10 dark:bg-white/10">
                        {currentCount} / {item.repetitionCount}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
