/** @type {import('next').NextConfig} */
const nextConfig = {
  // ✅ React Compiler
  reactCompiler: true,

  // ✅ Image Optimization
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
        hostname: 'dcnyisjzvnmzweqkolqe.supabase.co',
      },
    ],
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // ✅ Strict Mode
  reactStrictMode: true,

  // ✅ Page Extensions
  pageExtensions: ['js', 'jsx', 'ts', 'tsx'],
};

export default nextConfig;