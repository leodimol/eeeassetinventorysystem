import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const themes = {
  DARK: 'dark',
  LIGHT: 'light',
  SYSTEM: 'system',
  CONTRAST: 'contrast',
  SEPIA: 'sepia',
  DARK_RED: 'darkRed',
  OCEAN_BLUE: 'oceanBlue',
  FOREST_GREEN: 'forestGreen',
  ROYAL_PURPLE: 'royalPurple',
  SUNSET_ORANGE: 'sunsetOrange',
  PINK_ROSE: 'pinkRose',
  CYAN_TEAL: 'cyanTeal',
  MIDNIGHT_BLUE: 'midnightBlue',
  GOLD_AMBER: 'goldAmber',
};

const STORAGE_KEY = 'asset_inventory_theme';

const getThemeStyles = (activeTheme) => {
  const palette = {
    light: {
      '--bg-primary': '#f8fafc',
      '--bg-secondary': '#ffffff',
      '--bg-tertiary': '#f1f5f9',
      '--bg-glass': 'rgba(255, 255, 255, 0.92)',
      '--bg-glass-light': 'rgba(248, 250, 252, 0.98)',
      '--text-primary': '#0f172a',
      '--text-secondary': '#334155',
      '--text-tertiary': '#64748b',
      '--border-color': 'rgba(15, 23, 42, 0.10)',
      '--border-glass': 'rgba(15, 23, 42, 0.08)',
      '--shadow-sm': '0 1px 3px rgba(0,0,0,0.08)',
      '--shadow-md': '0 4px 24px rgba(0,0,0,0.10)',
      '--shadow-lg': '0 12px 48px rgba(0,0,0,0.12)',
      '--accent-primary': '#2563eb',
      '--accent-secondary': '#1d4ed8',
      '--accent-success': '#10b981',
      '--accent-warning': '#f97316',
      '--accent-danger': '#ef4444',
      '--blur-amount': '20px',
    },
    dark: {
      '--bg-primary': '#071023',
      '--bg-secondary': '#081427',
      '--bg-tertiary': '#0c1530',
      '--bg-glass': 'rgba(6, 8, 20, 0.92)',
      '--bg-glass-light': 'rgba(12, 18, 34, 0.96)',
      '--text-primary': '#f8f7f6',
      '--text-secondary': '#e6e3e3',
      '--text-tertiary': '#b8b6bb',
      '--border-color': 'rgba(200, 40, 40, 0.10)',
      '--border-glass': 'rgba(200, 40, 40, 0.08)',
      '--shadow-sm': '0 1px 3px rgba(0,0,0,0.18)',
      '--shadow-md': '0 4px 24px rgba(0,0,0,0.3)',
      '--shadow-lg': '0 12px 48px rgba(0,0,0,0.35)',
      '--accent-primary': '#c62828',
      '--accent-secondary': '#8b1f1f',
      '--accent-success': '#10b981',
      '--accent-warning': '#f97316',
      '--accent-danger': '#ef4444',
      '--blur-amount': '20px',
    },
    contrast: {
      '--bg-primary': '#000000',
      '--bg-secondary': '#000000',
      '--bg-tertiary': '#000000',
      '--bg-glass': 'rgba(0, 0, 0, 0.98)',
      '--bg-glass-light': 'rgba(20, 20, 20, 0.99)',
      '--text-primary': '#ffffff',
      '--text-secondary': '#ffffff',
      '--text-tertiary': '#cccccc',
      '--border-color': '#ffffff',
      '--border-glass': 'rgba(255, 255, 255, 0.8)',
      '--shadow-sm': '0 0 0 2px #ffffff',
      '--shadow-md': '0 0 0 3px #ffffff',
      '--shadow-lg': '0 0 0 4px #ffffff',
      '--accent-primary': '#00ff00',
      '--accent-secondary': '#00ffff',
      '--accent-success': '#00ff00',
      '--accent-warning': '#ffff00',
      '--accent-danger': '#ff0000',
      '--blur-amount': '0px',
    },
    sepia: {
      '--bg-primary': '#e8e0d0',
      '--bg-secondary': '#f5f0e6',
      '--bg-tertiary': '#d8d0c0',
      '--bg-glass': 'rgba(245, 240, 230, 0.95)',
      '--bg-glass-light': 'rgba(255, 255, 255, 0.98)',
      '--text-primary': '#2a2010',
      '--text-secondary': '#3d3020',
      '--text-tertiary': '#5a4a3a',
      '--border-color': 'rgba(60, 50, 40, 0.3)',
      '--border-glass': 'rgba(60, 50, 40, 0.2)',
      '--shadow-sm': '0 1px 3px rgba(60,50,40,0.15)',
      '--shadow-md': '0 4px 24px rgba(60,50,40,0.2)',
      '--shadow-lg': '0 12px 48px rgba(60,50,40,0.25)',
      '--accent-primary': '#8b4513',
      '--accent-secondary': '#a0522d',
      '--accent-success': '#556b2f',
      '--accent-warning': '#d2691e',
      '--accent-danger': '#a52a2a',
      '--blur-amount': '20px',
    },
    darkRed: {
      '--bg-primary': '#0a0000',
      '--bg-secondary': '#140505',
      '--bg-tertiary': '#1f0a0a',
      '--bg-glass': 'rgba(20, 5, 5, 0.95)',
      '--bg-glass-light': 'rgba(31, 10, 10, 0.98)',
      '--text-primary': '#ffffff',
      '--text-secondary': '#ffe0e0',
      '--text-tertiary': '#ff8888',
      '--border-color': 'rgba(255, 50, 50, 0.4)',
      '--border-glass': 'rgba(255, 50, 50, 0.3)',
      '--shadow-sm': '0 1px 3px rgba(0,0,0,0.5)',
      '--shadow-md': '0 4px 24px rgba(0,0,0,0.6)',
      '--shadow-lg': '0 12px 48px rgba(139, 0, 0, 0.5)',
      '--accent-primary': '#ff2222',
      '--accent-secondary': '#ff4444',
      '--accent-success': '#ff4444',
      '--accent-warning': '#ff6600',
      '--accent-danger': '#ff0000',
      '--blur-amount': '20px',
    },
    oceanBlue: {
      '--bg-primary': '#0a1628',
      '--bg-secondary': '#0f1f3d',
      '--bg-tertiary': '#1a2f52',
      '--bg-glass': 'rgba(15, 31, 61, 0.95)',
      '--bg-glass-light': 'rgba(26, 47, 82, 0.98)',
      '--text-primary': '#e0f0ff',
      '--text-secondary': '#b0d0f0',
      '--text-tertiary': '#7090b0',
      '--border-color': 'rgba(100, 180, 255, 0.3)',
      '--border-glass': 'rgba(100, 180, 255, 0.2)',
      '--shadow-sm': '0 1px 3px rgba(0,0,0,0.4)',
      '--shadow-md': '0 4px 24px rgba(0,50,100,0.5)',
      '--shadow-lg': '0 12px 48px rgba(0,80,150,0.4)',
      '--accent-primary': '#00a8ff',
      '--accent-secondary': '#00d4ff',
      '--accent-success': '#00ff88',
      '--accent-warning': '#ffaa00',
      '--accent-danger': '#ff4444',
      '--blur-amount': '20px',
    },
    forestGreen: {
      '--bg-primary': '#0a1a0a',
      '--bg-secondary': '#0f2a0f',
      '--bg-tertiary': '#1a3a1a',
      '--bg-glass': 'rgba(15, 42, 15, 0.95)',
      '--bg-glass-light': 'rgba(26, 58, 26, 0.98)',
      '--text-primary': '#e0ffe0',
      '--text-secondary': '#b0f0b0',
      '--text-tertiary': '#70a070',
      '--border-color': 'rgba(100, 200, 100, 0.3)',
      '--border-glass': 'rgba(100, 200, 100, 0.2)',
      '--shadow-sm': '0 1px 3px rgba(0,0,0,0.4)',
      '--shadow-md': '0 4px 24px rgba(0,50,0,0.5)',
      '--shadow-lg': '0 12px 48px rgba(0,80,0,0.4)',
      '--accent-primary': '#00cc44',
      '--accent-secondary': '#00ff66',
      '--accent-success': '#00ff88',
      '--accent-warning': '#ffaa00',
      '--accent-danger': '#ff4444',
      '--blur-amount': '20px',
    },
    royalPurple: {
      '--bg-primary': '#1a0a28',
      '--bg-secondary': '#2a0f3d',
      '--bg-tertiary': '#3a1a52',
      '--bg-glass': 'rgba(42, 15, 61, 0.95)',
      '--bg-glass-light': 'rgba(58, 26, 82, 0.98)',
      '--text-primary': '#f0e0ff',
      '--text-secondary': '#d0b0f0',
      '--text-tertiary': '#a070c0',
      '--border-color': 'rgba(180, 100, 255, 0.3)',
      '--border-glass': 'rgba(180, 100, 255, 0.2)',
      '--shadow-sm': '0 1px 3px rgba(0,0,0,0.4)',
      '--shadow-md': '0 4px 24px rgba(50,0,100,0.5)',
      '--shadow-lg': '0 12px 48px rgba(80,0,150,0.4)',
      '--accent-primary': '#9944ff',
      '--accent-secondary': '#bb66ff',
      '--accent-success': '#44ff88',
      '--accent-warning': '#ffaa00',
      '--accent-danger': '#ff4444',
      '--blur-amount': '20px',
    },
    sunsetOrange: {
      '--bg-primary': '#1a0a05',
      '--bg-secondary': '#2a150a',
      '--bg-tertiary': '#3a200f',
      '--bg-glass': 'rgba(42, 21, 15, 0.95)',
      '--bg-glass-light': 'rgba(58, 32, 15, 0.98)',
      '--text-primary': '#fff0e0',
      '--text-secondary': '#ffd0b0',
      '--text-tertiary': '#c09070',
      '--border-color': 'rgba(255, 150, 50, 0.3)',
      '--border-glass': 'rgba(255, 150, 50, 0.2)',
      '--shadow-sm': '0 1px 3px rgba(0,0,0,0.4)',
      '--shadow-md': '0 4px 24px rgba(100,50,0,0.5)',
      '--shadow-lg': '0 12px 48px rgba(150,50,0,0.4)',
      '--accent-primary': '#ff6600',
      '--accent-secondary': '#ff8833',
      '--accent-success': '#44ff88',
      '--accent-warning': '#ffaa00',
      '--accent-danger': '#ff4444',
      '--blur-amount': '20px',
    },
    pinkRose: {
      '--bg-primary': '#1a0510',
      '--bg-secondary': '#2a0a1a',
      '--bg-tertiary': '#3a1025',
      '--bg-glass': 'rgba(42, 10, 26, 0.95)',
      '--bg-glass-light': 'rgba(58, 16, 37, 0.98)',
      '--text-primary': '#ffe0f0',
      '--text-secondary': '#ffb0d0',
      '--text-tertiary': '#c070a0',
      '--border-color': 'rgba(255, 100, 150, 0.3)',
      '--border-glass': 'rgba(255, 100, 150, 0.2)',
      '--shadow-sm': '0 1px 3px rgba(0,0,0,0.4)',
      '--shadow-md': '0 4px 24px rgba(100,0,50,0.5)',
      '--shadow-lg': '0 12px 48px rgba(150,0,80,0.4)',
      '--accent-primary': '#ff4488',
      '--accent-secondary': '#ff66aa',
      '--accent-success': '#44ff88',
      '--accent-warning': '#ffaa00',
      '--accent-danger': '#ff4444',
      '--blur-amount': '20px',
    },
    cyanTeal: {
      '--bg-primary': '#051a15',
      '--bg-secondary': '#0a2a25',
      '--bg-tertiary': '#103a30',
      '--bg-glass': 'rgba(10, 42, 37, 0.95)',
      '--bg-glass-light': 'rgba(16, 58, 48, 0.98)',
      '--text-primary': '#e0ffff',
      '--text-secondary': '#b0f0f0',
      '--text-tertiary': '#70c0c0',
      '--border-color': 'rgba(50, 200, 200, 0.3)',
      '--border-glass': 'rgba(50, 200, 200, 0.2)',
      '--shadow-sm': '0 1px 3px rgba(0,0,0,0.4)',
      '--shadow-md': '0 4px 24px rgba(0,50,50,0.5)',
      '--shadow-lg': '0 12px 48px rgba(0,80,80,0.4)',
      '--accent-primary': '#00cccc',
      '--accent-secondary': '#00eeee',
      '--accent-success': '#00ff88',
      '--accent-warning': '#ffaa00',
      '--accent-danger': '#ff4444',
      '--blur-amount': '20px',
    },
    midnightBlue: {
      '--bg-primary': '#050510',
      '--bg-secondary': '#0a0a1f',
      '--bg-tertiary': '#10102f',
      '--bg-glass': 'rgba(10, 10, 31, 0.95)',
      '--bg-glass-light': 'rgba(16, 16, 47, 0.98)',
      '--text-primary': '#e0e0ff',
      '--text-secondary': '#b0b0f0',
      '--text-tertiary': '#7070c0',
      '--border-color': 'rgba(100, 100, 255, 0.3)',
      '--border-glass': 'rgba(100, 100, 255, 0.2)',
      '--shadow-sm': '0 1px 3px rgba(0,0,0,0.4)',
      '--shadow-md': '0 4px 24px rgba(0,0,50,0.5)',
      '--shadow-lg': '0 12px 48px rgba(0,0,80,0.4)',
      '--accent-primary': '#4444ff',
      '--accent-secondary': '#6666ff',
      '--accent-success': '#44ff88',
      '--accent-warning': '#ffaa00',
      '--accent-danger': '#ff4444',
      '--blur-amount': '20px',
    },
    goldAmber: {
      '--bg-primary': '#1a1505',
      '--bg-secondary': '#2a250a',
      '--bg-tertiary': '#3a350f',
      '--bg-glass': 'rgba(42, 37, 15, 0.95)',
      '--bg-glass-light': 'rgba(58, 53, 15, 0.98)',
      '--text-primary': '#fff8e0',
      '--text-secondary': '#ffe8b0',
      '--text-tertiary': '#d0b870',
      '--border-color': 'rgba(255, 200, 50, 0.3)',
      '--border-glass': 'rgba(255, 200, 50, 0.2)',
      '--shadow-sm': '0 1px 3px rgba(0,0,0,0.4)',
      '--shadow-md': '0 4px 24px rgba(100,80,0,0.5)',
      '--shadow-lg': '0 12px 48px rgba(150,120,0,0.4)',
      '--accent-primary': '#cc8800',
      '--accent-secondary': '#ddaa00',
      '--accent-success': '#44ff88',
      '--accent-warning': '#ffaa00',
      '--accent-danger': '#ff4444',
      '--blur-amount': '20px',
    },
  };

  return palette[activeTheme] || palette.dark;
};

const getSystemTheme = () => {
  if (typeof window === 'undefined') return 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    if (typeof window === 'undefined') return themes.DARK;
    return localStorage.getItem(STORAGE_KEY) || themes.DARK;
  });
  const [systemTheme, setSystemTheme] = useState(getSystemTheme);

  const effectiveTheme = theme === themes.SYSTEM ? systemTheme : theme;

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const listener = (e) => setSystemTheme(e.matches ? 'dark' : 'light');
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.className = '';
    root.classList.add(effectiveTheme);

    const styles = getThemeStyles(effectiveTheme);
    Object.entries(styles).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });
  }, [effectiveTheme]);

  const setTheme = (value) => {
    setThemeState(value);
    localStorage.setItem(STORAGE_KEY, value);
  };

  const value = {
    theme,
    setTheme,
    themes,
    systemTheme,
    effectiveTheme,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
