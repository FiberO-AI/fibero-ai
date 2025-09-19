'use client';

import Script from 'next/script';

export default function AdSenseScript() {
  return (
    <>
      <Script
        id="adsbygoogle-init"
        strategy="afterInteractive"
        crossOrigin="anonymous"
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9108406017017093"
        onLoad={() => {
          console.log('✅ AdSense script loaded successfully');
          if (typeof window !== 'undefined') {
            const w = window as Window & { adsbygoogle?: Array<Record<string, unknown>> };
            w.adsbygoogle = w.adsbygoogle || [];
            console.log('🎯 AdSense array initialized:', w.adsbygoogle);
          }
        }}
        onError={(e) => {
          console.error('❌ AdSense script failed to load:', e);
        }}
      />
    </>
  );
}
