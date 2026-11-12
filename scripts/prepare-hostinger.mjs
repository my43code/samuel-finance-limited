import { cp, mkdir, rm, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

export const root = fileURLToPath(new URL("../", import.meta.url));
export const project = path.join(root, "outputs", "hostinger");
export async function prepareHostinger() {
  if (path.dirname(project) !== path.join(root, "outputs"))
    throw new Error("Unexpected build directory.");
  await mkdir(project, { recursive: true });
  for (const folder of ["app", "components", "lib"]) {
    const target = path.join(project, folder);
    if (path.dirname(target) !== project)
      throw new Error("Unexpected source directory.");
    await rm(target, { recursive: true, force: true });
    await cp(path.join(root, "web", folder), target, { recursive: true });
  }
  await cp(path.join(root, "web", "proxy.js"), path.join(project, "proxy.js"));
  await cp(path.join(root, "public"), path.join(project, "public"), {
    recursive: true,
  });
  await writeFile(
    path.join(project, "package.json"),
    JSON.stringify({ private: true }),
  );
  await writeFile(
    path.join(project, "next.config.js"),
    `module.exports = {
    output: 'standalone',
    experimental: { proxyClientMaxBodySize: '55mb' },
    outputFileTracingRoot: ${JSON.stringify(root)},
    async headers() { return [
      { source: '/:path*', headers: [
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
      ] },
      { source: '/admin/:path*', headers: [
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'Cache-Control', value: 'private, no-store' },
        { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
      ] },
    ]; },
  };\n`,
  );
}
