import { Injectable } from '@angular/core';
import { EventEmitter } from 'events';
import inflection from 'inflection';
import _ from 'lodash';

import {
  Action,
  AdminConfig,
  EntityViewType,
  FieldConfig,
  FieldList,
  FieldListConfig,
  ParentType,
} from './admin-config.types';
import { DomainConfigurationService } from './domain-configuration.service';
import {
  AssocToManyType,
  AssocToType,
  AttributeType,
  DomainConfigurationType,
  EntityType,
} from './domain-configuration.types';

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

@Injectable({providedIn: 'root'})
export class AdminConfigService { 

  private adminConfig:AdminConfig = {};
  private entityViewTypes:{[name:string]:EntityViewType} = {};
  domainConfiguration:DomainConfigurationType = undefined;
  get adminLinkPrefix() { return this.adminConfig.adminLinkPrefix || '/admin' }
  get locale() { return this.adminConfig.locale || 'de' }
  onReady = new EventEmitter();
  networkError = false;

  constructor( private domainConfigurationService:DomainConfigurationService ){}

  async init( adminConfig:() => Promise<any> ):Promise<any> {
    try{
      this.adminConfig = await adminConfig();
      this.domainConfiguration = await this.domainConfigurationService.getDomainConfiguration();
    } catch( error ){
      console.error( error );
      this.networkError = true;
    }

  }

  /** @deprecated */
  getEntityConfig( path:string ){
    return _.get( this.domainConfiguration, ['entity', path] );
  }

  getEntityView( path:string ):EntityViewType {
    if(_.isEmpty( this.entityViewTypes ) ) this.resolveConfig();
    return _.get( this.entityViewTypes, path );
  }

  getEntityViewByName( name:string ):EntityViewType {
    if(_.isEmpty( this.entityViewTypes ) ) this.resolveConfig();
    return _.find( this.entityViewTypes, entityViewType => entityViewType.name === name );
  }

  getEntities(){
    if(_.isEmpty( this.entityViewTypes ) ) this.resolveConfig();
    return _.values( this.entityViewTypes  );
  }

  private async resolveConfig(){
    this.entityViewTypes = {};
    _.forEach( this.domainConfiguration.entity, (entity, name) => {
      _.set( entity, 'name', name );
      const path = this.getPathForEntity( entity );
      _.set( this.entityViewTypes, path, this.resolveViewType( path, entity ) );
    })
  }

  private resolveViewType( path:string, entity:EntityType ):EntityViewType {
    return { name: entity.name, path, entity,
      indication: this.resolveIndication( entity ),
      listTitle: this.resolveListTitle( path ),
      itemTitle: this.resolveItemTitle( path ),
      itemName: this.resolveItemName( entity ),
      index: this.resolveEntityConfigIndex( path, entity ),
      show: this.resolveEntityConfigShow( path, entity ),
      create: this.resolveEntityConfigCreate( path, entity ),
      edit: this.resolveEntityConfigEdit( path, entity )
    }
  }

  private resolveIndication( entity:EntityType ){
    let indication = _.get(this.adminConfig, ['entities', entity.name, 'indication' ] );
    if( ! indication ) indication = guessCandidates;
    if( ! _.isArray( indication ) ) indication = [indication];
    return _.intersection( indication, _.keys(entity.attributes) );
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

  private resolveItemName( entity:EntityType ){
    const nameFn = _.get(this.adminConfig, ['entities', entity.name, 'itemName' ] );
    if( _.isFunction( nameFn ) ) return nameFn;
    return (item:any) => this.getIndication( item, entity.path );
  }

  private resolveEntityConfigIndex( path:string, entity:EntityType ){
    const config:any = _.get(this.adminConfig, ['entities', entity.name, 'index' ], {} );
    return {
      fields: this.resolveFieldList( 'index', entity, config.fields ),
      query: config.query || this.indexQuery( path, entity ),
      search: config.search
    };
  }

  private resolveEntityConfigShow( path:string, entity:EntityType ){
    const config:any = _.get(this.adminConfig, ['entities', entity.name, 'show' ], {} );
    return {
      fields: this.resolveFieldList( 'show', entity, config.fields ),
      query: config.query || this.showQuery( path, entity ),
      assocFrom: config.assocFrom || this.resolveShowAssocFrom( entity )
    };
  }

  private resolveEntityConfigCreate( path:string, entity:EntityType ){
    const config:any = _.get(this.adminConfig, ['entities', entity.name, 'create' ], {} );
    return {
      fields: this.resolveFieldList( 'create', entity, config.fields ),
      query: config.query || this.createQuery( entity )
    };
  }

  private resolveEntityConfigEdit( path:string, entity:EntityType ){
    const config:any = _.get(this.adminConfig, ['entities', entity.name, 'edit' ], {} );
    return {
      fields: this.resolveFieldList( 'edit', entity, config.fields ),
      query: config.query || this.editQuery( path, entity )
    };
  }

  private indexQuery( path:string, entity:EntityType ){
    return ({parent}) => {
      if( entity.typesQuery === false ) return;
      const query = { query: {} };
      const fieldList = this.getEntityView( path )['index'].fields;
      const fields = this.fieldListToQueryFields( fieldList );
      _.set( query, ['query', entity.typesQueryName], fields );
      if( parent ) this.setParentQuery( parent, query, entity );
      return query;
    }
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
      _.forEach( showConfig.assocFrom, assocFrom => _.merge( query.query[entity.typeQueryName], assocFrom.query({}) ) );
      return query;
    }
  }

