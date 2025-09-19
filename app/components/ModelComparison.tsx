'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { clsx } from 'clsx';
import LoginPage from './LoginPage';
import SignupPage from './SignupPage';
import SettingsPage from './SettingsPage';
import AccountSettings from './AccountSettings';
import EmailVerification from './EmailVerification';
import CreditPurchase from './CreditPurchase';
import { AuthProvider, useAuth } from '../../contexts/AuthContext';

// Model configuration interface
interface ModelConfig {
  name: string;
  company: string;
  color: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
  icon: string;
  free?: boolean;
}

// Available AI models with enhanced styling
const AVAILABLE_MODELS: Record<string, ModelConfig> = {
  'gpt-4o': { 
    name: 'GPT-4o', 
    company: 'OpenAI',
    color: 'from-emerald-400 to-emerald-600',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    textColor: 'text-emerald-700',
    icon: '🤖'
  },
  'claude-3.5-sonnet': { 
    name: 'Claude 3.5 Sonnet', 
    company: 'Anthropic',
    color: 'from-orange-400 to-red-500',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    textColor: 'text-orange-700',
    icon: '🧠'
  },
  'gemini-2.0-flash': { 
    name: 'Gemini 2.0 Flash', 
    company: 'Google',
    color: 'from-blue-400 to-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    textColor: 'text-blue-700',
    icon: '✨'
  },
  'deepseek-v3': { 
    name: 'DeepSeek V3', 
    company: 'DeepSeek',
    color: 'from-purple-400 to-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    textColor: 'text-purple-700',
    icon: '🔮'
  },
  'perplexity-sonar': { 
    name: 'Perplexity Sonar', 
    company: 'Perplexity',
    color: 'from-teal-400 to-cyan-500',
    bgColor: 'bg-teal-50',
    borderColor: 'border-teal-200',
    textColor: 'text-teal-700',
    icon: '🎯'
  },
  // FREE MODELS - 2025 Latest
  'deepseek/deepseek-chat-v3.1:free': {
    name: 'DeepSeek V3.1',
    company: 'DeepSeek',
    color: 'from-purple-400 to-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    textColor: 'text-purple-700',
    icon: '🧠',
    free: true
  },
  'deepseek/deepseek-r1:free': {
    name: 'DeepSeek R1',
    company: 'DeepSeek',
    color: 'from-purple-500 to-purple-700',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    textColor: 'text-purple-700',
    icon: '🔬',
    free: true
  },
  'qwen/qwen-2.5-coder-32b-instruct:free': {
    name: 'Qwen 2.5 Coder 32B',
    company: 'Qwen',
    color: 'from-red-400 to-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    textColor: 'text-red-700',
    icon: '💻',
    free: true
  },
  'google/gemini-2.0-flash-exp:free': {
    name: 'Gemini 2.0 Flash Exp',
    company: 'Google',
    color: 'from-blue-400 to-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    textColor: 'text-blue-700',
    icon: '⚡',
    free: true
  },
  'meta-llama/llama-3.1-405b-instruct:free': {
    name: 'Llama 3.1 405B',
    company: 'Meta',
    color: 'from-indigo-400 to-indigo-600',
    bgColor: 'bg-indigo-50',
    borderColor: 'border-indigo-200',
    textColor: 'text-indigo-700',
    icon: '🦙',
    free: true
  },
  'meta-llama/llama-4-maverick:free': {
    name: 'Llama 4 Maverick',
    company: 'Meta',
    color: 'from-indigo-500 to-indigo-700',
    bgColor: 'bg-indigo-50',
    borderColor: 'border-indigo-200',
    textColor: 'text-indigo-700',
    icon: '🚀',
    free: true
  },
  'mistralai/mistral-small-3.2-24b-instruct:free': {
    name: 'Mistral Small 3.2',
    company: 'Mistral AI',
    color: 'from-amber-400 to-amber-600',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    textColor: 'text-amber-700',
    icon: '🌪️',
    free: true
  },
  'huggingface/meta-llama/llama-3.2-3b-instruct:free': {
    name: 'Llama 3.2 3B Instruct',
    company: 'Meta',
    color: 'from-emerald-500 to-emerald-700',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    textColor: 'text-emerald-700',
    icon: '🦙',
    free: true
  },
  'qwen/qwen-2.5-72b-instruct:free': {
    name: 'Qwen 2.5 72B',
    company: 'Qwen',
    color: 'from-red-500 to-red-700',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    textColor: 'text-red-700',
    icon: '🎯',
    free: true
  },
  'nvidia/nemotron-nano-9b-v2:free': {
    name: 'Nemotron Nano 9B V2',
    company: 'NVIDIA',
    color: 'from-green-400 to-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    textColor: 'text-green-700',
    icon: '⚡',
    free: true
  },
  'google/gemma-3-27b-it:free': {
    name: 'Gemma 3 27B',
    company: 'Google',
    color: 'from-blue-600 to-blue-800',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    textColor: 'text-blue-700',
    icon: '💎',
    free: true
  },
  'meta-llama/llama-3.3-70b-instruct:free': {
    name: 'Llama 3.3 70B',
    company: 'Meta',
    color: 'from-indigo-600 to-indigo-800',
    bgColor: 'bg-indigo-50',
    borderColor: 'border-indigo-200',
    textColor: 'text-indigo-700',
    icon: '🔥',
    free: true
  },
  'microsoft/mai-ds-r1:free': {
    name: 'MAI DS R1',
    company: 'Microsoft',
    color: 'from-cyan-400 to-cyan-600',
    bgColor: 'bg-cyan-50',
    borderColor: 'border-cyan-200',
    textColor: 'text-cyan-700',
    icon: '🧙',
    free: true
  }
};

interface ModelResponse {
  model: string;
  modelName: string;
  response: string | null;
  error: string | null;
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
  };
  responseTime?: number;
  wordCount?: number;
  rating?: number;
}

interface ComparisonResult {
  success: boolean;
  results: ModelResponse[];
}

interface ConversationEntry {
  id: string;
  message: string;
  responses: ModelResponse[];
  timestamp: Date;
  bestResponse?: string;
}

interface PromptTemplate {
  id: string;
  name: string;
  description: string;
  template: string;
  category: string;
}

