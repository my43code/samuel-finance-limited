import { access, cp, rm, writeFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { prepareHostinger, root, project } from "./prepare-hostinger.mjs";

await prepareHostinger();
const result = spawnSync(
  process.execPath,
  [
    path.join(root, "node_modules/next/dist/bin/next"),
    "build",
    project,
    "--webpack",
  ],
  {
    cwd: root,
    stdio: "inherit",
    env: { ...process.env, NEXT_TELEMETRY_DISABLED: "1" },
  },
);
if (result.error) throw result.error;
if (result.status !== 0) process.exit(result.status ?? 1);

const build = path.join(project, ".next");
const target = path.join(root, ".next");
if (path.dirname(target) !== root.replace(/[\\/]$/, ""))
  throw new Error("Unexpected deployment directory.");
await rm(target, { recursive: true, force: true });
await cp(build, target, {
  recursive: true,
  filter: (source) =>
    !path.relative(build, source).split(path.sep).includes("cache"),
});
const staticExport = path.join(root, "out");
if (path.dirname(staticExport) !== root.replace(/[\\/]$/, ""))
  throw new Error("Unexpected static output directory.");
await rm(staticExport, { recursive: true, force: true });
const standalone = path.join(target, "standalone");
const serverProject = path.join(standalone, "outputs", "hostinger");
await access(path.join(serverProject, "server.js"));
await cp(path.join(root, "public"), path.join(serverProject, "public"), {
  recursive: true,
});
await cp(
  path.join(build, "static"),
  path.join(serverProject, ".next", "static"),
  { recursive: true },
);
// Tracing retains the project path. Give Hostinger the conventional root entry.
await writeFile(path.join(standalone, "package.json"), '{"type":"commonjs"}\n');
await writeFile(
  path.join(standalone, "server.js"),
  `require('./outputs/hostinger/server.js');\n`,
);
await access(path.join(standalone, "server.js"));
console.log(
  "Hostinger Next.js standalone server ready: .next/standalone/server.js",
);
