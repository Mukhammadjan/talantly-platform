import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

const rootEnvPath = fileURLToPath(new URL("../../.env", import.meta.url));
if (existsSync(rootEnvPath)) dotenv.config({ path: rootEnvPath });

/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: "/panel",
  env: { NEXT_PUBLIC_BASE_PATH: "/panel" },
  // Eski root URL'lar (talantly-hr.vercel.app/) panelga yo'naltiriladi.
  async redirects() {
    return [
      {
        source: "/",
        destination: "/panel/nomzodlar",
        basePath: false,
        permanent: false,
      },
    ];
  },
  reactStrictMode: true,
  transpilePackages: ["@talantly/shared"],
  webpack: (config) => {
    config.resolve.extensionAlias = {
      ...config.resolve.extensionAlias,
      ".js": [".ts", ".tsx", ".js"],
    };
    config.resolve.alias = {
      ...config.resolve.alias,
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    };
    return config;
  },
};

export default nextConfig;
