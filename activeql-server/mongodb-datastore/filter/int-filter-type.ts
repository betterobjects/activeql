import { GraphQLInt, GraphQLList } from 'graphql';
import _ from 'lodash';
import { AttributeFilterType } from './attribute-filter-type';

/**
 *
 */
export class IntFilterType extends AttributeFilterType {

  graphqlTypeName() { return GraphQLInt.name }

  attributes() { return {
    is: { type: 'Int', description: 'equal, if given all other options are ignored' },
    isNot: { type: 'Int', description: 'not equal' },
    lowerOrEqual: { type: 'Int', description: 'lower or equal than' },
    lower: { type: 'Int', description: 'lower than' },
    greaterOrEqual: { type: 'Int', description: 'greater or equal than' },
    greater: { type: 'Int', description: 'greater than' },
    isIn: { type: '[Int]', description: 'is in list of numbers' },
    notIn: { type: '[Int]', description: 'is not in list of numbers' },
    between: { type: '[Int]', description: 'is greater or equal than the first and lower then the last number of a list' },
    isNull: { type: 'Boolean', description: 'either null or non-null value'}
  }}

  getFilterExpression( condition:any ):any {
    return _.merge( {}, ... _.compact( _.map( condition, (operand, operator) => this.getOperation( operator, operand ) ) ) );
  }

  private getOperation( operator:string, operand:any ):any {
    switch( operator ){
      case 'is': return { $eq : operand };
      case 'isNot': return { $ne : operand };
      case 'lowerOrEqual': return { $lte: operand };
      case 'lower': return { $lt : operand };
      case 'greaterOrEqual': return { $gte : operand };
      case 'greater': return { $gt : operand };
      case 'isIn': return { $in : operand };
      case 'notIn': return { $nin : operand };
      case 'between': return { $gte: _.first( operand ), $lt: _.last( operand )  };
      case 'isNull': return { $exists : ! operand };
    }
    console.warn(`IntFilter unknown operator '${operator}' `);
  }
}
