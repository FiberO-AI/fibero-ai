'use client';

import { useState, useEffect } from 'react';
import { clsx } from 'clsx';

interface ToastProps {
  message: string;
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

export default function Toast({ message, isVisible, onClose, duration = 3000 }: ToastProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setIsAnimating(true);
      const timer = setTimeout(() => {
        setIsAnimating(false);
        setTimeout(() => {
          onClose();
        }, 300); // Wait for fade out animation
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  if (!isVisible) return null;

  return (
    <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-[9999] pointer-events-none">
      <div
        className={clsx(
          "px-6 py-3 rounded-lg shadow-lg border transition-all duration-300 transform",
          "bg-green-50 border-green-200 text-green-800",
          isAnimating 
            ? "translate-y-0 opacity-100 scale-100" 
            : "-translate-y-2 opacity-0 scale-95"
        )}
      >
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 flex items-center justify-center">
            <svg 
              className="w-4 h-4 text-green-600" 
              fill="currentColor" 
              viewBox="0 0 20 20"
            >
              <path 
                fillRule="evenodd" 
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" 
                clipRule="evenodd" 
              />
            </svg>
          </div>
          <span className="font-medium text-sm">
            {message}
          </span>
        </div>
      </div>
    </div>
  );
}

// Hook for easy toast management
export function useToast() {
  const [toast, setToast] = useState<{
    message: string;
    isVisible: boolean;
  }>({
    message: '',
    isVisible: false
  });

  const showToast = (message: string) => {
    setToast({
      message,
      isVisible: true
    });
  };

  const hideToast = () => {
    setToast(prev => ({
      ...prev,
      isVisible: false
    }));
  };

  return {
    toast,
    showToast,
    hideToast
  };
}
