import React from 'react';

interface SalahClockProps {
  startTime: Date;
  endTime?: Date;
  isCurrent: boolean;
  status: 'passed' | 'current' | 'upcoming';
  size?: number;
}

export const SalahClock: React.FC<SalahClockProps> = ({
  startTime,
  endTime,
  isCurrent,
  status,
  size = 76,
}) => {
  const now = new Date();

  // Helper to convert time to clock angle (0° = 12 o'clock, 90° = 3 o'clock, etc.)
  const getClockAngle = (date: Date): number => {
    const hours = date.getHours() % 12;
    const minutes = date.getMinutes();
    return ((hours + minutes / 60) / 12) * 360;
  };

  const startAngle = getClockAngle(startTime);
  const effectiveEndTime =
    endTime || new Date(startTime.getTime() + 2.5 * 3600 * 1000);
  const endAngle = getClockAngle(effectiveEndTime);
  const nowAngle = getClockAngle(now);

  // Sweep angle clockwise from start to end
  const sweepAngle = (endAngle - startAngle + 360) % 360 || 360;
  const largeArcFlag = sweepAngle > 180 ? 1 : 0;

  // Polar to Cartesian coordinate converter (0° at 12 o'clock)
  const polarToCartesian = (
    centerX: number,
    centerY: number,
    radius: number,
    angleInDegrees: number
  ) => {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians),
    };
  };

  const center = 50;
  const outerRadius = 38;
  const wedgeRadius = 34;

  const startPoint = polarToCartesian(center, center, wedgeRadius, startAngle);
  const endPoint = polarToCartesian(center, center, wedgeRadius, endAngle);

  // SVG Pie Wedge for the Valid Salah Time Frame
  const wedgePath = [
    `M ${center} ${center}`,
    `L ${startPoint.x} ${startPoint.y}`,
    `A ${wedgeRadius} ${wedgeRadius} 0 ${largeArcFlag} 1 ${endPoint.x} ${endPoint.y}`,
    'Z',
  ].join(' ');

  // SVG Rim Arc for the Valid Salah Time Frame
  const rimRadius = 36;
  const rimStart = polarToCartesian(center, center, rimRadius, startAngle);
  const rimEnd = polarToCartesian(center, center, rimRadius, endAngle);
  const rimPath = [
    `M ${rimStart.x} ${rimStart.y}`,
    `A ${rimRadius} ${rimRadius} 0 ${largeArcFlag} 1 ${rimEnd.x} ${rimEnd.y}`,
  ].join(' ');

  // Current time hand end coordinates
  const handRadius = 24;
  const handPoint = polarToCartesian(center, center, handRadius, nowAngle);

  // Color scheme based on prayer status
  const wedgeFill = isCurrent
    ? 'rgba(16, 185, 129, 0.28)'
    : status === 'passed'
    ? 'rgba(148, 163, 184, 0.15)'
    : 'rgba(99, 102, 241, 0.2)';

  const rimStroke = isCurrent
    ? '#10b981'
    : status === 'passed'
    ? '#94a3b8'
    : '#818cf8';

  return (
    <div
      className="relative flex items-center justify-center shrink-0 select-none"
      style={{ width: size, height: size }}
      title={`Valid Salah Frame: ${startTime.toLocaleTimeString([], {
        hour: 'numeric',
        minute: '2-digit',
      })} to ${effectiveEndTime.toLocaleTimeString([], {
        hour: 'numeric',
        minute: '2-digit',
      })}`}
    >
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full overflow-visible drop-shadow-sm"
      >
        <defs>
          <filter id={`clockGlow-${startAngle}`} x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="0" stdDeviation="1.5" floodColor={rimStroke} floodOpacity="0.5" />
          </filter>
        </defs>

        {/* Clock Background Face */}
        <circle
          cx={center}
          cy={center}
          r={outerRadius}
          className="fill-slate-100 dark:fill-slate-800/90 stroke-slate-200 dark:stroke-slate-700/80"
          strokeWidth="1.5"
        />

        {/* 12, 3, 6, 9 Hour Numbers */}
        <text
          x={center}
          y="23"
          textAnchor="middle"
          className="text-[9px] font-extrabold fill-slate-500 dark:fill-slate-400"
        >
          12
        </text>
        <text
          x="79"
          y="53"
          textAnchor="middle"
          className="text-[9px] font-extrabold fill-slate-500 dark:fill-slate-400"
        >
          3
        </text>
        <text
          x={center}
          y="83"
          textAnchor="middle"
          className="text-[9px] font-extrabold fill-slate-500 dark:fill-slate-400"
        >
          6
        </text>
        <text
          x="21"
          y="53"
          textAnchor="middle"
          className="text-[9px] font-extrabold fill-slate-500 dark:fill-slate-400"
        >
          9
        </text>

        {/* Tick Marks for remaining hours */}
        {[30, 60, 120, 150, 210, 240, 300, 330].map((deg) => {
          const tick = polarToCartesian(center, center, outerRadius - 3, deg);
          return (
            <circle
              key={deg}
              cx={tick.x}
              cy={tick.y}
              r="1"
              className="fill-slate-300 dark:fill-slate-600"
            />
          );
        })}

        {/* Highlighted Valid Timeframe Wedge */}
        <path d={wedgePath} fill={wedgeFill} />

        {/* Highlighted Valid Timeframe Rim Arc */}
        <path
          d={rimPath}
          fill="none"
          stroke={rimStroke}
          strokeWidth="3.5"
          strokeLinecap="round"
          filter={isCurrent ? `url(#clockGlow-${startAngle})` : undefined}
        />

        {/* Start Marker Dot (Entry Time) */}
        <circle
          cx={rimStart.x}
          cy={rimStart.y}
          r="2.5"
          fill="#10b981"
          stroke="#ffffff"
          strokeWidth="1"
        />

        {/* End Marker Dot (Ending Time) */}
        <circle
          cx={rimEnd.x}
          cy={rimEnd.y}
          r="2.5"
          fill="#ef4444"
          stroke="#ffffff"
          strokeWidth="1"
        />

        {/* Current Time Clock Hand */}
        <line
          x1={center}
          y1={center}
          x2={handPoint.x}
          y2={handPoint.y}
          stroke={isCurrent ? '#10b981' : '#f59e0b'}
          strokeWidth="2"
          strokeLinecap="round"
          className={isCurrent ? 'animate-pulse' : ''}
        />

        {/* Center Pivot Pin */}
        <circle
          cx={center}
          cy={center}
          r="3"
          className={isCurrent ? 'fill-emerald-500' : 'fill-slate-700 dark:fill-slate-300'}
        />
        <circle cx={center} cy={center} r="1.2" fill="#ffffff" />
      </svg>
    </div>
  );
};
