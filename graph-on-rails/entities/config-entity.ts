import inflection from 'inflection';
import _ from 'lodash';

import { AssocFromType, AttributeConfig, EntityConfig, EntityPermissionsType } from '../core/domain-configuration';
import { Entity } from './entity';
import { TypeAttribute } from './type-attribute';
import { scalarTypes } from '../core/graphx'

export class ConfigEntity extends Entity {

  _attributes?:{[name:string]:TypeAttribute} = undefined

  static create( name:string, entityConfig:EntityConfig ):ConfigEntity {
    if( ! entityConfig ) entityConfig = {};
    return new ConfigEntity( name, entityConfig );
  }

  protected constructor( protected readonly _name:string, public readonly entityConfig:EntityConfig ){ super() }

  extendEntity() { return this.entityConfig.extendEntity }

  protected getName() { return this._name }

  protected getTypeName() { return this.entityConfig.typeName || super.getTypeName() }

  protected getAttributes() {
    if( ! this.entityConfig.attributes ) return super.getAttributes();
    if( ! this._attributes ) {
      const attributes = _.mapValues( this.entityConfig.attributes,
          (attrConfig, name) => this.buildAttribute( name, attrConfig ) );
      this._attributes = _.pickBy( attributes, _.identity ) as {[name:string]:TypeAttribute};
    }
    return this._attributes;
  }

  protected getAssocTo() {
    if( ! this.entityConfig.assocTo ) return super.getAssocTo();
    if( ! _.isArray( this.entityConfig.assocTo) ) this.entityConfig.assocTo = [this.entityConfig.assocTo];
    return _.map( this.entityConfig.assocTo, assocTo => {
      if( _.isString( assocTo ) ) assocTo = { type : assocTo }
      if( _.endsWith( assocTo.type, '!' ) ){
        assocTo.type = assocTo.type.slice(0, -1);
        assocTo.required = true;
      }
      return assocTo;
    });
  }

  protected getAssocToMany() {
    if( ! this.entityConfig.assocToMany ) return super.getAssocToMany();
    if( ! _.isArray( this.entityConfig.assocToMany) ) this.entityConfig.assocToMany = [this.entityConfig.assocToMany];
    return _.map( this.entityConfig.assocToMany, bt => {
      return _.isString(bt) ? { type: bt } : bt;
    });
  }

  protected getAssocFrom(){
    if( ! this.entityConfig.assocFrom ) return super.getAssocFrom();
    if( ! _.isArray( this.entityConfig.assocFrom) ) this.entityConfig.assocFrom = [this.entityConfig.assocFrom];
    if( ! _.isArray( this.entityConfig.assocFrom ) ){
      console.warn(`'${this.name}' assocFrom must be an array but is: `, this.entityConfig.assocFrom );
      return super.getAssocFrom();
    }
    return _.map( this.entityConfig.assocFrom, hm => {
      return _.isString(hm) ? { type: hm } : hm;
    }) as AssocFromType[];
  }

  protected getPlural() { return this.entityConfig.plural || super.getPlural() }

  protected getSingular() { return this.entityConfig.singular || super.getSingular() }

  protected getCollection() { return this.entityConfig.collection || super.getCollection() }

  protected getSeeds() { return this.entityConfig.seeds || super.getSeeds() }

  protected getDescription():string|undefined { return this.entityConfig.description || super.getDescription() }

  protected getEntites():Entity[] {
    if( this.isInterface ) return _.filter( this.runtime.entities, entity => entity.implementsEntityInterface( this ) );
    return _.compact( _.map( this.entityConfig.union, entity => this.runtime.entities[entity] ) );
  }

  protected getImplements():Entity[] {
    if( ! this.entityConfig.implements ) return super.getImplements();
    if( ! _.isArray( this.entityConfig.implements ) ) this.entityConfig.implements = [this.entityConfig.implements];
    return _.compact( _.map( this.entityConfig.implements, entity => this.runtime.entities[entity] ) );
  }

  protected getIsInterface():boolean { return this.entityConfig.interface === true }

  protected getValidateFn() { if (_.isFunction(this.entityConfig.validation) ) return this.entityConfig.validation  }

  protected getHooks() { return this.entityConfig.hooks }

  protected getPermissions():string|EntityPermissionsType|undefined { return this.entityConfig.permissions }

  protected getForeignKey() { return this.entityConfig.foreignKey || super.getForeignKey() }
  protected getForeignKeys() { return this.entityConfig.foreignKeys || super.getForeignKeys() }
  protected getTypeQueryName() { return this.entityConfig.typeQueryName || super.getTypeQueryName() }
  protected getTypesQueryName() { return this.entityConfig.typesQueryName || super.getTypesQueryName() }
  protected getCreateInputTypeName() { return this.entityConfig.createInputTypeName || super.getCreateInputTypeName() }
  protected getUpdateInputTypeName() { return this.entityConfig.updateInputTypeName || super.getUpdateInputTypeName() }
  protected getDeleteMutationName() { return this.entityConfig.deleteMutationName || super.getDeleteMutationName() }
  protected getFilterTypeName() { return this.entityConfig.filterTypeName || super.getFilterTypeName() }
  protected getTypeField() { return this.entityConfig.typeField || super.getTypeField() }
  protected getTypesEnumName() { return this.entityConfig.typesEnumName || super.getTypeField() }
  protected getCreateMutationName() { return this.entityConfig.createInputTypeName || super.getCreateMutationName() }
  protected getUpdateMutationName() { return this.entityConfig.updateInputTypeName || super.getUpdateMutationName() }
  protected getMutationResultName() { return this.entityConfig.mutationResultName || super.getMutationResultName() }
  protected getStatsQueryName() { return this.entityConfig.statsQueryName || super.getStatsQueryName() }

