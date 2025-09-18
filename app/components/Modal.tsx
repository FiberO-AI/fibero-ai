'use client';

import { useEffect } from 'react';
import { clsx } from 'clsx';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info' | 'confirm';
  onConfirm?: () => void;
  confirmText?: string;
  cancelText?: string;
  darkMode?: boolean;
}

export default function Modal({
  isOpen,
  onClose,
  title,
  message,
  type = 'info',
  onConfirm,
  confirmText = 'OK',
  cancelText = 'Cancel',
  darkMode = false
}: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'confirm':
        return '❓';
      default:
        return 'ℹ️';
    }
  };

  const getIconColor = () => {
    switch (type) {
      case 'success':
        return 'text-green-500';
      case 'error':
        return 'text-red-500';
      case 'warning':
        return 'text-yellow-500';
      case 'confirm':
        return 'text-blue-500';
      default:
        return 'text-blue-500';
    }
  };

  const getButtonStyle = (isPrimary: boolean) => {
    if (isPrimary) {
      switch (type) {
        case 'success':
          return 'bg-green-600 hover:bg-green-700 text-white';
        case 'error':
          return 'bg-red-600 hover:bg-red-700 text-white';
        case 'warning':
          return 'bg-yellow-600 hover:bg-yellow-700 text-white';
        default:
          return 'bg-blue-600 hover:bg-blue-700 text-white';
      }
    } else {
      return darkMode
        ? 'bg-gray-600 hover:bg-gray-700 text-white border border-gray-500'
        : 'bg-gray-200 hover:bg-gray-300 text-gray-800 border border-gray-300';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-md"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className={clsx(
        "relative w-full max-w-md mx-4 rounded-xl shadow-2xl transform transition-all duration-200 scale-100",
        darkMode 
          ? "bg-gray-800 border border-gray-700" 
          : "bg-white border border-gray-200"
      )}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4">
          <div className="flex items-center space-x-3">
            <span className={clsx("text-2xl", getIconColor())}>
              {getIcon()}
            </span>
            <h3 className={clsx(
              "text-lg font-semibold",
              darkMode ? "text-white" : "text-gray-900"
            )}>
              {title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className={clsx(
              "rounded-lg p-1 transition-all duration-200",
              darkMode 
                ? "text-gray-400 hover:text-red-400 hover:bg-red-400/10" 
                : "text-gray-500 hover:text-red-500 hover:bg-red-500/10"
            )}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="px-6 pb-6">
          <p className={clsx(
            "text-sm leading-relaxed",
            darkMode ? "text-gray-300" : "text-gray-600"
          )}>
            {message}
          </p>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 p-6 pt-0">
          {type === 'confirm' && onConfirm ? (
            <>
              <button
                onClick={onClose}
                className={clsx(
                  "px-4 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-105",
                  getButtonStyle(false)
                )}
              >
                {cancelText}
              </button>
              <button
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
                className={clsx(
                  "px-4 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-105",
                  getButtonStyle(true)
                )}
              >
                {confirmText}
              </button>
            </>
          ) : (
            <button
              onClick={onClose}
              className={clsx(
                "px-6 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-105",
                getButtonStyle(true)
              )}
            >
              {confirmText}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
