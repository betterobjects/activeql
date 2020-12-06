import _ from 'lodash';

import { AssocType } from '../core/domain-configuration';
import { Validator } from '../validation/validator';
import { Entity } from './entity';
import { TypeAttribute } from './type-attribute';

//
//
export type ValidationViolation = {
  attribute?:string,
  message:string
}

//
//
export class EntityValidation  {

  readonly validator!:Validator;
  get runtime() { return this.entity.runtime }


  constructor( public readonly entity:Entity ){
    this.validator = entity.runtime.validator( entity );
  }

  /**
   *
   */
  async validate( item:any ):Promise<ValidationViolation[]> {
    const action = _.has( item, 'id') ? 'update' : 'create';
    const validatable = await this.completeAttributes( item );
    const violations:ValidationViolation[] = this.validateRequiredAttributes( validatable );
    if( ! _.isEmpty( violations ) ) return violations; // validations should rely on required attributes
    violations.push( ... await this.validateRequiredAssocTos( validatable ) );
    violations.push( ... await this.validateUniqe( validatable ) );
    violations.push( ... await this.validator.validate( validatable, action ) );
    violations.push( ... await this.validateFn( validatable ) );
    return violations;
  }

  /**
   * Retrieves the item from the ResolverContext, if an item exist (to be updated) the
   * current values are loaded and used when no values where provided
   * TODO what happens, when the user wants to delete a string value?
   * @returns map with item
   */
  private async completeAttributes( item:any ):Promise<any> {
    const id = _.get( item, 'id' );
    if( ! id ) return item;
    const current = await this.entity.findById( id );
    return _.defaultsDeep( _.cloneDeep(item), current.item );
  }

  /**
   *
   */
  private validateRequiredAttributes( item:any ):ValidationViolation[] {
    const violations:ValidationViolation[] = [];
    _.forEach( this.entity.attributes, (attribute, name:string) => {
      if( ! attribute.required ) return;
      const value = _.get( item, name );
      if( _.isNil( value )) violations.push({ attribute: name, message: 'can\'t be blank' });
    });
    return violations;
  }

  /**
   *
   */
  private async validateRequiredAssocTos( item:any ):Promise<ValidationViolation[]> {
    const violations:ValidationViolation[] = [];
    for( const assocTo of this.entity.assocTo ){
      if( ! assocTo.required ) continue;
      const violation = await this.validateRequiredAssocTo( assocTo, item );
      if( violation ) violations.push( violation );
    }
    return violations;
  }

  /**
   *
   */
  private async validateRequiredAssocTo( assocTo:AssocType, item:any ):Promise<ValidationViolation|undefined> {
    const refEntity = this.runtime.entities[assocTo.type];
    const foreignKey = _.get( item, refEntity.foreignKey );
    if( ! foreignKey ) return {attribute: refEntity.foreignKey, message: 'must be provided'};
    const refItem = await refEntity.findOneByAttribute( { id: _.toString(foreignKey) } );
    if( ! refItem ) return { attribute: refEntity.foreignKey, message: 'must refer to existing item' };
  }

  /**
   *
   */
  private async validateUniqe( item:any ):Promise<ValidationViolation[]> {
    const violations:ValidationViolation[] = [];
    for( const name of _.keys(this.entity.attributes) ){
      const attribute = this.entity.attributes[name];
      if( ! attribute.unique ) continue;
      const violation = await this.validateUniqeAttribute( name, attribute, item );
      if( violation ) violations.push( violation );
    }
    return violations;
  }

  private async validateFn( item:any ):Promise<ValidationViolation[]>  {
    if( ! this.entity.validateFn ) return [];
    const violations = await Promise.resolve( this.entity.validateFn( item, this.runtime ) );
    if( _.isString( violations ) ) return [{message: violations}];
    if( _.isArray( violations ) ) return violations;
    return violations ? [violations] : [];
  }


  /**
   *
   */
  private async validateUniqeAttribute( name:string, attribute:TypeAttribute, item:any ):Promise<ValidationViolation|undefined> {
    const value = _.get( item, name );
    if( _.isUndefined( value ) ) return;
    const attrValues = _.set({}, name, value );
    let scopeMsg = '';
    if( _.isString( attribute.unique ) ){
      const scopeEntity = this.runtime.entities[attribute.unique];
      const scope = scopeEntity ? scopeEntity.foreignKey : attribute.unique;
      const scopeValue = _.get( item, scope );
      _.set(attrValues, scope, scopeValue );
      scopeMsg = ` within scope '${attribute.unique}'`;
    }
    const result = await this.entity.findByAttribute( attrValues );
    const violation = {attribute: name, message: `value '${value}' must be unique` + scopeMsg }
    return this.isUniqueResult( item, result ) ? undefined : violation;
  }

  /**
   *
   */
  isUniqueResult( item:any, result:any[] ):boolean {
    if( _.size( result ) === 0 ) return true;
    if( _.size( result ) > 1 ) return false;
    const currentId = _.toString( _.get( item, 'id' ) );
    return currentId === _.toString( _.get( _.first(result), 'id') );
  }


}
