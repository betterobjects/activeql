import inflection from 'inflection';
import _ from 'lodash';

import { FilterType } from '../builder/filter-type';
import {
  AssocFromType,
  AssocToManyType,
  AssocToType,
  EntityHooksType,
  EntityPermissionsType,
  EntityResolverFn,
  SeedType,
  ValidationReturnType,
} from '../core/domain-configuration';
import { Runtime } from '../core/runtime';
import { EntityAccessor } from './entity-accessor';
import { EntityFileSave } from './entity-file-save';
import { EntityItem } from './entity-item';
import { EntityPermissions } from './entity-permissions';
import { EntityResolver } from './entity-resolver';
import { EntitySeeder } from './entity-seeder';
import { EntityValidation, ValidationViolation } from './entity-validation';
import { TypeAttribute } from './type-attribute';


//
//
export abstract class Entity {

  private _runtime!:Runtime;
  get runtime() { return this._runtime }
  get graphx() { return this.runtime.graphx }
  get entityPermissions() { return this._entityPermissions }
  get seeder() { return this._entitySeeder }
  get resolver() { return this._entityResolver }
  get validation() { return this._entityValidation }
  get accessor() { return this._entityAccessor }
  get fileSave() { return this._entityFileSave }

  protected _entitySeeder!:EntitySeeder;
  protected _entityResolver!:EntityResolver;
  protected _entityPermissions!:EntityPermissions;
  protected _entityValidation!:EntityValidation;
  protected _entityAccessor!:EntityAccessor;
  protected _entityFileSave!:EntityFileSave;


  /**
   *
   */
  init( runtime:Runtime ){
    this._runtime = runtime;
    this.runtime.entities[this.typeName] = this;
    this._entityResolver = this.runtime.entityResolver( this );
    this._entitySeeder = this.runtime.entitySeeder( this );
    this._entityPermissions = this.runtime.entityPermissions( this );
    this._entityFileSave = this.runtime.entityFileSave( this );
    this._entityValidation = new EntityValidation( this );
    this._entityAccessor = new EntityAccessor( this );
  }

  extendEntity():void|((runtime:Runtime ) => void|Promise<void>) {}

  get name() { return this.getName() }
  get typeName(){ return this.getTypeName() }
  get attributes() { return this.getAttributes() }
  get assocTo() { return this.getAssocTo() }
  get assocToInput() { return _.filter( this.getAssocTo(), assocTo => assocTo.input === true ) }
  get assocToMany() { return this.getAssocToMany() }
  get assocFrom() { return this.getAssocFrom() }
  get singular() { return this.getSingular() }
  get plural() { return this.getPlural() }
  get foreignKey() { return this.getForeignKey() }
  get foreignKeys() { return this.getForeignKeys() }
  get createInputTypeName() { return this.getCreateInputTypeName() }
  get updateInputTypeName() { return this.getUpdateInputTypeName() }
  get filterTypeName() { return this.getFilterTypeName() }
  get sorterEnumName() { return this.getSorterEnumName() }
  get collection() { return this.getCollection() }
  get seeds() { return this.getSeeds() }
  get description() { return this.getDescription() }
  get entities() { return this.getEntites() }
  get typeField() { return this.getTypeField() }
  get typesEnumName() { return this.getTypesEnumName() }
  get isInterface():boolean { return this.getIsInterface() }
  get isUnion():boolean { return  ! this.isInterface && ! _.isEmpty( this.entities ) }
  get isPolymorph():boolean { return this.isUnion || this.isInterface }
  get implements():Entity[] { return _.filter( this.getImplements(), entity => entity.isInterface ) }
  get deleteMutationName():string { return this.getDeleteMutationName() }
  get createMutationName():string { return this.getCreateMutationName() }
  get updateMutationName():string { return this.getUpdateMutationName() }
  get mutationResultName():string { return this.getMutationResultName() }
  get typesQueryName():string { return this.getTypesQueryName() }
  get typeQueryName():string { return this.getTypeQueryName() }
  get statsQueryName():string { return this.getStatsQueryName() }
  get path() { return this.getPath() }
  get validateFn() { return this.getValidateFn() }
  get hooks() { return this.getHooks() }
  get permissions() { return this.getPermissions() }
  get typeQuery() { return this.getTypeQuery() }
  get typesQuery() { return this.getTypesQuery() }
  get createMutation() { return this.getCreateMutation() }
  get updateMutation() { return this.getUpdateMutation() }
  get deleteMutation() { return this.getDeleteMutation() }
  get statsQuery() { return this.getStatsQuery() }

