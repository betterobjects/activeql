import inflection from 'inflection';
import _ from 'lodash';

import { AttributeType, EntityType } from '../core/domain-configuration';
import { Runtime } from '../core/runtime';
import { EntityAccessor } from './entity-accessor';
import { EntityFileSave } from './entity-file-save';
import { EntityItem } from './entity-item';
import { EntityPermissions } from './entity-permissions';
import { EntityResolver } from './entity-resolver';
import { EntitySeeder } from './entity-seeder';
import { EntityValidation, ValidationViolation } from './entity-validation';

export class Entity {

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

  constructor( private config:EntityType ){}

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

  get name() { return this.config.name }
  get typeName(){ return this.config.typeName }
  get attributes() { return this.config.attributes }
  get assocTo() { return this.config.assocTo }
  get assocToInput() { return _.filter( this.assocTo, assocTo => assocTo.input === true ) }
  get assocToMany() { return this.config.assocToMany }
  get assocFrom() { return this.config.assocFrom }
  get singular() { return this.config.singular }
  get plural() { return this.config.plural }
  get foreignKey() { return this.config.foreignKey }
  get foreignKeys() { return this.config.foreignKeys }
  get createInputTypeName() { return this.config.createInputTypeName }
  get updateInputTypeName() { return this.config.updateInputTypeName }
  get filterTypeName() { return this.config.filterTypeName }
  get sorterEnumName() { return this.config.sorterEnumName}
  get collection() { return this.config.collection }
  get seeds() { return this.config.seeds }
  get description() { return this.config.description }
  get typeField() { return this.config.typeField }
  get typesEnumName() { return this.config.typesEnumName }
  get isInterface():boolean { return this.config.interface === true }
  get isUnion():boolean { return ! _.isEmpty( this.config.union ) }
  get isPolymorph():boolean { return this.isUnion || this.isInterface }
  get createMutationName():string { return this.config.createMutationName }
  get updateMutationName():string { return this.config.updateMutationName }
  get deleteMutationName():string { return this.config.deleteMutationName }
  get mutationResultName():string { return this.config.mutationResultName }
  get typeQueryName():string { return this.config.typeQueryName }
  get typesQueryName():string { return this.config.typesQueryName }
  get statsQueryName():string { return this.config.statsQueryName }
  get validateFn() { return this.config.validation }
  get hooks() { return this.config.hooks }
  get permissions() { return this.config.permissions }
  get typeQuery() { return this.config.typeQuery }
  get typesQuery() { return this.config.typesQuery }
  get statsQuery() { return this.config.statsQuery }
  get createMutation() { return this.config.createMutation }
  get updateMutation() { return this.config.updateMutation }
  get deleteMutation() { return this.config.deleteMutation }

  get entities() {
    if( this.isInterface ) return _.filter( this.runtime.entities, entity => entity.implementsEntityInterface( this ) );
    return _.compact( _.map( this.config.union, entity => this.runtime.entities[entity] ) );
  }

  get implements():Entity[] {
    return _( this.config.implements).
      map( entity => this.runtime.entities[entity] ).
      filter( entity => entity.isInterface ).
      compact().
      value();
  }

  getByQueryName( attributeName:string, attribute:AttributeType ) {
    return `${attribute.unique === true ? this.singular : this.plural}By${inflection.camelize(attributeName)}`
  }

  getAttribute(name:string):AttributeType |undefined {
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

    return attribute.filterType;
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
  isFileAttribute( attribute:AttributeType ):boolean {
    return _.toLower(attribute.type) === 'file';
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
