import _ from 'lodash';

import { AttributeFilterType } from './attribute-filter-type';

/**
 *
 */
export class DateFilterType extends AttributeFilterType {

  graphqlTypeName() { return 'Date' }

  attributes() {
    return {
      is: { type: 'Date', description: 'equal' },
      isNot: { type: 'Date', description: 'not equal' },
      beforeOrEqual: { type: 'Date' },
      before: { type: 'Date' },
      afterOrEqual: { type: 'Date' },
      after: { type: 'Date' },
      isIn: { type: '[Date]', description: 'is in list of dates' },
      notIn: { type: '[Date]', description: 'is not in list of dates' },
      between: { type: '[Date]', description: 'is before or equal to the first and after the last date of the list' }
    };
  }

  getFilterExpression(condition:any, field:string ):any {
    if( _.has( condition, 'is' ) ) return _.get( condition, 'is' );
    const operator = _.toString( _.first( _.keys( condition ) ) );
    const operand = condition[operator];
    console.log( operand, operand instanceof Date );
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
    console.warn(`DateFilter unknown operator '${operator}' `);
  }
}
