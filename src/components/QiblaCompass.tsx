import React, { useState, useEffect } from 'react';
import { Compass, AlertCircle, Info, Navigation2, RefreshCw } from 'lucide-react';
import { calculateQiblaBearing } from '../utils/prayerCalc';
import { LocationData } from '../types';

interface QiblaCompassProps {
  location: LocationData;
}

export const QiblaCompass: React.FC<QiblaCompassProps> = ({ location }) => {
  const [deviceHeading, setDeviceHeading] = useState<number | null>(null);
  const [hasOrientationPermission, setHasOrientationPermission] = useState<boolean | null>(null);
  const [permissionError, setPermissionError] = useState<string | null>(null);

  const qiblaBearing = Math.round(calculateQiblaBearing(location.latitude, location.longitude));

  useEffect(() => {
    const handleOrientation = (e: DeviceOrientationEvent) => {
      // In iOS, webkitCompassHeading provides true north heading
      // In Android, alpha is relative
      const heading = (e as unknown as { webkitCompassHeading?: number }).webkitCompassHeading ?? (e.alpha ? 360 - e.alpha : null);
      if (heading !== null && heading !== undefined) {
        setDeviceHeading(Math.round(heading));
        setHasOrientationPermission(true);
      }
    };

    if (window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', handleOrientation, true);
    }

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation, true);
    };
  }, []);

  const requestOrientationPermission = async () => {
    const DeviceOrientation = window.DeviceOrientationEvent as unknown as {
      requestPermission?: () => Promise<'granted' | 'denied'>;
    };

    if (typeof DeviceOrientation?.requestPermission === 'function') {
      try {
        const response = await DeviceOrientation.requestPermission();
        if (response === 'granted') {
          setHasOrientationPermission(true);
          setPermissionError(null);
        } else {
          setHasOrientationPermission(false);
          setPermissionError('Sensor permission was denied. You can still calibrate against True North manually.');
        }
      } catch (err) {
        setPermissionError('Could not access device motion sensor.');
      }
    } else {
      // Standard browser
      setHasOrientationPermission(true);
    }
  };

  // Difference between Qibla and phone heading
  // If deviceHeading is available, needle relative angle = qiblaBearing - deviceHeading
  const needleRotation = deviceHeading !== null ? (qiblaBearing - deviceHeading + 360) % 360 : qiblaBearing;
  const isFacingQibla = deviceHeading !== null && Math.abs(needleRotation) < 5;

  return (
    <div className="space-y-6 max-w-xl mx-auto">
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Qibla Compass
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Direct bearing towards the Holy Kaaba in Makkah al-Mukarramah
        </p>
      </div>

      {/* Main Compass Dial Card */}
      <div className="p-6 md:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center">
        {/* Bearing stats */}
        <div className="text-center mb-6">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block uppercase tracking-wider">
            Kaaba Direction from {location.city}
          </span>
          <div className="mt-1 flex items-baseline justify-center gap-1.5">
            <span className="text-4xl md:text-5xl font-extrabold text-emerald-700 dark:text-emerald-400 tabular-nums font-mono">
              {qiblaBearing}°
            </span>
            <span className="text-sm font-medium text-slate-400">from North</span>
          </div>

          {deviceHeading !== null && (
            <div className={`mt-2 inline-flex items-center gap-1 text-xs px-3 py-1 rounded-full font-medium ${
              isFacingQibla 
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300' 
                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
            }`}>
              <span>Current Heading: {deviceHeading}°</span>
              {isFacingQibla && <span className="font-bold">✓ Facing Qibla</span>}
            </div>
          )}
        </div>

        {/* Animated Compass Visual */}
        <div className="relative w-64 h-64 md:w-72 md:h-72 my-2">
          {/* Outer Ring */}
          <div className="absolute inset-0 rounded-full border-4 border-slate-200 dark:border-slate-800 flex items-center justify-center bg-slate-50/50 dark:bg-slate-950/50">
            {/* Cardinal Points */}
            <span className="absolute top-2 font-bold text-xs text-red-500">N (0°)</span>
            <span className="absolute right-3 font-bold text-xs text-slate-400">E (90°)</span>
            <span className="absolute bottom-2 font-bold text-xs text-slate-400">S (180°)</span>
            <span className="absolute left-3 font-bold text-xs text-slate-400">W (270°)</span>

            {/* Inner degree notches */}
            <div className="w-52 h-52 rounded-full border border-dashed border-slate-300 dark:border-slate-700 relative flex items-center justify-center">
              {/* Kaaba Silhouette / Icon in center */}
              <div className="w-10 h-10 rounded-lg bg-slate-900 border-2 border-amber-400 flex items-center justify-center shadow-lg z-10">
                <span className="text-[10px] font-bold text-amber-300">كعبة</span>
              </div>
            </div>
          </div>

          {/* Rotating Qibla Needle */}
          <div
            className="absolute inset-0 flex items-center justify-center transition-transform duration-300 ease-out pointer-events-none"
            style={{ transform: `rotate(${needleRotation}deg)` }}
          >
            {/* Arrow pointer pointing towards Kaaba */}
            <div className="relative -top-20 flex flex-col items-center">
              <div className="w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-b-[36px] border-b-emerald-600 drop-shadow-md" />
              <div className="w-2.5 h-16 bg-emerald-600 rounded-b-full -mt-1" />
              <span className="mt-1 text-[11px] font-extrabold text-emerald-700 dark:text-emerald-400 bg-white dark:bg-slate-900 px-1.5 py-0.5 rounded shadow">
                QIBLA
              </span>
            </div>
          </div>
        </div>

        {/* Sensor trigger button if needed */}
        {deviceHeading === null && (
          <button
            onClick={requestOrientationPermission}
            className="mt-6 flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition"
          >
            <Compass className="w-4 h-4 text-emerald-600" />
            <span>Enable Live Device Gyroscope</span>
          </button>
        )}
      </div>

      {/* Mandatory Calibration & Magnetic Warnings */}
      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-900 dark:text-amber-200 space-y-2">
        <div className="flex items-center gap-2 font-semibold">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>Compass Calibration & Magnetic Interference Warning</span>
        </div>
        <p className="leading-relaxed">
          • <strong>Calibration Instructions:</strong> If the compass feels unresponsive or inaccurate, wave your device in a slow <strong>figure-8</strong> pattern in the air for 5 seconds to calibrate internal magnetometers.
        </p>
        <p className="leading-relaxed">
          • <strong>Magnetic Interference:</strong> Metal phone cases, magnets, laptops, reinforced concrete buildings, or power cables can warp the magnetic sensor. Step away from large electronic appliances for true accuracy.
        </p>
      </div>

      {/* Kaaba Coordinates Reference */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 space-y-1">
        <div className="flex items-center gap-1.5 font-semibold text-slate-900 dark:text-white">
          <Info className="w-3.5 h-3.5 text-slate-400" />
          <span>Kaaba Sanctuary Coordinates</span>
        </div>
        <p>21° 25′ 21″ N, 39° 49′ 34″ E (Makkah al-Mukarramah, Saudi Arabia)</p>
      </div>
    </div>
  );
};
