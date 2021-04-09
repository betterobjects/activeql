import _ from 'lodash';

import { ActiveQLServer } from '../activeql-server';
import { AssocFromType, AssocToManyType, AssocToType, AttributeType, TypeType } from '../core/domain-configuration';
import { Runtime } from '../core/runtime';
import { Entity } from '../entities/entity';

// generate typed classes to programmatically use entities and types
export class TypesGenerator {

  private result:string[] = [];

  constructor( private runtime:Runtime ){}

  generate(){
    this.result = [];
    this.result.push( 'import { TypesGenerator, ActiveQLServer, Entity, ValidationViolation } from "activeql-server";' );
    this.result.push( 'import _ from "lodash";' );
    this.result.push( ''  );

    _.forEach( this.runtime.enums, enumName => this.addEnum( enumName ) );
    _.forEach( this.runtime.entities, (entity, name) => this.addThisEntity( name, entity) );
    _.forEach( this.runtime.domainDefinition.getResolvedConfiguration().type, (aType, name) => {
      this.addType( name, aType );
    });
    return _.join( this.result, '\n' );
  }

  private addEnum( enumName:string ){
    const config = _.get( this.runtime.domainDefinition.getResolvedConfiguration(), ['enum', enumName] );
    if( ! config ) return;
    this.result.push( `export enum ${enumName} {`  );
    _.forEach( config, (value, name) => this.result.push( `  ${name} = "${value}",`) );
    this.result.push( `}` );
  }

  private addType( name:string, aType:TypeType ){
    this.result.push( `export class ${name} {`  );
    _.forEach( aType.fields, (attribute, attributeName) => this.addAttribute( attributeName, attribute ));
    this.result.push( `}`  );
    this.result.push( ``  );
  }

  private addThisEntity( name:string, entity:Entity ){
    this.result.push( `export class ${name} {`  );
    this.result.push( `  readonly __typename:string = '${entity.typeName}';` );
    this.result.push( `  id:string = '';` );
    _.forEach( entity.implements, implEntity => this.addEntity( implEntity ) );
    this.addEntity( entity );
    this.addConstructor( entity.typeName )
    this.addFindById( entity.typeName );
    this.addFindByIds( entity.typeName );
    this.addFindByFilter( entity.typeName );
    this.addFindByAttribute( entity.typeName );
    this.addFindOneByAttribute( entity.typeName );
    this.addSave( entity.typeName );
    this.addInstanceSave( entity.typeName );
    this.addDelete( entity.typeName );
    this.result.push( `}`  );
    this.result.push( ``  );
  }

  private addConstructor( typeName:string ){
    this.result.push( `` );
    this.result.push( `  constructor( item?:any ){` );
    this.result.push( `    if( ! item ) return;` );
    this.result.push( `    _.merge( this, item);` );
    this.result.push( `    const entity = ActiveQLServer.runtime.entity('${typeName}');`);
    this.result.push( `    TypesGenerator.decorateItems( entity, this );`);
    this.result.push( `  }`);
    this.result.push( `` );
  }

  private addEntity( entity:Entity ){
    _.forEach( entity.attributes, (attribute, attributeName) => this.addAttribute( attributeName, attribute ));
    _.forEach( entity.assocTo, assocTo => this.addAssocTo( assocTo ));
    _.forEach( entity.assocToMany, assocToMany => this.addAssocToMany( assocToMany ));
    _.forEach( entity.assocFrom, assocFrom => this.addAssocFrom( assocFrom ));
  }


  private addAttribute( name:string, attribute:AttributeType ) {
    const type = this.getAttributeType( attribute );
    const initial = attribute.required ? this.getAttributeInitial( attribute ) : '';
    const mayBeUndefined = attribute.required ? '' : '?';
    this.result.push(`  ${name}${mayBeUndefined}: ${type}${initial};` );
  }

