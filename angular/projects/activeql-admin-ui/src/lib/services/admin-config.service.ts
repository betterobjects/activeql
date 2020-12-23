import { Injectable } from '@angular/core';
import { EventEmitter } from 'events';
import inflection from 'inflection';
import _ from 'lodash';
import { AssocToType, AssocToManyType, AttributeType, DomainConfigurationType, EntityType } from './domain-configuration';
import { MetaDataService } from './meta-data.service';

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




@Injectable({providedIn: 'root'})
export class AdminConfigService { 

  adminConfig:AdminConfig = {};

  entityViewTypes:{[name:string]:EntityViewType} = {};
  domainConfiguration:DomainConfigurationType = { entity: {}, enum: {} }
  onReady = new EventEmitter();
  get adminLinkPrefix() { return this.adminConfig.adminLinkPrefix || '/admin' }

  constructor( private metaDataService:MetaDataService ){}

  async init( adminConfig:() => Promise<any> ):Promise<any> {
    this.domainConfiguration = await this.metaDataService.getMetaData();
    this.adminConfig = await adminConfig();
    this.resolveViewTypes();
  }

  /** @deprecated */
  getEntityConfig( path:string ){
    return _.get( this.domainConfiguration, ['entity', path] );
  }

  getEntityView( path:string ):EntityViewType {
    if(_.isEmpty( this.entityViewTypes ) ) this.resolveViewTypes();
    return _.get( this.entityViewTypes, path );
  }

  getEntityViewByName( name:string ):EntityViewType {
    if(_.isEmpty( this.entityViewTypes ) ) this.resolveViewTypes();
    return _.find( this.entityViewTypes, entityViewType => entityViewType.name === name );
  }

  private resolveViewTypes(){
    this.entityViewTypes = {};
    _.forEach( this.domainConfiguration.entity, (entity, name) => {
      _.set( entity, 'name', name );
      const path = this.getPathForEntity( entity );
      _.set( this.entityViewTypes, path, this.resolveViewType( path, entity ) );
    })
  }

  private resolveViewType( path:string, entity:EntityType ):EntityViewType {
    return { name: entity.name, path, entity,
      listTitle: this.resolveListTitle( path ),
      itemTitle: this.resolveItemTitle( path ),
      itemName: this.resolveItemName( entity.name ),
      index: this.resolveEntityConfigIndex( path, entity ),
      show: this.resolveEntityConfigShow( path, entity ),
      create: this.resolveEntityConfigCreate( path, entity ),
      edit: this.resolveEntityConfigEdit( path, entity ),
      asParent: this.resolveAsParent( path, entity ),
      asLookup: this.resolveAsLookup( path, entity )
    }
  }

  private resolveListTitle( entity:string ){
    const title = _.get(this.adminConfig, ['entities', entity, 'listTitle' ] );
    if( _.isFunction( title ) ) return title;
    if( _.isString( title ) ) return () => title;
    return () => inflection.humanize( inflection.pluralize( entity ) );
  }

  private resolveItemTitle( entity:string ){
    const title = _.get(this.adminConfig, ['entities', entity, 'itemTitle' ] );
    if( _.isFunction( title ) ) return title;
    if( _.isString( title ) ) return () => title;
    return () => inflection.humanize( inflection.singularize( entity ) );
  }

  private resolveItemName( entity:string ){
    const nameFn = _.get(this.adminConfig, ['entities', entity, 'itemName' ] );
    if( _.isFunction( nameFn ) ) return nameFn;
    return (item:any) => this.guessName( item );
  }

  private resolveEntityConfigIndex( path:string, entity:EntityType ){
    return {
      fields: this.getFieldListForAction( 'index', entity  ),
      query: ({parent}) => {
        if( entity.typesQuery === false ) return;
        const query = { query: {} };
        const fieldList = this.getEntityView( path )['index'].fields;
        const fields = this.fieldListToQueryFields( fieldList );
        _.set( query, ['query', entity.typesQueryName], fields );
        if( parent ) this.setParentQuery( parent, query, entity );
        return query;
      }
    };
  }

