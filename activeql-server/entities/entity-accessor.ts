import _ from 'lodash';

import { Paging, Sort } from '../core/data-store';
import { AssocType, AttributeType } from '../core/domain-configuration';
import { EntityDeleter } from './entity-deleter';
import { EntityModule } from './entity-module';
import { ValidationViolation } from './entity-validation';
import { parseActiveQLScalarDate } from '../core/activeql-schema-types'
import { Entity } from './entity';

//
//
export class EntityAccessor extends EntityModule {

  protected deleter = new EntityDeleter(this.entity);
  get dataStore() { return this.entity.runtime.dataStore }

  /**
   *
   */
  async findById( id:any ):Promise<any> {
    if( ! id ) throw new Error( `[${this.entity.name}].findById - no id provided` );
    const item = await this.dataStore.findById( this.entity, id );
    if( ! item ) throw new Error( `[${this.entity.name}] with id '${id}' does not exist`);
    return item;
  }

  /**
   *
   */
  async findByIds( ids:any[] ):Promise<any[]> {
    return this.dataStore.findByIds( this.entity, ids );
  }

  /**
   *
   */
  async findByAttribute( attrValue:{[name:string]:any} ):Promise<any[]>{
    this.replaceAssocToItemWithForeignKey( attrValue );
    return this.dataStore.findByAttribute( this.entity.getThisOrAllNestedEntities(), attrValue );
  }

  /**
   *
   * @param filter as it comes from the graphql request
   */
  async findByFilter( filter:any, sort?:Sort, paging?:Paging ):Promise<any[]> {
    const items = this.entity.isPolymorph ?
      await this.dataStore.findByFilter( this.entity.getThisOrAllNestedEntities(), filter, sort, paging ) :
      await this.dataStore.findByFilter( this.entity, filter, sort, paging );
    return items;
  }

  /**
   *
   */
  async save( attributes:any, skipValidation = false ):Promise<any|ValidationViolation[]> {
    await this.setDefaultValues( attributes );
    this.replaceAssocItemsWithIds( attributes );
    this.setTimestamps( attributes );
    this.sanitizeValues( attributes );
    if( ! skipValidation ){
      const validationViolations = await this.entity.validate( attributes );
      if( _.size( validationViolations ) ) return validationViolations;
    }
    const item = _.has( attributes, 'id') ?
      await this.update( attributes ) :
      await this.create( attributes );
    return item;
  }

  /**
   *
   */
  private async create( attributes:any ):Promise<any> {
    for( const assocTo of this.entity.assocToInput ) await this.createInlineInput( assocTo, attributes );
    const item = await this.dataStore.create( this.entity, attributes );
    if( this.entity.subscriptions ) this.runtime.pubsub.publish(`create${this.entity.typeName}`, item );
    return item;
  }


  /**
   *
   */
  private async update( attributes:any ):Promise<any> {
    const item = await this.dataStore.update( this.entity, attributes );
    if( this.entity.subscriptions ) this.runtime.pubsub.publish(`update${this.entity.typeName}`, item );
    return item;
  }

  /**
   *
   */
  async delete( id:any ):Promise<boolean> {
    await this.deleter.deleteAssocFrom( id );
    const result = await this.dataStore.delete( this.entity, id );
    if( this.entity.subscriptions ) this.runtime.pubsub.publish(`delete${this.entity.typeName}`, id );
    return result;
  }

  /**
   *
   */
  truncate():Promise<boolean>{
    return this.dataStore.truncate( this.entity );
  }


  private replaceAssocItemsWithIds( item:any ):any {
    _.forEach( item, (value, key) => {
      if( ! _.has( value, '__typename' ) ) return;
      let entity:Entity|undefined = this.runtime.entity( value.__typename );
      if( ! _.isEmpty( entity.implements ) ) entity = _.find( entity.implements, e => e.typeQueryName === key );
      if( ! entity ) throw new Error(`cant find entity for '${key}'`);
      _.set( item, entity.foreignKey, value.id );
      if( entity.isPolymorph ) _.set( item, entity.typeField, value.__typename );
      _.unset( item, key );
    });
  }
  /**
   *
   */
  private async createInlineInput( assocTo: AssocType, attrs: any ) {
    const refEntity = this.runtime.entities[assocTo.type];
    const input = _.get( attrs, refEntity.singular );
    if( ! input ) return;
    if ( _.has( attrs, refEntity.foreignKey ) ) throw new Error(
      `'${this.entity.name} you cannot have '${refEntity.foreignKey}' if you provide inline input'` );
    const item = await this.dataStore.create( refEntity, input );
    _.set( attrs, refEntity.foreignKey, _.toString( item.id ) );
    _.unset( attrs, refEntity.singular );
  }

  /**
   *
   */
  private async setDefaultValues( attributes:any ):Promise<void> {
    for( const name of _.keys( this.entity.attributes ) ){
      const attribute = this.entity.attributes[name];
      if( _.has( attributes, name ) || _.isUndefined( attribute.defaultValue ) ) continue;
      const defaultValue = _.isFunction( attribute.defaultValue ) ?
        await Promise.resolve( attribute.defaultValue( attributes, this.runtime ) ) :
        attribute.defaultValue;
      _.set( attributes, name, defaultValue );
    }
  }

  /**
   *
   */
  private setTimestamps( attributes:any ):void {
    const now = new Date();
    if( ! attributes.id ) _.set( attributes, 'createdAt', now );
    _.set( attributes, 'updatedAt', now );
  }

  private sanitizeValues( item:any ){
    _.forEach( this.entity.attributes, (attribute, name) => {
      const value = _.get( item, name);
      if( _.isNil( value ) ) return _.unset( item, name );
      _.set( item, name, attribute.list ?
        this.sanitizedListValues( attribute, value ) :
        this.sanitizedValue( attribute, value ) );
    });
  }

  private sanitizedListValues(attribute:AttributeType, values:any):any[]{
    if( ! _.isArray( values ) ) values = [values];
    return _.map( values, value => this.sanitizedValue( attribute, value ) );
  }

  private sanitizedValue( attribute:AttributeType, value:any ){
    switch( _.toLower(attribute.type) ){
      case 'string': return _.isString( value ) ? value : _.toString( value );
      case 'int': return _.isInteger( value ) ? value : _.toInteger( value );
      case 'float': return _.isNumber( value ) ? value : _.toNumber( value );
      case 'date': return parseActiveQLScalarDate( value )
      case 'datetime': return _.isDate( value ) ? value : new Date( value )
    }
    return value;
  }

  private replaceAssocToItemWithForeignKey(attrValue:{[name:string]:any}){
    _.forEach( this.entity.assocTo, assocTo => {
      const assocEntity = this.runtime.entity( assocTo.type );
      const assocValue = _.get( attrValue, assocEntity.typeQueryName );
      if( ! assocValue || ! _.has( assocValue, 'id' ) ) return;
      _.set( attrValue, assocEntity.foreignKey, assocValue.id );
      _.unset( attrValue, assocEntity.typeQueryName );
    });
  }

}
