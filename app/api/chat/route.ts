import { NextRequest, NextResponse } from 'next/server';
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
// import { adminAuth, adminDb } from '../../../lib/firebase-optimized';
// import { chatRateLimiter } from '../../../lib/rate-limiter';

// Cache for user credits to reduce Firebase calls
// const creditsCache = new Map<string, { credits: number; lastUpdated: number }>();
// const CACHE_DURATION = 30000; // 30 seconds

// Initialize Firebase (server-side) - using same config as client
const firebaseConfig = {
  apiKey: "AIzaSyDFbJ3PEuj1Ox3SFQnDPVhTnO5ThYP9png",
  authDomain: "fibero-ai.firebaseapp.com",
  projectId: "fibero-ai",
  storageBucket: "fibero-ai.firebasestorage.app",
  messagingSenderId: "168872341070",
  appId: "1:168872341070:web:041e06d59de7ec7cacdd1f"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1/chat/completions';

// Model configurations for the supported AI models
interface ModelConfig {
  name: string;
  model: string;
  maxTokens: number;
  free?: boolean;
}

const MODEL_CONFIGS: Record<string, ModelConfig> = {
  'gpt-4o': {
    name: 'GPT-4o',
    model: 'openai/gpt-4o',
    maxTokens: 4000
  },
  'claude-3.5-sonnet': {
    name: 'Claude 3.5 Sonnet',
    model: 'anthropic/claude-3.5-sonnet',
    maxTokens: 4000
  },
  'gemini-2.0-flash': {
    name: 'Gemini 2.0 Flash',
    model: 'google/gemini-2.0-flash-exp',
    maxTokens: 4000
  },
  'deepseek-v3': {
    name: 'DeepSeek V3',
    model: 'deepseek/deepseek-v3',
    maxTokens: 4000
  },
  'perplexity-sonar': {
    name: 'Perplexity Sonar',
    model: 'perplexity/llama-3.1-sonar-large-128k-online',
    maxTokens: 4000
  },
  // FREE MODELS - 2025 Latest
  'deepseek/deepseek-chat-v3.1:free': {
    name: 'DeepSeek V3.1',
    model: 'deepseek/deepseek-chat-v3.1:free',
    maxTokens: 3000,
    free: true
  },
  'deepseek/deepseek-r1:free': {
    name: 'DeepSeek R1',
    model: 'deepseek/deepseek-r1:free',
    maxTokens: 3000,
    free: true
  },
  'qwen/qwen-2.5-coder-32b-instruct:free': {
    name: 'Qwen 2.5 Coder 32B',
    model: 'qwen/qwen-2.5-coder-32b-instruct:free',
    maxTokens: 3000,
    free: true
  },
  'google/gemini-2.0-flash-exp:free': {
    name: 'Gemini 2.0 Flash Exp',
    model: 'google/gemini-2.0-flash-exp:free',
    maxTokens: 3000,
    free: true
  },
  'meta-llama/llama-3.1-405b-instruct:free': {
    name: 'Llama 3.1 405B',
    model: 'meta-llama/llama-3.1-405b-instruct:free',
    maxTokens: 3000,
    free: true
  },
  'meta-llama/llama-4-maverick:free': {
    name: 'Llama 4 Maverick',
    model: 'meta-llama/llama-4-maverick:free',
    maxTokens: 3000,
    free: true
  },
  'mistralai/mistral-small-3.2-24b-instruct:free': {
    name: 'Mistral Small 3.2',
    model: 'mistralai/mistral-small-3.2-24b-instruct:free',
    maxTokens: 3000,
    free: true
  },
  'huggingface/meta-llama/llama-3.2-3b-instruct:free': {
    name: 'Llama 3.2 3B Instruct',
    model: 'huggingface/meta-llama/llama-3.2-3b-instruct:free',
    maxTokens: 3000,
    free: true
  },
  'qwen/qwen-2.5-72b-instruct:free': {
    name: 'Qwen 2.5 72B',
    model: 'qwen/qwen-2.5-72b-instruct:free',
    maxTokens: 3000,
    free: true
  },
  'nvidia/nemotron-nano-9b-v2:free': {
    name: 'Nemotron Nano 9B V2',
    model: 'nvidia/nemotron-nano-9b-v2:free',
    maxTokens: 3000,
    free: true
  },
  'google/gemma-3-27b-it:free': {
    name: 'Gemma 3 27B',
    model: 'google/gemma-3-27b-it:free',
    maxTokens: 3000,
    free: true
  },
  'meta-llama/llama-3.3-70b-instruct:free': {
    name: 'Llama 3.3 70B',
    model: 'meta-llama/llama-3.3-70b-instruct:free',
    maxTokens: 3000,
    free: true
  },
  'microsoft/mai-ds-r1:free': {
    name: 'MAI DS R1',
    model: 'microsoft/mai-ds-r1:free',
    maxTokens: 3000,
    free: true
  }
};

// Helper function to deduct credits with fallback
async function deductUserCredits(userId: string, amount: number): Promise<boolean> {
  try {
    console.log('Attempting to deduct credits for user:', userId, 'amount:', amount);
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);
    
    if (!userDoc.exists()) {
      console.log('User document does not exist, creating with 10 free credits');
      // Create user document with 10 free credits if it doesn't exist
      await setDoc(userDocRef, {
        credits: 10,
        createdAt: new Date(),
        totalCreditsUsed: 0,
        totalCreditsPurchased: 0
      });
      
      // Now check if we can deduct from the initial 10 credits
      if (10 < amount) {
        console.log('Insufficient credits even with initial 10. Required:', amount);
        return false;
      }
      
      // Deduct from the initial credits
      await updateDoc(userDocRef, {
        credits: 10 - amount,
        totalCreditsUsed: amount,
        lastUsed: new Date()
      });
      
      console.log('Credits deducted from new account. New balance:', 10 - amount);
      return true;
    }

    const userData = userDoc.data();
    const currentCredits = userData.credits || 0;
    console.log('Current credits for user:', currentCredits);
    
    if (currentCredits < amount) {
      console.log('Insufficient credits. Required:', amount, 'Available:', currentCredits);
      return false; // Insufficient credits
    }

    await updateDoc(userDocRef, {
      credits: currentCredits - amount,
      totalCreditsUsed: (userData.totalCreditsUsed || 0) + amount,
      lastUsed: new Date()
    });

    console.log('Credits deducted successfully. New balance:', currentCredits - amount);
    return true;
  } catch (error) {
    console.error('Firestore error, using fallback credit system:', error);
    
    // Fallback: Use a simple in-memory credit system for development
    // In production, you'd want to use a more robust fallback like Redis
    const globalAny = global as { userCredits?: Record<string, number> };
    if (!globalAny.userCredits) {
      globalAny.userCredits = {};
    }
    
    // Initialize new user with 10 credits if not exists
    if (!globalAny.userCredits[userId]) {
      console.log('Initializing fallback credits for new user');
      globalAny.userCredits[userId] = 10;
    }
    
    const currentCredits = globalAny.userCredits[userId];
    console.log('Fallback - Current credits for user:', currentCredits);
    
    if (currentCredits < amount) {
      console.log('Fallback - Insufficient credits. Required:', amount, 'Available:', currentCredits);
      return false;
    }
    
    globalAny.userCredits[userId] -= amount;
    console.log('Fallback - Credits deducted. New balance:', globalAny.userCredits[userId]);
    return true;
  }
}

