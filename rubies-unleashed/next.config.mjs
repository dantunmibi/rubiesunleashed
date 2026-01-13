/** @type {import('next').NextConfig} */
const nextConfig = {
  // ✅ 1. React Compiler (Moved to Top Level for Next.js 15)
  reactCompiler: true,

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

  // ✅ 4. Experimental (Empty for now, viewTransition is native)
  experimental: {
  },
  
  // ✅ ADD: Ensure proxy.js is recognized
  pageExtensions: ['js', 'jsx', 'ts', 'tsx'],
};

export default nextConfig;