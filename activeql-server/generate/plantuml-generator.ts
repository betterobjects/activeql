import _ from 'lodash';

import {
  AssocToManyType,
  AssocToType,
  AttributeType,
  DomainConfigurationType,
  EntityType,
} from '../core/domain-configuration';

export class PlantUMLGenerator {

  private result:string[] = [];

  constructor( private domainConfiguration:DomainConfigurationType, private name = 'domain' ){}

  generate(){
    this.result = [`@startuml ${this.name}`];
    this.result.push( ''  );
    _.forEach( this.domainConfiguration.entity, (entity, name) => this.addEntity( name, entity) );
    this.result.push('@enduml');
    return _.join( this.result, '\n' );
  }

  private addEntity( name:string, entity:EntityType ){
    this.result.push( `class ${name} {`  );
    _.forEach( entity.attributes, (attribute, attributeName) => this.addAttribute( attributeName, attribute ));
    this.result.push( `}`  );
    this.result.push( ''  );
    _.forEach( entity.assocTo, assocTo => this.addAssocTo( name, assocTo ));
    _.forEach( entity.assocToMany, assocToMany => this.addAssocToMany( name, assocToMany ));
    _.forEach( entity.implements, superType => this.addSuperType( name, superType ) );
    _.forEach( entity.union, unionType => this.addSuperType( unionType, name ) );
  }

  private addAttribute( name:string, attribute:AttributeType ) {
    const required = attribute.required ? '**' : '';
    const list = attribute.list ? '[]' : ''
    this.result.push(`  ${required}${name}: ${attribute.type}${list}${required}` );
  }

  private addAssocTo( name:string, assocTo:AssocToType ){
    const cardinality = assocTo.required ? '1' : '0..1';
    this.result.push(`${name} -- "${cardinality}" ${assocTo.type}` );
    this.result.push( '' );
  }

  private addAssocToMany( name:string, assocToMany:AssocToManyType ){
    const cardinality = assocToMany.required ? '1..*' : '*';
    this.result.push(`${name} -- "${cardinality}" ${assocToMany.type}` );
    this.result.push( '' );
  }

  private addSuperType( name:string, superType:string ){
    this.result.push(`${name} --|> ${superType}` );
    this.result.push( '' );
  }

}
