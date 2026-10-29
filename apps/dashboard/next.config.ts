import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  basePath: process.env.GITHUB_PAGES_BASE_PATH ?? "",
  reactStrictMode: true,
  agentRules: false,
};

export default nextConfig;
