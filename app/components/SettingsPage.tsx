'use client';

import { useState, useEffect } from 'react';
import { clsx } from 'clsx';
import Modal from './Modal';
import Toast, { useToast } from './Toast';

interface SettingsPageProps {
  darkMode: boolean;
  onBack: () => void;
  onToggleDarkMode: () => void;
  onSettingsSaved?: () => void;
  onClearHistory?: () => void;
}

export default function SettingsPage({ darkMode, onBack, onToggleDarkMode, onSettingsSaved, onClearHistory }: SettingsPageProps) {
  const [settings, setSettings] = useState({
    notifications: true,
    autoSave: true,
    streamingResponses: false,
    maxHistoryItems: 50,
    defaultModels: ['gpt-4o', 'claude-3.5-sonnet'],
    language: 'en',
    exportFormat: 'json'
  });

  const [apiKeys, setApiKeys] = useState({
    openrouter: '',
    openai: '',
    anthropic: ''
  });

  const [showApiKeys, setShowApiKeys] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const { toast, showToast, hideToast } = useToast();
  
  // Modal states
  const [modal, setModal] = useState<{
    isOpen: boolean;
    type: 'success' | 'error' | 'warning' | 'info' | 'confirm';
    title: string;
    message: string;
    onConfirm?: () => void;
    toastMessage?: string;
  }>({
    isOpen: false,
    type: 'info',
    title: '',
    message: ''
  });

  // Load settings from localStorage on component mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('fibroAiSettings');
    const savedApiKeys = localStorage.getItem('fibroAiApiKeys');
    
    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings);
        setSettings(parsedSettings);
      } catch (error) {
        console.error('Error parsing saved settings:', error);
      }
    }
    
    if (savedApiKeys) {
      try {
        const parsedApiKeys = JSON.parse(savedApiKeys);
        setApiKeys(parsedApiKeys);
      } catch (error) {
        console.error('Error parsing saved API keys:', error);
      }
    }
  }, []);

  const handleSettingChange = (key: string, value: string | boolean | number | string[]) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    
    // Don't auto-save defaultModels - only save when user clicks Save Changes
  };

  const handleApiKeyChange = (provider: string, value: string) => {
    setApiKeys(prev => ({ ...prev, [provider]: value }));
  };

  const saveSettings = () => {
    localStorage.setItem('fibroAiSettings', JSON.stringify(settings));
    localStorage.setItem('fibroAiApiKeys', JSON.stringify(apiKeys));
    
    setModal({
      isOpen: true,
      type: 'success',
      title: 'Settings Saved',
      message: 'Your settings have been saved successfully!',
      toastMessage: 'Settings saved successfully!'
    });
    
    // Notify parent component that settings were saved
    if (onSettingsSaved) {
      onSettingsSaved();
    }
  };

  const resetSettings = () => {
    setModal({
      isOpen: true,
      type: 'confirm',
      title: 'Reset Settings',
      message: 'Are you sure you want to reset these settings to default?',
      onConfirm: () => {
        const defaultSettings = {
          notifications: true,
          autoSave: true,
          streamingResponses: false,
          maxHistoryItems: 50,
          defaultModels: ['gpt-4o', 'claude-3.5-sonnet'],
          language: 'en',
          exportFormat: 'json'
        };
        const defaultApiKeys = { openrouter: '', openai: '', anthropic: '' };
        
        setSettings(defaultSettings);
        setApiKeys(defaultApiKeys);
        
        // Automatically save the reset settings
        localStorage.setItem('fibroAiSettings', JSON.stringify(defaultSettings));
        localStorage.setItem('fibroAiApiKeys', JSON.stringify(defaultApiKeys));
        
        // Close modal and show toast
        setModal(prev => ({ ...prev, isOpen: false }));
        setTimeout(() => {
          showToast('Settings reset to default!');
        }, 100);
        
        // Notify parent component that settings were saved
        if (onSettingsSaved) {
          onSettingsSaved();
        }
      }
    });
  };

  const tabs = [
    { id: 'general', name: 'General', icon: '⚙️' },
    { id: 'models', name: 'Models', icon: '🤖' },
    { id: 'api', name: 'API Keys', icon: '🔑' },
    { id: 'privacy', name: 'Privacy', icon: '🔒' }
  ];

  return (
    <div className={clsx(
      "min-h-screen transition-all duration-500",
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

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-4xl mb-4">⚙️</div>
          <h1 className={clsx(
            "text-3xl font-bold mb-2",
            darkMode ? "text-white" : "text-gray-900"
          )}>
            Settings
          </h1>
          <p className={clsx(
            "text-sm",
            darkMode ? "text-gray-400" : "text-gray-600"
          )}>
            Customize your Fibero AI experience
          </p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-8">
          <div className={clsx(
            "flex rounded-lg p-1 backdrop-blur-sm border",
            darkMode 
              ? "bg-gray-800/90 border-gray-700/50" 
              : "bg-white/90 border-white/20"
          )}>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={clsx(
                  "px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center gap-2",
                  activeTab === tab.id
                    ? darkMode
                      ? "bg-purple-600 text-white shadow-lg"
                      : "bg-purple-500 text-white shadow-lg"
                    : darkMode
                      ? "text-gray-300 hover:text-white hover:bg-gray-700"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                )}
              >
                <span>{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </div>
        </div>

        {/* Settings Content */}
        <div className={clsx(
          "rounded-2xl backdrop-blur-sm border shadow-2xl p-6",
          darkMode 
            ? "bg-gray-800/90 border-gray-700/50" 
            : "bg-white/90 border-white/20"
        )}>
          {/* General Tab */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              <h2 className={clsx(
                "text-xl font-semibold mb-4",
                darkMode ? "text-white" : "text-gray-900"
              )}>
                General Settings
              </h2>

              {/* Dark Mode Toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className={clsx(
                    "font-medium",
                    darkMode ? "text-white" : "text-gray-900"
                  )}>
                    Dark Mode
                  </h3>
                  <p className={clsx(
                    "text-sm",
                    darkMode ? "text-gray-400" : "text-gray-600"
                  )}>
                    Toggle between light and dark themes
                  </p>
                </div>
                <button
                  onClick={onToggleDarkMode}
                  className={clsx(
                    "relative w-12 h-6 rounded-full transition-colors duration-200 focus:outline-none focus:ring-4",
                    darkMode 
                      ? "bg-purple-600 focus:ring-purple-500/30" 
                      : "bg-gray-300 focus:ring-gray-500/30"
                  )}
                >
                  <div className={clsx(
                    "absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-200",
                    darkMode ? "translate-x-6" : "translate-x-0.5"
                  )}></div>
                </button>
              </div>

              {/* Notifications */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className={clsx(
                    "font-medium",
                    darkMode ? "text-white" : "text-gray-900"
                  )}>
                    Notifications
                  </h3>
                  <p className={clsx(
                    "text-sm",
                    darkMode ? "text-gray-400" : "text-gray-600"
                  )}>
                    Receive notifications for completed responses
                  </p>
                </div>
                <button
                  onClick={() => handleSettingChange('notifications', !settings.notifications)}
                  className={clsx(
                    "relative w-12 h-6 rounded-full transition-colors duration-200 focus:outline-none focus:ring-4",
                    settings.notifications 
                      ? "bg-green-600 focus:ring-green-500/30" 
                      : "bg-gray-300 focus:ring-gray-500/30"
                  )}
                >
                  <div className={clsx(
                    "absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-200",
                    settings.notifications ? "translate-x-6" : "translate-x-0.5"
                  )}></div>
                </button>
              </div>

              {/* Auto Save */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className={clsx(
                    "font-medium",
                    darkMode ? "text-white" : "text-gray-900"
                  )}>
                    Auto Save
                  </h3>
                  <p className={clsx(
                    "text-sm",
                    darkMode ? "text-gray-400" : "text-gray-600"
                  )}>
                    Automatically save conversation history
                  </p>
                </div>
                <button
                  onClick={() => handleSettingChange('autoSave', !settings.autoSave)}
                  className={clsx(
                    "relative w-12 h-6 rounded-full transition-colors duration-200 focus:outline-none focus:ring-4",
                    settings.autoSave 
                      ? "bg-blue-600 focus:ring-blue-500/30" 
                      : "bg-gray-300 focus:ring-gray-500/30"
                  )}
                >
                  <div className={clsx(
                    "absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-200",
                    settings.autoSave ? "translate-x-6" : "translate-x-0.5"
                  )}></div>
                </button>
              </div>

              {/* Max History Items */}
              <div>
                <h3 className={clsx(
                  "font-medium mb-2",
                  darkMode ? "text-white" : "text-gray-900"
                )}>
                  Max History Items: {settings.maxHistoryItems}
                </h3>
                <input
                  type="range"
                  min="10"
                  max="100"
                  step="10"
                  value={settings.maxHistoryItems}
                  onChange={(e) => handleSettingChange('maxHistoryItems', parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>
          )}

          {/* Models Tab */}
          {activeTab === 'models' && (
            <div className="space-y-6">
              <h2 className={clsx(
                "text-xl font-semibold mb-4",
                darkMode ? "text-white" : "text-gray-900"
              )}>
                Model Settings
              </h2>

              <div>
                <h3 className={clsx(
                  "font-medium mb-3",
                  darkMode ? "text-white" : "text-gray-900"
                )}>
                  Default Models
                </h3>
                <p className={clsx(
                  "text-sm mb-4",
                  darkMode ? "text-gray-400" : "text-gray-600"
                )}>
                  Select which models to use by default
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {['gpt-4o', 'claude-3.5-sonnet', 'gemini-2.0-flash', 'deepseek-v3', 'perplexity-sonar'].map((model) => (
                    <label key={model} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.defaultModels.includes(model)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            handleSettingChange('defaultModels', [...settings.defaultModels, model]);
                          } else {
                            handleSettingChange('defaultModels', settings.defaultModels.filter(m => m !== model));
                          }
                        }}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className={clsx(
                        "ml-2 text-sm capitalize",
                        darkMode ? "text-gray-300" : "text-gray-700"
                      )}>
                        {model.replace('-', ' ')}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* API Keys Tab */}
          {activeTab === 'api' && (
            <div className="space-y-6">
              <h2 className={clsx(
                "text-xl font-semibold mb-4",
                darkMode ? "text-white" : "text-gray-900"
              )}>
                API Configuration
              </h2>

              <div className="space-y-4">
                {Object.entries(apiKeys).map(([provider, key]) => (
                  <div key={provider}>
                    <label className={clsx(
                      "block text-sm font-medium mb-2 capitalize",
                      darkMode ? "text-gray-300" : "text-gray-700"
                    )}>
                      {provider} API Key
                    </label>
                    <div className="relative">
                      <input
                        type={showApiKeys ? "text" : "password"}
                        value={key}
                        onChange={(e) => handleApiKeyChange(provider, e.target.value)}
                        className={clsx(
                          "w-full px-4 py-3 pr-12 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-4",
                          darkMode 
                            ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500/30" 
                            : "bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500/30"
                        )}
                        placeholder={`Enter your ${provider} API key`}
                      />
                    </div>
                  </div>
                ))}
                
                <button
                  onClick={() => setShowApiKeys(!showApiKeys)}
                  className="text-sm text-blue-500 hover:text-blue-600 transition-colors"
                >
                  {showApiKeys ? "Hide" : "Show"} API Keys
                </button>
              </div>
            </div>
          )}

          {/* Privacy Tab */}
          {activeTab === 'privacy' && (
            <div className="space-y-6">
              <h2 className={clsx(
                "text-xl font-semibold mb-4",
                darkMode ? "text-white" : "text-gray-900"
              )}>
                Privacy & Data
              </h2>

              <div className="space-y-4">
                <button
                  onClick={() => {
                    setModal({
                      isOpen: true,
                      type: 'confirm',
                      title: 'Clear Conversation History',
                      message: 'This will permanently delete all your conversation history. This action cannot be undone.',
                      onConfirm: () => {
                        localStorage.removeItem('conversationHistory');
                        // Also clear the conversation history state in the parent component
                        if (onClearHistory) {
                          onClearHistory();
                        }
                        // Close modal and show toast
                        setModal(prev => ({ ...prev, isOpen: false }));
                        setTimeout(() => {
                          showToast('Conversation history cleared!');
                        }, 100);
                      }
                    });
                  }}
                  className="w-full py-3 px-4 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium transition-colors"
                >
                  Clear All Conversation History
                </button>

                <button
                  onClick={() => {
                    setModal({
                      isOpen: true,
                      type: 'confirm',
                      title: 'Clear All Data',
                      message: 'This will permanently delete all your local data including settings, API keys, and conversation history. This action cannot be undone.',
                      onConfirm: () => {
                        localStorage.clear();
                        // Close modal and show toast
                        setModal(prev => ({ ...prev, isOpen: false }));
                        setTimeout(() => {
                          showToast('All data cleared successfully!');
                        }, 100);
                      }
                    });
                  }}
                  className="w-full py-3 px-4 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-medium transition-colors"
                >
                  Clear All Local Data
                </button>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={saveSettings}
              className="flex-1 py-3 px-4 rounded-lg bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white font-medium transition-all duration-200 transform hover:scale-105"
            >
              Save Settings
            </button>
            <button
              onClick={resetSettings}
              className={clsx(
                "flex-1 py-3 px-4 rounded-lg border font-medium transition-all duration-200 transform hover:scale-105",
                darkMode 
                  ? "border-gray-600 text-gray-300 hover:bg-gray-700" 
                  : "border-gray-300 text-gray-700 hover:bg-gray-50"
              )}
            >
              Reset to Default
            </button>
          </div>
        </div>
      </div>

      {/* Modal */}
      <Modal
        isOpen={modal.isOpen}
        onClose={() => {
          const toastMessage = modal.toastMessage;
          setModal(prev => ({ ...prev, isOpen: false }));
          // Show toast after modal closes if there's a toast message
          if (toastMessage) {
            setTimeout(() => {
              showToast(toastMessage);
            }, 100); // Small delay to ensure modal is fully closed
          }
        }}
        title={modal.title}
        message={modal.message}
        type={modal.type}
        onConfirm={modal.onConfirm}
        darkMode={darkMode}
      />

      {/* Toast */}
      <Toast
        message={toast.message}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />
    </div>
  );
}
