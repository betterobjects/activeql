// import ts from 'es6-template-strings';
import _ from 'lodash';
import { Collection, Db, FilterQuery, MongoClient, MongoClientOptions, ObjectId } from 'mongodb';

import { FilterType } from '../builder/filter-type';
import { DataStore, Paging, Sort } from '../core/data-store';
import { Entity } from '../entities/entity';
import { AssocFromFilterType } from './filter/assoc-from-filter-type';
import { BooleanFilterType } from './filter/boolean-filter-type';
import { DateFilterType } from './filter/date-filter-type';
import { DateTimeFilterType } from './filter/date-time-filter-type';
import { EnumFilterType } from './filter/enum-filter-type';
import { FloatFilterType } from './filter/float-filter-type';
import { IdFilterType } from './filter/id-filter-type';
import { IntFilterType } from './filter/int-filter-type';
import { StringFilterType } from './filter/string-filter-type';

export class MongoDbDataStore extends DataStore {

  constructor( protected client:MongoClient, protected db:Db ){ super() }

  public static async create( config:{url:string, dbName:string}, options:MongoClientOptions = {} ):Promise<DataStore> {
    options = _.defaults(options, { useNewUrlParser: true, useUnifiedTopology: true, poolSize: 100 } );
    const url = _.get( config, 'url' );
    if( ! url ) throw `please provide url`;
    const dbName = _.get( config, 'dbName' );
    if( ! dbName ) throw `please provide dbName`;
    const client = await MongoClient.connect( url, options );
    return new MongoDbDataStore( client, client.db(dbName) );
  }

  async findById( entity:Entity, id:ObjectId|string ):Promise<any> {
    if( ! (id instanceof ObjectId) ) id = this.getObjectId( id, entity );
    const collection = this.getCollection( entity );
    const item = await collection.findOne( id );
    return this.buildOutItem( item, entity );
  }

  async findByIds( entity:Entity, ids:(ObjectId|string)[] ):Promise<any> {
    ids = _.map( ids, id => this.getObjectId( id, entity ) );
    const collection = this.getCollection( entity );
    const items = await collection.find( {_id: { $in: ids }} ).toArray();
    return _.map( items, item => this.buildOutItem( item, entity ) );
  }

  async findByAttribute( entity:Entity, attrValue:{[name:string]:any}, sort?:Sort ):Promise<any[]> {
    const id = _.get(attrValue, 'id' );
    if( id  ) {
      _.unset( attrValue, 'id' );
      _.set( attrValue, '_id', this.getObjectId( id, entity ) );
    }
    return this.findByExpression( entity, attrValue, sort );
  }

  async findByFilter( entity:Entity, filter:any|any[], sort?:Sort, paging?:Paging ):Promise<any[]> {
    const expression = await this.buildExpressionFromFilter( entity, filter );
    return this.findByExpression( entity, expression, sort, paging );
  }

  async aggregateFind( entities:Entity[], filter:any, sort?:Sort, paging?:Paging ):Promise<any[]>{
    if( entities.length === 0 ) return [];

    const expression = await this.buildExpressionFromFilter( _.first(entities) as Entity, filter );
    const lookups:any[] = _.map( entities, entity => ({
      $lookup: {
        from: entity.typesQueryName,
        pipeline: [
          { $addFields: { __typename: entity.typeName } },
        ],
        as: entity.typesQueryName
      }
    }));
    const concatArrays = _.map( entities, entity => `$${entity.typesQueryName}` );
    const aggregateDefinition = _.compact( _.concat(
      { $limit: 1 },
      { $project: { _id: '$$REMOVE' } },
      lookups,
      { $project: { union: { $concatArrays: concatArrays } } },
      { $unwind: '$union' },
      { $replaceRoot: { newRoot: '$union' } },
      { $sort: this.getSort( sort ) }
    ));

    const randomEntity = _.first( entities ) as Entity;
    const sortStage = this.getSort( sort );
    const sl = this.getSkipLimit( paging );
    if( sl.limit === 0 ) sl.limit = Number.MAX_SAFE_INTEGER;
    const aggregate = this.getCollection( randomEntity ).aggregate( aggregateDefinition ).match(expression);
    const items = await aggregate.sort( sortStage ).skip(sl.skip).limit(sl.limit).toArray();
    return _.map( items, item => this.buildOutItem( item ) );
  }

