export class AudioEngine{
  private ctx:AudioContext|null=null;private gain:GainNode|null=null;private volume=.5;
  private ensure(){if(!this.ctx){this.ctx=new AudioContext();this.gain=this.ctx.createGain();this.gain.gain.value=this.volume;this.gain.connect(this.ctx.destination);}if(this.ctx.state==="suspended")void this.ctx.resume();return this.ctx;}
  setVolume(v:number){this.volume=Math.max(0,Math.min(1,v));if(this.gain)this.gain.gain.value=this.volume;}
  note(note:string,duration=.12){const freq:Record<string,number>={do:261.63,re:293.66,mi:329.63,fa:349.23,sol:392,la:440,si:493.88};const f=freq[note.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase()];if(!f)return;const c=this.ensure(),o=c.createOscillator(),g=c.createGain();o.type="square";o.frequency.value=f;g.gain.value=.15;o.connect(g);g.connect(this.gain!);o.start();g.gain.exponentialRampToValueAtTime(.001,c.currentTime+duration);o.stop(c.currentTime+duration+.02);}
  effect(name:string){const map:Record<string,string>={pulo:"mi",moeda:"mi",dano:"do",explosao:"do"};this.note(map[name.toLowerCase()]??"do",.08);}
}