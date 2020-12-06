import * as inflection from 'inflection';
import * as _ from 'lodash';

const nameProperties = ['name', 'title', 'key', 'lastname', 'firstname', 'last_name', 'first_name'];

export type AdminConfigType = {
  entities?:{ [entity:string]:EntityConfigType}
  menu?:string[]
  showLink?:(path:string, id:string) => string[]
  uploadsRootPath?:string
}

export type EntityConfigType = {
  path?:string
  title?:string|((purpose?:TitlePurposeType)=>string)
  action?:(event:ActionEventType) => void
  fields?:{[name:string]:FieldConfigType}
  assocs?:{[name:string]:AssocType}
  entitesName?:string
  entityName?:string
  typesQueryName?:string
  typeQueryName?:string
  deleteMutationName?:string
  updateMutationName?:string
  updateInputTypeName?:string
  createMutationName?:string
  createInputTypeName?:string,
  foreignKey?:string
  foreignKeys?:string
  name?:( item:any ) => string
  index?:UiConfigType
  show?:UiConfigType
  form?:UiConfigType
}

export type AdminTableConfig = {
  title?:string|(()=>string)
  fields?:(string|FieldConfigType)[]
  actions?:{[name:string]:AdminTableActionConfig}
  defaultActions?:('show'|'edit'|'delete')[]
  search?:boolean
}

export type UiConfigType = AdminTableConfig & {
  query?:string
  assoc?:AssocConfigType[]
  data?:AssocConfigType[]
  table?:AssocTableConfigType[]
}

export type AdminTableActionConfig = {
  icon?:string
  text?:string
  onAction:(item:any) => void
}

export type FieldFilterConfigType = {
  value?:(item:any) => any | any[]
  multiple?:boolean
}

export type FieldConfigType = {
  name?:string
  path?:string
  label?:string|(() => string)
  value?:(item:any) => any
  render?:(item:any) => string
  keyValue?:(item:any) => string|string[]
  filter?:boolean|FieldFilterConfigType
  link?:boolean|string|string[]|((item:any) => any[])
  search?:(data:any, searchTerm:string) => boolean
  sortable?:boolean
  parent?:string
  control?:string
  values?:(data:any) => {value:any, label:string}[]
  required?:boolean
  type?:string
  unique?:boolean
  mediaType?:'image'|'video'|'audio'
}

export type AssocTableConfigType = AdminTableConfig & {
  path:string
}

export type AssocConfigType = string| {
  path?:string
  fields?:string[]
  assoc?:AssocConfigType[]
}

export type AssocType = {
  path:string
  query:string
  required?:boolean
  type:'assocTo'|'assocToMany'|'assocFrom'
  foreignKey:string
  typesQuery:string // for lookups
  scope:string
}

export type ActionEventType = {id:any, action:string};

export type TitlePurposeType = 'menu'|'index'|'show'|'form'|'detailTable'

export type SaveReturnType = {
  id?:string
  violations:ViolationType[]
}

export type ViolationType = {
  attribute:string
  message:string
}


/**
 *
 */
export class AdminConfig {

  private static adminConfig:AdminConfig;
  private config:AdminConfigType;

  private constructor(){}

  static getInstance() {
    if( _.isUndefined( this.adminConfig ) ) this.adminConfig = new AdminConfig();
    return this.adminConfig;
  }

  static guessNameValue = (item:any) => {
    const candidate = _.find( nameProperties, candidate => _.has( item, candidate ) );
    if( candidate ) return _.get( item, candidate );
    if( _.has( item, 'id' ) ) return `#${_.get(item, 'id' ) }`;
    return _.toString( item );
  }

  static defaultShowLink = ( path:string, id:string ) => {
    return ['/admin', path, 'show', id ];
  }

  async getConfig( metaData:any, adminConfig:() => Promise<AdminConfigType> ){
    const defaultConfig = this.buildDefaultConfig( metaData );
    this.config = await adminConfig();
    this.config = _.defaultsDeep( this.config, defaultConfig );
    this.setUiConfigDefaults();
    this.setAssocTableDefaults();
    return this.config;
  }

  private buildDefaultConfig( metaData:any[] ):AdminConfigType {
    const config:AdminConfigType = _.set( {}, 'entities', _.reduce( metaData, (entities, data) => {
      return _.set( entities, data.path, this.buildEntityConfig( data ));
    }, {} ));
    _.set( config, 'showLink', AdminConfig.defaultShowLink );
    _.set( config, 'menu', _.sortBy( _.keys( config.entities ) ) );
    _.set( config, 'uploadsRootPath', 'http://localhost:3000/uploads' );
    return config;
  }

