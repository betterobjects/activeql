import _ from 'lodash';

import { QueryMutationConfig } from '../core/domain-configuration';
import { SchemaBuilder } from './schema-builder';

export abstract class QueryBuilder extends SchemaBuilder {

  build(){
    this.graphx.type( 'query' ).extendFields( () => {
      const query = this.query();
      _.isString( query.type ) && ( query.type = this.graphx.type( query.type ) );
      query.args = _.mapValues( query.args, arg => _.isString( arg ) ? {type: this.graphx.type(arg)} : arg );
      query.args = _.mapValues( query.args, arg => ! _.isString(arg) && _.isString( arg.type ) ? {type: this.graphx.type(arg.type)} : arg );
      return _.set( {}, this.name(), query );
    });
  }

  abstract query():QueryMutationConfig;
}

export class QueryConfigBuilder extends QueryBuilder {

  static create( name:string, config:QueryMutationConfig ):QueryConfigBuilder {
    return new QueryConfigBuilder( name, config );
  }

  name() { return this._name }
  query():QueryMutationConfig{ return this.config }

  constructor( protected readonly _name:string, protected readonly config:QueryMutationConfig ){ super() }
}
