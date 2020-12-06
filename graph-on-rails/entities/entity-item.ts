import _ from 'lodash';

import { Entity } from './entity';
import { ValidationViolation } from './entity-validation';

//
//
export class EntityItem {

  get runtime() { return this.entity.runtime }
  get id() { return _.toString( this.item.id ) }
  get name() { return this.entity.name }

  /**
   *
   */
  constructor( private readonly entity:Entity, public readonly item:any ){}

  static async create( entity:Entity, item:any ):Promise<EntityItem>{
    item = _.merge({}, item ); // this is because the Apollo resolver refuse to resolve the orginal item instance
    const entityItem = new EntityItem( entity, item );
    return entityItem;
  }

  /**
   *
   */
  async assocTo( name:string ):Promise<EntityItem|undefined> {
    const assocTo = _.find( this.entity.assocTo, assocTo => assocTo.type === name );
    if( ! assocTo ) return this.warn( `no such assocTo '${name}'`, undefined );
    let foreignEntity = this.runtime.entities[assocTo.type];
    if( ! foreignEntity ) return this.warn( `assocTo '${name}' is no entity`, undefined );
    const foreignKey = _.get( this.item, foreignEntity.foreignKey);
    if( foreignEntity.isPolymorph ){
      const specificType = _.get( this.item, foreignEntity.typeField );
      foreignEntity = this.runtime.entities[specificType];
      if( ! foreignEntity ) return undefined;
    }
    return foreignKey ? foreignEntity.findById( foreignKey ) : undefined;
  }

  /**
   *
   */
  async assocToMany( name:string ):Promise<EntityItem[]> {
    const assocToMany = _.find( this.entity.assocToMany, assocToMany => assocToMany.type === name );
    if( ! assocToMany ) return this.warn(`no such assocToMany '${name}'`, []);
    const foreignEntity = this.runtime.entities[assocToMany.type];
    if( ! foreignEntity ) return this.warn( `assocToMany '${name}' is no entity`, [] );
    const foreignKeys = _.get( this.item, foreignEntity.foreignKeys);
    return foreignEntity.findByIds( foreignKeys );
  }

  /**
   *
   */
  async assocFrom( name:string ):Promise<EntityItem[]>{
    const assocFrom = _.find( this.entity.assocFrom, assocFrom => assocFrom.type === name );
    if( ! assocFrom ) return this.warn(`no such assocFrom '${name}'`, []);
    const foreignEntity = this.runtime.entities[assocFrom.type];
    if( ! foreignEntity ) return this.warn( `assocFrom '${name}' is no entity`, [] );
    const entites = foreignEntity.isPolymorph ? foreignEntity.entities : [foreignEntity];
    const enits:EntityItem[] = [];
    for( const entity of entites ){
      const foreignKey = entity.isAssocToMany( this.entity ) ? this.entity.foreignKeys : this.entity.foreignKey;
      const attr = _.set({}, foreignKey, _.toString( this.item.id ) );
      enits.push( ... await entity.findByAttribute( attr ) );
    }
    return enits;
  }

  /**
   *
   */
  async save( skipValidation = false ):Promise<EntityItem>{
    const allowed = this.getAllowedAttributes();
    const attrs = _.pick( this.item, allowed );
    const item = await this.entity.accessor.save( attrs, skipValidation );
    if( _.isArray( item ) ) throw this.getValidationError( item );
    return item;
  }

  validate():Promise<ValidationViolation[]>{
    return this.entity.validate( this.item );
  }

  /**
   *
   */
  delete():Promise<boolean>{
    return this.entity.accessor.delete( this.id );
  }


  //
  //
  private getAllowedAttributes():string[]{
    const entities = _.compact( _.concat( this.entity, this.entity.implements ) );
    return _.concat( 'id', _.flatten( _.map( entities, entity => {
      return _.flatten( _.compact( _.concat(
        _.keys(entity.attributes),
        _(entity.assocTo).map( assocTo => {
            const entity = this.runtime.entities[assocTo.type];
            if( ! entity ) return;
            return entity.isPolymorph ? [entity.foreignKey, entity.typeField ] : entity.foreignKey;
          }).compact().flatten().value(),
        _(this.entity.assocToMany).map( assocTo => {
            const entity = this.runtime.entities[assocTo.type];
            if( ! entity ) return;
            return entity.isPolymorph ? [entity.foreignKeys, entity.typeField ] : entity.foreignKeys;
        }).compact().flatten().value()
      )));
    })));
  }

  //
  //
  private warn<T>( msg:string, returnValue:T ):T{
    console.warn( `EntitItem '${this.entity.name}': ${msg}`);
    return returnValue;
  }

  //
  //
  private getValidationError( violations:ValidationViolation[] ):Error {
    const msg = [`${this.entity.name}] could not save, there are validation violations`];
    msg.push( ... _.map( violations, violation => `[${violation.attribute}] ${violation.message}`) );
    return new Error( _.join(msg, '\n') );
  }

  toString(){ return `[${this.entity.name}:${this.id}]` }

}
