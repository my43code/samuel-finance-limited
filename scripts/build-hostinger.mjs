import { access, cp, mkdir, readFile, writeFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const project = path.join(root, 'outputs', 'hostinger');
await mkdir(path.join(project, 'app'), { recursive: true });
await writeFile(path.join(project, 'package.json'), JSON.stringify({ private: true }));
await writeFile(path.join(project, 'next.config.js'), `module.exports = {
  output: 'standalone',
  outputFileTracingRoot: ${JSON.stringify(root)},
};\n`);
const html = await readFile(path.join(root, 'public', 'company.html'), 'utf8');
await writeFile(path.join(project, 'app', 'route.js'), `export function GET() {
  return new Response(${JSON.stringify(html)}, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}\n`);
await writeFile(path.join(project, 'app', 'layout.js'), `export default function Layout({children}) { return children; }\n`);
const result = spawnSync(process.execPath, [path.join(root, 'node_modules/next/dist/bin/next'), 'build', project, '--webpack'], {
  cwd: root, stdio: 'inherit', env: { ...process.env, NEXT_TELEMETRY_DISABLED: '1' },
});
if (result.error) throw result.error;
if (result.status !== 0) process.exit(result.status ?? 1);

const build = path.join(project, '.next');
const target = path.join(root, '.next');
await mkdir(target, { recursive: true });
await cp(build, target, { recursive: true });
const standalone = path.join(target, 'standalone');
const serverProject = path.join(standalone, 'outputs', 'hostinger');
await access(path.join(serverProject, 'server.js'));
await cp(path.join(root, 'public'), path.join(serverProject, 'public'), { recursive: true });
await cp(path.join(build, 'static'), path.join(serverProject, '.next', 'static'), { recursive: true });
// Tracing retains the project path. Give Hostinger the conventional root entry.
await writeFile(path.join(standalone, 'package.json'), '{"type":"commonjs"}\n');
await writeFile(path.join(standalone, 'server.js'), `require('./outputs/hostinger/server.js');\n`);
await access(path.join(standalone, 'server.js'));
console.log('Hostinger Next.js standalone server ready: .next/standalone/server.js');
