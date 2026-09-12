import{color}from"./palette";import type{Actor}from"./actor";
export class Renderer{
  constructor(public readonly canvas:HTMLCanvasElement){const c=canvas.getContext("2d");if(!c)throw new Error("Canvas 2D indisponível.");this.ctx=c;this.ctx.imageSmoothingEnabled=false;canvas.style.imageRendering="pixelated";}
  private ctx:CanvasRenderingContext2D;
  resize(w:number,h:number){this.canvas.width=w;this.canvas.height=h;this.ctx.imageSmoothingEnabled=false;}
  clear(c:unknown){this.ctx.fillStyle=color(c);this.ctx.fillRect(0,0,this.canvas.width,this.canvas.height);}
  rect(x:number,y:number,w:number,h:number,c:unknown){this.ctx.fillStyle=color(c);this.ctx.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));}
  square(x:number,y:number,s:number,c:unknown){this.rect(x,y,s,s,c);}
  text(s:string,x:number,y:number,c:unknown){this.ctx.fillStyle=color(c);this.ctx.font="8px monospace";this.ctx.textBaseline="top";this.ctx.fillText(s,Math.round(x),Math.round(y));}
  actor(a:Actor){if(a.sprite)this.sprite(a.sprite,a.x,a.y,a.width,a.height,a.color);else this.rect(a.x,a.y,a.width,a.height,a.color);}
  sprite(data:string,x:number,y:number,w:number,h:number,c:unknown){const rows=data.replace(/\r/g,"").trim().split("\n").map(r=>r.trim());const cw=w/(rows[0]?.length||1),ch=h/(rows.length||1);for(let r=0;r<rows.length;r++)for(let col=0;col<rows[r].length;col++)if(!".0 ".includes(rows[r][col]))this.rect(x+col*cw,y+r*ch,cw,ch,rows[r][col]);}
}