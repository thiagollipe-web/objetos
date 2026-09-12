import {existsSync,readFileSync} from "node:fs";
const required=[
"package.json","tsconfig.json","vite.config.ts","index.html",
"src/lang/token.ts","src/lang/lexer.ts","src/lang/ast.ts","src/lang/parser.ts",
"src/interp/environment.ts","src/interp/builtins.ts","src/interp/interpreter.ts",
"src/runtime/actor.ts","src/runtime/audio.ts","src/runtime/collision.ts","src/runtime/game.ts","src/runtime/input.ts","src/runtime/palette.ts","src/runtime/render.ts",
"src/main.ts","src/style.css"
];
const missing=required.filter(f=>!existsSync(f));
if(missing.length){console.error("Arquivos ausentes:",missing.join(", "));process.exit(1);}
const pkg=JSON.parse(readFileSync("package.json","utf8"));
if(pkg.name!=="bit")throw new Error("package.json: nome do projeto deve ser bit.");
for(const s of ["test","build"])if(!pkg.scripts?.[s])throw new Error(`Script ausente: ${s}`);
console.log(`Bit RC1: estrutura íntegra (${required.length} arquivos essenciais).`);
