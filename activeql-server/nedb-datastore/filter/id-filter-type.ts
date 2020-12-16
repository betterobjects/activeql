import { GraphQLBoolean, GraphQLID, GraphQLList } from 'graphql';
import _ from 'lodash';
import { ObjectID } from 'mongodb';

import { AttributeFilterType } from './attribute-filter-type';

/**
 *
 */
export class IdFilterType extends AttributeFilterType {

  graphqlTypeName() { return GraphQLID.name }

  attributes() { return {
    is: { type: 'ID', description: 'equal' },
    isNot: { type: 'ID', description: 'not equal' },
    isIn: { type: '[ID]', description: 'ID is in list' },
    notIn: { type: '[ID]', description: 'ID is not in list' },
    exist: { type: 'Boolean' }
  }}

  setFilterExpression( expression:any, condition:any, field:string ):any {
    if( field === 'id' ) field = '_id';
    if( _.isString( condition) ) condition = _.set( {}, 'is', condition );
    if( _.isArray( condition ) ) condition = _.set( {}, 'isIn', condition );
    const e = this.getFilterExpression( condition, field );
    if( ! e ) return;
    _.set( expression, field, e );
  } 

  getFilterExpression( condition:any, field:string ):any {
    if( _.has( condition, 'is' ) ) return _.get( condition, 'is' );
    if( _.has( condition, 'exist' ) ) return _.get( condition, 'exist' ) ? { $e: null } : null;
    return _.merge( {}, ... _.compact( _.map( condition, (operand, operator) =>
      this.getOperation( operator, operand, field ) ) ) );
  }

  private getOperation( operator:string, operand:any, field:string ):any {
    operand = _.isBoolean( operand ) ? operand :
      _.isArray( operand ) ? _.map( operand, op => field == '_id' ? new ObjectID(op) : _.toString( op ) ) :
      field == '_id' ? new ObjectID( operand ) : _.toString( operand );
    switch( operator ){
      case 'isNot': return { $ne : operand };
      case 'isIn': return { $in : operand };
      case 'notIn': return { $nin : operand };
    }
    console.warn(`IDFilter unknown operator '${operator}' `);
  }
}