  private addFindById( typeName:string ){
    this.result.push( ''  );
    this.result.push( `  static async findById( id:string):Promise<${typeName}>{`  );
    this.result.push( `    const entity = ActiveQLServer.runtime?.entity('${typeName}') as Entity;`);
    this.result.push( `    const item:${typeName} = await entity.findById( id );`);
    this.result.push( `    return TypesGenerator.decorateItems( entity, item );`);
    this.result.push( `  }`  );
  }

  private addFindByIds( typeName:string ){
    this.result.push( ''  );
    this.result.push( `  static async findByIds( ids:string[] ):Promise<${typeName}[]>{`  );
    this.result.push( `    const entity = ActiveQLServer.runtime?.entity('${typeName}') as Entity;`);
    this.result.push( `    const items:${typeName}[] = await entity.findByIds( ids );`);
    this.result.push( `    return TypesGenerator.decorateItems( entity, items );`);
    this.result.push( `  }`  );
  }

  private addFindByFilter( typeName:string ){
    this.result.push( ''  );
    this.result.push( `  static async findByFilter( query:any ):Promise<${typeName}[]>{`  );
    this.result.push( `    const entity = ActiveQLServer.runtime?.entity('${typeName}') as Entity;`);
    this.result.push( `    const items:${typeName}[] = await entity.accessor.findByFilter( query );`);
    this.result.push( `    return TypesGenerator.decorateItems( entity, items );`);
    this.result.push( `  }`  );
  }

  private addFindByAttribute( typeName:string ){
    this.result.push( ''  );
    this.result.push( `  static async findByAttribute( attrValue:{[name:string]:any} ):Promise<${typeName}[]>{`  );
    this.result.push( `    const entity = ActiveQLServer.runtime?.entity('${typeName}') as Entity;`);
    this.result.push( `    const items:${typeName}[] = await entity.findByAttribute( attrValue );`);
    this.result.push( `    return TypesGenerator.decorateItems( entity, items );`);
    this.result.push( `  }`  );
  }

  private addFindOneByAttribute( typeName:string ){
    this.result.push( ''  );
    this.result.push( `  static async findOneByAttribute( attrValue:{[name:string]:any} ):Promise<${typeName}>{`  );
    this.result.push( `    const entity = ActiveQLServer.runtime?.entity('${typeName}') as Entity;`);
    this.result.push( `    const item:${typeName} = await entity.findOneByAttribute( attrValue );`);
    this.result.push( `    return TypesGenerator.decorateItems( entity, item );`);
    this.result.push( `  }`  );
  }

  private addInstanceSave( typeName:string ){
    this.result.push( ''  );
    this.result.push( `  async save():Promise<${typeName}> {`  );
    this.result.push( `    throw 'will be decorated';` );
    this.result.push( `  }`  );
  }

  private addSave( typeName:string ){
    this.result.push( ''  );
    this.result.push( `  static async save( item:any ):Promise<${typeName}|ValidationViolation[]>{`  );
    this.result.push( `    if( item.id === '') _.unset( item, 'id');`);
    this.result.push( `    const entity = ActiveQLServer.runtime?.entity('${typeName}') as Entity;`);
    this.result.push( `    item = await entity.accessor.save( item );`);
    this.result.push( `    if( Array.isArray(item) ) return item;`);
    this.result.push( `    return TypesGenerator.decorateItems( entity, item );`);
    this.result.push( `  }`  );
  }

  private addDelete( typeName:string ){
    this.result.push( ''  );
    this.result.push( `  static async delete( id:string ):Promise<boolean>{` );
    this.result.push( `    const entity = ActiveQLServer.runtime?.entity('${typeName}') as Entity;`);
    this.result.push( `    return entity.accessor.delete( id );`);
    this.result.push( `  }`  );
  }

  private getAttributeType( attribute:AttributeType ):string {
    const list = attribute.list;
    switch( attribute.type ){
      case 'String': return list ? "string[]" : "string";
      case 'Int':
      case 'Float': return list ? 'number[]' : 'number';
      case 'Boolean': return list ? 'boolean[]' : 'boolean';
      case 'JSON': return list ? 'any[]' : 'any';
      case 'Date':
      case 'DateTime': return list ? 'Date[]' : 'Date';
    }
    return list ? `${attribute.type}[]` : attribute.type;
  }

