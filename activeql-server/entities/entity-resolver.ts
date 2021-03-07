import _ from 'lodash';

import { Sort } from '../core/data-store';
import {
  AfterResolverHook,
  AttributeResolveContext,
  AttributeType,
  PreResolverHook,
  ResolverContext,
  ResolverHookContext,
} from '../core/domain-configuration';
import { Entity } from './entity';
import { FileInfo } from './entity-file-save';
import { EntityModule } from './entity-module';

export enum CRUD  {
  CREATE = 'create',
  READ = 'read',
  UPDATE= 'update',
  DELETE = 'delete'
}

//
//
export class EntityResolver extends EntityModule {

  get accessor() { return this.entity.accessor }
  get hooks() { return this.entity.hooks }
  get permissions() { return this.entity.entityPermissions }

  async resolveType( resolverCtx:ResolverContext ):Promise<any> {
    if( _.isFunction( this.entity.typeQuery ) ) return this.entity.typeQuery( resolverCtx, this.runtime );
    const impl = async (resolverCtx:ResolverContext) => {
      const id = _.get( resolverCtx.args, 'id' );
      this.permissions.ensureTypeRead( id, resolverCtx );
      const item = await this.accessor.findById( id );
      return this.resolve( item, resolverCtx );
    };
    return this.callWithHooks( impl, resolverCtx, this.hooks?.preTypeQuery, this.hooks?.afterTypeQuery );
  }

  async resolveTypes( resolverCtx:ResolverContext ):Promise<any[]> {
    if( _.isFunction( this.entity.typesQuery ) ) return this.entity.typesQuery( resolverCtx, this.runtime );
    const impl = async (resolverCtx:ResolverContext) => {
      await this.permissions.ensureTypesRead( resolverCtx );
      const filter = _.get( resolverCtx.args, 'filter');
      const sort = this.getSort( _.get( resolverCtx.args, 'sort') );
      const paging = _.get( resolverCtx.args, 'paging');
      const items = await this.accessor.findByFilter( filter, sort, paging );
      return this.resolve( items, resolverCtx );
    };
    return this.callWithHooks( impl, resolverCtx, this.hooks?.preTypesQuery, this.hooks?.afterTypesQuery );
  }

  async resolveByQuery( resolverCtx:ResolverContext, name:string, attribute:AttributeType ):Promise<any|any[]>{
    const impl = async (resolverCtx:ResolverContext) => {
      await this.permissions.ensureTypesRead( resolverCtx );
      const filter = _.get( resolverCtx.args, 'filter');
      _.set( filter, name, _.get( resolverCtx.args, name) );
      const sort = this.getSort( _.get( resolverCtx.args, 'sort') );
      const paging = _.get( resolverCtx.args, 'paging');
      const items = await this.accessor.findByFilter( filter, sort, paging );
      return this.resolve( attribute.unique === true ? _.first(items) : items, resolverCtx );
    };

    return attribute.unique === true ?
      this.callWithHooks( impl, resolverCtx, this.hooks?.preTypeQuery, this.hooks?.afterTypeQuery ) :
      this.callWithHooks( impl, resolverCtx, this.hooks?.preTypesQuery, this.hooks?.afterTypesQuery );
  }

  async saveType( resolverCtx:ResolverContext ):Promise<any> {
    const id =_.get( resolverCtx.args, [this.entity.singular, 'id'] );
    const customResolver = id ? this.entity.updateMutation : this.entity.createMutation;
    if( _.isFunction( customResolver ) ) return customResolver( resolverCtx, this.runtime );
    const impl = async (resolverCtx:ResolverContext) => {
      await this.permissions.ensureSave( resolverCtx );
      const attributes = _.get( resolverCtx.args, this.entity.singular );
      const fileInfos = await this.setFileValuesAndGetFileInfos( resolverCtx.args, attributes );
      let item = await this.accessor.save( attributes );
      if( _.isArray( item ) ) return { validationViolations: item };
      item = await this.resolve( item, resolverCtx );
      this.saveFiles( item.id, fileInfos );
      return _.set( {validationViolations: []}, this.entity.singular, item );
    };
    return this.callWithHooks( impl, resolverCtx, this.hooks?.preSave, this.hooks?.afterSave );
  }

