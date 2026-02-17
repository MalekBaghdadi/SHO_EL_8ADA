/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    images: {
        unoptimized: true, // Optimized for static export or simple Vercel deployments
    },
}

module.exports = nextConfig
