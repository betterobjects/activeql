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
    isNot: { type: 'Boolean', description: 'is not' }
  }}

  getFilterExpression( condition:any ){
    if( _.has( condition, 'is' ) ) return _.get( condition, 'is' );
    const operator = _.toString( _.first( _.keys( condition ) ) );
    const operand = condition[operator];
    switch( operator ){
      case 'isNot': return { $ne : operand };
    }
    console.warn(`BooleanFilter unknown operator '${operator}' `);
  }
}
