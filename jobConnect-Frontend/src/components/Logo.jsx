import React from 'react';
import { Link } from 'react-router-dom';

const Logo = ({ size = 'default', showText = true, isDark = false, className = '' }) => {
  // Dimensions based on size prop
  const iconSizes = {
    sm: 'w-7 h-7',
    default: 'w-9 h-9',
    lg: 'w-12 h-12',
  };

  const textSizes = {
    sm: 'text-lg',
    default: 'text-xl',
    lg: 'text-2xl',
  };

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Dynamic Geometric 'JC' Connected Emblem */}
      <div
        className={`${iconSizes[size] || iconSizes.default} relative flex items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-700 via-indigo-600 to-cyan-400 p-0.5 shadow-md shadow-indigo-500/20 shrink-0 transition-transform duration-200 hover:scale-105`}
      >
        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full p-1"
        >
          <defs>
            <linearGradient id="jc-gradient" x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse">
              <stop stopColor="#FFFFFF" />
              <stop offset="0.6" stopColor="#E0E7FF" />
              <stop offset="1" stopColor="#38BDF8" />
            </linearGradient>
            <linearGradient id="glow-gradient" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
              <stop stopColor="#6366F1" />
              <stop offset="1" stopColor="#06B6D4" />
            </linearGradient>
          </defs>

          {/* Letter 'J' Ribbon Curve */}
          <path
            d="M20 10V28C20 33 16 36 11 36C8 36 6 34.5 6 34.5"
            stroke="url(#jc-gradient)"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Interlocking 'C' Connection Arc */}
          <path
            d="M40 18C37 12 30 11 25 15C19 20 20 31 27 34C34 37 40 33 42 28"
            stroke="url(#jc-gradient)"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Connected Bridge Spark Dot */}
          <circle cx="23.5" cy="23.5" r="2.8" fill="#38BDF8" />
        </svg>
      </div>

      {/* Brand Typography */}
      {showText && (
        <span
          className={`font-black tracking-tight ${textSizes[size] || textSizes.default} ${
            isDark ? 'text-white' : 'text-slate-900'
          }`}
        >
          Job<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-cyan-500">Connect</span>
        </span>
      )}
    </div>
  );
};

export default Logo;