export async function POST(request: NextRequest) {
  console.log('=== API Route Called ===');
  try {
    if (!OPENROUTER_API_KEY) {
      console.log('OpenRouter API key not configured');
      return NextResponse.json(
        { error: 'OpenRouter API key not configured' },
        { status: 500 }
      );
    }

    console.log('Parsing request body...');
    const { prompt, models, userId } = await request.json();
    console.log('Request parsed - userId:', userId, 'models:', models?.length, 'prompt length:', prompt?.length);

    if (!prompt || !models || !Array.isArray(models)) {
      return NextResponse.json(
        { error: 'Invalid request: prompt and models array required' },
        { status: 400 }
      );
    }

    // Check if user is authenticated and has sufficient credits
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check if any paid models are selected
    const paidModels = models.filter((modelKey: string) => {
      const config = MODEL_CONFIGS[modelKey as keyof typeof MODEL_CONFIGS];
      return config && !config.free;
    });
    
    // Only deduct credits if paid models are selected
    if (paidModels.length > 0) {
      console.log('Paid models detected:', paidModels, 'About to deduct credits for user:', userId);
      const creditsDeducted = await deductUserCredits(userId, 2);
      if (!creditsDeducted) {
        console.log('Credit deduction failed for user:', userId);
        return NextResponse.json(
          { error: 'Insufficient credits. Please purchase more credits to continue.' },
          { status: 402 }
        );
      }
      console.log('Credits successfully deducted, proceeding with API calls');
    } else {
      console.log('Only free models selected, no credit deduction needed');
    }

    // Create promises for all model requests
    const modelPromises = models.map(async (modelKey: string) => {
      const config = MODEL_CONFIGS[modelKey as keyof typeof MODEL_CONFIGS];
      if (!config) {
        return {
          model: modelKey,
          error: 'Model not supported',
          response: null
        };
      }

      try {
        const response = await fetch(OPENROUTER_BASE_URL, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
            'X-Title': 'Fibero AI Comparison'
          },
          body: JSON.stringify({
            model: config.model,
            messages: [
              {
                role: 'user',
                content: prompt
              }
            ],
            max_tokens: config.maxTokens,
            temperature: 0.7
          })
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error?.message || `HTTP ${response.status}`);
        }

        const data = await response.json();
        const aiResponse = data.choices?.[0]?.message?.content || 'No response generated';

        return {
          model: modelKey,
          modelName: config.name,
          response: aiResponse,
          error: null
        };
      } catch (error) {
        return {
          model: modelKey,
          modelName: config.name,
          error: error instanceof Error ? error.message : 'Unknown error',
          response: null
        };
      }
    });

    // Wait for all model requests to complete
    const results = await Promise.all(modelPromises);
    console.log('API calls completed, returning results');

    return NextResponse.json({
      success: true,
      results
    });

  } catch (error) {
    console.error('Error in chat API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
