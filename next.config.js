/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  // `pg` (node-postgres) is used for the local Docker database when
  // USE_LOCAL_DB=true; keep it external so webpack never tries to bundle it.
  experimental: {
    serverComponentsExternalPackages: ["pg"],
  },
};

module.exports = nextConfig;
