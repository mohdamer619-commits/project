/**
 * @license
 * Tanzil Project Quran Metadata & Uthmani Text (Creative Commons Attribution 3.0)
 * Maududi English Translation (Towards Understanding the Quran / Tafhim al-Quran, trans. Zafar Ishaq Ansari)
 * Tanzil English Transliteration
 */

export interface SurahMeta {
  number: number;
  name: string;
  arabicName: string;
  englishTranslation: string;
  numberOfAyahs: number;
  revelationType: "Meccan" | "Medinan";
  order: number;
  rukus: number;
  start: number;
}

export interface JuzMeta {
  juz: number;
  surah: number;
  ayah: number;
}

export interface QuranAyah {
  surahNumber: number;
  ayahNumber: number;
  arabic: string;
  transliteration: string;
  translation: string;
  juz: number;
  quranLink: string;
}

export interface FullSurahData extends SurahMeta {
  verses: QuranAyah[];
}

export const QURAN_SURAHS_META: SurahMeta[] = [
  {
    "number": 1,
    "name": "Al-Faatiha",
    "arabicName": "الفاتحة",
    "englishTranslation": "The Opening",
    "numberOfAyahs": 7,
    "revelationType": "Meccan",
    "order": 5,
    "rukus": 1,
    "start": 0
  },
  {
    "number": 2,
    "name": "Al-Baqara",
    "arabicName": "البقرة",
    "englishTranslation": "The Cow",
    "numberOfAyahs": 286,
    "revelationType": "Medinan",
    "order": 87,
    "rukus": 40,
    "start": 7
  },
  {
    "number": 3,
    "name": "Aal-i-Imraan",
    "arabicName": "آل عمران",
    "englishTranslation": "The Family of Imraan",
    "numberOfAyahs": 200,
    "revelationType": "Medinan",
    "order": 89,
    "rukus": 20,
    "start": 293
  },
  {
    "number": 4,
    "name": "An-Nisaa",
    "arabicName": "النساء",
    "englishTranslation": "The Women",
    "numberOfAyahs": 176,
    "revelationType": "Medinan",
    "order": 92,
    "rukus": 24,
    "start": 493
  },
  {
    "number": 5,
    "name": "Al-Maaida",
    "arabicName": "المائدة",
    "englishTranslation": "The Table",
    "numberOfAyahs": 120,
    "revelationType": "Medinan",
    "order": 112,
    "rukus": 16,
    "start": 669
  },
  {
    "number": 6,
    "name": "Al-An'aam",
    "arabicName": "الأنعام",
    "englishTranslation": "The Cattle",
    "numberOfAyahs": 165,
    "revelationType": "Meccan",
    "order": 55,
    "rukus": 20,
    "start": 789
  },
  {
    "number": 7,
    "name": "Al-A'raaf",
    "arabicName": "الأعراف",
    "englishTranslation": "The Heights",
    "numberOfAyahs": 206,
    "revelationType": "Meccan",
    "order": 39,
    "rukus": 24,
    "start": 954
  },
  {
    "number": 8,
    "name": "Al-Anfaal",
    "arabicName": "الأنفال",
    "englishTranslation": "The Spoils of War",
    "numberOfAyahs": 75,
    "revelationType": "Medinan",
    "order": 88,
    "rukus": 10,
    "start": 1160
  },
  {
    "number": 9,
    "name": "At-Tawba",
    "arabicName": "التوبة",
    "englishTranslation": "The Repentance",
    "numberOfAyahs": 129,
    "revelationType": "Medinan",
    "order": 113,
    "rukus": 16,
    "start": 1235
  },
  {
    "number": 10,
    "name": "Yunus",
    "arabicName": "يونس",
    "englishTranslation": "Jonas",
    "numberOfAyahs": 109,
    "revelationType": "Meccan",
    "order": 51,
    "rukus": 11,
    "start": 1364
  },
  {
    "number": 11,
    "name": "Hud",
    "arabicName": "هود",
    "englishTranslation": "Hud",
    "numberOfAyahs": 123,
    "revelationType": "Meccan",
    "order": 52,
    "rukus": 10,
    "start": 1473
  },
  {
    "number": 12,
    "name": "Yusuf",
    "arabicName": "يوسف",
    "englishTranslation": "Joseph",
    "numberOfAyahs": 111,
    "revelationType": "Meccan",
    "order": 53,
    "rukus": 12,
    "start": 1596
  },
  {
    "number": 13,
    "name": "Ar-Ra'd",
    "arabicName": "الرعد",
    "englishTranslation": "The Thunder",
    "numberOfAyahs": 43,
    "revelationType": "Medinan",
    "order": 96,
    "rukus": 6,
    "start": 1707
  },
  {
    "number": 14,
    "name": "Ibrahim",
    "arabicName": "ابراهيم",
    "englishTranslation": "Abraham",
    "numberOfAyahs": 52,
    "revelationType": "Meccan",
    "order": 72,
    "rukus": 7,
    "start": 1750
  },
  {
    "number": 15,
    "name": "Al-Hijr",
    "arabicName": "الحجر",
    "englishTranslation": "The Rock",
    "numberOfAyahs": 99,
    "revelationType": "Meccan",
    "order": 54,
    "rukus": 6,
    "start": 1802
  },
  {
    "number": 16,
    "name": "An-Nahl",
    "arabicName": "النحل",
    "englishTranslation": "The Bee",
    "numberOfAyahs": 128,
    "revelationType": "Meccan",
    "order": 70,
    "rukus": 16,
    "start": 1901
  },
  {
    "number": 17,
    "name": "Al-Israa",
    "arabicName": "الإسراء",
    "englishTranslation": "The Night Journey",
    "numberOfAyahs": 111,
    "revelationType": "Meccan",
    "order": 50,
    "rukus": 12,
    "start": 2029
  },
  {
    "number": 18,
    "name": "Al-Kahf",
    "arabicName": "الكهف",
    "englishTranslation": "The Cave",
    "numberOfAyahs": 110,
    "revelationType": "Meccan",
    "order": 69,
    "rukus": 12,
    "start": 2140
  },
  {
    "number": 19,
    "name": "Maryam",
    "arabicName": "مريم",
    "englishTranslation": "Mary",
    "numberOfAyahs": 98,
    "revelationType": "Meccan",
    "order": 44,
    "rukus": 6,
    "start": 2250
  },
  {
    "number": 20,
    "name": "Taa-Haa",
    "arabicName": "طه",
    "englishTranslation": "Taa-Haa",
    "numberOfAyahs": 135,
    "revelationType": "Meccan",
    "order": 45,
    "rukus": 8,
    "start": 2348
  },
  {
    "number": 21,
    "name": "Al-Anbiyaa",
    "arabicName": "الأنبياء",
    "englishTranslation": "The Prophets",
    "numberOfAyahs": 112,
    "revelationType": "Meccan",
    "order": 73,
    "rukus": 7,
    "start": 2483
  },
  {
    "number": 22,
    "name": "Al-Hajj",
    "arabicName": "الحج",
    "englishTranslation": "The Pilgrimage",
    "numberOfAyahs": 78,
    "revelationType": "Medinan",
    "order": 103,
    "rukus": 10,
    "start": 2595
  },
  {
    "number": 23,
    "name": "Al-Muminoon",
    "arabicName": "المؤمنون",
    "englishTranslation": "The Believers",
    "numberOfAyahs": 118,
    "revelationType": "Meccan",
    "order": 74,
    "rukus": 6,
    "start": 2673
  },
  {
    "number": 24,
    "name": "An-Noor",
    "arabicName": "النور",
    "englishTranslation": "The Light",
    "numberOfAyahs": 64,
    "revelationType": "Medinan",
    "order": 102,
    "rukus": 9,
    "start": 2791
  },
  {
    "number": 25,
    "name": "Al-Furqaan",
    "arabicName": "الفرقان",
    "englishTranslation": "The Criterion",
    "numberOfAyahs": 77,
    "revelationType": "Meccan",
    "order": 42,
    "rukus": 6,
    "start": 2855
  },
  {
    "number": 26,
    "name": "Ash-Shu'araa",
    "arabicName": "الشعراء",
    "englishTranslation": "The Poets",
    "numberOfAyahs": 227,
    "revelationType": "Meccan",
    "order": 47,
    "rukus": 11,
    "start": 2932
  },
  {
    "number": 27,
    "name": "An-Naml",
    "arabicName": "النمل",
    "englishTranslation": "The Ant",
    "numberOfAyahs": 93,
    "revelationType": "Meccan",
    "order": 48,
    "rukus": 7,
    "start": 3159
  },
  {
    "number": 28,
    "name": "Al-Qasas",
    "arabicName": "القصص",
    "englishTranslation": "The Stories",
    "numberOfAyahs": 88,
    "revelationType": "Meccan",
    "order": 49,
    "rukus": 8,
    "start": 3252
  },
  {
    "number": 29,
    "name": "Al-Ankaboot",
    "arabicName": "العنكبوت",
    "englishTranslation": "The Spider",
    "numberOfAyahs": 69,
    "revelationType": "Meccan",
    "order": 85,
    "rukus": 7,
    "start": 3340
  },
  {
    "number": 30,
    "name": "Ar-Room",
    "arabicName": "الروم",
    "englishTranslation": "The Romans",
    "numberOfAyahs": 60,
    "revelationType": "Meccan",
    "order": 84,
    "rukus": 6,
    "start": 3409
  },
  {
    "number": 31,
    "name": "Luqman",
    "arabicName": "لقمان",
    "englishTranslation": "Luqman",
    "numberOfAyahs": 34,
    "revelationType": "Meccan",
    "order": 57,
    "rukus": 3,
    "start": 3469
  },
  {
    "number": 32,
    "name": "As-Sajda",
    "arabicName": "السجدة",
    "englishTranslation": "The Prostration",
    "numberOfAyahs": 30,
    "revelationType": "Meccan",
    "order": 75,
    "rukus": 3,
    "start": 3503
  },
  {
    "number": 33,
    "name": "Al-Ahzaab",
    "arabicName": "الأحزاب",
    "englishTranslation": "The Clans",
    "numberOfAyahs": 73,
    "revelationType": "Medinan",
    "order": 90,
    "rukus": 9,
    "start": 3533
  },
  {
    "number": 34,
    "name": "Saba",
    "arabicName": "سبإ",
    "englishTranslation": "Sheba",
    "numberOfAyahs": 54,
    "revelationType": "Meccan",
    "order": 58,
    "rukus": 6,
    "start": 3606
  },
  {
    "number": 35,
    "name": "Faatir",
    "arabicName": "فاطر",
    "englishTranslation": "The Originator",
    "numberOfAyahs": 45,
    "revelationType": "Meccan",
    "order": 43,
    "rukus": 5,
    "start": 3660
  },
  {
    "number": 36,
    "name": "Yaseen",
    "arabicName": "يس",
    "englishTranslation": "Yaseen",
    "numberOfAyahs": 83,
    "revelationType": "Meccan",
    "order": 41,
    "rukus": 5,
    "start": 3705
  },
  {
    "number": 37,
    "name": "As-Saaffaat",
    "arabicName": "الصافات",
    "englishTranslation": "Those drawn up in Ranks",
    "numberOfAyahs": 182,
    "revelationType": "Meccan",
    "order": 56,
    "rukus": 5,
    "start": 3788
  },
  {
    "number": 38,
    "name": "Saad",
    "arabicName": "ص",
    "englishTranslation": "The letter Saad",
    "numberOfAyahs": 88,
    "revelationType": "Meccan",
    "order": 38,
    "rukus": 5,
    "start": 3970
  },
  {
    "number": 39,
    "name": "Az-Zumar",
    "arabicName": "الزمر",
    "englishTranslation": "The Groups",
    "numberOfAyahs": 75,
    "revelationType": "Meccan",
    "order": 59,
    "rukus": 8,
    "start": 4058
  },
  {
    "number": 40,
    "name": "Al-Ghaafir",
    "arabicName": "غافر",
    "englishTranslation": "The Forgiver",
    "numberOfAyahs": 85,
    "revelationType": "Meccan",
    "order": 60,
    "rukus": 9,
    "start": 4133
  },
  {
    "number": 41,
    "name": "Fussilat",
    "arabicName": "فصلت",
    "englishTranslation": "Explained in detail",
    "numberOfAyahs": 54,
    "revelationType": "Meccan",
    "order": 61,
    "rukus": 6,
    "start": 4218
  },
  {
    "number": 42,
    "name": "Ash-Shura",
    "arabicName": "الشورى",
    "englishTranslation": "Consultation",
    "numberOfAyahs": 53,
    "revelationType": "Meccan",
    "order": 62,
    "rukus": 5,
    "start": 4272
  },
  {
    "number": 43,
    "name": "Az-Zukhruf",
    "arabicName": "الزخرف",
    "englishTranslation": "Ornaments of gold",
    "numberOfAyahs": 89,
    "revelationType": "Meccan",
    "order": 63,
    "rukus": 7,
    "start": 4325
  },
  {
    "number": 44,
    "name": "Ad-Dukhaan",
    "arabicName": "الدخان",
    "englishTranslation": "The Smoke",
    "numberOfAyahs": 59,
    "revelationType": "Meccan",
    "order": 64,
    "rukus": 3,
    "start": 4414
  },
  {
    "number": 45,
    "name": "Al-Jaathiya",
    "arabicName": "الجاثية",
    "englishTranslation": "Crouching",
    "numberOfAyahs": 37,
    "revelationType": "Meccan",
    "order": 65,
    "rukus": 4,
    "start": 4473
  },
  {
    "number": 46,
    "name": "Al-Ahqaf",
    "arabicName": "الأحقاف",
    "englishTranslation": "The Dunes",
    "numberOfAyahs": 35,
    "revelationType": "Meccan",
    "order": 66,
    "rukus": 4,
    "start": 4510
  },
  {
    "number": 47,
    "name": "Muhammad",
    "arabicName": "محمد",
    "englishTranslation": "Muhammad",
    "numberOfAyahs": 38,
    "revelationType": "Medinan",
    "order": 95,
    "rukus": 4,
    "start": 4545
  },
  {
    "number": 48,
    "name": "Al-Fath",
    "arabicName": "الفتح",
    "englishTranslation": "The Victory",
    "numberOfAyahs": 29,
    "revelationType": "Medinan",
    "order": 111,
    "rukus": 4,
    "start": 4583
  },
  {
    "number": 49,
    "name": "Al-Hujuraat",
    "arabicName": "الحجرات",
    "englishTranslation": "The Inner Apartments",
    "numberOfAyahs": 18,
    "revelationType": "Medinan",
    "order": 106,
    "rukus": 2,
    "start": 4612
  },
  {
    "number": 50,
    "name": "Qaaf",
    "arabicName": "ق",
    "englishTranslation": "The letter Qaaf",
    "numberOfAyahs": 45,
    "revelationType": "Meccan",
    "order": 34,
    "rukus": 3,
    "start": 4630
  },
  {
    "number": 51,
    "name": "Adh-Dhaariyat",
    "arabicName": "الذاريات",
    "englishTranslation": "The Winnowing Winds",
    "numberOfAyahs": 60,
    "revelationType": "Meccan",
    "order": 67,
    "rukus": 3,
    "start": 4675
  },
  {
    "number": 52,
    "name": "At-Tur",
    "arabicName": "الطور",
    "englishTranslation": "The Mount",
    "numberOfAyahs": 49,
    "revelationType": "Meccan",
    "order": 76,
    "rukus": 2,
    "start": 4735
  },
  {
    "number": 53,
    "name": "An-Najm",
    "arabicName": "النجم",
    "englishTranslation": "The Star",
    "numberOfAyahs": 62,
    "revelationType": "Meccan",
    "order": 23,
    "rukus": 3,
    "start": 4784
  },
  {
    "number": 54,
    "name": "Al-Qamar",
    "arabicName": "القمر",
    "englishTranslation": "The Moon",
    "numberOfAyahs": 55,
    "revelationType": "Meccan",
    "order": 37,
    "rukus": 3,
    "start": 4846
  },
  {
    "number": 55,
    "name": "Ar-Rahmaan",
    "arabicName": "الرحمن",
    "englishTranslation": "The Beneficent",
    "numberOfAyahs": 78,
    "revelationType": "Medinan",
    "order": 97,
    "rukus": 3,
    "start": 4901
  },
  {
    "number": 56,
    "name": "Al-Waaqia",
    "arabicName": "الواقعة",
    "englishTranslation": "The Inevitable",
    "numberOfAyahs": 96,
    "revelationType": "Meccan",
    "order": 46,
    "rukus": 3,
    "start": 4979
  },
  {
    "number": 57,
    "name": "Al-Hadid",
    "arabicName": "الحديد",
    "englishTranslation": "The Iron",
    "numberOfAyahs": 29,
    "revelationType": "Medinan",
    "order": 94,
    "rukus": 4,
    "start": 5075
  },
  {
    "number": 58,
    "name": "Al-Mujaadila",
    "arabicName": "المجادلة",
    "englishTranslation": "The Pleading Woman",
    "numberOfAyahs": 22,
    "revelationType": "Medinan",
    "order": 105,
    "rukus": 3,
    "start": 5104
  },
  {
    "number": 59,
    "name": "Al-Hashr",
    "arabicName": "الحشر",
    "englishTranslation": "The Exile",
    "numberOfAyahs": 24,
    "revelationType": "Medinan",
    "order": 101,
    "rukus": 3,
    "start": 5126
  },
  {
    "number": 60,
    "name": "Al-Mumtahana",
    "arabicName": "الممتحنة",
    "englishTranslation": "She that is to be examined",
    "numberOfAyahs": 13,
    "revelationType": "Medinan",
    "order": 91,
    "rukus": 2,
    "start": 5150
  },
  {
    "number": 61,
    "name": "As-Saff",
    "arabicName": "الصف",
    "englishTranslation": "The Ranks",
    "numberOfAyahs": 14,
    "revelationType": "Medinan",
    "order": 109,
    "rukus": 2,
    "start": 5163
  },
  {
    "number": 62,
    "name": "Al-Jumu'a",
    "arabicName": "الجمعة",
    "englishTranslation": "Friday",
    "numberOfAyahs": 11,
    "revelationType": "Medinan",
    "order": 110,
    "rukus": 2,
    "start": 5177
  },
  {
    "number": 63,
    "name": "Al-Munaafiqoon",
    "arabicName": "المنافقون",
    "englishTranslation": "The Hypocrites",
    "numberOfAyahs": 11,
    "revelationType": "Medinan",
    "order": 104,
    "rukus": 2,
    "start": 5188
  },
  {
    "number": 64,
    "name": "At-Taghaabun",
    "arabicName": "التغابن",
    "englishTranslation": "Mutual Disillusion",
    "numberOfAyahs": 18,
    "revelationType": "Medinan",
    "order": 108,
    "rukus": 2,
    "start": 5199
  },
  {
    "number": 65,
    "name": "At-Talaaq",
    "arabicName": "الطلاق",
    "englishTranslation": "Divorce",
    "numberOfAyahs": 12,
    "revelationType": "Medinan",
    "order": 99,
    "rukus": 2,
    "start": 5217
  },
  {
    "number": 66,
    "name": "At-Tahrim",
    "arabicName": "التحريم",
    "englishTranslation": "The Prohibition",
    "numberOfAyahs": 12,
    "revelationType": "Medinan",
    "order": 107,
    "rukus": 2,
    "start": 5229
  },
  {
    "number": 67,
    "name": "Al-Mulk",
    "arabicName": "الملك",
    "englishTranslation": "The Sovereignty",
    "numberOfAyahs": 30,
    "revelationType": "Meccan",
    "order": 77,
    "rukus": 2,
    "start": 5241
  },
  {
    "number": 68,
    "name": "Al-Qalam",
    "arabicName": "القلم",
    "englishTranslation": "The Pen",
    "numberOfAyahs": 52,
    "revelationType": "Meccan",
    "order": 2,
    "rukus": 2,
    "start": 5271
  },
  {
    "number": 69,
    "name": "Al-Haaqqa",
    "arabicName": "الحاقة",
    "englishTranslation": "The Reality",
    "numberOfAyahs": 52,
    "revelationType": "Meccan",
    "order": 78,
    "rukus": 2,
    "start": 5323
  },
  {
    "number": 70,
    "name": "Al-Ma'aarij",
    "arabicName": "المعارج",
    "englishTranslation": "The Ascending Stairways",
    "numberOfAyahs": 44,
    "revelationType": "Meccan",
    "order": 79,
    "rukus": 2,
    "start": 5375
  },
  {
    "number": 71,
    "name": "Nooh",
    "arabicName": "نوح",
    "englishTranslation": "Noah",
    "numberOfAyahs": 28,
    "revelationType": "Meccan",
    "order": 71,
    "rukus": 2,
    "start": 5419
  },
  {
    "number": 72,
    "name": "Al-Jinn",
    "arabicName": "الجن",
    "englishTranslation": "The Jinn",
    "numberOfAyahs": 28,
    "revelationType": "Meccan",
    "order": 40,
    "rukus": 2,
    "start": 5447
  },
  {
    "number": 73,
    "name": "Al-Muzzammil",
    "arabicName": "المزمل",
    "englishTranslation": "The Enshrouded One",
    "numberOfAyahs": 20,
    "revelationType": "Meccan",
    "order": 3,
    "rukus": 2,
    "start": 5475
  },
  {
    "number": 74,
    "name": "Al-Muddaththir",
    "arabicName": "المدثر",
    "englishTranslation": "The Cloaked One",
    "numberOfAyahs": 56,
    "revelationType": "Meccan",
    "order": 4,
    "rukus": 2,
    "start": 5495
  },
  {
    "number": 75,
    "name": "Al-Qiyaama",
    "arabicName": "القيامة",
    "englishTranslation": "The Resurrection",
    "numberOfAyahs": 40,
    "revelationType": "Meccan",
    "order": 31,
    "rukus": 2,
    "start": 5551
  },
  {
    "number": 76,
    "name": "Al-Insaan",
    "arabicName": "الانسان",
    "englishTranslation": "Man",
    "numberOfAyahs": 31,
    "revelationType": "Medinan",
    "order": 98,
    "rukus": 2,
    "start": 5591
  },
  {
    "number": 77,
    "name": "Al-Mursalaat",
    "arabicName": "المرسلات",
    "englishTranslation": "The Emissaries",
    "numberOfAyahs": 50,
    "revelationType": "Meccan",
    "order": 33,
    "rukus": 2,
    "start": 5622
  },
  {
    "number": 78,
    "name": "An-Naba",
    "arabicName": "النبإ",
    "englishTranslation": "The Announcement",
    "numberOfAyahs": 40,
    "revelationType": "Meccan",
    "order": 80,
    "rukus": 2,
    "start": 5672
  },
  {
    "number": 79,
    "name": "An-Naazi'aat",
    "arabicName": "النازعات",
    "englishTranslation": "Those who drag forth",
    "numberOfAyahs": 46,
    "revelationType": "Meccan",
    "order": 81,
    "rukus": 2,
    "start": 5712
  },
  {
    "number": 80,
    "name": "Abasa",
    "arabicName": "عبس",
    "englishTranslation": "He frowned",
    "numberOfAyahs": 42,
    "revelationType": "Meccan",
    "order": 24,
    "rukus": 1,
    "start": 5758
  },
  {
    "number": 81,
    "name": "At-Takwir",
    "arabicName": "التكوير",
    "englishTranslation": "The Overthrowing",
    "numberOfAyahs": 29,
    "revelationType": "Meccan",
    "order": 7,
    "rukus": 1,
    "start": 5800
  },
  {
    "number": 82,
    "name": "Al-Infitaar",
    "arabicName": "الإنفطار",
    "englishTranslation": "The Cleaving",
    "numberOfAyahs": 19,
    "revelationType": "Meccan",
    "order": 82,
    "rukus": 1,
    "start": 5829
  },
  {
    "number": 83,
    "name": "Al-Mutaffifin",
    "arabicName": "المطففين",
    "englishTranslation": "Defrauding",
    "numberOfAyahs": 36,
    "revelationType": "Meccan",
    "order": 86,
    "rukus": 1,
    "start": 5848
  },
  {
    "number": 84,
    "name": "Al-Inshiqaaq",
    "arabicName": "الإنشقاق",
    "englishTranslation": "The Splitting Open",
    "numberOfAyahs": 25,
    "revelationType": "Meccan",
    "order": 83,
    "rukus": 1,
    "start": 5884
  },
  {
    "number": 85,
    "name": "Al-Burooj",
    "arabicName": "البروج",
    "englishTranslation": "The Constellations",
    "numberOfAyahs": 22,
    "revelationType": "Meccan",
    "order": 27,
    "rukus": 1,
    "start": 5909
  },
  {
    "number": 86,
    "name": "At-Taariq",
    "arabicName": "الطارق",
    "englishTranslation": "The Morning Star",
    "numberOfAyahs": 17,
    "revelationType": "Meccan",
    "order": 36,
    "rukus": 1,
    "start": 5931
  },
  {
    "number": 87,
    "name": "Al-A'laa",
    "arabicName": "الأعلى",
    "englishTranslation": "The Most High",
    "numberOfAyahs": 19,
    "revelationType": "Meccan",
    "order": 8,
    "rukus": 1,
    "start": 5948
  },
  {
    "number": 88,
    "name": "Al-Ghaashiya",
    "arabicName": "الغاشية",
    "englishTranslation": "The Overwhelming",
    "numberOfAyahs": 26,
    "revelationType": "Meccan",
    "order": 68,
    "rukus": 1,
    "start": 5967
  },
  {
    "number": 89,
    "name": "Al-Fajr",
    "arabicName": "الفجر",
    "englishTranslation": "The Dawn",
    "numberOfAyahs": 30,
    "revelationType": "Meccan",
    "order": 10,
    "rukus": 1,
    "start": 5993
  },
  {
    "number": 90,
    "name": "Al-Balad",
    "arabicName": "البلد",
    "englishTranslation": "The City",
    "numberOfAyahs": 20,
    "revelationType": "Meccan",
    "order": 35,
    "rukus": 1,
    "start": 6023
  },
  {
    "number": 91,
    "name": "Ash-Shams",
    "arabicName": "الشمس",
    "englishTranslation": "The Sun",
    "numberOfAyahs": 15,
    "revelationType": "Meccan",
    "order": 26,
    "rukus": 1,
    "start": 6043
  },
  {
    "number": 92,
    "name": "Al-Lail",
    "arabicName": "الليل",
    "englishTranslation": "The Night",
    "numberOfAyahs": 21,
    "revelationType": "Meccan",
    "order": 9,
    "rukus": 1,
    "start": 6058
  },
  {
    "number": 93,
    "name": "Ad-Dhuhaa",
    "arabicName": "الضحى",
    "englishTranslation": "The Morning Hours",
    "numberOfAyahs": 11,
    "revelationType": "Meccan",
    "order": 11,
    "rukus": 1,
    "start": 6079
  },
  {
    "number": 94,
    "name": "Ash-Sharh",
    "arabicName": "الشرح",
    "englishTranslation": "The Consolation",
    "numberOfAyahs": 8,
    "revelationType": "Meccan",
    "order": 12,
    "rukus": 1,
    "start": 6090
  },
  {
    "number": 95,
    "name": "At-Tin",
    "arabicName": "التين",
    "englishTranslation": "The Fig",
    "numberOfAyahs": 8,
    "revelationType": "Meccan",
    "order": 28,
    "rukus": 1,
    "start": 6098
  },
  {
    "number": 96,
    "name": "Al-Alaq",
    "arabicName": "العلق",
    "englishTranslation": "The Clot",
    "numberOfAyahs": 19,
    "revelationType": "Meccan",
    "order": 1,
    "rukus": 1,
    "start": 6106
  },
  {
    "number": 97,
    "name": "Al-Qadr",
    "arabicName": "القدر",
    "englishTranslation": "The Power, Fate",
    "numberOfAyahs": 5,
    "revelationType": "Meccan",
    "order": 25,
    "rukus": 1,
    "start": 6125
  },
  {
    "number": 98,
    "name": "Al-Bayyina",
    "arabicName": "البينة",
    "englishTranslation": "The Evidence",
    "numberOfAyahs": 8,
    "revelationType": "Medinan",
    "order": 100,
    "rukus": 1,
    "start": 6130
  },
  {
    "number": 99,
    "name": "Az-Zalzala",
    "arabicName": "الزلزلة",
    "englishTranslation": "The Earthquake",
    "numberOfAyahs": 8,
    "revelationType": "Medinan",
    "order": 93,
    "rukus": 1,
    "start": 6138
  },
  {
    "number": 100,
    "name": "Al-Aadiyaat",
    "arabicName": "العاديات",
    "englishTranslation": "The Chargers",
    "numberOfAyahs": 11,
    "revelationType": "Meccan",
    "order": 14,
    "rukus": 1,
    "start": 6146
  },
  {
    "number": 101,
    "name": "Al-Qaari'a",
    "arabicName": "القارعة",
    "englishTranslation": "The Calamity",
    "numberOfAyahs": 11,
    "revelationType": "Meccan",
    "order": 30,
    "rukus": 1,
    "start": 6157
  },
  {
    "number": 102,
    "name": "At-Takaathur",
    "arabicName": "التكاثر",
    "englishTranslation": "Competition",
    "numberOfAyahs": 8,
    "revelationType": "Meccan",
    "order": 16,
    "rukus": 1,
    "start": 6168
  },
  {
    "number": 103,
    "name": "Al-Asr",
    "arabicName": "العصر",
    "englishTranslation": "The Declining Day, Epoch",
    "numberOfAyahs": 3,
    "revelationType": "Meccan",
    "order": 13,
    "rukus": 1,
    "start": 6176
  },
  {
    "number": 104,
    "name": "Al-Humaza",
    "arabicName": "الهمزة",
    "englishTranslation": "The Traducer",
    "numberOfAyahs": 9,
    "revelationType": "Meccan",
    "order": 32,
    "rukus": 1,
    "start": 6179
  },
  {
    "number": 105,
    "name": "Al-Fil",
    "arabicName": "الفيل",
    "englishTranslation": "The Elephant",
    "numberOfAyahs": 5,
    "revelationType": "Meccan",
    "order": 19,
    "rukus": 1,
    "start": 6188
  },
  {
    "number": 106,
    "name": "Quraish",
    "arabicName": "قريش",
    "englishTranslation": "Quraysh",
    "numberOfAyahs": 4,
    "revelationType": "Meccan",
    "order": 29,
    "rukus": 1,
    "start": 6193
  },
  {
    "number": 107,
    "name": "Al-Maa'un",
    "arabicName": "الماعون",
    "englishTranslation": "Almsgiving",
    "numberOfAyahs": 7,
    "revelationType": "Meccan",
    "order": 17,
    "rukus": 1,
    "start": 6197
  },
  {
    "number": 108,
    "name": "Al-Kawthar",
    "arabicName": "الكوثر",
    "englishTranslation": "Abundance",
    "numberOfAyahs": 3,
    "revelationType": "Meccan",
    "order": 15,
    "rukus": 1,
    "start": 6204
  },
  {
    "number": 109,
    "name": "Al-Kaafiroon",
    "arabicName": "الكافرون",
    "englishTranslation": "The Disbelievers",
    "numberOfAyahs": 6,
    "revelationType": "Meccan",
    "order": 18,
    "rukus": 1,
    "start": 6207
  },
  {
    "number": 110,
    "name": "An-Nasr",
    "arabicName": "النصر",
    "englishTranslation": "Divine Support",
    "numberOfAyahs": 3,
    "revelationType": "Medinan",
    "order": 114,
    "rukus": 1,
    "start": 6213
  },
  {
    "number": 111,
    "name": "Al-Masad",
    "arabicName": "المسد",
    "englishTranslation": "The Palm Fibre",
    "numberOfAyahs": 5,
    "revelationType": "Meccan",
    "order": 6,
    "rukus": 1,
    "start": 6216
  },
  {
    "number": 112,
    "name": "Al-Ikhlaas",
    "arabicName": "الإخلاص",
    "englishTranslation": "Sincerity",
    "numberOfAyahs": 4,
    "revelationType": "Meccan",
    "order": 22,
    "rukus": 1,
    "start": 6221
  },
  {
    "number": 113,
    "name": "Al-Falaq",
    "arabicName": "الفلق",
    "englishTranslation": "The Dawn",
    "numberOfAyahs": 5,
    "revelationType": "Meccan",
    "order": 20,
    "rukus": 1,
    "start": 6225
  },
  {
    "number": 114,
    "name": "An-Naas",
    "arabicName": "الناس",
    "englishTranslation": "Mankind",
    "numberOfAyahs": 6,
    "revelationType": "Meccan",
    "order": 21,
    "rukus": 1,
    "start": 6230
  }
];

