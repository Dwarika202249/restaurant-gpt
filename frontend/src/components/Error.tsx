import React from 'react';
import { X, AlertCircle } from 'lucide-react';

interface ErrorProps {
  message: string | null;
  onClose?: () => void;
  variant?: 'alert' | 'inline';
  className?: string;
}

/**
 * Error Component
 * Displays error messages with optional close button
 * 
 * Variants:
 * - alert: Full-width alert box (default)
 * - inline: Compact inline error
 */
export const Error: React.FC<ErrorProps> = ({
  message,
  onClose,
  variant = 'alert',
  className = ''
}) => {
  if (!message) return null;

  if (variant === 'inline') {
    return (
      <div className={`flex items-center gap-2 text-sm text-red-600 ${className}`}>
        <AlertCircle size={16} />
        <span>{message}</span>
      </div>
    );
  }

  return (
    <div className={`bg-red-50 border border-red-200 rounded-lg p-4 mb-4 ${className}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1">
          <AlertCircle className="text-red-600 mt-0.5 flex-shrink-0" size={20} />
          <p className="text-red-800 text-sm">{message}</p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-red-600 hover:text-red-800 transition"
            aria-label="Close error message"
          >
            <X size={20} />
          </button>
        )}
      </div>
    </div>
  );
};

export default Error;
