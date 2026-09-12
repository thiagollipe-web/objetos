const PALAVRAS = [
  "jogo", "fim", "tela", "fundo", "ator", "imagem", "desenho", "posição", "posicao",
  "velocidade", "controlado", "por", "quica", "nas", "bordas", "limita", "ao", "iniciar",
  "atualizar", "desenhar", "colidir", "com", "se", "então", "entao", "senão", "senao",
  "enquanto", "repita", "vezes", "para", "cada", "em", "aprenda", "devolve", "pare",
  "diga", "escreva", "mostre", "fale", "limpe", "desenhe", "efeito", "melodia", "volume",
  "verdadeiro", "falso", "nulo", "e", "ou", "não", "nao", "retângulo", "retangulo", "quadrado"
];

const CORES = [
  "preto", "branco", "cinza", "vermelho", "laranja", "amarelo", "verde", "ciano", "azul",
  "roxo", "rosa", "marrom", "bege", "verde-claro", "azul-claro", "transparente"
];

const FUNCOES = ["colide", "tecla", "toque", "aleatorio", "aleatório", "distancia", "distância"];

const norm = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
const palavrasNorm = new Set(PALAVRAS.map(norm));
const coresNorm = new Set(CORES.map(norm));
const funcoesNorm = new Set(FUNCOES.map(norm));

const escaparHtml = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export function destacar(codigo: string): string {
  let saida = "";
  let i = 0;
  while (i < codigo.length) {
    const c = codigo[i];
    if (c === "#") {
      let j = i; while (j < codigo.length && codigo[j] !== "\n") j++;
      saida += `<span class="tok-comentario">${escaparHtml(codigo.slice(i, j))}</span>`; i = j; continue;
    }
    if (codigo.slice(i, i + 3) === "\"\"\"") {
      const fim = codigo.indexOf("\"\"\"", i + 3); const end = fim < 0 ? codigo.length : fim + 3;
      saida += `<span class="tok-sprite">${escaparHtml(codigo.slice(i, end))}</span>`; i = end; continue;
    }
    if (c === "\"" || c === "'") {
      const q = c; let j = i + 1;
      while (j < codigo.length && codigo[j] !== q) { if (codigo[j] === "\\") j++; j++; }
      j = Math.min(j + 1, codigo.length);
      saida += `<span class="tok-string">${escaparHtml(codigo.slice(i, j))}</span>`; i = j; continue;
    }
    if (/[0-9]/.test(c)) {
      let j = i; while (j < codigo.length && /[0-9.]/.test(codigo[j])) j++;
      saida += `<span class="tok-numero">${codigo.slice(i, j)}</span>`; i = j; continue;
    }
    if (/[A-Za-z_\u00C0-\u017F]/.test(c)) {
      let j = i; while (j < codigo.length && /[A-Za-z0-9_\u00C0-\u017F-]/.test(codigo[j])) j++;
      const palavra = codigo.slice(i, j); const n = norm(palavra);
      const cls = palavrasNorm.has(n) ? "tok-chave" : coresNorm.has(n) ? "tok-cor" : funcoesNorm.has(n) ? "tok-funcao" : "";
      saida += cls ? `<span class="${cls}">${escaparHtml(palavra)}</span>` : escaparHtml(palavra);
      i = j; continue;
    }
    if ("+-*/%^=<>!&|".includes(c)) { saida += `<span class="tok-op">${escaparHtml(c)}</span>`; i++; continue; }
    saida += escaparHtml(c); i++;
  }
  return saida + "\n";
}

export function instalarDestaque(textarea: HTMLTextAreaElement, pre: HTMLElement): () => void {
  const atualizar = () => {
    pre.innerHTML = destacar(textarea.value);
    pre.scrollTop = textarea.scrollTop;
    pre.scrollLeft = textarea.scrollLeft;
  };
  textarea.addEventListener("input", atualizar);
  textarea.addEventListener("scroll", atualizar);
  atualizar();
  return atualizar;
}
