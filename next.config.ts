import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    agentFeedback: true,
    useTypeScriptCli: false,
  },
  cacheComponents: true,
  partialPrefetching: true,
};

export default nextConfig;
