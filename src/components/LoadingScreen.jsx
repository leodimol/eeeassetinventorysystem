import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingScreen = ({ message = 'Loading Inventory System...' }) => {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'var(--bg-primary)' }}
    >
      <style>{`
        @keyframes glow-pulse {
          0%, 100% {
            opacity: 0.3;
            transform: scale(1);
          }
          50% {
            opacity: 0.6;
            transform: scale(1.1);
          }
        }
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }
      `}</style>
      <div className="flex flex-col items-center space-y-8">
        {/* Logo */}
        <div className="relative">
          {/* Unique glow animation effect */}
          <div
            className="absolute inset-0 blur-3xl animate-pulse"
            style={{
              background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
              opacity: '0.5',
              animation: 'glow-pulse 2s ease-in-out infinite',
            }}
          ></div>

          {/* Logo container */}
          <div
            className="relative p-4"
            style={{
              animation: 'float 3s ease-in-out infinite',
            }}
          >
            <img
              src="/loadingscreen.logo.png"
              alt="EEE Logo"
              className="w-32 h-32 object-contain"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextElementSibling.style.display = 'flex';
              }}
            />
            <div className="absolute inset-4 items-center justify-center hidden">
              <Loader2
                className="w-16 h-16 animate-spin"
                style={{ color: 'var(--accent-primary)' }}
              />
            </div>
          </div>
        </div>

        {/* Text */}
        <div className="text-center space-y-3">
          <h1 className="text-3xl font-bold tracking-wide" style={{ color: 'var(--text-primary)' }}>
            EEE Asset Inventory
          </h1>
          <p className="text-base font-medium" style={{ color: 'var(--text-secondary)' }}>
            {message}
          </p>
        </div>

        {/* Spinner */}
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--accent-primary)' }} />
      </div>
    </div>
  );
};

export default LoadingScreen;