  private getAttributeInitial( attribute:AttributeType ):string {
    if( attribute.list ) return ' = []';
    switch( attribute.type ){
      case 'String': return " = ''";
      case 'Int':
      case 'Float': return ' = 0';
      case 'Boolean': return ' = false';
      case 'JSON': return ' = {}';
      case 'Date':
      case 'DateTime': return ` = new Date()`
    }
    const config = _.get( this.runtime.domainDefinition.getResolvedConfiguration(), ['enum', attribute.type] );
    if( ! config ) return ` = null`;
    const value = _.first( _.keys( config ) );
    return ` = ${attribute.type}.${value}`;
  }

  private addAssocTo( assocTo:AssocToType ){
    const entity = this.runtime.entity( assocTo.type );
    const mayBeUndefined = assocTo.required ? '' : '|undefined';
    this.result.push(`  ${entity.foreignKey}: string${assocTo.required ? " = ''" : mayBeUndefined };` );
    this.result.push(`  ${entity.typeQueryName}: () => Promise<${assocTo.type}${mayBeUndefined}> = () => {throw 'will be decorated'};`);
  }

  private addAssocToMany( assocToMany:AssocToManyType ){
    const entity = this.runtime.entity( assocToMany.type );
    const mayBeUndefined = assocToMany.required ? '' : '?';
    this.result.push(`  ${entity.foreignKeys}${mayBeUndefined}: string[]${mayBeUndefined ? '' : ' = []'};` );
    this.result.push(`  ${entity.typesQueryName}: () => Promise<${assocToMany.type}[]> = () => {throw 'will be decorated'};`);
  }

  private addAssocFrom(  assocFrom:AssocFromType ){
    const entity = this.runtime.entity( assocFrom.type );
    this.result.push(`  ${entity.typesQueryName}: () => Promise<${assocFrom.type}[]> = () => {throw 'will be decorated'};`);
  }

  static decorateItems( entity:Entity, items:any ){
    if( _.isNil( items ) ) return undefined;
    return _.isArray( items ) ?
      _.map( items, item => this.decorateItem( entity, item ) ) :
      this.decorateItem( entity, items );
  }

  private static decorateItem( entity:Entity, item:any ):any {
    _.forEach( entity.assocTo, assocTo => {
      const assocEntity:Entity = ActiveQLServer.runtime?.entity( assocTo.type );
      const foreignKey = _.get( item, assocEntity.foreignKey );
      _.set( item, assocEntity.typeQueryName, () => {
        const entity =  assocEntity.isPolymorph ?
          ActiveQLServer.runtime.entity( _.get(item, assocEntity.typeField ) ) :
          assocEntity;
        return entity.findById( foreignKey )
      });
    });

    _.forEach( entity.assocToMany, assocToMany => {
      const assocEntity:Entity = ActiveQLServer.runtime.entity( assocToMany.type ) as Entity;
      const foreignKeys = _.get( item, assocEntity.foreignKeys );
      _.set( item, assocEntity?.typesQueryName, () => {
        const entity =  assocEntity.isPolymorph ?
          ActiveQLServer.runtime.entity( _.get(item, assocEntity.typeField ) ) :
          assocEntity;
        return entity.findByIds( foreignKeys )
      });
    });

    _.forEach( entity.assocFrom, assocFrom => {
      const assocEntity:Entity = ActiveQLServer.runtime.entity( assocFrom.type ) as Entity;
      const query = _.set( {}, entity.foreignKey, item.id );
      _.set( item, assocEntity.typesQueryName, () => assocEntity.findByAttribute( query ));
    });

    _.set( item, 'save', async () => {
      if( item.id === '') _.unset( item, 'id');
      const result = await entity.accessor.save( item );
      if( _.isArray( result ) ) throw new Error( JSON.stringify(result) );
      _.merge( item, result );
      return this.decorateItems( entity, result );
    });

    return item;
  }

}
