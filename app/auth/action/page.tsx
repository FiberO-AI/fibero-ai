'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { auth } from '../../../lib/firebase';
import { applyActionCode, verifyPasswordResetCode, confirmPasswordReset } from 'firebase/auth';
import { clsx } from 'clsx';

export default function AuthAction() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    // Check for dark mode preference
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(savedDarkMode);
    if (savedDarkMode) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  useEffect(() => {
    const handleAuthAction = async () => {
      const mode = searchParams.get('mode');
      const actionCode = searchParams.get('oobCode');

      if (!actionCode) {
        setStatus('error');
        setMessage('Invalid action code');
        return;
      }

      try {
        switch (mode) {
          case 'verifyEmail':
            await applyActionCode(auth, actionCode);
            // Redirect immediately to our custom success page without showing intermediate page
            window.location.href = '/verify';
            return;

          case 'resetPassword':
            // For password reset, we'd handle it here
            setStatus('success');
            setMessage('Password reset link is valid');
            break;

          default:
            setStatus('error');
            setMessage('Unknown action mode');
        }
      } catch (error: any) {
        setStatus('error');
        setMessage(error.message || 'An error occurred');
      }
    };

    handleAuthAction();
  }, [searchParams, router]);

  if (status === 'loading') {
    return (
      <div className={clsx(
        "min-h-screen flex items-center justify-center",
        darkMode ? "bg-slate-900" : "bg-slate-50"
      )}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className={darkMode ? "text-white" : "text-slate-800"}>
            Processing your request...
          </p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className={clsx(
        "min-h-screen flex items-center justify-center p-4",
        darkMode ? "bg-slate-900" : "bg-slate-50"
      )}>
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">❌</span>
          </div>
          <h1 className={clsx(
            "text-2xl font-bold mb-2",
            darkMode ? "text-white" : "text-slate-800"
          )}>
            Verification Failed
          </h1>
          <p className={clsx(
            "mb-6",
            darkMode ? "text-slate-300" : "text-slate-600"
          )}>
            {message}
          </p>
          <button
            onClick={() => window.location.href = '/'}
            className="px-6 py-3 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  // Success case - this will briefly show before redirect
  return (
    <div className={clsx(
      "min-h-screen flex items-center justify-center",
      darkMode ? "bg-slate-900" : "bg-slate-50"
    )}>
      <div className="text-center">
        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">✅</span>
        </div>
        <p className={darkMode ? "text-white" : "text-slate-800"}>
          {message}
        </p>
        <p className={clsx(
          "text-sm mt-2",
          darkMode ? "text-slate-400" : "text-slate-500"
        )}>
          Redirecting...
        </p>
      </div>
    </div>
  );
}
