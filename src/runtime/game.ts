import{Interpreter}from"../interp/interpreter";import{Actor}from"./actor";import{InputManager}from"./input";import{Renderer}from"./render";import{AudioEngine}from"./audio";import{intersects,distance}from"./collision";import type{Program,Stmt}from"../lang/ast";
export class RuntimeGame{
 readonly input=new InputManager();readonly audio=new AudioEngine();readonly actors=new Map<string,Actor>();
 readonly renderer:Renderer;readonly canvas:HTMLCanvasElement;private interpreter:Interpreter;private running=false;private raf=0;
 width=160;height=120;background="preto";private hooks={iniciar:[] as Stmt[],atualizar:[] as Stmt[],desenhar:[] as Stmt[]};private collisions:{a:string;b:string;body:Stmt[]}[]=[];
 constructor(canvas:HTMLCanvasElement){this.canvas=canvas;this.renderer=new Renderer(canvas);this.interpreter=new Interpreter(this);this.renderer.resize(this.width,this.height);}
 load(program:Program){this.stop();this.actors.clear();this.collisions=[];this.hooks={iniciar:[],atualizar:[],desenhar:[]};for(const s of program.body){if(s.kind==="noop"&&s.name==="tela"){this.width=Number((s.args[0]as any).value);this.height=Number((s.args[1]as any).value)}if(s.kind==="noop"&&s.name==="fundo")this.background=String((s.args[0]as any).value);if(s.kind==="actor")this.setupActor(s);if(s.kind==="hook")this.hooks[s.name]=s.body;if(s.kind==="collision")this.collisions.push({a:s.a,b:s.b,body:s.body});}this.renderer.resize(this.width,this.height);this.interpreter=new Interpreter(this);this.interpreter.run(program);this.runBlock(this.hooks.iniciar);this.draw();}
 start(){if(!this.running){this.running=true;this.raf=requestAnimationFrame(this.frame)}}
 stop(){this.running=false;if(this.raf)cancelAnimationFrame(this.raf);this.input.clear();}
 hasActor(name:string){return this.actors.has(this.key(name))}
 getActor(name:string){const a=this.actors.get(this.key(name));if(!a)throw new Error(`Ator "${name}" não existe.`);return a}
 keyDown(k:string){return this.input.isDown(k)}wasPressed(k:string){return this.input.wasPressed(k)}
 collides(a:string,b:string){return intersects(this.getActor(a).rect,this.getActor(b).rect)}
 distance(a:string,b:string){return distance(this.getActor(a),this.getActor(b))}
 say(v:string){console.log("[Bit]",v)}
 drawStatement(s:any,e:(x:any)=>unknown){const v=s.args.map(e);switch(s.shape){case"clear":this.renderer.clear(this.background);break;case"actor":this.renderer.actor(this.getActor(String(v[0])));break;case"retangulo":this.renderer.rect(+v[0],+v[1],+v[2],+v[3],v[4]);break;case"quadrado":this.renderer.square(+v[0],+v[1],+v[2],v[3]);break;case"text":this.renderer.text(String(v[0]),+v[1],+v[2],v[3]);break;}return null}
 handleNoop(name:string,args:unknown[]){if(name==="efeito")this.audio.effect(String(args[0]??""));if(name==="volume")this.audio.setVolume(Number(args[0]??.5));if(name==="toque")this.audio.note(String(args[0]??"do"),Number(args[1]??.12));return null}
 setupActor(s:any){const a=new Actor(s.name);for(const b of s.body){if(b.kind==="draw"){const v=b.args.map((x:any)=>this.literal(x));if(b.shape==="retangulo"){a.width=+v[0];a.height=+v[1];a.color=String(v[2]??"branco")}if(b.shape==="quadrado"){a.width=a.height=+v[0];a.color=String(v[1]??"branco")}}if(b.kind==="noop"){const v=b.args.map((x:any)=>this.literal(x));if(b.name==="posicao"){a.x=+v[0];a.y=+v[1]}if(b.name==="velocidade"){a.vx=+v[0];a.vy=+v[1];a.controlSpeed=Math.max(2,Math.abs(a.vx),Math.abs(a.vy))}if(b.name==="controlado")a.control=String(v.join(" ")).replace(/^por\s*/i,"");if(b.name==="limita")a.limit=true;if(b.name==="quica")a.bounce=true;if(b.name==="imagem")a.sprite=String(v[0]??"")}}this.actors.set(this.key(s.name),a)}
 private literal(e:any){return e?.kind==="literal"?e.value:e?.kind==="variable"?e.name:""}
 private key(v:string){return v.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase()}
 private runBlock(body:Stmt[]){for(const s of body)this.interpreter.exec(s)}
 private frame=()=>{if(!this.running)return;for(const a of this.actors.values())a.update(this.width,this.height,k=>this.input.isDown(k));this.runBlock(this.hooks.atualizar);for(const c of this.collisions)if(this.hasActor(c.a)&&this.hasActor(c.b)&&this.collides(c.a,c.b))this.runBlock(c.body);this.draw();this.input.endFrame();this.raf=requestAnimationFrame(this.frame)}
 private draw(){this.renderer.clear(this.background);this.runBlock(this.hooks.desenhar)}
}