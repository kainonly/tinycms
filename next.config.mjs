/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/dashboard',
        destination: '/dashboard/index',
        permanent: true
      }
    ];
  },
  experimental: {
    serverComponentsExternalPackages: ['@node-rs/argon2']
  }
};

export default nextConfig;
