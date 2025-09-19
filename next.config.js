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
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.googlesyndication.com https://*.googleadservices.com https://*.googletagservices.com https://*.doubleclick.net https://*.google.com https://*.gstatic.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://*.googlesyndication.com",
              "img-src 'self' blob: data: https://*.googlesyndication.com https://*.google.com https://*.doubleclick.net https://*.gstatic.com https://*.googleusercontent.com",
              "font-src 'self' https://fonts.gstatic.com https://*.gstatic.com",
              "connect-src 'self' https://*.googlesyndication.com https://identitytoolkit.googleapis.com https://firestore.googleapis.com https://*.google.com https://*.doubleclick.net https://*.googleadservices.com https://*.adnxs.com https://ep1.adtrafficquality.google https://ep2.adtrafficquality.google",
              "frame-src 'self' https://*.doubleclick.net https://*.google.com https://*.googlesyndication.com https://*.googletagservices.com",
              "object-src 'none'",
            ].join('; '),
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig
