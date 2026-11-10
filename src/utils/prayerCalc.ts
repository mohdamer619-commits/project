import {
  Coordinates,
  CalculationMethod,
  PrayerTimes,
  SunnahTimes,
  Madhab,
} from 'adhan';
import { CalculationMethodKey, LocationData, PrayerTimeItem, PrayerName } from '../types';

export function getAdhanCalculationMethod(key: CalculationMethodKey) {
  switch (key) {
    case 'MuslimWorldLeague':
      return CalculationMethod.MuslimWorldLeague();
    case 'NorthAmerica':
      return CalculationMethod.NorthAmerica();
    case 'Egyptian':
      return CalculationMethod.Egyptian();
    case 'UmmAlQura':
      return CalculationMethod.UmmAlQura();
    case 'Karachi':
      return CalculationMethod.Karachi();
    case 'Dubai':
      return CalculationMethod.Dubai();
    case 'Kuwait':
      return CalculationMethod.Kuwait();
    case 'Qatar':
      return CalculationMethod.Qatar();
    case 'Singapore':
      return CalculationMethod.Singapore();
    case 'Tehran':
      return CalculationMethod.Tehran();
    default:
      return CalculationMethod.MuslimWorldLeague();
  }
}

/**
 * Checks if a location is situated in India via country, timezone, city name, or GPS bounds
 */
export function isLocationInIndia(location?: LocationData | null): boolean {
  if (!location) return false;
  if (location.country && location.country.toLowerCase().includes('india')) return true;
  if (
    location.city &&
    ['hyderabad', 'new delhi', 'delhi', 'mumbai', 'bengaluru', 'bangalore', 'chennai', 'kolkata'].some((c) =>
      location.city.toLowerCase().includes(c)
    )
  ) {
    return true;
  }
  if (location.timezone === 'Asia/Kolkata' || location.timezone === 'Asia/Calcutta') return true;
  if (
    typeof location.latitude === 'number' &&
    typeof location.longitude === 'number' &&
    location.latitude >= 6.0 &&
    location.latitude <= 37.5 &&
    location.longitude >= 68.0 &&
    location.longitude <= 97.5
  ) {
    return true;
  }
  return false;
}

/**
 * Determines default calculation method based on location.
 * India defaults to University of Islamic Sciences, Karachi (Karachi method) as standard.
 * Other locations default to Umm Al-Qura or Muslim World League.
 */
export function getDefaultCalculationMethodForLocation(location?: LocationData | null): CalculationMethodKey {
  if (location && isLocationInIndia(location)) {
    return 'Karachi';
  }
  if (typeof Intl !== 'undefined') {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (tz === 'Asia/Kolkata' || tz === 'Asia/Calcutta') {
        return 'Karachi';
      }
    } catch {
      // ignore
    }
  }
  return 'UmmAlQura';
}

export interface DayPrayerSchedule {
  fajr: Date;
  sunrise: Date;
  dhuhr: Date;
  asr: Date;
  maghrib: Date;
  sunset: Date;
  isha: Date;
  solarNoon: Date;
  middleOfTheNight: Date;
  lastThirdOfTheNight: Date;
  fajrTomorrow: Date;
  prayerList: PrayerTimeItem[];
  currentPrayer: PrayerTimeItem | null;
  nextPrayer: PrayerTimeItem | null;
  timeRemainingMs: number;
  timeRemainingMinutes: number;
  daylightDurationMs: number;
  isDaytime: boolean;
  solarProgressPercent: number; // 0 to 100
  nightProgressPercent: number; // 0 to 100
}

export function formatPrayerTime(date: Date, timezone?: string): string {
  try {
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZone: timezone,
    }).format(date);
  } catch {
    return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
  }
}

export interface HijriDateObject {
  day: number;
  month: number;
  monthName: string;
  monthArabic: string;
  year: number;
  formatted: string;
  formattedArabic: string;
}

