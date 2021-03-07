import { GraphQLUpload } from 'apollo-server-express';
import { AttributeType } from '../core/domain-configuration';
import { GraphQLList, GraphQLNonNull, GraphQLScalarType, GraphQLString, GraphQLType } from 'graphql';
import _ from 'lodash';

import { Runtime } from '../core/runtime';

export type AttributePurpose = 'createInput'|'updateInput'|'filter'|'type';

/**
 * Base class for any custom type that can occur in a GraphQL Schema
 */
export abstract class SchemaBuilder {

  private _runtime!:Runtime;

  get runtime() { return this._runtime }
  get graphx() {return this.runtime.graphx };

  init( runtime:Runtime ):void { this._runtime = runtime }

  abstract name():string;
  abstract build():void|Promise<void>;
}


/**
 * Base class for any custom type that can occur in a GraphQL Schema
 */
export abstract class TypeBuilder extends SchemaBuilder {

  //
  //
  static getFilterName( type:string|GraphQLType ):string|undefined {
    if( ! _.isString(type) ) type = _.get( type, 'name' );
    if( _.includes(['File','JSON'], type ) ) return undefined;
    return `${type}Filter`
  }

  attributes():{[name:string]:{type: string, description?:string}} { return {} }

  //
  //
  public attribute( name:string):{type: string, description?:string} {
    return this.attributes()[name];
  }

  protected getGraphQLTypeDecorated( attr:AttributeType, addNonNull:boolean, purpose:AttributePurpose ):GraphQLType {
    let type = this.getGraphQLType( attr, purpose );
    if( addNonNull ) type = new GraphQLNonNull( type ) ;
    if( attr.list ) type = new GraphQLList( type );
    return type;
  }

  /**
   *
   */
  protected getGraphQLType( attr:AttributeType, purpose:AttributePurpose ):GraphQLType {
    const type = this.getScalarType( attr.type, purpose );
    if( type ) return type;
    try {
      return this.graphx.type(attr.type);
    } catch (error) {
      console.error(`no such graphqlType:`, attr.type, ` - using GraphQLString instead` );
    }
    return GraphQLString;
  }

  /**
   *
   */
  protected getScalarType( name:string, purpose:AttributePurpose ):GraphQLScalarType | undefined {
    name = _.toLower(name)
    if( name === 'File' && _.includes(['createInput', 'updateInput'], purpose) ) return GraphQLUpload as GraphQLScalarType;
    // const type = this.graphx.scalarTypes[name];
    // if( type ) return type;
  }
}

