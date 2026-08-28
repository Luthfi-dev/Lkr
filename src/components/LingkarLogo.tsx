import React from 'react';
import { useApp } from '../context/AppContext';

interface LingkarLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
  customLogoUrl?: string;
  customName?: string;
}

export const LingkarLogo: React.FC<LingkarLogoProps> = ({
  size = 'md',
  showText = true,
  className = '',
  customLogoUrl,
  customName,
}) => {
  const { appConfig } = useApp();
  const [imgError, setImgError] = React.useState(false);
  const logoUrl = customLogoUrl || appConfig?.appLogo;
  const appName = customName || appConfig?.appName || 'Lingkar';
  const appSub = appConfig?.appMotto ? (appConfig.appMotto.length > 32 ? appConfig.appMotto.slice(0, 32) + '...' : appConfig.appMotto) : 'Ekosistem Kebaikan Tim';

  React.useEffect(() => {
    setImgError(false);
  }, [logoUrl]);

  const sizeMap = {
    sm: { box: 'w-8 h-8', text: 'text-sm font-black', sub: 'text-[9px]' },
    md: { box: 'w-10 h-10', text: 'text-base font-black', sub: 'text-[10px]' },
    lg: { box: 'w-14 h-14', text: 'text-xl font-black', sub: 'text-xs' },
    xl: { box: 'w-20 h-20', text: 'text-2xl font-black', sub: 'text-sm' },
  };

  const currentSize = sizeMap[size];

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      <div className={`relative flex items-center justify-center shrink-0 ${currentSize.box}`}>
        {logoUrl && !imgError ? (
          <img
            src={logoUrl}
            alt={appName}
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
            className="w-full h-full object-cover rounded-xl shadow-2xs"
          />
        ) : (
          <svg
            viewBox="0 0 200 180"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full drop-shadow-sm transition-transform hover:scale-105 duration-300"
          >
            <defs>
              {/* Gradient for infinity loop */}
              <linearGradient id="infinityGrad" x1="20" y1="100" x2="180" y2="100" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#0f4c5c" />
                <stop offset="50%" stopColor="#15616d" />
                <stop offset="100%" stopColor="#0b3b46" />
              </linearGradient>

              {/* Gradient for Left Figure (Blue) */}
              <linearGradient id="figBlue" x1="45" y1="130" x2="70" y2="80" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#1d4ed8" />
                <stop offset="100%" stopColor="#38bdf8" />
              </linearGradient>

              {/* Gradient for Center Figure (Teal/Emerald) */}
              <linearGradient id="figTeal" x1="85" y1="130" x2="100" y2="60" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#059669" />
                <stop offset="100%" stopColor="#10b981" />
              </linearGradient>

              {/* Gradient for Right Figure (Gold/Amber) */}
              <linearGradient id="figGold" x1="120" y1="130" x2="145" y2="80" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="50%" stopColor="#eab308" />
                <stop offset="100%" stopColor="#f59e0b" />
              </linearGradient>

              {/* Star Glow Gradient */}
              <radialGradient id="starGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#fef08a" />
                <stop offset="100%" stopColor="#eab308" />
              </radialGradient>
            </defs>

            {/* Infinity Loop Paths */}
            <path
              d="M 60 145 C 30 145 15 125 15 95 C 15 65 35 50 65 50 C 95 50 115 85 135 115 C 150 138 165 145 185 145 C 205 145 220 125 220 95 C 220 65 200 50 170 50 C 145 50 125 80 100 110"
              stroke="url(#infinityGrad)"
              strokeWidth="9"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              transform="translate(-10, -5)"
            />
            <path
              d="M 175 60 C 150 60 132 88 112 118 C 95 142 80 152 55 152 C 30 152 10 130 10 95 C 10 60 32 40 65 40 C 92 40 115 72 135 102 C 150 125 165 135 185 135 C 210 135 225 115 225 95 C 225 70 210 55 185 55"
              stroke="#1b4958"
              strokeWidth="6"
              strokeLinecap="round"
              strokeOpacity="0.85"
              fill="none"
              transform="translate(-10, -5)"
            />

            {/* Left Person (Blue) */}
            <circle cx="58" cy="98" r="9" fill="url(#figBlue)" />
            <path
              d="M 40 138 C 45 120 54 112 60 112 C 67 112 73 118 78 100 C 80 94 77 82 82 82 C 86 82 84 96 79 108 C 73 122 66 135 55 140 Z"
              fill="url(#figBlue)"
            />

            {/* Center Person Reaching Highest (Teal) */}
            <circle cx="94" cy="74" r="10" fill="url(#figTeal)" />
            <path
              d="M 82 135 C 84 115 88 95 93 90 C 97 86 100 78 106 58 C 109 50 114 55 111 68 C 106 88 102 110 98 135 Z"
              fill="url(#figTeal)"
            />

            {/* Right Person (Green / Gold) */}
            <circle cx="132" cy="98" r="9" fill="#eab308" />
            <path
              d="M 115 135 C 122 120 128 105 133 105 C 139 105 146 112 153 125 C 158 134 148 140 138 139 Z"
              fill="url(#figGold)"
            />

            {/* Arc of Sparkle Dots ascending to Star */}
            <circle cx="50" cy="62" r="3" fill="#15616d" />
            <circle cx="58" cy="53" r="3.5" fill="#15616d" />
            <circle cx="70" cy="46" r="3.5" fill="#15616d" />
            <circle cx="86" cy="43" r="4" fill="#15616d" />

            {/* Glowing 5-Point Star */}
            <path
              d="M 98 12 L 102 24 L 115 25 L 105 34 L 108 46 L 98 39 L 88 46 L 91 34 L 81 25 L 94 24 Z"
              fill="url(#starGlow)"
              className="filter drop-shadow-md animate-pulse"
            />
          </svg>
        )}
      </div>

      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 leading-none">
            <span className={`font-display font-extrabold tracking-tight text-teal-950 ${currentSize.text}`}>
              {appName}
            </span>
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 mb-0.5"></span>
          </div>
          <span className={`font-medium text-slate-500 tracking-wide truncate max-w-[160px] ${currentSize.sub}`}>
            {appSub}
          </span>
        </div>
      )}
    </div>
  );
};