  async deleteType( resolverCtx:ResolverContext ):Promise<string[]> {
    if( _.isFunction( this.entity.deleteMutation ) ) return this.entity.deleteMutation( resolverCtx, this.runtime );
    const impl = async (resolverCtx:ResolverContext) => {
      await this.permissions.ensureDelete( resolverCtx );
      const id = resolverCtx.args.id;
      try { await this.accessor.delete( id ) } catch (error){ return [ 'Error', _.toString(error)] }
      try { await this.entity.fileSave.deleteFiles( id ) } catch (error) { return ['Error', _.toString(error)] }
      return [];
    };
    return this.callWithHooks( impl, resolverCtx, this.hooks?.preSave, this.hooks?.afterSave );
  }

  async resolveAssocToType( refEntity:Entity, resolverCtx:ResolverContext ):Promise<any> {
    const id = _.get( resolverCtx.root, refEntity.foreignKey );
    if( _.isNil(id) ) return null;
    if( refEntity.isPolymorph ) return this.resolvePolymorphAssocTo( refEntity, resolverCtx, id );
    const refResolverCtx = _.defaults( { args: { id } }, resolverCtx );
    return refEntity.resolver.resolveType( refResolverCtx );
  }

  async resolveAssocToManyTypes( refEntity:Entity, resolverCtx:ResolverContext ):Promise<any> {
    if( refEntity.isPolymorph ) return this.resolvePolymorphAssocToMany( refEntity, resolverCtx );
    const ids = _.map( _.get( resolverCtx.root, refEntity.foreignKeys ), id => _.toString(id) );
    if( _.isNil( ids) || _.isEmpty( ids ) ) return null;
    const refResolverCtx = _.defaults( { args: { filter: { id: ids } } }, resolverCtx );
    return refEntity.resolver.resolveTypes( refResolverCtx );
  }

  async resolveAssocFromTypes( refEntity:Entity, resolverCtx:ResolverContext ):Promise<any[]> {
    const id = _.toString(resolverCtx.root.id);
    const fieldName = refEntity.isAssocToMany( this.entity ) ? this.entity.foreignKeys : this.entity.foreignKey;
    if( refEntity.isPolymorph ) return this.resolvePolymorphAssocFromTypes( refEntity, fieldName, id, resolverCtx );
    const refResolverCtx = _.defaults( { args: { filter: _.set({}, fieldName, id ) } }, resolverCtx );
    return refEntity.resolver.resolveTypes( refResolverCtx );
  }

  async resolveStats( resolverCtx:ResolverContext ):Promise<any> {
    if( _.isFunction( this.entity.statsQuery ) ) return this.entity.statsQuery( resolverCtx, this.runtime );
    await this.permissions.ensureTypesRead( resolverCtx );
    const filter = _.get( resolverCtx.args, 'filter');
    const items = await this.accessor.findByFilter( filter );
    const createdFirst = _.get( _.minBy( items, item => item['createdAt'] ), 'createdAt' );
    const createdLast = _.get( _.maxBy( items, item => item['createdAt'] ), 'createdAt' );
    const updatedLast = _.get( _.maxBy( items, item => item['updatedAt'] ), 'updatedAt' );
    return { count: _.size( items ), createdFirst, createdLast, updatedLast };
  }

  private async callWithHooks(
      impl:Function,
      resolverCtx:ResolverContext,
      preHook?:PreResolverHook,
      afterHook?:AfterResolverHook ):Promise<any>{
    const hookContext = _.isFunction( preHook ) || _.isFunction( afterHook ) ?
      this.createHookContext( resolverCtx ) : undefined;
    let resolved = _.isFunction( preHook ) && hookContext ?
      Promise.resolve( preHook( hookContext ) ) : undefined;
    if( _.isObject(resolved) ) return resolved;
    resolved = await impl( resolverCtx );
    return _.isFunction( afterHook ) && hookContext ?
      Promise.resolve( afterHook( resolved, hookContext ) ) : resolved;
  }

  private createHookContext( resolverCtx:ResolverContext ):ResolverHookContext {
    const principal = this.runtime.getPrincipal( resolverCtx );
    return { resolverCtx, principal, runtime: this.runtime };
  }

