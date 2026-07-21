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
    // argon2 native (.node) — webpack bundle qilmasin, runtime'da require qilsin.
    serverComponentsExternalPackages: ["@node-rs/argon2"],
  },
  webpack: (config) => {
    // @talantly/shared uses NodeNext ".js" import specifiers for .ts sources
    config.resolve.extensionAlias = {
      ...config.resolve.extensionAlias,
      ".js": [".ts", ".tsx", ".js"],
    };
    // "@/" alias'ni aniq beramiz — Vercel monorepo build'ida tsconfig-paths
    // aniqlanishi ishonchsiz (webapp ham shunday qiladi). "@" → apps/admin ildizi.
    config.resolve.alias = {
      ...config.resolve.alias,
      "@": fileURLToPath(new URL(".", import.meta.url)),
    };
    return config;
  },
};

export default nextConfig;
