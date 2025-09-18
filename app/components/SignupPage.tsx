'use client';

import { useState } from 'react';
import { clsx } from 'clsx';
import { useAuth } from '../../contexts/AuthContext';

interface SignupPageProps {
  darkMode: boolean;
  onBack: () => void;
  onNavigateToLogin: () => void;
  onNavigateToVerification: (email: string) => void;
}

export default function SignupPage({ darkMode, onBack, onNavigateToLogin, onNavigateToVerification }: SignupPageProps) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  
  const { signup, loginWithGoogle } = useAuth();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    
    if (!formData.confirmPassword) newErrors.confirmPassword = 'Please confirm your password';
    else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    
    if (!acceptTerms) newErrors.terms = 'You must accept the terms and conditions';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      await signup(formData.email, formData.password, formData.firstName, formData.lastName);
      // Navigate to verification page instead of home
      onNavigateToVerification(formData.email);
    } catch (err: any) {
      setErrors({ general: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setIsLoading(true);
    setErrors({});

    try {
      await loginWithGoogle();
      onBack(); // Navigate back to home after successful signup
    } catch (err: any) {
      setErrors({ general: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  const getPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const passwordStrength = getPasswordStrength(formData.password);
  const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500'];
  const strengthLabels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];

  return (
    <div className={clsx(
      "min-h-screen flex items-center justify-center px-4 py-8 transition-all duration-500",
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
          <div className="text-4xl mb-4">📝</div>
          <h1 className={clsx(
            "text-3xl font-bold mb-2",
            darkMode ? "text-white" : "text-gray-900"
          )}>
            Create Account
          </h1>
          <p className={clsx(
            "text-sm",
            darkMode ? "text-gray-400" : "text-gray-600"
          )}>
            Join Fibero AI and start comparing models
          </p>
        </div>

        {/* General Error Message */}
        {errors.general && (
          <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
            {errors.general}
          </div>
        )}

        {/* Signup Form */}
        <form onSubmit={handleSignup} className="space-y-4">
          {/* Name Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={clsx(
                "block text-sm font-medium mb-2",
                darkMode ? "text-gray-300" : "text-gray-700"
              )}>
                First Name
              </label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                className={clsx(
                  "w-full px-4 py-3 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-4",
                  errors.firstName 
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500/30"
                    : darkMode 
                      ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500/30" 
                      : "bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500/30"
                )}
                placeholder="John"
              />
              {errors.firstName && <p className="mt-1 text-xs text-red-500">{errors.firstName}</p>}
            </div>
            <div>
              <label className={clsx(
                "block text-sm font-medium mb-2",
                darkMode ? "text-gray-300" : "text-gray-700"
              )}>
                Last Name
              </label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                className={clsx(
                  "w-full px-4 py-3 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-4",
                  errors.lastName 
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500/30"
                    : darkMode 
                      ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500/30" 
                      : "bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500/30"
                )}
                placeholder="Doe"
              />
              {errors.lastName && <p className="mt-1 text-xs text-red-500">{errors.lastName}</p>}
            </div>
          </div>

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
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className={clsx(
                "w-full px-4 py-3 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-4",
                errors.email 
                  ? "border-red-500 focus:border-red-500 focus:ring-red-500/30"
                  : darkMode 
                    ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500/30" 
                    : "bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500/30"
              )}
              placeholder="john@example.com"
            />
            {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
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
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className={clsx(
                  "w-full px-4 py-3 pr-12 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-4",
                  errors.password 
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500/30"
                    : darkMode 
                      ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500/30" 
                      : "bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500/30"
                )}
                placeholder="Create a strong password"
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
            {formData.password && (
              <div className="mt-2">
                <div className="flex items-center gap-1 mb-1">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className={clsx(
                        "h-1 flex-1 rounded-full transition-all duration-200",
                        i < passwordStrength ? strengthColors[passwordStrength - 1] : darkMode ? "bg-gray-600" : "bg-gray-200"
                      )}
                    />
                  ))}
                </div>
                <p className={clsx(
                  "text-xs",
                  passwordStrength >= 4 ? "text-green-500" : passwordStrength >= 2 ? "text-yellow-500" : "text-red-500"
                )}>
                  Password strength: {strengthLabels[passwordStrength - 1] || 'Very Weak'}
                </p>
              </div>
            )}
            {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
          </div>

          {/* Confirm Password Field */}
          <div>
            <label className={clsx(
              "block text-sm font-medium mb-2",
              darkMode ? "text-gray-300" : "text-gray-700"
            )}>
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                className={clsx(
                  "w-full px-4 py-3 pr-12 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-4",
                  errors.confirmPassword 
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500/30"
                    : darkMode 
                      ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500/30" 
                      : "bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500/30"
                )}
                placeholder="Confirm your password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className={clsx(
                  "absolute right-3 top-1/2 transform -translate-y-1/2 text-sm hover:opacity-80",
                  darkMode ? "text-gray-400" : "text-gray-500"
                )}
              >
                {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
              </button>
            </div>
            {errors.confirmPassword && <p className="mt-1 text-xs text-red-500">{errors.confirmPassword}</p>}
          </div>

          {/* Terms and Conditions */}
          <div>
            <label className="flex items-start">
              <input
                type="checkbox"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-1"
              />
              <span className={clsx(
                "ml-2 text-sm",
                darkMode ? "text-gray-300" : "text-gray-700"
              )}>
                I agree to the{' '}
                <button type="button" className="text-blue-500 hover:text-blue-600 underline">
                  Terms of Service
                </button>
                {' '}and{' '}
                <button type="button" className="text-blue-500 hover:text-blue-600 underline">
                  Privacy Policy
                </button>
              </span>
            </label>
            {errors.terms && <p className="mt-1 text-xs text-red-500">{errors.terms}</p>}
          </div>

          {/* Signup Button */}
          <button
            type="submit"
            disabled={isLoading}
            className={clsx(
              "w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-4 transform hover:scale-105",
              isLoading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 focus:ring-orange-500/30 text-white shadow-lg"
            )}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Creating account...
              </div>
            ) : (
              "Create Account"
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
            or sign up with
          </span>
          <div className={clsx(
            "flex-1 h-px",
            darkMode ? "bg-gray-600" : "bg-gray-300"
          )}></div>
        </div>

        {/* Social Signup */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handleGoogleSignup}
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
            onClick={() => alert('GitHub signup coming soon!')}
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

        {/* Login Link */}
        <div className="mt-6 text-center">
          <span className={clsx(
            "text-sm",
            darkMode ? "text-gray-400" : "text-gray-600"
          )}>
            Already have an account?{' '}
          </span>
          <button
            onClick={onNavigateToLogin}
            className="text-sm text-blue-500 hover:text-blue-600 transition-colors font-medium"
          >
            Sign in here
          </button>
        </div>
      </div>
    </div>
  );
}
