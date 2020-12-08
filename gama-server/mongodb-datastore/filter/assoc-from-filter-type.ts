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
    min: { graphqlType: GraphQLInt, description: 'min referenced items' },
    max: { graphqlType: GraphQLInt, description: 'max referenced items' }
  }}


  async setFilterExpression( expression:any, condition:any, field:string, entity:Entity ):Promise<void> {
    const refEntity = _.find( this.runtime.entities, entity => entity.plural === field );
    if( ! refEntity ) return;
    const coll = this.db.collection( refEntity.collection );

    let notIn = false;

    if( condition.min === undefined || condition.min <= 0 || condition.max === 0 ){
      // lets reverse the logic
      notIn = true;
      condition.min = condition.max + 1;
      condition.max = undefined;
    }

    const sum:any = {};
    if( condition.min ) sum['$gte'] = condition.min;
    if( condition.max ) sum['$lte'] = condition.max;

    const agg = [
      { '$match': _.set({}, entity.foreignKey, { $exists: true } ) },
      { '$group': { '_id': `$${entity.foreignKey}`, 'sum': {  '$sum': 1 } } },
      { '$match': { 'sum': sum } },
      { '$project': _.set( {}, entity.foreignKey, 1 ) }
    ];

    let refIds = await coll.aggregate(agg).toArray();
    refIds = _.map( refIds, refId => new ObjectId( refId._id ) );
    const e = notIn ? { '$nin': refIds} : { '$in': refIds};
    _.set( expression, '_id', e );
  }
}
