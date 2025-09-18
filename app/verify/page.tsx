'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { clsx } from 'clsx';

export default function EmailVerificationSuccess() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(5);
  const [darkMode, setDarkMode] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);

  useEffect(() => {
    // Check for dark mode preference
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(savedDarkMode);
    if (savedDarkMode) {
      document.documentElement.classList.add('dark');
    }
    
    // Trigger animation after component mounts
    setTimeout(() => setShowAnimation(true), 300);
  }, []);

  useEffect(() => {
    // Countdown timer
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      // Redirect to main app
      window.location.href = '/';
    }
  }, [countdown, router]);

  const handleRedirectNow = () => {
    window.location.href = '/';
  };

  return (
    <div className={clsx(
      "min-h-screen flex items-center justify-center p-4 relative overflow-hidden",
      darkMode 
        ? "bg-gradient-to-br from-slate-900 via-purple-900 to-slate-800" 
        : "bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-100"
    )}>
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Floating orbs */}
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className={clsx(
              "absolute rounded-full opacity-20 animate-float",
              darkMode ? "bg-emerald-400" : "bg-emerald-300"
            )}
            style={{
              width: `${60 + (i * 20)}px`,
              height: `${60 + (i * 20)}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${4 + (i * 0.5)}s`
            }}
          />
        ))}
        
        {/* Sparkle effects */}
        {[...Array(20)].map((_, i) => (
          <div
            key={`sparkle-${i}`}
            className="absolute w-1 h-1 bg-emerald-400 rounded-full animate-twinkle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: '2s'
            }}
          />
        ))}
      </div>

      <div className={clsx(
        "w-full max-w-2xl backdrop-blur-xl rounded-3xl shadow-2xl border p-16 text-center relative z-10 transform transition-all duration-1000",
        showAnimation ? "scale-100 opacity-100" : "scale-95 opacity-0",
        darkMode 
          ? "bg-slate-800/80 border-emerald-500/20 shadow-emerald-500/10" 
          : "bg-white/90 border-emerald-200/50 shadow-emerald-500/20"
      )}>
        {/* Verified Star Badge */}
        <div className="relative mb-12">
          {/* Outer glow ring */}
          <div className={clsx(
            "w-40 h-40 rounded-full mx-auto mb-6 relative",
            "bg-gradient-to-r from-emerald-400 via-green-500 to-teal-500",
            "animate-spin-slow shadow-2xl shadow-emerald-500/50"
          )}>
            {/* Inner star container */}
            <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center shadow-inner">
              {/* Animated Star */}
              <div className={clsx(
                "relative transform transition-all duration-1000",
                showAnimation ? "scale-100 rotate-0" : "scale-0 rotate-180"
              )}>
                {/* Main star */}
                <svg 
                  width="80" 
                  height="80" 
                  viewBox="0 0 24 24" 
                  className="text-emerald-500 drop-shadow-lg"
                >
                  <path 
                    fill="currentColor" 
                    d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                  />
                </svg>
                
                {/* Checkmark overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg 
                    width="32" 
                    height="32" 
                    viewBox="0 0 24 24" 
                    className={clsx(
                      "text-white transform transition-all duration-500 delay-500",
                      showAnimation ? "scale-100 opacity-100" : "scale-0 opacity-0"
                    )}
                  >
                    <path 
                      fill="currentColor" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                      d="M20 6L9 17l-5-5"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
          
          {/* Radiating success particles */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className={clsx(
                  "absolute w-3 h-3 rounded-full animate-ping",
                  "bg-gradient-to-r from-emerald-400 to-green-500"
                )}
                style={{
                  left: `${Math.cos((i * 30) * Math.PI / 180) * 100}px`,
                  top: `${Math.sin((i * 30) * Math.PI / 180) * 100}px`,
                  transform: 'translate(-50%, -50%)',
                  animationDelay: `${i * 0.1}s`,
                  animationDuration: '2s'
                }}
              />
            ))}
          </div>
        </div>

        {/* Header */}
        <div className="mb-12">
          <h1 className={clsx(
            "text-5xl font-bold mb-6 bg-gradient-to-r from-emerald-400 via-green-500 to-teal-600 bg-clip-text text-transparent",
            "animate-pulse"
          )}>
            ✨ Verification Complete! ✨
          </h1>
          <div className={clsx(
            "text-2xl font-semibold mb-4",
            darkMode ? "text-white" : "text-slate-800"
          )}>
            Welcome to Fibero AI
          </div>
          <p className={clsx(
            "text-lg leading-relaxed",
            darkMode ? "text-slate-300" : "text-slate-600"
          )}>
            Your account is now <span className="font-bold text-emerald-500">fully verified</span> and ready for action!
          </p>
        </div>

        {/* Premium Features Grid */}
        <div className="grid grid-cols-2 gap-6 mb-12">
          {[
            { 
              icon: '🤖', 
              title: 'AI Models', 
              desc: 'Compare 5+ models',
              gradient: 'from-blue-500 to-cyan-500'
            },
            { 
              icon: '⚡', 
              title: 'Real-time', 
              desc: 'Instant responses',
              gradient: 'from-yellow-500 to-orange-500'
            },
            { 
              icon: '📊', 
              title: 'Analytics', 
              desc: 'Performance metrics',
              gradient: 'from-purple-500 to-pink-500'
            },
            { 
              icon: '💾', 
              title: 'History', 
              desc: 'Save conversations',
              gradient: 'from-green-500 to-emerald-500'
            }
          ].map((feature, index) => (
            <div 
              key={index} 
              className={clsx(
                "p-6 rounded-2xl border backdrop-blur-sm transform transition-all duration-300 hover:scale-105",
                darkMode 
                  ? "bg-slate-700/50 border-slate-600/50 hover:bg-slate-700/70" 
                  : "bg-white/60 border-white/40 hover:bg-white/80"
              )}
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${feature.gradient} flex items-center justify-center mb-3 shadow-lg`}>
                <span className="text-2xl">{feature.icon}</span>
              </div>
              <h3 className={clsx(
                "font-bold text-lg mb-1",
                darkMode ? "text-white" : "text-slate-800"
              )}>
                {feature.title}
              </h3>
              <p className={clsx(
                "text-sm",
                darkMode ? "text-slate-300" : "text-slate-600"
              )}>
                {feature.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Countdown Section */}
        <div className={clsx(
          "p-8 rounded-2xl mb-8 border-2 relative overflow-hidden",
          darkMode 
            ? "bg-gradient-to-r from-emerald-900/30 to-teal-900/30 border-emerald-500/30" 
            : "bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200"
        )}>
          <div className="relative z-10">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-emerald-400 to-green-500 flex items-center justify-center animate-pulse">
                <span className="text-white font-bold">{countdown}</span>
              </div>
              <p className={clsx(
                "text-lg font-semibold",
                darkMode ? "text-emerald-300" : "text-emerald-700"
              )}>
                Launching Fibero AI in {countdown} seconds...
              </p>
            </div>
            
            {/* Progress Ring */}
            <div className="relative w-24 h-24 mx-auto mb-4">
              <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  className={darkMode ? "text-slate-700" : "text-emerald-200"}
                />
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  stroke="url(#gradient)"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={`${2 * Math.PI * 45}`}
                  strokeDashoffset={`${2 * Math.PI * 45 * (countdown / 5)}`}
                  className="transition-all duration-1000 ease-linear"
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#06b6d4" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <button
            onClick={handleRedirectNow}
            className="w-full py-5 px-8 rounded-2xl font-bold text-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 text-white shadow-2xl hover:shadow-emerald-500/25 relative overflow-hidden group"
          >
            <span className="relative z-10 flex items-center justify-center gap-3">
              🚀 Launch Fibero AI Now
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </button>
          
          <button
            onClick={() => window.close()}
            className={clsx(
              "w-full py-4 px-6 rounded-xl font-medium transition-all duration-200 hover:scale-105 border",
              darkMode 
                ? "bg-slate-700/50 hover:bg-slate-600/50 text-slate-200 border-slate-600" 
                : "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300"
            )}
          >
            Close This Tab
          </button>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-emerald-200/20">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white text-lg font-bold">F</span>
            </div>
            <span className={clsx(
              "text-2xl font-bold bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent"
            )}>
              Fibero AI
            </span>
          </div>
          <p className={clsx(
            "text-sm",
            darkMode ? "text-slate-400" : "text-slate-500"
          )}>
            The future of AI comparison is here
          </p>
        </div>
      </div>
    </div>
  );
}
