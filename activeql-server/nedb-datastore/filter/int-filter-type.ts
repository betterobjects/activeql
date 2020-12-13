import { GraphQLInt, GraphQLList } from 'graphql';
import _ from 'lodash';
import { AttributeFilterType } from './attribute-filter-type';

/**
 *
 */
export class IntFilterType extends AttributeFilterType {

  graphqlTypeName() { return GraphQLInt.name }

  attributes() { return {
    is: { graphqlType: GraphQLInt, description: 'equal, if given all other options are ignored' },
    isNot: { graphqlType: GraphQLInt, description: 'not equal' },
    lowerOrEqual: { graphqlType: GraphQLInt, description: 'lower or equal than' },
    lower: { graphqlType: GraphQLInt, description: 'lower than' },
    greaterOrEqual: { graphqlType: GraphQLInt, description: 'greater or equal than' },
    greater: { graphqlType: GraphQLInt, description: 'greater than' },
    isIn: { graphqlType: new GraphQLList(GraphQLInt), description: 'is in list of numbers' },
    notIn: { graphqlType: new GraphQLList(GraphQLInt), description: 'is not in list of numbers' },
    between: {
      graphqlType: new GraphQLList(GraphQLInt),
      description: 'is greater or equal than the first and lower then the last number of a list'
    },
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
