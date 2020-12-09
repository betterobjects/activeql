import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { DocumentNode } from 'graphql';
import gql from 'graphql-tag';
import * as _ from 'lodash';
import {
  AdminConfig,
  AdminConfigType,
  EntityConfigType,
  SaveReturnType as SaveResultType,
} from '../lib/admin-config';

import { MetaDataService } from './meta-data.service';

@Injectable({providedIn: 'root'})
export class AdminService {

  private adminConfig:AdminConfigType;

  constructor(
    private metaDataService:MetaDataService,
    protected apollo:Apollo ){}

  async init( adminConfig:() => Promise<AdminConfigType> ):Promise<any>{
    const metaData = await this.metaDataService.getMetaData();
    this.adminConfig = await AdminConfig.getInstance().getConfig( metaData, adminConfig );
  }

  seed():Promise<any> {
    const mutation = gql`mutation { seed( truncate: true ) }`;
    return new Promise( resolve => this.apollo.mutate({ mutation }).subscribe(({data}) => resolve(data)) );
  }

  getMenuEntities():EntityConfigType[] {
    return this.adminConfig.menu ?
      _.compact( _.map( this.adminConfig.menu, item => this.adminConfig.entities[item] ) ) :
      _.values( this.adminConfig.entities );
  }

  getEntityConfig( path:string ):EntityConfigType {
    if( ! this.adminConfig ) throw new Error(`AdminService not yet initialized`);
    return _.get( this.adminConfig, ['entities', path] );
  }

  delete( id:string, deleteMutation:string ):Promise<string[]>{
    const deleteItem = gql`mutation { ${deleteMutation}(id: "${id}" )  }`;
    return new Promise( resolve => {
      this.apollo.mutate({ mutation: deleteItem }).subscribe(({data}) => {
        const violations = _.get( data, deleteMutation ) as string[];
        resolve( violations );
      });
    });
  }

  save( id:string|undefined, input:any, files:_.Dictionary<File>, config:EntityConfigType ):Promise<SaveResultType> {
    this.sanitizeInput( input, config );
    const variables = _.set( {}, 'input', input );
    _.merge( variables, files );
    return id ? this.update( id, variables, config ) : this.create( variables, config );
  }

  private sanitizeInput( input:any, config:EntityConfigType ):void {
    _.forEach( config.fields, field => {
      const value = _.get( input, field.name );
      if( ! _.isUndefined( value ) ) switch( field.type ) {
        case 'file': return _.unset( input, field.name );
        case 'int': return _.set( input, field.name, _.toInteger( value ) );
      }
    });
  }

  private create( variables:any, config:EntityConfigType ):Promise<SaveResultType> {
    const mutation = this.getCreateMutation( config );
    const context = this.getMutationContext( variables );
    return new Promise( resolve => {
      this.apollo.mutate({ mutation, variables, context }).subscribe(({data}) => resolve({
        violations: _.get( data, [config.createMutationName, 'validationViolations'] ),
        id: _.get( data, [config.createMutationName, config.typeQueryName, 'id'] )
      }));
    });
  }

  private getCreateMutation( config:EntityConfigType ):DocumentNode {
    const fileVariableDeclaration = _(this.fileAttributes(config)).map( attr => `$${attr}: Upload` ).join(' ');
    const fileVariableAssign = _(this.fileAttributes(config)).map( attr => `${attr}: $${attr}` ).join(' ');
    return gql`mutation($input: ${config.createInputTypeName} ${fileVariableDeclaration} ) {
      ${config.createMutationName}(${config.typeQueryName}: $input ${fileVariableAssign} ) {
        validationViolations{ attribute message }
        ${config.typeQueryName} { id }
      }
    }`;
  }

  private update( id:string, variables:any, config:EntityConfigType ):Promise<SaveResultType>{
    _.set( variables, 'input.id', id );
    const updateMutation = this.getUpdateMutation( config );
    const context = this.getMutationContext( variables );
    return new Promise( (resolve, reject) => {
      this.apollo.mutate({mutation: updateMutation, variables, context }).subscribe(({data}) => resolve({
        violations: _.get( data, [config.updateMutationName, 'validationViolations'] ),
        id: _.get( data, [config.updateMutationName, config.typeQueryName, 'id'] )
      }), error => reject( error ) );
    });
  }

  private getUpdateMutation( config:EntityConfigType ):DocumentNode {
    const fileVariableDeclaration = _(this.fileAttributes(config)).map( attr => `$${attr}: Upload` ).join(' ');
    const fileVariableAssign = _(this.fileAttributes(config)).map( attr => `${attr}: $${attr}` ).join(' ');
    return gql`mutation($input: ${config.updateInputTypeName} ${fileVariableDeclaration} ) {
      ${config.updateMutationName}(${config.typeQueryName}: $input ${fileVariableAssign} ) {
        validationViolations{ attribute message }
        ${config.typeQueryName} { id }
      }
    }`;
  }

  private getMutationContext = (variables:any) => ({ useMultipart: _.keys( variables ).length > 0 });

  private fileAttributes( config:EntityConfigType ):string[] {
    return _(config.fields).filter( field => field.type === 'file' ).map( field => field.name ).value();
  }
}