  private createQuery( entity:EntityType ){
    return ({parent}) => {
      if( entity.createMutation === false ) return;
      const query = { query: {} };
      if( parent ) this.setParentQuery( parent, query );
      this.addLookupQueriesForAssocs( entity, query );
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
      this.addLookupQueriesForAssocs( entity, query );
      return query;
    }
  }

  private addLookupQueriesForAssocs( entity:EntityType, query:any ){
    _.forEach( entity.assocTo, assocTo => {
      const config = this.getEntityViewByName( assocTo.type );
      if( config.entity.typesQuery === false ) return;
      _.set( query.query, config.entity.typesQueryName, { id: true } );
      _.forEach( config.indication, indication =>
        _.set( query.query, [config.entity.typesQueryName, indication], true ) );
    });
    _.forEach( entity.assocToMany, assocToMany => {
      const config = this.getEntityViewByName( assocToMany.type );
      if( config.entity.typesQuery === false ) return;
      _.set( query.query, config.entity.typesQueryName, { id: true } );
      _.forEach( config.indication, indication =>
        _.set( query.query, [config.entity.typesQueryName, indication], true ) );
    });
  }

  private fieldListToQueryFields( fieldList:FieldList ) {
    return _.reduce( fieldList, (result, field) => _.merge(result, _.isFunction(field.query ) ? field.query() : {} ), { id: true } );
  }

  private setParentQuery( parent:ParentType, query:any, entity?:EntityType ):void {
    if( parent.viewType.entity.typeQuery === false ) return;
    const fields = this.getIndicationQueryFields( parent.viewType );
    _.set( fields, '__args', {id: parent.id } );
    _.set( query, ['query', parent.viewType.entity.typeQueryName], fields );
    if( ! entity ) return;
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
    if( assocTo ) return this.resolveAssocToField( action, entity, config, assocTo );

    const assocToMany:AssocToType = _.find( _.get( entity, 'assocToMany' ), assocToMany => assocToMany.type === config.name );
    if( assocToMany ) return this.resolveAssocToManyField( action, entity, config, assocToMany );

    return this.resolveUnknown(entity, config);
  }

  private resolveUnknown( entity:EntityType, config:FieldConfig ):FieldConfig {
    config.type = config.type || 'String';
    config.label = config.label || this.getLabel( entity.name, config.name );
    config.render = config.render || ((item:any) => _.get(item, config.name ) );
    config.value = config.value || ((item:any) => _.get(item, config.name ) );
    config.sortValue = config.sortValue || config.value;
    config.query = config.query || (() => _.set({}, config.name, true ));
    return config;

  }

  private resolveIdField( action:Action, config:FieldConfig ):FieldConfig {
    if( action === 'create' || action === 'edit' ) return undefined;
    config.type = 'String';
    config.label = config.label || 'ID'
    config.disabled = true;
    config.render = config.render || ((item:any) => _.get(item, 'id' ) );
    config.value = config.value || ((item:any) => _.get(item, 'id' ) );
    config.sortValue = config.sortValue || config.value;
    config.query = () => null;
    return config;
  }


  private resolveAttributeField( action:Action, attribute:AttributeType, config:FieldConfig, entity:EntityType ):FieldConfig {
    if( action === 'create' && attribute.createInput === false ) return undefined;
    if( attribute.type === 'File' ) return this.resolveFileField( action, attribute, config, entity );
    config.type = this.isEnum( attribute.type ) ? 'enum' : attribute.type;
    config.list = attribute.list;
    config.label = config.label || this.getLabel( entity.name, config.name );
    config.required = config.required || attribute.required;
    config.disabled = config.disabled || ( action === 'edit' && attribute.updateInput === false )
    config.render = config.render || (( item:any, parent:ParentType ) => {
      let value = config.value( item );
      if( config.type === 'enum' ) value = _.get( this.domainConfiguration, ['enum', attribute.type, value], value );
      return _.isArray( value ) ? value.join(', ') : value;
    });
    config.value = config.value || ((item:any) => _.get(item, config.name) );
    config.sortValue = config.sortValue || config.value;
    config.query = config.query || (() => _.set( {}, config.name, attribute.objectTypeField !== false ));
    if( config.type === 'enum' && ! config.options ) config.options = this.defaultEnumOptionsFn( attribute.type );
    this.setAttributeControl( config, attribute );
    return config;
  }

