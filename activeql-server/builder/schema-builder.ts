import { GraphQLType } from 'graphql';
import _ from 'lodash';

import { AttributeType } from '../core/domain-configuration';
import { Runtime } from '../core/runtime';


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
}