function ModelComparisonContent() {
  const { user, credits, creditsLoading, refreshCredits } = useAuth();
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [message, setMessage] = useState('');
  const [responses, setResponses] = useState<ModelResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [bestResponse, setBestResponse] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<ConversationEntry[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [historySearch, setHistorySearch] = useState('');
  const [showComparison, setShowComparison] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showPromptBuilder, setShowPromptBuilder] = useState(false);
  const [promptVariables, setPromptVariables] = useState<{[key: string]: string}>({});
  const [hoveredTooltip, setHoveredTooltip] = useState<string | null>(null);
  const [activeNavItem, setActiveNavItem] = useState('home');
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');
  const [showInsufficientCreditsModal, setShowInsufficientCreditsModal] = useState(false);

  // Prompt templates
  const promptTemplates: PromptTemplate[] = [
    {
      id: '1',
      name: 'Code Review',
      description: 'Review and improve code quality',
      template: 'Please review the following code and suggest improvements for readability, performance, and best practices:\n\n[Your code here]',
      category: 'Development'
    },
    {
      id: '2',
      name: 'Creative Writing',
      description: 'Generate creative content',
      template: 'Write a creative story about [topic] in the style of [author/genre]. Make it engaging and approximately [length] words.',
      category: 'Creative'
    },
    {
      id: '3',
      name: 'Technical Explanation',
      description: 'Explain complex technical concepts',
      template: 'Explain [technical concept] in simple terms that a [target audience] would understand. Include practical examples.',
      category: 'Education'
    },
    {
      id: '4',
      name: 'Business Analysis',
      description: 'Analyze business scenarios',
      template: 'Analyze the following business scenario and provide recommendations: [scenario description]. Consider market trends, risks, and opportunities.',
      category: 'Business'
    },
    {
      id: '5',
      name: 'Problem Solving',
      description: 'Structured problem-solving approach',
      template: 'Help me solve this problem step by step: [problem description]. Break down the solution into clear, actionable steps.',
      category: 'General'
    }
  ];

  // Initialize dark mode from localStorage
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(savedDarkMode);
    if (savedDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // Load conversation history and settings from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('conversationHistory');
    if (savedHistory) {
      try {
        const parsedHistory = JSON.parse(savedHistory);
        // Convert timestamp strings back to Date objects
        const historyWithDates = parsedHistory.map((entry: ConversationEntry) => ({
          ...entry,
          timestamp: new Date(entry.timestamp)
        }));
        setConversationHistory(historyWithDates);
      } catch (error) {
        console.error('Error parsing conversation history:', error);
      }
    }

    // Load default models from settings
    const savedSettings = localStorage.getItem('fibroAiSettings');
    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings);
        if (parsedSettings.defaultModels && Array.isArray(parsedSettings.defaultModels) && parsedSettings.defaultModels.length > 0) {
          setSelectedModels(parsedSettings.defaultModels);
        } else {
          // Fallback to default models if no valid settings found
          setSelectedModels(['gpt-4o', 'claude-3.5-sonnet']);
        }
      } catch (error) {
        console.error('Error parsing settings:', error);
        // Fallback to default models on error
        setSelectedModels(['gpt-4o', 'claude-3.5-sonnet']);
      }
    } else {
      // No settings found, use default models
      setSelectedModels(['gpt-4o', 'claude-3.5-sonnet']);
    }
  }, []);

  // Clear tooltip when navigation changes
  useEffect(() => {
    setHoveredTooltip(null);
  }, [activeNavItem]);

  // Check for successful payment return
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get('success');
    const cancelled = urlParams.get('cancelled');
    
    if (success === 'true') {
      // Redirect to success page
      window.location.href = '/success';
    } else if (cancelled === 'true') {
      // Redirect to cancel page
      window.location.href = '/cancel';
    }
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode.toString());
    
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Function to reload settings (called when returning from settings page)
  const reloadSettings = () => {
    const savedSettings = localStorage.getItem('fibroAiSettings');
    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings);
        if (parsedSettings.defaultModels && Array.isArray(parsedSettings.defaultModels) && parsedSettings.defaultModels.length > 0) {
          setSelectedModels(parsedSettings.defaultModels);
        }
      } catch (error) {
        console.error('Error parsing settings:', error);
      }
    }
  };

  const handleModelToggle = (modelKey: string) => {
    setSelectedModels(prev => {
      if (prev.includes(modelKey)) {
        return prev.filter(m => m !== modelKey);
      } else {
        return [...prev, modelKey];
      }
    });
  };

  const handleSendMessage = async () => {
    if (!message.trim() || selectedModels.length === 0) return;

    // Check if user is authenticated and verified before sending
    if (!user) {
      setShowAuthPrompt(true);
      setTimeout(() => {
        setActiveNavItem('login');
        setShowAuthPrompt(false);
      }, 2000);
      return;
    }

    // Check if email is verified
    if (!user.emailVerified) {
      setVerificationEmail(user.email || '');
      setActiveNavItem('verification');
      return;
    }

    // Check if any paid models are selected
    const paidModels = selectedModels.filter(modelKey => {
      const modelConfig = AVAILABLE_MODELS[modelKey as keyof typeof AVAILABLE_MODELS];
      return !modelConfig?.free;
    });
    
    // Only check credits if paid models are selected
    if (paidModels.length > 0) {
      console.log('Paid models selected:', paidModels, 'Current credits:', credits, 'Credits loading:', creditsLoading);
      if (creditsLoading) {
        console.log('Credits still loading, waiting...');
        return;
      }
      
      if (credits < 2 && !creditsLoading) {
        console.log('Insufficient credits for paid models - Credits:', credits);
        setShowInsufficientCreditsModal(true);
        return;
      }
    } else {
      console.log('Only free models selected, no credit check needed');
    }

    setLoading(true);
    setResponses([]);
    setBestResponse(null);
    const startTime = Date.now();

    try {
      console.log('Sending prompt with userId:', user.uid, 'Current credits:', credits);
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: message.trim(),
          models: selectedModels,
          userId: user.uid
        }),
      });

      console.log('API Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.log('API Error response:', errorData);
        
        if (response.status === 402) {
          setShowInsufficientCreditsModal(true);
        } else if (response.status === 401) {
          alert('Authentication required. Please log in again.');
          setActiveNavItem('login');
        } else {
          alert(`Error: ${errorData.error || 'Something went wrong'}`);
        }
        setLoading(false);
        return;
      }

      const data: ComparisonResult = await response.json();
      console.log('API Success response:', data);
      
      if (data.success) {
        // Refresh credits after successful API call
        console.log('Refreshing credits after successful prompt...');
        refreshCredits();
        
        const endTime = Date.now();
        const enhancedResults = data.results.map(result => ({
          ...result,
          responseTime: endTime - startTime,
          wordCount: result.response ? result.response.split(/\s+/).length : 0,
          rating: 0
        }));
        
        setResponses(enhancedResults);
        
        // Find the best response (first successful one for now)
        const bestResult = enhancedResults.find(result => result.response && !result.error);
        if (bestResult) {
          setBestResponse(bestResult.model);
        }
        
        // Save to conversation history
        const newEntry: ConversationEntry = {
          id: Date.now().toString(),
          timestamp: new Date(),
          message: message.trim(),
          responses: enhancedResults,
          bestResponse: bestResult?.model,
        };
        
        const updatedHistory = [newEntry, ...conversationHistory].slice(0, 50); // Keep last 50 conversations
        setConversationHistory(updatedHistory);
        localStorage.setItem('conversationHistory', JSON.stringify(updatedHistory));
      } else {
        console.error('API Error:', data);
      }
    } catch (error) {
      console.error('Request failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const copyToClipboard = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  }, []);

  const markAsBest = (modelKey: string) => {
    setBestResponse(modelKey);
    
    // Update conversation history
    if (conversationHistory.length > 0) {
      const updatedHistory = [...conversationHistory];
      updatedHistory[0].bestResponse = modelKey;
      setConversationHistory(updatedHistory);
      localStorage.setItem('conversationHistory', JSON.stringify(updatedHistory));
    }
  };

  const rateResponse = (modelKey: string, rating: number) => {
    setResponses(prev => prev.map(response => 
      response.model === modelKey ? { ...response, rating } : response
    ));
    
    // Update conversation history
    if (conversationHistory.length > 0) {
      const updatedHistory = [...conversationHistory];
      updatedHistory[0].responses = updatedHistory[0].responses.map(response => 
        response.model === modelKey ? { ...response, rating } : response
      );
      setConversationHistory(updatedHistory);
      localStorage.setItem('conversationHistory', JSON.stringify(updatedHistory));
    }
  };

  const loadFromHistory = (entry: ConversationEntry) => {
    setMessage(entry.message);
    setResponses(entry.responses);
    setBestResponse(entry.bestResponse || null);
    setShowHistory(false);
  };


  const exportData = (format: 'json' | 'csv' | 'markdown') => {
    const currentData = {
      prompt: message,
      responses: responses,
      bestResponse: bestResponse,
      timestamp: new Date().toISOString()
    };

    let content = '';
    let filename = '';
    let mimeType = '';

    switch (format) {
      case 'json':
        content = JSON.stringify(currentData, null, 2);
        filename = `ai-comparison-${Date.now()}.json`;
        mimeType = 'application/json';
        break;
      case 'csv':
        const csvRows = [
          ['Model', 'Response', 'Word Count', 'Response Time (ms)', 'Rating', 'Best Response'].join(',')
        ];
        responses.forEach(response => {
          const row = [
            response.modelName,
            `"${(response.response || '').replace(/"/g, '""')}"`,
            response.wordCount || 0,
            response.responseTime || 0,
            response.rating || 0,
            response.model === bestResponse ? 'Yes' : 'No'
          ].join(',');
          csvRows.push(row);
        });
        content = csvRows.join('\n');
        filename = `ai-comparison-${Date.now()}.csv`;
        mimeType = 'text/csv';
        break;
      case 'markdown':
        content = `# AI Model Comparison\n\n**Prompt:** ${message}\n\n`;
        responses.forEach(response => {
          content += `## ${response.modelName}\n\n`;
          if (response.model === bestResponse) content += '👑 **Best Response**\n\n';
          content += `${response.response || 'No response'}\n\n`;
          content += `- **Word Count:** ${response.wordCount || 0}\n`;
          content += `- **Response Time:** ${response.responseTime || 0}ms\n`;
          content += `- **Rating:** ${response.rating || 0}/5 stars\n\n`;
        });
        filename = `ai-comparison-${Date.now()}.md`;
        mimeType = 'text/markdown';
        break;
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setShowExport(false);
  };

  const filteredHistory = conversationHistory.filter(entry => 
    entry.message.toLowerCase().includes(historySearch.toLowerCase())
  );

  // Voice Recognition Setup
  const startVoiceInput = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      // Define a minimal interface for SpeechRecognition
      interface ISpeechRecognition {
        continuous: boolean;
        interimResults: boolean;
        lang: string;
        onstart: (() => void) | null;
        onend: (() => void) | null;
        onresult: ((event: { results: { [key: number]: { [key: number]: { transcript: string } } } }) => void) | null;
        onerror: (() => void) | null;
        start(): void;
      }
      
      const windowWithSpeech = window as unknown as {
        webkitSpeechRecognition: new() => ISpeechRecognition;
        SpeechRecognition: new() => ISpeechRecognition;
      };
      
      const SpeechRecognitionClass = windowWithSpeech.webkitSpeechRecognition || windowWithSpeech.SpeechRecognition;
      const recognition = new SpeechRecognitionClass();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';
      
      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setMessage(prev => prev + (prev ? ' ' : '') + transcript);
      };
      recognition.onerror = () => setIsListening(false);
      
      recognition.start();
    }
  };



  // Advanced Prompt Builder
  const processPromptWithVariables = (template: string, variables: {[key: string]: string}): string => {
    let processed = template;
    Object.entries(variables).forEach(([key, value]) => {
      processed = processed.replace(new RegExp(`\\[${key}\\]`, 'g'), value);
    });
    return processed;
  };





  // Function to copy code to clipboard for code blocks
  const copyCodeToClipboard = (text: string, codeId: string) => {
    // Set state immediately - no delays, no batching
    setCopiedStates(prev => ({ ...prev, [codeId]: true }));
    
    // Copy to clipboard in background
    navigator.clipboard.writeText(text).catch(err => {
      console.error('Failed to copy text: ', err);
    });
    
    // Reset after 2 seconds
    setTimeout(() => {
      setCopiedStates(prev => ({ ...prev, [codeId]: false }));
    }, 2000);
  };

  // Function to handle template selection
  const handleTemplateSelect = (template: PromptTemplate) => {
    setMessage(template.template);
    setShowTemplates(false);
  };

  // Add state for copy button feedback
  const [copiedStates, setCopiedStates] = React.useState<{[key: string]: boolean}>({});

  // Safe function to render highlighted line without dangerouslySetInnerHTML
  const renderHighlightedLine = (line: string) => {
    // Parse the HTML-like string and convert to React elements safely
    const parts = [];
    let currentIndex = 0;
    const spanRegex = /<span class="([^"]+)">([^<]*)<\/span>/g;
    let match;
    
    while ((match = spanRegex.exec(line)) !== null) {
      // Add text before the span
      if (match.index > currentIndex) {
        parts.push(line.substring(currentIndex, match.index));
      }
      
      // Add the span as a React element
      parts.push(
        <span key={match.index} className={match[1]}>
          {match[2]}
        </span>
      );
      
      currentIndex = spanRegex.lastIndex;
    }
    
    // Add remaining text
    if (currentIndex < line.length) {
      parts.push(line.substring(currentIndex));
    }
    
    return parts.length > 0 ? parts : line;
  };

  // Safe function to render formatted text without dangerouslySetInnerHTML
  const renderFormattedText = (text: string) => {
    // Parse HTML-like strings and convert to React elements safely
    const parts = [];
    let currentIndex = 0;
    const tagRegex = /<(strong|em) class="([^"]+)">([^<]*)<\/(strong|em)>/g;
    let match;
    
    while ((match = tagRegex.exec(text)) !== null) {
      // Add text before the tag
      if (match.index > currentIndex) {
        parts.push(text.substring(currentIndex, match.index));
      }
      
      // Add the tag as a React element
      const TagName = match[1] as 'strong' | 'em';
      parts.push(
        <TagName key={match.index} className={match[2]}>
          {match[3]}
        </TagName>
      );
      
      currentIndex = tagRegex.lastIndex;
    }
    
    // Add remaining text
    if (currentIndex < text.length) {
      parts.push(text.substring(currentIndex));
    }
    
    return parts.length > 0 ? parts : text;
  };

  // Function to render syntax highlighting
  const renderSyntaxHighlighting = (code: string, language: string) => {
    const lines = code.split('\n');
    
    return lines.map((line, index) => {
      let highlightedLine = line;
      
      // Basic syntax highlighting patterns
      if (language === 'javascript' || language === 'typescript') {
        // Keywords
        highlightedLine = highlightedLine.replace(
          /\b(function|const|let|var|if|else|for|while|return|class|import|export|from|async|await|try|catch)\b/g,
          '<span class="text-purple-400 font-semibold">$1</span>'
        );
        // Strings
        highlightedLine = highlightedLine.replace(
          /(["'`])((?:\\.|(?!\1)[^\\])*?)\1/g,
          '<span class="text-green-400">$1$2$1</span>'
        );
        // Comments
        highlightedLine = highlightedLine.replace(
          /(\/\/.*$|\/\*[\s\S]*?\*\/)/g,
          '<span class="text-gray-500 italic">$1</span>'
        );
        // Numbers
        highlightedLine = highlightedLine.replace(
          /\b(\d+\.?\d*)\b/g,
          '<span class="text-yellow-400">$1</span>'
        );
      } else if (language === 'html') {
        // HTML tags
        highlightedLine = highlightedLine.replace(
          /(<\/?[^>]+>)/g,
          '<span class="text-blue-400">$1</span>'
        );
        // Attributes
        highlightedLine = highlightedLine.replace(
          /(\w+)=/g,
          '<span class="text-yellow-400">$1</span>='
        );
      } else if (language === 'css') {
        // CSS properties
        highlightedLine = highlightedLine.replace(
          /([a-zA-Z-]+):/g,
          '<span class="text-blue-400">$1</span>:'
        );
        // CSS values
        highlightedLine = highlightedLine.replace(
          /:\s*([^;]+);/g,
          ': <span class="text-green-400">$1</span>;'
        );
      } else if (language === 'python') {
        // Python keywords
        highlightedLine = highlightedLine.replace(
          /\b(def|class|if|elif|else|for|while|import|from|return|try|except|with|as)\b/g,
          '<span class="text-purple-400 font-semibold">$1</span>'
        );
        // Strings
        highlightedLine = highlightedLine.replace(
          /(["'])((?:\\.|(?!\1)[^\\])*?)\1/g,
          '<span class="text-green-400">$1$2$1</span>'
        );
      }
      
      return (
        <div key={index} className="block">
          {renderHighlightedLine(highlightedLine || ' ')}
        </div>
      );
    });
  };

  // Enhanced function to render response with rich formatting
  const renderResponseWithCodeBlocks = (text: string, darkMode: boolean, isBest: boolean, modelKey: string = 'unknown') => {
    // Split by code blocks first
    const codeBlockParts = text.split(/(```[\s\S]*?```)/g);
    
    return codeBlockParts.map((part, index) => {
      if (part.startsWith('```') && part.endsWith('```')) {
        // Handle code blocks
        const lines = part.slice(3, -3).split('\n');
        const language = lines[0].trim() || 'text';
        const code = lines.slice(1).join('\n');
        
        // Language-specific styling
        const getLanguageColor = (lang: string) => {
          const langColors: Record<string, string> = {
            'javascript': 'from-yellow-400 to-yellow-600',
            'typescript': 'from-blue-400 to-blue-600',
            'python': 'from-green-400 to-green-600',
            'java': 'from-red-400 to-red-600',
            'css': 'from-purple-400 to-purple-600',
            'html': 'from-orange-400 to-orange-600',
            'bash': 'from-gray-400 to-gray-600',
            'sql': 'from-indigo-400 to-indigo-600',
            'json': 'from-teal-400 to-teal-600',
            'xml': 'from-pink-400 to-pink-600',
          };
          return langColors[lang.toLowerCase()] || 'from-gray-400 to-gray-600';
        };
        
        return (
          <div key={index} className="my-6 relative group shadow-lg rounded-lg overflow-hidden">
            {/* Enhanced header with language badge */}
            <div className={clsx(
              "flex items-center justify-between px-4 py-3 bg-gradient-to-r",
              getLanguageColor(language)
            )}>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-white/30"></div>
                <div className="w-3 h-3 rounded-full bg-white/30"></div>
                <div className="w-3 h-3 rounded-full bg-white/30"></div>
                <span className="ml-2 text-white font-semibold text-sm uppercase tracking-wider">
                  {language}
                </span>
              </div>
              <button
                onClick={() => copyCodeToClipboard(code, `code-${modelKey}-${index}`)}
                className="flex items-center gap-2 px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white rounded-md text-sm font-medium transition-all duration-200 hover:scale-105"
              >
                {copiedStates[`code-${modelKey}-${index}`] ? (
                  <>
                    <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-green-400">Copied</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Copy
                  </>
                )}
              </button>
            </div>
            
            {/* Enhanced code container */}
            <div className={clsx(
              "relative",
              "bg-gray-900"
            )}>
              <pre className={clsx(
                "p-6 text-sm font-mono overflow-x-auto leading-relaxed",
                "text-gray-100"
              )}>
                <code className="block">{renderSyntaxHighlighting(code, language)}</code>
              </pre>
            </div>
          </div>
        );
      } else {
        // Process regular text for enhanced formatting
        return (
          <div key={index} className="space-y-4">
            {part.split('\n').map((line, lineIndex) => {
              // Handle different line types
              if (line.trim() === '') return <br key={lineIndex} />;
              
              // Handle numbered steps (1. 2. 3.)
              if (/^\d+\.\s/.test(line.trim())) {
                const stepMatch = line.match(/^(\d+)\.\s(.+)$/);
                if (stepMatch) {
                  return (
                    <div key={lineIndex} className={clsx(
                      "flex items-start gap-3 p-4 rounded-lg border-l-4 border-blue-400",
                      darkMode ? "bg-blue-900/20" : "bg-blue-50"
                    )}>
                      <div className="flex items-center gap-2">
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                          {stepMatch[1]}
                        </div>
                        <div className={clsx(
                          "flex-1 text-sm leading-relaxed"
                        )}>
                          {renderInlineFormatting(stepMatch[2])}
                        </div>
                      </div>
                    </div>
                  );
                }
              }
              
              // Handle bullet points (- or *)
              if (/^[-*]\s/.test(line.trim())) {
                const bulletText = line.replace(/^[-*]\s/, '');
                return (
                  <div key={lineIndex} className={clsx(
                    "flex items-start gap-3 p-3 rounded-lg",
                    darkMode ? "bg-gray-800/50" : "bg-gray-100/50"
                  )}>
                    <div className="flex-shrink-0 w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div className={clsx(
                      "flex-1 text-sm leading-relaxed",
                      isBest && darkMode ? "text-gray-900" : darkMode ? "text-gray-200" : "text-gray-800"
                    )}>
                      {renderInlineFormatting(bulletText)}
                    </div>
                  </div>
                );
              }
              
              // Handle headers (## or ###)
              if (/^#{2,3}\s/.test(line.trim())) {
                const headerLevel = (line.match(/^#+/) || [''])[0].length;
                const headerText = line.replace(/^#+\s/, '');
                return (
                  <div key={lineIndex} className={clsx(
                    "py-2 border-b",
                    headerLevel === 2 ? "text-xl font-bold" : "text-lg font-semibold",
                    darkMode ? "text-gray-100 border-gray-700" : "text-gray-900 border-gray-300"
                  )}>
                    {headerText}
                  </div>
                );
              }
              
              // Handle commands (lines starting with $)
              if (/^\$\s/.test(line.trim())) {
                const command = line.replace(/^\$\s/, '');
                return (
                  <div key={lineIndex} className={clsx(
                    "relative group p-4 rounded-lg border-l-4 border-green-400",
                    darkMode ? "bg-green-900/20" : "bg-green-50"
                  )}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-green-500 font-bold">$</span>
                        <code className={clsx(
                          "font-mono text-sm",
                          darkMode ? "text-gray-200" : "text-gray-800"
                        )}>
                          {command}
                        </code>
                      </div>
                      <button
                        onClick={() => copyCodeToClipboard(command, `command-${index}`)}
                        className={clsx(
                          "opacity-0 group-hover:opacity-100 transition-opacity px-2 py-1 rounded text-xs",
                          darkMode ? "bg-gray-700 text-gray-300 hover:bg-gray-600" : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                        )}
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                );
              }
              
              // Regular paragraph
              return (
                <p key={lineIndex} className={clsx(
                  "text-sm leading-relaxed",
                  isBest && darkMode ? "text-gray-900" : darkMode ? "text-gray-200" : "text-gray-800"
                )}>
                  {renderInlineFormatting(line)}
                </p>
              );
            })}
          </div>
        );
      }
    });
  };
  
  // Helper function for inline formatting (bold, italic, inline code)
  const renderInlineFormatting = (text: string) => {
    // Handle inline code first
    const parts = text.split(/(`[^`]+`)/g);
    
    return parts.map((part, index) => {
      if (part.startsWith('`') && part.endsWith('`')) {
        const inlineCode = part.slice(1, -1);
        return (
          <code
            key={index}
            className="px-2 py-1 rounded font-mono text-xs border bg-gray-800 text-green-400 border-gray-700"
          >
            {inlineCode}
          </code>
        );
      } else {
        // Handle bold (**text**) and italic (*text*)
        let formattedText = part;
        
        // Bold text
        formattedText = formattedText.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold">$1</strong>');
        
        // Italic text
        formattedText = formattedText.replace(/\*(.*?)\*/g, '<em class="italic">$1</em>');
        
        return <span key={index}>{renderFormattedText(formattedText)}</span>;
      }
    });
  };

  // Render different pages based on activeNavItem
  if (activeNavItem === 'login') {
    return <LoginPage 
      darkMode={darkMode} 
      onBack={() => setActiveNavItem('home')} 
      onNavigateToSignup={() => setActiveNavItem('signup')}
      onNavigateToVerification={(email) => {
        setActiveNavItem('verification');
        // Store email for verification page
        localStorage.setItem('pendingVerificationEmail', email);
      }}
    />;
  }
  
  if (activeNavItem === 'signup') {
    return <SignupPage 
      darkMode={darkMode} 
      onBack={() => setActiveNavItem('home')} 
      onNavigateToLogin={() => setActiveNavItem('login')}
      onNavigateToVerification={(email) => {
        setVerificationEmail(email);
        setActiveNavItem('verification');
      }}
    />;
  }
  
  if (activeNavItem === 'verification') {
    return <EmailVerification 
      darkMode={darkMode} 
      onBack={() => setActiveNavItem('home')} 
      userEmail={verificationEmail}
    />;
  }
  
  if (activeNavItem === 'settings') {
    return <SettingsPage darkMode={darkMode} onBack={() => setActiveNavItem('home')} onToggleDarkMode={toggleDarkMode} onSettingsSaved={reloadSettings} onClearHistory={() => setConversationHistory([])} />;
  }

  if (activeNavItem === 'account') {
    return <AccountSettings darkMode={darkMode} onBack={() => setActiveNavItem('home')} />;
  }

  if (activeNavItem === 'credits') {
    return <CreditPurchase darkMode={darkMode} onBack={() => setActiveNavItem('home')} />;
  }

  return (
    <div className={clsx(
      "min-h-screen transition-all duration-500 ease-in-out relative overflow-hidden",
      darkMode 
        ? "bg-black" 
        : "bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100"
    )}>

      {/* Left Navigation Bar - Matches the image design */}
      <div className={clsx(
        "fixed left-1 top-1/2 transform -translate-y-1/2 z-40 flex flex-col gap-2 p-3 rounded-3xl backdrop-blur-sm border shadow-2xl transition-all duration-300",
        darkMode 
          ? "bg-gray-900/95 border-gray-800/50" 
          : "bg-gray-800/95 border-gray-700/50"
      )}>
        {/* Home */}
        <div className="relative">
          <button
            onClick={() => setActiveNavItem('home')}
            onMouseEnter={() => setHoveredTooltip('nav-home')}
            onMouseLeave={() => setHoveredTooltip(null)}
            className={clsx(
              "group relative w-14 h-14 rounded-2xl transition-all duration-300 focus:outline-none shadow-lg flex items-center justify-center transform hover:scale-105",
              activeNavItem === 'home'
                ? "bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-blue-500/30"
                : "bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white"
            )}
          >
            <span className="text-xl drop-shadow-sm">🏠</span>
          </button>
          {hoveredTooltip === 'nav-home' && (
            <div className={clsx(
              "absolute left-full ml-3 top-1/2 transform -translate-y-1/2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap z-50 shadow-lg border backdrop-blur-sm transition-all duration-200",
              darkMode 
                ? "bg-gray-800/95 text-white border-gray-700/50" 
                : "bg-white/95 text-gray-900 border-gray-200/50"
            )}>
              Home
              <div className={clsx(
                "absolute right-full top-1/2 transform -translate-y-1/2 border-4 border-transparent",
                darkMode ? "border-r-gray-800/95" : "border-r-white/95"
              )}></div>
            </div>
          )}
        </div>

        {/* Login/Profile */}
        <div className="relative">
          <button
            onClick={() => {
              setHoveredTooltip(null);
              if (user) {
                setActiveNavItem('account');
              } else {
                setActiveNavItem('login');
              }
            }}
            onMouseEnter={() => setHoveredTooltip(user ? 'nav-profile' : 'nav-login')}
            onMouseLeave={() => setHoveredTooltip(null)}
            className={clsx(
              "group relative w-14 h-14 rounded-2xl transition-all duration-300 focus:outline-none shadow-lg flex items-center justify-center transform hover:scale-105",
              (activeNavItem === 'login' || activeNavItem === 'account' || user)
                ? "bg-gradient-to-br from-green-500 to-teal-600 text-white shadow-green-500/30"
                : "bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white"
            )}
          >
            <span className="text-xl drop-shadow-sm">{user ? '👤' : '🔐'}</span>
          </button>
          {(hoveredTooltip === 'nav-login' || hoveredTooltip === 'nav-profile') && (
            <div className={clsx(
              "absolute left-full ml-3 top-1/2 transform -translate-y-1/2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap z-50 shadow-lg border backdrop-blur-sm transition-all duration-200",
              "bg-gray-800/95 text-white border-gray-700/50"
            )}>
              {user ? 'Account Settings' : 'Login'}
              <div className="absolute right-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-r-gray-800/95"></div>
            </div>
          )}
        </div>

        {/* Signup - Only show if not logged in */}
        {!user && (
          <div className="relative">
            <button
              onClick={() => setActiveNavItem('signup')}
              onMouseEnter={() => setHoveredTooltip('nav-signup')}
              onMouseLeave={() => setHoveredTooltip(null)}
              className={clsx(
                "group relative w-14 h-14 rounded-2xl transition-all duration-300 focus:outline-none shadow-lg flex items-center justify-center transform hover:scale-105",
                activeNavItem === 'signup'
                  ? "bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-green-500/30"
                  : "bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white"
              )}
            >
              <span className="text-xl drop-shadow-sm">👤</span>
            </button>
            {hoveredTooltip === 'nav-signup' && (
              <div className={clsx(
                "absolute left-full ml-3 top-1/2 transform -translate-y-1/2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap z-50 shadow-lg border backdrop-blur-sm transition-all duration-200",
                "bg-gray-800/95 text-white border-gray-700/50"
              )}>
                Sign Up
                <div className="absolute right-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-r-gray-800/95"></div>
              </div>
            )}
          </div>
        )}

        {/* Settings */}
        <div className="relative">
          <button
            onClick={() => setActiveNavItem('settings')}
            onMouseEnter={() => setHoveredTooltip('nav-settings')}
            onMouseLeave={() => setHoveredTooltip(null)}
            className={clsx(
              "group relative w-14 h-14 rounded-2xl transition-all duration-300 focus:outline-none shadow-lg flex items-center justify-center transform hover:scale-105",
              activeNavItem === 'settings'
                ? "bg-gradient-to-br from-gray-500 to-gray-600 text-white shadow-gray-500/30"
                : "bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white"
            )}
          >
            <span className="text-xl drop-shadow-sm">⚙️</span>
          </button>
          {hoveredTooltip === 'nav-settings' && (
            <div className={clsx(
              "absolute left-full ml-3 top-1/2 transform -translate-y-1/2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap z-50 shadow-lg border backdrop-blur-sm transition-all duration-200",
              "bg-gray-800/95 text-white border-gray-700/50"
            )}>
              Settings
              <div className="absolute right-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-r-gray-800/95"></div>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 ml-28">

        {/* Top Navigation */}
        <div className="fixed top-6 right-6 z-50 flex items-center gap-3">
          {/* History Button */}
          <div className="relative">
            <button
              onClick={() => setShowHistory(!showHistory)}
              onMouseEnter={() => setHoveredTooltip('history')}
              onMouseLeave={() => setHoveredTooltip(null)}
              className={clsx(
                "group relative w-12 h-12 rounded-full transition-all duration-300 focus:outline-none focus:ring-4 shadow-lg flex items-center justify-center transform hover:scale-110 hover:rotate-3",
                darkMode 
                  ? "bg-gradient-to-br from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 focus:ring-purple-500/30 text-white shadow-purple-500/25" 
                  : "bg-gradient-to-br from-purple-500 to-blue-500 hover:from-purple-400 hover:to-blue-400 focus:ring-purple-500/30 text-white shadow-purple-500/25"
              )}
            >
              <span className="text-lg drop-shadow-sm">📚</span>
              {conversationHistory.length > 0 && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center text-xs text-white font-bold shadow-lg animate-pulse">
                  {conversationHistory.length > 9 ? '9+' : conversationHistory.length}
                </div>
              )}
            </button>
            {hoveredTooltip === 'history' && (
              <div className={clsx(
                "absolute -bottom-16 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-xl shadow-2xl border backdrop-blur-sm z-50 whitespace-nowrap animate-in fade-in slide-in-from-top-2 duration-200",
                darkMode 
                  ? "bg-gray-800/95 border-gray-600/50 text-white" 
                  : "bg-white/95 border-gray-200/50 text-gray-900"
              )}>
                <div className="flex items-center gap-2">
                  <span className="text-sm">📚</span>
                  <div>
                    <div className="font-semibold text-sm">Conversation History</div>
                    <div className={clsx(
                      "text-xs",
                      darkMode ? "text-gray-400" : "text-gray-500"
                    )}>View and search past conversations</div>
                  </div>
                </div>
                <div className={clsx(
                  "absolute bottom-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent",
                  darkMode ? "border-b-gray-800/95" : "border-b-white/95"
                )}></div>
              </div>
            )}
          </div>

          {/* Templates Button */}
          <div className="relative">
            <button
              onClick={() => setShowTemplates(!showTemplates)}
              onMouseEnter={() => setHoveredTooltip('templates')}
              onMouseLeave={() => setHoveredTooltip(null)}
              className={clsx(
                "group relative w-12 h-12 rounded-full transition-all duration-300 focus:outline-none focus:ring-4 shadow-lg flex items-center justify-center transform hover:scale-110 hover:-rotate-3",
                darkMode 
                  ? "bg-gradient-to-br from-green-600 to-teal-600 hover:from-green-500 hover:to-teal-500 focus:ring-green-500/30 text-white shadow-green-500/25" 
                  : "bg-gradient-to-br from-green-500 to-teal-500 hover:from-green-400 hover:to-teal-400 focus:ring-green-500/30 text-white shadow-green-500/25"
              )}
            >
              <span className="text-lg drop-shadow-sm">📝</span>
            </button>
            {hoveredTooltip === 'templates' && (
              <div className={clsx(
                "absolute -bottom-16 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-xl shadow-2xl border backdrop-blur-sm z-50 whitespace-nowrap animate-in fade-in slide-in-from-top-2 duration-200",
                darkMode 
                  ? "bg-gray-800/95 border-gray-600/50 text-white" 
                  : "bg-white/95 border-gray-200/50 text-gray-900"
              )}>
                <div className="flex items-center gap-2">
                  <span className="text-sm">📝</span>
                  <div>
                    <div className="font-semibold text-sm">Prompt Templates</div>
                    <div className={clsx(
                      "text-xs",
                      darkMode ? "text-gray-400" : "text-gray-500"
                    )}>Pre-built prompts for common tasks</div>
                  </div>
                </div>
                <div className={clsx(
                  "absolute bottom-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent",
                  darkMode ? "border-b-gray-800/95" : "border-b-white/95"
                )}></div>
              </div>
            )}
          </div>

          {/* Export Button */}
          {responses.length > 0 && (
            <div className="relative">
              <button
                onClick={() => setShowExport(!showExport)}
                onMouseEnter={() => setHoveredTooltip('export')}
                onMouseLeave={() => setHoveredTooltip(null)}
                className={clsx(
                  "group relative w-12 h-12 rounded-full transition-all duration-300 focus:outline-none focus:ring-4 shadow-lg flex items-center justify-center transform hover:scale-110 hover:rotate-12",
                  darkMode 
                    ? "bg-gradient-to-br from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 focus:ring-orange-500/30 text-white shadow-orange-500/25" 
                    : "bg-gradient-to-br from-orange-500 to-red-500 hover:from-orange-400 hover:to-red-400 focus:ring-orange-500/30 text-white shadow-orange-500/25"
                )}
              >
                <span className="text-lg drop-shadow-sm">💾</span>
              </button>
              {hoveredTooltip === 'export' && (
                <div className={clsx(
                  "absolute -bottom-16 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-xl shadow-2xl border backdrop-blur-sm z-50 whitespace-nowrap animate-in fade-in slide-in-from-top-2 duration-200",
                  darkMode 
                    ? "bg-gray-800/95 border-gray-600/50 text-white" 
                    : "bg-white/95 border-gray-200/50 text-gray-900"
                )}>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">💾</span>
                    <div>
                      <div className="font-semibold text-sm">Export Results</div>
                      <div className={clsx(
                        "text-xs",
                        darkMode ? "text-gray-400" : "text-gray-500"
                      )}>Download in JSON, CSV, or Markdown</div>
                    </div>
                  </div>
                  <div className={clsx(
                    "absolute bottom-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent",
                    darkMode ? "border-b-gray-800/95" : "border-b-white/95"
                  )}></div>
                </div>
              )}
            </div>
          )}

          {/* Comparison Button */}
          {responses.length >= 2 && (
            <div className="relative">
              <button
                onClick={() => setShowComparison(!showComparison)}
                onMouseEnter={() => setHoveredTooltip('comparison')}
                onMouseLeave={() => setHoveredTooltip(null)}
                className={clsx(
                  "group relative w-12 h-12 rounded-full transition-all duration-300 focus:outline-none focus:ring-4 shadow-lg flex items-center justify-center transform hover:scale-110 hover:-rotate-6",
                  darkMode 
                    ? "bg-gradient-to-br from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 focus:ring-indigo-500/30 text-white shadow-indigo-500/25" 
                    : "bg-gradient-to-br from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 focus:ring-indigo-500/30 text-white shadow-indigo-500/25"
                )}
              >
                <span className="text-lg drop-shadow-sm">🔍</span>
              </button>
              {hoveredTooltip === 'comparison' && (
                <div className={clsx(
                  "absolute -bottom-16 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-xl shadow-2xl border backdrop-blur-sm z-50 whitespace-nowrap animate-in fade-in slide-in-from-top-2 duration-200",
                  darkMode 
                    ? "bg-gray-800/95 border-gray-600/50 text-white" 
                    : "bg-white/95 border-gray-200/50 text-gray-900"
                )}>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">🔍</span>
                    <div>
                      <div className="font-semibold text-sm">Compare Responses</div>
                      <div className={clsx(
                        "text-xs",
                        darkMode ? "text-gray-400" : "text-gray-500"
                      )}>Side-by-side response comparison</div>
                    </div>
                  </div>
                  <div className={clsx(
                    "absolute bottom-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent",
                    darkMode ? "border-b-gray-800/95" : "border-b-white/95"
                  )}></div>
                </div>
              )}
            </div>
          )}

          {/* Analytics Button */}
          {responses.length > 0 && (
            <div className="relative">
              <button
                onClick={() => setShowAnalytics(!showAnalytics)}
                onMouseEnter={() => setHoveredTooltip('analytics')}
                onMouseLeave={() => setHoveredTooltip(null)}
                className={clsx(
                  "group relative w-12 h-12 rounded-full transition-all duration-300 focus:outline-none focus:ring-4 shadow-lg flex items-center justify-center transform hover:scale-110 hover:rotate-6",
                  darkMode 
                    ? "bg-gradient-to-br from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 focus:ring-cyan-500/30 text-white shadow-cyan-500/25" 
                    : "bg-gradient-to-br from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 focus:ring-cyan-500/30 text-white shadow-cyan-500/25"
                )}
              >
                <span className="text-lg drop-shadow-sm">📈</span>
              </button>
              {hoveredTooltip === 'analytics' && (
                <div className={clsx(
                  "absolute -bottom-16 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-xl shadow-2xl border backdrop-blur-sm z-50 whitespace-nowrap animate-in fade-in slide-in-from-top-2 duration-200",
                  darkMode 
                    ? "bg-gray-800/95 border-gray-600/50 text-white" 
                    : "bg-white/95 border-gray-200/50 text-gray-900"
                )}>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">📈</span>
                    <div>
                      <div className="font-semibold text-sm">Analytics Dashboard</div>
                      <div className={clsx(
                        "text-xs",
                        darkMode ? "text-gray-400" : "text-gray-500"
                      )}>Performance metrics and insights</div>
                    </div>
                  </div>
                  <div className={clsx(
                    "absolute bottom-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent",
                    darkMode ? "border-b-gray-800/95" : "border-b-white/95"
                  )}></div>
                </div>
              )}
            </div>
          )}

          {/* Prompt Builder Button */}
          <div className="relative">
            <button
              onClick={() => setShowPromptBuilder(!showPromptBuilder)}
              onMouseEnter={() => setHoveredTooltip('builder')}
              onMouseLeave={() => setHoveredTooltip(null)}
              className={clsx(
                "group relative w-12 h-12 rounded-full transition-all duration-300 focus:outline-none focus:ring-4 shadow-lg flex items-center justify-center transform hover:scale-110 hover:rotate-12",
                darkMode 
                  ? "bg-gradient-to-br from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 focus:ring-yellow-500/30 text-white shadow-yellow-500/25" 
                  : "bg-gradient-to-br from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 focus:ring-yellow-500/30 text-white shadow-yellow-500/25"
              )}
            >
              <span className="text-lg drop-shadow-sm">🛠️</span>
            </button>
            {hoveredTooltip === 'builder' && (
              <div className={clsx(
                "absolute -bottom-16 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-xl shadow-2xl border backdrop-blur-sm z-50 whitespace-nowrap animate-in fade-in slide-in-from-top-2 duration-200",
                darkMode 
                  ? "bg-gray-800/95 border-gray-600/50 text-white" 
                  : "bg-white/95 border-gray-200/50 text-gray-900"
              )}>
                <div className="flex items-center gap-2">
                  <span className="text-sm">🛠️</span>
                  <div>
                    <div className="font-semibold text-sm">Prompt Builder</div>
                    <div className={clsx(
                      "text-xs",
                      darkMode ? "text-gray-400" : "text-gray-500"
                    )}>Advanced prompt engineering tools</div>
                  </div>
                </div>
                <div className={clsx(
                  "absolute bottom-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent",
                  darkMode ? "border-b-gray-800/95" : "border-b-white/95"
                )}></div>
              </div>
            )}
          </div>

          {/* Dark Mode Toggle */}
          <div>
          <button
            onClick={toggleDarkMode}
            className={clsx(
              "group relative w-16 h-8 rounded-full transition-all duration-300 focus:outline-none focus:ring-4 shadow-lg",
              darkMode 
                ? "bg-gradient-to-r from-gray-700 to-gray-600 focus:ring-gray-500/30" 
                : "bg-gradient-to-r from-gray-300 to-gray-400 focus:ring-gray-500/30"
            )}
          >
            <div className={clsx(
              "absolute top-1 w-6 h-6 rounded-full transition-all duration-300 transform flex items-center justify-center text-xs shadow-md",
              darkMode 
                ? "translate-x-8 bg-white text-gray-800" 
                : "translate-x-1 bg-white text-gray-600"
            )}>
              {darkMode ? '🌙' : '☀️'}
            </div>
            <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-20 bg-white transition-opacity duration-200"></div>
          </button>
          </div>
        </div>
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-gray-700 to-gray-600 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-2xl">🚀</span>
            </div>
            <div>
              <h1 className={clsx(
              "text-4xl font-bold bg-gradient-to-r bg-clip-text text-transparent",
              darkMode 
                ? "from-white via-gray-200 to-gray-300" 
                : "from-gray-900 via-blue-800 to-purple-800"
            )}>
                Fibero AI
              </h1>
            </div>
          </div>
          <p className={clsx(
            "text-xl max-w-2xl mx-auto leading-relaxed",
            darkMode ? "text-gray-300" : "text-gray-600"
          )}>
            Compare responses from the world&apos;s leading AI models in real-time
          </p>
          <div className={clsx(
            "flex items-center justify-center gap-2 mt-4 text-sm",
            darkMode ? "text-gray-400" : "text-gray-500"
          )}>
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span>Powered by OpenRouter</span>
          </div>
        </div>

        {/* Model Selection */}
        <div className={clsx(
          "backdrop-blur-sm rounded-2xl shadow-xl border p-8 mb-8 transition-all duration-300",
          darkMode 
            ? "bg-gray-800/80 border-gray-700/30" 
            : "bg-white/80 border-white/20"
        )}>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-gradient-to-r from-gray-600 to-gray-500 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-bold">AI</span>
            </div>
            <h2 className={clsx(
              "text-2xl font-bold",
              darkMode ? "text-white" : "text-gray-900"
            )}>Select AI Models</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-6">
            {Object.entries(AVAILABLE_MODELS).map(([key, model]) => (
              <button
                key={key}
                onClick={() => handleModelToggle(key)}
                className={clsx(
                  'group relative p-4 rounded-xl border-2 transition-all duration-300 hover:scale-105 hover:shadow-lg',
                  selectedModels.includes(key)
                    ? `${model.borderColor} ${model.bgColor} shadow-md`
                    : darkMode 
                      ? 'border-gray-600 bg-gray-700/50 hover:border-gray-500 hover:bg-gray-600/50'
                      : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                )}
              >
                <div className="flex flex-col items-center text-center space-y-2">
                  <div className={clsx(
                    'w-12 h-12 rounded-xl flex items-center justify-center text-2xl transition-all duration-300',
                    selectedModels.includes(key)
                      ? `bg-gradient-to-r ${model.color} shadow-lg`
                      : 'bg-gray-100 group-hover:bg-gray-200'
                  )}>
                    {model.icon}
                  </div>
                  <div>
                    <div className={clsx(
                      'font-semibold text-sm flex items-center gap-1',
                      selectedModels.includes(key) 
                        ? model.textColor 
                        : darkMode ? 'text-white' : 'text-gray-900'
                    )}>
                      {model.name}
                      {model.free && (
                        <span className="text-xs bg-green-500 text-white px-1.5 py-0.5 rounded-full font-bold">
                          FREE
                        </span>
                      )}
                    </div>
                    <div className={clsx(
                      "text-xs",
                      darkMode ? "text-gray-400" : "text-gray-500"
                    )}>{model.company}</div>
                  </div>
                </div>
                {selectedModels.includes(key) && (
                  <div className={clsx(
                    'absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg bg-gradient-to-r',
                    model.color
                  )}>
                    ✓
                  </div>
                )}
              </button>
            ))}
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gradient-to-r from-gray-500 to-gray-400 rounded-full"></div>
              <span className={clsx(
                "text-sm font-medium",
                darkMode ? "text-gray-300" : "text-gray-700"
              )}>
                {selectedModels.length} model{selectedModels.length !== 1 ? 's' : ''} selected
              </span>
            </div>
            {selectedModels.length > 0 && (
              <div className={clsx(
                "text-xs px-3 py-1 rounded-full",
                darkMode 
                  ? "text-gray-400 bg-gray-700" 
                  : "text-gray-500 bg-gray-100"
              )}>
                Ready to compare
              </div>
            )}
          </div>
        </div>

        {/* Advertisement Banner */}

        {/* Message Input */}
        <div className={clsx(
          "backdrop-blur-sm rounded-2xl shadow-xl border p-8 mb-8 transition-all duration-300",
          darkMode 
            ? "bg-gray-800/80 border-gray-700/30" 
            : "bg-white/80 border-white/20"
        )}>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-gray-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-lg">💬</span>
            </div>
            <h2 className={clsx(
              "text-2xl font-bold",
              darkMode ? "text-white" : "text-gray-900"
            )}>Your Prompt</h2>
          </div>
          <div className="space-y-6">
            <div className="relative">
              <textarea
                id="main-prompt-input"
                name="prompt"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask anything... Compare how different AI models respond to your questions."
                className={clsx(
                  "w-full h-40 p-6 border-2 rounded-2xl resize-none focus:ring-4 focus:ring-gray-500/20 focus:border-gray-500 transition-all duration-300 text-lg leading-relaxed backdrop-blur-sm",
                  darkMode 
                    ? "border-gray-600 bg-gray-700/50 text-white placeholder-gray-400" 
                    : "border-gray-200 bg-gray-50/50 text-gray-900 placeholder-gray-500"
                )}
                disabled={loading}
              />
              <div className="absolute bottom-4 right-4 flex items-center gap-2">
                {/* Credit Indicator */}
                {user && (
                  <div className={clsx(
                    "flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium",
                    darkMode 
                      ? "bg-gray-600/50 text-gray-300" 
                      : "bg-gray-200/50 text-gray-600"
                  )}>
                    <span className="text-sm">💎</span>
                    <span className={clsx(
                      credits < 5 ? "text-red-400" : credits < 10 ? "text-yellow-400" : "text-green-400"
                    )}>
                      {creditsLoading ? '...' : credits}
                    </span>
                    {credits < 5 && (
                      <button 
                        onClick={() => setActiveNavItem('credits')}
                        className="ml-1 text-blue-400 hover:text-blue-300 underline"
                      >
                        buy
                      </button>
                    )}
                  </div>
                )}
                {/* Voice Input Button */}
                <button
                  onClick={startVoiceInput}
                  disabled={loading || isListening}
                  className={clsx(
                    "p-2 rounded-full transition-all duration-200",
                    isListening
                      ? "bg-red-500 text-white animate-pulse"
                      : darkMode
                        ? "bg-gray-600 hover:bg-gray-500 text-gray-200"
                        : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                  )}
                  onMouseEnter={() => setHoveredTooltip('voice')}
                  onMouseLeave={() => setHoveredTooltip(null)}
                >
                  {isListening ? (
                    <span className="text-sm drop-shadow-sm">🔴</span>
                  ) : (
                    <svg 
                      className="w-4 h-4" 
                      fill="currentColor" 
                      viewBox="0 0 20 20"
                    >
                      <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
                {hoveredTooltip === 'voice' && (
                  <div className={clsx(
                    "absolute -top-16 left-1/2 transform -translate-x-1/2 px-3 py-2 rounded-lg shadow-xl border backdrop-blur-sm z-50 whitespace-nowrap animate-in fade-in slide-in-from-bottom-2 duration-200",
                    darkMode 
                      ? "bg-gray-800/95 border-gray-600/50 text-white" 
                      : "bg-white/95 border-gray-200/50 text-gray-900"
                  )}>
                    <div className="flex items-center gap-2">
                      {isListening ? (
                        <span className="text-sm">🔴</span>
                      ) : (
                        <svg 
                          className="w-4 h-4" 
                          fill="currentColor" 
                          viewBox="0 0 20 20"
                        >
                          <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                        </svg>
                      )}
                      <div className="text-sm font-medium">
                        {isListening ? 'Listening...' : 'Voice Input'}
                      </div>
                    </div>
                    <div className={clsx(
                      "absolute bottom-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-3 border-r-3 border-b-3 border-transparent",
                      darkMode ? "border-b-gray-800/95" : "border-b-white/95"
                    )}></div>
                  </div>
                )}
                <div className={clsx(
                  "text-xs px-2 py-1 rounded-full",
                  darkMode 
                    ? "text-gray-400 bg-gray-700/80" 
                    : "text-gray-400 bg-white/80"
                )}>
                  {message?.length || 0} chars
                </div>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className={clsx(
                  "text-sm",
                  darkMode ? "text-gray-400" : "text-gray-500"
                )}>
                  <span className="inline-flex items-center gap-1">
                    <kbd className={clsx(
                      "px-2 py-1 rounded text-xs",
                      darkMode ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-700"
                    )}>Enter</kbd>
                    to send
                  </span>
                </div>
                <div className={clsx(
                  "text-sm",
                  darkMode ? "text-gray-400" : "text-gray-500"
                )}>
                  <span className="inline-flex items-center gap-1">
                    <kbd className={clsx(
                      "px-2 py-1 rounded text-xs",
                      darkMode ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-700"
                    )}>Shift+Enter</kbd>
                    for new line
                  </span>
                </div>
              </div>
              <button
                onClick={handleSendMessage}
                disabled={loading || !message?.trim() || selectedModels.length === 0}
                className={clsx(
                  'group relative px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 transform',
                  loading || !message?.trim() || selectedModels.length === 0
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-gray-700 to-gray-600 text-white hover:from-gray-800 hover:to-gray-700 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95'
                )}
              >
                {loading ? (
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Sending to {selectedModels.length} models...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <span>🚀</span>
                    <span>Send to All Models</span>
                    <div className="w-2 h-2 bg-white/60 rounded-full group-hover:bg-white transition-colors"></div>
                  </div>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Responses Grid */}
        {(responses.length > 0 || loading) && (
          <div className={clsx(
            "backdrop-blur-sm rounded-2xl shadow-xl border p-8 transition-all duration-300",
            darkMode 
              ? "bg-gray-800/80 border-gray-700/30" 
              : "bg-white/80 border-white/20"
          )}>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-lg">⚡</span>
              </div>
              <h2 className={clsx(
                "text-2xl font-bold",
                darkMode ? "text-white" : "text-gray-900"
              )}>AI Responses</h2>
              {bestResponse && (
                <div className="ml-auto flex items-center gap-2 bg-gradient-to-r from-green-100 to-emerald-100 px-4 py-2 rounded-full">
                  <span className="text-green-600 text-sm">🏆</span>
                  <span className="text-green-700 font-medium text-sm">Best response selected</span>
                </div>
              )}
            </div>
            
            <div className="relative">
              {/* Scroll indicator moved below header */}
              {selectedModels.length > 2 && (
                <div className="mb-4 flex justify-center">
                  <div className={clsx(
                    "px-4 py-2 rounded-full text-sm font-medium border",
                    darkMode 
                      ? "bg-gray-800/90 text-gray-300 border-gray-600" 
                      : "bg-gray-50 text-gray-600 border-gray-200"
                  )}>
                    {selectedModels.length} models • Scroll to view all
                  </div>
                </div>
              )}
              
              {/* Horizontal scroll container for responses */}
              <div 
                className="flex gap-6 overflow-x-auto pb-4 pt-6 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent"
                style={{
                  scrollbarWidth: 'thin',
                  scrollbarColor: 'rgb(156 163 175) transparent',
                  scrollBehavior: 'auto'
                }}
              >
                {selectedModels.map((modelKey) => {
                const modelConfig = AVAILABLE_MODELS[modelKey as keyof typeof AVAILABLE_MODELS];
                const response = responses.find(r => r.model === modelKey);
                const isBest = bestResponse === modelKey;

                return (
                  <div
                    key={modelKey}
                    className={clsx(
                      'relative group border-2 rounded-2xl p-6 transition-all duration-200 hover:shadow-2xl transform hover:-translate-y-1 flex-shrink-0',
                      'w-full max-w-lg min-w-[400px] h-auto', 
                      isBest 
                        ? 'border-green-400 bg-gradient-to-br from-green-50 to-emerald-50 shadow-lg shadow-green-200/50' 
                        : darkMode
                          ? 'border-gray-600 bg-gray-700/90 hover:border-gray-500'
                          : 'border-gray-200 bg-white/90 hover:border-gray-300'
                    )}
                  >
                    {/* Best Badge */}
                    {isBest && (
                      <div className="absolute -top-3 -right-3 w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                        <span className="text-white text-lg">👑</span>
                      </div>
                    )}

                    {/* Model Header */}
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className={clsx(
                          'w-10 h-10 rounded-xl flex items-center justify-center text-lg shadow-md bg-gradient-to-r',
                          modelConfig.color
                        )}>
                          <span className="text-white">{modelConfig.icon}</span>
                        </div>
                        <div>
                          <h3 className={clsx(
                            "font-bold text-lg",
                            isBest 
                              ? darkMode ? "text-gray-900" : "text-gray-900"
                              : darkMode ? "text-white" : "text-gray-900"
                          )}>{modelConfig.name}</h3>
                          <p className={clsx(
                            "text-sm",
                            isBest 
                              ? darkMode ? "text-gray-400" : "text-gray-400"
                              : darkMode ? "text-gray-200" : "text-gray-400"
                          )}>{modelConfig.company}</p>
                        </div>
                      </div>
                      {loading && !response && (
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.1s]"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                        </div>
                      )}
                    </div>

                    {/* Response Content */}
                    <div className="min-h-[300px] max-h-[600px] overflow-y-auto mb-6">
                      {loading && !response ? (
                        <div className="flex flex-col items-center justify-center h-64 space-y-4">
                          <div className={clsx(
                            'w-16 h-16 rounded-2xl flex items-center justify-center animate-pulse bg-gradient-to-r',
                            modelConfig.color
                          )}>
                            <span className="text-2xl">{modelConfig.icon}</span>
                          </div>
                          <div className="text-center">
                            <p className={clsx(
                              "font-medium",
                              darkMode ? "text-gray-300" : "text-gray-600"
                            )}>Thinking...</p>
                            <p className={clsx(
                              "text-sm",
                              darkMode ? "text-gray-500" : "text-gray-400"
                            )}>Generating response</p>
                          </div>
                        </div>
                      ) : response?.error ? (
                        <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-xl p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-red-500 text-lg">⚠️</span>
                            <p className="font-semibold text-red-700">Error occurred</p>
                          </div>
                          <p className="text-red-600 text-sm">{response.error}</p>
                        </div>
                      ) : response?.response ? (
                        <div className="prose prose-gray max-w-none">
                          <div className={clsx(
                            "whitespace-pre-wrap leading-relaxed text-sm",
                            isBest 
                              ? darkMode ? "text-gray-900 font-medium" : "text-gray-900 font-medium"
                              : darkMode ? "text-gray-200" : "text-gray-800"
                          )}>
                            {renderResponseWithCodeBlocks(response.response, darkMode, isBest, modelKey)}
                          </div>
                        </div>
                      ) : (
                        <div className={clsx(
                          "flex items-center justify-center h-64",
                          darkMode ? "text-gray-500" : "text-gray-400"
                        )}>
                          <div className="text-center space-y-2">
                            <div className={clsx(
                              "w-12 h-12 rounded-xl flex items-center justify-center mx-auto",
                              darkMode ? "bg-gray-600" : "bg-gray-100"
                            )}>
                              <span className="text-2xl">💭</span>
                            </div>
                            <p className="italic">Waiting for response...</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Response Metrics */}
                    {response?.response && (
                      <div className={clsx(
                        "flex items-center justify-between text-xs mb-4 pt-4 border-t",
                        darkMode ? "border-gray-600 text-gray-400" : "border-gray-200 text-gray-500"
                      )}>
                        <div className="flex items-center gap-4">
                          <span>📊 {response.wordCount || 0} words</span>
                          <span>⏱️ {response.responseTime || 0}ms</span>
                        </div>
                      </div>
                    )}

                    {/* Star Rating */}
                    {response?.response && (
                      <div className={clsx(
                        "flex items-center gap-2 mb-4",
                        darkMode ? "text-gray-300" : "text-gray-700"
                      )}>
                        <span className="text-sm font-medium">Rate:</span>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              onClick={() => rateResponse(modelKey, star)}
                              className={clsx(
                                "text-lg transition-all duration-200 hover:scale-110",
                                (response.rating || 0) >= star
                                  ? "text-yellow-400 hover:text-yellow-500"
                                  : darkMode
                                    ? "text-gray-600 hover:text-yellow-400"
                                    : "text-gray-300 hover:text-yellow-400"
                              )}
                            >
                              ⭐
                            </button>
                          ))}
                        </div>
                        {response.rating && (
                          <span className="text-sm ml-2">({response.rating}/5)</span>
                        )}
                      </div>
                    )}

                    {/* Action Buttons */}
                    {response?.response && (
                      <div className={clsx(
                        "flex gap-3",
                        darkMode ? "border-gray-600" : "border-gray-200"
                      )}>
                        <button
                          onClick={() => copyToClipboard(response.response!)}
                          className={clsx(
                            "flex-1 group/btn flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition-all duration-200 hover:shadow-md",
                            darkMode 
                              ? "bg-gray-600 hover:bg-gray-500 text-gray-200" 
                              : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                          )}
                        >
                          <span className="text-sm">📋</span>
                          <span className="font-medium text-sm">Copy</span>
                        </button>
                        <button
                          onClick={() => markAsBest(modelKey)}
                          className={clsx(
                            'flex-1 group/btn flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 hover:shadow-md',
                            isBest
                              ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg'
                              : darkMode
                                ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                                : 'bg-blue-100 hover:bg-blue-200 text-blue-700'
                          )}
                        >
                          <span className="text-sm">{isBest ? '👑' : '⭐'}</span>
                          <span>{isBest ? 'Best Response' : 'Mark as Best'}</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Advertisement - Bottom Banner */}
      </div>
      
      {/* History Modal */}
      {showHistory && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={clsx(
            "w-full max-w-4xl max-h-[80vh] rounded-2xl shadow-2xl overflow-hidden",
            darkMode ? "bg-gray-800" : "bg-white"
          )}>
            <div className={clsx(
              "flex items-center justify-between p-6 border-b",
              darkMode ? "border-gray-700" : "border-gray-200"
            )}>
              <h2 className={clsx(
                "text-2xl font-bold",
                darkMode ? "text-white" : "text-gray-900"
              )}>Conversation History</h2>
              <div className="flex items-center gap-3">
                {conversationHistory.length > 0 && (
                  <button
                    onClick={() => {
                      if (confirm('Are you sure you want to clear all conversation history? This action cannot be undone.')) {
                        setConversationHistory([]);
                        localStorage.removeItem('conversationHistory');
                      }
                    }}
                    className={clsx(
                      "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                      darkMode 
                        ? "bg-red-600 text-white hover:bg-red-700" 
                        : "bg-red-500 text-white hover:bg-red-600"
                    )}
                  >
                    Clear All
                  </button>
                )}
                <button
                  onClick={() => setShowHistory(false)}
                  className={clsx(
                    "w-8 h-8 rounded-full flex items-center justify-center transition-colors",
                    darkMode ? "hover:bg-gray-700 text-gray-400" : "hover:bg-gray-100 text-gray-600"
                  )}
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="p-6">
              <input
                id="history-search"
                name="historySearch"
                type="text"
                placeholder="Search conversations..."
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
                className={clsx(
                  "w-full p-3 rounded-xl border mb-4",
                  darkMode 
                    ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400" 
                    : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500"
                )}
              />
              <div className="max-h-96 overflow-y-auto space-y-3">
                {filteredHistory.length === 0 ? (
                  <div className={clsx(
                    "text-center py-8",
                    darkMode ? "text-gray-400" : "text-gray-500"
                  )}>
                    {conversationHistory.length === 0 ? "No conversations yet" : "No matching conversations"}
                  </div>
                ) : (
                  filteredHistory.map((entry) => (
                    <div
                      key={entry.id}
                      className={clsx(
                        "p-4 rounded-xl border cursor-pointer transition-all hover:shadow-md",
                        darkMode 
                          ? "bg-gray-700 border-gray-600 hover:bg-gray-600" 
                          : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                      )}
                      onClick={() => loadFromHistory(entry)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <p className={clsx(
                          "font-medium truncate flex-1 mr-4",
                          darkMode ? "text-white" : "text-gray-900"
                        )}>
                          {entry.message.substring(0, 100)}{entry.message.length > 100 ? '...' : ''}
                        </p>
                        <span className={clsx(
                          "text-xs whitespace-nowrap",
                          darkMode ? "text-gray-400" : "text-gray-500"
                        )}>
                          {entry.timestamp.toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={clsx(
                          "text-xs",
                          darkMode ? "text-gray-400" : "text-gray-500"
                        )}>
                          {entry.responses.length} models
                        </span>
                        {entry.bestResponse && (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                            👑 Best: {AVAILABLE_MODELS[entry.bestResponse as keyof typeof AVAILABLE_MODELS]?.name}
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Prompt Builder Modal */}
      {showPromptBuilder && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={clsx(
            "w-full max-w-4xl max-h-[80vh] rounded-2xl shadow-2xl overflow-hidden",
            darkMode ? "bg-gray-800" : "bg-white"
          )}>
            <div className={clsx(
              "flex items-center justify-between p-6 border-b",
              darkMode ? "border-gray-700" : "border-gray-200"
            )}>
              <h2 className={clsx(
                "text-2xl font-bold",
                darkMode ? "text-white" : "text-gray-900"
              )}>Advanced Prompt Builder</h2>
              <button
                onClick={() => setShowPromptBuilder(false)}
                className={clsx(
                  "w-8 h-8 rounded-full flex items-center justify-center transition-colors",
                  darkMode ? "hover:bg-gray-700 text-gray-400" : "hover:bg-gray-100 text-gray-600"
                )}
              >
                ✕
              </button>
            </div>
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              <div className="space-y-6">
                <div>
                  <label className={clsx(
                    "block text-sm font-medium mb-2",
                    darkMode ? "text-gray-300" : "text-gray-700"
                  )}>
                    Prompt Template
                  </label>
                  <textarea
                    id="template-prompt-input"
                    name="templatePrompt"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Enter your prompt template with variables like {{variable_name}}..."
                    className={clsx(
                      "w-full h-32 p-3 rounded-xl border resize-none",
                      darkMode 
                        ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400" 
                        : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500"
                    )}
                  />
                </div>
                
                <div>
                  <label className={clsx(
                    "block text-sm font-medium mb-2",
                    darkMode ? "text-gray-300" : "text-gray-700"
                  )}>
                    Variables
                  </label>
                  <div className="space-y-3">
                    {Object.keys(promptVariables).map((key) => (
                      <div key={key} className="flex gap-3">
                        <input
                          id={`variable-key-${key}`}
                          name={`variableKey-${key}`}
                          type="text"
                          value={key}
                          readOnly
                          className={clsx(
                            "flex-1 p-2 rounded-lg border",
                            darkMode 
                              ? "bg-gray-700 border-gray-600 text-white" 
                              : "bg-gray-50 border-gray-200 text-gray-900"
                          )}
                        />
                        <input
                          id={`variable-value-${key}`}
                          name={`variableValue-${key}`}
                          type="text"
                          value={promptVariables[key]}
                          onChange={(e) => setPromptVariables({...promptVariables, [key]: e.target.value})}
                          placeholder="Variable value"
                          className={clsx(
                            "flex-1 p-2 rounded-lg border",
                            darkMode 
                              ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400" 
                              : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500"
                          )}
                        />
                        <button
                          onClick={() => {
                            const newVars = {...promptVariables};
                            delete newVars[key];
                            setPromptVariables(newVars);
                          }}
                          className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => {
                        const newKey = `variable_${Object.keys(promptVariables).length + 1}`;
                        setPromptVariables({...promptVariables, [newKey]: ''});
                      }}
                      className={clsx(
                        "w-full p-3 rounded-lg border-2 border-dashed transition-colors",
                        darkMode 
                          ? "border-gray-600 text-gray-400 hover:border-gray-500 hover:text-gray-300" 
                          : "border-gray-300 text-gray-500 hover:border-gray-400 hover:text-gray-600"
                      )}
                    >
                      + Add Variable
                    </button>
                  </div>
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => {
                      const processed = processPromptWithVariables(message, promptVariables);
                      setMessage(processed);
                      setShowPromptBuilder(false);
                    }}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-6 rounded-xl font-medium hover:from-blue-600 hover:to-purple-700 transition-all"
                  >
                    Apply Template
                  </button>
                  <button
                    onClick={() => setShowPromptBuilder(false)}
                    className={clsx(
                      "px-6 py-3 rounded-xl font-medium transition-colors",
                      darkMode 
                        ? "bg-gray-700 text-gray-300 hover:bg-gray-600" 
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    )}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Analytics Dashboard Modal */}
      {showAnalytics && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={clsx(
            "w-full max-w-6xl max-h-[80vh] rounded-2xl shadow-2xl overflow-hidden",
            darkMode ? "bg-gray-800" : "bg-white"
          )}>
            <div className={clsx(
              "flex items-center justify-between p-6 border-b",
              darkMode ? "border-gray-700" : "border-gray-200"
            )}>
              <h2 className={clsx(
                "text-2xl font-bold",
                darkMode ? "text-white" : "text-gray-900"
              )}>Analytics Dashboard</h2>
              <button
                onClick={() => setShowAnalytics(false)}
                className={clsx(
                  "w-8 h-8 rounded-full flex items-center justify-center transition-colors",
                  darkMode ? "hover:bg-gray-700 text-gray-400" : "hover:bg-gray-100 text-gray-600"
                )}
              >
                ✕
              </button>
            </div>
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Model Performance */}
                <div className={clsx(
                  "p-4 rounded-xl border",
                  darkMode ? "bg-gray-700 border-gray-600" : "bg-gray-50 border-gray-200"
                )}>
                  <h3 className={clsx(
                    "text-lg font-semibold mb-3",
                    darkMode ? "text-white" : "text-gray-900"
                  )}>Model Performance</h3>
                  <div className="space-y-2">
                    {responses.map((response) => (
                      <div key={response.model} className="flex justify-between items-center">
                        <span className={clsx(
                          "text-sm",
                          darkMode ? "text-gray-300" : "text-gray-600"
                        )}>
                          {AVAILABLE_MODELS[response.model as keyof typeof AVAILABLE_MODELS]?.name}
                        </span>
                        <span className={clsx(
                          "text-sm font-medium",
                          response.error ? "text-red-500" : "text-green-500"
                        )}>
                          {response.error ? "Error" : "Success"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Response Times */}
                <div className={clsx(
                  "p-4 rounded-xl border",
                  darkMode ? "bg-gray-700 border-gray-600" : "bg-gray-50 border-gray-200"
                )}>
                  <h3 className={clsx(
                    "text-lg font-semibold mb-3",
                    darkMode ? "text-white" : "text-gray-900"
                  )}>Response Times</h3>
                  <div className="space-y-2">
                    {responses.map((response) => (
                      <div key={response.model} className="flex justify-between items-center">
                        <span className={clsx(
                          "text-sm",
                          darkMode ? "text-gray-300" : "text-gray-600"
                        )}>
                          {AVAILABLE_MODELS[response.model as keyof typeof AVAILABLE_MODELS]?.name}
                        </span>
                        <span className={clsx(
                          "text-sm font-medium",
                          darkMode ? "text-gray-200" : "text-gray-800"
                        )}>
                          {response.responseTime ? `${response.responseTime}ms` : "N/A"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Word Counts */}
                <div className={clsx(
                  "p-4 rounded-xl border",
                  darkMode ? "bg-gray-700 border-gray-600" : "bg-gray-50 border-gray-200"
                )}>
                  <h3 className={clsx(
                    "text-lg font-semibold mb-3",
                    darkMode ? "text-white" : "text-gray-900"
                  )}>Response Lengths</h3>
                  <div className="space-y-2">
                    {responses.map((response) => (
                      <div key={response.model} className="flex justify-between items-center">
                        <span className={clsx(
                          "text-sm",
                          darkMode ? "text-gray-300" : "text-gray-600"
                        )}>
                          {AVAILABLE_MODELS[response.model as keyof typeof AVAILABLE_MODELS]?.name}
                        </span>
                        <span className={clsx(
                          "text-sm font-medium",
                          darkMode ? "text-gray-200" : "text-gray-800"
                        )}>
                          {response.wordCount || 0} words
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Conversation Stats */}
                <div className={clsx(
                  "p-4 rounded-xl border md:col-span-2 lg:col-span-3",
                  darkMode ? "bg-gray-700 border-gray-600" : "bg-gray-50 border-gray-200"
                )}>
                  <h3 className={clsx(
                    "text-lg font-semibold mb-3",
                    darkMode ? "text-white" : "text-gray-900"
                  )}>Conversation Statistics</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className={clsx(
                        "text-2xl font-bold",
                        darkMode ? "text-blue-400" : "text-blue-600"
                      )}>
                        {conversationHistory.length}
                      </div>
                      <div className={clsx(
                        "text-sm",
                        darkMode ? "text-gray-400" : "text-gray-500"
                      )}>
                        Total Conversations
                      </div>
                    </div>
                    <div className="text-center">
                      <div className={clsx(
                        "text-2xl font-bold",
                        darkMode ? "text-green-400" : "text-green-600"
                      )}>
                        {responses.filter(r => !r.error).length}
                      </div>
                      <div className={clsx(
                        "text-sm",
                        darkMode ? "text-gray-400" : "text-gray-500"
                      )}>
                        Successful Responses
                      </div>
                    </div>
                    <div className="text-center">
                      <div className={clsx(
                        "text-2xl font-bold",
                        darkMode ? "text-red-400" : "text-red-600"
                      )}>
                        {responses.filter(r => r.error).length}
                      </div>
                      <div className={clsx(
                        "text-sm",
                        darkMode ? "text-gray-400" : "text-gray-500"
                      )}>
                        Errors
                      </div>
                    </div>
                    <div className="text-center">
                      <div className={clsx(
                        "text-2xl font-bold",
                        darkMode ? "text-purple-400" : "text-purple-600"
                      )}>
                        {Math.round(responses.reduce((acc, r) => acc + (r.responseTime || 0), 0) / responses.length) || 0}ms
                      </div>
                      <div className={clsx(
                        "text-sm",
                        darkMode ? "text-gray-400" : "text-gray-500"
                      )}>
                        Avg Response Time
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Templates Modal */}
      {showTemplates && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={clsx(
            "w-full max-w-4xl max-h-[80vh] rounded-2xl shadow-2xl overflow-hidden",
            darkMode ? "bg-gray-800" : "bg-white"
          )}>
            <div className={clsx(
              "flex items-center justify-between p-6 border-b",
              darkMode ? "border-gray-700" : "border-gray-200"
            )}>
              <h2 className={clsx(
                "text-2xl font-bold",
                darkMode ? "text-white" : "text-gray-900"
              )}>Prompt Templates</h2>
              <button
                onClick={() => setShowTemplates(false)}
                className={clsx(
                  "w-8 h-8 rounded-full flex items-center justify-center transition-colors",
                  darkMode ? "hover:bg-gray-700 text-gray-400" : "hover:bg-gray-100 text-gray-600"
                )}
              >
                ✕
              </button>
            </div>
            <div className="p-6 max-h-96 overflow-y-auto">
              <div className="grid gap-4">
                {promptTemplates.map((template) => (
                  <div
                    key={template.id}
                    className={clsx(
                      "p-4 rounded-xl border cursor-pointer transition-all hover:shadow-md",
                      darkMode 
                        ? "bg-gray-700 border-gray-600 hover:bg-gray-600" 
                        : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                    )}
                    onClick={() => handleTemplateSelect(template)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className={clsx(
                        "font-semibold",
                        darkMode ? "text-white" : "text-gray-900"
                      )}>
                        {template.name}
                      </h3>
                      <span className={clsx(
                        "text-xs px-2 py-1 rounded-full",
                        darkMode ? "bg-gray-600 text-gray-300" : "bg-gray-200 text-gray-600"
                      )}>
                        {template.category}
                      </span>
                    </div>
                    <p className={clsx(
                      "text-sm mb-3",
                      darkMode ? "text-gray-300" : "text-gray-600"
                    )}>
                      {template.description}
                    </p>
                    <p className={clsx(
                      "text-xs font-mono p-2 rounded border",
                      darkMode 
                        ? "bg-gray-800 border-gray-600 text-gray-400" 
                        : "bg-white border-gray-200 text-gray-500"
                    )}>
                      {template.template.substring(0, 150)}{template.template.length > 150 ? '...' : ''}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Export Modal */}
      {showExport && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={clsx(
            "w-full max-w-md rounded-2xl shadow-2xl",
            darkMode ? "bg-gray-800" : "bg-white"
          )}>
            <div className={clsx(
              "flex items-center justify-between p-6 border-b",
              darkMode ? "border-gray-700" : "border-gray-200"
            )}>
              <h2 className={clsx(
                "text-xl font-bold",
                darkMode ? "text-white" : "text-gray-900"
              )}>Export Results</h2>
              <button
                onClick={() => setShowExport(false)}
                className={clsx(
                  "w-8 h-8 rounded-full flex items-center justify-center transition-colors",
                  darkMode ? "hover:bg-gray-700 text-gray-400" : "hover:bg-gray-100 text-gray-600"
                )}
              >
                ✕
              </button>
            </div>
            <div className="p-6 space-y-3">
              <button
                onClick={() => exportData('json')}
                className={clsx(
                  "w-full p-4 rounded-xl border text-left transition-all hover:shadow-md",
                  darkMode 
                    ? "bg-gray-700 border-gray-600 hover:bg-gray-600 text-white" 
                    : "bg-gray-50 border-gray-200 hover:bg-gray-100 text-gray-900"
                )}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">📄</span>
                  <div>
                    <h3 className="font-semibold">JSON Format</h3>
                    <p className={clsx(
                      "text-sm",
                      darkMode ? "text-gray-400" : "text-gray-600"
                    )}>Structured data for developers</p>
                  </div>
                </div>
              </button>
              <button
                onClick={() => exportData('csv')}
                className={clsx(
                  "w-full p-4 rounded-xl border text-left transition-all hover:shadow-md",
                  darkMode 
                    ? "bg-gray-700 border-gray-600 hover:bg-gray-600 text-white" 
                    : "bg-gray-50 border-gray-200 hover:bg-gray-100 text-gray-900"
                )}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">📊</span>
                  <div>
                    <h3 className="font-semibold">CSV Format</h3>
                    <p className={clsx(
                      "text-sm",
                      darkMode ? "text-gray-400" : "text-gray-600"
                    )}>Spreadsheet compatible</p>
                  </div>
                </div>
              </button>
              <button
                onClick={() => exportData('markdown')}
                className={clsx(
                  "w-full p-4 rounded-xl border text-left transition-all hover:shadow-md",
                  darkMode 
                    ? "bg-gray-700 border-gray-600 hover:bg-gray-600 text-white" 
                    : "bg-gray-50 border-gray-200 hover:bg-gray-100 text-gray-900"
                )}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">📝</span>
                  <div>
                    <h3 className="font-semibold">Markdown Format</h3>
                    <p className={clsx(
                      "text-sm",
                      darkMode ? "text-gray-400" : "text-gray-600"
                    )}>Human-readable documentation</p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Authentication Prompt Modal */}
      {showAuthPrompt && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={clsx(
            "max-w-md w-full rounded-2xl shadow-2xl p-8 transform animate-in zoom-in-95 duration-300",
            darkMode ? "bg-gray-800 border border-gray-700" : "bg-white border border-gray-200"
          )}>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl text-white">🔐</span>
              </div>
              <h3 className={clsx(
                "text-xl font-bold mb-2",
                darkMode ? "text-white" : "text-gray-900"
              )}>
                Authentication Required
              </h3>
              <p className={clsx(
                "text-sm mb-6",
                darkMode ? "text-gray-300" : "text-gray-600"
              )}>
                Please log in to start comparing AI model responses. You&apos;ll be redirected to the login page in a moment.
              </p>
              <div className="flex items-center justify-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce [animation-delay:0.1s]"></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Insufficient Credits Modal */}
      {showInsufficientCreditsModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={clsx(
            "max-w-md w-full rounded-2xl border shadow-2xl",
            darkMode 
              ? "bg-gray-800/95 border-gray-700/50" 
              : "bg-white/95 border-gray-200/50"
          )}>
            <div className="p-6">
              {/* Header */}
              <div className="text-center mb-6">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-red-500 to-pink-500 flex items-center justify-center">
                  <span className="text-2xl">💳</span>
                </div>
                <h3 className={clsx(
                  "text-xl font-bold mb-2",
                  darkMode ? "text-white" : "text-gray-900"
                )}>
                  Insufficient Credits
                </h3>
                <p className={clsx(
                  "text-sm",
                  darkMode ? "text-gray-300" : "text-gray-600"
                )}>
                  You need more credits to use paid AI models. Free models don&apos;t require credits, but paid models cost 2 credits per comparison.
                </p>
              </div>

              {/* Credit Info */}
              <div className={clsx(
                "p-4 rounded-xl mb-6 border",
                darkMode 
                  ? "bg-gray-700/50 border-gray-600" 
                  : "bg-gray-50 border-gray-200"
              )}>
                <div className="flex items-center justify-between mb-2">
                  <span className={clsx(
                    "text-sm font-medium",
                    darkMode ? "text-gray-300" : "text-gray-700"
                  )}>
                    Current Credits
                  </span>
                  <span className={clsx(
                    "text-lg font-bold",
                    darkMode ? "text-white" : "text-gray-900"
                  )}>
                    {credits || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className={clsx(
                    "text-sm font-medium",
                    darkMode ? "text-gray-300" : "text-gray-700"
                  )}>
                    Required Credits
                  </span>
                  <span className={clsx(
                    "text-lg font-bold text-red-500"
                  )}>
                    {selectedModels.length * 2}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowInsufficientCreditsModal(false)}
                  className={clsx(
                    "flex-1 py-3 px-4 rounded-xl font-medium transition-all duration-200",
                    darkMode 
                      ? "bg-gray-700 hover:bg-gray-600 text-gray-300" 
                      : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                  )}
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowInsufficientCreditsModal(false);
                    setActiveNavItem('credits');
                  }}
                  className="flex-1 py-3 px-4 rounded-xl font-medium bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white transition-all duration-200 transform hover:scale-105 shadow-lg"
                >
                  Purchase Credits
                </button>
              </div>

              {/* Additional Info */}
              <div className={clsx(
                "mt-4 p-3 rounded-lg text-xs text-center",
                darkMode 
                  ? "bg-blue-900/20 text-blue-300" 
                  : "bg-blue-50 text-blue-600"
              )}>
                💡 Tip: Purchase credits in bulk to save money and get better rates!
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="mt-16 text-center">
        <div className={clsx(
          "inline-flex items-center gap-2 px-6 py-3 backdrop-blur-sm rounded-full border",
          darkMode 
            ? "bg-gray-800/60 border-gray-700/20" 
            : "bg-white/60 border-white/20"
        )}>
          <span className={clsx(
            "text-sm",
            darkMode ? "text-gray-400" : "text-gray-500"
          )}>Built with</span>
          <span className="text-red-500">❤️</span>
          <span className={clsx(
            "text-sm",
            darkMode ? "text-gray-400" : "text-gray-500"
          )}>using Next.js & OpenRouter</span>
        </div>
      </div>
    </div>
  );
}

// Main component with AuthProvider wrapper
export default function ModelComparison() {
  return (
    <AuthProvider>
      <ModelComparisonContent />
    </AuthProvider>
  );
}
