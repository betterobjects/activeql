import _ from 'lodash';

import { TypeType } from '../core/domain-configuration';
import { GraphQLTypes } from '../core/graphx';
import { TypeBuilder } from './schema-builder';

export abstract class GraphQLTypeBuilder extends TypeBuilder {

  abstract typeConfig():TypeType;

  build() {
    const name = this.name();
    this.graphx.type( name, {
      from: GraphQLTypes.GraphQLObjectType,
      fields: () => _.mapValues( this.typeConfig().fields, field =>
        ({type: this.getGraphQLTypeDecorated( field, field.required, 'type')})),
      description: this.typeConfig().description
    });
  }
}

export class GraphQLTypeConfigBuilder extends GraphQLTypeBuilder {

  static create( name:string, typeConfig:TypeType ):GraphQLTypeBuilder {
    return new GraphQLTypeConfigBuilder( name, typeConfig );
  }

  typeConfig():TypeType { return this.config }
  name() { return this._name }


  constructor( protected readonly _name:string, protected config:TypeType ){ super() }

}
