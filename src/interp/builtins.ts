import type { RuntimeGame } from "../runtime/game";

type Builtin = (args: unknown[]) => unknown;

export function createBuiltins(game: RuntimeGame): Map<string, Builtin> {
  const builtins: Array<[string, Builtin]> = [
    ["aleatorio", ([min, max]: unknown[]) => {
      const a = Math.trunc(Number(min ?? 0));
      const b = Math.trunc(Number(max ?? a));
      const low = Math.min(a, b);
      const high = Math.max(a, b);
      return Math.floor(Math.random() * (high - low + 1)) + low;
    }],
    ["colide", ([a, b]: unknown[]) => game.collides(String(a), String(b))],
    ["distancia", ([a, b]: unknown[]) => game.distance(String(a), String(b))],
    ["tecla", ([key]: unknown[]) => game.keyDown(String(key))],
    ["toque", ([key]: unknown[]) => game.wasPressed(String(key))],
  ];

  return new Map<string, Builtin>(builtins);
}
