'use client';

import { useEffect } from 'react';

interface AdSenseProps {
  adSlot: string;
  adFormat?: string;
  fullWidthResponsive?: boolean;
  style?: React.CSSProperties;
  className?: string;
}

declare global {
  interface Window {
    adsbygoogle: Array<Record<string, unknown>>;
  }
}

export default function AdSense({
  adSlot,
  adFormat = 'auto',
  fullWidthResponsive = true,
  style = { display: 'block' },
  className = ''
}: AdSenseProps) {
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        // Initialize adsbygoogle array if it doesn't exist
        window.adsbygoogle = window.adsbygoogle || [];
        
        // Wait for the element to be rendered and have dimensions
        const timer = setTimeout(() => {
          try {
            const adElement = document.querySelector(`[data-ad-slot="${adSlot}"]`);
            if (adElement && adElement.clientWidth > 0) {
              console.log('🎯 Pushing AdSense ad unit:', adSlot, 'Width:', adElement.clientWidth);
              window.adsbygoogle.push({});
            } else {
              console.log('⏳ AdSense element not ready, retrying...', adSlot);
              // Retry after a longer delay
              setTimeout(() => {
                try {
                  window.adsbygoogle.push({});
                } catch (retryError) {
                  console.error('❌ AdSense retry error:', retryError);
                }
              }, 500);
            }
          } catch (pushError) {
            console.error('❌ AdSense push error:', pushError);
          }
        }, 200);
        
        return () => clearTimeout(timer);
      }
    } catch (error) {
      console.error('❌ AdSense initialization error:', error);
    }
  }, [adSlot]);

  return (
    <div style={{ minWidth: '300px', minHeight: '250px', ...style }}>
      <ins
        className={`adsbygoogle ${className}`}
        style={{ display: 'block', width: '100%', height: '100%' }}
        data-ad-client="ca-pub-9108406017017093"
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive={fullWidthResponsive.toString()}
      />
    </div>
  );
}
