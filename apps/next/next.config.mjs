/** @type {import('next').NextConfig} */
export default {
  // Next.js 16's default for new apps: prerendering fails if a component reads the clock while rendering.
  cacheComponents: true,
  // Types are checked by `pnpm typecheck`, with the repo's own TypeScript.
  typescript: { ignoreBuildErrors: true },
};
