import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

const ConfirmDialog = ({ isOpen, onClose, onConfirm, title, message, type = 'warning' }) => {
  if (!isOpen) return null;

  const styles = {
    warning: {
      icon: <AlertTriangle size={32} style={{ color: 'var(--accent-orange)' }} />,
      borderColor: 'var(--accent-orange)',
      bgColor: 'rgba(249, 115, 22, 0.1)'
    },
    danger: {
      icon: <AlertTriangle size={32} style={{ color: 'var(--accent-red)' }} />,
      borderColor: 'var(--accent-red)',
      bgColor: 'rgba(239, 68, 68, 0.1)'
    },
    info: {
      icon: <AlertTriangle size={32} style={{ color: 'var(--accent-blue)' }} />,
      borderColor: 'var(--accent-blue)',
      bgColor: 'rgba(59, 130, 246, 0.1)'
    }
  };

  const style = styles[type] || styles.warning;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(4px)'
      }}
      onClick={onClose}
    >
      <div
        className="rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl"
        style={{
          background: 'var(--bg-glass)',
          backdropFilter: 'blur(20px)',
          border: `2px solid ${style.borderColor}`,
          boxShadow: `0 8px 32px rgba(0, 0, 0, 0.3), 0 0 0 1px ${style.borderColor}20`
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-4 mb-4">
          <div className="flex-shrink-0 p-3 rounded-xl" style={{ background: style.bgColor }}>
            {style.icon}
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
              {title}
            </h3>
            <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: 'var(--text-secondary)' }}>
              {message}
            </p>
          </div>
        </div>

        <div className="flex gap-3 justify-end mt-6">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl font-semibold transition-all duration-200 hover:scale-105"
            style={{
              background: 'var(--bg-secondary)',
              color: 'var(--text-secondary)',
              border: '1px solid var(--border-glass)'
            }}
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-5 py-2.5 rounded-xl font-semibold transition-all duration-200 hover:scale-105"
            style={{
              background: style.borderColor,
              color: 'white',
              boxShadow: `0 4px 12px ${style.borderColor}40`
            }}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
