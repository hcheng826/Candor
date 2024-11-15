const nextConfig = {
  experimental: {
    optimizePackageImports: ["@chakra-ui/react"],
  },
  output: "export",
  images: {
    unoptimized: true,
  },
  webpack: (config, { isServer }) => {
    // Handle Pino browser bundling
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      pino: false,
      "pino-pretty": false,
    };

    // // Optionally provide empty implementations
    // config.plugins.push(
    //   new webpack.ProvidePlugin({
    //     pino: ["pino/browser", "default"],
    //   })
    // );
    return config;
  },
};

export default nextConfig;
