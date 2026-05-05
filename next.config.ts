import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/q/:slug*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "frame-src 'self' https://www.youtube.com https://player.vimeo.com https://www.youtube-nocookie.com https://vturb.com.br https://cdn.pandavideo.com https://*.pandavideo.com;",
          },
        ],
      },
    ]
  },
}

export default nextConfig;