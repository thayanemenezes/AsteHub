import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  reactStrictMode: true,
  agentRules: false,
  basePath: '/AsteHub', 
};

export default nextConfig;
