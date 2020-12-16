import { GraphQLBoolean, GraphQLList, GraphQLNonNull, GraphQLObjectType, GraphQLString } from 'graphql';
import _ from 'lodash';

import { Entity } from '../entities/entity';
import { EnumBuilder } from './enum-builder';
import { SchemaBuilder } from './schema-builder';

export class MetaDataBuilder extends SchemaBuilder {

  name() { return 'MetaData' }

  build():void {

    const fieldMetaData = new GraphQLObjectType({
      name: 'fieldMetaData',
      fields: () => ({
        name: { type: GraphQLNonNull( GraphQLString ) },
        type: { type: GraphQLString },
        required: { type: GraphQLBoolean },
        validation: { type: this.graphx.type('JSON') },
        unique: { type: GraphQLString },
        resolve: { type: GraphQLBoolean },
        filterType: {type: GraphQLString },
        mediaType: {type: GraphQLString },
        description: { type: GraphQLString },
        defaultValue: { type: GraphQLString },
        list: { type: GraphQLBoolean },
        virtual: { type: GraphQLBoolean },
        createInput: { type: GraphQLBoolean },
        updateInput: { type: GraphQLBoolean },
        objectTypeField: { type: GraphQLBoolean }
      })
    });

    const assocMetaData:GraphQLObjectType = new GraphQLObjectType({
      name: 'assocMetaData',
      fields: {
        path: { type: GraphQLString },
        query: { type: GraphQLString },
        required: { type: GraphQLBoolean },
        typesQuery: { type: GraphQLString },
        foreignKey: { type: GraphQLString },
        scope: { type: GraphQLString }
      }
    });

    const entityMetaData:GraphQLObjectType = new GraphQLObjectType({
      name: 'entityMetaData',
      fields: () => ({
        path: { type: GraphQLString },
        typeQueryName: { type: GraphQLString },
        typesQueryName: { type: GraphQLString },
        deleteMutationName: { type: GraphQLString },
        updateMutationName: { type: GraphQLString },
        updateInputTypeName: { type: GraphQLString },
        createMutationName: { type: GraphQLString },
        createInputTypeName: { type: GraphQLString },
        foreignKey: { type: GraphQLString },
        foreignKeys: { type: GraphQLString },
        attributes: {
          type: GraphQLList( fieldMetaData ),
          resolve: (root:any) => this.resolveAttributes(root)
        },
        assocTo: {
          type: GraphQLList( assocMetaData ),
          resolve: (root:any) => this.resolveAssocTo(root)
        },
        assocToMany: {
          type: GraphQLList( assocMetaData ),
          resolve: (root:any) => this.resolveAssocToMany( root )
        },
        assocFrom: {
          type: GraphQLList( assocMetaData ),
          resolve: (root:any) => this.resolveAssocFrom( root )
        },
      })
    });

    const metaData:GraphQLObjectType = new GraphQLObjectType({
      name: 'metaData',
      fields: () => ({
        entities: { type: GraphQLList(entityMetaData) }
      })
    });

    this.graphx.type('query').extendFields( () => {
      return _.set( {}, 'metaData', {
        type: metaData,
        args: { path: { type: GraphQLString } },
        resolve: (root:any, args:any, context:any) => this.resolve( root, args, context )
      });
    });
  }

  protected resolve( root:any, args:any, context:any ):{entities?:Entity[], enums?:EnumBuilder[]} {
    const path = _.get( args, 'path' );
    return path ?
      {entities: _.filter( this.runtime.entities, entity => entity.path === path ) } :
      {entities: _.values( this.runtime.entities )};
  }

  protected resolveAttributes( root:any ):any[]{
    const entity = root as Entity;
    return _.map( entity.attributes, (attribute, name) => {
      const resolvedAttr = _.pick( attribute,
        [ 'required', 'mediaType', 'validation', 'description', 'list',
          'virtual', 'createInput', 'updateInput', 'objectTypeField'] );
      _.set( resolvedAttr, 'name', name );
      _.set( resolvedAttr, 'type', attribute.graphqlType );
      _.set( resolvedAttr, 'resolve',  _.isFunction(attribute.resolve) );
      _.set( resolvedAttr, 'unique', _.toString(attribute.unique) );
      _.set( resolvedAttr, 'filterType', _.toString(attribute.filterType) );
      _.set( resolvedAttr, 'defaultValue', _.isFunction(attribute.defaultValue) ? null : attribute.defaultValue );
      return resolvedAttr;
    })
  }

  resolveAssocTo( root:any ) {
    const entity = root as Entity;
    return _.map( entity.assocTo, assocTo => {
      const refEntity = this.runtime.entities[assocTo.type];
      return {
        path: refEntity.path,
        query: refEntity.singular,
        required: assocTo.required,
        typesQuery: refEntity.typesQueryName,
        foreignKey: refEntity.foreignKey
      };
    });
  }

  resolveAssocToMany( root:any ) {
    const entity = root as Entity;
    return _.map( entity.assocToMany, assocToMany => {
      const refEntity = this.runtime.entities[assocToMany.type];
      const scopeEntity = assocToMany.scope ? this.runtime.entities[assocToMany.scope] : undefined;
      return {
        path: refEntity.path,
        query: refEntity.plural,
        required: assocToMany.required,
        typesQuery: refEntity.typesQueryName,
        foreignKey: refEntity.foreignKeys,
        scope: _.get( scopeEntity, 'path' )
      };
    });
  }

  resolveAssocFrom( root:any ) {
    const entity = root as Entity;
    return _.map( entity.assocFrom, assocFrom => {
      const refEntity = this.runtime.entities[assocFrom.type];
      return {
        path: refEntity.path,
        query: refEntity.plural,
        typesQuery: refEntity.typesQueryName,
        foreignKey: entity.foreignKey
      };
    });
  }

}
