export class Actor {
  x=0;y=0;vx=0;vy=0;width=8;height=8;color="branco";
  control:string|null=null;controlSpeed=2;bounce=false;limit=false;sprite:string|null=null;
  constructor(public readonly name:string){}
  update(W:number,H:number,isDown:(key:string)=>boolean){
    const c=(this.control??"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase();
    if(c.includes("seta")){this.vx=(isDown("direita")?this.controlSpeed:0)+(isDown("esquerda")?-this.controlSpeed:0);this.vy=(isDown("baixo")?this.controlSpeed:0)+(isDown("cima")?-this.controlSpeed:0);}
    else if(c.includes("cima/baixo")||c.includes("w/s")||c.includes("cima")||c.includes("baixo")){this.vy=(isDown("baixo")||isDown("s")?this.controlSpeed:0)+(isDown("cima")||isDown("w")?-this.controlSpeed:0);}
    else if(c.includes("esquerda/direita")||c.includes("a/d")){this.vx=(isDown("direita")||isDown("d")?this.controlSpeed:0)+(isDown("esquerda")||isDown("a")?-this.controlSpeed:0);}
    this.x+=this.vx;this.y+=this.vy;
    if(this.limit){this.x=Math.max(0,Math.min(W-this.width,this.x));this.y=Math.max(0,Math.min(H-this.height,this.y));}
    if(this.bounce){if(this.x<0||this.x+this.width>W){this.x=Math.max(0,Math.min(W-this.width,this.x));this.vx=-this.vx;}if(this.y<0||this.y+this.height>H){this.y=Math.max(0,Math.min(H-this.height,this.y));this.vy=-this.vy;}}
  }
  get rect(){return{x:this.x,y:this.y,width:this.width,height:this.height};}
}