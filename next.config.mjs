const nextConfig = {
  /* config options here */
  images: {
    unoptimized: true, // Disable image optimization for static export
  },
  webpack: (config) => {
    config.module.rules.push({
      test: /HeartbeatWorker.*\.js$/,
      type: 'javascript/auto',
    });
    return config;
  },
};

export default nextConfig; 