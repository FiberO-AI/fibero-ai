'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function PaymentCancel() {
  const router = useRouter();

  useEffect(() => {
    // Clear any pending purchase data
    localStorage.removeItem('pendingPurchase');
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-white text-2xl">⚠</span>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Payment Cancelled</h1>
        
        <p className="text-gray-600 mb-6">
          Your payment was cancelled. No charges were made to your account.
        </p>
        
        <div className="flex gap-4">
          <button
            onClick={() => router.push('/')}
            className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-4 py-3 rounded-xl font-medium transition-colors"
          >
            Go Home
          </button>
          <button
            onClick={() => {
              router.push('/');
              // Navigate to credits page after a short delay
              setTimeout(() => {
                // This will trigger the credits purchase modal
                window.dispatchEvent(new CustomEvent('openCredits'));
              }, 100);
            }}
            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-3 rounded-xl font-medium transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    </div>
  );
}
