/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // @mendable/firecrawl-js depends on undici, which Next's webpack bundler
  // tries (and fails) to resolve when bundling the server build. Marking
  // the package as external tells Next to leave it out of the bundle and
  // resolve it normally via node_modules at runtime instead — the standard
  // fix for this class of "Module not found: Can't resolve 'undici'" error
  // with server-only Node SDKs. This key lives under `experimental` in
  // Next.js 14.x; it moves to a top-level `serverExternalPackages` option
  // in Next.js 15+.
  experimental: {
    serverComponentsExternalPackages: ["@mendable/firecrawl-js"],
  },
};

module.exports = nextConfig;