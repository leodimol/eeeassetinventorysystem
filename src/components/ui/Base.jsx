import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { X } from 'lucide-react';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const Button = ({ className, variant = 'primary', size = 'md', ...props }) => {
  const variants = {
    primary: 'btn-primary font-semibold shadow-lg',
    secondary: 'btn-secondary font-medium',
    outline: 'btn-outline font-medium',
    ghost: 'btn-ghost font-medium',
    danger: 'btn-danger font-semibold',
    glass: 'btn-glass font-medium',
  };

  const sizes = {
    sm: 'px-4 py-2 text-xs',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-7 py-3.5 text-base',
    icon: 'p-3',
  };

  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-[12px] transition-all duration-200 active:scale-[0.96] disabled:opacity-50 disabled:pointer-events-none',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  );
};

export const Card = ({ className, children, glass = true, ...props }) => (
  <div className={cn(glass ? 'glass-card' : 'solid-card', 'overflow-hidden', className)} {...props}>
    {children}
  </div>
);

export const Input = ({ className, ...props }) => (
  <input className={cn('w-full ios-input py-3 px-4 text-sm font-medium', className)} {...props} />
);

export const Modal = ({ isOpen, onClose, title, children, footer }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(20px)' }}
      onClick={onClose}
    >
      <div
        className="glass-card w-full max-w-2xl max-h-[85vh] flex flex-col animate-scale-in"
        style={{ borderRadius: '24px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-[var(--border-glass)] shrink-0">
          <h3 className="text-xl font-bold">{title}</h3>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-6 overflow-y-auto modern-scroll">{children}</div>
        {footer && (
          <div className="flex items-center justify-end gap-3 p-6 border-t border-[var(--border-glass)] shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
