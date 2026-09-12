import "./style.css";import{Parser}from"./lang/parser";import{RuntimeGame}from"./runtime/game";
const code=`jogo Bit
tela 160x120
fundo preto
ator jogador
desenho quadrado 8, azul
posição 70, 56
controlado por setas
limita à tela
fim
ao desenhar
limpe
desenhe jogador
escreva "BIT 1.0" em 6, 6, branco
fim
fim`;
document.querySelector("#app")!.innerHTML=`<div class="app"><header class="top"><b>BIT 1.0</b><button id="run">▶ Executar</button></header><main><section><h2>Jogo</h2><canvas id="game" width="160" height="120"></canvas><div class="touch"><button data-k="ArrowUp">▲</button><button data-k="ArrowLeft">◀</button><button data-k="ArrowDown">▼</button><button data-k="ArrowRight">▶</button></div></section><section><h2>Código Bit</h2><textarea id="code"></textarea><pre id="out">Pronto.</pre></section></main></div>`;
const editor=document.querySelector<HTMLTextAreaElement>("#code")!;editor.value=localStorage.getItem("bit-code")||code;const out=document.querySelector<HTMLPreElement>("#out")!;const game=new RuntimeGame(document.querySelector("#game") as HTMLCanvasElement);
function run(){try{const p=new Parser(editor.value).parse();localStorage.setItem("bit-code",editor.value);game.load(p);game.start();out.textContent="✓ "+p.gameName+" executando."}catch(e){game.stop();out.textContent=e instanceof Error?e.message:String(e)}}document.querySelector("#run")!.addEventListener("click",run);document.querySelectorAll<HTMLButtonElement>("[data-k]").forEach(b=>{const k=b.dataset.k!;const down=(e:Event)=>{e.preventDefault();game.input.setVirtualKey(k,true)};const up=(e:Event)=>{e.preventDefault();game.input.setVirtualKey(k,false)};b.addEventListener("pointerdown",down);b.addEventListener("pointerup",up);b.addEventListener("pointercancel",up)});run();