  private resolveAsParent( path:string, entity:EntityType ):AsReferenceType{
    return {
      query: ({id}) => {
        if( entity.typeQuery === false ) return;
        const query = { query: {} };
        const fields = this.getGuessQueryFields( entity );
        _.set( fields, '__args', {id} );
        return _.set( query, ['query', entity.typeQueryName], fields );
      },
      render: (item:any) => this.guessName( item )
    };
  }

  private resolveAsLookup( path:string, entity:EntityType ):AsReferenceType{
    return {
      query: () => {
        if( entity.typesQuery === false ) return;
        const query = {};
        const fields = this.getGuessQueryFields( entity );
        return _.set( query, [entity.typesQueryName], fields );
      },
      render: (item:any) => this.guessName( item )
    };
  }

  private resolveEntityConfigShow( path:string, entity:EntityType ){
    return {
      fields: this.getFieldListForAction( 'show', entity ),
      query: this.showQuery( path, entity ),
      assocFrom: this.resolveShowAssocFrom( entity )
    };
  }

  private resolveEntityConfigCreate( path:string, entity:EntityType ){
    return {
      fields: this.getFieldListForAction( 'create', entity ),
      query: this.createQuery( entity )
    };
  }

  private resolveEntityConfigEdit( path:string, entity:EntityType ){
    return {
      fields: this.getFieldListForAction( 'edit', entity ),
      query: this.editQuery( path, entity )
    };
  }

  private getFieldListForAction( action:Action, entity:EntityType ){
    const fields = _.get(this.adminConfig, ['entities', entity.name, action, 'fields' ] );
    return this.resolveFieldList( action, entity, fields );
  }

  private showQuery( path:string, entity:EntityType ){
    return ({id, parent}) => {
      if( entity.typeQuery === false ) return;
      const showConfig = this.getEntityView( path ).show;
      const query = { query: {} };
      if( parent ) this.setParentQuery( parent, query );
      const fieldList = showConfig.fields;
      const fields = this.fieldListToQueryFields( fieldList );
      _.set( fields, '__args', {id} );
      _.set( query, ['query', entity.typeQueryName], fields );
      _.forEach( showConfig.assocFrom, assocFrom => _.merge( query.query[entity.typeQueryName], assocFrom.query ) );
      return query;
    }
  }

  private createQuery( entity:EntityType ){
    return ({parent}) => {
      if( entity.createMutation === false ) return;
      const query = { query: {} };
      if( parent ) this.setParentQuery( parent, query );
      _.forEach( entity.assocTo, assocTo => {
        const config = this.getEntityViewByName( assocTo.type );
        _.merge( query.query, config.asLookup.query({}) );
      });
      _.forEach( entity.assocToMany, assocToMany => {
        const config = this.getEntityViewByName( assocToMany.type );
        _.merge( query.query, config.asLookup.query({}) );
      });
      return query;
    }
  }

  private editQuery( path:string, entity:EntityType ){
    return ({parent, id}) => {
      if( entity.updateMutation === false ) return;
      const editConfig = this.getEntityView( path ).edit;
      const query = { query: {} };
      if( parent ) this.setParentQuery( parent, query );
      const fieldList = editConfig.fields;
      const fields = this.fieldListToQueryFields( fieldList );
      _.set( fields, '__args', {id} );
      _.set( query, ['query', entity.typeQueryName], fields );
      _.forEach( entity.assocTo, assocTo => {
        const config = this.getEntityViewByName( assocTo.type );
        _.merge( query.query, config.asLookup.query({}) );
      });
      _.forEach( entity.assocToMany, assocToMany => {
        const config = this.getEntityViewByName( assocToMany.type );
        _.merge( query.query, config.asLookup.query({}) );
      });
      return query;
    }
  }


  private fieldListToQueryFields( fieldList:FieldList ) {
    return _.reduce( fieldList, (result, field) => _.merge(result, field.query() ), { id: true } );
  }

