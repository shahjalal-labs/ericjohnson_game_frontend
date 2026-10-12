import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "lottie.host",
      },
      {
        protocol: "https",
        hostname: "api.zenexcloud.com",
      },
      {
        protocol: "https",
        hostname: "playspark-bucket.s3.us-east-2.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "i.ibb.co.com",
      },
      {
        protocol: "https",
        hostname: "s3.zenex.cloud",
      },
    ],
  },
};

export default nextConfig;
