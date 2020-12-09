import { GraphQLList } from 'graphql';
import _ from 'lodash';
import { AttributeFilterType } from './attribute-filter-type';

/**
 *
 */
export class DateFilterType extends AttributeFilterType {

  graphqlTypeName() { return 'Date' }

  attributes() {
    const dateType = this.graphx.type('Date');
    return {
      eq: { graphqlType: dateType, description: 'equal' },
      ne: { graphqlType: dateType, description: 'not equal' },
      beforeOrEqual: { graphqlType: dateType },
      before: { graphqlType: dateType },
      afterOrEqual: { graphqlType: dateType },
      after: { graphqlType: dateType },
      isIn: { graphqlType: new GraphQLList( dateType ), description: 'is in list of dates' },
      notIn: { graphqlType: new GraphQLList( dateType ), description: 'is not in list of dates' },
      between: {
        graphqlType: new GraphQLList( dateType ),
        description: 'is before or equal to the first and after the last date of the list'
      }
    };
  }

  getFilterExpression(condition:any, field:string ):any {
    const operator = _.toString( _.first( _.keys( condition ) ) );
    const operand = condition[operator];
    console.log( operand, operand instanceof Date );
    switch( operator ){
      case 'eq': return { $eq : operand };
      case 'ne': return { $ne : operand };
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
