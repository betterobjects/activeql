import { GraphQLFloat, GraphQLList } from 'graphql';
import _ from 'lodash';
import { AttributeFilterType } from './attribute-filter-type';

/**
 *
 */
export class FloatFilterType extends AttributeFilterType {

  graphqlTypeName() { return GraphQLFloat.name }

  attributes() { return {
    eq: { graphqlType: GraphQLFloat, description: 'equal' },
    ne: { graphqlType: GraphQLFloat, description: 'not equal' },
    le: { graphqlType: GraphQLFloat, description: 'lower or equal than' },
    lt: { graphqlType: GraphQLFloat, description: 'lower than' },
    ge: { graphqlType: GraphQLFloat, description: 'greater or equal than' },
    gt: { graphqlType: GraphQLFloat, description: 'greater than' },
    isIn: { graphqlType: new GraphQLList(GraphQLFloat), description: 'is in list of numbers' },
    notIn: { graphqlType: new GraphQLList(GraphQLFloat), description: 'is not in list of numbers' },
    between: {
      graphqlType: new GraphQLList(GraphQLFloat),
      description: 'is greater or equal than the first and lower then the last number of a list'
    },
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
    }
    console.warn(`IntFilter unknown operator '${operator}' `);
  }
}