export const QURAN_JUZ_META: JuzMeta[] = [
  {
    "juz": 1,
    "surah": 1,
    "ayah": 1
  },
  {
    "juz": 2,
    "surah": 2,
    "ayah": 142
  },
  {
    "juz": 3,
    "surah": 2,
    "ayah": 253
  },
  {
    "juz": 4,
    "surah": 3,
    "ayah": 93
  },
  {
    "juz": 5,
    "surah": 4,
    "ayah": 24
  },
  {
    "juz": 6,
    "surah": 4,
    "ayah": 148
  },
  {
    "juz": 7,
    "surah": 5,
    "ayah": 82
  },
  {
    "juz": 8,
    "surah": 6,
    "ayah": 111
  },
  {
    "juz": 9,
    "surah": 7,
    "ayah": 88
  },
  {
    "juz": 10,
    "surah": 8,
    "ayah": 41
  },
  {
    "juz": 11,
    "surah": 9,
    "ayah": 93
  },
  {
    "juz": 12,
    "surah": 11,
    "ayah": 6
  },
  {
    "juz": 13,
    "surah": 12,
    "ayah": 53
  },
  {
    "juz": 14,
    "surah": 15,
    "ayah": 1
  },
  {
    "juz": 15,
    "surah": 17,
    "ayah": 1
  },
  {
    "juz": 16,
    "surah": 18,
    "ayah": 75
  },
  {
    "juz": 17,
    "surah": 21,
    "ayah": 1
  },
  {
    "juz": 18,
    "surah": 23,
    "ayah": 1
  },
  {
    "juz": 19,
    "surah": 25,
    "ayah": 21
  },
  {
    "juz": 20,
    "surah": 27,
    "ayah": 56
  },
  {
    "juz": 21,
    "surah": 29,
    "ayah": 46
  },
  {
    "juz": 22,
    "surah": 33,
    "ayah": 31
  },
  {
    "juz": 23,
    "surah": 36,
    "ayah": 28
  },
  {
    "juz": 24,
    "surah": 39,
    "ayah": 32
  },
  {
    "juz": 25,
    "surah": 41,
    "ayah": 47
  },
  {
    "juz": 26,
    "surah": 46,
    "ayah": 1
  },
  {
    "juz": 27,
    "surah": 51,
    "ayah": 31
  },
  {
    "juz": 28,
    "surah": 58,
    "ayah": 1
  },
  {
    "juz": 29,
    "surah": 67,
    "ayah": 1
  },
  {
    "juz": 30,
    "surah": 78,
    "ayah": 1
  }
];

