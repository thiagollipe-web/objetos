import type{Token,TokenKind}from"./token";
export const normalizeWord=(s:string)=>s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"");
export class LexError extends Error{constructor(public line:number,public column:number,public lexeme:string,message:string){super(message)}}
export class Lexer{
 private i=0;private line=1;private col=1;
 constructor(private source:string){}
 tokenize():Token[]{const o:Token[]=[];while(this.i<this.source.length){const c=this.source[this.i];
 if(" \t\r".includes(c)){this.i++;this.col++;continue}
 if(c==="#"){while(this.i<this.source.length&&this.source[this.i]!=="\n"){this.i++;this.col++}continue}
 if(c==="\n"){o.push({kind:"NEWLINE",lexeme:"\n",line:this.line,column:this.col,endColumn:this.col+1});this.i++;this.line++;this.col=1;continue}
 if(this.source.startsWith('"""',this.i)){o.push(this.sprite());continue}
 if(c==='\"'||c==="'"){o.push(this.string(c));continue}
 if(/[0-9]/.test(c)){o.push(this.number());continue}
 if(/[A-Za-zÀ-ÖØ-öø-ÿ_]/.test(c)){o.push(this.ident());continue}
 const line=this.line,col=this.col,two=this.source.slice(this.i,this.i+2),tm:Record<string,TokenKind>={"==":"EQEQ","!=":"NEQ","<=":"LTE",">=":"GTE","//":"DSLASH","+=":"PLUS_EQ","-=":"MINUS_EQ","&&":"AND","||":"OR"};
 if(tm[two]){this.i+=2;this.col+=2;o.push({kind:tm[two],lexeme:two,line,column:col,endColumn:col+2});continue}
 const sm:Record<string,TokenKind>={"+":"PLUS","-":"MINUS","*":"STAR","/":"SLASH","%":"PERCENT","^":"CARET","=":"EQ","<":"LT",">":"GT","(":"LPAREN",")":"RPAREN","[":"LBRACK","]":"RBRACK",",":"COMMA",".":"DOT","!":"NOT"};
 if(sm[c]){this.i++;this.col++;o.push({kind:sm[c],lexeme:c,line,column:col,endColumn:col+1});continue}
 throw new LexError(line,col,c,`Não reconheci o símbolo "${c}".`)
 }o.push({kind:"EOF",lexeme:"",line:this.line,column:this.col,endColumn:this.col});return o}
 private number(){const l=this.line,c=this.col,s=this.i;while(/[0-9]/.test(this.source[this.i]??"")){this.i++;this.col++}if(this.source[this.i]==="."&&/[0-9]/.test(this.source[this.i+1]??"")){this.i++;this.col++;while(/[0-9]/.test(this.source[this.i]??"")){this.i++;this.col++}}const x=this.source.slice(s,this.i);return{kind:"NUMBER" as const,lexeme:x,literal:Number(x),line:l,column:c,endColumn:this.col}}
 private ident(){const l=this.line,c=this.col,s=this.i;if(this.source[s]==="x"&&/[0-9]/.test(this.source[s+1]??"")){this.i++;this.col++;return{kind:"IDENT" as const,lexeme:"x",literal:"x",line:l,column:c,endColumn:this.col}}while(/[A-Za-zÀ-ÖØ-öø-ÿ0-9_]/.test(this.source[this.i]??"")){this.i++;this.col++}const x=this.source.slice(s,this.i);return{kind:"IDENT" as const,lexeme:x,literal:normalizeWord(x),line:l,column:c,endColumn:this.col}}
 private string(q:string){const l=this.line,c=this.col;this.i++;this.col++;let s="";while(this.i<this.source.length&&this.source[this.i]!==q){if(this.source[this.i]==="\\"){this.i++;this.col++;const n=this.source[this.i]??"";s+=n==="n"?"\n":n==="t"?"\t":n;this.i++;this.col++}else{s+=this.source[this.i++];this.col++}}if(this.source[this.i]!==q)throw new LexError(l,c,s,"Faltou fechar as aspas.");this.i++;this.col++;return{kind:"STRING" as const,lexeme:s,literal:s,line:l,column:c,endColumn:this.col}}
 private sprite(){const l=this.line,c=this.col;this.i+=3;this.col+=3;let s="";while(this.i<this.source.length&&!this.source.startsWith('"""',this.i)){if(this.source[this.i]==="\n"){s+="\n";this.i++;this.line++;this.col=1}else{s+=this.source[this.i++];this.col++}}if(!this.source.startsWith('"""',this.i))throw new LexError(l,c,s,"Faltou fechar a imagem com três aspas.");this.i+=3;this.col+=3;return{kind:"SPRITE" as const,lexeme:s,literal:s,line:l,column:c,endColumn:this.col}}
}