  private setParentQuery( parent:ParentType, query:any, entity?:EntityType ):void {
    const path = this.getPathForEntity( parent.viewType.entity );
    const config = this.getEntityView( path );
    const asParent = config.asParent;
    if( ! asParent ) return;
    _.merge( query, asParent.query({ id: parent.id } ) );
    if( ! entity ) return query;
    const isAsscoToOne = _.find( entity.assocTo, assocTo => assocTo.type === parent.viewType.entity.name );
    const foreignKey = isAsscoToOne ? parent.viewType.entity.foreignKey : parent.viewType.entity.foreignKeys;
    const filterCond = isAsscoToOne ? 'is' : 'isIn';
    return _.set( query, ['query', entity.typesQueryName, '__args', 'filter', foreignKey, filterCond], parent.id );
  }

  private resolveFieldList( action:Action, entity:EntityType, fieldList?:FieldListConfig ):FieldList {
    if( ! fieldList ) fieldList = this.getDefaultFieldList( entity );
    return _.compact( _.map( fieldList, fieldConfig =>
      this.resolveField( action, entity, _.isString(fieldConfig) ? { name:fieldConfig } : fieldConfig ) ) );
  }

  private getDefaultFieldList( entity:EntityType ):FieldListConfig {
    const attributes = _.keys( _.get( entity, 'attributes' ) );
    const assocTo = _.map( _.get( entity, 'assocTo' ), assocTo => assocTo.type );
    const assocToMany = _.map( _.get( entity, 'assocToMany' ), assocToMany => assocToMany.type );
    return _.uniq( _.concat( attributes, assocTo, assocToMany ) );
  }

  private resolveField( action:Action, entity:EntityType, config:FieldConfig ):FieldConfig {
    if( config.name === 'id' ) return this.resolveIdField( action, config );

    const attribute:AttributeType = _.get( entity, ['attributes', config.name] );
    if( attribute ) return this.resolveAttributeField( action, attribute, config, entity );

    const assocTo:AssocToType = _.find( _.get( entity, 'assocTo' ), assocTo => assocTo.type === config.name );
    if( assocTo ) return this.resolveAssocToField( action, assocTo, config );

    const assocToMany:AssocToType = _.find( _.get( entity, 'assocToMany' ), assocToMany => assocToMany.type === config.name );
    if( assocToMany ) return this.resolveAssocToManyField( action, assocToMany, config );

    return config;
  }

  private resolveIdField( action:Action, config:FieldConfig ):FieldConfig {
    if( action === 'create' || action === 'edit' ) return undefined;
    config.type = 'String';
    config.label = config.label || 'ID'
    config.disabled = true;
    config.render = config.render || ((item:any) => _.get(item, 'id' ) );
    config.value = config.value || ((item:any) => _.get(item, 'id' ) );
    config.query = () => null;
    return config;
  }


  private resolveAttributeField( action:Action, attribute:AttributeType, config:FieldConfig, entity:EntityType ):FieldConfig {
    if( action === 'create' && attribute.createInput === false ) return undefined;
    if( attribute.type === 'File' ) return this.resolveFileField( action, attribute, config, entity );
    config.type = this.isEnum( attribute.type ) ? 'enum' : attribute.type;
    config.list = attribute.list;
    config.label = config.label || inflection.humanize( config.name )
    config.required = config.required || attribute.required;
    config.disabled = config.disabled || ( action === 'edit' && attribute.updateInput === false )
    config.render = config.render || (( item:any, parent:ParentType ) => {
      let value = config.value( item );
      if( config.type === 'enum' ) value = _.get( this.domainConfiguration, ['enum', attribute.type, value], value );
      return _.isArray( value ) ? value.join(', ') : value;
    });
    config.value = config.value || ((item:any) => _.get(item, config.name) );
    config.sortValue = config.sortValue || config.value;
    config.query = config.query || (() => _.set( {}, config.name, attribute.objectTypeField ));
    if( config.type === 'enum' && ! config.options ) config.options = this.defaultEnumOptionsFn( attribute.type );
    this.setAttributeControl( config, attribute );
    return config;
  }

