import inflection from 'inflection';
import { jsonToGraphQLQuery } from 'json-to-graphql-query';
import _ from 'lodash';
import { AssocToType, AssocToManyType, AttributeType, DomainConfigurationType, EntityType } from './domain-configuration';

const nameCandidates = ['name', 'Name', 'NAME'];
const keyCandidates = ['key', 'Key', 'KEY', 'id', 'Id', 'ID'];
const firstParts = ['first', 'First', 'FIRST'];
const lastParts = ['last', 'Last', 'LAST'];
const combineParts = ['', '-', '_'];
const firstNameCandidates = _.flattenDeep(
  _.map( firstParts, firstCandidate => _.map( combineParts, combineCandidate => _.map(nameCandidates, nameCandidate =>
    firstCandidate + combineCandidate + nameCandidate )) ) );
const lastNameCandidates = _.flattenDeep(
  _.map( lastParts, lastCandidate => _.map( combineParts, combineCandidate => _.map(nameCandidates, nameCandidate =>
    lastCandidate + combineCandidate + nameCandidate )) ) );
const guessCandidates = _.concat(nameCandidates, keyCandidates, firstNameCandidates, lastNameCandidates );

export type Action = 'index'|'show'|'create'|'edit'

export type AdminConfig = {
  adminLinkPrefix?:string
  menu?:string[]
  entities?:{[name:string]:EntityViewConfig}
}

export type EntityViewConfig = {

  path?:string
  asParent?:AsParentType
  index?: UiConfig
  show?: UiConfig
  create?: UiConfig
  edit?: UiConfig
}

export type AsParentType = {
  query?: () => string
  render?: (item:any) => string
}

export type UiConfig = {
  fields?: FieldListConfig
  query?: QueryFn
}

export type FieldListConfig = (string|FieldConfig)[]

export type FieldConfig = {
  name: string
  type?:string
  render?: ( item:any, parent?:ParentType ) => string
  label?: string | (() => string)
  disabled?:boolean
  required?:boolean
  link?:string|string[]|((item:any, parent:ParentType) => string|string[])
  list?:boolean
}

