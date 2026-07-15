/** @type {import('next').NextConfig} */

// GitHub Pages serves the app from a repository subpath
// (https://USER.github.io/<repo>/). The Actions workflow sets PAGES_BASE_PATH
// to "/<repo>" at build time. It is left empty for local dev / `npm run build`,
// so no base path is applied during local development.
const basePath = process.env.PAGES_BASE_PATH || "";

const nextConfig = {
  // Emit a fully static site into `out/` for GitHub Pages.
  output: "export",
  // Export each route as <route>/index.html — plays nicely with GitHub Pages.
  trailingSlash: true,
  // GitHub Pages has no image optimization server.
  images: { unoptimized: true },
  // Apply the repo subpath only when provided (production Pages build).
  basePath: basePath || undefined,
  assetPrefix: basePath || undefined,
  // Expose the base path to client code if ever needed.
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
};

export default nextConfig;
