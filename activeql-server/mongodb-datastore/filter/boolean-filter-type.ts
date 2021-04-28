import { GraphQLBoolean } from 'graphql';
import _ from 'lodash';

import { AttributeFilterType } from './attribute-filter-type';

/**
 *
 */
export class BooleanFilterType extends AttributeFilterType {

  graphqlTypeName() { return GraphQLBoolean.name }

  attributes() { return {
    is: { type: 'Boolean', description: 'is' },
    isNot: { type: 'Boolean', description: 'is not' },
    isNull: { type: 'Boolean', description: 'either null or non-null value'}
  }}


  getFilterExpression( condition:any ){
    const operator = _.toString( _.first( _.keys( condition ) ) );
    const operand = condition[operator];
    switch( operator ){
      case 'is': return { $eq : operand };
      case 'isNot': return { $ne : operand };
      case 'isNull': return { $exists : ! operand };
    }
    console.warn(`BooleanFilter unknown operator '${operator}' `);
  }
}
