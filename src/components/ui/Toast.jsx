import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, X, AlertTriangle, Info } from 'lucide-react';

const Toast = ({ message, type = 'success', duration = 3000, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  const icons = {
    success: <CheckCircle size={24} style={{ color: 'var(--accent-green)' }} />,
    error: <XCircle size={24} style={{ color: 'var(--accent-red)' }} />,
    warning: <AlertTriangle size={24} style={{ color: 'var(--accent-orange)' }} />,
    info: <Info size={24} style={{ color: 'var(--accent-blue)' }} />
  };

  const borderColors = {
    success: 'var(--accent-green)',
    error: 'var(--accent-red)',
    warning: 'var(--accent-orange)',
    info: 'var(--accent-blue)'
  };

  const bgColors = {
    success: 'rgba(34, 197, 94, 0.1)',
    error: 'rgba(239, 68, 68, 0.1)',
    warning: 'rgba(249, 115, 22, 0.1)',
    info: 'rgba(59, 130, 246, 0.1)'
  };

  return (
    <div
      className={`fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 flex items-center gap-4 px-8 py-5 rounded-2xl shadow-2xl transition-all duration-300 ${
        isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
      }`}
      style={{
        background: `linear-gradient(135deg, var(--bg-glass) 0%, ${bgColors[type]} 100%)`,
        backdropFilter: 'blur(20px)',
        border: `2px solid ${borderColors[type]}`,
        minWidth: '420px',
        maxWidth: '520px',
        boxShadow: `0 8px 32px rgba(0, 0, 0, 0.3), 0 0 0 1px ${borderColors[type]}20`
      }}
    >
      <div className="flex-shrink-0 p-2 rounded-xl" style={{ background: `${borderColors[type]}20` }}>
        {icons[type]}
      </div>
      <div className="flex-1">
        <span className="text-lg font-semibold block" style={{ color: 'var(--text-primary)' }}>
          {type.charAt(0).toUpperCase() + type.slice(1)}
        </span>
        <span className="text-sm font-normal block mt-1" style={{ color: 'var(--text-secondary)' }}>
          {message}
        </span>
      </div>
      <button
        onClick={handleClose}
        className="flex-shrink-0 p-2 rounded-xl hover:bg-[var(--bg-secondary)] transition-all duration-200 hover:scale-110"
        style={{ color: 'var(--text-tertiary)' }}
      >
        <X size={20} />
      </button>
    </div>
  );
};

export default Toast;
