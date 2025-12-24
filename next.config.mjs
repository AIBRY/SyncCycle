/** @type {import('next').NextConfig} */
const nextConfig = {
  /* Next.js 14+ enables the App Router by default. 
     We ensure strict mode is on for better development debugging.
  */
  reactStrictMode: true,

  /* If you use Supabase Storage for user avatars or receipts, 
     you must whitelist the Supabase domain here.
  */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },

  /* Optional: If you still have some legacy code using 'process.env' 
     without the NEXT_PUBLIC prefix, you can map them here, 
     though we recommend sticking to the prefix method.
  */
  env: {
    APP_VERSION: '1.0.0',
  },
};

export default nextConfig;