import { GraphQLFloat, GraphQLList } from 'graphql';
import _ from 'lodash';
import { AttributeFilterType } from './attribute-filter-type';

/**
 *
 */
export class FloatFilterType extends AttributeFilterType {

  graphqlTypeName() { return GraphQLFloat.name }

  attributes() { return {
    is: { type: 'Float', description: 'equal' },
    isNot: { type: 'Float', description: 'not equal' },
    lowerOrEqual: { type: 'Float', description: 'lower or equal than' },
    lower: { type: 'Float', description: 'lower than' },
    greaterOrEqual: { type: 'Float', description: 'greater or equal than' },
    greater: { type: 'Float', description: 'greater than' },
    isIn: { type: '[Float]', description: 'is in list of numbers' },
    notIn: { type: '[Float]', description: 'is not in list of numbers' },
    between: { type: '[Float]', description: 'is greater or equal than the first and lower then the last number of a list' }
  }}

  getFilterExpression( condition:any ):any {
    if( _.has( condition, 'is' ) ) return _.get( condition, 'is' );
    return _.merge( {}, ... _.compact( _.map( condition, (operand, operator) => this.getOperation( operator, operand ) ) ) );
  }

  private getOperation( operator:string, operand:any ):any {
    switch( operator ){
      case 'isNot': return { $ne : operand };
      case 'lowerOrEqual': return { $lte: operand };
      case 'lower': return { $lt : operand };
      case 'greaterOrEqual': return { $gte : operand };
      case 'greater': return { $gt : operand };
      case 'isIn': return { $in : operand };
      case 'notIn': return { $nin : operand };
      case 'between': return { $gte: _.first( operand ), $lt: _.last( operand )  };
    }
    console.warn(`IntFilter unknown operator '${operator}' `);
  }
}
