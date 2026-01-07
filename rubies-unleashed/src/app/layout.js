import { Inter } from "next/font/google";
import "./globals.css";
import ToastProvider from "@/components/providers/ToastProvider";
import AuthProvider from "@/components/providers/AuthProvider";
import ThemeProvider from "@/components/providers/ThemeProvider";
import { GoogleAnalytics } from '@next/third-parties/google'

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  // ✅ CRITICAL: Defines the base URL for all relative links (OG images, canonicals)
  metadataBase: new URL('https://rubiesunleashed.netlify.app'),
  
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
        url: '/rubieslogo.png', // Resolves to https://rubiesunleashed.netlify.app/rulogo.png
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
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider> {/* ✅ Outer Wrap */}
          <ThemeProvider> {/* ✅ Inner Wrap */}
            <ToastProvider>
              {children}
            </ToastProvider>
          </ThemeProvider>
        </AuthProvider>
      </body>
      <GoogleAnalytics gaId="G-DWTBY4B7M6" />
    </html>
  );
}