  async create( entity:Entity, attrs:any ):Promise<any> {
    const collection = this.getCollection( entity );
    const result = await collection.insertOne( attrs );
    return this.findById( entity, result.insertedId );
  }

  async update( entity:Entity, attrs: any ):Promise<any> {
    const _id = new ObjectId( attrs.id );
    delete attrs.id;
    const collection = this.getCollection( entity );
    const result = await collection.updateOne( { _id }, { $set: attrs }, { upsert: false } );
    return this.findById( entity, _id );
  }

  async delete( entityType:Entity, id:any  ):Promise<boolean> {
    const collection = this.getCollection( entityType );
    collection.deleteOne( { _id: new ObjectId( id ) } );
    return true;
  }

  async truncate( entity:Entity ):Promise<boolean> {
    const collectionName = entity.collection;
    if( await this.collectionExist( collectionName ) ) try {
      await this.db.dropCollection( collectionName );
      return true;
    } catch (error) {
      console.error( error );
    }
    return false;
  }

  getEnumFilterType( enumName: string ) {
    return new EnumFilterType( enumName );
  }

  getDataStoreFilterTypes():FilterType[] {
    return [
      new StringFilterType(),
      new IntFilterType(),
      new FloatFilterType(),
      new BooleanFilterType(),
      new DateFilterType(),
      new DateTimeFilterType(),
      new IdFilterType(),
      new AssocFromFilterType( this.db )
    ]
  }

  async buildExpressionFromFilter( entity:Entity, filter:any ):Promise<FilterQuery<any>> {
    const filterQuery:FilterQuery<any> = _.has( filter, 'expression' ) ? filter.expression : {};
    for( let field of _.keys(filter) ){
      const condition = filter[field];
      await FilterType.setFilterExpression( filterQuery, entity, condition, field );
    }
    return filterQuery;
  }

  joinExpressions( expressions:any[], join:'and'|'or' = 'and' ):FilterQuery<any> {
    if( _.size( expressions )  <=1 ) return _.first(expressions);
    return _.set({}, join === 'and' ? '$and' : '$or', expressions );
  }

  // dont like the implementation but ran out if ideas
  async itemMatchesExpression( item:any, expression:any ):Promise<boolean> {
    const session = this.client.startSession();
    let value = false;
    try {
      session.withTransaction( async () => {
        const collection = this.db.collection('__itemMatchesExpression');
        const result = await collection.insertOne( item, { session } );
        const found = await collection.findOneAndDelete(
          { $and: [ { _id: result.insertedId }, expression ]}, { session } );
        if( found ) {
          value = true;
          return;
        }
        await collection.deleteOne( { _id : result.insertedId }, { session } );
      });
    } finally {
      session.endSession();
    }
    return value;
  }

  protected getObjectId( id:any, entity:Entity ):ObjectId {
    if( ! id ) throw new Error(`cannot resolve type '${entity.name}' without id`);
    try {
      return new ObjectId( _.toString( id ) );
    } catch (error) {
      throw new Error( `could not convert '${id}' for '${entity.name}' to an ObjectId` );
    }
  }

  protected async findByExpression( entity:Entity, expression:any, sort?:Sort, paging?:Paging ):Promise<any[]> {
    const collection = this.getCollection( entity );
    const sortStage = this.getSort( sort );
    const sl = this.getSkipLimit( paging );
    const items = await collection.find( expression ).sort( sortStage ).skip( sl.skip ).limit( sl.limit ).toArray();
    return _.map( items, item => this.buildOutItem( item, entity ) );
  }

  protected getCollection( entity:Entity ):Collection {
    return this.db.collection( entity.collection  );
  }

  protected buildOutItem( item:any, entity?:Entity ):any {
    if( ! _.has( item, '_id' ) ) return null;
    _.set( item, 'id', _.toString(item._id) );
    _.unset( item, '_id' );
    if( entity ) _.set( item, '__typename', entity.typeName );
    return item;
	}

  protected async collectionExist( name:string ):Promise<boolean> {
    const collection = await this.db.listCollections({name}).next();
    return collection != null;
  }

  private getSort( sort?:Sort ):any {
    return _.isUndefined( sort ) ? { _id: -1 } : _.set( {}, sort.field, sort.direction === 'ASC' ? 1 : -1 ) ;
  }

  private getSkipLimit( paging?:Paging ):{ skip:number, limit:number }{
    if( ! paging) return { skip: 0, limit: 0 };
    return { skip: paging.page * paging.size, limit: paging.size };
  }

}
