import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  devIndicators: false,
  async redirects() {
    return [
      { source: '/perfil', destination: '/diagnostico/perfil', permanent: false },
      { source: '/ruta', destination: '/diagnostico/ruta', permanent: false },
    ]
  },
}

export default nextConfig
