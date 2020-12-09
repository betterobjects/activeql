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
    is: { graphqlType: GraphQLID, description: 'equal' },
    isNot: { graphqlType: GraphQLID, description: 'not equal' },
    isIn: { graphqlType: new GraphQLList(GraphQLID), description: 'ID is in list' },
    notIn: { graphqlType: new GraphQLList(GraphQLID), description: 'ID is not in list' },
    exist: { graphqlType: GraphQLBoolean }
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
    return _.merge( {}, ... _.compact( _.map( condition, (operand, operator) =>
      this.getOperation( operator, operand, field ) ) ) );
  }

  private getOperation( operator:string, operand:any, field:string ):any {
    operand = _.isBoolean( operand ) ? operand :
      _.isArray( operand ) ? _.map( operand, op => field == '_id' ? new ObjectID(op) : _.toString( op ) ) :
      field == '_id' ? new ObjectID( operand ) : _.toString( operand );
    switch( operator ){
      case 'is': return { $eq : operand };
      case 'isNot': return { $ne : operand };
      case 'isIn': return { $in : operand };
      case 'notIn': return { $nin : operand };
      case 'exist': return operand === false ? { $eq: null } : { $ne: null };
    }
    console.warn(`IDFilter unknown operator '${operator}' `);
  }
}