export const INITIAL_SURAH_1: FullSurahData = {
  "number": 1,
  "name": "Al-Faatiha",
  "arabicName": "الفاتحة",
  "englishTranslation": "The Opening",
  "numberOfAyahs": 7,
  "revelationType": "Meccan",
  "order": 5,
  "rukus": 1,
  "start": 0,
  "verses": [
    {
      "surahNumber": 1,
      "ayahNumber": 1,
      "arabic": "بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ",
      "transliteration": "Bismi All<u>a</U>hi a<b>l</B>rra<u>h</U>m<u>a</U>ni a<b>l</B>rra<u>h</U>eem<b>i</b>",
      "translation": "In the name of Allah, the Merciful, the Compassionate",
      "juz": 1,
      "quranLink": "https://quran.com/1/1"
    },
    {
      "surahNumber": 1,
      "ayahNumber": 2,
      "arabic": "ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَـٰلَمِينَ",
      "transliteration": "Al<u>h</U>amdu lill<u>a</U>hi rabbi alAA<u>a</U>lameen<b>a</b>",
      "translation": "Praise be to Allah, the Lord of the entire universe.",
      "juz": 1,
      "quranLink": "https://quran.com/1/2"
    },
    {
      "surahNumber": 1,
      "ayahNumber": 3,
      "arabic": "ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ",
      "transliteration": "A<b>l</B>rra<u>h</U>m<u>a</U>ni a<b>l</B>rra<u>h</U>eem<b>i</b>",
      "translation": "The Merciful, the Compassionate",
      "juz": 1,
      "quranLink": "https://quran.com/1/3"
    },
    {
      "surahNumber": 1,
      "ayahNumber": 4,
      "arabic": "مَـٰلِكِ يَوْمِ ٱلدِّينِ",
      "transliteration": "M<u>a</U>liki yawmi a<b>l</B>ddeen<b>i</b>",
      "translation": "The Master of the Day of Recompense.",
      "juz": 1,
      "quranLink": "https://quran.com/1/4"
    },
    {
      "surahNumber": 1,
      "ayahNumber": 5,
      "arabic": "إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ",
      "transliteration": "Iyy<u>a</U>ka naAAbudu waiyy<u>a</U>ka nastaAAeen<b>u</b>",
      "translation": "You alone do we worship, and You alone do we turn for help",
      "juz": 1,
      "quranLink": "https://quran.com/1/5"
    },
    {
      "surahNumber": 1,
      "ayahNumber": 6,
      "arabic": "ٱهْدِنَا ٱلصِّرَٰطَ ٱلْمُسْتَقِيمَ",
      "transliteration": "Ihdin<u>a</U> a<b>l</B><u>ss</U>ir<u>at</U>a almustaqeem<b>a</b>",
      "translation": "Direct us on to the Straight Way,",
      "juz": 1,
      "quranLink": "https://quran.com/1/6"
    },
    {
      "surahNumber": 1,
      "ayahNumber": 7,
      "arabic": "صِرَٰطَ ٱلَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ ٱلْمَغْضُوبِ عَلَيْهِمْ وَلَا ٱلضَّآلِّينَ",
      "transliteration": "<u>S</U>ir<u>at</U>a alla<u>th</U>eena anAAamta AAalayhim ghayri almagh<u>d</U>oobi AAalayhim wal<u>a</U> a<b>l</B><u>dda</U>lleen<b>a</b>",
      "translation": "The way of those whom You have favoured, who did not incur Your wrath, who are not astray.",
      "juz": 1,
      "quranLink": "https://quran.com/1/7"
    }
  ]
};
