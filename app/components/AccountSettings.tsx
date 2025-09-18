'use client';

import { useState, useEffect } from 'react';
import { clsx } from 'clsx';
import Image from 'next/image';
import { useAuth } from '../../contexts/AuthContext';

interface AccountSettingsProps {
  darkMode: boolean;
  onBack: () => void;
}

export default function AccountSettings({ darkMode, onBack }: AccountSettingsProps) {
  const { user, logout, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateMessage, setUpdateMessage] = useState('');
  
  // 2FA states
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [showTwoFactorSetup, setShowTwoFactorSetup] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const [manualEntryKey, setManualEntryKey] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isSettingUp2FA, setIsSettingUp2FA] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [twoFactorMessage, setTwoFactorMessage] = useState('');

  const handleUpdateProfile = async () => {
    if (!updateProfile) return;
    
    setIsUpdating(true);
    setUpdateMessage('');
    
    try {
      await updateProfile({ displayName });
      setUpdateMessage('Profile updated successfully!');
    } catch (error) {
      console.error('Failed to update profile:', error);
      setUpdateMessage('Failed to update profile. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  // Check 2FA status on component mount
  useEffect(() => {
    const check2FAStatus = async () => {
      if (user?.uid) {
        try {
          const response = await fetch('/api/2fa/status', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: user.uid })
          });
          const data = await response.json();
          if (data.success) {
            setTwoFactorEnabled(data.twoFactorEnabled || false);
          }
        } catch (error) {
          console.error('Failed to check 2FA status:', error);
        }
      }
    };
    check2FAStatus();
  }, [user]);

  const handleLogout = async () => {
    try {
      await logout();
      onBack();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleSetup2FA = async () => {
    if (!user?.uid || !user?.email) return;
    
    setIsSettingUp2FA(true);
    setTwoFactorMessage('');
    
    try {
      const response = await fetch('/api/2fa/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.uid,
          userEmail: user.email
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setQrCode(data.qrCode);
        setManualEntryKey(data.manualEntryKey);
        setShowTwoFactorSetup(true);
      } else {
        setTwoFactorMessage(data.error || 'Failed to setup 2FA');
      }
    } catch (error) {
      console.error('Failed to setup 2FA:', error);
      setTwoFactorMessage('Failed to setup 2FA. Please try again.');
    } finally {
      setIsSettingUp2FA(false);
    }
  };

  const handleVerify2FA = async () => {
    if (!user?.uid || !verificationCode) return;
    
    setIsVerifying(true);
    setTwoFactorMessage('');
    
    try {
      const response = await fetch('/api/2fa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.uid,
          token: verificationCode,
          enableTwoFactor: true
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setTwoFactorEnabled(true);
        setShowTwoFactorSetup(false);
        setVerificationCode('');
        setTwoFactorMessage('2FA enabled successfully!');
      } else {
        setTwoFactorMessage(data.error || 'Invalid verification code');
      }
    } catch (error) {
      console.error('Failed to verify code:', error);
      setTwoFactorMessage('Failed to verify code. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleDisable2FA = async () => {
    if (!user?.uid || !verificationCode) return;
    
    setIsVerifying(true);
    setTwoFactorMessage('');
    
    try {
      const response = await fetch('/api/2fa/disable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.uid,
          token: verificationCode
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setTwoFactorEnabled(false);
        setVerificationCode('');
        setTwoFactorMessage('2FA disabled successfully!');
      } else {
        setTwoFactorMessage(data.error || 'Invalid verification code');
      }
    } catch (error) {
      console.error('Failed to disable 2FA:', error);
      setTwoFactorMessage('Failed to disable 2FA. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className={clsx(
      "min-h-screen transition-all duration-500 ease-in-out",
      darkMode 
        ? "bg-gradient-to-br from-gray-900 via-black to-gray-800" 
        : "bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100"
    )}>
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={onBack}
            className={clsx(
              "w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-105",
              darkMode 
                ? "bg-gray-800 hover:bg-gray-700 text-gray-300" 
                : "bg-white hover:bg-gray-50 text-gray-600"
            )}
          >
            <span className="text-xl">←</span>
          </button>
          <div>
            <h1 className={clsx(
              "text-3xl font-bold",
              darkMode ? "text-white" : "text-gray-900"
            )}>
              Account Settings
            </h1>
            <p className={clsx(
              "text-sm mt-1",
              darkMode ? "text-gray-400" : "text-gray-600"
            )}>
              Manage your account preferences and settings
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className={clsx(
          "backdrop-blur-sm rounded-2xl shadow-xl border overflow-hidden",
          darkMode 
            ? "bg-gray-800/80 border-gray-700/30" 
            : "bg-white/80 border-white/20"
        )}>
          {/* Tab Navigation */}
          <div className={clsx(
            "flex border-b",
            darkMode ? "border-gray-700" : "border-gray-200"
          )}>
            {[
              { id: 'profile', label: 'Profile', icon: '👤' },
              { id: 'preferences', label: 'Preferences', icon: '⚙️' },
              { id: 'security', label: 'Security', icon: '🔒' },
              { id: 'account', label: 'Account', icon: '🏠' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={clsx(
                  "flex items-center gap-2 px-6 py-4 font-medium transition-all duration-200",
                  activeTab === tab.id
                    ? darkMode
                      ? "bg-gray-700 text-white border-b-2 border-blue-500"
                      : "bg-gray-50 text-gray-900 border-b-2 border-blue-500"
                    : darkMode
                      ? "text-gray-400 hover:text-white hover:bg-gray-700/50"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                )}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-8">
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-2xl text-white">
                      {user?.displayName?.charAt(0) || user?.email?.charAt(0) || '👤'}
                    </span>
                  </div>
                  <div>
                    <h3 className={clsx(
                      "text-xl font-semibold",
                      darkMode ? "text-white" : "text-gray-900"
                    )}>
                      {user?.displayName || 'User'}
                    </h3>
                    <p className={clsx(
                      "text-sm",
                      darkMode ? "text-gray-400" : "text-gray-600"
                    )}>
                      {user?.email}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className={clsx(
                      "block text-sm font-medium mb-2",
                      darkMode ? "text-gray-300" : "text-gray-700"
                    )}>
                      Display Name
                    </label>
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className={clsx(
                        "w-full p-3 rounded-xl border transition-all duration-200",
                        darkMode 
                          ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500" 
                          : "bg-white border-gray-200 text-gray-900 placeholder-gray-500 focus:border-blue-500"
                      )}
                      placeholder="Enter your display name"
                    />
                  </div>
                </div>

                {updateMessage && (
                  <div className={clsx(
                    "p-4 rounded-xl",
                    updateMessage.includes('success')
                      ? "bg-green-100 text-green-700 border border-green-200"
                      : "bg-red-100 text-red-700 border border-red-200"
                  )}>
                    {updateMessage}
                  </div>
                )}

                <button
                  onClick={handleUpdateProfile}
                  disabled={isUpdating}
                  className={clsx(
                    "px-6 py-3 rounded-xl font-medium transition-all duration-200",
                    isUpdating
                      ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                      : "bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 shadow-lg hover:shadow-xl"
                  )}
                >
                  {isUpdating ? 'Updating...' : 'Update Profile'}
                </button>
              </div>
            )}

            {activeTab === 'preferences' && (
              <div className="space-y-6">
                <h3 className={clsx(
                  "text-lg font-semibold",
                  darkMode ? "text-white" : "text-gray-900"
                )}>
                  App Preferences
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className={clsx(
                        "font-medium",
                        darkMode ? "text-white" : "text-gray-900"
                      )}>
                        Email Notifications
                      </h4>
                      <p className={clsx(
                        "text-sm",
                        darkMode ? "text-gray-400" : "text-gray-600"
                      )}>
                        Receive updates about new features and improvements
                      </p>
                    </div>
                    <button className="w-12 h-6 bg-blue-500 rounded-full relative">
                      <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 right-0.5"></div>
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className={clsx(
                        "font-medium",
                        darkMode ? "text-white" : "text-gray-900"
                      )}>
                        Save Conversation History
                      </h4>
                      <p className={clsx(
                        "text-sm",
                        darkMode ? "text-gray-400" : "text-gray-600"
                      )}>
                        Automatically save your AI conversations
                      </p>
                    </div>
                    <button className="w-12 h-6 bg-blue-500 rounded-full relative">
                      <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 right-0.5"></div>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-6">
                <h3 className={clsx(
                  "text-lg font-semibold",
                  darkMode ? "text-white" : "text-gray-900"
                )}>
                  Security Settings
                </h3>
                
                {twoFactorMessage && (
                  <div className={clsx(
                    "p-4 rounded-xl",
                    twoFactorMessage.includes('success')
                      ? "bg-green-100 text-green-700 border border-green-200"
                      : "bg-red-100 text-red-700 border border-red-200"
                  )}>
                    {twoFactorMessage}
                  </div>
                )}

                <div className="space-y-4">
                  <button className={clsx(
                    "w-full p-4 rounded-xl border text-left transition-all duration-200 hover:shadow-md",
                    darkMode 
                      ? "bg-gray-700 border-gray-600 hover:bg-gray-600" 
                      : "bg-white border-gray-200 hover:bg-gray-50"
                  )}>
                    <h4 className={clsx(
                      "font-medium",
                      darkMode ? "text-white" : "text-gray-900"
                    )}>
                      Change Password
                    </h4>
                    <p className={clsx(
                      "text-sm mt-1",
                      darkMode ? "text-gray-400" : "text-gray-600"
                    )}>
                      Update your account password
                    </p>
                  </button>

                  {/* Two-Factor Authentication Section */}
                  <div className={clsx(
                    "p-4 rounded-xl border",
                    darkMode 
                      ? "bg-gray-700 border-gray-600" 
                      : "bg-white border-gray-200"
                  )}>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className={clsx(
                          "font-medium",
                          darkMode ? "text-white" : "text-gray-900"
                        )}>
                          Two-Factor Authentication
                        </h4>
                        <p className={clsx(
                          "text-sm mt-1",
                          darkMode ? "text-gray-400" : "text-gray-600"
                        )}>
                          Don&apos;t worry, we&apos;ll keep your data safe and secure. Add an extra layer of security to your account
                        </p>
                      </div>
                      <div className={clsx(
                        "px-3 py-1 rounded-full text-xs font-medium",
                        twoFactorEnabled
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-600"
                      )}>
                        {twoFactorEnabled ? 'Enabled' : 'Disabled'}
                      </div>
                    </div>

                    {!twoFactorEnabled ? (
                      <button
                        onClick={handleSetup2FA}
                        disabled={isSettingUp2FA}
                        className={clsx(
                          "w-full py-3 px-4 rounded-lg font-medium transition-all duration-200",
                          isSettingUp2FA
                            ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                            : "bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700"
                        )}
                      >
                        {isSettingUp2FA ? 'Setting up...' : 'Enable 2FA'}
                      </button>
                    ) : (
                      <div className="space-y-3">
                        <input
                          type="text"
                          value={verificationCode}
                          onChange={(e) => setVerificationCode(e.target.value)}
                          placeholder="Enter verification code to disable"
                          className={clsx(
                            "w-full p-3 rounded-lg border",
                            darkMode 
                              ? "bg-gray-600 border-gray-500 text-white placeholder-gray-400" 
                              : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                          )}
                        />
                        <button
                          onClick={handleDisable2FA}
                          disabled={isVerifying || !verificationCode}
                          className={clsx(
                            "w-full py-3 px-4 rounded-lg font-medium transition-all duration-200",
                            isVerifying || !verificationCode
                              ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                              : "bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700"
                          )}
                        >
                          {isVerifying ? 'Disabling...' : 'Disable 2FA'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'account' && (
              <div className="space-y-6">
                <h3 className={clsx(
                  "text-lg font-semibold",
                  darkMode ? "text-white" : "text-gray-900"
                )}>
                  Account Management
                </h3>
                <div className="space-y-4">
                  <div className={clsx(
                    "p-4 rounded-xl border",
                    darkMode ? "bg-gray-700 border-gray-600" : "bg-white border-gray-200"
                  )}>
                    <h4 className={clsx(
                      "font-medium mb-2",
                      darkMode ? "text-white" : "text-gray-900"
                    )}>
                      Account Status
                    </h4>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className={clsx(
                        "text-sm",
                        darkMode ? "text-gray-300" : "text-gray-600"
                      )}>
                        Active
                      </span>
                    </div>
                  </div>
                  
                  <button
                    onClick={handleLogout}
                    className="w-full p-4 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white font-medium transition-all duration-200 hover:from-red-600 hover:to-red-700 shadow-lg hover:shadow-xl"
                  >
                    Sign Out
                  </button>
                  
                  <button className={clsx(
                    "w-full p-4 rounded-xl border text-red-600 border-red-200 bg-red-50 font-medium transition-all duration-200 hover:bg-red-100",
                    darkMode && "bg-red-900/20 border-red-800 text-red-400 hover:bg-red-900/30"
                  )}>
                    Delete Account
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 2FA Setup Modal */}
        {showTwoFactorSetup && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className={clsx(
              "w-full max-w-md rounded-2xl shadow-2xl overflow-hidden",
              darkMode ? "bg-gray-800" : "bg-white"
            )}>
              <div className={clsx(
                "flex items-center justify-between p-6 border-b",
                darkMode ? "border-gray-700" : "border-gray-200"
              )}>
                <h2 className={clsx(
                  "text-xl font-bold",
                  darkMode ? "text-white" : "text-gray-900"
                )}>
                  Setup Two-Factor Authentication
                </h2>
                <button
                  onClick={() => setShowTwoFactorSetup(false)}
                  className={clsx(
                    "w-8 h-8 rounded-full flex items-center justify-center transition-colors",
                    darkMode ? "hover:bg-gray-700 text-gray-400" : "hover:bg-gray-100 text-gray-600"
                  )}
                >
                  ✕
                </button>
              </div>
              
              <div className="p-6 space-y-6">
                <div className="text-center">
                  <h3 className={clsx(
                    "font-semibold mb-2",
                    darkMode ? "text-white" : "text-gray-900"
                  )}>
                    Step 1: Scan QR Code
                  </h3>
                  <p className={clsx(
                    "text-sm mb-4",
                    darkMode ? "text-gray-400" : "text-gray-600"
                  )}>
                    Use your authenticator app (Google Authenticator, Authy, etc.) to scan this QR code:
                  </p>
                  {qrCode && (
                    <div className="flex justify-center mb-4">
                      <Image 
                        src={qrCode} 
                        alt="2FA QR Code" 
                        width={192}
                        height={192}
                        className="border rounded-lg"
                      />
                    </div>
                  )}
                </div>

                <div>
                  <h3 className={clsx(
                    "font-semibold mb-2",
                    darkMode ? "text-white" : "text-gray-900"
                  )}>
                    Step 2: Manual Entry (Alternative)
                  </h3>
                  <p className={clsx(
                    "text-sm mb-2",
                    darkMode ? "text-gray-400" : "text-gray-600"
                  )}>
                    If you can&apos;t scan the QR code, enter this key manually:
                  </p>
                  <div className={clsx(
                    "p-3 rounded-lg border font-mono text-sm break-all",
                    darkMode 
                      ? "bg-gray-700 border-gray-600 text-gray-300" 
                      : "bg-gray-50 border-gray-200 text-gray-700"
                  )}>
                    {manualEntryKey}
                  </div>
                </div>

                <div>
                  <h3 className={clsx(
                    "font-semibold mb-2",
                    darkMode ? "text-white" : "text-gray-900"
                  )}>
                    Step 3: Verify Setup
                  </h3>
                  <p className={clsx(
                    "text-sm mb-3",
                    darkMode ? "text-gray-400" : "text-gray-600"
                  )}>
                    Enter the 6-digit code from your authenticator app:
                  </p>
                  <input
                    type="text"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    placeholder="000000"
                    maxLength={6}
                    className={clsx(
                      "w-full p-3 rounded-lg border text-center font-mono text-lg tracking-wider",
                      darkMode 
                        ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400" 
                        : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                    )}
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowTwoFactorSetup(false)}
                    className={clsx(
                      "flex-1 py-3 px-4 rounded-lg font-medium transition-colors",
                      darkMode 
                        ? "bg-gray-700 text-gray-300 hover:bg-gray-600" 
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    )}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleVerify2FA}
                    disabled={isVerifying || verificationCode.length !== 6}
                    className={clsx(
                      "flex-1 py-3 px-4 rounded-lg font-medium transition-colors",
                      isVerifying || verificationCode.length !== 6
                        ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                        : "bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700"
                    )}
                  >
                    {isVerifying ? 'Verifying...' : 'Enable 2FA'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
