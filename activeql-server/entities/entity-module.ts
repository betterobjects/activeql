import { Entity } from './entity';

export abstract class EntityModule  {

  get runtime() { return this.entity.runtime }
  get name() { return this.entity.name }

  constructor( protected readonly entity:Entity ) {}

  warn<T>( message:string, type:T):T {
    console.warn( message );
    return type;
  }
}
