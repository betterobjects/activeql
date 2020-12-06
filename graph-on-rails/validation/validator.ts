import { EntityModule } from '../entities/entity-module';
import { ValidationViolation } from '../entities/entity-validation';

export abstract class Validator extends EntityModule{

  abstract validate( attributes:any, action:'create'|'update' ):Promise<ValidationViolation[]>
  abstract validatorSyntaxHint():string;
}

/**
 *
 */
export class NonValidator extends Validator {

  async validate() { return [] }
  validatorSyntaxHint() { return 'none' }
}
