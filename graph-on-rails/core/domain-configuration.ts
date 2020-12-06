import _ from 'lodash';

import { CRUD } from '../entities/entity-resolver';
import { ValidationViolation } from '../entities/entity-validation';
import { Runtime } from './runtime';

export type DomainConfiguration = {
  entity?:{[name:string]:EntityConfig},
  enum?:{[name:string]:EnumConfig},
  query?:{[name:string]:QueryConfigFn},
  mutation?:{[name:string]:MutationConfigFn},
}

export type EntityConfig  = {
  typeName?:string;

  attributes?:{[name:string]:string|AttributeConfig};
  assocTo?:string|(string|AssocToType)[];
  assocToMany?:string|(string|AssocToManyType)[];
  assocFrom?:string|string[]|AssocFromType[];

  plural?:string
  singular?:string;

  collection?:string;
  path?:string;

  seeds?:{[seedId:string]:SeedType}|SeedType[]
  permissions?:PermissionDelegate|EntityPermissionsType

  union?:string[]
  interface?:boolean
  implements?:string|string[]

  description?:string
  extendEntity?:( runtime:Runtime ) => void | Promise<void>
  validation?:( item:any, runtime:Runtime ) => ValidationReturnType
  hooks?:EntityHooksType

  foreignKey?:string
  foreignKeys?:string
  createInputTypeName?:string
  updateInputTypeName?:string
  filterTypeName?:string
  sorterEnumName?:string
  typeField?:string
  typesEnumName?:string
  deleteMutationName?:string
  createMutationName?:string
  updateMutationName?:string
  mutationResultName?:string
  typesQueryName?:string
  typeQueryName?:string
  statsQueryName?:string

  typeQuery?:false|EntityResolverFn
  typesQuery?:false|EntityResolverFn
  createMutation?:false|EntityResolverFn
  updateMutation?:false|EntityResolverFn
  deleteMutation?:false|EntityResolverFn
  statsQuery?:false|EntityResolverFn
}

export type EntityResolverFn = ( resolverCtx:ResolverContext, runtime:Runtime ) => any|any[]|Promise<any|any[]>

export type ResolverContext = {
  root:any
  args:any
  context:any
}

export type EntityHooksType = {
  preSave?: PreResolverHook
  afterSave?: AfterResolverHook
  preTypeQuery?: PreResolverHook
  afterTypeQuery?: AfterResolverHook
  preTypesQuery?: PreResolverHook
  afterTypesQuery?: AfterResolverHook
  preDelete?: PreResolverHook
  afterDelete?: AfterResolverHook
}

export type PreResolverHook = (rhc:ResolverHookContext) => undefined|object|Promise<undefined|object>;
export type AfterResolverHook = (resolved: any, rhc:ResolverHookContext) => object|object[]|Promise<object|object[]>;

export type ResolverHookContext = {
  resolverCtx:ResolverContext
  runtime:Runtime
  principal:PrincipalType
}

type QueryMutationArgConfig = { type: string|object }
export type QueryMutationConfig = {
  type: any
  args?:{[name:string]:string | QueryMutationArgConfig }
  resolve?: (root:any, args:any, context:any ) => any
}

export type MutationConfigFn = (runtime:Runtime) => QueryMutationConfig
export type QueryConfigFn = (runtime:Runtime) => QueryMutationConfig

/**
 *
 */
export type AttributeConfig = {
  type?:string;
  required?:boolean|'create'|'update'
  unique?:boolean|string
  description?:string
  list?:boolean
  defaultValue?:any|(( attributes:any, runtime:Runtime)=>any|Promise<any>)
  filterType?:string|false
  validation?:object
  mediaType?:'image'|'video'|'audio'
  virtual?:boolean
  resolve?:(arc:AttributeResolveContext) => any
}

export type AttributeResolveContext = {
  item:any
  resolverCtx:ResolverContext
  runtime:Runtime
  principal:PrincipalType
}

export type SeedEvalContextType = {
  idsMap?:any
  seed:any
  runtime:Runtime
}

export type SeedAttributeType =
  any|
  {eval: string, share?: number} |
  {sample: string, size?: number}|
  (( evalContext:SeedEvalContextType) => any)

export type SeedType = {
  [attribute:string]:SeedAttributeType
}


export type EntityPermissionsType = {
  [role:string]:boolean|PermissionExpressionFn|AssignedEntity|ActionPermissionType
}
export type PermissionDelegate = string
export type AssignedEntity = string
export type PermissionExpressionFn = ( peCtx:PermissionExpressionContext) => Permission|Promise<Permission>
export type PermissionExpressionContext = {
  action:CRUD
  principal:PrincipalType
  role:string
  resolverCtx:ResolverContext,
  runtime:Runtime
}
export type Permission = undefined|boolean|PermissionExpression
export type PermissionExpression = object
export type ActionPermissionType = {
  create?: boolean|AssignedEntity
  read?: boolean|AssignedEntity
  update?: boolean|AssignedEntity
  delete?: boolean|AssignedEntity
}

export type PrincipalType = any | {
  roles?:PrincipalRolesType|PrincipalRolesTypeFn
}

export type PrincipalRolesType = undefined|boolean|string|string[]
export type PrincipalRolesTypeFn = ( runtime:Runtime, resolverContext:ResolverContext ) => PrincipalRolesType

export type ValidationReturnType =
  ValidationViolation|ValidationViolation[]|string|undefined|
  Promise<ValidationViolation|ValidationViolation[]|string|undefined>

export type EnumConfig = _.Dictionary<any>|(string[])

export type AssocType = {
  type:string
}

export type AssocFromType = AssocType & {
  delete?:'prevent'|'nullify'|'cascade'
}

export type AssocToType = AssocType & {
  required?:boolean
  delete?:'silent'|'cascade'
  input?:boolean
}

export type AssocToManyType = AssocToType & {
  scope?:string
}


