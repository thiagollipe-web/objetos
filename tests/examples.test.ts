import { describe, expect, it } from "vitest";
import { EXEMPLOS } from "../src/examples";
import { parseBit } from "../src/lang/parser";

describe("exemplos oficiais Bit 1.1", () => {
  it("possui cinco exemplos", () => {
    expect(EXEMPLOS).toHaveLength(5);
  });

  for (const exemplo of EXEMPLOS) {
    it(`faz parse de ${exemplo.nome}`, () => {
      const program = parseBit(exemplo.codigo);
      expect(program.gameName).toBe(exemplo.nome);
      expect(program.body.length).toBeGreaterThan(0);
    });
  }
});
