import React from 'react';

interface BrandLogoProps {
  className?: string;
  showText?: boolean;
  textColor?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  className = 'h-8',
  showText = true,
  textColor = 'text-white',
}) => {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Precision Kaushal Setu Logo Mark */}
      <svg
        className="h-8 w-8 shrink-0 rounded-lg shadow-sm"
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width="64" height="64" rx="14" fill="#00685f" />
        {/* Bridge Curve */}
        <path
          d="M12 48 C 24 40, 40 40, 52 48"
          stroke="#89f5e7"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        {/* Demand & Upskilling Trend Line */}
        <path
          d="M14 42 L 24 26 L 36 34 L 48 18"
          stroke="#ffffff"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="14" cy="42" r="3.5" fill="#ffffff" />
        <circle cx="24" cy="26" r="3.5" fill="#ffffff" />
        <circle cx="36" cy="34" r="3.5" fill="#ffffff" />
        {/* Golden Orange Node representing Employment Benchmark */}
        <circle cx="48" cy="18" r="4.5" fill="#ffb77d" stroke="#ffffff" strokeWidth="1.5" />
      </svg>

      {showText && (
        <div className="flex flex-col leading-none">
          <div className="flex items-center gap-1.5">
            <span className={`text-[17px] font-bold tracking-tight font-sans ${textColor}`}>
              Kaushal Setu
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-teal-200">
              v1.0
            </span>
          </div>
          <span className="text-[10px] text-teal-100/70 tracking-wide font-sans mt-0.5">
            कौशल सेतु • Demand-Driven Skills
          </span>
        </div>
      )}
    </div>
  );
};
