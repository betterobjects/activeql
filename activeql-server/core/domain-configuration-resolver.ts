import inflection from 'inflection';
import _ from 'lodash';

import { FilterType } from '../builder/filter-type';
import { TypeBuilder } from '../builder/schema-builder';
import {
  AssocFromType,
  AssocToManyType,
  AssocToType,
  AttributeConfig,
  AttributeType,
  DomainConfiguration,
  DomainConfigurationType,
  EntityConfig,
  EntityType,
  EnumConfig,
  EnumType,
} from './domain-configuration';
import { scalarTypes } from './graphx';


export class DomainConfigurationResolver {

  get resolvedConfiguration() { return this.configuration }

  private configuration:DomainConfigurationType = { entity: {}, enum: {}, query: {}, mutation: {}, subscription: {} };

  constructor( private input:DomainConfiguration = {}, private seeds = true, private customQueriesMutations:boolean|'src' ){}

  resolve(){
    _.forEach( this.input.enum, (enumConfig, name) =>
      _.set( this.configuration.enum, name, this.resolveEnum( enumConfig ) ) );
    _.forEach( this.input.entity, (entity, name) =>
      _.set( this.configuration.entity, name, this.resolveEntity( name, entity ) ) );
    _.forEach( this.input.query, (query, name) =>
      _.set(this.configuration.query, name, this.customQueriesMutations ?
        this.customQueriesMutations === true ? query :
        this.customQueriesMutations === 'src' ?  query.toString() :
        '[CustomFn]' : null ));
    _.forEach( this.input.mutation, (mutation, name) =>
      _.set(this.configuration.mutation, name, this.customQueriesMutations ?
        this.customQueriesMutations === true ? mutation :
        this.customQueriesMutations === 'src' ?  mutation.toString() :
        null : '[CustomFn]' ));
    _.forEach( this.input.subscription, (subscription, name) =>
      _.set(this.configuration.subscription, name, this.customQueriesMutations ?
        this.customQueriesMutations === true ? subscription :
        this.customQueriesMutations === 'src' ?  subscription.toString() :
        null : '[CustomFn]' ));

  }

  private resolveEnum( enumConfig:EnumConfig ):EnumType {
    return _.isArray( enumConfig) ?_.reduce( enumConfig,
      (config, item) => _.set( config, _.toUpper( item ), item ), {} ) : enumConfig;
  }

  private resolveEntity( name:string, entity:EntityConfig ):EntityType {
    if( ! _.has( entity, 'attributes') ) entity = _.set( {}, 'attributes', entity );
    const resolved:any = _.merge( { name }, _.pick( entity,
      'description', 'validation', 'hooks', 'typeOnly', 'subscriptions', 'typeQuery', 'typesQuery', 'statsQuery', 'permissions',
      'createMutation', 'updateMutation', 'deleteMutation'));
    resolved.typeName = _.get( entity, 'typeName', name );
    resolved.attributes = this.resolveAttributes( entity );
    resolved.assocTo = this.resolveAssocTo( entity );
    resolved.assocToMany = this.resolveAssocToMany( entity );
    resolved.assocFrom = this.resolveAssocFrom( entity );
    if( this.seeds ) resolved.seeds = entity.seeds;
    resolved.singular = _.get( entity, 'singular', this.singular( resolved.typeName ) );
    resolved.plural = _.get( entity, 'plural', inflection.pluralize( resolved.singular ));
    resolved.collection = _.get( entity, 'collection', resolved.plural );
    resolved.path = _.get( entity, 'path', inflection.dasherize( _.toLower(resolved.plural) ));
    resolved.foreignKey = _.get( entity, 'foreignKey', `${resolved.singular}Id` );
    resolved.foreignKeys = _.get( entity, 'foreignKeys', `${resolved.singular}Ids` );
    resolved.createInputTypeName = _.get( entity, 'createInputTypeName', `${resolved.typeName}CreateInput` );
    resolved.updateInputTypeName = _.get( entity, 'updateInputTypeName', `${resolved.typeName}UpdateInput` );
    resolved.filterTypeName = _.get( entity, 'filterTypeName', `${resolved.typeName}Filter` );
    resolved.sorterEnumName = _.get( entity, 'sorterEnumName', `${resolved.typeName}Sort` );
    resolved.typeField = _.get( entity, 'typeField', `${resolved.singular}Type` );
    resolved.typesEnumName = _.get( entity, 'typeField', `${resolved.typeName}Types` );
    resolved.createMutationName = _.get( entity, 'createMutationName', `create${resolved.typeName}` );
    resolved.updateMutationName = _.get( entity, 'updateMutationName', `update${resolved.typeName}` );
    resolved.deleteMutationName = _.get( entity, 'deleteMutationName', `delete${resolved.typeName}` );
    resolved.mutationResultName = _.get( entity, 'mutationResultName', `Save${resolved.typeName}MutationResult` );
    resolved.typeQueryName = _.get( entity, 'typeQueryName', resolved.singular );
    resolved.typesQueryName = _.get( entity, 'typesQueryName', resolved.plural );
    resolved.statsQueryName = _.get( entity, 'statsQueryName', `${resolved.typesQueryName}Stats` );
    resolved.union = this.undefinedOrArray( entity.union );
    resolved.implements = this.undefinedOrArray( entity.implements );
    resolved.interface = entity.interface === true;
    return resolved;
  }

