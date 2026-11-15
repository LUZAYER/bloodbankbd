'use client';

import React from 'react';
import { useTheme } from './ThemeProvider';
import { Moon, Sun, Droplet } from 'lucide-react';

interface ThemeToggleProps {
  showLabel?: boolean;
  className?: string;
}

export default function ThemeToggle({ showLabel = true, className = '' }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`relative inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-300 border ${
        theme === 'dark'
          ? 'bg-bloody-panel hover:bg-bloody-card text-rose-300 border-bloody-border shadow-lg shadow-black/80 hover:border-red-700'
          : 'bg-white hover:bg-gray-50 text-gray-800 border-gray-300 shadow-sm hover:border-gray-400'
      } ${className}`}
      title={theme === 'dark' ? 'Switch to Clinical White Theme' : 'Switch to Bloody Red & Black Theme'}
      aria-label="Toggle Theme"
    >
      {theme === 'dark' ? (
        <>
          <div className="relative flex items-center justify-center">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping absolute opacity-75"></span>
            <Droplet className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
          </div>
          {showLabel && (
            <span className="tracking-tight text-[11px] font-extrabold text-rose-300">
              Bloody <span className="text-white">Dark</span>
            </span>
          )}
        </>
      ) : (
        <>
          <Sun className="w-3.5 h-3.5 text-amber-500" />
          {showLabel && (
            <span className="tracking-tight text-[11px] font-extrabold text-gray-700">
              Clinical <span className="text-blood-600">Light</span>
            </span>
          )}
        </>
      )}
    </button>
  );
}