  private buildEntityConfig( data:any ):EntityConfigType {
    const fields = _.reduce( data.fields, (fields,data) =>
      _.set(fields, data.name, this.buildField(data)), {} );
    const assocs = _.reduce( data.assocTo, (assocs, assocTo) =>
      _.set( assocs, assocTo.path, _.merge( assocTo, { type: 'assocTo' } ) ), {} );
    _.reduce( data.assocToMany, (assocs, assocToMany) =>
      _.set( assocs, assocToMany.path, _.merge( assocToMany, { type: 'assocToMany' } ) ), assocs );
    _.reduce( data.assocFrom, (assocs, assocFrom) =>
      _.set( assocs, assocFrom.path, _.merge( assocFrom, { type: 'assocFrom' } ) ), assocs );
    const config = _.pick( data,[
      'path',
      'typeQueryName',
      'typesQueryName',
      'deleteMutationName',
      'updateInputTypeName',
      'updateMutationName',
      'createInputTypeName',
      'createMutationName',
      'foreignKey',
      'foreignKeys'
    ]);
    return _.merge( config, { fields, assocs } );
  };

  private buildField( data:any ):FieldConfigType {
    return _.pick( data, ['name', 'type', 'required', 'unique', 'scope', 'mediaType']);
  }

  private setUiConfigDefaults():void {
    _.forEach( this.config.entities, entityConfig => {
      if( _.isUndefined( entityConfig.name) ) entityConfig.name = AdminConfig.guessNameValue;
      _.forEach( ['index','show','form'], uiType => this.setDefaults( entityConfig, uiType ) );
      if( _.isUndefined( entityConfig.form.data ) ) entityConfig.form.data =
        _.compact( _.map( entityConfig.form.fields, (field:FieldConfigType) => field.path ) );

    });
  }

  private setDefaults( entityConfig:EntityConfigType, uiType:string ):EntityConfigType {
    if( ! _.has(entityConfig, uiType ) ) _.set( entityConfig, uiType, {} );
    const uiConfig:UiConfigType = _.get( entityConfig, uiType );
    if( ! _.has( uiConfig, 'query' ) ) _.set( uiConfig, 'query',
      uiType === 'index' ? entityConfig.typesQueryName : entityConfig.typeQueryName );
    this.setFieldsDefaults( uiConfig, entityConfig );
    return entityConfig;
  }

  private setFieldsDefaults( uiConfig:UiConfigType|AssocTableConfigType, entityConfig:EntityConfigType ):void {
    if( ! _.has( uiConfig, 'fields') ) _.set( uiConfig, 'fields',
      _.concat(
        _.keys( entityConfig.fields ),
        _.map(
          _.filter( entityConfig.assocs, assoc => _.includes( ['assocTo', 'assocToMany'], assoc.type ) ),
          assoc => assoc.path )
      ));
    uiConfig.fields = _.compact( _.map( uiConfig.fields, field => this.setFieldDefault( field, entityConfig ) ) );
  }

  private setAssocTableDefaults():void {
    _.forEach( this.config.entities, entityConfig => {
      _.forEach( ['index','show','form'], uiType => {
        const uiConfig:UiConfigType = entityConfig[uiType];
        // if( uiType === 'show' && _.isUndefined( uiConfig.table ) ) uiConfig.table = _.filter( entityConfig.assocs, assoc => assoc.type === 'assocFrom' );
        // must add assocs too
        _.forEach( uiConfig.table, table => {
          const tableEntityConfig = this.config.entities[table.path];
          if( ! tableEntityConfig ) return console.warn(`no such tableEntityConfig '${table.path}'`);
          this.setFieldsDefaults( table, tableEntityConfig );
         });
      } );
    });
  }

  private setFieldDefault( field:string|FieldConfigType, entityConfig:EntityConfigType ):FieldConfigType | undefined {
    const fieldName = _.isString( field ) ? field : _.get( field, 'name' );
    const fieldConfig = _.get( entityConfig.fields, fieldName );
    if( fieldConfig ) return this.fieldFromEntityField( field, fieldConfig );
    const pathName = _.isString( field ) ? field : _.get( field, 'path' );
    const assoc = _.get( entityConfig.assocs, pathName );
    if( assoc ) return this.fieldFromAssoc( field, assoc, entityConfig );
    return this.warn( `neither field nor assoc : '${field}'`, undefined );
  }

  private fieldFromEntityField( field:string|FieldConfigType, fieldConfig:FieldConfigType ):FieldConfigType {
    if( _.isString( field ) ) field = { name: field };
    fieldConfig.type = fieldConfig.type ? _.toLower( fieldConfig.type ) : 'string';
    if( fieldConfig.mediaType ) fieldConfig.render = this.getMediaFieldDefaultRenderMethod( fieldConfig );
    if( fieldConfig.type === 'file' ) fieldConfig.control = 'File';
    this.setDefaultFieldForType( fieldConfig );

    return _.defaults( field, fieldConfig );
  }

  private setDefaultFieldForType( fieldConfig:FieldConfigType ):void{
    switch( fieldConfig.type ){
      case 'boolean': return this.setDefaultFieldBoolean( fieldConfig );
    }
  }

