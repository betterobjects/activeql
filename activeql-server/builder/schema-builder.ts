import { GraphQLType } from 'graphql';
import _ from 'lodash';

import { Runtime } from '../core/runtime';
import { TypeAttribute } from '../entities/type-attribute';


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
  static getFilterName( type:string|GraphQLType ):string {
    if( ! _.isString(type) ) type = _.get( type, 'name' );
    return `${type}Filter`
  }

  attributes():{[name:string]:TypeAttribute} { return {} }

  //
  //
  public attribute( name:string):TypeAttribute {
    return this.attributes()[name];
  }
}