  protected getTypeQuery() { return _.isNil(this.entityConfig.typeQuery) ? super.getTypeQuery() : this.entityConfig.typeQuery }
  protected getTypesQuery() { return _.isNil(this.entityConfig.typesQuery) ? super.getTypesQuery() : this.entityConfig.typesQuery }
  protected getCreateMutation() { return _.isNil(this.entityConfig.createMutation) ? super.getCreateMutation() : this.entityConfig.createMutation }
  protected getUpdateMutation() { return _.isNil(this.entityConfig.updateMutation) ? super.getUpdateMutation() : this.entityConfig.updateMutation }
  protected getDeleteMutation() { return _.isNil(this.entityConfig.deleteMutation) ? super.getDeleteMutation() : this.entityConfig.deleteMutation}
  protected getStatsQuery() { return _.isNil(this.entityConfig.statsQuery) ? super.getStatsQuery() : this.entityConfig.statsQuery }

  private buildAttribute( name:string, attrConfig:AttributeConfig|string ):TypeAttribute {
    attrConfig = this.resolveShortcut( attrConfig );
    this.resolveKey( attrConfig );
    this.resolveListBrackets( name, attrConfig );
    this.resolveExclamationMark( attrConfig );
    this.capitalizeScalarTypes( attrConfig );
    this.resolveMediaType( attrConfig );
    this.resolveUnknownFilter( attrConfig );
    this.warnAttribute( name, attrConfig );
    return {
      graphqlType: attrConfig.type || 'String',
      filterType: attrConfig.filterType as string|false|undefined,
      validation: attrConfig.validation,
      unique: attrConfig.unique,
      required: attrConfig.required,
      list: attrConfig.list,
      description: attrConfig.description,
      // input: attrConfig.input,
      defaultValue: attrConfig.defaultValue,
      mediaType: attrConfig.mediaType,
      resolve: attrConfig.resolve,
      virtual: attrConfig.virtual
    }
  }

  private resolveShortcut( attrConfig:string|AttributeConfig):AttributeConfig {
    if( _.isString( attrConfig ) ) attrConfig = { type: attrConfig };
    if( ! attrConfig.type ) attrConfig.type = 'String';
    return attrConfig;
  }

  private resolveKey( attrConfig:AttributeConfig ):void {
    if( _.toLower(attrConfig.type) === 'key' ){
      attrConfig.type = 'String';
      attrConfig.required = true;
      if( ! attrConfig.unique ) attrConfig.unique = true;
    }
  }

  private resolveListBrackets( attrName:string, attrConfig:AttributeConfig ):void {
    if( ! attrConfig.type ) return;
    if( ! _.startsWith( attrConfig.type, '[' ) ) return;
    if( ! _.endsWith( attrConfig.type, ']' ) ) {
      const error = `unrecognized type '${attrConfig.type}' - 'String' is used to prevent invalid schema`;
      attrConfig.description = attrConfig.description ? `${attrConfig.description}\n${error}` : error;
      console.error( `[${this.name}:${attrName}]: ${error}` );
      attrConfig.type = 'String';
    } else {
      attrConfig.type = attrConfig.type.slice(1, -1);
      attrConfig.list = true;
    }
  }

  private resolveExclamationMark( attrConfig:AttributeConfig ):void {
    if( ! attrConfig.type ) return;
    if( _.endsWith( attrConfig.type, '!' ) ){
      attrConfig.type = attrConfig.type.slice(0, -1);
      attrConfig.required = true;
    }
  }

  private capitalizeScalarTypes( attrConfig:AttributeConfig ):void {
    if( ! attrConfig.type ) return;
    const scalarType = inflection.capitalize( attrConfig.type );
    if( scalarTypes[scalarType] ) attrConfig.type = scalarType;
  }

  private resolveMediaType( attrConfig:AttributeConfig ):void {
    switch( attrConfig.type ){
      case 'image':
        attrConfig.type = 'File';
        attrConfig.mediaType = 'image';
        break;
      case 'video':
        attrConfig.type = 'File';
        attrConfig.mediaType = 'video';
        break;
      case 'audio':
        attrConfig.type = 'File';
        attrConfig.mediaType = 'audio';
        break;
    }
  }

  private resolveUnknownFilter( attrConfig:AttributeConfig ){
    if( _.includes( ['File', 'JSON'], attrConfig.type ) ) attrConfig.filterType = false;
  }

  private warnAttribute( name: string, attrConfig:AttributeConfig ):void {
    if( _.isFunction( attrConfig.resolve ) ){
      if( attrConfig.filterType ) console.warn(
        this.name, `[${name}]`, 'filterType makes no sense for attribute that is resolved manually' )
    }
    if( _.toLower( attrConfig.type ) === 'id') console.warn(
      this.name, `[${name}]`, 'you should not use ID in attributes' )
  }

}
