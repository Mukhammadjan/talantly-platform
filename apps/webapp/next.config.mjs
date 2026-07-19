import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

// Local dev/start: env lives in the monorepo root .env (Vercel injects its own)
const rootEnvPath = fileURLToPath(new URL("../../.env", import.meta.url));
if (existsSync(rootEnvPath)) {
  dotenv.config({ path: rootEnvPath });
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@talantly/shared"],
  experimental: {
    // Deploy hook: har deploy'da bot menu ?v=SHA avto-yangilanadi (spec §8)
    instrumentationHook: true,
  },
  // HR/Admin paneli (apps/hr, basePath /panel) — bitta domenda proksi.
  async rewrites() {
    return [
      {
        source: "/panel/:path*",
        destination: "https://talantly-hr.vercel.app/panel/:path*",
      },
    ];
  },
  async redirects() {
    return [
      { source: "/admin", destination: "/panel/admin", permanent: false },
      {
        source: "/admin/:path*",
        destination: "/panel/admin/:path*",
        permanent: false,
      },
    ];
  },
  webpack: (config) => {
    // @talantly/shared uses NodeNext ".js" import specifiers for .ts sources
    config.resolve.extensionAlias = {
      ...config.resolve.extensionAlias,
      ".js": [".ts", ".tsx", ".js"],
    };
    // Resolve the "@/" alias explicitly so it does not depend on tsconfig-paths
    // detection, which is unreliable in Vercel's monorepo build environment.
    config.resolve.alias = {
      ...config.resolve.alias,
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    };
    return config;
  },
};

export default nextConfig;
