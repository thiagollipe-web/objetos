import "./style.css";
import { Parser, BitSyntaxError } from "./lang/parser";
import { RuntimeGame } from "./runtime/game";
import { EXEMPLOS, EXEMPLO_PADRAO } from "./examples";
import { instalarDestaque } from "./editor/highlight";

const editor = document.querySelector<HTMLTextAreaElement>("#editor")!;
const highlight = document.querySelector<HTMLElement>("#highlight")!;
const canvas = document.querySelector<HTMLCanvasElement>("#tela")!;
const status = document.querySelector<HTMLElement>("#status")!;
const runButton = document.querySelector<HTMLButtonElement>("#btn-executar")!;
const stopButton = document.querySelector<HTMLButtonElement>("#btn-parar")!;
const examplesButton = document.querySelector<HTMLButtonElement>("#btn-exemplo")!;
const modal = document.querySelector<HTMLElement>("#modal")!;
const examplesList = document.querySelector<HTMLElement>("#lista-exemplos")!;
const game = new RuntimeGame(canvas);

const saved = localStorage.getItem("bit-code");
editor.value = saved || EXEMPLO_PADRAO.codigo;
const updateHighlight = instalarDestaque(editor, highlight);

function setStatus(text: string, kind: "" | "ok" | "erro" = "") {
  status.textContent = text;
  status.className = `status ${kind}`.trim();
}

function run() {
  try {
    const program = new Parser(editor.value).parse();
    localStorage.setItem("bit-code", editor.value);
    game.load(program);
    game.start();
    runButton.disabled = true;
    stopButton.disabled = false;
    setStatus(`✓ ${program.gameName} executando.`, "ok");
  } catch (error) {
    game.stop();
    runButton.disabled = false;
    stopButton.disabled = true;
    const message = error instanceof BitSyntaxError
      ? error.message
      : error instanceof Error ? error.message : String(error);
    setStatus(`Erro: ${message}`, "erro");
  }
}

function stop() {
  game.stop();
  runButton.disabled = false;
  stopButton.disabled = true;
  setStatus("Parado.");
}

function insertSnippet(snippet: string) {
  const start = editor.selectionStart;
  const end = editor.selectionEnd;
  editor.setRangeText(snippet, start, end, "end");
  editor.dispatchEvent(new Event("input", { bubbles: true }));
  editor.focus();
}

runButton.addEventListener("click", run);
stopButton.addEventListener("click", stop);

editor.addEventListener("input", () => {
  localStorage.setItem("bit-code", editor.value);
  updateHighlight();
});

editor.addEventListener("keydown", (event) => {
  if (event.key === "Tab") {
    event.preventDefault();
    insertSnippet("    ");
  }
  if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
    event.preventDefault();
    run();
  }
});

// Mantém o overlay perfeitamente sincronizado durante rolagem no celular.
editor.addEventListener("scroll", updateHighlight, { passive: true });

for (const button of document.querySelectorAll<HTMLButtonElement>("[data-snippet]")) {
  button.addEventListener("click", () => insertSnippet(button.dataset.snippet || ""));
}

for (const exemplo of EXEMPLOS) {
  const item = document.createElement("button");
  item.className = "exemplo-item";
  item.type = "button";
  item.innerHTML = `<div class="exemplo-nome">${exemplo.nome}</div><div class="exemplo-desc">${exemplo.descricao}</div>`;
  item.addEventListener("click", () => {
    editor.value = exemplo.codigo;
    localStorage.setItem("bit-code", exemplo.codigo);
    updateHighlight();
    modal.classList.remove("aberto");
    setStatus(`Exemplo "${exemplo.nome}" carregado.`);
    editor.focus();
  });
  examplesList.appendChild(item);
}

examplesButton.addEventListener("click", () => modal.classList.add("aberto"));
modal.addEventListener("click", (event) => {
  if (event.target === modal) modal.classList.remove("aberto");
});

for (const button of document.querySelectorAll<HTMLButtonElement>("[data-tecla]")) {
  const key = button.dataset.tecla!;
  const down = (event: PointerEvent) => {
    event.preventDefault();
    button.classList.add("ativo");
    button.setPointerCapture?.(event.pointerId);
    game.input.setVirtualKey(key, true);
  };
  const up = (event: PointerEvent) => {
    event.preventDefault();
    button.classList.remove("ativo");
    game.input.setVirtualKey(key, false);
  };
  button.addEventListener("pointerdown", down);
  button.addEventListener("pointerup", up);
  button.addEventListener("pointercancel", up);
  button.addEventListener("lostpointercapture", () => {
    button.classList.remove("ativo");
    game.input.setVirtualKey(key, false);
  });
}

run();
