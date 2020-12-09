import _ from 'lodash';
import validate from 'validate.js';

import { Entity } from '../entities/entity';
import { Validator } from './validator';
import { ValidationViolation } from '../entities/entity-validation';

/**
 *
 */
export class ValidateJs extends Validator {

  private constraints:any = {};

  /**
   *
   */
  constructor( protected readonly entity:Entity ){
    super( entity );
    this.buildConstraints();
  }

  validatorSyntaxHint() { return 'validate.js <https://validatejs.org>' }

  /**
   *
   */
  async validate( attributes:any, action:'create'|'update' ): Promise<ValidationViolation[]> {
    const result = validate( attributes, this.constraints );
    return result === true ? [] : this.formatErrors( result );
  }

  /**
   *
   */
  private formatErrors( result:any ):ValidationViolation[] {
    const errors:ValidationViolation[] = [];
    _.forEach( result, (messages:string[], attribute) => {
      _.forEach( messages, message => errors.push( { attribute, message } ) );
    });
    return errors;
  }


  /**
   *
   */
  private buildConstraints() {
    this.constraints = {};
    _.forEach( this.entity.attributes, (attribute, name:string) => {
      if( attribute.validation ) this.constraints[name] = attribute.validation;
    });
  }

}
