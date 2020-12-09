import * as FakerDE from 'faker/locale/de';
import * as FakerEN from 'faker/locale/en';
import _ from 'lodash';

import { AssocToManyType, AssocToType, AssocType, SeedAttributeType, SeedType } from '../core/domain-configuration';
import { Entity } from './entity';
import { EntityItem } from './entity-item';
import { EntityModule } from './entity-module';

const fakers = {de: FakerDE, en: FakerEN};

/**
 *
 */
export class EntitySeeder extends EntityModule {


  /**
   *
   */
  public async truncate():Promise<boolean> {
    return await this.entity.accessor.truncate();
  }

  /**
   *
   */
  public async seedAttributes():Promise<any> {
    const ids = {};
    const seeds = this.getSeedsDictionary();

    await Promise.all( _.map( seeds, (seed) => this.resolveAttributeValues( seed ) ) );
    await Promise.all( _.map( seeds, (seed, name) => this.seedInstanceAttributes( name, seed, ids ) ) );
    return _.set( {}, this.entity.typeName, ids );
  }

  /**
   *
   */
  public async seedReferences( idsMap:any ):Promise<void> {
    const seeds = this.getSeedsDictionary();
    await Promise.all( _.map( seeds, async (seed, name) => {

      const assocTos = _.concat(
        this.entity.assocTo,
        _.flatten(_.map( this.entity.implements, impl => impl.assocTo )));
      await Promise.all( _.map( assocTos, async assocTo => {
        await this.seedAssocTo( assocTo, seed, idsMap, name );
      }));

      const assocToManys = _.concat(
        this.entity.assocToMany,
        _.flatten(_.map( this.entity.implements, impl => impl.assocToMany )));

      await Promise.all( _.map( assocToManys, async assocToMany => {
        await this.seedAssocToMany( assocToMany, seed, idsMap, name );
      }));
    }));
  }

  public async deleteInvalidItems( idsMap:any, validationViolations:string[] ):Promise<void> {
    for( const entityName of _.keys(idsMap ) ){
      const entity = this.runtime.entity( entityName );
      const entityMap = idsMap[entityName];
      for( const seedName of _.keys( entityMap ) ){
        try{
          const id = entityMap[seedName];
          let ei = await entity.findOneByAttribute( {id} );
          if( ! ei ) continue;
          const violations = await entity.validate( ei.item );
          if( _.isEmpty( violations ) ) continue;

          await entity.accessor.delete( ei.id ); // this id seems not to exist - parallel problem somewhere - scary
          const result = _(violations).map( violation => `${violation.attribute} : ${violation.message} ` ).join(' , ');
          validationViolations.push( `${entityName}:${seedName} - ${result}` );
          _.unset( entityMap, seedName );
        } catch( error ){
          // console.error( `While deleting '${entityName}:${seedName}'`, error );
        }
      }
    }
  }

  private getSeedsDictionary(){
    if( _.isArray( this.entity.seeds ) ) return _.reduce( this.entity.seeds,
      (result, seed, index ) => _.set( result, _.toString(index), seed ), {} );

    _.forEach( this.entity.seeds, (seed, name) => {
      const count = _.toNumber( name );
      if( _.isNaN( count ) ) return;
      _.times( count, () =>
        _.set( this.entity.seeds, `generated-${ _.values( this.entity.seeds).length}`, _.cloneDeep( seed ) ) );
      _.unset( this.entity.seeds, name );
    });

    return this.entity.seeds;
  }

  /**
   *
   */
  private async resolveAttributeValues( seed:SeedType ){
    for( const attribute of _.keys(this.entity.attributes) ){
      const value = _.get( seed, attribute );
      const result = await this.resolveSeedValue( value, seed );
      if( ! _.isUndefined( result ) ) _.set( seed, attribute, result );
    }
  }

  private async resolveSeedValue( value:SeedAttributeType, seed:SeedType, idsMap?:any ) {
    return  _.isFunction( value ) ? Promise.resolve( value( { seed, runtime: this.runtime, idsMap } ) ) :
            _.has( value, 'eval' ) ? this.evalSeedValue( value, seed, idsMap ) :
            _.has( value, 'sample' ) ? this.getSample( value, seed, idsMap ) :
            value;
  }

  /**
   *
   */
  private async seedInstanceAttributes( name:string, seed:any, ids:any ):Promise<any> {
    try {
      let enit = await EntityItem.create( this.entity, seed );
      enit = await enit.save( true );
      if( ! enit ) throw `seed '${name}' could not be saved`;
      const id = enit.item.id;
      if( ! id ) throw `seed '${name}' has no id`;
      _.set( ids, name, id );
    } catch (error) {
      console.error( `Entity '${this.entity.typeName }' could not seed an instance`, seed, error );
    }
  }

