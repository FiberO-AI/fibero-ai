/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://pagead2.googlesyndication.com https://partner.googleadservices.com https://www.googletagservices.com https://securepubads.g.doubleclick.net https://tpc.googlesyndication.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "img-src 'self' blob: data: https://pagead2.googlesyndication.com https://www.google.com https://www.google.co.uk https://googleads.g.doubleclick.net https://securepubads.g.doubleclick.net https://tpc.googlesyndication.com",
              "font-src 'self' https://fonts.gstatic.com",
              "connect-src 'self' https://pagead2.googlesyndication.com https://identitytoolkit.googleapis.com https://firestore.googleapis.com https://ep1.adtrafficquality.google https://ep2.adtrafficquality.google https://securepubads.g.doubleclick.net https://googleads.g.doubleclick.net https://www.google.com https://www.google.co.uk",
              "frame-src 'self' https://googleads.g.doubleclick.net https://www.google.com https://securepubads.g.doubleclick.net https://tpc.googlesyndication.com",
            ].join('; '),
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig
