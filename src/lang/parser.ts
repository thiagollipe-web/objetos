import { Lexer, normalizeWord } from "./lexer";
import type { Token } from "./token";
import type { Program, Stmt, Expr } from "./ast";

export class BitSyntaxError extends Error {
  constructor(message:string, public token:Token) {
    super(message);
    this.name="BitSyntaxError";
  }
}

export class Parser {
  private tokens:Token[]=[];
  private current=0;
  constructor(private source:string){}

  parse():Program {
    this.tokens=new Lexer(this.source).tokenize();
    this.current=0;
    this.skipNewlines();
    this.consumeWord("jogo");
    const name=this.ident();
    this.skipLine();
    const body=this.parseBlock("fim");
    this.consumeWord("fim");
    this.skipNewlines();
    this.consume("EOF");
    return {gameName:name, body} as Program;
  }

  private parseBlock(end:string):Stmt[] {
    const body:Stmt[]=[];
    while(!this.check("EOF") && !this.checkWord(end)) {
      if(this.match("NEWLINE")) continue;
      body.push(this.statement());
      this.skipNewlines();
    }
    return body;
  }

  private statement():Stmt {
    const w=this.word();

    if(w==="tela") {
      const width=this.literalNumber();
      this.consumeWord("x");
      const height=this.literalNumber();
      this.skipLine();
      return {kind:"noop",name:"tela",args:[width,height]} as any;
    }

    if(w==="fundo") {
      const value=this.expression();
      this.skipLine();
      return {kind:"noop",name:"fundo",args:[value]} as any;
    }

    if(w==="ator") {
      const name=this.ident();
      this.skipLine();
      const body=this.parseBlock("fim");
      this.consumeWord("fim");
      return {kind:"actor",name,body} as any;
    }

    if(w==="ao") {
      const event=this.word();

      if(event==="iniciar"||event==="atualizar"||event==="desenhar") {
        this.skipLine();
        const body=this.parseBlock("fim");
        this.consumeWord("fim");
        return {kind:"hook",name:event,body} as any;
      }

      if(event==="colidir") {
        const a=this.ident();
        this.consumeWord("com");
        const b=this.ident();
        this.skipLine();
        const body=this.parseBlock("fim");
        this.consumeWord("fim");
        return {kind:"collision",a,b,body} as any;
      }

      throw this.error('Evento desconhecido depois de "ao".');
    }

    if(w==="se") {
      const condition=this.expression();

      if(!this.acceptWord("entao")) {
        throw this.error('Faltou "então" depois da condição.');
      }

      this.skipLine();
      const thenBranch=this.parseBlock("senao");
      let elseBranch:Stmt[]=[];

      if(this.acceptWord("senao")) {
        this.skipLine();
        elseBranch=this.parseBlock("fim");
      }

      this.consumeWord("fim");

      return {
        kind:"if",
        condition,
        thenBranch,
        elseBranch
      } as any;
    }

    if(w==="enquanto") {
      const condition=this.expression();
      this.skipLine();
      const body=this.parseBlock("fim");
      this.consumeWord("fim");
      return {kind:"while",condition,body} as any;
    }

    if(w==="repita") {
      const count=this.expression();
      this.consumeWord("vezes");
      this.skipLine();
      const body=this.parseBlock("fim");
      this.consumeWord("fim");
      return {kind:"repeat",count,body} as any;
    }

    if(w==="para") {
      this.consumeWord("cada");
      const name=this.ident();
      this.consumeWord("em");
      const list=this.expression();
      this.skipLine();
      const body=this.parseBlock("fim");
      this.consumeWord("fim");
      return {kind:"foreach",name,list,body} as any;
    }

    if(w==="aprenda") {
      const name=this.ident();
      this.consume("LPAREN");
      const params:string[]=[];

      if(!this.check("RPAREN")) {
        do {
          params.push(this.ident());
        } while(this.match("COMMA"));
      }

      this.consume("RPAREN");
      this.skipLine();
      const body=this.parseBlock("fim");
      this.consumeWord("fim");

      return {kind:"function",name,params,body} as any;
    }

    if(w==="devolve") {
      const value=this.check("NEWLINE") ? undefined : this.expression();
      this.skipLine();
      return {kind:"return",value} as any;
    }

    if(w==="pare") {
      this.skipLine();
      return {kind:"break"} as any;
    }

    if(w==="diga"||w==="mostre"||w==="fale") {
      const value=this.expression();
      this.skipLine();
      return {kind:"say",expr:value} as any;
    }

    if(w==="pergunte") {
      const question=this.expression();
      this.consumeWord("e");
      this.consumeWord("guarde");
      this.consumeWord("em");
      const name=this.ident();
      this.skipLine();
      return {kind:"ask",expr:question,name} as any;
    }

    if(w==="limpe") {
      this.skipLine();
      return {kind:"draw",shape:"clear",args:[]} as any;
    }

    if(w==="desenho") {
      const shape=this.word();
      if(shape!=="retangulo"&&shape!=="quadrado") throw this.error("Esperava retângulo ou quadrado depois de desenho.");
      return {kind:"draw",shape,args:this.commaArgs()} as any;
    }

    if(w==="desenhe") {
      if(this.checkWord("retangulo")) {
        this.advance();
        return {kind:"draw",shape:"retangulo",args:this.commaArgs()} as any;
      }
      if(this.checkWord("quadrado")) {
        this.advance();
        return {kind:"draw",shape:"quadrado",args:this.commaArgs()} as any;
      }

      const actor=this.expression();
      this.skipLine();
      return {kind:"draw",shape:"actor",args:[actor]} as any;
    }

    if(w==="escreva") {
      const text=this.expression();

      if(this.acceptWord("em")) {
        const x=this.expression();
        this.consume("COMMA");
        const y=this.expression();
        this.consume("COMMA");
        const color=this.expression();
        this.skipLine();
        return {kind:"draw",shape:"text",args:[text,x,y,color]} as any;
      }

      this.skipLine();
      return {kind:"say",expr:text} as any;
    }

    if(["efeito","melodia","volume","toque","imagem","posicao","velocidade","controlado","quica","limita"].includes(w)) {
      return {kind:"noop",name:w,args:this.commaArgs()} as any;
    }

    const target=this.parseAssignableTail(w);

    if(this.match("EQ")||this.match("PLUS_EQ")||this.match("MINUS_EQ")) {
      const kind=this.previous().kind;
      const value=this.expression();

      return {
        kind:"assign",
        target,
        op:kind==="EQ"?"=":kind==="PLUS_EQ"?"+=":"-=",
        value
      } as any;
    }

    if(this.acceptWord("recebe")||this.acceptWord("vira")) {
      return {
        kind:"assign",
        target,
        op:"=",
        value:this.expression()
      } as any;
    }

    return {kind:"expr",expr:target} as any;
  }

  private parseAssignableTail(first:string):Expr {
    let expr:Expr={kind:"variable",name:first} as any;

    while(this.match("DOT")) {
      expr={
        kind:"member",
        object:expr,
        property:this.ident()
      } as any;
    }

    return expr;
  }

  private commaArgs():Expr[] {
    const args:Expr[]=[];

    while(!this.check("NEWLINE")&&!this.check("EOF")) {
      args.push(this.expression());
      if(!this.match("COMMA")) break;
    }

    this.skipLine();
    return args;
  }

  private expression():Expr {
    return this.parseOr();
  }

  private parseOr():Expr {
    let left=this.parseAnd();

    while(this.check("OR")||this.checkWord("ou")) {
      this.advance();
      left={kind:"binary",op:"ou",left,right:this.parseAnd()} as any;
    }

    return left;
  }

  private parseAnd():Expr {
    let left=this.parseEquality();

    while(this.check("AND")||this.checkWord("e")) {
      this.advance();
      left={kind:"binary",op:"e",left,right:this.parseEquality()} as any;
    }

    return left;
  }

  private parseEquality():Expr {
    let left=this.parseComparison();

    while(this.match("EQEQ")||this.match("NEQ")) {
      const op=this.previous().lexeme;
      left={kind:"binary",op,left,right:this.parseComparison()} as any;
    }

    return left;
  }

  private parseComparison():Expr {
    let left=this.parseTerm();

    while(this.match("LT")||this.match("LTE")||this.match("GT")||this.match("GTE")) {
      const op=this.previous().lexeme;
      left={kind:"binary",op,left,right:this.parseTerm()} as any;
    }

    return left;
  }

  private parseTerm():Expr {
    let left=this.parseFactor();

    while(this.match("PLUS")||this.match("MINUS")) {
      const op=this.previous().lexeme;
      left={kind:"binary",op,left,right:this.parseFactor()} as any;
    }

    return left;
  }

  private parseFactor():Expr {
    let left=this.parseUnary();

    while(this.match("STAR")||this.match("SLASH")||this.match("DSLASH")||this.match("PERCENT")) {
      const op=this.previous().lexeme;
      left={kind:"binary",op,left,right:this.parseUnary()} as any;
    }

    return left;
  }