export const ISLAMIC_MONTH_NAMES_EN = [
  '',
  'Muharram',
  'Safar',
  'Rabi al-Awwal',
  'Rabi al-Thani',
  'Jumada al-Awwal',
  'Jumada al-Thani',
  'Rajab',
  "Sha'ban",
  'Ramadan',
  'Shawwal',
  "Dhul Qi'dah",
  'Dhul Hijjah',
];

export const ISLAMIC_MONTH_NAMES_AR = [
  '',
  'المحرّم',
  'صفر',
  'ربيع الأول',
  'ربيع الثاني',
  'جمادى الأولى',
  'جمادى الآخرة',
  'رجب',
  'شعبان',
  'رمضان',
  'شوّال',
  'ذو القعدة',
  'ذو الحجة',
];

export function getSavedHijriOffset(): number {
  if (typeof window === 'undefined') return 0;
  try {
    const saved = localStorage.getItem('nur_hijri_offset');
    return saved ? parseInt(saved, 10) || 0 : 0;
  } catch {
    return 0;
  }
}

export function saveHijriOffset(offset: number): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('nur_hijri_offset', offset.toString());
  } catch {
    // ignore
  }
}

/**
 * Deterministic Astronomical Hijri Calendar calculation (Kuwaiti / Umm al-Qura standard)
 * Guarantees correct Islamic month names, valid Hijri day/month/year, and always outputs "AH" (never BC/BCE).
 * Fully immune to browser/OS ICU locale variations.
 */
export function calculateHijriDate(date: Date = new Date(), offsetDays?: number): HijriDateObject {
  const effectiveOffset = offsetDays !== undefined ? offsetDays : getSavedHijriOffset();
  const d = new Date(date);
  if (effectiveOffset !== 0) {
    d.setDate(d.getDate() + effectiveOffset);
  }

  let day = d.getDate();
  let month = d.getMonth();
  let year = d.getFullYear();

  let m = month + 1;
  let y = year;
  if (m < 3) {
    y -= 1;
    m += 12;
  }

  let a = Math.floor(y / 100);
  let b = 2 - a + Math.floor(a / 4);
  if (y < 1583) b = 0;
  if (y === 1582) {
    if (m > 10) b = -10;
    if (m === 10) {
      b = 0;
      if (day > 4) b = -10;
    }
  }

  const jd = Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + day + b - 1524;

  b = 0;
  if (jd > 2299160) {
    a = Math.floor((jd - 1867216.25) / 36524.25);
    b = 1 + a - Math.floor(a / 4);
  }
  const bb = jd + b + 1524;
  let cc = Math.floor((bb - 122.1) / 365.25);
  let dd = Math.floor(365.25 * cc);
  let ee = Math.floor((bb - dd) / 30.6001);
  day = bb - dd - Math.floor(30.6001 * ee);
  month = ee - 1;
  if (ee > 13) {
    cc += 1;
    month = ee - 13;
  }
  year = cc - 4716;

  const iyear = 10631.0 / 30.0;
  const epochastro = 1948084;
  const shift1 = 8.01 / 60.0;

  let z = jd - epochastro;
  const cyc = Math.floor(z / 10631.0);
  z = z - 10631 * cyc;
  const j = Math.floor((z - shift1) / iyear);
  const iy = 30 * cyc + j;
  z = z - Math.floor(j * iyear + shift1);
  let im = Math.floor((z + 28.5001) / 29.5);
  if (im === 13) im = 12;
  const id = z - Math.floor(29.5001 * im - 29);

  const safeMonth = Math.max(1, Math.min(12, im));
  const safeYear = Math.max(1, iy);

  return {
    day: id,
    month: safeMonth,
    monthName: ISLAMIC_MONTH_NAMES_EN[safeMonth],
    monthArabic: ISLAMIC_MONTH_NAMES_AR[safeMonth],
    year: safeYear,
    formatted: `${id} ${ISLAMIC_MONTH_NAMES_EN[safeMonth]} ${safeYear} AH`,
    formattedArabic: `${id} ${ISLAMIC_MONTH_NAMES_AR[safeMonth]} ${safeYear} هـ`,
  };
}

