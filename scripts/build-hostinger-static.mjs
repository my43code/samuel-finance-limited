import { cp, mkdir, readFile, writeFile, access } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const root = new URL('../', import.meta.url);
const source = new URL('public/', root);
const output = new URL('out/', root);

// Hostinger's Next.js deployer recognizes out/index.html as static output.
// The Worker build remains in dist/ for the separate Sites deployment.
await mkdir(output, { recursive: true });
await cp(source, output, { recursive: true });
await writeFile(new URL('index.html', output), await readFile(new URL('company.html', source)));
for (const asset of ['index.html', 'styles.css', 'script.js', 'assets/logo.png']) {
  await access(new URL(asset, output));
}
console.log(`Hostinger static website ready: ${fileURLToPath(output)}`);
