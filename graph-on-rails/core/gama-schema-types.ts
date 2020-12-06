import { GraphQLBoolean, GraphQLInt, GraphQLList, GraphQLNonNull, GraphQLString, Kind } from 'graphql';
import _ from 'lodash';

import { DomainDefinition } from './domain-definition';
import { GraphQLTypes } from './graphx';
import { Runtime } from './runtime';


export class GamaSchemaTypes {

  get graphx() { return this.runtime.graphx }

  constructor( private runtime:Runtime ){}

  async createTypes(){

    this.graphx.type( 'Date', {
      from: GraphQLTypes.GraphQLScalarType,
      parseValue: (value:any) => new Date(value),
      parseLiteral: (ast:any) => ast.kind === Kind.STRING ? new Date(ast.value) : null,
      serialize: (value:any) => value instanceof Date ? value.toJSON() : `[${value}]`
    });

    this.graphx.type( 'JSON', {
      from: GraphQLTypes.GraphQLScalarType,
      parseValue: (value:any) => value,
      serialize: (value:any) => value
    });

    this.graphx.type('ValidationViolation', {
      name: 'ValidationViolation',
      fields: () => ({
        attribute: { type: GraphQLString },
        message: { type: new GraphQLNonNull( GraphQLString ) }
      })
    });

    this.graphx.type('EntityPaging', {
      name: 'EntityPaging',
      description: 'use this to get a certain fraction of a (large) result set',
      from: GraphQLTypes.GraphQLInputObjectType,
      fields: () => ({
        page: { type: GraphQLNonNull( GraphQLInt ), description: 'page of set, starts with 0' },
        size: { type: new GraphQLNonNull( GraphQLInt ), description: 'number of items in page, 0 means no limit' }
      })
    });

    this.graphx.type('File', {
      name: 'File',
      fields: () => ({
        filename: { type: GraphQLNonNull(GraphQLString) },
        mimetype: { type: GraphQLNonNull(GraphQLString) },
        encoding: { type: GraphQLNonNull(GraphQLString) },
        secret: { type: GraphQLNonNull(GraphQLString) }
      })
    });

    this.graphx.type('EntityStats', {
      name: 'EntityStats',
      fields: () => ({
        count: { type: GraphQLNonNull(GraphQLInt) },
        createdFirst: { type: this.graphx.type('Date') },
        createdLast: { type: this.graphx.type('Date') },
        updatedLast: { type: this.graphx.type('Date') }
      })
    });

    this.graphx.type( 'EntityEnum', {
      from: GraphQLTypes.GraphQLEnumType,
      fields: () => _.reduce( this.runtime.entities, (values, entity) =>
        _.set( values, _.toUpper( entity.typeName ), { value: entity.typeName} ), {} )
    });

    this.graphx.type('EntityRole', {
      fields: () => ({
        entity: { type: 'EntityEnum!' },
        role: { type: 'String!' },
        ids: { type: '[String!]' }
      })
    });


    if(this.runtime.config.stage === 'development') {

      this.runtime.type('mutation').extendFields( () => ({
        seed: {
          type: GraphQLList( GraphQLString ),
          args: { truncate: { type: GraphQLBoolean } },
          resolve: ( root:any, args:any ) =>  this.runtime.seed( args.truncate )
        }
      }));

      if( ! _.isEmpty( this.runtime.entities) ) this.graphx.type('Entity', {
        from: GraphQLTypes.GraphQLEnumType,
        values: _.reduce( this.runtime.entities,
          (value,  entity) => _.set( value, entity.name, { value: entity.name } ), {} )
      });

      if( ! _.isEmpty( this.runtime.enums) ) this.graphx.type('Enum', {
        from: GraphQLTypes.GraphQLEnumType,
        values: _.reduce( this.runtime.enums,
          (values, enumName) => _.set( values, enumName, { value: enumName } ), {} )
      });

      this.runtime.type('query').extendFields( () => {
        return {
          domainConfiguration: {
            type: this.runtime.type( 'JSON' ),
            args: {
              entity: { type: this.runtime.type( _.isEmpty( this.runtime.enums) ? 'String' : 'Entity' ) },
              enum: { type: this.runtime.type( _.isEmpty( this.runtime.enums) ? 'String' : 'Enum' ) }
            },
            resolve: (root:any, args:any) => this.resolveDomainDefinition( args )
          }
        };
      });
    }
  }

  private resolveDomainDefinition( args:any ) {
    if( args.entity ) return this.resolveEntityDefinition( args.entity );
    if( args.enum ) return this.resolveEnumDefinition( args.enum );
    const config:any = _.cloneDeep( (this.runtime.config.domainDefinition as DomainDefinition).getConfiguration() );
    config.query = _.mapValues( config.query, () => '[Custom Function]');
    config.mutation = _.mapValues( config.mutation, () => '[Custom Function]');
    return config;
  }

  private resolveEntityDefinition( entity:string ) {
    const config = _.get( this.runtime.config.domainDefinition, ['configuration', 'entity', entity ] );
    if( config ) return _.set( {}, entity, config );
  }

  private resolveEnumDefinition( enumName:string ) {
    const config = _.get( this.runtime.config.domainDefinition, ['configuration', 'enum', enumName ] );
    if( config ) return _.set( {}, enumName, config );
  }

}
