import { Inter } from "next/font/google";
import "./globals.css";
import ToastProvider from "@/components/providers/ToastProvider";
import AuthProvider from "@/components/providers/AuthProvider";
import ThemeProvider from "@/components/providers/ThemeProvider";
import { GoogleAnalytics } from '@next/third-parties/google'
import InternalTrafficGuard from "@/components/analytics/InternalTrafficGuard";
import Script from "next/script";
import SessionErrorOverlay from "@/components/ui/SessionErrorOverlay";
import { generateOrganizationSchema, generateWebSiteSchema, BRAND } from "@/lib/seo-utils";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  metadataBase: new URL('https://rubiesunleashed.netlify.app'),

  verification: {
    google: 'LBbxq-Qizd1DQakDQ2vUfJrd-PAV8oCJ-ufn20kaRXM',
  },
  
  title: {
    default: `${BRAND.name} | Indie Games & App Marketplace`,
    template: `%s | ${BRAND.name}`
  },
  description: "A launchpad for indie games, apps, and digital creators. Building a home for rising games, apps, and digital creations.",
  
  openGraph: {
    title: `${BRAND.name} | ${BRAND.slogan}`,
    description: "A creator-first platform where independent developers publish, showcase, and share their digital projects with a global audience.",
    url: BRAND.url,
    siteName: BRAND.name,
    images: [
      {
        url: '/rubieslogo.png',
        width: 800,
        height: 600,
        alt: `${BRAND.name} Logo - Where New Ideas Rise`,
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: `${BRAND.name} | ${BRAND.slogan}`,
    description: "Building a home for rising games, apps, and digital creations.",
    images: ['/rubieslogo.png'],
  },
  
  alternates: {
    canonical: '/',
  },
};

export default function RootLayout({ children }) {
  // Generate schemas for homepage
  const organizationSchema = generateOrganizationSchema();
  const websiteSchema = generateWebSiteSchema();

  return (
    <html lang="en" className={inter.className}>
      <head>
        {/* ✅ Organization Schema (Critical for Brand Recognition) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />

        {/* ✅ WebSite Schema (Enables Search in AI) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />

        {/* GA Blocker */}
        <Script id="ga-blocker" strategy="beforeInteractive">
          {`
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
      <GoogleAnalytics gaId="G-DWTBY4B7M6" />
    </html>
  );
}