import _ from 'lodash';

import { AssocToManyType, AssocToType, AssocFromType, AttributeType } from '../core/domain-configuration';
import { Runtime } from '../core/runtime';
import { Entity } from '../entities/entity';

export class TypesGenerator {

  private result:string[] = [];

  constructor( private runtime:Runtime ){}

  generate(){
    this.result = [];
    this.result.push( 'import { GeneratedTypeDecorator } from "./generated-type-decorator";'  );
    this.result.push( 'import { ActiveQLServer, Entity, ValidationViolation } from "activeql-server";'  );
    this.result.push( ''  );

    _.forEach( this.runtime.entities, (entity, name) => this.addThisEntity( name, entity) );
    return _.join( this.result, '\n' );
  }

  private addThisEntity( name:string, entity:Entity ){
    this.result.push( `export class ${name} {`  );
    this.result.push( `  id:string = '';` );
    _.forEach( entity.implements, implEntity => this.addEntity( implEntity ) );
    this.addEntity( entity );
    this.addFindById( entity.typeName );
    this.addFindByIds( entity.typeName );
    this.addFindByAttribute( entity.typeName );
    this.addFindOneByAttribute( entity.typeName );
    this.addSave( entity.typeName );
    this.addInstanceSave( entity.typeName );
    this.addDelete( entity.typeName );
    this.result.push( `}`  );
    this.result.push( ``  );
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
    this.result.push( `    return GeneratedTypeDecorator.decorateAssocs( entity, item );`);
    this.result.push( `  }`  );
  }

  private addFindByIds( typeName:string ){
    this.result.push( ''  );
    this.result.push( `  static async findByIds( ids:string[] ):Promise<${typeName}[]>{`  );
    this.result.push( `    const entity = ActiveQLServer.runtime?.entity('${typeName}') as Entity;`);
    this.result.push( `    const items:${typeName}[] = await entity.findByIds( ids );`);
    this.result.push( `    return GeneratedTypeDecorator.decorateAssocs( entity, items );`);
    this.result.push( `  }`  );
  }

  private addFindByAttribute( typeName:string ){
    this.result.push( ''  );
    this.result.push( `  static async findByAttribute( query:any ):Promise<${typeName}[]>{`  );
    this.result.push( `    const entity = ActiveQLServer.runtime?.entity('${typeName}') as Entity;`);
    this.result.push( `    const items:${typeName}[] = await entity.findByAttribute( query );`);
    this.result.push( `    return GeneratedTypeDecorator.decorateAssocs( entity, items );`);
    this.result.push( `  }`  );
  }

  private addFindOneByAttribute( typeName:string ){
    this.result.push( ''  );
    this.result.push( `  static async findOneByAttribute( query:any ):Promise<${typeName}>{`  );
    this.result.push( `    const entity = ActiveQLServer.runtime?.entity('${typeName}') as Entity;`);
    this.result.push( `    const item:${typeName} = await entity.findOneByAttribute( query );`);
    this.result.push( `    return GeneratedTypeDecorator.decorateAssocs( entity, item );`);
    this.result.push( `  }`  );
  }

  private addInstanceSave( typeName:string ){
    this.result.push( ''  );
    this.result.push( `  async save():Promise<${typeName}|ValidationViolation[]> {`  );
    this.result.push( `    throw 'will be decorated';` );
    this.result.push( `  }`  );
  }

  private addSave( typeName:string ){
    this.result.push( ''  );
    this.result.push( `  static async save( item:any ):Promise<${typeName}|ValidationViolation[]>{`  );
    this.result.push( `    const entity = ActiveQLServer.runtime?.entity('${typeName}') as Entity;`);
    this.result.push( `    return entity.accessor.save( item );`);
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
      case 'Int':
      case 'Float': return list ? 'number[]' : 'number';
      case 'Boolean': return list ? 'boolean[]' : 'boolean';
      case 'JSON': return list ? 'any[]' : 'any';
      case 'Date':
      case 'DateTime': return list ? 'Date[]' : 'Date';

    }
    return list ? "string[]" : "string";
  }

  private getAttributeInitial( attribute:AttributeType ):string {
    if( attribute.list ) return ' = []';
    switch( attribute.type ){
      case 'Int':
      case 'Float': return ' = 0';
      case 'Boolean': return ' = false';
      case 'JSON': return ' = {}';
      case 'Date':
      case 'DateTime': return ` = new Date()`
    }
    return " = ''";
  }

  private addAssocTo( assocTo:AssocToType ){
    const entity = this.runtime.entity( assocTo.type );
    const mayBeUndefined = assocTo.required ? '' : '?';
    this.result.push(`  ${entity.foreignKey}${mayBeUndefined}: string${mayBeUndefined ? '' : " = ''"};` );
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

}
