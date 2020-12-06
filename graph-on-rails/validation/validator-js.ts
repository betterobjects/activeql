import _ from 'lodash';

import { Entity } from '../entities/entity';
import { Validator } from './validator';
import { ValidationViolation } from '../entities/entity-validation';

const is = require( 'validator.js' ).Assert;
const validator = require( 'validator.js' ).validator();


/**
 *
 */
export class ValidatorJs extends Validator {

  private constraint:any = {};

  /**
   *
   */
  protected constructor( protected readonly entity:Entity ){
    super( entity );
    this.buildConstraints();
  }

  validatorSyntaxHint() { return 'validator.js <https://github.com/chriso/validator.js>' }


  /**
   *
   */
  async validate( attributes:any ): Promise<ValidationViolation[]> {
    const result = validator.validate( attributes, this.constraint );
    return result === true ? [] : this.formatErrors( result );
  }

  /**
   *
   */
  private formatErrors( result:any ):ValidationViolation[] {
    const errors:ValidationViolation[] = [];
    _.forEach( result, (violations, attribute) => {
      violations = _.isArray( violations ) ? violations : [violations];
      _.forEach( violations, violation => {
        const message = _.get( violation, '__class__' ) === 'Violation' && (! _.isObject( _.get( violation, 'value')) ) ?
          violation.__toString() : `${_.get(violation, ['assert', '__class__'])} assert failed`;
        errors.push( { attribute, message } );
      });
    });
    return errors;
  }

  /**
   *
   */
  private buildConstraints() {
    this.constraint = {};
    _.forEach( this.entity.attributes, (attribute, name:string) => {
      this.constraint[name] = [];
      _.forEach( attribute.validation, (options:any, method:string ) => {
        if( options === false ) return;
        this.constraint[name].push( is[method](options) );
      })
    });
  }

}
