import { PubSub } from 'apollo-server-express';
import { GraphQLSchema } from 'graphql';
import _ from 'lodash';

import { FilterType } from '../builder/filter-type';
import { SchemaBuilder } from '../builder/schema-builder';
import { Entity } from '../entities/entity';
import { EntityFileSave } from '../entities/entity-file-save';
import { DefaultEntityPermissions, EntityPermissions } from '../entities/entity-permissions';
import { EntityResolver } from '../entities/entity-resolver';
import { EntitySeeder } from '../entities/entity-seeder';
import { NedbDataStore } from '../nedb-datastore/nedb.data-store';
import { ValidateJs } from '../validation/validate-js';
import { Validator } from '../validation/validator';
import { DataStore } from './data-store';
import { DomainConfiguration, PrincipalType, ResolverContext } from './domain-configuration';
import { DomainDefinition } from './domain-definition';
import { GraphQLTypeDefinition, GraphX } from './graphx';
import { SchemaFactory } from './schema-factory';
import { Seeder } from './seeder';

export type RuntimeConfig = {
  name?:string
  pubsub?:PubSub
  dataStore?:(name?:string) => Promise<DataStore>
  validator?:(entity:Entity) => Validator
  entityResolver?:(entity:Entity) => EntityResolver
  entityPermissions?:(entity:Entity) => EntityPermissions
  entityFileSave?:(entity:Entity) => EntityFileSave
  entitySeeder?:(entity:Entity) => EntitySeeder
  schemaBuilder?:SchemaBuilder[]
  domainDefinition:DomainDefinition|DomainConfiguration|string|string[]
  uploadRootDir?:string
  stage?:'development'|'production'
}

export class Runtime {

  dataStore!:DataStore;
  schema!:GraphQLSchema;

  readonly graphx = new GraphX();
  readonly entities:{[name:string]:Entity} = {};
  readonly enums:string[] = [];
  readonly filterTypes:{[name:string]:FilterType} = {};

  get pubsub():PubSub { if( this.config.pubsub ) return this.config.pubsub; throw 'no pubsub in runtime!' }

  private constructor( public readonly config:RuntimeConfig ){ }

  /**
   *
   */
  static async create( config:RuntimeConfig|DomainDefinition|DomainConfiguration|string ):Promise<Runtime> {
    const runtime = new Runtime( this.resolveConfig( config ) );
    await runtime.init();
    await runtime.createSchema();
    return runtime;
  }

  private static getDefaultConfig():RuntimeConfig {
    return {
      name: 'ActiveQL',
      pubsub: new PubSub(),
      dataStore: ( name?:string ) => NedbDataStore.create({ filePath: 'db' }),
      validator: ( entity:Entity ) => new ValidateJs( entity ),
      entityResolver: ( entity:Entity ) => new EntityResolver( entity ),
      entityPermissions: ( entity:Entity ) => new DefaultEntityPermissions( entity ),
      entityFileSave: ( entity:Entity ) => new EntityFileSave( entity ),
      entitySeeder: ( entity:Entity ) => new EntitySeeder( entity ),
      uploadRootDir: 'uploads',
      stage: 'development',
      domainDefinition: {}
    };
  }

  private static resolveConfig(config:RuntimeConfig|DomainDefinition|DomainConfiguration|string):RuntimeConfig {
    if( _.isString( config ) ) config = { domainDefinition: config };
    if( config instanceof DomainDefinition ) config = { domainDefinition: config as DomainDefinition };
    if( ! _.has( config, 'domainDefinition') ) config = { domainDefinition: config as DomainConfiguration };
    return _.defaults( config, this.getDefaultConfig() );
  }

  private async createSchema(){
    const schemaFactory = SchemaFactory.create( this );
    this.schema = await schemaFactory.schema();
  }

  private async init(){
    if( ! _.isFunction(this.config.dataStore) ) throw new Error('Runtime - you must provide a dataStore factory method' );
    this.dataStore = await this.config.dataStore( this.config.name );
  }

  get domainDefinition():DomainDefinition {
    if( ! (this.config.domainDefinition instanceof DomainDefinition) ) this.config.domainDefinition =
      new DomainDefinition( this.config.domainDefinition );
    return this.config.domainDefinition;
  }


  validator( entity:Entity ) {
    if( ! this.config.validator ) throw new Error('Runtime - you must provide a validator factory method' );
    return this.config.validator(entity);
  }

  entityResolver( entity:Entity ) {
    if( ! this.config.entityResolver ) throw new Error('Runtime - you must provide an entityResolver factory method' );
    return this.config.entityResolver(entity);
  }

  entityPermissions( entity:Entity ) {
    if( ! this.config.entityPermissions ) throw new Error('Runtime - you must provide an entityPermissions factory method' );
    return this.config.entityPermissions(entity);
  }

  entityFileSave( entity:Entity ) {
    if( ! this.config.entityFileSave ) throw new Error('Runtime - you must provide an entityFileSave factory method' );
    return this.config.entityFileSave(entity);
  }


  entitySeeder( entity:Entity ) {
    if( ! this.config.entitySeeder ) throw new Error('Runtime - you must provide an entitySeeder factory method' );
    return this.config.entitySeeder(entity);
  }

  type( name:string, definition?:GraphQLTypeDefinition ):any { return this.graphx.type( name, definition ) }

  entity( name:string ) {
    if( this.entities[name] ) return this.entities[name];
    throw new Error(`no such entity '${name}'`);
  }

  seed( truncate = true ) {
    return Seeder.create( this ).seed( truncate );
  }

  configuration(){
    return (this.config.domainDefinition as DomainDefinition).getConfiguration();
  }

  getPrincipal( resolverCtx:ResolverContext ):PrincipalType|undefined {
    const principal:PrincipalType = _.get(resolverCtx, 'context.principal');
    return _.isFunction( principal ) ? principal( this, resolverCtx ) : principal;
  }

  principalHasRole( role:string, resolverCtx:ResolverContext ):boolean {
    const principal = this.getPrincipal( resolverCtx );
    if( ! principal ) return false;
    let roles = principal.roles;
    if( _.isFunction( roles ) ) roles = roles( this, resolverCtx );
    if( _.isBoolean( roles ) ) return roles;
    if( ! _.isArray( roles ) ) roles = [roles];
    return _.includes( roles, role );
  }

  warn<T>( message:string, returnValue:T ):T{
    console.warn( message );
    return returnValue;
  }

}
