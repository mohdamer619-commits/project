import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  ExternalLink,
  BookOpen,
  Sparkles,
  Flame,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Heart,
  Home,
  Users,
  Moon,
  Sun,
  ShieldAlert,
  ChevronRight,
  Info,
  Copy,
  Check,
  Calendar,
  Layers,
  ArrowRight,
} from 'lucide-react';
import {
  SUNNAH_WORSHIP_ENTRIES,
  SUNNAH_CATEGORIES_CONFIG,
} from '../data/sunnahWorshipData';
import { SunnahEntry, SunnahCategory, BasharahType } from '../types';
import { DayPrayerSchedule, formatPrayerTime } from '../utils/prayerCalc';

interface SunnahWorshipViewProps {
  schedule?: DayPrayerSchedule;
  timezone?: string;
  onNavigateToTab?: (tab: string) => void;
}

export const SunnahWorshipView: React.FC<SunnahWorshipViewProps> = ({
  schedule,
  timezone,
}) => {
  // Navigation tabs within Sunnah & Worship Library
  const [activeCategoryTab, setActiveCategoryTab] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCollection, setSelectedCollection] = useState<string>('all');
  const [selectedGrade, setSelectedGrade] = useState<string>('all');
  const [selectedBasharahFilter, setSelectedBasharahFilter] = useState<string>('all');

  // Modal / Detail drawer for selected entry
  const [selectedEntry, setSelectedEntry] = useState<SunnahEntry | null>(null);
  const [copiedArabicId, setCopiedArabicId] = useState<string | null>(null);

  // Copy Arabic handler
  const handleCopyArabic = (text: string, id: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedArabicId(id);
    setTimeout(() => setCopiedArabicId(null), 2000);
  };

  // Distinct Collections list for filter
  const collectionsList = useMemo(() => {
    const set = new Set<string>();
    SUNNAH_WORSHIP_ENTRIES.forEach((e) => {
      if (e.collection) set.add(e.collection);
    });
    return Array.from(set).sort();
  }, []);

  // Filtered entries for All Entries / Category views
  const filteredEntries = useMemo(() => {
    return SUNNAH_WORSHIP_ENTRIES.filter((entry) => {
      // 1. Category Tab Filter
      if (activeCategoryTab !== 'all' && activeCategoryTab !== 'virtues_promises' && activeCategoryTab !== 'daily_timetable') {
        if (entry.category !== activeCategoryTab) return false;
      }

      // 2. Virtues & Promises Tab Filter
      if (activeCategoryTab === 'virtues_promises') {
        if (!entry.hasBasharah && entry.authenticityGrade !== 'Disputed') return false;
        if (selectedBasharahFilter !== 'all' && entry.basharahType !== selectedBasharahFilter) return false;
      }

      // 3. Collection Filter
      if (selectedCollection !== 'all' && entry.collection !== selectedCollection) {
        return false;
      }

      // 4. Authenticity Grade Filter
      if (selectedGrade !== 'all' && entry.authenticityGrade !== selectedGrade) {
        return false;
      }

      // 5. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = entry.name.toLowerCase().includes(q);
        const matchArabic = entry.arabicName.includes(q) || (entry.arabicText && entry.arabicText.includes(q));
        const matchSummary = entry.summary.toLowerCase().includes(q);
        const matchExplanation = entry.explanation.toLowerCase().includes(q);
        const matchNarrator = entry.narrator ? entry.narrator.toLowerCase().includes(q) : false;
        const matchHadithNum = entry.hadithNumber.toLowerCase().includes(q);
        const matchCollection = entry.collection.toLowerCase().includes(q);
        const matchVirtue = entry.basharahTitle ? entry.basharahTitle.toLowerCase().includes(q) : false;
        if (!matchName && !matchArabic && !matchSummary && !matchExplanation && !matchNarrator && !matchHadithNum && !matchCollection && !matchVirtue) {
          return false;
        }
      }

      return true;
    });
  }, [activeCategoryTab, selectedCollection, selectedGrade, selectedBasharahFilter, searchQuery]);

  // Live Daily Timetable calculations
  const timetableWindows = useMemo(() => {
    if (!schedule) return [];

    const now = new Date();
    const fajr = schedule.fajr;
    const sunrise = schedule.sunrise;
    const dhuhr = schedule.dhuhr;
    const asr = schedule.asr;
    const maghrib = schedule.maghrib;
    const isha = schedule.isha;
    const lastThird = schedule.lastThirdOfTheNight;

    // Duha start: sunrise + 18 min; Duha end: dhuhr - 15 min
    const duhaStart = new Date(sunrise.getTime() + 18 * 60000);
    const duhaEnd = new Date(dhuhr.getTime() - 15 * 60000);

    // Duha preferred (Salat al-Awwabin): 10:00 AM to 11:30 AM local
    const awwabinStart = new Date(sunrise.getTime() + (dhuhr.getTime() - sunrise.getTime()) * 0.55);
    const awwabinEnd = new Date(sunrise.getTime() + (dhuhr.getTime() - sunrise.getTime()) * 0.85);

    const items = [
      {
        id: 'fajr_sunnah',
        name: 'Two Rak’ahs Before Fajr',
        category: 'Sunnah Rawatib',
        virtue: 'Better than the world & all its wealth (Sahih Muslim 725a)',
        reference: 'Sahih Muslim 725a',
        startTime: fajr,
        endTime: new Date(fajr.getTime() + 35 * 60000), // approximate congregation start
        isCurrent: now >= fajr && now <= sunrise,
        isPreferred: now >= fajr && now <= new Date(fajr.getTime() + 30 * 60000),
        status: now > sunrise ? 'passed' : now >= fajr ? 'active' : 'upcoming',
        linkedEntryId: 'rawatib_fajr_2',
      },
      {
        id: 'duha_window',
        name: 'Duha / Ishraq / Chasht',
        category: 'Additional Nafl',
        virtue: 'Fulfills daily charity for all 360 joints (Sahih Muslim 720)',
        reference: 'Sahih Muslim 720 & 748',
        startTime: duhaStart,
        endTime: duhaEnd,
        isCurrent: now >= duhaStart && now <= duhaEnd,
        isPreferred: now >= awwabinStart && now <= awwabinEnd,
        preferredLabel: 'Salat al-Awwabin (Mid-morning preferred window)',
        status: now > duhaEnd ? 'passed' : now >= duhaStart ? 'active' : 'upcoming',
        linkedEntryId: 'nafl_duha_ishraq_chasht',
      },
      {
        id: 'dhuhr_before_window',
        name: 'Four Rak’ahs Before Dhuhr (2+2)',
        category: 'Sunnah Rawatib',
        virtue: 'Part of the 12 Daily Rawatib Palace (Sahih Muslim 728a)',
        reference: 'Sahih al-Bukhari 1182 & Muslim 728a',
        startTime: dhuhr,
        endTime: new Date(dhuhr.getTime() + 25 * 60000),
        isCurrent: now >= dhuhr && now <= asr,
        isPreferred: now >= dhuhr && now <= new Date(dhuhr.getTime() + 25 * 60000),
        status: now > asr ? 'passed' : now >= dhuhr ? 'active' : 'upcoming',
        linkedEntryId: 'rawatib_dhuhr_before_4',
      },
      {
        id: 'dhuhr_after_window',
        name: 'Two to Four Rak’ahs After Dhuhr',
        category: 'Sunnah Rawatib & Nafl',
        virtue: '4 before & 4 after forbids body from Fire (Abu Dawud 1269)',
        reference: 'Sunan Abi Dawud 1269 & Muslim 728a',
        startTime: new Date(dhuhr.getTime() + 20 * 60000),
        endTime: asr,
        isCurrent: now >= new Date(dhuhr.getTime() + 20 * 60000) && now <= asr,
        isPreferred: now >= new Date(dhuhr.getTime() + 25 * 60000) && now <= new Date(dhuhr.getTime() + 60 * 60000),
        status: now > asr ? 'passed' : now >= dhuhr ? 'active' : 'upcoming',
        linkedEntryId: 'rawatib_dhuhr_4_before_4_after',
      },
      {
        id: 'asr_before_window',
        name: 'Four Rak’ahs Before Asr (2+2)',
        category: 'Additional Nafl',
        virtue: 'Prophet’s du’a for Divine Mercy (Tirmidhi 430)',
        reference: 'Jami’ at-Tirmidhi 430',
        startTime: asr,
        endTime: new Date(asr.getTime() + 25 * 60000),
        isCurrent: now >= asr && now <= new Date(asr.getTime() + 30 * 60000),
        isPreferred: now >= asr && now <= new Date(asr.getTime() + 25 * 60000),
        status: now > new Date(asr.getTime() + 30 * 60000) ? 'passed' : now >= asr ? 'active' : 'upcoming',
        linkedEntryId: 'nafl_asr_before_4',
      },
      {
        id: 'maghrib_before_window',
        name: 'Two Rak’ahs Before Maghrib (Optional)',
        category: 'Additional Nafl',
        virtue: 'Optional Sunnah for whoever wishes (Sahih al-Bukhari 1183)',
        reference: 'Sahih al-Bukhari 1183',
        startTime: maghrib,
        endTime: new Date(maghrib.getTime() + 15 * 60000),
        isCurrent: now >= maghrib && now <= new Date(maghrib.getTime() + 15 * 60000),
        status: now > new Date(maghrib.getTime() + 15 * 60000) ? 'passed' : now >= maghrib ? 'active' : 'upcoming',
        linkedEntryId: 'nafl_maghrib_before_2',
      },
      {
        id: 'maghrib_after_window',
        name: 'Two Rak’ahs After Maghrib',
        category: 'Sunnah Rawatib',
        virtue: 'Confirmed Sunnah in the Home (Sahih Muslim 728a)',
        reference: 'Sahih Muslim 728a & Bukhari 1180',
        startTime: new Date(maghrib.getTime() + 15 * 60000),
        endTime: isha,
        isCurrent: now >= new Date(maghrib.getTime() + 15 * 60000) && now <= isha,
        isPreferred: now >= new Date(maghrib.getTime() + 15 * 60000) && now <= new Date(maghrib.getTime() + 45 * 60000),
        status: now > isha ? 'passed' : now >= maghrib ? 'active' : 'upcoming',
        linkedEntryId: 'rawatib_maghrib_after_2',
      },
      {
        id: 'isha_after_window',
        name: 'Two Rak’ahs After Isha',
        category: 'Sunnah Rawatib',
        virtue: 'Seals the 12 Daily Rawatib Palace (Sahih Muslim 728a)',
        reference: 'Sahih Muslim 728a',
        startTime: new Date(isha.getTime() + 20 * 60000),
        endTime: fajr,
        isCurrent: now >= new Date(isha.getTime() + 20 * 60000) || now < fajr,
        status: now >= new Date(isha.getTime() + 20 * 60000) || now < fajr ? 'active' : 'upcoming',
        linkedEntryId: 'rawatib_isha_after_2',
      },
      {
        id: 'witr_window',
        name: 'Salat al-Witr (1 or 3 Rak’ahs)',
        category: 'Night Prayers',
        virtue: 'Beloved to Allah; Sunnah Mu’akkadah seal of the night',
        reference: 'Jami’ at-Tirmidhi 453',
        startTime: new Date(isha.getTime() + 25 * 60000),
        endTime: fajr,
        isCurrent: now >= new Date(isha.getTime() + 25 * 60000) || now < fajr,
        isPreferred: now >= lastThird && now < fajr,
        preferredLabel: 'Best in the Last Third of the Night before Fajr',
        status: now >= new Date(isha.getTime() + 25 * 60000) || now < fajr ? 'active' : 'upcoming',
        linkedEntryId: 'night_witr',
      },
      {
        id: 'tahajjud_window',
        name: 'Tahajjud / Qiyam al-Layl Vigil',
        category: 'Night Prayers',
        virtue: 'Best prayer after Fard & Divine Descent (Sahih Muslim 1163)',
        reference: 'Sahih al-Bukhari 1145 & Muslim 1163',
        startTime: lastThird,
        endTime: fajr,
        isCurrent: now >= lastThird && now < fajr,
        isPreferred: now >= lastThird && now < fajr,
        preferredLabel: 'Divine Descent active in the Last Third of the Night',
        status: now >= lastThird && now < fajr ? 'active' : now >= isha ? 'upcoming' : 'passed',
        linkedEntryId: 'night_tahajjud_qiyam',
      },
    ];

    return items;
  }, [schedule]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-900 via-teal-900 to-slate-900 text-white p-6 md:p-8 shadow-xl border border-emerald-800/40">
        <div className="absolute -right-12 -top-12 w-64 h-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -left-12 -bottom-12 w-64 h-64 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-800/60 border border-emerald-700/50 text-[11px] font-semibold text-emerald-200">
            <BookOpen className="w-3.5 h-3.5 text-amber-300" />
            <span>Central Islamic Knowledge & Reference Library</span>
          </div>

          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Authentic Sunnah, Hadith References & Family Worship
          </h1>

          <p className="text-xs md:text-sm text-emerald-100/90 max-w-3xl leading-relaxed">
            Every prayer, regular Rawatib, night vigil, and family worship practice documented with primary evidence from Sahih al-Bukhari, Sahih Muslim, Sunan collections, and verified scholarly gradings. Every promise verified; zero invented rewards.
          </p>

          {/* Quick Stats Pill Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="text-[10px] uppercase font-bold text-emerald-300">Daily Rawatib</div>
              <div className="text-base font-bold text-white mt-0.5">12 Rak’ahs</div>
              <div className="text-[10px] text-emerald-200/70">Palace in Jannah (Muslim 728a)</div>
            </div>
            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="text-[10px] uppercase font-bold text-amber-300">Duha & Forenoon</div>
              <div className="text-base font-bold text-white mt-0.5">360 Charities</div>
              <div className="text-[10px] text-emerald-200/70">Covers all joints (Muslim 720)</div>
            </div>
            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="text-[10px] uppercase font-bold text-teal-300">Night Vigil</div>
              <div className="text-base font-bold text-white mt-0.5">Tahajjud & Witr</div>
              <div className="text-[10px] text-emerald-200/70">Best prayer after Fard</div>
            </div>
            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="text-[10px] uppercase font-bold text-purple-300">Family Tarbiyah</div>
              <div className="text-base font-bold text-white mt-0.5">Household Light</div>
              <div className="text-[10px] text-emerald-200/70">Prophetic balance & mercy</div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs Bar */}
      <div className="space-y-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
          {SUNNAH_CATEGORIES_CONFIG.map((cat) => {
            const isActive = activeCategoryTab === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategoryTab(cat.id)}
                className={`px-4 py-2 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all duration-200 shadow-sm flex items-center gap-2 ${
                  isActive
                    ? 'bg-emerald-700 text-white shadow-emerald-700/20 shadow-md font-bold'
                    : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                {cat.id === 'all' && <Layers className="w-3.5 h-3.5" />}
                {cat.id === 'daily_timetable' && <Calendar className="w-3.5 h-3.5 text-amber-500" />}
                {cat.id === 'virtues_promises' && <Sparkles className="w-3.5 h-3.5 text-amber-400" />}
                {cat.id === 'rawatib' && <Clock className="w-3.5 h-3.5 text-emerald-500" />}
                {cat.id === 'additional_nafl' && <Sun className="w-3.5 h-3.5 text-amber-500" />}
                {cat.id === 'night_prayers' && <Moon className="w-3.5 h-3.5 text-indigo-400" />}
                {cat.id === 'occasion_based' && <Heart className="w-3.5 h-3.5 text-rose-500" />}
                {cat.id === 'family_worship' && <Home className="w-3.5 h-3.5 text-teal-500" />}
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Search & Dynamic Filter Row */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          {/* Search Box */}
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search prayers, narrators, hadith numbers, Arabic or topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-xs rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                Clear
              </button>
            )}
          </div>

          {/* Collection Filter */}
          <div className="md:col-span-3">
            <select
              value={selectedCollection}
              onChange={(e) => setSelectedCollection(e.target.value)}
              className="w-full px-3 py-2.5 text-xs rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
            >
              <option value="all">All Hadith Collections</option>
              {collectionsList.map((col) => (
                <option key={col} value={col}>
                  {col}
                </option>
              ))}
            </select>
          </div>

          {/* Authenticity Grade Filter */}
          <div className="md:col-span-2">
            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="w-full px-3 py-2.5 text-xs rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
            >
              <option value="all">All Grades</option>
              <option value="Sahih">Sahih (Rigorous)</option>
              <option value="Hasan">Hasan (Good)</option>
              <option value="Da'if">Da’if (Weak - Clarified)</option>
              <option value="Disputed">Disputed / Under Review</option>
              <option value="Quranic Ayah">Quranic Revelation</option>
            </select>
          </div>

          {/* Active Result Count / Reset */}
          <div className="md:col-span-2 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
            <span>{filteredEntries.length} verified entries</span>
            {(selectedCollection !== 'all' || selectedGrade !== 'all' || searchQuery) && (
              <button
                onClick={() => {
                  setSelectedCollection('all');
                  setSelectedGrade('all');
                  setSearchQuery('');
                  setSelectedBasharahFilter('all');
                }}
                className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline"
              >
                Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ==================================================== */}
      {/* SECTION 1: DAILY VOLUNTARY TIMETABLE VIEW (IF ACTIVE) */}
      {/* ==================================================== */}
      {activeCategoryTab === 'daily_timetable' && (
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/30 border border-emerald-200/80 dark:border-emerald-800/60 flex items-start justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                Live Voluntary Prayer Schedule (Connected to Today’s Times)
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Shows exact permissible and preferred windows calculated for your current coordinates. Prohibited (Makruh) periods like post-Fajr until sunrise and Zawāl are automatically guarded.
              </p>
            </div>
            <div className="hidden sm:block text-right shrink-0">
              <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300">
                Live Astronomical Sync
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {timetableWindows.map((item) => {
              const matchedEntry = SUNNAH_WORSHIP_ENTRIES.find((e) => e.id === item.linkedEntryId);

              return (
                <div
                  key={item.id}
                  onClick={() => matchedEntry && setSelectedEntry(matchedEntry)}
                  className={`cursor-pointer p-5 rounded-2xl border transition-all duration-200 relative overflow-hidden flex flex-col justify-between gap-3 ${
                    item.isCurrent
                      ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-400 dark:border-emerald-600 shadow-md ring-1 ring-emerald-500/20'
                      : item.status === 'passed'
                      ? 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 opacity-75'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {item.category}
                        </span>
                        {item.isCurrent && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-600 text-white animate-pulse">
                            Active Window
                          </span>
                        )}
                        {item.isPreferred && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                            Preferred Time
                          </span>
                        )}
                      </div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">
                        {item.name}
                      </h3>
                    </div>

                    <div className="text-right">
                      <div className="text-xs font-bold text-slate-900 dark:text-white">
                        {formatPrayerTime(item.startTime, timezone)}
                        {item.endTime && ` – ${formatPrayerTime(item.endTime, timezone)}`}
                      </div>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 capitalize">
                        {item.status}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-xs">
                    <p className="text-emerald-800 dark:text-emerald-400 font-semibold line-clamp-1">
                      {item.virtue}
                    </p>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                      <span>Ref: {item.reference}</span>
                      <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                        View Evidence <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* SECTION 2: VIRTUES & PROMISES (BASHARAH MATRIX)      */}
      {/* ==================================================== */}
      {activeCategoryTab === 'virtues_promises' && (
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40">
            <h2 className="text-base font-bold text-amber-900 dark:text-amber-300 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              Verified Virtues & Promises (Al-Bashā’ir) Matrix
            </h2>
            <p className="text-xs text-amber-800 dark:text-amber-200/80 mt-1">
              Every specific promise—from guaranteed palaces in Paradise to protection from the Fire and forgiveness of sins—is documented strictly from authentic primary Hadiths. Disputed or unverified claims are labelled openly.
            </p>

            {/* Quick Basharah Filters */}
            <div className="flex flex-wrap gap-1.5 mt-3">
              {[
                { id: 'all', label: 'All Virtues' },
                { id: 'palace_in_paradise', label: 'Palace in Paradise' },
                { id: 'protection_from_fire', label: 'Protection from Hellfire' },
                { id: 'forgiveness_of_sins', label: 'Forgiveness of Sins' },
                { id: 'better_than_world', label: 'Better than the World' },
                { id: 'divine_mercy', label: 'Prophet’s Du’a for Mercy' },
                { id: 'charity_equivalent', label: '360 Daily Charities' },
              ].map((pill) => (
                <button
                  key={pill.id}
                  onClick={() => setSelectedBasharahFilter(pill.id)}
                  className={`px-3 py-1 rounded-xl text-xs font-semibold transition ${
                    selectedBasharahFilter === pill.id
                      ? 'bg-amber-600 text-white shadow-sm'
                      : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-amber-200 dark:border-amber-800 hover:border-amber-300'
                  }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* SECTION 3: ENTRY CARDS GRID                          */}
      {/* ==================================================== */}
      {activeCategoryTab !== 'daily_timetable' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredEntries.map((entry) => {
            const isDisputed = entry.authenticityGrade === 'Disputed' || entry.authenticityGrade === "Da'if";

            return (
              <div
                key={entry.id}
                onClick={() => setSelectedEntry(entry)}
                className={`cursor-pointer p-5 md:p-6 rounded-3xl border transition-all duration-200 flex flex-col justify-between gap-4 shadow-sm hover:shadow-md ${
                  isDisputed
                    ? 'bg-amber-50/30 dark:bg-amber-950/10 border-amber-300/80 dark:border-amber-900/60'
                    : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                {/* Header Zone */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/40">
                      {entry.categoryLabel}
                    </span>

                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                        entry.authenticityGrade === 'Sahih'
                          ? 'bg-teal-50 dark:bg-teal-950/70 text-teal-800 dark:text-teal-300'
                          : entry.authenticityGrade === 'Hasan'
                          ? 'bg-blue-50 dark:bg-blue-950/70 text-blue-800 dark:text-blue-300'
                          : entry.authenticityGrade === 'Quranic Ayah'
                          ? 'bg-emerald-100 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-200'
                          : 'bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300'
                      }`}
                    >
                      {entry.authenticityGrade}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {entry.name}
                  </h3>

                  <div className="text-sm font-amiri text-emerald-800 dark:text-emerald-400 text-right leading-loose" dir="rtl">
                    {entry.arabicName}
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                    {entry.summary}
                  </p>
                </div>

                {/* Basharah Highlight Banner (If any) */}
                {entry.hasBasharah && entry.basharahTitle && (
                  <div className="p-3 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/20 border border-amber-200/80 dark:border-amber-800/50 space-y-1">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-900 dark:text-amber-300">
                      {entry.basharahType === 'protection_from_fire' ? (
                        <Flame className="w-3.5 h-3.5 text-orange-600" />
                      ) : (
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      )}
                      <span>{entry.basharahTitle}</span>
                    </div>
                    <p className="text-[11px] text-amber-800/90 dark:text-amber-300/80 line-clamp-1">
                      {entry.basharahDescription}
                    </p>
                  </div>
                )}

                {/* Disputed Notice Banner */}
                {isDisputed && (
                  <div className="p-2.5 rounded-xl bg-amber-100/60 dark:bg-amber-950/40 border border-amber-300/70 dark:border-amber-800/60 text-[11px] text-amber-900 dark:text-amber-300 flex items-center gap-2">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-600" />
                    <span>Scholarly disagreement documented. Click to inspect grading breakdown.</span>
                  </div>
                )}

                {/* Footer with Reference & Quick Action */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                  <div className="text-slate-500 dark:text-slate-400 font-medium">
                    {entry.collection} {entry.hadithNumber}
                  </div>

                  <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 dark:text-emerald-400 hover:underline">
                    View Full Evidence <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {filteredEntries.length === 0 && activeCategoryTab !== 'daily_timetable' && (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
          <Info className="w-8 h-8 text-slate-400 mx-auto" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            No Islamic evidence records found
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            Try adjusting your search keywords, collection filter, or authenticity grade.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCollection('all');
              setSelectedGrade('all');
            }}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 text-white"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* ==================================================== */}
      {/* DETAILED EVIDENCE & METHOD MODAL (FOR SELECTED ENTRY) */}
      {/* ==================================================== */}
      {selectedEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-3xl my-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-6 md:p-8 bg-gradient-to-r from-emerald-800 to-teal-900 text-white relative">
              <button
                onClick={() => setSelectedEntry(null)}
                className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition"
                aria-label="Close modal"
              >
                ✕
              </button>

              <div className="space-y-2 pr-8">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-700/60 text-emerald-200">
                    {selectedEntry.categoryLabel}
                  </span>
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950">
                    Grade: {selectedEntry.authenticityGrade}
                  </span>
                  {selectedEntry.rakahs && (
                    <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-white/15 text-white">
                      {selectedEntry.rakahs}
                    </span>
                  )}
                </div>

                <h2 className="text-xl md:text-2xl font-bold tracking-tight">
                  {selectedEntry.name}
                </h2>

                <div className="text-lg md:text-xl font-amiri text-emerald-200 text-right leading-loose pt-1" dir="rtl">
                  {selectedEntry.arabicName}
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 md:p-8 space-y-6 max-h-[72vh] overflow-y-auto scrollbar-thin">
              {/* Primary Arabic Text & Copy Action */}
              {selectedEntry.arabicText && (
                <div className="p-5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/40 space-y-3">
                  <div className="flex items-center justify-between text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                    <span>Authentic Arabic Matn (Text)</span>
                    <button
                      onClick={() => handleCopyArabic(selectedEntry.arabicText || '', selectedEntry.id)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 transition"
                    >
                      {copiedArabicId === selectedEntry.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Arabic</span>
                        </>
                      )}
                    </button>
                  </div>

                  <p className="text-base md:text-lg font-amiri text-slate-900 dark:text-emerald-100 text-right leading-loose" dir="rtl">
                    {selectedEntry.arabicText}
                  </p>
                </div>
              )}

              {/* English Translation */}
              {selectedEntry.englishTranslation && (
                <div className="space-y-1">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    English Translation
                  </h4>
                  <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                    {selectedEntry.englishTranslation}
                  </p>
                </div>
              )}

              {/* Source Verification Card */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Primary Hadith & Reference Documentation
                  </h4>
                  <a
                    href={selectedEntry.sourceLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline"
                  >
                    <span>Verify on Sunnah.com</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Collection & Number</span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {selectedEntry.collection} {selectedEntry.hadithNumber}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Narrator</span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {selectedEntry.narrator || 'Direct Revelation'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Grading Scholar</span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {selectedEntry.gradingScholar || 'Imams of Hadith'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Promised Virtue / Basharah */}
              {selectedEntry.hasBasharah && selectedEntry.basharahTitle && (
                <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-900/60 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900 dark:text-amber-300">
                      Promised Virtue (Bashārah): {selectedEntry.basharahTitle}
                    </h4>
                  </div>
                  <p className="text-xs text-amber-950 dark:text-amber-200/90 leading-relaxed">
                    {selectedEntry.basharahDescription}
                  </p>
                  <div className="text-[10px] text-amber-800 dark:text-amber-400 font-medium">
                    Evidence Level: {selectedEntry.basharahEvidenceGrade}
                  </div>
                </div>
              )}

              {/* Simple English Explanation */}
              <div className="space-y-1">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Explanation & Scholarly Context
                </h4>
                <p className="text-xs md:text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                  {selectedEntry.explanation}
                </p>
              </div>

              {/* Performance Parameters & Timing */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-1">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Permissible Timing</div>
                  <div className="font-semibold text-slate-900 dark:text-white">
                    {selectedEntry.timingDescription}
                  </div>
                </div>
                {selectedEntry.preferredTiming && (
                  <div className="p-3.5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/40 space-y-1">
                    <div className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-400">Preferred Sunnah Timing</div>
                    <div className="font-semibold text-emerald-900 dark:text-emerald-200">
                      {selectedEntry.preferredTiming}
                    </div>
                  </div>
                )}
              </div>

              {/* Conditions & Restrictions */}
              {selectedEntry.conditionsAndRestrictions && selectedEntry.conditionsAndRestrictions.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Conditions & Prohibitions (Makruh Safeguards)
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                    {selectedEntry.conditionsAndRestrictions.map((cond, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                        <span>{cond}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Scholarly Differences (If any) */}
              {selectedEntry.scholarlyDifferences && (
                <div className="p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-900/40 space-y-1 text-xs">
                  <h4 className="font-bold text-blue-900 dark:text-blue-300">
                    Scholarly Clarifications & Juristic Perspectives
                  </h4>
                  <p className="text-blue-950 dark:text-blue-200/90 leading-relaxed">
                    {selectedEntry.scholarlyDifferences}
                  </p>
                </div>
              )}

              {/* Step-by-Step Practical Performance Guide */}
              {selectedEntry.steps && selectedEntry.steps.length > 0 && (
                <div className="space-y-3 pt-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    How to Perform — Step-by-Step Practical Guide
                  </h4>

                  <div className="space-y-2.5">
                    {selectedEntry.steps.map((step) => (
                      <div
                        key={step.step}
                        className="p-3.5 rounded-2xl bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex items-start gap-3"
                      >
                        <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                          {step.step}
                        </span>
                        <div className="space-y-1 flex-1">
                          <h5 className="text-xs font-bold text-slate-900 dark:text-white">
                            {step.title}
                          </h5>
                          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                            {step.instruction}
                          </p>

                          {step.arabic && (
                            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 mt-2 space-y-1">
                              <p className="text-sm font-amiri text-slate-900 dark:text-emerald-100 text-right leading-loose" dir="rtl">
                                {step.arabic}
                              </p>
                              {step.transliteration && (
                                <p className="text-[11px] text-slate-500 italic">
                                  {step.transliteration}
                                </p>
                              )}
                              {step.translation && (
                                <p className="text-[11px] text-slate-700 dark:text-slate-300">
                                  "{step.translation}"
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <a
                href={selectedEntry.sourceLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline"
              >
                <span>Read Full Hadith Context on Sunnah.com</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <button
                onClick={() => setSelectedEntry(null)}
                className="px-5 py-2 rounded-xl text-xs font-semibold bg-emerald-700 hover:bg-emerald-800 text-white transition"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
