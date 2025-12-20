import React from 'react';
import { X, CheckCircle } from 'lucide-react';

interface SuccessProps {
  message: string | null;
  onClose?: () => void;
  variant?: 'alert' | 'inline';
  className?: string;
}

/**
 * Success Component
 * Displays success messages with optional close button
 * 
 * Variants:
 * - alert: Full-width alert box (default)
 * - inline: Compact inline success message
 */
export const Success: React.FC<SuccessProps> = ({
  message,
  onClose,
  variant = 'alert',
  className = ''
}) => {
  if (!message) return null;

  if (variant === 'inline') {
    return (
      <div className={`flex items-center gap-2 text-sm text-green-600 ${className}`}>
        <CheckCircle size={16} />
        <span>{message}</span>
      </div>
    );
  }

  return (
    <div className={`bg-green-50 border border-green-200 rounded-lg p-4 mb-4 ${className}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1">
          <CheckCircle className="text-green-600 mt-0.5 flex-shrink-0" size={20} />
          <p className="text-green-800 text-sm">{message}</p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-green-600 hover:text-green-800 transition"
            aria-label="Close success message"
          >
            <X size={20} />
          </button>
        )}
      </div>
    </div>
  );
};

export default Success;
