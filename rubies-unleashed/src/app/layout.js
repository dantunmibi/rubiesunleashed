import { Inter } from "next/font/google";
import "./globals.css";
import ToastProvider from "@/components/providers/ToastProvider";
import AuthProvider from "@/components/providers/AuthProvider";
import ThemeProvider from "@/components/providers/ThemeProvider";
import { GoogleAnalytics } from '@next/third-parties/google'
import InternalTrafficGuard from "@/components/analytics/InternalTrafficGuard";
import Script from "next/script";
import SessionErrorOverlay from "@/components/ui/SessionErrorOverlay";

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
    "Discover indie games, apps, and creative digital projects on Rubies Unleashed. A curated marketplace showcasing rising creators and hidden gems.",
  
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
    title: 'Rubies Unleashed | Where New Ideas Rise',
    description:
      "Discover indie games, apps, and tools from rising creators on Rubies Unleashed.",
    images: ['/rubieslogo.png'],
  },
  
    // Optional: canonical URL fallback
  alternates: {
    canonical: '/',
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
        <meta name="blogarama-site-verification" content="blogarama-6b2bba5a-d0dd-423a-b697-fe4c28e64bb3" />
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