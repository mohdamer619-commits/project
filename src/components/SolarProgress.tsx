import React from 'react';
import { Sun, Moon, Clock, Sparkles } from 'lucide-react';
import { DayPrayerSchedule, formatPrayerTime, formatDurationHuman } from '../utils/prayerCalc';

interface SolarProgressProps {
  schedule: DayPrayerSchedule;
  timezone?: string;
}

export const SolarProgress: React.FC<SolarProgressProps> = ({ schedule, timezone }) => {
  const {
    sunrise,
    sunset,
    solarNoon,
    dhuhr,
    fajrTomorrow,
    lastThirdOfTheNight,
    middleOfTheNight,
    daylightDurationMs,
    isDaytime,
    solarProgressPercent,
    nightProgressPercent,
  } = schedule;

  const now = new Date();
  const nowMs = now.getTime();

  // Natural countdown messages
  let liveMessage = '';
  if (isDaytime) {
    const minutesToSunset = Math.max(0, Math.floor((sunset.getTime() - nowMs) / 60000));
    liveMessage = `${formatDurationHuman(minutesToSunset)} left until sunset`;
  } else {
    const targetFajr = nowMs < sunrise.getTime() ? schedule.fajr : fajrTomorrow;
    const minutesToFajr = Math.max(0, Math.floor((targetFajr.getTime() - nowMs) / 60000));
    liveMessage = `${formatDurationHuman(minutesToFajr)} left until Fajr`;
  }

  const daylightHours = Math.floor(daylightDurationMs / 3600000);
  const daylightMinutes = Math.floor((daylightDurationMs % 3600000) / 60000);

  // =========================================================================
  // SMOOTH, SYMMETRICAL 360-DEGREE OVAL (ELLIPTICAL) SOLAR & LUNAR PATH
  // Complete closed 360° oval, horizontally wider than vertically tall.
  // Center: (200, 120), Rx = 145, Ry = 78 inside a 400x240 viewBox.
  // Upper arc: Daytime (Sunrise [left] -> Solar Noon [top] -> Sunset [right])
  // Lower arc: Nighttime (Sunset [right] -> Middle of Night [bottom] -> Dawn [left])
  // Parametric movement: x = centerX + Rx * cos(theta), y = centerY - Ry * sin(theta)
  // Ensures Sun & Moon markers remain precisely on the oval perimeter without distortion.
  // =========================================================================
  const centerX = 200;
  const centerY = 120;
  const radiusX = 145; // Horizontally wider
  const radiusY = 78;  // Vertically proportional smooth oval

  // Progress clamped strictly between 0 and 1
  const dayProgressNorm = Math.min(1, Math.max(0, solarProgressPercent / 100));
  const nightProgressNorm = Math.min(1, Math.max(0, nightProgressPercent / 100));

  let celestialAngle: number;
  if (isDaytime) {
    // Daytime: from PI (Sunrise, left) to 0 (Sunset, right), passing PI/2 (Noon, top)
    celestialAngle = Math.PI - dayProgressNorm * Math.PI;
  } else {
    // Nighttime: from 0 (Sunset, right) to -PI (Sunrise, left), passing -PI/2 (Midnight, bottom)
    celestialAngle = -nightProgressNorm * Math.PI;
  }

  const celestialX = centerX + radiusX * Math.cos(celestialAngle);
  const celestialY = centerY - radiusY * Math.sin(celestialAngle);

  const isLastThirdActive =
    nowMs >= lastThirdOfTheNight.getTime() &&
    nowMs < (nowMs < sunrise.getTime() ? schedule.fajr.getTime() : fajrTomorrow.getTime());

  return (
    <div className="relative overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800/80 bg-gradient-to-b from-white to-slate-50 dark:from-slate-900/90 dark:to-slate-950 p-5 md:p-6 shadow-sm">
      {/* Header Info */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          {isDaytime ? (
            <Sun className="w-5 h-5 text-amber-500 animate-spin-slow" />
          ) : (
            <Moon className="w-5 h-5 text-indigo-400" />
          )}
          <h2 className="text-sm md:text-base font-semibold text-slate-900 dark:text-white">
            {isDaytime ? 'Solar Movement & Daylight' : 'Night Sky & Tahajjud Hours'}
          </h2>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>Daylight: {daylightHours}h {daylightMinutes}m</span>
        </div>
      </div>

      {/* Live Prominent Message */}
      <div className="mt-4 flex items-center justify-between flex-wrap gap-2">
        <div className="text-base md:text-lg font-medium text-slate-800 dark:text-slate-100">
          {liveMessage}
        </div>
        <div className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
          {isDaytime
            ? `Sun Altitude: ${Math.round(solarProgressPercent)}%`
            : `Night Progress: ${Math.round(nightProgressPercent)}%`}
        </div>
      </div>

      {/* Smooth Symmetrical 360° Oval Solar Dial */}
      <div className="relative mt-3 w-full max-w-[420px] md:max-w-[460px] mx-auto aspect-[400/240] select-none">
        <svg
          viewBox="0 0 400 240"
          className="w-full h-full block overflow-visible"
        >
          <defs>
            {/* Horizon Line Gradient */}
            <linearGradient id="solarHorizonOval" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#94a3b8" stopOpacity="0.05" />
              <stop offset="20%" stopColor="#94a3b8" stopOpacity="0.35" />
              <stop offset="80%" stopColor="#94a3b8" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#94a3b8" stopOpacity="0.05" />
            </linearGradient>

            {/* Sun Glow (Undistorted Circular Radial Gradient) */}
            <radialGradient id="sunGlowOval" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.9" />
              <stop offset="50%" stopColor="#f59e0b" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
            </radialGradient>

            {/* Moon Glow (Undistorted Circular Radial Gradient) */}
            <radialGradient id="moonGlowOval" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#a5b4fc" stopOpacity="0.9" />
              <stop offset="50%" stopColor="#818cf8" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Symmetrical Outer Reference Oval (Full 360° Closed Ellipse) */}
          <ellipse
            cx={centerX}
            cy={centerY}
            rx={radiusX}
            ry={radiusY}
            fill="none"
            stroke="currentColor"
            className="text-slate-200 dark:text-slate-800/80"
            strokeWidth="1.5"
            strokeDasharray="3 3"
          />

          {/* Upper Elliptical Arc: Daytime Solar Path (Sunrise to Sunset) */}
          <path
            d={`M ${centerX - radiusX} ${centerY} A ${radiusX} ${radiusY} 0 0 1 ${centerX + radiusX} ${centerY}`}
            fill="none"
            stroke={isDaytime ? '#f59e0b' : '#64748b'}
            strokeWidth={isDaytime ? '3.5' : '1.5'}
            strokeOpacity={isDaytime ? '0.85' : '0.35'}
            strokeLinecap="round"
          />

          {/* Lower Elliptical Arc: Nighttime Celestial Path (Sunset to Sunrise) */}
          <path
            d={`M ${centerX + radiusX} ${centerY} A ${radiusX} ${radiusY} 0 0 1 ${centerX - radiusX} ${centerY}`}
            fill="none"
            stroke={!isDaytime ? '#818cf8' : '#334155'}
            strokeWidth={!isDaytime ? '3' : '1.5'}
            strokeOpacity={!isDaytime ? '0.75' : '0.25'}
            strokeDasharray={!isDaytime ? 'none' : '3 3'}
            strokeLinecap="round"
          />

          {/* Horizontal Axis: Earth's Horizon Line */}
          <line
            x1="20"
            y1={centerY}
            x2="380"
            y2={centerY}
            stroke="url(#solarHorizonOval)"
            strokeWidth="1.5"
            strokeDasharray="4 4"
          />

          {/* ================================================================= */}
          {/* 4 CARDINAL ASTRONOMICAL MARKERS */}
          {/* ================================================================= */}

          {/* 1. TOP: Solar Noon / Zenith */}
          <circle cx={centerX} cy={centerY - radiusY} r="4" className="fill-amber-500" />
          <text
            x={centerX}
            y={centerY - radiusY - 14}
            textAnchor="middle"
            className="text-[10px] font-semibold fill-slate-700 dark:fill-slate-300"
          >
            Solar Noon ({formatPrayerTime(solarNoon, timezone)})
          </text>

          {/* 2. LEFT: Sunrise (Eastern Horizon) */}
          <circle cx={centerX - radiusX} cy={centerY} r="3.5" className="fill-orange-400" />
          <text
            x={centerX - radiusX}
            y={centerY - 10}
            textAnchor="middle"
            className="text-[10px] font-medium fill-slate-500 dark:fill-slate-400"
          >
            Sunrise
          </text>
          <text
            x={centerX - radiusX}
            y={centerY + 18}
            textAnchor="middle"
            className="text-[10px] font-bold fill-slate-800 dark:fill-slate-200"
          >
            {formatPrayerTime(sunrise, timezone)}
          </text>

          {/* 3. RIGHT: Sunset (Western Horizon) */}
          <circle cx={centerX + radiusX} cy={centerY} r="3.5" className="fill-rose-400" />
          <text
            x={centerX + radiusX}
            y={centerY - 10}
            textAnchor="middle"
            className="text-[10px] font-medium fill-slate-500 dark:fill-slate-400"
          >
            Sunset
          </text>
          <text
            x={centerX + radiusX}
            y={centerY + 18}
            textAnchor="middle"
            className="text-[10px] font-bold fill-slate-800 dark:fill-slate-200"
          >
            {formatPrayerTime(sunset, timezone)}
          </text>

          {/* 4. BOTTOM: Middle of the Night */}
          <circle cx={centerX} cy={centerY + radiusY} r="4" className="fill-indigo-400" />
          <text
            x={centerX}
            y={centerY + radiusY + 16}
            textAnchor="middle"
            className="text-[10px] font-medium fill-slate-500 dark:fill-slate-400"
          >
            Middle of the Night ({formatPrayerTime(middleOfTheNight, timezone)})
          </text>

          {/* ================================================================= */}
          {/* CENTER CELESTIAL HUB BADGE (INSIDE OVAL) */}
          {/* ================================================================= */}
          <ellipse
            cx={centerX}
            cy={centerY}
            rx="48"
            ry="25"
            className="fill-slate-50/85 dark:fill-slate-900/85 stroke-slate-200/70 dark:stroke-slate-800/70"
            strokeWidth="1"
          />
          <text
            x={centerX}
            y={centerY - 7}
            textAnchor="middle"
            className="text-[9px] font-semibold uppercase tracking-wider fill-slate-400"
          >
            {isDaytime ? 'Daylight' : 'Night Sky'}
          </text>
          <text
            x={centerX}
            y={centerY + 7}
            textAnchor="middle"
            className="text-xs font-bold fill-slate-800 dark:fill-slate-200"
          >
            {isDaytime ? `${Math.round(solarProgressPercent)}%` : `${Math.round(nightProgressPercent)}%`}
          </text>
          <text
            x={centerX}
            y={centerY + 19}
            textAnchor="middle"
            className="text-[8.5px] fill-slate-500 dark:fill-slate-400"
          >
            {isDaytime ? 'Sun Path' : 'Moon Path'}
          </text>

          {/* ================================================================= */}
          {/* ANIMATED SUN / MOON CELESTIAL BODY CONSTRAINED ON OVAL PERIMETER */}
          {/* ================================================================= */}
          {isDaytime ? (
            <g transform={`translate(${celestialX}, ${celestialY})`} className="transition-all duration-700">
              <circle cx="0" cy="0" r="16" fill="url(#sunGlowOval)" />
              <circle cx="0" cy="0" r="7.5" fill="#f59e0b" stroke="#ffffff" strokeWidth="2" />
            </g>
          ) : (
            <g transform={`translate(${celestialX}, ${celestialY})`} className="transition-all duration-700">
              <circle cx="0" cy="0" r="14" fill="url(#moonGlowOval)" />
              <circle cx="0" cy="0" r="6.5" fill="#818cf8" stroke="#ffffff" strokeWidth="1.5" />
            </g>
          )}
        </svg>
      </div>

      {/* Precision Markers & Astronomical Notes (Clearly separated with border-t, 0% overlap) */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-800/80 text-xs">
        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50">
          <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Solar Noon (Zenith)</span>
          <span className="font-semibold text-slate-800 dark:text-slate-200 text-sm">
            {formatPrayerTime(solarNoon, timezone)}
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5">Dhuhr starts {formatPrayerTime(dhuhr, timezone)}</span>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50">
          <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Middle of the Night</span>
          <span className="font-semibold text-slate-800 dark:text-slate-200 text-sm">
            {formatPrayerTime(middleOfTheNight, timezone)}
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5">Preferred Isha end (Muslim 612)</span>
        </div>

        <div
          className={`p-2.5 rounded-xl transition-colors ${
            isLastThirdActive
              ? 'bg-amber-500/10 border border-amber-500/30 dark:bg-amber-500/15'
              : 'bg-slate-50 dark:bg-slate-800/50'
          }`}
        >
          <div className="flex items-center gap-1">
            <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Last 1/3 of Night</span>
            {isLastThirdActive && <Sparkles className="w-3 h-3 text-amber-500" />}
          </div>
          <span
            className={`font-semibold text-sm ${
              isLastThirdActive
                ? 'text-amber-600 dark:text-amber-400'
                : 'text-slate-800 dark:text-slate-200'
            }`}
          >
            {formatPrayerTime(lastThirdOfTheNight, timezone)}
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5">Tahajjud & Du'a descent</span>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50">
          <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Asr Shadow Method</span>
          <span className="font-semibold text-slate-800 dark:text-slate-200 text-sm">Single Shadow</span>
          <span className="text-[10px] text-slate-400 block mt-0.5">1x object + original shadow</span>
        </div>
      </div>
    </div>
  );
};
