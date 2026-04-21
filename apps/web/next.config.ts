import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Réduit l’UI de dev (badge route / Turbopack) — n’affecte pas la prod */
  devIndicators: false,
};

export default nextConfig;
