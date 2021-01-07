import { EntityType } from "./domain-configuration.types"

export type Action = 'index'|'show'|'create'|'edit'

export type AdminConfig = {
  adminLinkPrefix?:string
  menu?:string[]
  entities?:{[name:string]:EntityViewConfig}
}

export type EntityViewConfig = {
  listTitle?: string | (() => string)
  itemTitle?: string | (() => string)
  itemName?: (item:any) => string
  path?:string
  asParent?:AsReferenceType
  asLookup?:AsReferenceType
  index?: UiConfig
  show?: UiShowConfig
  create?: UiConfig
  edit?: UiConfig
}

export type AsReferenceType = {
  query?: QueryFn
  render?: (item:any) => string
}

export type UiConfig = {
  fields?: FieldListConfig
  query?: QueryFn
  search?:boolean
}

export type UiAssocFromConfig = UiConfig & {
  entity:string
}

export type UiShowConfig = UiConfig & {
  assocFrom?: (string|UiAssocFromConfig)[]
}

export type FieldListConfig = (string|FieldConfig)[]

export type FieldConfig = {
  name: string
  type?:string
  render?: ( item:any, parent?:ParentType ) => string
  value?: (item:any ) => any
  sortValue?: (item:any) => string|number
  label?: string | (() => string)
  disabled?:boolean
  required?:boolean
  list?:boolean
  query?:()=> string|any
  control?:string
  options?:(data:any) => FormOptionType[]
}

export type EntityViewType = {
  path:string
  name: string
  entity:EntityType
  listTitle: () => string
  itemTitle: () => string
  itemName: (item:any) => string
  asParent:AsReferenceType
  asLookup:AsReferenceType
  index: {
    fields: FieldList
    query: QueryFn
    search?:boolean
  }
  show: {
    fields: FieldList
    query: QueryFn
    assocFrom?: UiAssocFromConfig[]
  }
  create: {
    fields: FieldList
    query: QueryFn
  }
  edit: {
    fields: FieldList
    query: QueryFn
  }
}

export type QueryFn = (args:QueryFnArgs) => string|object
export type QueryFnArgs = {
  parent?:ParentType
  filter?:any
  sort?:any
  paging?:any
  id?:string
}

export type FieldList = FieldConfig[]

export type ParentType = {
  viewType: EntityViewType
  id: string
}

export type ViolationType = {
  attribute:string
  message:string
}

export type FormOptionType = {
  value:string
  label:string
}

export type SaveResult = {
  id?: null
  violations?: ViolationType[]
}