export function formatHijriDate(date: Date, offsetDays?: number): string {
  return calculateHijriDate(date, offsetDays).formatted;
}

export function formatGregorianDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

export function calculatePrayerSchedule(
  location: LocationData,
  methodKey: CalculationMethodKey,
  referenceDate: Date = new Date()
): DayPrayerSchedule {
  const coordinates = new Coordinates(location.latitude, location.longitude);
  const params = getAdhanCalculationMethod(methodKey);

  // Single-shadow method for Asr: one object length plus shadow (Madhab.Shafi in adhan library)
  params.madhab = Madhab.Shafi;

  const prayerTimesToday = new PrayerTimes(coordinates, referenceDate, params);

  // Next day prayer times for night duration & last third of the night
  const tomorrow = new Date(referenceDate);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const prayerTimesTomorrow = new PrayerTimes(coordinates, tomorrow, params);

  const sunnahTimesToday = new SunnahTimes(prayerTimesToday);

  // Precise calculations
  const fajr = prayerTimesToday.fajr;
  const sunrise = prayerTimesToday.sunrise;
  const dhuhr = prayerTimesToday.dhuhr;
  const asr = prayerTimesToday.asr;
  const sunset = prayerTimesToday.sunset || prayerTimesToday.maghrib;
  const maghrib = prayerTimesToday.maghrib;
  const isha = prayerTimesToday.isha;

  // Solar Noon (Zawal / Zenith): Midpoint between sunrise and sunset
  const solarNoonTimeMs = (sunrise.getTime() + sunset.getTime()) / 2;
  const solarNoon = new Date(solarNoonTimeMs);

  // Night duration: from today's sunset to tomorrow's Fajr
  const fajrTomorrow = prayerTimesTomorrow.fajr;
  const nightDurationMs = fajrTomorrow.getTime() - sunset.getTime();

  // Middle of the night (Nisf al-Layl)
  const middleOfTheNight = sunnahTimesToday.middleOfTheNight || new Date(sunset.getTime() + nightDurationMs / 2);

  // Last third of the night (Thuluth al-Layl al-Akhir) = Sunset + (2/3 * nightDuration)
  const lastThirdOfTheNight = sunnahTimesToday.lastThirdOfTheNight || new Date(sunset.getTime() + (nightDurationMs * 2) / 3);

  const now = referenceDate;
  const nowMs = now.getTime();

  // Five daily prayers with starting and calculated ending times
  const prayerItems: PrayerTimeItem[] = [
    {
      id: 'Fajr',
      name: 'Fajr',
      arabicName: 'الفجر',
      time: fajr,
      timeString: formatPrayerTime(fajr, location.timezone),
      endTime: sunrise,
      endTimeString: formatPrayerTime(sunrise, location.timezone),
      isCurrent: nowMs >= fajr.getTime() && nowMs < sunrise.getTime(),
      isNext: nowMs < fajr.getTime(),
      status: nowMs >= sunrise.getTime() ? 'passed' : nowMs >= fajr.getTime() ? 'current' : 'upcoming',
      scholarlyNote: 'Ends precisely at the first visible appearance of Sunrise.',
    },
    {
      id: 'Dhuhr',
      name: 'Dhuhr',
      arabicName: 'الظهر',
      time: dhuhr,
      timeString: formatPrayerTime(dhuhr, location.timezone),
      endTime: asr,
      endTimeString: formatPrayerTime(asr, location.timezone),
      isCurrent: nowMs >= dhuhr.getTime() && nowMs < asr.getTime(),
      isNext: nowMs >= sunrise.getTime() && nowMs < dhuhr.getTime(),
      status: nowMs >= asr.getTime() ? 'passed' : nowMs >= dhuhr.getTime() ? 'current' : 'upcoming',
      scholarlyNote: "Begins when the sun passes its zenith (zawal) and ends when an object's shadow equals its length.",
    },
    {
      id: 'Asr',
      name: 'Asr',
      arabicName: 'العصر',
      time: asr,
      timeString: formatPrayerTime(asr, location.timezone),
      endTime: sunset,
      endTimeString: formatPrayerTime(sunset, location.timezone),
      isCurrent: nowMs >= asr.getTime() && nowMs < sunset.getTime(),
      isNext: nowMs >= dhuhr.getTime() && nowMs < asr.getTime(),
      status: nowMs >= sunset.getTime() ? 'passed' : nowMs >= asr.getTime() ? 'current' : 'upcoming',
      scholarlyNote: 'Calculated via single-shadow method. Preferred time ends when the sun yellows; valid until Sunset.',
    },
    {
      id: 'Maghrib',
      name: 'Maghrib',
      arabicName: 'المغرب',
      time: maghrib,
      timeString: formatPrayerTime(maghrib, location.timezone),
      endTime: isha,
      endTimeString: formatPrayerTime(isha, location.timezone),
      isCurrent: nowMs >= maghrib.getTime() && nowMs < isha.getTime(),
      isNext: nowMs >= asr.getTime() && nowMs < maghrib.getTime(),
      status: nowMs >= isha.getTime() ? 'passed' : nowMs >= maghrib.getTime() ? 'current' : 'upcoming',
      scholarlyNote: 'Begins at sunset and ends with the disappearance of the red twilight (Isha start).',
    },
    {
      id: 'Isha',
      name: 'Isha',
      arabicName: 'العشاء',
      time: isha,
      timeString: formatPrayerTime(isha, location.timezone),
      endTime: middleOfTheNight,
      endTimeString: formatPrayerTime(middleOfTheNight, location.timezone),
      isCurrent: nowMs >= isha.getTime() || (nowMs < fajr.getTime() && nowMs < middleOfTheNight.getTime()),
      isNext: nowMs >= maghrib.getTime() && nowMs < isha.getTime(),
      status: nowMs < isha.getTime() && nowMs >= maghrib.getTime() ? 'upcoming' : 'current',
      scholarlyNote: 'Authentic Sunnah (Sahih Muslim 612) establishes preferred time up to Middle of the Night; valid in necessity until Fajr.',
    },
  ];

  // Identify current and next prayer
  let currentPrayer: PrayerTimeItem | null = null;
  let nextPrayer: PrayerTimeItem | null = null;

  if (nowMs < fajr.getTime()) {
    currentPrayer = prayerItems[4]; // Isha from previous night
    nextPrayer = prayerItems[0];
  } else if (nowMs < sunrise.getTime()) {
    currentPrayer = prayerItems[0];
    nextPrayer = prayerItems[1]; // Next obligatory prayer is Dhuhr
  } else if (nowMs < dhuhr.getTime()) {
    currentPrayer = null; // In Duha / Ishraq period
    nextPrayer = prayerItems[1];
  } else if (nowMs < asr.getTime()) {
    currentPrayer = prayerItems[1];
    nextPrayer = prayerItems[2];
  } else if (nowMs < sunset.getTime()) {
    currentPrayer = prayerItems[2];
    nextPrayer = prayerItems[3];
  } else if (nowMs < isha.getTime()) {
    currentPrayer = prayerItems[3];
    nextPrayer = prayerItems[4];
  } else {
    currentPrayer = prayerItems[4];
    // Next prayer is tomorrow's Fajr
    nextPrayer = {
      id: 'Fajr',
      name: 'Fajr',
      arabicName: 'الفجر',
      time: fajrTomorrow,
      timeString: formatPrayerTime(fajrTomorrow, location.timezone),
      endTime: prayerTimesTomorrow.sunrise,
      endTimeString: formatPrayerTime(prayerTimesTomorrow.sunrise, location.timezone),
      isCurrent: false,
      isNext: true,
      status: 'upcoming',
    };
  }

  // Update flags
  prayerItems.forEach((item) => {
    item.isCurrent = currentPrayer?.id === item.id;
    item.isNext = nextPrayer?.id === item.id;
  });

  const nextTargetTime = nextPrayer ? nextPrayer.time.getTime() : fajrTomorrow.getTime();
  const timeRemainingMs = Math.max(0, nextTargetTime - nowMs);
  const timeRemainingMinutes = Math.floor(timeRemainingMs / 60000);

  // Solar progress calculations
  const daylightDurationMs = sunset.getTime() - sunrise.getTime();
  const isDaytime = nowMs >= sunrise.getTime() && nowMs <= sunset.getTime();

  let solarProgressPercent = 0;
  if (isDaytime) {
    solarProgressPercent = Math.min(100, Math.max(0, ((nowMs - sunrise.getTime()) / daylightDurationMs) * 100));
  } else if (nowMs > sunset.getTime()) {
    solarProgressPercent = 100;
  }

  let nightProgressPercent = 0;
  if (!isDaytime) {
    if (nowMs >= sunset.getTime()) {
      nightProgressPercent = Math.min(100, Math.max(0, ((nowMs - sunset.getTime()) / nightDurationMs) * 100));
    } else {
      // Early morning before sunrise
      const prevSunset = new Date(sunset);
      prevSunset.setDate(prevSunset.getDate() - 1);
      const fullNightMs = fajr.getTime() - prevSunset.getTime();
      nightProgressPercent = Math.min(100, Math.max(0, ((nowMs - prevSunset.getTime()) / fullNightMs) * 100));
    }
  }

  return {
    fajr,
    sunrise,
    dhuhr,
    asr,
    maghrib,
    sunset,
    isha,
    solarNoon,
    middleOfTheNight,
    lastThirdOfTheNight,
    fajrTomorrow,
    prayerList: prayerItems,
    currentPrayer,
    nextPrayer,
    timeRemainingMs,
    timeRemainingMinutes,
    daylightDurationMs,
    isDaytime,
    solarProgressPercent,
    nightProgressPercent,
  };
}

