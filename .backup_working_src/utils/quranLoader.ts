import { FullSurahData, INITIAL_SURAH_1, QURAN_SURAHS_META } from '../data/quranMeta';

const surahCache = new Map<number, FullSurahData>();
surahCache.set(1, INITIAL_SURAH_1);

/**
 * Loads full Surah data with verified Uthmani Arabic, Roman transliteration, and Maududi English translation
 */
export async function loadSurahData(surahNumber: number): Promise<FullSurahData> {
  if (surahCache.has(surahNumber)) {
    return surahCache.get(surahNumber)!;
  }

  // Check localStorage cache if available
  try {
    const cached = localStorage.getItem(`nur_quran_surah_${surahNumber}`);
    if (cached) {
      const parsed: FullSurahData = JSON.parse(cached);
      if (parsed && parsed.number === surahNumber && parsed.verses?.length > 0) {
        surahCache.set(surahNumber, parsed);
        return parsed;
      }
    }
  } catch {
    // ignore
  }

  try {
    const res = await fetch(`/quran/surahs/${surahNumber}.json`);
    if (!res.ok) {
      throw new Error(`Failed to load Surah ${surahNumber}: HTTP ${res.status}`);
    }
    const data: FullSurahData = await res.json();
    surahCache.set(surahNumber, data);

    try {
      localStorage.setItem(`nur_quran_surah_${surahNumber}`, JSON.stringify(data));
    } catch {
      // localStorage may be full for large Surahs; keep in memory Map
    }

    return data;
  } catch (err) {
    console.error(`[Nur al-Salat] Error loading Surah ${surahNumber}:`, err);
    // If it was Surah 1, fallback to INITIAL_SURAH_1
    if (surahNumber === 1) {
      return INITIAL_SURAH_1;
    }
    const meta = QURAN_SURAHS_META.find((s) => s.number === surahNumber) || QURAN_SURAHS_META[0];
    return {
      ...meta,
      verses: [],
    };
  }
}
