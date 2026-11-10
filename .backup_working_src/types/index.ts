export type SalahName = 'Fajr' | 'Dhuhr' | 'Asr' | 'Maghrib' | 'Isha';
export type PrayerName = SalahName | 'Sunrise';

export interface PrayerTimeItem {
  id: PrayerName;
  name: string;
  arabicName: string;
  time: Date;
  timeString: string;
  endTime?: Date;
  endTimeString?: string;
  isCurrent: boolean;
  isNext: boolean;
  status: 'passed' | 'current' | 'upcoming';
  scholarlyNote?: string;
}

export interface LocationData {
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  timezone: string;
  isManual: boolean;
}

export type CalculationMethodKey =
  | 'MuslimWorldLeague'
  | 'NorthAmerica'
  | 'Egyptian'
  | 'UmmAlQura'
  | 'Karachi'
  | 'Dubai'
  | 'Kuwait'
  | 'Qatar'
  | 'Singapore'
  | 'Tehran';

export type CalculationSelectionMode = 'auto' | 'manual';

export interface RegionalCalculationResolution {
  method: CalculationMethodKey;
  reason: string;
  authority: string;
  parameters: string;
  isHyderabadRule: boolean;
}

export type AdhanAudioId =
  | 'madinah_qassas'
  | 'original_makkah'
  | 'original_madinah'
  | 'sheikh_ali_mulla'
  | 'sheikh_al_sudais'
  | 'mishary_alafasy'
  | 'fajr_authentic'
  | 'sheikh_farooq_hadrawi';

export interface AdhanSetting {
  enabled: boolean;
  selectedAudio: AdhanAudioId;
  useSeparatePerPrayer?: boolean;
  prayerAudios?: Record<SalahName, AdhanAudioId>;
  volume: number; // 0 - 1
  prayers: Record<SalahName, boolean>;
  notificationOnly: boolean;
}

export type ReminderTiming = 'at_time' | 'before_time' | 'both';

export type VibrationPatternType = 'standard' | 'gentle' | 'pulse' | 'urgent';

export interface VibrationPreferences {
  enabled: boolean; // Master ON/OFF
  prayers: Record<SalahName, boolean>;
  pattern: VibrationPatternType;
  vibrateBefore?: boolean;
}

export interface NotificationPreferences {
  enabled: boolean; // Master ON/OFF
  prayers: Record<SalahName, boolean>;
  timing: ReminderTiming;
  beforeMinutes: number; // e.g. 5, 10, 15, 20, 30
  vibration?: VibrationPreferences;
}

export interface CountdownWarningSettings {
  warningMinutes: number; // e.g. 10, 15, 20, 30
}

export interface PrayerHadith {
  salah: SalahName;
  title: string;
  arabic: string;
  english: string;
  collection: string;
  hadithNumber: string;
  grade: string;
  sunnahLink: string;
  urgencyNote?: string;
}

export interface AdhkarItem {
  id: string;
  numberPrefix?: string;
  title?: string;
  arabic: string;
  transliteration?: string;
  translation: string;
  repetitionCount: number; // 1, 3, 33, 100, etc.
  sourceCollection: string;
  hadithReference: string;
  authenticity?: string;
  sunnahLink?: string;
  quranLink?: string;
  urduTranslation?: string;
  notes?: string;
}

export interface AdhkarCategory {
  id: 'morning_evening' | 'after_salah' | 'before_sleep' | 'adhan_to_mosque';
  title: string;
  arabicTitle: string;
  description: string;
  sourceDocName: string;
  items: AdhkarItem[];
}

export interface QuranVerse {
  surahNumber: number;
  surahName: string;
  surahArabic: string;
  ayahNumber: number;
  arabic: string;
  transliteration?: string;
  translation: string;
  quranLink: string;
}

export interface HadithItem {
  id: string;
  category: 'Salah' | 'Tahajjud' | 'Jumuah' | 'Adhkar' | 'Mosque';
  title: string;
  arabic?: string;
  english: string;
  collection: string;
  hadithNumber: string;
  grade: string;
  sunnahLink: string;
}

export type ColorTheme =
  | 'emerald'
  | 'midnight'
  | 'desert'
  | 'purple'
  | 'ocean'
  | 'rose'
  | 'obsidian'
  | 'arctic'
  | 'indigo' // legacy alias for midnight
  | 'sand'; // legacy alias for desert

export type ThemeMode = 'light' | 'dark' | 'system';

export interface UserPreferences {
  theme: ColorTheme;
  themeMode: ThemeMode;
  darkMode: boolean;
  calculationMethod: CalculationMethodKey;
  location: LocationData;
  adhan: AdhanSetting;
  notificationsEnabled: boolean;
  adhkarProgress: Record<string, number>; // item ID -> count completed
  adhkarCompleted: Record<string, boolean>; // item ID -> boolean
  prayerLogs: Record<string, Record<PrayerName, 'prayed' | 'missed' | 'pending'>>; // YYYY-MM-DD -> prayers
  bookmarkedAyahs: string[];
}

export type SunnahCategory =
  | 'rawatib'
  | 'additional_nafl'
  | 'night_prayers'
  | 'occasion_based'
  | 'family_worship';

export type BasharahType =
  | 'palace_in_paradise'
  | 'protection_from_fire'
  | 'forgiveness_of_sins'
  | 'better_than_world'
  | 'divine_mercy'
  | 'charity_equivalent'
  | 'best_prayer'
  | 'general_virtue'
  | 'scholarly_difference';

export interface PerformanceStep {
  step: number;
  title: string;
  instruction: string;
  arabic?: string;
  transliteration?: string;
  translation?: string;
  note?: string;
}

export interface SunnahEntry {
  id: string;
  name: string;
  arabicName: string;
  category: SunnahCategory;
  categoryLabel: string;
  subcategory?: string;
  summary: string;
  arabicText?: string;
  englishTranslation?: string;
  explanation: string;

  // Hadith / Primary Evidence
  narrator?: string;
  collection: string;
  hadithNumber: string;
  authenticityGrade: 'Sahih' | 'Hasan' | 'Da\'if' | 'Disputed' | 'Quranic Ayah';
  gradingScholar?: string;
  sourceLink: string;

  // Basharah / Virtues
  hasBasharah: boolean;
  basharahType?: BasharahType;
  basharahTitle?: string;
  basharahDescription?: string;
  basharahEvidenceGrade: 'Direct Sahih Promise' | 'Hasan Promise' | 'General Virtue' | 'Scholarly Explanation' | 'Disputed Narration';

  // Performance parameters
  rakahs?: number | string;
  isPairFormat?: boolean;
  timingDescription: string;
  preferredTiming?: string;
  conditionsAndRestrictions?: string[];
  scholarlyDifferences?: string;

  // Step-by-step practical guide
  steps?: PerformanceStep[];

  // Schedule key for live daily calendar integration
  scheduleKey?:
    | 'fajr_sunnah'
    | 'duha'
    | 'dhuhr_before'
    | 'dhuhr_after'
    | 'dhuhr_four_four'
    | 'asr_before'
    | 'maghrib_before'
    | 'maghrib_after'
    | 'isha_after'
    | 'witr'
    | 'tahajjud';
}
