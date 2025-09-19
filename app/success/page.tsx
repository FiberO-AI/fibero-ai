'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';

export default function PaymentSuccess() {
  const { user, addCredits } = useAuth();
  const router = useRouter();
  const [processing, setProcessing] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const processPurchase = async () => {
      try {
        // Get pending purchase info from localStorage
        const pendingPurchaseStr = localStorage.getItem('pendingPurchase');
        if (!pendingPurchaseStr) {
          setError('No pending purchase found');
          setProcessing(false);
          return;
        }

        const pendingPurchase = JSON.parse(pendingPurchaseStr);
        
        // Verify user matches
        if (!user || user.uid !== pendingPurchase.userId) {
          setError('User verification failed');
          setProcessing(false);
          return;
        }

        // Add credits to user account
        await addCredits(pendingPurchase.credits);
        
        // Clear pending purchase
        localStorage.removeItem('pendingPurchase');
        
        setSuccess(true);
        setProcessing(false);

        // Redirect to main app after 3 seconds
        setTimeout(() => {
          router.push('/');
        }, 3000);

      } catch (err) {
        console.error('Error processing purchase:', err);
        setError('Failed to process purchase. Please contact support.');
        setProcessing(false);
      }
    };

    if (user) {
      processPurchase();
    }
  }, [user, addCredits, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        {processing && (
          <>
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Processing Payment</h1>
            <p className="text-gray-600">Please wait while we add credits to your account...</p>
          </>
        )}

        {success && (
          <>
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-white text-2xl">✓</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Payment Successful!</h1>
            <p className="text-gray-600 mb-6">
              Your credits have been added to your account. You'll be redirected to the main app shortly.
            </p>
            <button
              onClick={() => router.push('/')}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl font-medium transition-colors"
            >
              Continue to App
            </button>
          </>
        )}

        {error && (
          <>
            <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-white text-2xl">✗</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Payment Error</h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="flex gap-4">
              <button
                onClick={() => router.push('/')}
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-4 py-3 rounded-xl font-medium transition-colors"
              >
                Go Home
              </button>
              <button
                onClick={() => window.location.reload()}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-3 rounded-xl font-medium transition-colors"
              >
                Retry
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
