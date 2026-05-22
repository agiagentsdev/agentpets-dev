import { chmod, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { build } from "esbuild";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const outfile = path.join(root, "dist", "petdex.js");

await mkdir(path.dirname(outfile), { recursive: true });

await build({
  entryPoints: [path.join(root, "bin", "petdex.ts")],
  outfile,
  bundle: true,
  platform: "node",
  format: "esm",
  target: "node20",
  minify: true,
  external: ["@napi-rs/keyring"],
  banner: {
    js: "#!/usr/bin/env node",
  },
});

const output = await readFile(outfile, "utf8");
if (!output.startsWith("#!")) {
  await writeFile(outfile, `#!/usr/bin/env node\n${output}`);
}

await chmod(outfile, 0o755);
