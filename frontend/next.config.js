/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['cdn.discordapp.com', 'avatars.githubusercontent.com'],
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
  // Désactiver complètement le prerendering pour éviter les erreurs SSR
  output: 'standalone',
  // Forcer le rendu dynamique pour toutes les pages
  serverExternalPackages: ['@prisma/client'],
}

module.exports = nextConfig