  private resolveAttributes( entity: EntityConfig ): any {
    const attributes:{[name:string]:AttributeType} = {};
    _.forEach( entity.attributes, (attribute, name) => {
      _.set( attributes, name, this.resolveAttribute( name, attribute ) );
    });
    return attributes;
  }

  private resolveAttribute( name:string, config:string|AttributeConfig ):AttributeType {
    if( _.isString( config ) ) config = { type: config };
    if( _.isArray( config ) && _.size( config ) === 1 ) config = { type: `[${_.first(config)}]` };
    config = this.resolveAttributTypeShortcut( name, config );
    const resolved:any = _.merge( { name }, _.pick( config,
      'type', 'list', 'description', 'defaultValue', 'validation', 'resolve', 'mediaType', 'virtual',
      'queryBy', 'createInput', 'updateInput', 'objectTypeField' ) );
    resolved.required = config.required === true;
    resolved.list = config.list === true;
    resolved.unique = config.unique ? config.unique : false;
    resolved.filterType = _.get( config, 'filterType', TypeBuilder.getFilterName( resolved.type ) || false );
    resolved.virtual = config.virtual === true;
    resolved.createInput = config.createInput !== false;
    resolved.updateInput = config.updateInput !== false;
    resolved.objectTypeField = config.objectTypeField !== false;

    return resolved;
  }

  private fromKeyShortcut( config:AttributeConfig ):AttributeConfig {
    config.type = 'String';
    config.required = true;
    config.unique = true;
    config.updateInput = false;
    return config;
  }

  private resolveAttributTypeShortcut( name:string, config:AttributeConfig ):AttributeConfig {
    if( _.toLower( config.type ) === 'key' ) return this.fromKeyShortcut( config );
    if( ! config.type ) config.type = 'String';

    const required = _.endsWith( config.type, '!' );
    if( required ) config.type = config.type.slice(0, -1);

    const list = _.startsWith(config.type, '[') && _.endsWith( config.type, ']');
    if( list ) config.type = config.type.slice(1, -1);

    // could be ! inside [] now
    const requiredInside = _.endsWith( config.type, '!' );
    if( requiredInside ) config.type = config.type.slice(0, -1);

    let mediaType:'image'|'video'|'audio'|undefined;
    switch( _.toLower(config.type) ){
      case 'image':
        mediaType = 'image';
        break;
      case 'video':
        mediaType = 'video';
        break;
      case 'audio':
        mediaType = 'audio';
        break;
    }
    if( mediaType ) config.type = 'File';

    config.type = this.resolveType( config.type );
    config.required = config.required || required || requiredInside;
    config.list = config.list || list;
    config.mediaType = config.mediaType || mediaType;
    return config;
  }

  private resolveType( name:string ):string {
    if( _.toLower( name ) === 'id') console.warn( 'You should not use ID in attributes!' );
    const couldBeScalar = inflection.capitalize( name );
    return scalarTypes[couldBeScalar] ? couldBeScalar : name;
  }

  private resolveAssocTo( entity:EntityConfig ):undefined|AssocToType[] {
    if( _.isNil( entity.assocTo ) || _.isEmpty( entity.assocTo ) ) return undefined;
    const assocTo = _.isArray( entity.assocTo ) ? entity.assocTo : [entity.assocTo];
    return _.map( assocTo, assocTo => _.isString( assocTo ) ? this.resolveAssocToShortcut(assocTo) : assocTo );
  }

  private resolveAssocToMany( entity:EntityConfig ):undefined|AssocToType[] {
    if( _.isNil( entity.assocToMany ) || _.isEmpty( entity.assocToMany ) ) return undefined;
    const assocToMany = _.isArray( entity.assocToMany ) ? entity.assocToMany : [entity.assocToMany];
    return _.map( assocToMany, assocToMany =>
      _.isString( assocToMany ) ? this.resolveAssocToShortcut(assocToMany) : assocToMany );
  }

  private resolveAssocFrom( entity:EntityConfig ):undefined|AssocFromType[] {
    if( _.isNil( entity.assocFrom ) || _.isEmpty( entity.assocFrom ) ) return undefined;
    const assocFrom:(string|AssocFromType)[] = _.isArray( entity.assocFrom ) ? entity.assocFrom : [entity.assocFrom];
    return _.map( assocFrom, assocFrom => _.isString( assocFrom ) ? {type: assocFrom} : assocFrom );
  }

  private resolveAssocToShortcut<T>( shortcut:string ):AssocToType|AssocToManyType{
    const required = _.endsWith( shortcut, '!' );
    if( required ) shortcut = shortcut.slice(0, -1);
    return { type: shortcut, required };
  }

  private singular( name:string ):string {
    if( ! name ) return '';
    return `${_.toLower(name.substring(0,1))}${name.substring(1)}`
  }

  private undefinedOrArray<T>( value:undefined|T|T[]):undefined|T[]{
    if( _.isNil( value ) ) return undefined;
    if( _.isArray( value ) ) return value;
    return [value];
  }


}
