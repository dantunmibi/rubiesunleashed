/** @type {import('next').NextConfig} */
const nextConfig = {
  // ✅ REMOVED: output: 'export' (using Netlify SSR instead)

  // ✅ React Compiler
  reactCompiler: true,

  // ✅ Image Optimization (Re-enabled)
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'blogger.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'img.youtube.com',
      },
      {
        protocol: 'https',
        hostname: 'dcnyisjzvnmzweqkolqe.supabase.co', // Supabase Storage
      },
    ],
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // ✅ Strict Mode
  reactStrictMode: true,

  // ✅ Experimental Features
  experimental: {},
  
  // ✅ Page Extensions
  pageExtensions: ['js', 'jsx', 'ts', 'tsx'],
};

export default nextConfig;