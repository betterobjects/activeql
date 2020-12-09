import { GraphQLEnumType, GraphQLList } from 'graphql';
import _ from 'lodash';
import { AttributeFilterType } from './attribute-filter-type';

//
//
export class EnumFilterType extends AttributeFilterType {

  constructor( private enumName:string ){ super() }

  graphqlTypeName() { return this.graphx.type( this.enumName )?.name }

  attributes() {
    const enumType = this.graphx.type( this.enumName );
    return {
      is: { graphqlType: enumType},
      isNot: { graphqlType: enumType },
      in: { graphqlType: new GraphQLList( enumType ) },
      notIn: { graphqlType: new GraphQLList( enumType ) }
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
    }
    console.warn(`EnumFilterType '${this.enumName}' unknown operator '${operator}' `);
  }

}
