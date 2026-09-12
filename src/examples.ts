export interface Exemplo {
  id: string;
  nome: string;
  descricao: string;
  codigo: string;
}

export const EXEMPLOS: Exemplo[] = [
  {
    id: "pong", nome: "Pong", descricao: "Clássico dos anos 70", codigo: `jogo Pong

tela 160x120
fundo preto

ator raquete
    desenho retângulo 4 x 20, branco
    posição 10, 50
    controlado por cima/baixo
    limita à tela
fim

ator raquete2
    desenho retângulo 4 x 20, branco
    posição 146, 50
    controlado por W/S
    limita à tela
fim

ator bola
    desenho quadrado 4, branco
    posição 80, 60
    velocidade 2, 2
    quica nas bordas
fim

pontos1 = 0
pontos2 = 0

ao atualizar
    se colide(bola, raquete) então
        bola.vx = 2
    fim
    se colide(bola, raquete2) então
        bola.vx = -2
    fim
    se bola.x < 0 então
        pontos2 += 1
        bola.x = 80
        bola.y = 60
        efeito "moeda"
    fim
    se bola.x > 160 então
        pontos1 += 1
        bola.x = 80
        bola.y = 60
        efeito "moeda"
    fim
fim

ao desenhar
    limpe
    desenhe raquete
    desenhe raquete2
    desenhe bola
    escreva "{pontos1}  x  {pontos2}" em 60, 4, branco
fim

fim`
  },
  {
    id: "nave", nome: "Nave", descricao: "Atire nos inimigos", codigo: `jogo Nave

tela 160x120
fundo preto

ator jogador
    imagem """
        ...11...
        ...11...
        ..1111..
        .111111.
        11111111
        11.11.11
        .1....1.
        ........
    """
    posição 76, 100
    controlado por esquerda/direita
    limita à tela
fim

ator tiro
    desenho retângulo 2 x 4, amarelo
    posição 0, 0
    velocidade 0, -4
fim

ator inimigo
    imagem """
        .1....1.
        11111111
        1.1111.1
        11111111
        .1.11.1.
        ..1..1..
        ........
        ........
    """
    posição 20, 10
    velocidade 1, 0
    quica nas bordas
fim

pontos = 0
vidas = 3

ao iniciar
    diga "Use ← → e espaço!"
fim

ao atualizar
    se toque("espaco") então
        tiro.x = jogador.x + 3
        tiro.y = jogador.y
        efeito "tiro"
    fim

    se colide(tiro, inimigo) então
        pontos += 10
        efeito "explosao"
        inimigo.x = aleatorio(10, 140)
        inimigo.y = 10
        tiro.y = -10
    fim
fim

ao desenhar
    limpe
    desenhe jogador
    desenhe tiro
    desenhe inimigo
    escreva "Pontos: {pontos}" em 4, 4, branco
    escreva "Vidas: {vidas}" em 4, 112, amarelo
fim

fim`
  },
  {
    id: "breakout", nome: "Breakout", descricao: "Quebre todos os tijolos", codigo: `jogo Breakout

tela 160x120
fundo preto

ator raquete
    desenho retângulo 24 x 4, ciano
    posição 68, 112
    controlado por esquerda/direita
    limita à tela
fim

ator bola
    desenho quadrado 4, branco
    posição 80, 80
    velocidade 2, -2
fim

ator tijolo1
    desenho retângulo 16 x 6, vermelho
    posição 20, 20
fim
ator tijolo2
    desenho retângulo 16 x 6, vermelho
    posição 40, 20
fim
ator tijolo3
    desenho retângulo 16 x 6, vermelho
    posição 60, 20
fim
ator tijolo4
    desenho retângulo 16 x 6, laranja
    posição 80, 20
fim
ator tijolo5
    desenho retângulo 16 x 6, laranja
    posição 100, 20
fim
ator tijolo6
    desenho retângulo 16 x 6, amarelo
    posição 120, 20
fim

pontos = 0

ao atualizar
    se colide(bola, raquete) então
        bola.vy = -2
        efeito "pulo"
    fim

    se colide(bola, tijolo1) então
        tijolo1.x = -100
        pontos += 10
        bola.vy = 2
        efeito "moeda"
    fim
    se colide(bola, tijolo2) então
        tijolo2.x = -100
        pontos += 10
        bola.vy = 2
        efeito "moeda"
    fim
    se colide(bola, tijolo3) então
        tijolo3.x = -100
        pontos += 10
        bola.vy = 2
        efeito "moeda"
    fim
    se colide(bola, tijolo4) então
        tijolo4.x = -100
        pontos += 10
        bola.vy = 2
        efeito "moeda"
    fim
    se colide(bola, tijolo5) então
        tijolo5.x = -100
        pontos += 10
        bola.vy = 2
        efeito "moeda"
    fim
    se colide(bola, tijolo6) então
        tijolo6.x = -100
        pontos += 10
        bola.vy = 2
        efeito "moeda"
    fim

    se bola.y < 0 então
        bola.y = 0
        bola.vy = 2
    fim
    se bola.x < 0 então
        bola.x = 0
        bola.vx = 2
    fim
    se bola.x > 156 então
        bola.x = 156
        bola.vx = -2
    fim
    se bola.y > 120 então
        bola.x = 80
        bola.y = 80
        bola.vy = -2
        efeito "dano"
    fim
fim

ao desenhar
    limpe
    desenhe raquete
    desenhe bola
    desenhe tijolo1
    desenhe tijolo2
    desenhe tijolo3
    desenhe tijolo4
    desenhe tijolo5
    desenhe tijolo6
    escreva "Pontos: {pontos}" em 4, 4, branco
fim

fim`
  },
  {
    id: "chuva", nome: "Chuva", descricao: "Desvie dos obstáculos", codigo: `jogo Chuva

tela 160x120
fundo azul

ator jogador
    desenho quadrado 8, amarelo
    posição 76, 100
    controlado por esquerda/direita
    limita à tela
fim

ator gota1
    desenho retângulo 4 x 8, azul-claro
    posição 20, 0
    velocidade 0, 2
fim
ator gota2
    desenho retângulo 4 x 8, azul-claro
    posição 60, 0
    velocidade 0, 3
fim
ator gota3
    desenho retângulo 4 x 8, azul-claro
    posição 100, 0
    velocidade 0, 2
fim
ator gota4
    desenho retângulo 4 x 8, azul-claro
    posição 140, 0
    velocidade 0, 3
fim

pontos = 0

ao atualizar
    se gota1.y > 120 então
        gota1.y = 0
        gota1.x = aleatorio(10, 150)
        pontos += 1
    fim
    se gota2.y > 120 então
        gota2.y = 0
        gota2.x = aleatorio(10, 150)
        pontos += 1
    fim
    se gota3.y > 120 então
        gota3.y = 0
        gota3.x = aleatorio(10, 150)
        pontos += 1
    fim
    se gota4.y > 120 então
        gota4.y = 0
        gota4.x = aleatorio(10, 150)
        pontos += 1
    fim

    se colide(jogador, gota1) então
        pontos = 0
        efeito "dano"
    fim
    se colide(jogador, gota2) então
        pontos = 0
        efeito "dano"
    fim
    se colide(jogador, gota3) então
        pontos = 0
        efeito "dano"
    fim
    se colide(jogador, gota4) então
        pontos = 0
        efeito "dano"
    fim
fim

ao desenhar
    limpe
    desenhe jogador
    desenhe gota1
    desenhe gota2
    desenhe gota3
    desenhe gota4
    escreva "Pontos: {pontos}" em 4, 4, branco
fim

fim`
  },
  {
    id: "contador", nome: "Contador", descricao: "Exemplo simples de lógica", codigo: `jogo Contador

tela 160x120
fundo preto

numero = 0

ao iniciar
    diga "Contando de 0 a 5..."
fim

ao atualizar
    se toque("espaco") então
        numero += 1
        efeito "moeda"
        diga "Número: {numero}"
    fim

    se numero > 5 então
        numero = 0
        diga "Reiniciou!"
    fim
fim

ao desenhar
    limpe
    escreva "{numero}" em 76, 56, amarelo
    escreva "Toque espaço" em 30, 100, cinza
fim

fim`
  }
];

export const EXEMPLO_PADRAO = EXEMPLOS[0];
