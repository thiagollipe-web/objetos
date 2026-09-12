export class Environment {
  private values=new Map<string,unknown>();

  constructor(
    private readonly parent?:Environment
  ){}

  private key(name:string):string {
    return name
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g,"")
      .toLowerCase();
  }

  define(
    name:string,
    value:unknown
  ):void {
    this.values.set(
      this.key(name),
      value
    );
  }

  set(
    name:string,
    value:unknown
  ):void {
    const key=this.key(name);

    if(this.values.has(key)) {
      this.values.set(key,value);
      return;
    }

    if(this.parent) {
      this.parent.set(name,value);
      return;
    }

    this.values.set(key,value);
  }

  has(name:string):boolean {
    const key=this.key(name);

    return this.values.has(key) ||
      Boolean(
        this.parent?.has(name)
      );
  }

  get(name:string):unknown {
    const key=this.key(name);

    if(this.values.has(key)) {
      return this.values.get(key);
    }

    if(this.parent) {
      return this.parent.get(name);
    }

    throw new Error(
      `A variável "${name}" não existe.`
    );
  }
}