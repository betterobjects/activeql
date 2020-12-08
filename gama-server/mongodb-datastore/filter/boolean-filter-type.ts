import { GraphQLBoolean } from 'graphql';
import _ from 'lodash';

import { AttributeFilterType } from './attribute-filter-type';

/**
 *
 */
export class BooleanFilterType extends AttributeFilterType {

  graphqlTypeName() { return GraphQLBoolean.name }

  attributes() { return {
    is: { graphqlType: GraphQLBoolean, description: 'is' },
    isNot: { graphqlType: GraphQLBoolean, description: 'is not' }
  }}

  getFilterExpression( condition:any ){
    const operator = _.toString( _.first( _.keys( condition ) ) );
    const operand = condition[operator];
    switch( operator ){
      case 'is': return { $eq : operand };
      case 'isNot': return { $ne : operand };
    }
    console.warn(`BooleanFilter unknown operator '${operator}' `);
  }
}
