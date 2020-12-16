import _ from 'lodash';

import { AttributeFilterType } from './attribute-filter-type';

/**
 *
 */
export class DateTimeFilterType extends AttributeFilterType {

  graphqlTypeName() { return 'DateTime' }

  attributes() {
    return {
      is: { type: 'DateTime', description: 'equal' },
      isNot: { type: 'DateTime', description: 'not equal' },
      beforeOrEqual: { type: 'DateTime' },
      before: { type: 'DateTime' },
      afterOrEqual: { type: 'DateTime' },
      after: { type: 'DateTime' },
      isIn: { type: '[DateTime]', description: 'is in list of dates' },
      notIn: { type: '[DateTime]', description: 'is not in list of dates' },
      between: {
        type: '[DateTime]',
        description: 'is before or equal to the first and after the last date of the list'
      }
    };
  }

  getFilterExpression(condition:any, field:string ):any {
    if( _.has( condition, 'is' ) ) return _.get( condition, 'is' );
    const operator = _.toString( _.first( _.keys( condition ) ) );
    const operand = condition[operator];
    switch( operator ){
      case 'isNot': return { $ne : operand };
      case 'beforeOrEqual': return { $lte: operand };
      case 'before': return { $lt : operand };
      case 'afterOrEqual': return { $gte : operand };
      case 'after': return { $gt : operand };
      case 'isIn': return { $in : operand };
      case 'notIn': return { $nin : operand };
      case 'between': return { $gte: _.first( operand ), $lt: _.last( operand )  };
    }
    console.warn(`DateTimeFilter unknown operator '${operator}' `);
  }
}