  /**
   *
   */
  private async seedAssocTo( assocTo: AssocType, seed:SeedType, idsMap: any, name: string ):Promise<void> {
    const value:SeedAttributeType = _.get( seed, assocTo.type );
    if ( ! value ) return;
    try {
      let ref = await this.resolveSeedValue( value, seed, idsMap );
      if( _.isString( ref ) ) ref = { type: assocTo.type, ref }
      _.set( ref, 'id', _.get(idsMap, [ref.type, ref.ref] ) );
      if( ! ref.id ) return this.deleteForUnavailableRequiredAssocTo( assocTo, seed, name, idsMap );
      await this.updateAssocTo( idsMap, name, assocTo.type, ref.id, ref.type );
    }
    catch ( error ) {
      console.error( `Entity '${this.entity.typeName}' could not seed a reference`, assocTo, name, error );
    }
  }


  private async deleteForUnavailableRequiredAssocTo( assocTo:AssocToType, seed:any, name:string, idsMap:any ){
    if( ! assocTo.required ) return;
    const id = _.get( idsMap, [this.entity.typeName, name] );
    if( ! id ) return;
    // validationViolations.push( `${entityName}:${seedName} - ${result}` );
    console.warn( `must delete '${this.entity.name}':${name} - because a required assocTo is missing`  );
    await this.entity.accessor.delete( id );
  }

  /**
   *
   */
  private async seedAssocToMany( assocToMany: AssocToManyType, seed: any, idsMap: any, name: string ):Promise<void> {
    let value:SeedAttributeType = _.get( seed, assocToMany.type );
    if ( ! value ) return;

    if( _.isString( value ) ) {
      value = { ref: [value] }
    } else if( _.has( value, 'sample' ) ){
      if( ! _.isNumber( value.size ) && ! _.isNumber(value.random) ) value.size = 1;
      value = await this.resolveSeedValue( value, seed, idsMap );
    }

    if( _.isArray( value ) ) value = { type: assocToMany.type, ref: value };

    const ids = _.compact( _.map( value.ref, ref => _.get(idsMap, [value.type, ref] ) ));

    try {
      await this.updateAssocTo( idsMap, name, assocToMany.type, ids );
    }
    catch ( error ) {
      console.error( `Entity '${this.entity.typeName}' could not seed a reference`, assocToMany, name, error );
    }
  }

  private async updateAssocTo( idsMap: any, name: string, assocToType:string, refId: string|string[], refType?: string  ) {
    const id = _.get( idsMap, [this.entity.typeName, name] );
    if( ! id ) return console.warn(
      `[${this.entity.name}] cannot update assocTo, no id for '${this.entity.name}'.${name}`);
    const enit = await this.entity.findOneByAttribute( {id} );
    if( ! enit ) return;
    const refEntity = this.runtime.entity( assocToType );
    if( _.isArray( refId ) ){
      const refIds = _.map( refId, refId => _.toString( refId ) );
      _.set( enit.item, refEntity.foreignKeys, refIds );
    } else {
      _.set( enit.item, refEntity.foreignKey, _.toString(refId) );
    }
    if( refType && refType !== assocToType ) _.set( enit.item, refEntity.typeField, refType );
    await enit.save( true );
  }


  /**
   *
   */
  private async evalSeedValue( value:any, _seed:any, _idsMap?:any ):Promise<any>{
    if( this.skipShare( value ) ) return undefined;
    const locale = _.get( this.runtime.config.domainDefinition, 'locale', 'en' )

    // following is in context for eval
    const faker = _.get(fakers, locale, FakerEN );
    const ld = _;
    const seed = _seed;
    const idsMap = _idsMap;

    try {
      const result = ((expression:string) => eval( expression )).call( {}, value.eval );
      return result;
    } catch (error) {
      console.error( `could not evaluate '${value.eval}'\n`, error);
    }
  }

  private async getSample( value:any, _seed:any, idsMap?:any ):Promise<any>{
    if( this.skipShare( value ) ) return undefined;

    let sampleSize = false;
    let size:number = 0;

    if( _.isNumber( value.size ) || _.isNumber( value.random ) ){
      sampleSize = true;
      size = _.isNumber( value.size ) ? value.size : 0;
      size += ( _.isNumber( value.random ) ? _.random( value.random ) : 0 );
    }

    if( _.isArray( value.sample) ) return sampleSize ?
      _.sampleSize( value.sample, size ) : _.sample( value.sample );

    const src = _.keys( idsMap[ value.sample ] );
    const ref = sampleSize ? _.sampleSize( src, size ) : _.sample( src );
    return { type: value.sample, ref };
  }

  /**
   *
   */
  private skipShare( value:{share?:number}):boolean {
    if( ! _.isNumber( value.share ) ) return false;
    return _.random() > value.share;
  }

}
