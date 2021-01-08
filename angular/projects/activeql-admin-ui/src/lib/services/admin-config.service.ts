import { Injectable } from '@angular/core';
import { EventEmitter } from 'events';
import inflection from 'inflection';
import _ from 'lodash';

import {
  Action,
  AdminConfig,
  AsReferenceType,
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
    const config:any = _.get(this.adminConfig, ['entities', entity.name, 'index' ], {} );
    return {
      fields: this.resolveFieldList( 'index', entity, config.fields ),
      query: config.query || this.indexQuery( path, entity ),
      search: config.search
    };
  }

  private resolveAsParent( path:string, entity:EntityType ):AsReferenceType {
    const config = _.get(this.adminConfig, ['entities', entity.name, 'asParent' ], {} );
    const defaultImpl = {
      query: ({id}) => {
        if( entity.typeQuery === false ) return;
        const query = { query: {} };
        const fields = this.getGuessQueryFields( entity );
        _.set( fields, '__args', {id} );
        return _.set( query, ['query', entity.typeQueryName], fields );
      },
      render: (item:any) => this.guessName( item )
    };
    return _.defaults( config, defaultImpl );
  }

  private resolveAsLookup( path:string, entity:EntityType ):AsReferenceType {
    const config = _.get(this.adminConfig, ['entities', entity.name, 'asLookup' ], {} );
    const defaultImpl = {
      query: () => {
        if( entity.typesQuery === false ) return;
        const query = {};
        const fields = this.getGuessQueryFields( entity );
        return _.set( query, [entity.typesQueryName], fields );
      },
      render: (item:any) => this.guessName( item )
    };
    return _.defaults( config, defaultImpl );
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
    return _.reduce( fieldList, (result, field) => _.merge(result, _.isFunction(field.query ) ? field.query() : {} ), { id: true } );
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

    return this.resolveUnknown(config);
  }

  private resolveUnknown( config:FieldConfig ):FieldConfig {
    config.type = config.type || 'String';
    config.label = config.label || config.name
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
    config.query = config.query || (() => _.set( {}, config.name, attribute.objectTypeField !== false ));
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
      if( ! file ) return '';
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
    if( _.includes(['Date'], attribute.type ) ) return field.control = 'datepicker';
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
    const viewType = this.getEntityViewByName( assocEntity.name );
    config.type = 'assocTo';
    config.list = false;
    config.label = config.label || inflection.humanize( config.name );
    config.required = config.required || assocTo.required;
    config.value = config.value || ((item:any) => _.get( item, [assocEntity.typeQueryName, 'id'] ) );
    config.render = config.render || (( item:any, parent:ParentType ) => {
      const value = _.get( item, assocEntity.typeQueryName );
      const display = viewType.asLookup.render(value);
      const link = this.itemLink( assocEntity, value );
      return this.decorateLink( display, link )
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
    const viewType = this.getEntityViewByName( assocEntity.name );
    config.type = 'assocToMany';
    config.list = true;
    config.label = config.label || inflection.humanize( config.name );
    config.required = config.required || assocToMany.required;
    config.render = config.render || (( item:any, parent:ParentType ) => {
      let values = _.get( item, assocEntity.typesQueryName );
      if( ! _.isArray( values ) ) values = [values];
      values = _.map( values, value => {
        const display = viewType.asLookup.render(value);
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
      values = _.map( values, value => this.guessName( value ) );
      return _.join( values, ', ' );
    });
    config.query = config.query || (() => _.set( {}, assocEntity.typesQueryName, viewType.asLookup.query({}) ) );
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
