import { GraphQLBoolean, GraphQLList, GraphQLString } from 'graphql';
import _ from 'lodash';
import { AttributeFilterType } from './attribute-filter-type';

/**
 *
 */
export class StringFilterType extends AttributeFilterType {

  graphqlTypeName() { return GraphQLString.name }

  //
  //
  attributes() { return {
    is: { graphqlType: GraphQLString },
    isNot: { graphqlType: GraphQLString },
    in: { graphqlType: new GraphQLList(GraphQLString) },
    notIn: { graphqlType: new GraphQLList(GraphQLString) },
    contains: { graphqlType: GraphQLString },
    doesNotContain: { graphqlType: GraphQLString },
    beginsWith: { graphqlType: GraphQLString },
    endsWith: { graphqlType: GraphQLString },
    caseSensitive: { graphqlType: GraphQLBoolean }
  }}

  //
  //
  getFilterExpression( condition:any ):any {
    const caseSensitive = _.get( condition, 'caseSensitive' ) !== false;
    delete condition.caseSensitive;
    const operations = _.compact( _.map( condition,
      (operand, operator) => this.getOperation( operator, operand, caseSensitive ) ) );
    return _.size( operations ) > 1 ? { $and: operations } : _.first( operations );
  }

  //
  //
  private getOperation( operator:string, operand:any, caseSensitive:boolean ):any {
    const i = caseSensitive ? undefined : 'i';
    switch( operator ){
      case 'is': return caseSensitive ? {$eq: operand} : { $regex : new RegExp(`(${operand})`, i) };
      case 'isNot': return caseSensitive ? {$ne: operand } : { $not: { $regex : new RegExp(`(${operand})`, i) }};
      case 'in': return { $in: operand };
      case 'notIn': return { $nin: operand };
      case 'contains': return { $regex : new RegExp(`.*(${operand}).*`, i) };
      case 'doesNotContain':return { $not: { $regex : new RegExp(`.*(${operand}).*`, i) } };
      case 'beginsWith': return { $regex : new RegExp(`^(${operand})`, i) };
      case 'endsWith': return { $regex : new RegExp(`(${operand})$`, i) };
    }
    console.warn(`StringFilterType unknown operator '${operator}' `);

  }
}