export function formatDurationHuman(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const remainingMins = minutes % 60;
  if (hours === 0) {
    return `${remainingMins} minute${remainingMins === 1 ? '' : 's'}`;
  }
  if (remainingMins === 0) {
    return `${hours} hour${hours === 1 ? '' : 's'}`;
  }
  return `${hours} hour${hours === 1 ? '' : 's'} ${remainingMins} min`;
}

// Qibla Direction calculation towards Kaaba (21.4225 N, 39.8262 E)
export function calculateQiblaBearing(lat: number, lng: number): number {
  const kaabaLat = (21.422487 * Math.PI) / 180;
  const kaabaLng = (39.826206 * Math.PI) / 180;
  const userLat = (lat * Math.PI) / 180;
  const userLng = (lng * Math.PI) / 180;

  const deltaLng = kaabaLng - userLng;
  const y = Math.sin(deltaLng);
  const x = Math.cos(userLat) * Math.tan(kaabaLat) - Math.sin(userLat) * Math.cos(deltaLng);

  let qibla = (Math.atan2(y, x) * 180) / Math.PI;
  return (qibla + 360) % 360;
}

// Prohibited / Makruh prayer times evaluation
export interface MakruhStatus {
  isMakruhNow: boolean;
  activePeriod: {
    title: string;
    description: string;
    hadithRef: string;
    sunnahUrl: string;
    startTime: string;
    endTime: string;
  } | null;
  periods: {
    id: string;
    name: string;
    timeSpan: string;
    severity: 'Prohibited' | 'Disliked';
    hadith: string;
    url: string;
  }[];
}

