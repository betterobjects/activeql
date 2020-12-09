import _ from 'lodash';

import { QueryMutationConfig } from '../core/domain-configuration';
import { SchemaBuilder } from './schema-builder';

export abstract class MutationBuilder extends SchemaBuilder {

  build(){
    this.graphx.type( 'mutation' ).extendFields( () => {
      const mutation = this.mutation();
      _.isString( mutation.type ) && ( mutation.type = this.graphx.type( mutation.type ) );
      mutation.args = _.mapValues( mutation.args, arg => _.isString( arg ) ? {type: this.graphx.type(arg)} : arg );
      mutation.args = _.mapValues( mutation.args, arg => ! _.isString(arg) && _.isString( arg.type ) ? {type: this.graphx.type(arg.type)} : arg );
      return _.set( {}, this.name(), mutation );
    });
  }

  abstract mutation():QueryMutationConfig;
}

export class MutationConfigBuilder extends MutationBuilder {

  static create( name:string, config:QueryMutationConfig ):MutationConfigBuilder {
    return new MutationConfigBuilder( name, config );
  }

  name() { return this._name }
  mutation():QueryMutationConfig { return this.config }

  constructor( protected readonly _name:string, protected readonly config:QueryMutationConfig ){ super() }
}
