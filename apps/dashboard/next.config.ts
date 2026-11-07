import type { NextConfig } from "next";

const pagesBasePath = process.env.PAGES_BASE_PATH?.trim().replace(
  /^\/+|\/+$/g,
  "",
);

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  reactStrictMode: true,
  agentRules: false,
  basePath: pagesBasePath ? `/${pagesBasePath}` : "",
};

export default nextConfig;
