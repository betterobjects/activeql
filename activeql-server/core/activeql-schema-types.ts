import { GraphQLBoolean, GraphQLInt, GraphQLList, GraphQLNonNull, GraphQLString, Kind } from 'graphql';
import _ from 'lodash';

import { GraphQLTypes } from './graphx';
import { Runtime } from './runtime';

export const parseActiveQLScalarDate = (value:string) => {
  const date = new Date( _.toString(value) );
  const y = date.getFullYear();
  const m = date.getMonth();
  const d = date.getDate();
  if( _.isNaN( y + m + d) ) return null;
  const pad = (i:number) => _.padStart( _.toString(i), 2, '0' );
  return `${y}-${pad(m+1)}-${pad(d)}`;
}

export class ActiveQLSchemaTypes {

  get graphx() { return this.runtime.graphx }

  constructor( private runtime:Runtime ){}

  async createTypes(){

    this.graphx.type( 'DateTime', {
      from: GraphQLTypes.GraphQLScalarType,
      parseValue: (value:any) => new Date(value),
      parseLiteral: (ast:any) => ast.kind === Kind.STRING ? new Date(ast.value) : null,
      serialize: (value:any) => value instanceof Date ? value.toJSON() : `[${value}]`
    });

    this.graphx.type( 'Date', {
      from: GraphQLTypes.GraphQLScalarType,
      parseValue: (value:any) => parseActiveQLScalarDate( value ),
      parseLiteral: (ast:any) => ast.kind === Kind.STRING ? parseActiveQLScalarDate( ast.value ) : null,
      serialize: (value:any) => value
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

    this.graphx.type('query').extendFields( () => {
      return _.set( {}, 'domainConfiguration', {
        args: {
          seeds: { type: GraphQLBoolean },
          customQueriesMutationsSrc: { type: GraphQLBoolean },
        },
        type: this.graphx.type('JSON'),
        resolve: (__:never, args:any ) =>
          this.runtime.domainDefinition.getResolvedConfiguration( args.seeds === true, args.customQueriesMutationsSrc ? 'src' : false )
      });
    });


    if(this.runtime.config.stage === 'development') {

      this.runtime.type('mutation').extendFields( () => ({
        seed: {
          type: GraphQLList( GraphQLString ),
          args: { truncate: { type: GraphQLBoolean } },
          resolve: ( root:any, args:any ) =>  this.runtime.seed( args.truncate )
        }
      }));
    }
  }

}
