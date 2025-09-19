import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { AuthProvider } from "../contexts/AuthContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Fibero AI - Model Comparison",
  description: "Compare AI model responses side by side",
  verification: {
    google: "your-google-site-verification-code-here"
  },
  other: {
    "google-adsense-account": "ca-pub-9108406017017093"
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9108406017017093"
          crossOrigin="anonymous"
          strategy="afterInteractive"
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
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