  private parseUnary():Expr {
    if(this.match("MINUS")||this.match("PLUS")||this.match("NOT")||this.matchWord("nao")) {
      return {kind:"unary",op:this.previous().lexeme,expr:this.parseUnary()} as any;
    }

    return this.parsePower();
  }

  private parsePower():Expr {
    let left=this.parsePostfix();

    if(this.match("CARET")) {
      left={kind:"binary",op:"^",left,right:this.parseUnary()} as any;
    }

    return left;
  }

  private parsePostfix():Expr {
    let expr=this.primary();

    while(true) {
      if(this.match("LPAREN")) {
        const args:Expr[]=[];

        if(!this.check("RPAREN")) {
          do {
            args.push(this.expression());
          } while(this.match("COMMA"));
        }

        this.consume("RPAREN");

        expr={kind:"call",callee:expr,args} as any;
        continue;
      }

      if(this.match("DOT")) {
        expr={
          kind:"member",
          object:expr,
          property:this.ident()
        } as any;
        continue;
      }

      break;
    }

    return expr;
  }

  private primary():Expr {
    if(this.match("NUMBER")) {
      return {kind:"literal",value:this.previous().literal} as any;
    }

    if(this.match("STRING")||this.match("SPRITE")) {
      return {kind:"literal",value:this.previous().literal} as any;
    }

    if(this.match("LBRACK")) {
      const items:Expr[]=[];

      if(!this.check("RBRACK")) {
        do {
          items.push(this.expression());
        } while(this.match("COMMA"));
      }

      this.consume("RBRACK");

      return {kind:"list",items} as any;
    }

    if(this.match("LPAREN")) {
      const expr=this.expression();
      this.consume("RPAREN");
      return expr;
    }

    if(this.check("IDENT")) {
      const name=this.ident();
      const normalized=normalizeWord(name);

      if(normalized==="verdadeiro") {
        return {kind:"literal",value:true} as any;
      }

      if(normalized==="falso") {
        return {kind:"literal",value:false} as any;
      }

      if(normalized==="nulo") {
        return {kind:"literal",value:null} as any;
      }

      return {kind:"variable",name} as any;
    }

    throw this.error("Esperava um valor.");
  }

  private literalNumber():Expr {
    if(!this.check("NUMBER")) {
      throw this.error("Esperava um número.");
    }

    return {
      kind:"literal",
      value:this.advance().literal
    } as any;
  }

  private word():string {
    if(!this.check("IDENT")) {
      throw this.error("Esperava uma instrução.");
    }

    return normalizeWord(this.advance().lexeme);
  }

  private ident():string {
    if(!this.check("IDENT")) {
      throw this.error("Esperava um nome.");
    }

    return this.advance().lexeme;
  }

  private consume(kind:Token["kind"], message?:string):Token {
    if(this.check(kind)) {
      return this.advance();
    }

    throw this.error(
      message ?? `Esperava "${kind}".`
    );
  }

  private consumeWord(word:string):void {
    if(!this.acceptWord(word)) {
      throw this.error(`Esperava "${word}".`);
    }
  }

  private acceptWord(word:string):boolean {
    if(this.checkWord(word)) {
      this.advance();
      return true;
    }

    return false;
  }

  private checkWord(word:string):boolean {
    return this.check("IDENT") &&
      normalizeWord(this.peek().lexeme)===normalizeWord(word);
  }

  private check(kind:Token["kind"]):boolean {
    return this.peek().kind===kind;
  }

  private match(kind:Token["kind"]):boolean {
    if(!this.check(kind)) return false;
    this.advance();
    return true;
  }

  private advance():Token {
    const token=this.peek();
    this.current++;
    return token;
  }

  private previous():Token {
    return this.tokens[this.current-1];
  }

  private peek():Token {
    return this.tokens[this.current] ??
      this.tokens[this.tokens.length-1];
  }

  private skipLine():void {
    while(!this.check("NEWLINE")&&!this.check("EOF")) {
      this.advance();
    }

    this.match("NEWLINE");
  }

  private skipNewlines():void {
    while(this.match("NEWLINE")) {}
  }

  private error(message:string):BitSyntaxError {
    return new BitSyntaxError(
      `${message} Linha ${this.peek().line}, coluna ${this.peek().column}.`,
      this.peek()
    );
  }
}

export function parseBit(source:string):Program {
  return new Parser(source).parse();
}