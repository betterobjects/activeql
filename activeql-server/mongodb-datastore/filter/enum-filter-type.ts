import { GraphQLEnumType, GraphQLList } from 'graphql';
import _ from 'lodash';
import { AttributeFilterType } from './attribute-filter-type';

//
//
export class EnumFilterType extends AttributeFilterType {

  constructor( private enumName:string ){ super() }

  graphqlTypeName() { return this.graphx.type( this.enumName )?.name }

  attributes() {
    return {
      is: { type: this.enumName },
      isNot: { type: this.enumName },
      in: { type: `[${this.enumName}]` },
      notIn: { type: `[${this.enumName}]` },
      isNull: { type: 'Boolean', description: 'either null or non-null value'}
    }
  }

  getFilterExpression( condition:any, field:string ):any {
    return _.merge( {}, ... _.compact( _.map( condition, (operand, operator) => this.getOperation( operator, operand ) ) ) );
  }

  private getOperation( operator:string, operand:any ):any {
    const enumType = this.graphx.type( this.enumName );
    if( ! ( enumType instanceof GraphQLEnumType ) ) return null;
    switch( operator ){
      case 'is': return { $eq: operand };
      case 'isNot': return { $ne: operand };
      case 'in': return { $in: operand };
      case 'notIn': return { $nin: operand };
      case 'isNull': return { $exists : ! operand };
    }
    console.warn(`EnumFilterType '${this.enumName}' unknown operator '${operator}' `);
  }

}
