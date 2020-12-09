import _, { Dictionary } from 'lodash';

import { EnumConfig } from '../core/domain-configuration';
import { GraphQLTypes } from '../core/graphx';
import { TypeBuilder } from './schema-builder';

export abstract class EnumBuilder extends TypeBuilder {

  abstract enum():Dictionary<any>

  build() {
    const name = this.name();
    const values = {};
    _.forEach( this.enum(), (value,key) => _.set( values, key, { value }));
    this.graphx.type( name, { values, from: GraphQLTypes.GraphQLEnumType	} );
    this.runtime.enums.push( name );
  }

  extendTypes():void {
    this.createEnumFilter();
  }

  protected createEnumFilter():void {
    const filterType = this.runtime.dataStore.getEnumFilterType( this.name() );
    filterType.init( this.runtime );
    filterType.build();
  }

}

export class EnumConfigBuilder extends EnumBuilder {

  static create( name:string, enumConfig:EnumConfig ):EnumConfigBuilder {
    return new EnumConfigBuilder( name, enumConfig );
  }

  name() { return this._name }

  enum(){
    if( _.isArray( this.config) ) this.config = _.reduce( this.config,
      (config, item) => _.set( config, _.toUpper( item ), item ), {} );
    return this.config;
  }

  constructor( protected readonly _name:string, protected config:EnumConfig ){ super() }

}
