import _ from 'lodash';

import { ResolverContext, PermissionExpression, PermissionExpressionFn, PrincipalType } from '../core/domain-configuration';
import { EntityModule } from './entity-module';
import { CRUD } from './entity-resolver';

export interface EntityPermissions  {

  ensureTypeRead( id:string|string[], resolverCtx:ResolverContext ):Promise<void>

  ensureTypesRead(resolverCtx:ResolverContext ):Promise<void>

  addPermissionToFilter( filter:any, resolverCtx:ResolverContext ):Promise<void>

  isIdPermitted( id:string, action:CRUD, resolverCtx:ResolverContext ):Promise<boolean>

  ensureSave( resolverCtx:ResolverContext ):Promise<void>

  ensureDelete( resolverCtx:ResolverContext ):Promise<void>

  getPermittedIds( action:CRUD, resolverCtx:ResolverContext ):Promise<boolean|string[]>

  getExpressionFromAssign( assign:string, action:CRUD, resolverCtx:ResolverContext ):Promise<object|undefined>
}

export class DefaultEntityPermissions extends EntityModule implements EntityPermissions {

  get dataStore() { return this.runtime.dataStore }

  async ensureTypeRead( ids:string|string[], resolverCtx:ResolverContext ) {
    if( ! _.isArray( ids ) ) ids = [ids];
    for( const id of ids ){
      if( this.isIdPermitted( id, CRUD.READ, resolverCtx ) ) continue;
      throw new Error(`id '${id}' does not exist`);
    }
  }

  async ensureTypesRead(resolverCtx:ResolverContext ):Promise<void>{
    const filter = _.get( resolverCtx.args, 'filter', {} );
    await this.addPermissionToFilter( filter, resolverCtx );
    _.set( resolverCtx.args, 'filter', filter );
  }

  async isIdPermitted( id:string, action:CRUD, resolverCtx:ResolverContext ):Promise<boolean> {
    const permissions = await this.getPermissions( action, resolverCtx );
    if( permissions === true ) return true;
    if( ! permissions || _.isEmpty( permissions ) ) return false;

    const expression = this.runtime.dataStore.joinExpressions( permissions, 'or' );
    const filter = { expression, id };
    const permittedItems = await this.dataStore.findByFilter(this.entity, filter );
    return _.size( permittedItems ) > 0;
  }

  async addPermissionToFilter( filter:any, resolverCtx:ResolverContext ):Promise<void>{
    const permissions = await this.getPermissions( CRUD.READ, resolverCtx );
    if( permissions === true ) return;
    if( ! permissions || _.isEmpty( permissions ) ) return _.set( filter, 'id', null );
    const expression = this.runtime.dataStore.joinExpressions( permissions, 'or' );
    _.set( filter, 'expression', expression );
  }

  ensureSave( resolverCtx:ResolverContext ){
    const id =_.get( resolverCtx.args, [this.entity.singular, 'id'] );
    return id ? this.ensureUpdate( resolverCtx ) : this.ensureCreate( resolverCtx );
  }

  async ensureDelete( resolverCtx:ResolverContext ){
    const id = _.get( resolverCtx.args, 'id' );
    await this.isIdPermitted( id, CRUD.DELETE, resolverCtx );
  }

  async getPermittedIds( action:CRUD, resolverCtx:ResolverContext ):Promise<boolean|string[]>{
    const permissions = await this.getPermissions( action, resolverCtx );
    if( _.isBoolean( permissions ) ) return permissions;
    if( _.isEmpty( permissions ) ) return false;

    const expression = this.runtime.dataStore.joinExpressions( permissions, 'or' );
    const permittedItems = await this.dataStore.findByFilter( this.entity, { expression } );
    return _.map( permittedItems, item => item.id );
  }

  private async ensureCreate( resolverCtx:ResolverContext ){
    const permissions = await this.getPermissions( CRUD.CREATE, resolverCtx );
    if( permissions === true ) return;
    if( permissions === false ) throw new Error(`principal not allowed to create new item of '${this.entity.name}'`);
    const expression = this.runtime.dataStore.joinExpressions( permissions, 'or' );
    const item =_.get( resolverCtx.args, [this.entity.singular] );
    if( ! await this.dataStore.itemMatchesExpression( item, expression ) )
      throw new Error(`principal not allowed to create this item of '${this.entity.name}'`);
  }

  private async ensureUpdate( resolverCtx:ResolverContext ){
    const permissions = await this.getPermissions( CRUD.UPDATE, resolverCtx );
    if( permissions === true ) return;
    if( permissions === false ) throw new Error(`principal not allowed to create new item of '${this.entity.name}'`);
    const expression = this.runtime.dataStore.joinExpressions( permissions, 'or' );
    const item =_.get( resolverCtx.args, [this.entity.singular] );
    if( ! await this.dataStore.itemMatchesExpression( item, expression ) )
    throw new Error(`principal not allowed to update this item of '${this.entity.name}'`);

    const id = _.get( resolverCtx.args, [this.entity.singular, 'id'] );
    const filter = { expression, id };
    const permittedItems = await this.dataStore.findByFilter(this.entity, filter );
    if( _.size( permittedItems ) === 0 ) throw new Error(`action not permitted for id '${id}'`)
  }

