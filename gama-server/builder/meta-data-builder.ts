import { GraphQLBoolean, GraphQLList, GraphQLNonNull, GraphQLObjectType, GraphQLString } from 'graphql';
import _ from 'lodash';

import { Entity } from '../entities/entity';
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
        calculated: { type: GraphQLBoolean },
        filter: {type: GraphQLString },
        mediaType: {type: GraphQLString }
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
        fields: {
          type: GraphQLList( fieldMetaData ),
          resolve: (root:any) => this.resolveFields(root)
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

    this.graphx.type('query').extendFields( () => {
      return _.set( {}, 'metaData', {
        type: new GraphQLList( entityMetaData ),
        args: { path: { type: GraphQLString } },
        resolve: (root:any, args:any, context:any) => this.resolve( root, args, context )
      });
    });
  }

  protected resolve( root:any, args:any, context:any ):Entity[] {
    const path = _.get( args, 'path' );
    return path ?
      _.filter( this.runtime.entities, entity => entity.path === path ) :
      _.values( this.runtime.entities );
  }

  protected resolveFields( root:any ):any[]{
    const entity = root as Entity;
    return _.map( entity.attributes, (attribute, name) => ({
      name, type: attribute.graphqlType, required: attribute.required, calculated: _.isFunction(attribute.resolve),
      unique: _.toString(attribute.unique), filter: attribute.filterType, mediaType: attribute.mediaType,
      validation: attribute.validation }));
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