  private resolveFileField( action:Action, attribute:AttributeType, config:FieldConfig, entity:EntityType ):FieldConfig {
    config.type = attribute.mediaType;
    config.label = config.label || this.getLabel( entity.name, config.name );
    config.required = config.required || attribute.required;
    config.disabled = config.disabled || ( action === 'edit' && attribute.updateInput === false )
    config.render = config.render || (( item:any ) => {
      const file = _.get( item, config.name );
      if( ! file ) return '';
      const src = `http://localhost:4000/files/${entity.path}/${item.id}/${file.secret}/${config.name}/${file.filename}`;
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
    if( _.includes(['Date'], attribute.type ) ) return field.control = 'datepicker';
  }

  private defaultEnumOptionsFn = (enumName:string) => () => {
    const enumValues = _.get(this.domainConfiguration, ['enum', enumName] );
    const options = [];
    _.forEach( enumValues, (label, value) => options.push( { label, value } ) );
    return options;
  }


  private resolveAssocToField( action:Action, entity:EntityType, config:FieldConfig, assocTo:AssocToType ):FieldConfig {
    const assocEntity:EntityType = _.get( this.domainConfiguration, ['entity', assocTo.type]);
    if( ! assocEntity ) return undefined;
    config.type = 'assocTo';
    config.list = false;
    config.label = config.label || this.getLabel( assocEntity.name, config.name );
    config.required = config.required || assocTo.required;
    config.value = config.value || ((item:any) => _.get( item, [assocEntity.typeQueryName, 'id'] ) );
    config.render = config.render || (( item:any ) => {
      const assocViewType = this.getEntityViewByName( assocEntity.name );
      const value = _.get( item, assocEntity.typeQueryName );
      if( ! value ) return undefined;
      const display = assocViewType.itemName(value);
      const link = this.itemLink( assocEntity, value );
      return this.decorateLink( display, link )
    });
    config.sortValue = config.sortValue || ((item:any)=>
      this.getIndication( _.get( item, assocEntity.typeQueryName ), assocEntity.path ) );
    config.query = config.query || (() => {
      const assocViewType = this.getEntityViewByName( assocEntity.name );
      if( assocViewType.entity.typeQuery === false ) return {};
      const query = {};
      const fields = this.getIndicationQueryFields( assocViewType );
      return _.set( query, [assocEntity.typeQueryName], fields );
    });
    config.control = 'select';
    config.options = config.options || this.defaultAssocOptionsMethod( assocEntity );
    return config;
  }

  private resolveAssocToManyField( action:Action, entity:EntityType, config:FieldConfig, assocToMany:AssocToManyType ):FieldConfig {
    const assocEntity:EntityType = _.get( this.domainConfiguration, ['entity', assocToMany.type]);
    if( ! assocEntity ) return undefined;
    config.type = 'assocToMany';
    config.list = true;
    config.label = config.label || this.getLabel( assocEntity.name, config.name );
    config.required = config.required || assocToMany.required;
    config.render = config.render || (( item:any ) => {
      const assocViewType = this.getEntityViewByName( assocEntity.name );
      let values = _.get( item, assocEntity.typeQueryName );
      if( ! values ) return undefined;
      if( ! _.isArray( values ) ) values = [values];
      values = _.map( values, value => {
        const display = assocViewType.itemName(value);
        return this.decorateLink( display, this.itemLink( assocEntity, value ) )
      });
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
      values = _.map( values, value => this.getIndication( value, entity.path ) );
      return _.join( values, ', ' );
    });
    config.query = config.query || (() => {
      const assocViewType = this.getEntityViewByName( assocEntity.name );
      if( assocViewType.entity.typeQuery === false ) return {};
      const query = {};
      const fields = this.getIndicationQueryFields( assocViewType );
      return _.set( query, [assocEntity.typeQueryName], fields );
    });
    config.options = config.options || this.defaultAssocOptionsMethod( assocEntity );
    config.control = 'multiple';
    return config;
  }

  private defaultAssocOptionsMethod( assocEntity:EntityType ){
    return (data:any) => {
      const assocView = this.getEntityViewByName( assocEntity.name );
      const values = _.get( data, assocEntity.typesQueryName );
      return _.map( values, value => ({ value: value.id, label: assocView.itemName( value ) } ) );
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
    return () => {
      if( entity.typesQuery === false ) return;
      const fields = this.fieldListToQueryFields( fieldList );
      return _.set( {}, entity.typesQueryName, fields );
    }
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

  getLabel( entity:string, field:string ):string {
    return _.get( this.adminConfig,
      ['resources', this.locale, 'label', 'entities', entity, field],
      inflection.humanize( field ) );
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

  private getIndication( item:any, path:string ):string {
    if( ! item ) return '[null]';
    const viewType = this.getEntityView(path);
    if( _.isEmpty( viewType.indication ) ) return _.get( item, 'id', _.toString( item )) ;
    return _.join( _.map( viewType.indication, indication => _.get( item, indication ) ), ' ' );
  }

  private getIndicationQueryFields( viewType:EntityViewType ){
    const fields = viewType.indication;
    return _.reduce( fields, (result, field) => _.set( result, field, true), { id: true } );
  }

}