  private resolveFileField( action:Action, attribute:AttributeType, config:FieldConfig, entity:EntityType ):FieldConfig {
    config.type = attribute.mediaType;
    config.label = config.label || inflection.humanize( config.name )
    config.required = config.required || attribute.required;
    config.disabled = config.disabled || ( action === 'edit' && attribute.updateInput === false )
    config.render = config.render || (( item:any ) => {
      const file = _.get( item, config.name );
      if( ! file ) return;
      const src = `http://localhost:3000/files/${entity.path}/${item.id}/${file.secret}/${config.name}/${file.filename}`;
      if( config.type === 'image' ) return `<img class="defaultImageRender" src="${src}">`;
      return `<a href="${src}" target="_blank">${src}</a>`;
    });
    config.value = config.value || ((item:any) => null);
    config.sortValue = config.sortValue || (() => 0) ;
    config.query = config.query || (() => _.set( {}, config.name, { filename: true, secret: true } ));
    config.control = 'File';
    return config;
  }

  private isEnum = ( type:string ) => _(this.domainConfiguration.enum).keys().includes( type )

  private setAttributeControl( field:FieldConfig, attribute:AttributeType ):string|undefined {
    if( field.control ) return;
    if( field.options ) return field.control = attribute.list ? 'multiple' : 'select';
    if( _.includes(['Int', 'Float' ], attribute.type ) ) return field.control = 'number';
  }

  private defaultEnumOptionsFn = (enumName:string) => () => {
    const enumValues = _.get(this.domainConfiguration, ['enum', enumName] );
    const options = [];
    _.forEach( enumValues, (label, value) => options.push( { label, value } ) );
    return options;
  }


  private resolveAssocToField( action:Action, assocTo:AssocToType, config:FieldConfig ):FieldConfig {
    const assocEntity:EntityType = _.get( this.domainConfiguration, ['entity', assocTo.type]);
    if( ! assocEntity ) return undefined;
    config.type = 'assocTo';
    config.list = false;
    config.label = config.label || inflection.humanize( config.name );
    config.required = config.required || assocTo.required;
    config.value = config.value || ((item:any) => _.get( item, [assocEntity.typeQueryName, 'id'] ) );
    config.render = config.render || (( item:any, parent:ParentType ) => {
      const value = _.get( item, assocEntity.typeQueryName );
      const name = this.guessName( value );
      const link = this.itemLink( assocEntity, value );
      return this.decorateLink( name, link )
    });
    config.sortValue = config.sortValue || ((item:any)=>  this.guessName( _.get( item, assocEntity.typeQueryName ) ) );
    config.query = config.query || (() => _.set( {}, assocEntity.typeQueryName, this.getGuessQueryFields( assocEntity ) ) );
    config.control = 'select';
    config.options = config.options || this.defaultAssocOptionsMethod( assocEntity );
    return config;
  }

  private resolveAssocToManyField( action:Action, assocToMany:AssocToManyType, config:FieldConfig ):FieldConfig {
    const assocEntity:EntityType = _.get( this.domainConfiguration, ['entity', assocToMany.type]);
    if( ! assocEntity ) return undefined;
    config.type = 'assocToMany';
    config.list = true;
    config.label = config.label || inflection.humanize( config.name );
    config.required = config.required || assocToMany.required;
    config.render = config.render || (( item:any, parent:ParentType ) => {
      let values = _.get( item, assocEntity.typesQueryName );
      if( ! _.isArray( values ) ) values = [values];
      values = _.map( values, value =>
        this.decorateLink( this.guessName( value ), this.itemLink( assocEntity, value ) ));
      return _.join( values, ', ' );
    });
    config.value = config.value || ((item:any) => {
      let values = _.get( item, assocEntity.typesQueryName );
      if( _.isNil( values) ) return undefined;
      if( ! _.isArray( values ) ) values = [values];
      return _.map( values, value => value.id );
    });
    config.sortValue = config.sortValue || ((item:any) => {
      let values = _.get( item, assocEntity.typesQueryName );
      if( ! _.isArray( values ) ) values = [values];
      values = _.map( values, value => this.guessName( value ) );
      return _.join( values, ', ' );
    });
    config.query = config.query || (() => _.set( {}, assocEntity.typesQueryName, this.getGuessQueryFields( assocEntity ) ) );
    config.options = config.options || this.defaultAssocOptionsMethod( assocEntity );
    config.control = 'multiple';
    return config;
  }

