import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    "/*": ["./prisma/dev.db"],
  },
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
