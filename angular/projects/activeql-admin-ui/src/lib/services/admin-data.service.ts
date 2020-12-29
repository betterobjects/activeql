import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { DocumentNode } from 'graphql';
import gql from 'graphql-tag';
import _, { reject } from 'lodash';

import { EntityType } from './domain-configuration';
import { AdminConfigService, SaveResult } from '../services/admin-config.service';

@Injectable({ providedIn: 'root' })
export class AdminDataService  {

  constructor(
    private adminConfig:AdminConfigService,
    private apollo:Apollo
  ) {}

  save( id:string|undefined, input:any, files:_.Dictionary<File>, entity:EntityType ):Promise<SaveResult> {
    this.sanitizeInput( input, entity );
    const variables = _.set( {}, 'input', input );
    _.merge( variables, files );
    return id ? this.update( id, variables, entity ) : this.create( variables, entity );
  }

  delete( id:string, entity:EntityType ):Promise<string[]>{
    const deleteItem = gql`mutation { ${entity.deleteMutationName}(id: "${id}" )  }`;
    return new Promise( (resolve, reject) => {
      this.apollo.mutate({ mutation: deleteItem }).subscribe(({data, errors}) => {
        if( errors ) return reject( errors );
        const violations = _.get( data, entity.deleteMutationName ) as string[];
        resolve( violations );
      }, error => reject( error ) );
    });
  }

  private sanitizeInput( input:any, entity:EntityType ):void {
    this.sanitizeAssocToInput( input, entity );
    this.sanitizeAssocToManyInput( input, entity );
    this.sanitizeAttributeInput( input, entity );
  }

  private sanitizeAssocToInput( input:any, entity:EntityType ):void {
    _.forEach( entity.assocTo, assocTo => {
      const id = _.get( input, assocTo.type );
      if( _.isNil( id ) ) return;
      const assocEntity = _.get( this.adminConfig.domainConfiguration, ['entity', assocTo.type ] );
      _.unset( input, assocTo.type );
      _.set( input, assocEntity.foreignKey, id );
    });
  }

  private sanitizeAssocToManyInput( input:any, entity:EntityType ):void {
    _.forEach( entity.assocToMany, assocToMany => {
      let ids = _.get( input, assocToMany.type );
      if( _.isNil( ids ) ) return;
      if( ! _.isArray( ids ) ) ids = [ids]
      const assocEntity = _.get( this.adminConfig.domainConfiguration, ['entity', assocToMany.type ] );
      _.unset( input, assocToMany.type );
      _.set( input, assocEntity.foreignKeys, ids );
    });
  }

  private sanitizeAttributeInput( input:any, entity:EntityType ):void {
    _.forEach( entity.attributes, (attribute, name) => {
      if( attribute.type === 'File' ) return _.unset( input, name );
      const value = _.get( input, name );
      if( _.isNil( value ) ) return;
      switch( attribute.type ) {
        case 'Int': return _.set( input, name, _.toInteger( value ) );
        case 'Float': return _.set( input, name, _.toNumber( value ) );
      }
    });
  }

  private create( variables:any, entity:EntityType ):Promise<SaveResult> {
    const mutation = this.getCreateMutation( entity )
    const context = this.getMutationContext( variables );
    return new Promise( (resolve, reject) => {
      this.apollo.mutate({ mutation, variables, context }).subscribe(({data, errors}) => {
        if( errors ) return reject( errors );
        resolve({
          violations: _.get( data, [entity.createMutationName, 'validationViolations'] ),
          id: _.get( data, [entity.createMutationName, entity.typeQueryName, 'id'] )
        });
      }, error => reject( error ) );
    });
  }

  private getCreateMutation( entity:EntityType ):DocumentNode {
    const fileVariableDeclaration = _(this.fileAttributes(entity)).map( attr => `$${attr}: Upload` ).join(' ');
    const fileVariableAssign = _(this.fileAttributes(entity)).map( attr => `${attr}: $${attr}` ).join(' ');
    return gql`mutation($input: ${entity.createInputTypeName} ${fileVariableDeclaration} ) {
      ${entity.createMutationName}(${entity.typeQueryName}: $input ${fileVariableAssign} ) {
        validationViolations{ attribute message }
        ${entity.typeQueryName} { id }
      }
    }`;
  }

  private async update( id:string, variables:any, entity:EntityType ):Promise<SaveResult> {
    _.set( variables, 'input.id', id );
    const mutation = this.getUpdateMutation( entity );
    const context = this.getMutationContext( variables );
    return new Promise( (resolve, reject) => {
      this.apollo.mutate({mutation, variables, context }).subscribe(({data, errors}) => {
        if( errors ) reject( errors );
        resolve({
          violations: _.get( data, [entity.updateMutationName, 'validationViolations'] ),
          id: _.get( data, [entity.updateMutationName, entity.typeQueryName, 'id'] )
        });
      }, error => reject( error ) );
    });
  }

  private getUpdateMutation( entity:EntityType ):DocumentNode {
    const fileVariableDeclaration = _(this.fileAttributes(entity)).map( attr => `$${attr}: Upload` ).join(' ');
    const fileVariableAssign = _(this.fileAttributes(entity)).map( attr => `${attr}: $${attr}` ).join(' ');
    return gql`mutation($input: ${entity.updateInputTypeName} ${fileVariableDeclaration} ) {
      ${entity.updateMutationName}(${entity.typeQueryName}: $input ${fileVariableAssign} ) {
        validationViolations{ attribute message }
        ${entity.typeQueryName} { id }
      }
    }`;
  }

  private fileAttributes( entity:EntityType ):string[] {
    return _.map( _.filter( _.values( entity.attributes ),
      attribute => attribute.type === 'File' ), attribute => attribute.name  );
  }

  private getMutationContext = (variables:any) => ({ useMultipart: _.keys( variables ).length > 0 });

}
