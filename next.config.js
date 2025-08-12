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

// next.config.js
module.exports = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'pijarmontessoriislam.id', pathname: '/api/uploads/**' },
    ],
  },
};

// // next.config.js
// const nextConfig = {
//   output: "export", // ⬅️ wajib untuk static export
// };

// module.exports = nextConfig;