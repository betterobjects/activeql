import { GraphQLInt } from 'graphql';
import _, { cond } from 'lodash';
import { Db, ObjectId } from 'mongodb';

import { FilterType } from '../../builder/filter-type';
import { Entity } from '../../entities/entity';

/**
 *
 */
export class AssocFromFilterType extends FilterType{


  constructor( protected db:Db ){ super () }

  name() { return 'AssocFromFilter' }
  graphqlTypeName() { return '' }

  attributes() { return {
    min: { type: 'Int', description: 'min referenced items' },
    max: { type: 'Int', description: 'max referenced items' }
  }}


  async setFilterExpression( expression:any, condition:any, field:string, entity:Entity ):Promise<void> {
    const refEntity = _.find( this.runtime.entities, entity => entity.plural === field );
    if( ! refEntity ) return;
    throw  'not implemented';
  }
}
