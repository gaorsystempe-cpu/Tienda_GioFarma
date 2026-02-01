/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['baltodano.facturaclic.pe'],
  },
  // Configuración para usar con Vercel Cron
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
}

module.exports = nextConfig
