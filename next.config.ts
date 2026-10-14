import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    // 90 for the GeoLift screens' small text (CaseDeck)
    qualities: [75, 90],
  },
}

export default nextConfig
