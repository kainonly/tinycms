/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/admin',
        destination: '/admin/overview',
        permanent: false
      },
      {
        source: '/admin/:slug',
        destination: '/admin/:slug/_',
        permanent: false
      }
    ];
  },
  experimental: {
    serverComponentsExternalPackages: ['@node-rs/argon2']
  }
};

export default nextConfig;
