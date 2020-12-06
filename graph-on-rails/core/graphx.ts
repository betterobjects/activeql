import {
  GraphQLBoolean,
  GraphQLEnumType,
  GraphQLFloat,
  GraphQLID,
  GraphQLInputObjectType,
  GraphQLInt,
  GraphQLInterfaceType,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLScalarType,
  GraphQLSchema,
  GraphQLString,
  GraphQLUnionType,
} from 'graphql';
import _ from 'lodash';

import { Runtime } from './runtime';

export type FieldsType = {
  [name:string]: any
}

export type GraphQLTypeDefinition = {
  from?: GraphQLTypes
  name?: string
  description?: string
  args?: any
  fields?: any,
  values?: {[key:string]:{value:any}}|string[],
  types?: () => any[]
  interfaceTypes?: () => any[]
  parseValue?: (value:any) => any
  parseLiteral?: (ast:any) => any
  serialize?: (value:any) => any
  extendFields?: (fields:any) => void
}

export enum GraphQLTypes {
  GraphQLEnumType = 'GraphQLEnumType',
  GraphQLObjectType = 'GraphQLObjectType',
  GraphQLScalarType = 'GraphQLScalarType',
  GraphQLUnionType = 'GraphQLUnionType',
  GraphQLInterfaceType = 'GraphQLInterfaceType',
  GraphQLInputObjectType = 'GraphQLInputObjectType'
}

export const scalarTypes:{[scalar:string]:GraphQLScalarType} = {
  ID: GraphQLID,
  String: GraphQLString,
  Int: GraphQLInt,
  Float: GraphQLFloat,
  Boolean: GraphQLBoolean
}

//
//
export class GraphX {

  rawTypes:{[name:string]:GraphQLTypeDefinition} = {};

  private fieldsFromArray( fields:any[] ):() => any {
    return () => _.reduce( fields, (result, fields) => {
        fields = _.isFunction( fields ) ? fields() : fields;
        fields = _.mapValues( fields, field =>
          _.isString( fields ) ? {type: this.type(fields)} : field );
        fields = _.mapValues( fields, field =>
          _.isString( field.type ) ? _.set( field, 'type', this.type( field.type )) : field );
      return _.merge( result, fields );
    }, {} );
  }

  //
  //
  init( runtime:Runtime ){
    this.createQueryType();
    this.createMutationType( runtime );
  }

  /**
   *
   */
  private createMutationType( runtime:Runtime ):void {
    this.createType( 'mutation', {
      name: 'Mutation',
      fields: () => ( {
        ping: {
          type: GraphQLString,
          args: { some: { type: GraphQLString } },
          resolve: ( root:any, args:any ) => `pong, ${args.some}!`
        }
      })
    });
  }

  /**
   *
   */
  private createQueryType():void {
    this.createType( 'query', {
      name: 'Query',
      fields: () => ( {
        ping: { type: GraphQLString, resolve: () => 'pong' }
      } )
    } );
  }

  //
  //
  private createType( name:string, definition:GraphQLTypeDefinition ){
    if (this.rawTypes[name]) throw new Error(`Type '${name}' already exists.`);
    return this.rawTypes[name] = {
      from: definition.from || GraphQLTypes.GraphQLObjectType,
      name: definition.name || name,
      description: definition.description,
      args: definition.args,
      fields: [definition.fields],
      values: definition.values,
      types: definition.types,
      interfaceTypes: definition.interfaceTypes,
      parseValue: definition.parseValue,
      parseLiteral: definition.parseLiteral,
      serialize: definition.serialize,
      extendFields: (fields:any) => this.rawTypes[name].fields.push(fields instanceof Function ? fields : () => fields)
    };
  }

  //
  //
  type( name:string, definition?:GraphQLTypeDefinition ) {
    if( ! name ) throw new Error(`cannot resolve type for non-string`);
    const scalar = this.resolveScalar( name );
    if( scalar ) return scalar;
    if (definition === undefined) {
      if (this.rawTypes[name] === undefined) throw new Error(`Type '${name}' does not exist in this GraphX.`);
      return this.rawTypes[name];
    }
    return this.createType(name, definition);
  }

  // smells like refactoring
  private resolveScalar( name:string ):any {

    let nonNull = false;
    if( _.endsWith( name, '!') ){
      name = name.slice(0, -1);
      nonNull = true;
    }

    let list = false;
    let listItemNonNull = false;
    if( _.startsWith( name, '[') && _.endsWith( name, ']')){
      name = name.slice(1, -1);
      list = true;
      if( _.endsWith( name, '!') ){
        name = name.slice(0, -1);
        listItemNonNull = true;
      }
    }

    let type:any = scalarTypes[name];
    if( ! type ) type = this.rawTypes[name];
    if( ! type ) return undefined;

    if( list ){
      if( listItemNonNull ) type = new GraphQLNonNull( type );
      type = new GraphQLList( type );
    }

    return nonNull ? new GraphQLNonNull( type ) : type;
  }

  /**
   *
   */
  generate = () => {
    this.generateTypes();
    return new GraphQLSchema({
      query: this.type('query'),
      mutation: this.type('mutation')
    });
  }

  /**
   *
   */
  private generateTypes = () => {
    _.forEach( this.rawTypes, (item, name) => {
      switch( item.from ){
        case GraphQLTypes.GraphQLUnionType: return _.set( this.rawTypes, name,
          new GraphQLUnionType({
            name: item.name || name,
            types: item.types ? _.map( item.types(), type => type ) : [],
            description: item.description
          }));

        case GraphQLTypes.GraphQLInterfaceType: return _.set( this.rawTypes, name,
          new GraphQLInterfaceType({
            name: item.name || name,
            description: item.description,
            fields: this.fieldsFromArray(item.fields)
          }));

        case GraphQLTypes.GraphQLScalarType: return _.set( this.rawTypes, name,
          new GraphQLScalarType({
            name: item.name || name,
            description: item.description,
            serialize: item.serialize,
            parseValue: item.parseValue,
            parseLiteral: item.parseLiteral
          }));

        case GraphQLTypes.GraphQLEnumType: return _.set( this.rawTypes, name,
          new GraphQLEnumType({
            name: item.name || name,
            values: item.values ?
              _.isArray(item.values) ?
                _.reduce( item.values, (values, value) => _.set( values, _.toUpper(value), {value} ), {} ) :
                item.values :
              {},
            description: item.description
          }));

        case GraphQLTypes.GraphQLInputObjectType: return _.set( this.rawTypes, name,
          new GraphQLInputObjectType({
            name: item.name || name,
            description: item.description,
            fields: this.fieldsFromArray(item.fields)
          }));

        case GraphQLTypes.GraphQLObjectType: return _.set( this.rawTypes, name,
          new GraphQLObjectType({
            name: item.name || name,
            description: item.description,
            fields: this.fieldsFromArray(item.fields),
            interfaces: item.interfaceTypes ? item.interfaceTypes() : []
          }));

        default: console.error( `unknown from: ${item.from}` );
      }
    });
  }

}


