/** @type {import('next').NextConfig} */
const nextConfig = {
  // ✅ 1. Enable React Compiler (Next.js 15+)
  experimental: {
    reactCompiler: true,
    // Note: 'viewTransition' flag is no longer required in Next.js 15 
    // as it is now supported natively via CSS and React 19 Actions.
  },

  // ✅ 2. Image Optimization (CRITICAL for Blogger CMS)
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'blogger.googleusercontent.com', // Primary Image Host
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',     // Secondary Google Host
      },
      {
        protocol: 'https',
        hostname: 'img.youtube.com',               // Video Thumbnails
      },
    ],
    // Dangerously allow SVG if needed for badges, though Lucide is safer
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // ✅ 3. Strict React Mode
  reactStrictMode: true,
};

export default nextConfig;