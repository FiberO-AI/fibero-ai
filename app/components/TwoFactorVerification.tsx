'use client';

import { useState } from 'react';
import { clsx } from 'clsx';

interface TwoFactorVerificationProps {
  darkMode: boolean;
  email: string;
  onBack: () => void;
  onVerify: (code: string) => Promise<void>;
  isLoading: boolean;
  error: string;
}

export default function TwoFactorVerification({ 
  darkMode, 
  email, 
  onBack, 
  onVerify, 
  isLoading, 
  error 
}: TwoFactorVerificationProps) {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [focusedIndex, setFocusedIndex] = useState(0);

  const handleInputChange = (index: number, value: string) => {
    if (value.length > 1) return; // Only allow single digit
    
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`code-${index + 1}`);
      nextInput?.focus();
      setFocusedIndex(index + 1);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      const prevInput = document.getElementById(`code-${index - 1}`);
      prevInput?.focus();
      setFocusedIndex(index - 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullCode = code.join('');
    if (fullCode.length === 6) {
      await onVerify(fullCode);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newCode = [...code];
    
    for (let i = 0; i < pastedData.length && i < 6; i++) {
      newCode[i] = pastedData[i];
    }
    
    setCode(newCode);
    
    // Focus the next empty input or the last input
    const nextEmptyIndex = newCode.findIndex(digit => !digit);
    const focusIndex = nextEmptyIndex === -1 ? 5 : nextEmptyIndex;
    const targetInput = document.getElementById(`code-${focusIndex}`);
    targetInput?.focus();
    setFocusedIndex(focusIndex);
  };

  return (
    <div className={clsx(
      "min-h-screen flex items-center justify-center px-4 transition-all duration-500",
      darkMode 
        ? "bg-gradient-to-br from-gray-900 via-black to-gray-800" 
        : "bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100"
    )}>
      {/* Back Button */}
      <button
        onClick={onBack}
        className={clsx(
          "fixed top-6 left-6 z-50 w-12 h-12 rounded-full transition-all duration-300 focus:outline-none focus:ring-4 shadow-lg flex items-center justify-center transform hover:scale-110",
          darkMode 
            ? "bg-gray-800 hover:bg-gray-700 text-white focus:ring-gray-500/30" 
            : "bg-white hover:bg-gray-50 text-gray-800 focus:ring-gray-500/30"
        )}
      >
        <span className="text-lg">←</span>
      </button>

      <div className={clsx(
        "w-full max-w-md p-8 rounded-2xl backdrop-blur-sm border shadow-2xl transition-all duration-300",
        darkMode 
          ? "bg-gray-800/90 border-gray-700/50" 
          : "bg-white/90 border-white/20"
      )}>
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-4xl mb-4">🔐</div>
          <h1 className={clsx(
            "text-3xl font-bold mb-2",
            darkMode ? "text-white" : "text-gray-900"
          )}>
            Two-Factor Authentication
          </h1>
          <p className={clsx(
            "text-sm mb-2",
            darkMode ? "text-gray-400" : "text-gray-600"
          )}>
            Enter the 6-digit code from your authenticator app
          </p>
          <p className={clsx(
            "text-xs",
            darkMode ? "text-gray-500" : "text-gray-500"
          )}>
            Signing in as: <span className="font-medium">{email}</span>
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
            {error}
          </div>
        )}

        {/* 2FA Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Code Input */}
          <div>
            <label className={clsx(
              "block text-sm font-medium mb-4 text-center",
              darkMode ? "text-gray-300" : "text-gray-700"
            )}>
              Verification Code
            </label>
            <p className={clsx(
              "text-xs text-center mb-4",
              darkMode ? "text-gray-400" : "text-gray-600"
            )}>
              We&apos;ll send you a verification code to confirm it&apos;s really you.
            </p>
            <div className="flex justify-center space-x-2" onPaste={handlePaste}>
              {code.map((digit, index) => (
                <input
                  key={index}
                  id={`code-${index}`}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleInputChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onFocus={() => setFocusedIndex(index)}
                  className={clsx(
                    "w-12 h-12 text-center text-xl font-bold rounded-lg border-2 transition-all duration-200 focus:outline-none focus:ring-4",
                    darkMode 
                      ? "bg-gray-700 border-gray-600 text-white focus:border-blue-500 focus:ring-blue-500/30" 
                      : "bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-blue-500/30",
                    focusedIndex === index && "ring-2 ring-blue-500/30"
                  )}
                  disabled={isLoading}
                />
              ))}
            </div>
          </div>

          {/* Verify Button */}
          <button
            type="submit"
            disabled={isLoading || code.join('').length !== 6}
            className={clsx(
              "w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-4 transform hover:scale-105",
              isLoading || code.join('').length !== 6
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 focus:ring-blue-500/30 text-white shadow-lg"
            )}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Verifying...
              </div>
            ) : (
              "Verify & Sign In"
            )}
          </button>
        </form>

        {/* Help Text */}
        <div className="mt-6 text-center">
          <p className={clsx(
            "text-xs mb-2",
            darkMode ? "text-gray-500" : "text-gray-500"
          )}>
            Can&apos;t access your authenticator app?
          </p>
          <button
            onClick={onBack}
            className="text-xs text-blue-500 hover:text-blue-600 transition-colors font-medium"
          >
            Use a different sign-in method
          </button>
        </div>

        {/* Security Notice */}
        <div className={clsx(
          "mt-6 p-3 rounded-lg border text-xs text-center",
          darkMode 
            ? "bg-blue-500/10 border-blue-500/20 text-blue-400" 
            : "bg-blue-50 border-blue-200 text-blue-600"
        )}>
          🛡️ Your account is protected by two-factor authentication
        </div>
      </div>
    </div>
  );
}
