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
    between: { type: '[Float]', description: 'is greater or equal than the first and lower then the last number of a list' },
    isNull: { type: 'Boolean', description: 'either null or non-null value'}
  }}

  getFilterExpression( condition:any ):any {
    return _.merge( {}, ... _.compact( _.map( condition, (operand, operator) => this.getOperation( operator, operand ) ) ) );
  }

  private getOperation( operator:string, operand:any ):any {
    switch( operator ){
      case 'eq': return { $eq : operand };
      case 'ne': return { $ne : operand };
      case 'le': return { $lte: operand };
      case 'lt': return { $lt : operand };
      case 'ge': return { $gte : operand };
      case 'gt': return { $gt : operand };
      case 'isIn': return { $in : operand };
      case 'notIn': return { $nin : operand };
      case 'between': return { $gte: _.first( operand ), $lt: _.last( operand )  };
      case 'isNull': return { $exists : ! operand };
    }
    console.warn(`IntFilter unknown operator '${operator}' `);
  }
}
