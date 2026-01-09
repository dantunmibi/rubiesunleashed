import { Inter } from "next/font/google";
import "./globals.css";
import ToastProvider from "@/components/providers/ToastProvider";
import AuthProvider from "@/components/providers/AuthProvider";
import ThemeProvider from "@/components/providers/ThemeProvider";
import { GoogleAnalytics } from '@next/third-parties/google'
import InternalTrafficGuard from "@/components/analytics/InternalTrafficGuard";
import Script from "next/script";
import SessionErrorOverlay from "@/components/auth/SessionErrorOverlay";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  // ✅ CRITICAL: Defines the base URL for all relative links (OG images, canonicals)
  metadataBase: new URL('https://rubiesunleashed.netlify.app'),

  verification: {
    google: 'LBbxq-Qizd1DQakDQ2vUfJrd-PAV8oCJ-ufn20kaRXM',
  },
  
  title: {
    default: "Rubies Unleashed | Indie Games & App Marketplace",
    template: "%s | Rubies Unleashed"
  },
  description:
    "Discover indie games, apps, and creative digital projects on Rubies Unleashed — a curated marketplace built to showcase rising creators and hidden gems.",
  
  // ✅ Default Social Card
  openGraph: {
    title: 'Rubies Unleashed | Where New Ideas Rise',
    description: 'A creator-first marketplace to discover, publish, and support games, apps, and digital tools.',
    url: 'https://rubiesunleashed.netlify.app',
    siteName: 'Rubies Unleashed',
    images: [
      {
        url: '/rubieslogo.png',
        width: 800,
        height: 600,
        alt: 'Rubies Unleashed Logo',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Rubies Unleashed',
    description: 'Discover indie games and apps.',
    images: ['/rubieslogo.png'],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.className}>
      <head>
        {/* ✅ Block GA in development/localhost BEFORE it loads */}
        <Script id="ga-blocker" strategy="beforeInteractive">
          {`
            // Block localhost/dev traffic
            if (window.location.hostname === 'localhost' || 
                window.location.hostname === '127.0.0.1' ||
                window.location.port === '3000') {
              window['ga-disable-G-DWTBY4B7M6'] = true;
              console.log('🚫 Analytics disabled: Development environment');
            }
          `}
        </Script>
      </head>
      <body>
        <AuthProvider>
          <ThemeProvider>
            <ToastProvider>
              <InternalTrafficGuard />
              {children}
              <SessionErrorOverlay />
            </ToastProvider>
          </ThemeProvider>
        </AuthProvider>
      </body>
      {/* ✅ GA loads AFTER the guard is set */}
      <GoogleAnalytics gaId="G-DWTBY4B7M6" />
    </html>
  );
}