export function getMakruhTimes(schedule: DayPrayerSchedule, timezone?: string): MakruhStatus {
  const now = new Date().getTime();

  // Period 1: Sunrise to Spear height (~15 mins after sunrise)
  const sunriseStart = schedule.sunrise.getTime();
  const sunriseEnd = sunriseStart + 15 * 60 * 1000;

  // Period 2: Solar Noon (Zenith) (~8 mins before Dhuhr until Dhuhr starts)
  const zawalStart = schedule.dhuhr.getTime() - 8 * 60 * 1000;
  const zawalEnd = schedule.dhuhr.getTime();

  // Period 3: Sunset (~15 mins before Maghrib until complete sunset)
  const sunsetStart = schedule.maghrib.getTime() - 15 * 60 * 1000;
  const sunsetEnd = schedule.maghrib.getTime();

  const isSunrise = now >= sunriseStart && now < sunriseEnd;
  const isZenith = now >= zawalStart && now < zawalEnd;
  const isSunset = now >= sunsetStart && now < sunsetEnd;

  let activePeriod = null;
  if (isSunrise) {
    activePeriod = {
      title: 'Sunrise (Prohibited Period)',
      description: 'Voluntary prayers without a specific cause are prohibited while the sun is rising until it ascends the height of a spear.',
      hadithRef: 'Sahih Muslim 831',
      sunnahUrl: 'https://sunnah.com/muslim:831',
      startTime: formatPrayerTime(new Date(sunriseStart), timezone),
      endTime: formatPrayerTime(new Date(sunriseEnd), timezone),
    };
  } else if (isZenith) {
    activePeriod = {
      title: 'Solar Noon / Zenith (Prohibited Period)',
      description: 'Voluntary prayers are prohibited when the sun reaches its highest meridian until it begins to decline at Dhuhr.',
      hadithRef: 'Sahih Muslim 831',
      sunnahUrl: 'https://sunnah.com/muslim:831',
      startTime: formatPrayerTime(new Date(zawalStart), timezone),
      endTime: formatPrayerTime(new Date(zawalEnd), timezone),
    };
  } else if (isSunset) {
    activePeriod = {
      title: 'Sunset (Prohibited Period)',
      description: 'Voluntary prayers are prohibited as the sun turns pale and sets until it has completely vanished.',
      hadithRef: 'Sahih al-Bukhari 586',
      sunnahUrl: 'https://sunnah.com/bukhari:586',
      startTime: formatPrayerTime(new Date(sunsetStart), timezone),
      endTime: formatPrayerTime(new Date(sunsetEnd), timezone),
    };
  }

  const periods = [
    {
      id: 'sunrise',
      name: 'Sunrise (Ash-Shuruq)',
      timeSpan: `${formatPrayerTime(schedule.sunrise, timezone)} – ${formatPrayerTime(new Date(sunriseEnd), timezone)}`,
      severity: 'Prohibited' as const,
      hadith: 'Three times at which the Messenger of Allah ﷺ forbade us to pray or bury our dead...',
      url: 'https://sunnah.com/muslim:831',
    },
    {
      id: 'zawal',
      name: 'Solar Noon / Zenith (Istiwa)',
      timeSpan: `${formatPrayerTime(new Date(zawalStart), timezone)} – ${formatPrayerTime(schedule.dhuhr, timezone)}`,
      severity: 'Prohibited' as const,
      hadith: 'When the sun stands at its meridian until it begins to tilt at Dhuhr...',
      url: 'https://sunnah.com/muslim:831',
    },
    {
      id: 'sunset',
      name: 'Sunset (Al-Ghurub)',
      timeSpan: `${formatPrayerTime(new Date(sunsetStart), timezone)} – ${formatPrayerTime(schedule.maghrib, timezone)}`,
      severity: 'Prohibited' as const,
      hadith: 'When the edge of the sun begins to set until it has completely set...',
      url: 'https://sunnah.com/bukhari:586',
    },
  ];

  return {
    isMakruhNow: isSunrise || isZenith || isSunset,
    activePeriod,
    periods,
  };
}
