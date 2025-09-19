'use client';

import { useState } from 'react';
import { clsx } from 'clsx';
import { useAuth } from '../../contexts/AuthContext';
import TwoFactorVerification from './TwoFactorVerification';

interface LoginPageProps {
  darkMode: boolean;
  onBack: () => void;
  onNavigateToSignup: () => void;
  onNavigateToVerification?: (email: string) => void;
}

export default function LoginPage({ darkMode, onBack, onNavigateToSignup, onNavigateToVerification }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [showTwoFactor, setShowTwoFactor] = useState(false);
  const [pendingUserId, setPendingUserId] = useState('');
  const [twoFactorError, setTwoFactorError] = useState('');
  const [twoFactorLoading, setTwoFactorLoading] = useState(false);
  
  const { login, loginWithGoogle, resetPassword, verifyTwoFactor } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Please fill in all fields.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const result = await login(email, password);
      
      if (result.requiresEmailVerification) {
        // Redirect to email verification page
        if (onNavigateToVerification) {
          onNavigateToVerification(email);
        } else {
          setError('Please verify your email address. A new verification email has been sent.');
        }
        setIsLoading(false);
      } else if (result.requiresTwoFactor && result.userId) {
        // Show 2FA verification page
        setPendingUserId(result.userId);
        setShowTwoFactor(true);
        setIsLoading(false);
      } else {
        // Login successful without 2FA
        onBack();
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed. Please try again.';
      setError(errorMessage);
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError('');

    try {
      await loginWithGoogle();
      onBack(); // Navigate back to home after successful login
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Google login failed. Please try again.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      setError('Please enter your email address first.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await resetPassword(email);
      alert('Password reset email sent! Check your inbox.');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send password reset email. Please try again.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTwoFactorVerify = async (code: string) => {
    setTwoFactorLoading(true);
    setTwoFactorError('');

    try {
      await verifyTwoFactor(pendingUserId, code);
      onBack(); // Navigate back to home after successful 2FA verification
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Two-factor verification failed. Please try again.';
      setTwoFactorError(errorMessage);
    } finally {
      setTwoFactorLoading(false);
    }
  };

  const handleBackFromTwoFactor = () => {
    setShowTwoFactor(false);
    setPendingUserId('');
    setTwoFactorError('');
    // Clear any stored login credentials
    sessionStorage.removeItem('pendingLogin');
  };

  // Show 2FA verification page if needed
  if (showTwoFactor) {
    return (
      <TwoFactorVerification
        darkMode={darkMode}
        email={email}
        onBack={handleBackFromTwoFactor}
        onVerify={handleTwoFactorVerify}
        isLoading={twoFactorLoading}
        error={twoFactorError}
      />
    );
  }

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
            Welcome Back
          </h1>
          <p className={clsx(
            "text-sm",
            darkMode ? "text-gray-400" : "text-gray-600"
          )}>
            Sign in to your Fibero AI account
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-6">
          {/* Email Field */}
          <div>
            <label className={clsx(
              "block text-sm font-medium mb-2",
              darkMode ? "text-gray-300" : "text-gray-700"
            )}>
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={clsx(
                "w-full px-4 py-3 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-4",
                darkMode 
                  ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500/30" 
                  : "bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500/30"
              )}
              placeholder="Enter your email"
            />
          </div>

          {/* Password Field */}
          <div>
            <label className={clsx(
              "block text-sm font-medium mb-2",
              darkMode ? "text-gray-300" : "text-gray-700"
            )}>
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className={clsx(
                  "w-full px-4 py-3 pr-12 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-4",
                  darkMode 
                    ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500/30" 
                    : "bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500/30"
                )}
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={clsx(
                  "absolute right-3 top-1/2 transform -translate-y-1/2 text-sm hover:opacity-80",
                  darkMode ? "text-gray-400" : "text-gray-500"
                )}
              >
                {showPassword ? "👁️" : "👁️‍🗨️"}
              </button>
            </div>
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className={clsx(
                "ml-2 text-sm",
                darkMode ? "text-gray-300" : "text-gray-700"
              )}>
                Remember me
              </span>
            </label>
            <button
              type="button"
              onClick={handleForgotPassword}
              disabled={isLoading}
              className="text-sm text-blue-500 hover:text-blue-600 transition-colors disabled:opacity-50"
            >
              <span className="text-sm text-gray-500">Don&apos;t have an account?</span>
              Forgot password?
            </button>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={isLoading}
            className={clsx(
              "w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-4 transform hover:scale-105",
              isLoading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 focus:ring-blue-500/30 text-white shadow-lg"
            )}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Signing in...
              </div>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="my-6 flex items-center">
          <div className={clsx(
            "flex-1 h-px",
            darkMode ? "bg-gray-600" : "bg-gray-300"
          )}></div>
          <span className={clsx(
            "px-4 text-sm",
            darkMode ? "text-gray-400" : "text-gray-500"
          )}>
            or continue with
          </span>
          <div className={clsx(
            "flex-1 h-px",
            darkMode ? "bg-gray-600" : "bg-gray-300"
          )}></div>
        </div>

        {/* Social Login */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className={clsx(
              "flex items-center justify-center py-3 px-4 rounded-lg border transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-4",
              isLoading
                ? "opacity-50 cursor-not-allowed"
                : darkMode 
                  ? "bg-gray-700 border-gray-600 text-white hover:bg-gray-600 focus:ring-gray-500/30" 
                  : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-500/30"
            )}
          >
            <span className="mr-2">🔍</span>
            Google
          </button>
          <button
            onClick={() => alert('GitHub login coming soon!')}
            disabled={isLoading}
            className={clsx(
              "flex items-center justify-center py-3 px-4 rounded-lg border transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-4",
              isLoading
                ? "opacity-50 cursor-not-allowed"
                : darkMode 
                  ? "bg-gray-700 border-gray-600 text-white hover:bg-gray-600 focus:ring-gray-500/30" 
                  : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-500/30"
            )}
          >
            <span className="mr-2">🐙</span>
            GitHub
          </button>
        </div>

        {/* Sign Up Link */}
        <div className="mt-6 text-center">
          <span className={clsx(
            "text-sm",
            darkMode ? "text-gray-400" : "text-gray-600"
          )}>
            Don&apos;t have an account?{' '}
          </span>
          <button
            onClick={onNavigateToSignup}
            className="text-sm text-blue-500 hover:text-blue-600 transition-colors font-medium"
          >
            Sign up here
          </button>
        </div>
      </div>
    </div>
  );
}
