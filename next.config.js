// next.config.js
module.exports = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'pijarmontessoriislam.id',
        pathname: '/api/public/**',
      },
    ],
  },
};
