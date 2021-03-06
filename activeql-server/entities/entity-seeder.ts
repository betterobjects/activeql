import * as FakerDE from 'faker/locale/de';
import * as FakerEN from 'faker/locale/en';
import _ from 'lodash';
import bcrypt from 'bcryptjs';

import { AssocToManyType, AssocToType, AssocType, AttributeType, SeedAttributeType, SeedType } from '../core/domain-configuration';
import { EntityModule } from './entity-module';
import { RandomFormatString as _RandomFormatString } from '../util/random-format-string';

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
  public async seedAttributes( ):Promise<any> {
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
        if(assocTo) await this.seedAssocTo( assocTo, seed, idsMap, name );
      }));

      const assocToManys = _.concat(
        this.entity.assocToMany,
        _.flatten(_.map( this.entity.implements, impl => impl.assocToMany )));

      await Promise.all( _.map( assocToManys, async assocToMany => {
        if( assocToMany ) await this.seedAssocToMany( assocToMany, seed, idsMap, name );
      }));
    }));
  }

  public async deleteInvalidItems( idsMap:any, validationViolations:string[] ):Promise<void> {
    for( const entityName of _.keys(idsMap ) ){
      const entity = this.runtime.entity( entityName );
      const entityMap = idsMap[entityName];
      for( const seedName of _.keys( entityMap ) ){
        try {
          const id = entityMap[seedName];
          let item = await entity.findOneByAttribute( {id} );
          if( ! item ) continue;
          const violations = await entity.validate( item );
          if( _.isEmpty( violations ) ) continue;

          await entity.accessor.delete( item.id ); // this id seems not to exist - parallel problem somewhere - scary
          const result = _(violations).map( violation => `${violation.attribute} : ${violation.message} ` ).join(' , ');
          validationViolations.push( `${entityName}:${seedName} - ${result}` );
          _.unset( entityMap, seedName );
        } catch( error ){
          console.error( `While deleting '${entityName}:${seedName}'`, error );
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

  private async resolveAttributeValues( seed:SeedType ){
    const attributes = _.values( this.entity.attributes );
    attributes.push( ... _.flatten( _.map( this.entity.implements, entity => _.values( entity.attributes ) ) ) );
    for( const attribute of attributes ){
      const value = _.get( seed, attribute.name );
      if( ! value ) continue;
      const result = await this.resolveSeedValue( value, seed, undefined, attribute );
      _.isUndefined( result ) ? _.unset( seed, attribute.name ) : _.set( seed, attribute.name, result );
    }
  }

  private async resolveSeedValue( value:SeedAttributeType|Function, seed:SeedType, idsMap?:any, attribute?:AttributeType ) {
    return  _.isFunction( value ) ? Promise.resolve( value( { seed, runtime: this.runtime, idsMap } ) ) :
            _.has( value, 'value' ) ? this.getValue( value ) :
            _.has( value, 'faker' ) ? this.getFaker( value, seed, idsMap ) :
            _.has( value, 'sample' ) ? this.getSample( value, seed, idsMap, attribute ) :
            _.has( value, 'random' ) ? this.getRandom( value, attribute ) :
            _.has( value, 'hash' ) ? this.getHash( value ) :
            _.has( value, 'rfs' ) ? this.getRfs( value, seed, idsMap ) :
            _.has( value, 'eval' ) ? this.evalSeedValue( value, seed, idsMap ) :
            value;
  }

  private async seedInstanceAttributes( name:string, seed:any, ids:any ):Promise<any> {
    try {
      seed = await this.entity.accessor.save( seed, true );
      const id = seed.id;
      if( ! id ) throw `seed '${name}' has no id`;
      _.set( ids, name, id );
    } catch (error) {
      console.error( `Entity '${this.entity.typeName }' could not seed an instance`, seed, error );
    }
  }

  private async seedAssocTo( assocTo: AssocType, seed:SeedType, idsMap: any, name: string ):Promise<void> {
    const value:undefined|SeedAttributeType|Function = _.get( seed, assocTo.type );
    if ( ! value ) return;
    try {
      let resolved = await this.resolveSeedValue( value, seed, idsMap );
      if( _.isString( resolved ) ) resolved = { type: assocTo.type, ref: resolved }
      _.set( resolved, 'id', _.get(idsMap, [resolved.type, resolved.ref] ) );
      if( ! resolved.id ) return this.deleteForUnavailableRequiredAssocTo( assocTo, seed, name, idsMap );
      await this.updateAssocTo( idsMap, name, assocTo.type, resolved.id, resolved.type );
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

  private async seedAssocToMany( assocToMany: AssocToManyType, seed: any, idsMap: any, name: string ):Promise<void> {
    const value:SeedAttributeType = _.get( seed, assocToMany.type );
    if ( ! value ) return;

    if( _.isNumber( value )) return;
    if( _.isBoolean( value )) return;

    let resolved:any = undefined;
    if( _.isString( value ) ) {
      resolved = { type: assocToMany.type, ref: [value] }
    } else if( _.isArray( value ) ) {
      resolved = { type: assocToMany.type, ref: value };
    } else if( _.has( value, 'sample' ) ){
      if( _.isNumber( value.random ) ) value.size = _.random( assocToMany.required ? 1 : 0, value.random );
      if( ! _.isNumber( value.size ) ) value.size = _.random( assocToMany.required ? 1 : 0, 3 );
      resolved = await this.resolveSeedValue( value, seed, idsMap );
    }

    const ids = _.compact( _.map( resolved.ref, ref => _.get(idsMap, [resolved.type, ref] ) ));

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
    const item = await this.entity.findOneByAttribute( {id} );
    if( ! item ) return;
    const refEntity = this.runtime.entity( assocToType );
    if( _.isArray( refId ) ){
      const refIds = _.map( refId, refId => _.toString( refId ) );
      _.set( item, refEntity.foreignKeys, refIds );
    } else {
      _.set( item, refEntity.foreignKey, _.toString(refId) );
    }
    if( refType && refType !== assocToType ) _.set( item, refEntity.typeField, refType );
    await this.entity.accessor.save( item, true );
  }


  private async evalSeedValue( value:any, _seed:any, _idsMap?:any ):Promise<any>{
    if( this.skipShare( value ) ) return undefined;
    const locale = _.get( this.runtime.config.domainDefinition, 'locale', 'en' )

    // following is in context for eval
    const faker = _.get(fakers, locale, FakerEN );
    const ld = _;
    const seed = _seed;
    const idsMap = _idsMap;
    const rfs = new _RandomFormatString();
    const RandomFormatString = _RandomFormatString;

    try {
      const result = ((expression:string) => eval( expression )).call( {}, value.eval );
      return result;
    } catch (error) {
      console.error( `could not evaluate '${value.eval}'\n`, error);
    }
  }

  private getHash( value:any ) {
    if( this.skipShare( value ) ) return undefined;
    return bcrypt.hashSync( value.hash );
  }

  private getValue( value:any ) {
    if( this.skipShare( value ) ) return undefined;
    return value.value;
  }

  private getRfs( value:any, seed:any, idsMap?:any ) {
    if( this.skipShare( value ) ) return undefined;
    value.eval = 'rfs.' + value.rfs;
    return this.evalSeedValue( value, seed, idsMap );
  }


  private async getFaker( value:any, _seed:any, _idsMap?:any ):Promise<any>{
    if( this.skipShare( value ) ) return undefined;
    const locale = _.get( this.runtime.config.domainDefinition, 'locale', 'en' )
    const faker:any = _.get(fakers, locale, FakerEN );
    try {
      const fakerValues = _.split( value.faker, '.' );
      const fakerCategory = _.first( fakerValues ) || '';
      const fakerFunction = _.last( fakerValues ) || '';
      return faker[fakerCategory][fakerFunction]();
    } catch (error) {
      console.error( `could not get faker value for '${value.faker}'\n`, error);
    }
  }


  private getRandom( value:any, attribute?:AttributeType ){
    if( ! attribute ) return;
    if( this.skipShare( value ) ) return;
    if( ! _.includes(['float','int'], _.toLower( attribute.type ) ) ) return;

    let min = _.isNumber( value.random ) ? 0 : _.get( value, 'random.min' );
    let max = _.isNumber( value.random ) ? value.random : _.get( value, 'random.max' );

    const floating = _.toLower( attribute.type ) === 'float';
    if( ! min ) min = 0;
    if( ! max ) max = floating ? 1 : 100000;
    return _.random( min, max, floating );
  }

  private async getSample( value:any, _seed:any, idsMap?:any, attribute?:AttributeType ):Promise<any>{
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

    if( _.includes( this.runtime.enums, value.sample ) ){
      const enumType = this.runtime.type( value.sample );
      const enumValues = _.map( enumType.getValues(), value => value.value );
      return sampleSize ? _.sampleSize( enumValues, size ) : _.sample( enumValues );
    }

    const src = _.keys( idsMap[ value.sample ] );
    const ref = sampleSize ? _.sampleSize( src, size ) : _.sample( src );
    return { type: value.sample, ref };
  }

  private skipShare( value:{share?:number}):boolean {
    if( ! _.isNumber( value.share ) ) return false;
    return _.random( 0, 1, true ) > value.share;
  }

}
