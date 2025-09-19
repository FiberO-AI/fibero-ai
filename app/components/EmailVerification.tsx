'use client';

import { useState, useEffect } from 'react';
import { clsx } from 'clsx';
import { useAuth } from '../../contexts/AuthContext';

interface EmailVerificationProps {
  darkMode: boolean;
  onBack: () => void;
  userEmail?: string;
}

export default function EmailVerification({ darkMode, onBack, userEmail }: EmailVerificationProps) {
  const { user, sendEmailVerification, checkEmailVerified } = useAuth();
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [displayEmail, setDisplayEmail] = useState('');

  // Get email from props or localStorage
  useEffect(() => {
    const emailToShow = userEmail || localStorage.getItem('pendingVerificationEmail') || '';
    setDisplayEmail(emailToShow);
  }, [userEmail]);

  // Countdown timer for resend button
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  // Auto-check verification status every 5 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      if (checkEmailVerified) {
        const isVerified = await checkEmailVerified();
        if (isVerified) {
          onBack(); // Redirect to home when verified
        }
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [checkEmailVerified, onBack]);

  const handleResendVerification = async () => {
    if (!sendEmailVerification) return;
    
    setIsResending(true);
    setResendMessage('');
    
    try {
      await sendEmailVerification();
      setResendMessage('Verification email sent successfully!');
      setCountdown(60);
      setCanResend(false);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send verification email. Please try again.';
      setResendMessage(errorMessage);
    } finally {
      setIsResending(false);
    }
  };

  const handleCheckVerification = async () => {
    if (!checkEmailVerified) return;
    
    setIsChecking(true);
    
    try {
      const isVerified = await checkEmailVerified();
      if (isVerified) {
        onBack(); // Redirect to home when verified
      } else {
        setResendMessage('Email not verified yet. Please check your inbox and click the verification link.');
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to check verification status. Please try again.';
      setResendMessage(errorMessage);
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className={clsx(
      "min-h-screen transition-all duration-500 ease-in-out flex items-center justify-center p-4",
      darkMode 
        ? "bg-gradient-to-br from-gray-900 via-black to-gray-800" 
        : "bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100"
    )}>
      <div className={clsx(
        "w-full max-w-md backdrop-blur-sm rounded-2xl shadow-2xl border p-8 transition-all duration-300",
        darkMode 
          ? "bg-gray-800/90 border-gray-700/50" 
          : "bg-white/90 border-white/20"
      )}>
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl text-white">📧</span>
          </div>
          <h1 className={clsx(
            "text-2xl font-bold mb-2",
            darkMode ? "text-white" : "text-gray-900"
          )}>
            Verify Your Email
          </h1>
          <p className={clsx(
            "text-sm",
            darkMode ? "text-gray-300" : "text-gray-600"
          )}>
            We&apos;ve sent a verification email to your inbox.
          </p>
          <p className={clsx(
            "text-sm font-medium mt-1",
            darkMode ? "text-blue-400" : "text-blue-600"
          )}>
            {displayEmail || user?.email || 'your email'}
          </p>
        </div>

        {/* Instructions */}
        <div className={clsx(
          "p-4 rounded-xl mb-6",
          darkMode ? "bg-gray-700/50" : "bg-gray-50"
        )}>
          <h3 className={clsx(
            "font-semibold mb-2",
            darkMode ? "text-white" : "text-gray-900"
          )}>
            Next Steps:
          </h3>
          <ol className={clsx(
            "text-sm space-y-1 list-decimal list-inside",
            darkMode ? "text-gray-300" : "text-gray-600"
          )}>
            <li>Check your email inbox (and spam folder)</li>
            <li>Click the verification link in the email</li>
            <li>Return to this page - we&apos;ll automatically detect verification</li>
          </ol>
        </div>

        {/* Status Message */}
        {resendMessage && (
          <div className={clsx(
            "p-4 rounded-xl mb-6 text-sm",
            resendMessage.includes('success') || resendMessage.includes('sent')
              ? "bg-green-100 text-green-700 border border-green-200"
              : resendMessage.includes('not verified')
                ? "bg-yellow-100 text-yellow-700 border border-yellow-200"
                : "bg-red-100 text-red-700 border border-red-200"
          )}>
            {resendMessage}
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-4">
          <button
            onClick={handleCheckVerification}
            disabled={isChecking}
            className={clsx(
              "w-full py-3 px-4 rounded-xl font-medium transition-all duration-200",
              isChecking
                ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                : "bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 shadow-lg hover:shadow-xl"
            )}
          >
            {isChecking ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Checking...</span>
              </div>
            ) : (
              "I&apos;ve Verified My Email"
            )}
          </button>

          <button
            onClick={handleResendVerification}
            disabled={isResending || !canResend}
            className={clsx(
              "w-full py-3 px-4 rounded-xl font-medium transition-all duration-200",
              isResending || !canResend
                ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                : darkMode
                  ? "bg-gray-700 hover:bg-gray-600 text-gray-200"
                  : "bg-gray-200 hover:bg-gray-300 text-gray-700"
            )}
          >
            {isResending ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-gray-400 border-t-gray-600 rounded-full animate-spin"></div>
                <span>Sending...</span>
              </div>
            ) : !canResend ? (
              `Resend Email (${countdown}s)`
            ) : (
              'Resend Verification Email'
            )}
          </button>
        </div>

        {/* Auto-refresh notice */}
        <div className={clsx(
          "text-center mt-6 text-xs",
          darkMode ? "text-gray-400" : "text-gray-500"
        )}>
          <div className="flex items-center justify-center gap-1">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span>Auto-checking verification status...</span>
          </div>
        </div>

        {/* Back to Login */}
        <div className="text-center mt-6">
          <button
            onClick={onBack}
            className={clsx(
              "text-sm underline transition-colors duration-200",
              darkMode 
                ? "text-gray-400 hover:text-white" 
                : "text-gray-600 hover:text-gray-900"
            )}
          >
            ← Back to Login
          </button>
        </div>
      </div>
    </div>
  );
}
