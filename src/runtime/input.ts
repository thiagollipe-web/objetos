export class InputManager {
  private down=new Set<string>(); private pressed=new Set<string>();
  constructor(private target:Window=window){
    target.addEventListener("keydown",this.keydown);
    target.addEventListener("keyup",this.keyup);
    target.addEventListener("blur",this.clear);
  }
  private norm(k:string){const n=k.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase();return({cima:"arrowup",baixo:"arrowdown",esquerda:"arrowleft",direita:"arrowright","espaco":" ","space":" ","enter":"enter"} as Record<string,string>)[n]??n;}
  isDown(k:string){return this.down.has(this.norm(k));}
  wasPressed(k:string){return this.pressed.has(this.norm(k));}
  setVirtualKey(k:string,on:boolean){const n=this.norm(k);if(on){if(!this.down.has(n))this.pressed.add(n);this.down.add(n);}else this.down.delete(n);}
  endFrame(){this.pressed.clear();}
  clear=()=>{this.down.clear();this.pressed.clear();}
  private keydown=(e:KeyboardEvent)=>{const n=this.norm(e.key);if(!this.down.has(n))this.pressed.add(n);this.down.add(n);if(["arrowup","arrowdown","arrowleft","arrowright"," "].includes(n))e.preventDefault();}
  private keyup=(e:KeyboardEvent)=>this.down.delete(this.norm(e.key));
}