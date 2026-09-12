import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const required = [
  "package.json",
  "tsconfig.json",
  "vite.config.ts",
  "index.html",
  "src/lang/token.ts",
  "src/lang/lexer.ts",
  "src/lang/ast.ts",
  "src/main.ts",
];

const missing = required.filter(path => !existsSync(join(process.cwd(), path)));

if (missing.length) {
  console.error("Bit: projeto incompleto.");
  for (const path of missing) console.error(`- ausente: ${path}`);
  process.exit(1);
}

const pkg = JSON.parse(readFileSync("package.json", "utf8"));

if (!pkg.scripts?.build || !pkg.scripts?.test) {
  console.error("Bit: scripts build/test ausentes.");
  process.exit(1);
}

console.log("Bit: estrutura mínima íntegra.");