  private getSort( sortString: string ):Sort|undefined {
    if( ! sortString ) return undefined;
    const parts = _.split( sortString, '_' );
    if( parts.length !== 2 ) return this.warn( `invalid sortString '${sortString}'`, undefined );
    const field = _.first( parts) as string;
    const direction = _.last( parts ) as 'ASC'|'DESC';
    if( _.includes( ['ASC', 'DESC'], direction) ) return { field, direction };
    this.warn(`invalid direction '${direction}'`, undefined);
  }

  private async resolvePolymorphAssocTo( refEntity:Entity, resolverCtx:ResolverContext, id:any ):Promise<any> {
    const polymorphType = this.runtime.entities[_.get( resolverCtx.root, refEntity.typeField )];
    if( ! polymorphType ) return null;
    const refResolverCtx = _.defaults( { args: { id } }, resolverCtx );
    const resolved = await polymorphType.resolver.resolveType( refResolverCtx );
    return resolved ? _.set( resolved, '__typename', polymorphType.typeName ) : null;
  }

  private async resolvePolymorphAssocToMany( refEntity:Entity, resolverCtx:ResolverContext ):Promise<any> {
    throw 'not implemented';
  }

  private async resolvePolymorphAssocFromTypes(refEntity:Entity, fieldName:string, id:string, resolverCtx:ResolverContext ):Promise<any[]> {
    const result = [];
    for( const entity of refEntity.entities ){
      const filter = _.set( {}, fieldName, id );
      const refResolverCtx = _.defaults( { args: { filter } }, resolverCtx );
      refEntity.entityPermissions.addPermissionToFilter( filter, resolverCtx );
      const resolved = await refEntity.resolver.resolveTypes( refResolverCtx );
      _.forEach( resolved, item => _.set( item, '__typename', entity.typeName ) );
      result.push( resolved );
    }
    return _(result).flatten().compact().value();
  }

  private async setFileValuesAndGetFileInfos( args:any, attributes:any ):Promise<FileInfo[]> {
    const fileInfos:FileInfo[] = [];
    for( const name of _.keys( this.entity.attributes ) ){
      const attribute = this.entity.attributes[name];
      if( ! this.entity.isFileAttribute( attribute ) ) continue;
      const fileInfo = await this.setFileValuesAndGetFileInfo( name, args, attributes )
      if( fileInfo ) fileInfos.push( fileInfo );
    }
    return fileInfos;
  }

  private async setFileValuesAndGetFileInfo( name:string, args:any, attributes:any ):Promise<FileInfo|undefined>{
    const filePromise = _.get( args, name );
    if( ! filePromise ) return;
    return new Promise( resolve => Promise.resolve(filePromise).then( value => {
      const filename = this.entity.fileSave.sanitizeFilename( value.filename );
      const secret = _.toString( _.random(999999999999) + _.random(999999999999) );
      const attribute = _.merge( _.pick(value, 'encoding', 'mimetype' ), {filename, secret }  );
      _.set( attributes, name, attribute );
      resolve({ name, secret, filename, stream: value.createReadStream() });
    }));
  }

  private async saveFiles( id:string, fileInfos:FileInfo[]  ):Promise<void> {
    for( const fileInfo of fileInfos ) await this.entity.fileSave.saveFile( id, fileInfo );
  }

  private async resolve( itemOrItems:undefined|any|any[], resolverCtx:ResolverContext, entity = this.entity  ):Promise<any|any[]> {
    if( itemOrItems === undefined ) return null;
    const items:any[] = _.isArray( itemOrItems ) ? itemOrItems : [itemOrItems];
    for( const item of items ) await this.applyAttributeResolver( entity, item, resolverCtx );
    return _.isArray( itemOrItems ) ? items : _.first( items );
  }

  private async applyAttributeResolver( entity:Entity, item:any, resolverCtx:ResolverContext ){
    const principal = this.runtime.getPrincipal( resolverCtx );
    for( const name of _.keys( entity.attributes ) ){
      const attribute = entity.attributes[name];
      if( ! _.isFunction(attribute.resolve) ) continue;
      const arc:AttributeResolveContext = { item, resolverCtx, principal, runtime: this.runtime };
      const value = await Promise.resolve( attribute.resolve( arc ) );
      Object.defineProperty( item, name, { value } )
    }
  }

}
