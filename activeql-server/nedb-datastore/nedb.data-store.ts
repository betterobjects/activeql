import _ from 'lodash';
import Nedb from 'nedb';
import path, { resolve } from 'path';

import { FilterType } from '../builder/filter-type';
import { DataStore, Paging, Sort } from '../core/data-store';
import { Entity } from '../entities/entity';
import { BooleanFilterType } from './filter/boolean-filter-type';
import { DateFilterType } from './filter/date-filter-type';
import { DateTimeFilterType } from './filter/date-time-filter-type';
import { EnumFilterType } from './filter/enum-filter-type';
import { FloatFilterType } from './filter/float-filter-type';
import { IdFilterType } from './filter/id-filter-type';
import { IntFilterType } from './filter/int-filter-type';
import { StringFilterType } from './filter/string-filter-type';

export class NedbDataStore extends DataStore {

  private collections:{[name:string]:Nedb} = {};

  constructor( private filePath:string ){ super() }

  public static async create( config:{filePath:string} ):Promise<DataStore> {
    return new NedbDataStore( config.filePath );
  }

  async findById( entity:Entity, id:string ):Promise<any> {
    const collection = this.getCollection( entity );
    return new Promise( (resolve, reject) => {
      collection.findOne({ _id: id }, (error:any, item:any) => {
        if( error ) return reject( error );
        resolve( this.buildOutItem( item, entity ) );
      })
    });
  }

  async findByIds( entity:Entity, ids:(string)[] ):Promise<any> {
    const collection = this.getCollection( entity );
    return new Promise( (resolve, reject) => {
      collection.find({ _id: { $in: ids }}, (error:any, items:any) => {
        if( error ) return reject( error );
        resolve( _.map( items, item => this.buildOutItem( item, entity ) ) );
      })
    });
  }

  async findByAttribute( entity:Entity, attrValue:{[name:string]:any}, sort?:Sort ):Promise<any[]> {
    const id = _.get(attrValue, 'id' );
    if( id  ) {
      _.unset( attrValue, 'id' );
      _.set( attrValue, '_id', id );
    }
    return this.findByExpression( entity, attrValue, sort );
  }

  async findByFilter( entity:Entity, filter:any|any[], sort?:Sort, paging?:Paging ):Promise<any[]> {
    const expression = await this.buildExpressionFromFilter( entity, filter );
    return this.findByExpression( entity, expression, sort, paging );
  }

  async create( entity:Entity, attrs:any ):Promise<any> {
    const collection = this.getCollection( entity );

    return new Promise((resolve, reject) => {
      collection.insert( attrs, (error:any, item:any) => {
        if( error ) return reject( error );
        resolve( this.buildOutItem( item, entity ) );
      });
    });
  }

  async update( entity:Entity, attrs: any ):Promise<any> {
    const collection = this.getCollection( entity );
    return new Promise((resolve, reject) => {
      const id =  _.toString( attrs.id );
      _.unset( attrs, 'id' );
      collection.update( { _id: id }, { $set: attrs }, { upsert: false}, (error:any) => {
        if( error ) return reject( error );
        resolve( this.findById( entity, id ) );
      });
    });
  }

  async delete( entity:Entity, id:any  ):Promise<boolean> {
    const collection = this.getCollection( entity );
    return new Promise( (resolve, reject) => {
      collection.remove( { _id: id }, {}, (error, numRemoved) => {
        if( error ) reject( error );
        resolve( numRemoved === 1 );
      })
    });
  }

  async truncate( entity:Entity ):Promise<boolean> {
    const collection = this.getCollection( entity );
    return new Promise( (resolve, reject) => {
      collection.remove( {}, { multi: true }, (error, numRemoved) => {
        if( error ) reject( error );
        resolve( true );
      })
    });
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
      // new AssocFromFilterType( this.db )
    ]
  }

  async buildExpressionFromFilter( entity:Entity, filter:any ):Promise<any> {
    const filterQuery:any = _.has( filter, 'expression' ) ? filter.expression : {};
    for( let field of _.keys(filter) ){
      const condition = filter[field];
      await FilterType.setFilterExpression( filterQuery, entity, condition, field );
    }
    return filterQuery;
  }

  joinExpressions( expressions:any[], join:'and'|'or' = 'and' ):any {
    if( _.size( expressions )  <=1 ) return _.first(expressions);
    return _.set({}, join === 'and' ? '$and' : '$or', expressions );
  }

  // dont like the implementation but ran out if ideas
  async itemMatchesExpression( item:any, expression:any ):Promise<boolean> {
    const collection = new Nedb(); // in-memory
    return new Promise<boolean>( (resolve, reject) => {
      collection.insert( item, (error, item ) => {
        if( error ) reject( error );
        expression = { $and: [ { _id: item.id }, expression ] };
        collection.findOne( expression, (error, found ) => {
          if( error ) reject( error );
          if( ! item ) return resolve( false );
          collection.remove({ id: item.id });
          resolve( true )
        });
      });
    });
  }

  protected async findByExpression( entity:Entity, expression:any, sort?:Sort, paging?:Paging ):Promise<any[]> {
    const collection = this.getCollection( entity );
    const sortStage = this.getSort( sort );
    const sl = this.getSkipLimit( paging );
    return new Promise( (resolve, reject) => {
      collection.find( expression ).sort( sortStage ).skip( sl.skip ).limit( sl.limit ).exec( (error, items) =>{
        if( error ) return reject( error );
        resolve( _.map( items, item => this.buildOutItem( item, entity ) ) );
      });
    });
  }

  protected getCollection( entity:Entity ) {
    if( ! this.collections[entity.collection] ) {
      const filename = path.join( this.filePath, entity.collection );
      this.collections[entity.collection] = new Nedb( {filename, autoload: true } );
    }
    return this.collections[entity.collection];
  }

  protected buildOutItem( item:any, entity:Entity ):any {
    if( ! _.has( item, '_id' ) ) return null;
    _.set( item, 'id', item._id );
    _.unset( item, '_id' );
    _.set( item, '__typename', entity.typeName );
    return item;
	}

  protected async collectionExist( name:string ):Promise<boolean> {
    return this.collections[name] != undefined;
  }

  private getSort( sort?:Sort ):any {
    return _.isUndefined( sort ) ? { _id: -1 } : _.set( {}, sort.field, sort.direction === 'ASC' ? 1 : -1 ) ;
  }

  private getSkipLimit( paging?:Paging ):{ skip:number, limit:number }{
    if( ! paging) return { skip: 0, limit: 0 };
    return { skip: paging.page * paging.size, limit: paging.size };
  }

}
