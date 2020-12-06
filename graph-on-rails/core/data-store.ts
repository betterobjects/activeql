import { FilterType } from '../builder/filter-type';
import { Entity } from '../entities/entity';

export type Sort = {
  field:string
  direction:'ASC'|'DESC'
}

export type Paging = {
  page:number
  size:number
}

export enum JOIN {
  AND,
  OR
}

/**
 *
 */
export abstract class DataStore {

  abstract findById( entity:Entity, id:any ):Promise<any>

  abstract findByIds( entity:Entity, id:any ):Promise<any>

  abstract findByAttribute( entity:Entity, attrValue:{[name:string]:any} ):Promise<any[]>;

  abstract aggregateFind( entities:Entity[], filter:any, sort?:Sort, paging?:Paging ):Promise<any[]>;

  /**
   *
   * @param entity the entity
   * @param filter the filter as it would be build from the filter types of this datasource,
   *                if array: and joined
   *                filter of { expression: any } is not evaluated by FilterTypes but handled as is
   * @returns all items matching the filter
   */
  abstract findByFilter( entity:Entity, filter:any|any[], sort?:Sort, paging?:Paging ):Promise<any[]>;

  abstract create( entity:Entity, attrs: any ):Promise<any>;

  abstract update( entity:Entity, attrs: any ):Promise<any>;

  abstract delete( entity:Entity, id:any  ):Promise<boolean>;

  abstract truncate( entity:Entity ):Promise<boolean>;

  abstract getDataStoreFilterTypes():FilterType[];

  abstract getEnumFilterType( name: string ):FilterType;

  abstract buildExpressionFromFilter( entity:Entity, filter:any ):Promise<any>;

  abstract joinExpressions( expressions:any[], join:'and'|'or' ):any;

  abstract itemMatchesExpression( item:any, expression:any ):Promise<boolean>;

}