  private setDefaultFieldBoolean( fieldConfig:FieldConfigType ):void {
    if( ! fieldConfig.control ) fieldConfig.control = 'select';
    if( ! fieldConfig.values ) fieldConfig.values = () => _.compact([
      {value: true, label: 'Yes'},
      {value: false, label: 'No'},
      fieldConfig.required ? undefined : {value: null, label: '' }
    ]);
    if( ! fieldConfig.render ) fieldConfig.render = item =>
      _.isUndefined(item[fieldConfig.name]) ? '' : item[fieldConfig.name] ? 'Yes' : 'No';
  }

  private getMediaFieldDefaultRenderMethod( fieldConfig:FieldConfigType ){
    return ( data:any ) => {
      const filename = _.get( data, [fieldConfig.name, 'filename'] );
      if( ! filename ) return null;
      const src = `${this.config.uploadsRootPath}/${data.__typename}/${data.id}/${fieldConfig.name}/${filename}`;
      switch( fieldConfig.mediaType ){
        case 'image': return `<img class="defaultImageRender" src="${src}">`
      }
    }
  }

  private fieldFromAssoc( field:string|FieldConfigType, assoc:AssocType, entityConfig:EntityConfigType ):FieldConfigType {
    if( _.isString( field ) ) field = { path: field };
    const assocEntityConfig = this.config.entities[assoc.path];
    if( ! assocEntityConfig ) return field;
    const values = this.getFieldValuesDefaultMethod( assoc, assocEntityConfig, entityConfig );
    const value = (item:any) => {
      const assocValue = _.get( item, assoc.query );
      return _.isArray( assocValue ) ?
        _.join( _.map( assocValue, value => assocEntityConfig.name( value ) ) , ', ' ) :
        assocEntityConfig.name( assocValue );
    };
    const render = this.getFieldRenderDefaultMethod( field, assoc, assocEntityConfig );
    const keyValue = (item:any) => {
      const assocValue = _.get( item, assoc.query );
      return _.isArray( assocValue ) ? _.map( assocValue, value => _.get(value, 'id' ) ) : _.get( assocValue, 'id' );
    }
    return _.defaults( field, { values, render, keyValue, value,
      control: assoc.type === 'assocTo' ? 'select' : assoc.type === 'assocToMany' ? 'multiple' : undefined,
      label: inflection.humanize( assoc.query ), name: assoc.foreignKey, path: assoc.path, required: assoc.required } );
  }

  private getFieldValuesDefaultMethod(assoc:AssocType, assocEntityConfig:EntityConfigType, entityConfig:EntityConfigType ){
    return (data:any) => _.compact( _.concat(
      _.map( _.get( data, assoc.typesQuery ), assocItem => {
      if( ! this.isNoneOrMatchingScoped(assoc, entityConfig, data, assocItem ) ) return;
      return { value: _.get( assocItem, 'id'), label: assocEntityConfig.name( assocItem ) };
    }),
    [assoc.required ? {value: null, label: '' } : undefined ]
    ));
  }

  private isNoneOrMatchingScoped(assoc:AssocType, entityConfig:EntityConfigType, data:any, assocItem:any):boolean {
    if( ! assoc.scope ) return true;
    const scopeConfig = this.config.entities[ assoc.scope ];
    if( ! scopeConfig ) return true;
    const itemScopedId = _.get( data, [entityConfig.typeQueryName, scopeConfig.typeQueryName, 'id'] );
    const assocScopedId = _.get( assocItem, [scopeConfig.typeQueryName, 'id'] );
    return itemScopedId === assocScopedId;
  }

  private getFieldRenderDefaultMethod( field:FieldConfigType, assoc:AssocType, assocEntityConfig:EntityConfigType ) {
    return (item:any) => {
      const assocValue = _.get( item, assoc.query );
      return _.isArray( assocValue ) ?
        _.join(
          _.map( assocValue, value =>
            this.decorateLink( field as FieldConfigType, assoc, value, assocEntityConfig.name( value ) ) ), ', ' ) :
        this.decorateLink( field as FieldConfigType, assoc, assocValue, assocEntityConfig.name( assocValue ) );
    };
  }

  private decorateLink( field:FieldConfigType, assoc:AssocType, assocValue:any, content:string ){
    if( field.link === false ) return content;
    if( field.link === true ) field.link = undefined;
    let link =
      _.isFunction( field.link ) ? field.link( assocValue ) :
      _.isString( field.link ) ? field.link :
      _.isArray( field.link ) ? field.link :
      this.config.showLink( assoc.path, _.get(assocValue, 'id') );

    if( ! link ) return content;
    if( _.isArray( link ) ) link = _.join( link, '/' );
    return `<a class="router-link" href="${ link }">${ content }</a>`;
  }


  private warn<T>( message:string, type:T ):T {
    console.warn(message);
    return type;
  }

}
