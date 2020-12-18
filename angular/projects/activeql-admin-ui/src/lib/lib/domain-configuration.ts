type Runtime = never
type EntityResolverFn = never
type QueryConfigFn = never
type MutationConfigFn = never
type SeedType = never
type PermissionDelegate = never
type EntityPermissionsType = never
type EntityHooksType = never
type AttributeResolveContext = never

export type DomainConfigurationType = {
  entity:{[name:string]:EntityType}
  enum:{[name:string]:EnumType}
  query?:{[name:string]:QueryConfigFn}
  mutation?:{[name:string]:MutationConfigFn}
}

export type EntityType = {
  name:string
  typeName:string
  attributes:{[name:string]:AttributeType}
  assocTo?:AssocToType[]
  assocToMany?:AssocToManyType[]
  assocFrom?:AssocFromType[]

  plural:string
  singular:string;
  collection:string;

  seeds:{[seedId:string]:SeedType}
  permissions?:PermissionDelegate|EntityPermissionsType

  union?:string[]
  interface?:boolean
  implements?:string[]

  description?:string
  validation?:( item:any, runtime:Runtime ) => ValidationReturnType
  hooks?:EntityHooksType

  foreignKey:string
  foreignKeys:string
  createInputTypeName:string
  updateInputTypeName:string
  filterTypeName:string
  sorterEnumName:string
  typeField:string
  typesEnumName:string
  deleteMutationName:string
  createMutationName:string
  updateMutationName:string
  mutationResultName:string
  typesQueryName:string
  typeQueryName:string
  statsQueryName:string

  typeQuery?:false|EntityResolverFn
  typesQuery?:false|EntityResolverFn
  createMutation?:false|EntityResolverFn
  updateMutation?:false|EntityResolverFn
  deleteMutation?:false|EntityResolverFn
  statsQuery?:false|EntityResolverFn
}

export type AttributeType = {
  name:string
  type:string
  filterType:string|false
  unique:string|boolean;
  required:boolean
  list:boolean
  createInput:boolean
  updateInput:boolean
  objectTypeField:boolean
  virtual:boolean
  validation?:any
  description?:string
  defaultValue?:any|(( attributes:any, runtime:Runtime)=>any|Promise<any>)
  queryBy?:boolean|string
  mediaType?:'image'|'video'|'audio'
  resolve?:(arc:AttributeResolveContext) => any
}

export type EnumType = {
  [key:string]:string|number|boolean
}

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

export type AssocToManyType = AssocToType

export type ValidationReturnType =
  ValidationViolation|ValidationViolation[]|string|undefined|
  Promise<ValidationViolation|ValidationViolation[]|string|undefined>

export type ValidationViolation = {
  attribute?:string,
  message:string
}

