import { GraphQLBoolean, GraphQLList, GraphQLString } from 'graphql';
import _ from 'lodash';
import { AttributeFilterType } from './attribute-filter-type';

/**
 *
 */
export class StringFilterType extends AttributeFilterType {

  graphqlTypeName() { return GraphQLString.name }

  attributes() { return {
    is: { type: 'String', description: 'equal this value, case-sensitive can be be applied (default: true)' },
    isNot: { type: 'String', description: 'does not equal this value, case-sensitive can be be applied (default: true)' },
    in: { type: '[String]', description: 'value is in the list of strings, case-sensitive' },
    notIn: { type: '[String]', description: 'value is not in the list of strings, case-sensitive' },
    contains: { type: 'String', description: 'contains this value, case-sensitive can be be applied (default: true)' },
    doesNotContain: { type: 'String', description: 'does not contain this value, case-sensitive can be be applied (default: true)' },
    beginsWith: { type: 'String', description: 'begins with this value, case-sensitive can be be applied (default: true)' },
    endsWith: { type: 'String', description: 'ends with this value, case-sensitive can be be applied (default: true)' },
    caseSensitive: { type: 'Boolean', description: 'default:true, can be applied to all operators except "in" and "notIn"' },
    regex: { type: 'String', description: 'any regex, case-sensitive can be be applied (default: true)' }
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
      case 'is': return caseSensitive ? operand : { $regex : new RegExp(`(${operand})`, i) };
      case 'isNot': return caseSensitive ? {$ne: operand } : { $not: { $regex : new RegExp(`(${operand})`, i) }};
      case 'in': return { $in: operand };
      case 'notIn': return { $nin: operand };
      case 'contains': return { $regex : new RegExp(`.*(${operand}).*`, i) };
      case 'doesNotContain':return { $regex : new RegExp(`^((?!${operand}).)*$`, i) };
      case 'beginsWith': return { $regex : new RegExp(`^(${operand})`, i) };
      case 'endsWith': return { $regex : new RegExp(`(${operand})$`, i) };
      case 'endsWith': return { $regex : new RegExp(`(${operand})$`, i) };
      case 'regex': return { $regex : new RegExp(operand, i) };
    }
    console.warn(`StringFilterType unknown operator '${operator}' `);

  }
}