  protected abstract getName():string;
  protected getTypeName() { return inflection.camelize( this.name ) }
  protected getSingular() { return `${_.toLower(this.typeName.substring(0,1))}${this.typeName.substring(1)}` }
  protected getPlural() { return inflection.pluralize( this.singular ) }
  protected getForeignKey() { return `${this.singular}Id` }
  protected getForeignKeys() { return `${this.singular}Ids` }
  protected getCreateInputTypeName() { return `${this.typeName}CreateInput` }
  protected getUpdateInputTypeName() { return `${this.typeName}UpdateInput` }
  protected getFilterTypeName() { return `${this.typeName}Filter` }
  protected getSorterEnumName() { return `${this.typeName}Sort` }
  protected getCollection() { return this.plural }
  protected getAttributes():{[name:string]:TypeAttribute} { return {} };
  protected getAssocTo():AssocToType[] { return [] }
  protected getAssocToMany():AssocToManyType[] { return [] }
  protected getAssocFrom():AssocFromType[] { return [] }
  protected getSeeds():{[name:string]:SeedType}|SeedType[] { return [] }
  protected getDescription():string|undefined { return }
  protected getEntites():Entity[] { return [] }
  protected getIsInterface():boolean { return false }
  protected getImplements():Entity[] { return [] }
  protected getTypeField():string { return `${this.singular}Type` }
  protected getTypesEnumName():string { return `${this.typeName}Types` }
  protected getCreateMutationName():string { return `create${this.typeName}` }
  protected getUpdateMutationName():string { return `update${this.typeName}` }
  protected getMutationResultName():string { return `Save${this.typeName}MutationResult` }
  protected getTypesQueryName():string { return this.plural }
  protected getTypeQueryName():string { return this.singular }
  protected getStatsQueryName():string { return `${this.typesQueryName}Stats` }
  protected getDeleteMutationName():string { return `delete${this.typeName}` }
  protected getPath() { return inflection.underscore( this.plural ) }
  protected getValidateFn():((item:any, runtime:Runtime ) => ValidationReturnType) | undefined { return undefined }
  protected getHooks():EntityHooksType|undefined { return undefined }
  protected getPermissions():string|EntityPermissionsType|undefined { return undefined }

  protected getTypeQuery():boolean|EntityResolverFn { return true }
  protected getTypesQuery():boolean|EntityResolverFn { return true }
  protected getCreateMutation():boolean|EntityResolverFn { return true }
  protected getUpdateMutation():boolean|EntityResolverFn { return true }
  protected getDeleteMutation():boolean|EntityResolverFn { return true }
  protected getStatsQuery():boolean|EntityResolverFn { return true }


  /**
   *
   */
  getAttribute(name:string):TypeAttribute|undefined {
    const attribute = this.attributes[name];
    if( attribute ) return attribute;
    const implAttributes = _.map( this.implements, impl => impl.getAttribute( name ) );
    return _.first( _.compact( implAttributes ) );
  }

  /**
   * @name either "id", attribute, assocTo or assocFrom
   * @returns the configured filter type or the default for the type
   */
  getFilterTypeNameForAttribute( name:string ):string|undefined {
    if( name === 'id' ) return 'IDFilter';

    const assocTo = _.find( this.assocTo, assocTo =>
      _.get( this.runtime.entity(assocTo.type), 'foreignKey' ) === name );
    if( assocTo ) return 'IDFilter';

    const assocFrom = _.find( this.assocFrom, assocFrom =>
      _.get( this.runtime.entity(assocFrom.type), 'plural' ) === name );
    if( assocFrom ) return 'AssocFromFilter';

    const attribute = this.getAttribute( name );
    if( ! attribute || attribute.filterType === false ) return undefined;

    return _.isString(attribute.filterType) ?
      attribute.filterType : FilterType.getFilterName( attribute.graphqlType );
  }

  /**
   *
   */
  isAssoc( name:string ):boolean {
    if( _.find( this.assocTo, assocTo => assocTo.type === name ) ) return true;
    if( _.find( this.assocToMany, assocTo => assocTo.type === name ) ) return true;
    if( _.find( this.assocFrom, assocTo => assocTo.type === name ) ) return true;
    return false;
  }

  /**
   *
   */
  isAssocToAttribute( attribute:string ):boolean {
    return _.find( this.assocTo, assocTo => {
      const ref = this.runtime.entities[assocTo.type];
      return ref && ref.foreignKey === attribute;
    }) != null;
  }

  /**
   *
   */
  isAssocToMany( ref:Entity ):boolean {
    return _.find( this.assocToMany, assocToMany => assocToMany.type === ref.typeName ) != undefined;
  }

  /**
   *
   */
  isFileAttribute( attribute:TypeAttribute ):boolean {
    const name = _.isString( attribute.graphqlType ) ?
      attribute.graphqlType : _.get( attribute.graphqlType, 'name' );
    return _.toLower(name) === 'file';
  }

  /**
   *
   */
  async validate( attributes:any ):Promise<ValidationViolation[]> {
    return this.validation.validate( attributes );
  }

  /**
   * @returns true if the given entity is an interface and this entity implements it
   */
  implementsEntityInterface( entity:Entity):boolean {
    if( ! entity.isInterface ) return false;
    return _.includes( this.implements, entity );
  }

  /**
   *
   */
  async findById( id:any ):Promise<EntityItem> {
    return this.accessor.findById( id );
  }

  /**
   *
   */
  async findByIds( ids:any[] ):Promise<EntityItem[]> {
    return this.accessor.findByIds( ids );
  }

  /**
   *
   */
  async findAll():Promise<EntityItem[]> {
    return this.accessor.findByFilter( {} );
  }

  /**
   *
   */
  async findByAttribute( attrValue:{[name:string]:any} ):Promise<EntityItem[]> {
    return this.accessor.findByAttribute( attrValue );
  }

  /**
   *
   */
  async findOneByAttribute( attrValue:{[name:string]:any} ):Promise<EntityItem|undefined> {
    return _.first( await this.accessor.findByAttribute( attrValue ) );
  }

  /**
   *
   */
  getThisOrAllNestedEntities():Entity[] {
    if( _.isEmpty(this.entities) ) return [this];
    return _.flatten( _.map( this.entities, entity => entity.getThisOrAllNestedEntities() ) );
  }
}
