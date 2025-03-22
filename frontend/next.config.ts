import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ['**'],
  },
  env: {
    MEAL_SERVICE_DOMAIN: process.env.MEAL_SERVICE_DOMAIN,
    MEAL_SERVICE_PORT: process.env.MEAL_SERVICE_PORT,
},
};

export default nextConfig;