  private defaultAssocOptionsMethod( assocEntity:EntityType ){
    return (data:any) => {
      const assocView = this.getEntityViewByName( assocEntity.name );
      const values = _.get( data, assocEntity.typesQueryName );
      return _.map( values, value => ({ value: value.id, label: assocView.asLookup.render( value ) } ) );
    };
  }

  private resolveShowAssocFrom( entity:EntityType ){
    const assocFromEntity = _.map( entity.assocFrom, assocFrom => assocFrom.type );
    const config = _.get( this.adminConfig, ['entites', entity.name, 'show', 'assocFrom' ], assocFromEntity );

    const result = _.compact( _.map( config, assocFrom => {
      if( _.isString( assocFrom ) ) assocFrom = { entity: assocFrom };
      if( ! _.includes( assocFromEntity, assocFrom.entity ) ) return;
      const assocEntity = _.get( this.domainConfiguration, ['entity', assocFrom.entity ] );
      assocFrom.fields = this.resolveFieldList( 'index', assocEntity, assocFrom.fields );
      assocFrom.query = assocFrom.query || this.defaultAssocFromQuery( assocEntity, assocFrom.fields );
      return assocFrom;
    }));
    return result;
  }

  private defaultAssocFromQuery( entity:EntityType, fieldList:FieldList ){
    if( entity.typesQuery === false ) return;
    const fields = this.fieldListToQueryFields( fieldList );
    return _.set( {}, entity.typesQueryName, fields );
  }

  itemLink( entity:EntityType, itemOrId:any|string, parent?:ParentType ){
    const id = _.isString( itemOrId ) ? itemOrId : _.get( itemOrId, 'id');
    const link = [this.getPathForEntity( entity ), 'show', id ];
    if( parent ) link.unshift( parent.viewType.path, parent.id );
    link.unshift( this.adminLinkPrefix );
    return link;
  }

  itemsLink( entity:EntityType, parent?:ParentType ){
    const link = [this.getPathForEntity( entity ) ];
    if( parent ) link.unshift( parent.viewType.path, parent.id );
    link.unshift( this.adminLinkPrefix );
    return link;
  }


  private decorateLink( value:string, link?:string|string[]){
    if( ! link ) return value;
    if( ! _.isArray( link ) ) link = [link];
    link = _.join( link, '/' );
    return `<a class="router-link" href="${link}">${value}</a>`;
  }

  private getPathForEntity( entity:EntityType ):string {
    return _.get( this.adminConfig, ['entities', entity.name, 'path'], entity.path );
  }

  private guessName( item:any ):string {
    if( ! item ) return '[null]';
    const firstname = _.find( firstNameCandidates, candidate => _.has( item, candidate ));
    const lastname = _.find( lastNameCandidates, candidate => _.has( item, candidate ));
    if( firstname && lastname ) return `${item[firstname]} ${item[lastname]}`;
    if( firstname ) return item[firstname];
    if( lastname ) return item[lastname];
    const name = _.find( _.concat( nameCandidates, keyCandidates), candidate => _.has( item, candidate ));
    if( name ) return item[name];
    return _.get( item, 'id', _.toString( item )) ;
  }

  private getGuessQueryFields( entity:EntityType ){
    return _.reduce( _.intersection( guessCandidates, _.keys(entity.attributes) ), (result, field) =>
      _.set( result, field, true), { id: true } );
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