export type EntiyViewType = {
  entity:EntityType
  path:string
  asParent?:AsParentType
  index: {
    fields: FieldList
    query: QueryFn
  }
  show: {
    fields: FieldList
    query: QueryFn
    assocFrom?: {
      [entity:string]:any
    }
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

export type QueryFn = (args:QueryFnArgs) => string
export type QueryFnArgs = {
  parent?:ParentType
  filter?:any
  sort?:any
  paging?:any
}

export type FieldList = FieldConfig[]

export type ParentType = {
  entity: string
  id: string
}

const foo:AdminConfig = {
  entities: {
    Car: {
      path: 'autos',
      asParent: {
        query: () => `query{ foo }`,
        render: (item:any) => _.get( item, 'some')
      },
      index: {
        fields: ['id','licence','color'],
      },
      show: {
        fields: ['id', 'foo', 'bar']

      }
    },
    Organisation: {
      index: {
        fields: ['id', 'name', 'some'],
        query: () => `query{ organisations( filter:{} ) }`
      }
  },
  }
}


export class AdminConfigService { 

  adminConfig:AdminConfig = {};
  entityViewTypes:{[name:string]:EntiyViewType} = {};

  domainConfiguration:DomainConfigurationType = { entity: {}, enum: {} }

  get adminLinkPrefix() { return this.adminConfig.adminLinkPrefix || '/admin' }

  /** @deprecated */
  getEntityConfig( path:string ){
    console.log( jsonToGraphQLQuery({query: { foo: { bar: true, baz: true }}}) );
    return _.get( this.domainConfiguration, ['entity', path] );
  }

  getEntityView( path:string ):EntiyViewType {
    if(_.isEmpty( this.entityViewTypes ) ) this.resolveViewTypes();
    return _.get( this.entityViewTypes, path );
  }

  private resolveViewTypes(){
    this.entityViewTypes = {};
    _.forEach( this.domainConfiguration.entity, (entity, name) => {
      _.set( entity, 'name', name );
      const path = this.getPathForEntity( name );
      _.set( this.entityViewTypes, path, this.resolveEntityConfig( path, entity ) );
    })
  }

  private resolveEntityConfig( path:string, entity:EntityType ):EntiyViewType {
    return { path, entity,
      index: this.resolveEntityConfigIndex( path, entity ),
      show: this.resolveEntityConfigShow( entity ),
      create: this.resolveEntityConfigCreate( entity ),
      edit: this.resolveEntityConfigEdit( entity )
    }
  }

  private resolveEntityConfigIndex( path:string, entity:EntityType ){
    return {
      fields: this.getFieldList( 'index', entity ),
      query: ({parent}) => {
        if( entity.typesQuery === false ) return;
        const query = { query: {} };
        if( parent ) this.setParentQuery( parent, query );
        const fields = this.queryFieldsForAction(path, 'index', entity);
        _.set( query.query, entity.typesQueryName, fields );
        return jsonToGraphQLQuery( query );
      }
    };
  }

  private resolveEntityConfigShow( entity:EntityType ){
    return {
      fields: this.getFieldList( 'show', entity ),
      query: this.getTypeQuery( entity )
    };
  }

  private resolveEntityConfigCreate( entity:EntityType ){
    return {
      fields: this.getFieldList( 'create', entity ),
      query: this.getTypeQuery( entity )
    };
  }

  private resolveEntityConfigEdit( entity:EntityType ){
    return {
      fields: this.getFieldList( 'edit', entity ),
      query: this.getTypeQuery( entity )
    };
  }

  private queryFieldsForAction( path:string, action:string, entity:EntityType ){
    const entityView = this.getEntityView( path )
    const viewFields = _.map( entityView[action].fields, field => field.name );
    const attributeFields = this.getAttributesForQuery( entity );
    const fields = _.concat( _.intersection( viewFields, attributeFields ), 'id' );
    // add assocTo / assocToMany here
    return _.reduce( fields, (result, field)=> _.set( result, field, true ), {} );
  }

  private getTypeQuery( entity:EntityType ){
    return ({parent}) => {
      if( entity.typeQuery === false ) return;
      const query = { query: {} };
      if( parent ) this.setParentQuery( parent, query );
      _.set( query, entity.typeQueryName, this.getAttributesForQuery( entity ) );
      return jsonToGraphQLQuery( query );
    }
  }

  private setParentQuery( parent:ParentType, query:any ):void {
    const path = this.getPathForEntity( parent.entity );
    const config = this.getEntityView( path );
    const asParent = config.asParent;
    const entity = _.get( this.domainConfiguration, ['entity', parent.entity]);
    if( ! asParent || ! entity || entity.typeQuery === false ) return;
    const candidates = _.intersection( this.getAttributesForQuery(entity), guessCandidates );
    const fields = _.concat( 'id', candidates );
    _.set( query, entity.typeQueryName, _.reduce( fields, (result, field) => _.set( result, field, true ), {} ) );
  }

  private getAttributesForQuery( entity:EntityType ):string[] {
    const fields = ['id'];
    _.forEach( entity.attributes, (attribute, name) => {
      if( attribute.objectTypeField ) fields.push( name )
    });
    return fields;
  }

  private getFieldList( action:Action, entity:EntityType ):FieldList {
    const config = _.get(this.adminConfig, ['entities', entity.name, action, 'fields' ] ) || this.getDefaultFieldList( entity );
    return _.compact( _.map( config, fieldConfig =>
      this.resolveField( action, entity, _.isString(fieldConfig) ? { name:fieldConfig } : fieldConfig ) ) );
  }

  private getDefaultFieldList( entity:EntityType ):FieldListConfig {
    const attributes = _.keys( _.get( entity, 'attributes' ) );
    const assocTo = _.map( _.get( entity, 'assocTo' ), assocTo => assocTo.type );
    const assocToMany = _.map( _.get( entity, 'assocToMany' ), assocToMany => assocToMany.type );
    return _.uniq( _.concat( attributes, assocTo, assocToMany ) );
  }

  private resolveField( action:Action, entity:EntityType, config:FieldConfig ):FieldConfig {
    const attribute:AttributeType = _.get( entity, ['attributes', config.name] );
    if( attribute ) return this.resolveAttributeField( action, attribute, config );

    const assocTo:AssocToType = _.find( _.get( entity, 'assocTo' ), assocTo => assocTo.type === config.name );
    if( assocTo ) return this.resolveAssocToField( action, assocTo, config );

    const assocToMany:AssocToType = _.find( _.get( entity, 'assocToMany' ), assocToMany => assocToMany.type === config.name );
    if( assocTo ) return this.resolveAssocToManyField( action, assocToMany, config );

    return config;
  }

  private resolveAttributeField( action:Action, attribute:AttributeType, config:FieldConfig ):FieldConfig {
    if( action === 'create' && attribute.createInput === false ) return undefined;
    config.type = attribute.type;
    config.list = attribute.list;
    config.label = config.label || inflection.humanize( config.name )
    config.required = config.required || attribute.required
    config.disabled = config.disabled || ( action === 'edit' && attribute.updateInput === false )
    config.render = config.render || this.defaultRender( config.name, config );
    return config;
  }

  private resolveAssocToField( action:Action, assocTo:AssocToType, config:FieldConfig ):FieldConfig {
    const assocEntity:EntityType = _.get( this.domainConfiguration, ['entities', assocTo.type]);
    if( ! assocEntity ) return undefined;
    config.type = 'assocTo';
    config.list = false;
    config.label = config.label || inflection.humanize( config.name );
    config.required = config.required || assocTo.required;
    config.link = this.defaultAssocLinkFn( assocEntity );
    config.render = config.render || (( item:any, parent:ParentType ) => {
      const value = this.guessName(_.get( item, assocEntity.foreignKey ));
      const link = _.isFunction( config.link ) ? config.link( item, parent ) : config.link;
      return this.decorateLink( value, link )
    });
    return config;
  }

  private resolveAssocToManyField( action:Action, assocToMany:AssocToManyType, config:FieldConfig ):FieldConfig {
    const assocEntity:EntityType = _.get( this.domainConfiguration, ['entities', assocToMany.type]);
    if( ! assocEntity ) return undefined;
    config.type = 'assocToMany';
    config.list = true;
    config.label = config.label || inflection.humanize( config.name );
    config.required = config.required || assocToMany.required;
    config.link = this.defaultAssocLinkFn( assocEntity );
    config.render = config.render || (( item:any, parent:ParentType ) => {
      let values = _.get( item, assocEntity.foreignKeys );
      if( ! _.isArray( values ) ) values = [values];
      const link = _.isFunction( config.link ) ? config.link( item, parent ) : config.link;
      values = _.map( values, value => this.decorateLink( this.guessName( value ), link ) );
      return _.join( values, ', ' );
    });
    return config;
  }

  private defaultAssocLinkFn( entity:EntityType ){
    return (item:any, parent:ParentType) => {
      const link = [this.getPathForEntity( entity.name ), item.id ];
      if( parent ) link.unshift( this.getPathForEntity( parent.entity ), parent.id );
      link.unshift( this.adminLinkPrefix );
      return link;
    };
  }

  private defaultRender( name:string, config:FieldConfig ){
    return ( item:any, parent:ParentType ) => {
      const link = _.isFunction( config.link ) ? config.link( item, parent ) : config.link;
      let values = _.get( item, name );
      if( ! _.isArray( values ) ) values = [values];
      if( link ) values = _.map( values, value => this.decorateLink( value, link ) );
      return values.join(', ');
    };
  }

  private decorateLink( value:string, link?:string|string[]){
    if( ! link ) return value;
    return _.isArray( link ) ? `<a routerLink="${link}">${value}</a>` : `<a href="${link}">${value}</a>`;
  }

  private getPathForEntity( entity:string ):string {
    return _.get( this.adminConfig, ['entities', entity, 'path'],
      _.toLower(inflection.dasherize( inflection.pluralize(entity) ) ) );
  }

  private guessName( value:any ):string {
    if( ! value ) return '[no value]';
    const firstname = _.find( firstNameCandidates, candidate => _.has( value, candidate ));
    const lastname = _.find( lastNameCandidates, candidate => _.has( value, candidate ));
    if( firstname && lastname ) return `${value[firstname]} ${value[lastname]}`;
    if( firstname ) return value[firstname];
    if( lastname ) return value[lastname];
    const name = _.find( _.concat( nameCandidates, keyCandidates), candidate => _.has( value, candidate ));
    return name ? value[name] : _.toString( value );
  }
}



// export type AdminConfigType = {
//   entities?:{ [entity:string]:EntityConfigType}
//   menu?:string[]
//   showLink?:(path:string, id:string) => string[]
//   uploadsRootPath?:string
// }

// export type EntityConfigType = {
//   path?:string
//   title?:string|((purpose?:TitlePurposeType)=>string)
//   action?:(event:ActionEventType) => void
//   fields?:{[name:string]:FieldConfigType}
//   assocs?:{[name:string]:AssocType}
//   entitesName?:string
//   entityName?:string
//   typesQueryName?:string
//   typeQueryName?:string
//   deleteMutationName?:string
//   updateMutationName?:string
//   updateInputTypeName?:string
//   createMutationName?:string
//   createInputTypeName?:string,
//   foreignKey?:string
//   foreignKeys?:string
//   name?:( item:any ) => string
//   index?:UiConfigType
//   show?:UiConfigType
//   form?:UiConfigType
// }

// export type AdminTableConfig = {
//   title?:string|(()=>string)
//   fields?:(string|FieldConfigType)[]
//   actions?:{[name:string]:AdminTableActionConfig}
//   defaultActions?:('show'|'edit'|'delete')[]
//   search?:boolean
// }

// export type UiConfigType = AdminTableConfig & {
//   query?:string
//   assoc?:AssocConfigType[]
//   data?:AssocConfigType[]
//   table?:AssocTableConfigType[]
// }

// export type AdminTableActionConfig = {
//   icon?:string
//   text?:string
//   onAction:(item:any) => void
// }

// export type FieldFilterConfigType = {
//   value?:(item:any) => any | any[]
//   multiple?:boolean
// }

// export type FieldConfigType = {
//   name?:string
//   path?:string
//   label?:string|(() => string)
//   value?:(item:any) => any
//   render?:(item:any) => string
//   keyValue?:(item:any) => string|string[]
//   filter?:boolean|FieldFilterConfigType
//   link?:boolean|string|string[]|((item:any) => any[])
//   search?:(data:any, searchTerm:string) => boolean
//   sortable?:boolean
//   parent?:string
//   control?:string
//   values?:(data:any) => {value:any, label:string}[]
//   required?:boolean
//   type?:string
//   unique?:boolean
//   mediaType?:'image'|'video'|'audio'
//   virtual?:boolean
//   createInput?:boolean
//   updateInput?:boolean
//   objectTypeField?:boolean
// }

// export type AssocTableConfigType = AdminTableConfig & {
//   path:string
// }

// export type AssocConfigType = string| {
//   path?:string
//   fields?:string[]
//   assoc?:AssocConfigType[]
// }

// export type AssocType = {
//   path:string
//   query:string
//   required?:boolean
//   type:'assocTo'|'assocToMany'|'assocFrom'
//   foreignKey:string
//   typesQuery:string // for lookups
//   scope:string
// }

// export type ActionEventType = {id:any, action:string};

// export type TitlePurposeType = 'menu'|'index'|'show'|'form'|'detailTable'

// export type SaveReturnType = {
//   id?:string
//   violations:ViolationType[]
// }

// export type ViolationType = {
//   attribute:string
//   message:string
// }


// // @dynamic
// export class AdminConfig {

//   private static adminConfig:AdminConfig;
//   private config:AdminConfigType;

//   private constructor(){}

//   static getInstance() {
//     if( _.isUndefined( this.adminConfig ) ) this.adminConfig = new AdminConfig();
//     return this.adminConfig;
//   }

//   static guessNameValue = (item:any) => {
//     const candidate = _.find( nameProperties, candidate => _.has( item, candidate ) );
//     if( candidate ) return _.get( item, candidate );
//     if( _.has( item, 'id' ) ) return `ID ${_.get(item, 'id' ) }`;
//     return _.toString( item );
//   }

//   static defaultShowLink = ( path:string, id:string ) => {
//     return ['/admin', path, 'show', id ];
//   }

//   async getConfig( metaData:any, adminConfig:() => Promise<AdminConfigType> ){
//     const defaultConfig = this.buildDefaultConfig( metaData );
//     this.config = await adminConfig();
//     this.config = _.defaultsDeep( this.config, defaultConfig );
//     this.setUiConfigDefaults();
//     this.setAssocTableDefaults();
//     return this.config;
//   }

//   private buildDefaultConfig( metaData:any[] ):AdminConfigType {
//     const config:AdminConfigType = _.set( {}, 'entities', _.reduce( metaData, (entities, data) => {
//       return _.set( entities, data.path, this.buildEntityConfig( data ));
//     }, {} ));
//     _.set( config, 'showLink', AdminConfig.defaultShowLink );
//     _.set( config, 'menu', _.sortBy( _.keys( config.entities ) ) );
//     _.set( config, 'uploadsRootPath', 'http://localhost:3000/uploads' );
//     return config;
//   }

//   private buildEntityConfig( data:any ):EntityConfigType {
//     const fields = _.reduce( data.fields, (fields,data) =>
//       _.set(fields, data.name, this.buildField(data)), {} );
//     const assocs = _.reduce( data.assocTo, (assocs, assocTo) =>
//       _.set( assocs, assocTo.path, _.merge( assocTo, { type: 'assocTo' } ) ), {} );
//     _.reduce( data.assocToMany, (assocs, assocToMany) =>
//       _.set( assocs, assocToMany.path, _.merge( assocToMany, { type: 'assocToMany' } ) ), assocs );
//     _.reduce( data.assocFrom, (assocs, assocFrom) =>
//       _.set( assocs, assocFrom.path, _.merge( assocFrom, { type: 'assocFrom' } ) ), assocs );
//     const config = _.pick( data,[
//       'path',
//       'typeQueryName',
//       'typesQueryName',
//       'deleteMutationName',
//       'updateInputTypeName',
//       'updateMutationName',
//       'createInputTypeName',
//       'createMutationName',
//       'foreignKey',
//       'foreignKeys'
//     ]);
//     return _.merge( config, { fields, assocs } );
//   };

//   private buildField( data:any ):FieldConfigType {
//     return _.pick( data,
//       ['name', 'type', 'required', 'unique', 'scope', 'mediaType', 'createInput', 'updateInput', 'objectTypeField' ]);
//   }

//   private setUiConfigDefaults():void {
//     _.forEach( this.config.entities, entityConfig => {
//       if( _.isUndefined( entityConfig.name) ) entityConfig.name = AdminConfig.guessNameValue;
//       _.forEach( ['index','show','form'], uiType => this.setDefaults( entityConfig, uiType ) );
//       if( _.isUndefined( entityConfig.form.data ) ) entityConfig.form.data =
//         _.compact( _.map( entityConfig.form.fields, (field:FieldConfigType) => field.path ) );

//     });
//   }

//   private setDefaults( entityConfig:EntityConfigType, uiType:string ):EntityConfigType {
//     if( ! _.has(entityConfig, uiType ) ) _.set( entityConfig, uiType, {} );
//     const uiConfig:UiConfigType = _.get( entityConfig, uiType );
//     if( ! _.has( uiConfig, 'query' ) ) _.set( uiConfig, 'query',
//       uiType === 'index' ? entityConfig.typesQueryName : entityConfig.typeQueryName );
//     this.setFieldsDefaults( uiConfig, entityConfig );
//     return entityConfig;
//   }

//   private setFieldsDefaults( uiConfig:UiConfigType|AssocTableConfigType, entityConfig:EntityConfigType ):void {
//     if( ! _.has( uiConfig, 'fields') ) _.set( uiConfig, 'fields',
//       _.concat(
//         _.keys( entityConfig.fields ),
//         _.map(
//           _.filter( entityConfig.assocs, assoc => _.includes( ['assocTo', 'assocToMany'], assoc.type ) ),
//           assoc => assoc.path )
//       ));
//     uiConfig.fields = _.compact( _.map( uiConfig.fields, field => this.setFieldDefault( field, entityConfig ) ) );
//   }

//   private setAssocTableDefaults():void {
//     _.forEach( this.config.entities, entityConfig => {
//       _.forEach( ['index','show','form'], uiType => {
//         const uiConfig:UiConfigType = entityConfig[uiType];
//         // if( uiType === 'show' && _.isUndefined( uiConfig.table ) ) uiConfig.table = _.filter( entityConfig.assocs, assoc => assoc.type === 'assocFrom' );
//         // must add assocs too
//         _.forEach( uiConfig.table, table => {
//           const tableEntityConfig = this.config.entities[table.path];
//           if( ! tableEntityConfig ) return console.warn(`no such tableEntityConfig '${table.path}'`);
//           this.setFieldsDefaults( table, tableEntityConfig );
//          });
//       } );
//     });
//   }

//   private setFieldDefault( field:string|FieldConfigType, entityConfig:EntityConfigType ):FieldConfigType | undefined {
//     const fieldName = _.isString( field ) ? field : _.get( field, 'name' );
//     const fieldConfig = _.get( entityConfig.fields, fieldName );
//     if( fieldConfig ) return this.fieldFromEntityField( field, fieldConfig );
//     const pathName = _.isString( field ) ? field : _.get( field, 'path' );
//     const assoc = _.get( entityConfig.assocs, pathName );
//     if( assoc ) return this.fieldFromAssoc( field, assoc, entityConfig );
//     return this.warn( `neither field nor assoc : '${field}'`, undefined );
//   }

//   private fieldFromEntityField( field:string|FieldConfigType, fieldConfig:FieldConfigType ):FieldConfigType {
//     if( _.isString( field ) ) field = { name: field };
//     fieldConfig.type = fieldConfig.type ? _.toLower( fieldConfig.type ) : 'string';
//     if( fieldConfig.mediaType ) fieldConfig.render = this.getMediaFieldDefaultRenderMethod( fieldConfig );
//     if( fieldConfig.type === 'file' ) fieldConfig.control = 'File';
//     this.setDefaultFieldForType( fieldConfig );

//     return _.defaults( field, fieldConfig );
//   }

//   private setDefaultFieldForType( fieldConfig:FieldConfigType ):void{
//     switch( fieldConfig.type ){
//       case 'boolean': return this.setDefaultFieldBoolean( fieldConfig );
//     }
//   }

//   private setDefaultFieldBoolean( fieldConfig:FieldConfigType ):void {
//     if( ! fieldConfig.control ) fieldConfig.control = 'select';
//     if( ! fieldConfig.values ) fieldConfig.values = () => _.compact([
//       {value: true, label: 'Yes'},
//       {value: false, label: 'No'},
//       fieldConfig.required ? undefined : {value: null, label: '' }
//     ]);
//     if( ! fieldConfig.render ) fieldConfig.render = item =>
//       _.isUndefined(item[fieldConfig.name]) ? '' : item[fieldConfig.name] ? 'Yes' : 'No';
//   }

//   private getMediaFieldDefaultRenderMethod( fieldConfig:FieldConfigType ){
//     return ( data:any ) => {
//       const filename = _.get( data, [fieldConfig.name, 'filename'] );
//       if( ! filename ) return null;
//       const src = `${this.config.uploadsRootPath}/${data.__typename}/${data.id}/${fieldConfig.name}/${filename}`;
//       switch( fieldConfig.mediaType ){
//         case 'image': return `<img class="defaultImageRender" src="${src}">`
//       }
//     }
//   }

//   private fieldFromAssoc( field:string|FieldConfigType, assoc:AssocType, entityConfig:EntityConfigType ):FieldConfigType {
//     if( _.isString( field ) ) field = { path: field };
//     const assocEntityConfig = this.config.entities[assoc.path];
//     if( ! assocEntityConfig ) return field;
//     const values = this.getFieldValuesDefaultMethod( assoc, assocEntityConfig, entityConfig );
//     const value = (item:any) => {
//       const assocValue = _.get( item, assoc.query );
//       return _.isArray( assocValue ) ?
//         _.join( _.map( assocValue, value => assocEntityConfig.name( value ) ) , ', ' ) :
//         assocEntityConfig.name( assocValue );
//     };
//     const render = this.getFieldRenderDefaultMethod( field, assoc, assocEntityConfig );
//     const keyValue = (item:any) => {
//       const assocValue = _.get( item, assoc.query );
//       return _.isArray( assocValue ) ? _.map( assocValue, value => _.get(value, 'id' ) ) : _.get( assocValue, 'id' );
//     }
//     return _.defaults( field, { values, render, keyValue, value,
//       control: assoc.type === 'assocTo' ? 'select' : assoc.type === 'assocToMany' ? 'multiple' : undefined,
//       label: inflection.humanize( assoc.query ), name: assoc.foreignKey, path: assoc.path, required: assoc.required } );
//   }

//   private getFieldValuesDefaultMethod(assoc:AssocType, assocEntityConfig:EntityConfigType, entityConfig:EntityConfigType ){
//     return (data:any) => _.compact( _.concat(
//       _.map( _.get( data, assoc.typesQuery ), assocItem => {
//       if( ! this.isNoneOrMatchingScoped(assoc, entityConfig, data, assocItem ) ) return;
//       return { value: _.get( assocItem, 'id'), label: assocEntityConfig.name( assocItem ) };
//     }),
//     [assoc.required ? {value: null, label: '' } : undefined ]
//     ));
//   }

//   private isNoneOrMatchingScoped(assoc:AssocType, entityConfig:EntityConfigType, data:any, assocItem:any):boolean {
//     if( ! assoc.scope ) return true;
//     const scopeConfig = this.config.entities[ assoc.scope ];
//     if( ! scopeConfig ) return true;
//     const itemScopedId = _.get( data, [entityConfig.typeQueryName, scopeConfig.typeQueryName, 'id'] );
//     const assocScopedId = _.get( assocItem, [scopeConfig.typeQueryName, 'id'] );
//     return itemScopedId === assocScopedId;
//   }

//   private getFieldRenderDefaultMethod( field:FieldConfigType, assoc:AssocType, assocEntityConfig:EntityConfigType ) {
//     return (item:any) => {
//       const assocValue = _.get( item, assoc.query );
//       return _.isArray( assocValue ) ?
//         _.join(
//           _.map( assocValue, value =>
//             this.decorateLink( field as FieldConfigType, assoc, value, assocEntityConfig.name( value ) ) ), ', ' ) :
//         this.decorateLink( field as FieldConfigType, assoc, assocValue, assocEntityConfig.name( assocValue ) );
//     };
//   }

//   private decorateLink( field:FieldConfigType, assoc:AssocType, assocValue:any, content:string ){
//     if( field.link === false ) return content;
//     if( field.link === true ) field.link = undefined;
//     let link =
//       _.isFunction( field.link ) ? field.link( assocValue ) :
//       _.isString( field.link ) ? field.link :
//       _.isArray( field.link ) ? field.link :
//       this.config.showLink( assoc.path, _.get(assocValue, 'id') );

//     if( ! link ) return content;
//     if( _.isArray( link ) ) link = _.join( link, '/' );
//     return `<a class="router-link" href="${ link }">${ content }</a>`;
//   }


//   private warn<T>( message:string, type:T ):T {
//     console.warn(message);
//     return type;
//   }

// }
