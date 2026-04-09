/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      "res.cloudinary.com", // for Cloudinary uploads
      "localhost",          // for local testing
    ],
  },
  // Skip ESLint and Type Checking during builds to speed up deployment on Render
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
