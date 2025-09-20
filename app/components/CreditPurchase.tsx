'use client';

import { useState } from 'react';
import { clsx } from 'clsx';
import { useAuth } from '../../contexts/AuthContext';

interface CreditPurchaseProps {
  darkMode: boolean;
  onBack: () => void;
}

interface CreditPackage {
  id: string;
  credits: number;
  price: number;
  popular?: boolean;
  bonus?: number;
  priceId: string;
}

export default function CreditPurchase({ darkMode, onBack }: CreditPurchaseProps) {
  const { user } = useAuth();
  const [selectedPackage, setSelectedPackage] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);

  const creditPackages: CreditPackage[] = [
    {
      id: 'starter',
      credits: 100,
      price: 5,
      priceId: 'price_1S8xoNF1dDWHy4q9oxa1uWmJ'
    },
    {
      id: 'popular',
      credits: 500,
      price: 20,
      popular: true,
      bonus: 50,
      priceId: 'price_1S8xoNF1dDWHy4q9DcljxJWf'
    },
    {
      id: 'pro',
      credits: 1000,
      price: 35,
      bonus: 150,
      priceId: 'price_1S8xoNF1dDWHy4q9x0szbbsx'
    },
    {
      id: 'enterprise',
      credits: 2500,
      price: 75,
      bonus: 500,
      priceId: 'price_1S8xoNF1dDWHy4q9AwNS1wvb'
    }
  ];

  const handlePurchase = async (packageId: string) => {
    const selectedPkg = creditPackages.find(pkg => pkg.id === packageId);
    if (!selectedPkg || !user) return;

    setIsProcessing(true);
    setSelectedPackage(packageId);

    try {
      // Store purchase info in localStorage for return handling
      const purchaseInfo = {
        userId: user.uid,
        packageId: packageId,
        credits: selectedPkg.credits + (selectedPkg.bonus || 0),
        price: selectedPkg.price,
        timestamp: Date.now()
      };
      localStorage.setItem('pendingPurchase', JSON.stringify(purchaseInfo));
      
      // Store current domain for future use if needed
      // const currentDomain = window.location.origin;
      
      // Map package IDs to their specific Stripe checkout URLs
      const stripeCheckoutUrls: Record<string, string> = {
        'starter': 'https://buy.stripe.com/6oUaEX7PP7vY47P5V70kE00',    // $5
        'popular': 'https://buy.stripe.com/aFadR93zz8A247P4R30kE02',    // $20
        'pro': 'https://buy.stripe.com/7sY14n9XX03wgUB2IV0kE01',       // $35
        'enterprise': 'https://buy.stripe.com/28EaEXfih3fIfQxerD0kE03'  // $75
      };

      const baseCheckoutUrl = stripeCheckoutUrls[packageId];
      
      if (!baseCheckoutUrl) {
        throw new Error('Invalid package selected');
      }

      // Store purchase info for success page including FiberO account email
      const enhancedPurchaseInfo = {
        ...purchaseInfo,
        stripeUrl: baseCheckoutUrl,
        timestamp: Date.now(),
        processed: false,
        fiberoEmail: user.email // Store the FiberO account email
      };
      localStorage.setItem('pendingPurchase', JSON.stringify(enhancedPurchaseInfo));
      
      // Store mapping in our database for webhook to use
      const mappingData = {
        fiberoEmail: user.email,
        packageId: packageId,
        userId: user.uid,
        timestamp: Date.now()
      };
      
      // Store email mapping for webhook
      await fetch('/api/store-email-mapping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fiberoEmail: user.email,
          userId: user.uid
        })
      });
      
      // Create Stripe URL with prefilled FiberO email
      const stripeUrl = `${baseCheckoutUrl}?prefilled_email=${encodeURIComponent(user.email || '')}`;
      
      console.log('🚀 Redirecting to Stripe:', stripeUrl);
      
      // Redirect to Stripe checkout in same window
      window.location.href = stripeUrl;
      
    } catch (error) {
      console.error('Payment redirect failed:', error);
      alert('Failed to redirect to payment. Please try again.');
      setIsProcessing(false);
      setSelectedPackage('');
    }
  };

  return (
    <div className={clsx(
      "min-h-screen transition-all duration-500 ease-in-out",
      darkMode 
        ? "bg-gradient-to-br from-gray-900 via-black to-gray-800" 
        : "bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100"
    )}>
      <div className="max-w-6xl mx-auto px-4 py-8">
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
              "text-4xl font-bold",
              darkMode ? "text-white" : "text-gray-900"
            )}>
              Purchase Credits
            </h1>
            <p className={clsx(
              "text-lg mt-2",
              darkMode ? "text-gray-400" : "text-gray-600"
            )}>
              Choose a credit package to continue using Fibero AI
            </p>
          </div>
        </div>

        {/* Pricing Information */}
        <div className={clsx(
          "mb-8 p-6 rounded-2xl border",
          darkMode 
            ? "bg-gray-800/50 border-gray-700/30" 
            : "bg-white/50 border-white/20"
        )}>
          <div className="flex items-center gap-4 mb-4">
            <span className="text-3xl">💎</span>
            <div>
              <h3 className={clsx(
                "text-xl font-semibold",
                darkMode ? "text-white" : "text-gray-900"
              )}>
                How Credits Work
              </h3>
              <p className={clsx(
                "text-sm",
                darkMode ? "text-gray-400" : "text-gray-600"
              )}>
                Each prompt costs 2 credits • Credits never expire • Secure payment processing
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className={clsx(
              "flex items-center gap-2",
              darkMode ? "text-gray-300" : "text-gray-700"
            )}>
              <span className="text-green-500">✓</span>
              Compare up to 5 AI models simultaneously
            </div>
            <div className={clsx(
              "flex items-center gap-2",
              darkMode ? "text-gray-300" : "text-gray-700"
            )}>
              <span className="text-green-500">✓</span>
              Export results in multiple formats
            </div>
            <div className={clsx(
              "flex items-center gap-2",
              darkMode ? "text-gray-300" : "text-gray-700"
            )}>
              <span className="text-green-500">✓</span>
              Conversation history and templates
            </div>
          </div>
        </div>

        {/* Credit Packages */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {creditPackages.map((pkg) => (
            <div
              key={pkg.id}
              className={clsx(
                "relative p-6 rounded-2xl border transition-all duration-300 hover:scale-105 cursor-pointer",
                pkg.popular 
                  ? darkMode
                    ? "bg-gradient-to-br from-blue-600/20 to-purple-600/20 border-blue-500/50 ring-2 ring-blue-500/30"
                    : "bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200 ring-2 ring-blue-200"
                  : darkMode
                    ? "bg-gray-800/50 border-gray-700/30 hover:border-gray-600/50"
                    : "bg-white/50 border-white/20 hover:border-gray-200/50",
                selectedPackage === pkg.id && "ring-4 ring-blue-500/50"
              )}
              onClick={() => handlePurchase(pkg.id)}
            >
              {pkg.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                    MOST POPULAR
                  </div>
                </div>
              )}

              <div className="text-center">
                <div className="text-3xl mb-4">💎</div>
                <h3 className={clsx(
                  "text-xl font-bold mb-2 capitalize",
                  darkMode ? "text-white" : "text-gray-900"
                )}>
                  {pkg.id}
                </h3>
                
                <div className="mb-4">
                  <div className={clsx(
                    "text-3xl font-bold",
                    darkMode ? "text-white" : "text-gray-900"
                  )}>
                    ${pkg.price}
                  </div>
                  <div className={clsx(
                    "text-sm",
                    darkMode ? "text-gray-400" : "text-gray-600"
                  )}>
                    {pkg.credits} credits
                    {pkg.bonus && (
                      <span className="text-green-500 font-semibold">
                        {' '}+ {pkg.bonus} bonus
                      </span>
                    )}
                  </div>
                </div>

                <div className={clsx(
                  "text-sm mb-4",
                  darkMode ? "text-gray-400" : "text-gray-600"
                )}>
                  {Math.floor((pkg.credits + (pkg.bonus || 0)) / 2)} prompts
                </div>

                <button
                  disabled={isProcessing && selectedPackage === pkg.id}
                  className={clsx(
                    "w-full py-3 px-4 rounded-xl font-medium transition-all duration-200",
                    isProcessing && selectedPackage === pkg.id
                      ? "bg-gray-400 cursor-not-allowed text-gray-200"
                      : pkg.popular
                        ? "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
                        : darkMode
                          ? "bg-gray-700 hover:bg-gray-600 text-white"
                          : "bg-gray-100 hover:bg-gray-200 text-gray-900"
                  )}
                >
                  {isProcessing && selectedPackage === pkg.id ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Processing...
                    </div>
                  ) : (
                    'Purchase'
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Payment Methods */}
        <div className={clsx(
          "p-6 rounded-2xl border",
          darkMode 
            ? "bg-gray-800/50 border-gray-700/30" 
            : "bg-white/50 border-white/20"
        )}>
          <h3 className={clsx(
            "text-lg font-semibold mb-4",
            darkMode ? "text-white" : "text-gray-900"
          )}>
            Secure Payment Methods
          </h3>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">💳</span>
              <span className={clsx(
                "text-sm",
                darkMode ? "text-gray-300" : "text-gray-700"
              )}>
                Credit Card
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🔒</span>
              <span className={clsx(
                "text-sm",
                darkMode ? "text-gray-300" : "text-gray-700"
              )}>
                SSL Encrypted
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">⚡</span>
              <span className={clsx(
                "text-sm",
                darkMode ? "text-gray-300" : "text-gray-700"
              )}>
                Instant Delivery
              </span>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-8 text-center">
          <p className={clsx(
            "text-sm",
            darkMode ? "text-gray-400" : "text-gray-600"
          )}>
            Credits are added to your account immediately after purchase. 
            <br />
            Need help? Contact our support team.
          </p>
        </div>
      </div>
    </div>
  );
}
