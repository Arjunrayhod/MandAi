'use client';

import React from 'react';

interface MandAiLogoProps {
  size?: number;
  className?: string;
  shape?: 'droplet' | 'circle' | 'squircle';
  showSparkle?: boolean;
  animated?: boolean;
}

export const MandAiLogo: React.FC<MandAiLogoProps> = ({
  size = 48,
  className = '',
  shape = 'droplet',
  showSparkle = true,
  animated = true,
}) => {
  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 select-none ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-[0_10px_20px_rgba(0,102,255,0.22)]"
      >
        <defs>
          {/* Water Drop Liquid Body Gradient (Crystal Clear Deep Aquatic to Golden Aura) */}
          <linearGradient id="water-liquid-body" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#e0f2fe" stopOpacity="0.85" />   {/* Clear Sky 100 */}
            <stop offset="35%" stopColor="#38bdf8" stopOpacity="0.45" />  {/* Crystal Cyan */}
            <stop offset="70%" stopColor="#6366f1" stopOpacity="0.4" />   {/* Royal Indigo */}
            <stop offset="100%" stopColor="#0284c7" stopOpacity="0.75" /> {/* Vibrant Blue */}
          </linearGradient>

          {/* Deep Refractive Caustic Glow (Focus of light inside droplet) */}
          <radialGradient id="water-caustic" cx="50%" cy="65%" r="55%">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.7" />
            <stop offset="45%" stopColor="#818cf8" stopOpacity="0.45" />
            <stop offset="80%" stopColor="#c084fc" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>

          {/* Bottom Caustic Bounce Light (Ground Reflection) */}
          <linearGradient id="bottom-caustic-bounce" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
            <stop offset="25%" stopColor="#7dd3fc" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>

          {/* Liquid Glass Edge Stroke (Fresnel Rim) */}
          <linearGradient id="droplet-fresnel-rim" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
            <stop offset="30%" stopColor="#bae6fd" stopOpacity="0.7" />
            <stop offset="65%" stopColor="#c084fc" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.85" />
          </linearGradient>

          {/* Specular Glint Gradient (Glossy Water Reflection) */}
          <linearGradient id="specular-glint" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
            <stop offset="50%" stopColor="#ffffff" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.05" />
          </linearGradient>

          {/* Vivid Mandi Golden Wheat (High Visibility & Saturation) */}
          <linearGradient id="vivid-wheat-gold" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#d97706" />
            <stop offset="40%" stopColor="#f59e0b" />
            <stop offset="80%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#fef08a" />
          </linearGradient>

          {/* Vivid AI Neural Stream (High Visibility & Electric Cyan) */}
          <linearGradient id="vivid-ai-cyan" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00f2fe" />
            <stop offset="50%" stopColor="#4facfe" />
            <stop offset="100%" stopColor="#7c3aed" />
          </linearGradient>

          {/* Sharp Water Drop Shadow */}
          <filter id="droplet-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="6" stdDeviation="6" floodColor="#0284c7" floodOpacity="0.3" />
          </filter>
        </defs>

        {/* --- WATER DROPLET CONTAINER --- */}
        {shape === 'droplet' ? (
          <g filter="url(#droplet-shadow)">
            {/* Realistic Organic Water Drop Path */}
            <path
              d="M60 14 C46 36, 18 64, 18 84 C18 102, 36 114, 60 114 C84 114, 102 102, 102 84 C102 64, 74 36, 60 14 Z"
              fill="url(#water-liquid-body)"
            />
            {/* Inner Caustic Refraction Glow */}
            <path
              d="M60 14 C46 36, 18 64, 18 84 C18 102, 36 114, 60 114 C84 114, 102 102, 102 84 C102 64, 74 36, 60 14 Z"
              fill="url(#water-caustic)"
            />
            {/* Bottom Caustic Bounce Light */}
            <path
              d="M26 86 C26 102, 42 112, 60 112 C78 112, 94 102, 94 86 C88 94, 74 102, 60 102 C46 102, 32 94, 26 86 Z"
              fill="url(#bottom-caustic-bounce)"
            />
            {/* Crystal Liquid Rim Stroke */}
            <path
              d="M60 14 C46 36, 18 64, 18 84 C18 102, 36 114, 60 114 C84 114, 102 102, 102 84 C102 64, 74 36, 60 14 Z"
              stroke="url(#droplet-fresnel-rim)"
              strokeWidth="2"
            />
          </g>
        ) : (
          <g filter="url(#droplet-shadow)">
            {/* Circular Water Dewdrop */}
            <circle cx="60" cy="60" r="52" fill="url(#water-liquid-body)" />
            <circle cx="60" cy="60" r="52" fill="url(#water-caustic)" />
            {/* Bottom Caustic Bounce Arc */}
            <path
              d="M20 70 C28 94, 92 94, 100 70 C88 88, 32 88, 20 70 Z"
              fill="url(#bottom-caustic-bounce)"
            />
            <circle cx="60" cy="60" r="52" stroke="url(#droplet-fresnel-rim)" strokeWidth="2.2" />
          </g>
        )}

        {/* --- SPECULAR WATER DROP HIGHLIGHTS (The signature "Water Glass" glint) --- */}
        {/* Curved Primary Top-Left Specular Reflection */}
        <path
          d={
            shape === 'droplet'
              ? 'M56 26 C44 42, 28 62, 28 78 C28 64, 40 46, 52 32 C55 28, 58 26, 56 26 Z'
              : 'M30 42 C40 24, 76 24, 86 40 C74 32, 44 32, 30 42 Z'
          }
          fill="url(#specular-glint)"
        />
        {/* Tiny Sharp Specular Pinpoint Glint */}
        <circle cx={shape === 'droplet' ? '54' : '36'} cy={shape === 'droplet' ? '30' : '34'} r="3" fill="#ffffff" opacity="0.9" />

        {/* --- MANDAI EMBLEM (Encased Inside Crystal Water Dome) --- */}
        <g id="mandai-core-emblem">
          {/* Golden Mandi Wheat Arc (Left) */}
          <g id="vivid-wheat">
            <path
              d="M40 88 C40 72, 48 58, 60 48"
              stroke="url(#vivid-wheat-gold)"
              strokeWidth="4"
              strokeLinecap="round"
              filter="drop-shadow(0 2px 4px rgba(217,119,6,0.5))"
            />
            {/* Golden Grains with High Sharpness */}
            <path
              d="M38 80 C28 76, 28 66, 38 64 C42 70, 42 76, 38 80 Z"
              fill="url(#vivid-wheat-gold)"
              stroke="#ffffff"
              strokeWidth="0.8"
            />
            <path
              d="M42 66 C32 60, 32 50, 44 48 C48 54, 47 61, 42 66 Z"
              fill="url(#vivid-wheat-gold)"
              stroke="#ffffff"
              strokeWidth="0.8"
            />
            <path
              d="M48 52 C40 46, 42 36, 54 36 C56 42, 54 48, 48 52 Z"
              fill="url(#vivid-wheat-gold)"
              stroke="#ffffff"
              strokeWidth="0.8"
            />
          </g>

          {/* Electric Cyan AI Neural Stream (Right) */}
          <g id="vivid-neural">
            <path
              d="M60 48 C72 58, 80 72, 80 88"
              stroke="url(#vivid-ai-cyan)"
              strokeWidth="4"
              strokeLinecap="round"
              filter="drop-shadow(0 2px 4px rgba(0,242,254,0.6))"
            />
            {/* Synaptic Arcs */}
            <path
              d="M60 54 C74 54, 86 46, 92 36"
              stroke="url(#vivid-ai-cyan)"
              strokeWidth="2.8"
              strokeLinecap="round"
              strokeDasharray="1 3"
            />
            {/* Neural Synapse Nodes */}
            <circle cx="92" cy="36" r="4.5" fill="#00f2fe" stroke="#ffffff" strokeWidth="1.8" />
            <circle cx="94" cy="56" r="4" fill="#a855f7" stroke="#ffffff" strokeWidth="1.8" />
            <circle cx="82" cy="74" r="3.5" fill="#38bdf8" stroke="#ffffff" strokeWidth="1.8" />
          </g>

          {/* Infinity Connection Bridge */}
          <path
            d="M48 38 C54 28, 66 28, 72 38"
            stroke="#ffffff"
            strokeWidth="3.2"
            strokeLinecap="round"
          />

          {/* Central AI Diamond Sparkle (Bright White Star) */}
          {showSparkle && (
            <g
              transform="translate(60, 48)"
              className={animated ? 'animate-spin' : ''}
              style={{ transformOrigin: '60px 48px', animationDuration: '8s' }}
            >
              {/* Brilliant 4-Point Starlight Core */}
              <path
                d="M0 -14 C1 -4, 4 -1, 14 0 C4 1, 1 4, 0 14 C-1 4, -4 1, -14 0 C-4 -1, -1 -4, 0 -14 Z"
                fill="#ffffff"
                filter="drop-shadow(0 0 6px #ffffff)"
              />
              <circle cx="0" cy="0" r="3" fill="#fef08a" />
            </g>
          )}

          {/* "AI" Crystal Pill Tag */}
          <g transform="translate(42, 88)">
            <rect
              x="0"
              y="0"
              width="36"
              height="18"
              rx="9"
              fill="rgba(255, 255, 255, 0.7)"
              stroke="rgba(255, 255, 255, 0.9)"
              strokeWidth="1.2"
              filter="drop-shadow(0 2px 4px rgba(0,0,0,0.15))"
            />
            <text
              x="18"
              y="13"
              textAnchor="middle"
              fill="#0369a1"
              fontSize="11"
              fontWeight="900"
              fontFamily="system-ui, -apple-system, sans-serif"
              letterSpacing="1.2"
            >
              AI
            </text>
          </g>
        </g>
      </svg>
    </div>
  );
};