  private async getPermissions( action:CRUD, resolverCtx:ResolverContext ):Promise<boolean|PermissionExpression[]> {
    if( _.isUndefined( this.entity.permissions ) ) return true;
    const principalRoles = this.getPrincipalRoles( resolverCtx );
    if( _.isBoolean(principalRoles) ) return principalRoles;

    return _.isString( this.entity.permissions ) ?
      await this.getPermissionsFromDelegate(this.entity.permissions, action, resolverCtx ) :
      await this.getPermissionFromEntityDefinition( action, resolverCtx );
  }

  private async getPermissionFromEntityDefinition( action:CRUD, resolverCtx:ResolverContext ):Promise<boolean|PermissionExpression[]>{
    if( ! this.entity.permissions || _.isString( this.entity.permissions) ) return false; // type ensure
    const principalRoles = this.getPrincipalRoles( resolverCtx );
    if( _.isBoolean(principalRoles) ) return principalRoles;  // type ensure
    const roles = _.intersection( principalRoles, _.keys( this.entity.permissions ) );
    return this.getPermissionsFromRoleDefinitions( roles, action, resolverCtx );
  }

  private async getPermissionsFromRoleDefinitions( roles:string[], action:CRUD, resolverCtx:ResolverContext):Promise<boolean|PermissionExpression[]>{
    if( ! this.entity.permissions || _.isString( this.entity.permissions) ) return false; // type ensure
    const expressions:PermissionExpression[] = [];
    for( const role of roles ){
      const roleDefinition = this.entity.permissions[role];
      if( roleDefinition === undefined ) {
        continue;
      } else if( roleDefinition === true ){
        return true
      } else if( _.isString( roleDefinition ) ) {
        const expression = await this.getExpressionFromAssign( roleDefinition, action, resolverCtx );
        if( expression ) expressions.push( expression );
      } else if( _.isFunction( roleDefinition ) ){
        const foundTrue = await this.addExpressionsFromFns( expressions, role, roleDefinition, action, resolverCtx );
        if( foundTrue === true ) return true;
      } else if( _.isObject( roleDefinition ) ){
        const actionPermission = _.get( roleDefinition, action );
        if( actionPermission === true ) return true;
        if( _.isString( actionPermission ) ) {
          const expression = await this.getExpressionFromAssign( actionPermission, action, resolverCtx );
          if( expression ) expressions.push( expression );
        }
      }
    }
    return expressions.length === 0 ? false : expressions;
  }

  async getExpressionFromAssign( assign:string, action:CRUD, resolverCtx:ResolverContext ):Promise<object|undefined>{
    const entities = _.split( assign, ':' );
    if( _.size( entities ) === 0 ) return;
    if( _.size( entities ) === 1 ) return this.getExpressionFromAssignedEntity( _.first( entities ) || '', action, resolverCtx );
    const next = this.runtime.entities[ entities.shift() || ''];
    if( ! next ) return;
    const expression = next.entityPermissions.getExpressionFromAssign( _.join( entities, ':' ), action, resolverCtx );
    const nextItems = await this.dataStore.findByFilter( next, { expression } );
    const nextIds = _.map( nextItems, item => item.id );
    return this.runtime.dataStore.buildExpressionFromFilter(  this.entity, _.set( {}, next.foreignKey, nextIds ) );
  }

  private async getExpressionFromAssignedEntity( assigned:string, action:CRUD, resolverCtx:ResolverContext ):Promise<object|undefined>{
    const assignedEntity = assigned === this.entity.name ? this.entity : this.runtime.entities[assigned || ''];
    if( ! assignedEntity ) return;
    const principal = this.runtime.getPrincipal( resolverCtx );
    const key =
      _.has( principal, assignedEntity.foreignKey ) ? assignedEntity.foreignKey :
      _.has( principal, assignedEntity.foreignKeys ) ? assignedEntity.foreignKeys : undefined;
    if( ! key ) return;
    const field = assigned === this.entity.name ? 'id' : assignedEntity.foreignKey;
    return this.runtime.dataStore.buildExpressionFromFilter(  this.entity, _.set( {}, field, principal[key] ) );
  }

  private async addExpressionsFromFns(
      expressions:PermissionExpression[],
      role:string,
      expressionFn:PermissionExpressionFn,
      action:CRUD,
      resolverCtx:ResolverContext ):Promise<true|undefined>{
    const principal = this.runtime.getPrincipal( resolverCtx );

    const expression = await Promise.resolve(
      expressionFn( {action, principal, resolverCtx, role, runtime: this.runtime } ) );
    if( ! expression  ) return;
    if( expression === true ) return true;
    expressions.push( expression );
  }

  private async getPermissionsFromDelegate( delegate:string, action:CRUD, resolverCtx:ResolverContext):Promise<boolean|PermissionExpression[]> {
    const entity = this.runtime.entities[ delegate ];
    if( ! entity ) return false;
    const delegatePermissionIds = await entity.entityPermissions.getPermittedIds( action, resolverCtx );
    if( _.isBoolean( delegatePermissionIds ) ) return delegatePermissionIds;
    const ids = _.map( delegatePermissionIds , id => _.toString( id ) );
    const expression = await this.dataStore.buildExpressionFromFilter(
      this.entity, _.set({}, entity.foreignKey, ids ) )
    return [expression];
  }

  private getPrincipalRoles( resolverCtx:ResolverContext ):string[]|boolean{
    const principal = this.runtime.getPrincipal( resolverCtx );
    if( ! principal ) return false;
    const roles = _.isFunction( principal.roles ) ? principal.roles( this.runtime, resolverCtx ) : principal.roles;
    if( _.isBoolean( roles ) ) return roles;
    if( ! roles ) return [];
    return _.isArray( roles ) ? roles : [roles];
  }

}
