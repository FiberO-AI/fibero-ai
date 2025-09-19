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
        
        // Wait a bit for the AdSense script to load
        const timer = setTimeout(() => {
          try {
            console.log('🎯 Pushing AdSense ad unit:', adSlot);
            window.adsbygoogle.push({});
          } catch (pushError) {
            console.error('❌ AdSense push error:', pushError);
          }
        }, 100);
        
        return () => clearTimeout(timer);
      }
    } catch (error) {
      console.error('❌ AdSense initialization error:', error);
    }
  }, [adSlot]);

  return (
    <ins
      className={`adsbygoogle ${className}`}
      style={style}
      data-ad-client="ca-pub-9108406017017093"
      data-ad-slot={adSlot}
      data-ad-format={adFormat}
      data-full-width-responsive={fullWidthResponsive.toString()}
    />
  );
}
