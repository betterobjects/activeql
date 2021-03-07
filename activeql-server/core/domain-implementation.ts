import { Runtime } from './runtime';

export abstract class DomainImplementation {

  get pubsub() { return this.runtime.pubsub }

  constructor( protected runtime:Runtime ){}

}
