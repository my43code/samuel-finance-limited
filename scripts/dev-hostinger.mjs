import { spawn } from "node:child_process";
import path from "node:path";
import { existsSync } from "node:fs";
import { loadEnvFile } from "node:process";
import { prepareHostinger, root, project } from "./prepare-hostinger.mjs";
const localEnvironment = path.join(root, ".env.local");
if (existsSync(localEnvironment)) loadEnvFile(localEnvironment);
await prepareHostinger();
const child = spawn(
  process.execPath,
  [
    path.join(root, "node_modules/next/dist/bin/next"),
    "dev",
    project,
    "--webpack",
    "--hostname",
    "127.0.0.1",
    ...process.argv.slice(2),
  ],
  { cwd: root, stdio: "inherit" },
);
child.on("exit", (code) => process.exit(code ?? 1));
for (const signal of ["SIGINT", "SIGTERM"])
  process.on(signal, () => child.kill(signal));
