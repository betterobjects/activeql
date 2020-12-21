import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import _ from 'lodash';
import { jsonToGraphQLQuery } from 'json-to-graphql-query';

import { IndexComponent } from '../components/index/index.component';
import { ShowComponent } from '../components/show/show.component';
import { AdminConfigService, EntityViewType, ParentType } from '../services/admin-config.service';
// import { CreateComponent } from '../components/create/create.component';
// import { EditComponent } from '../components/edit/edit.component';
// import { ShowComponent } from '../components/show/show.component';
// import { AssocConfigType, EntityConfigType, FieldConfigType, UiConfigType } from '../services/admin-config';



@Injectable({ providedIn: 'root' })
export class AdminDataResolver implements Resolve<any> {

  constructor(
    private adminConfig:AdminConfigService,
    protected apollo:Apollo,
    private router:Router
    ) {}

  resolve(route:ActivatedRouteSnapshot, state:RouterStateSnapshot):Promise<any> {
    return new Promise( async (resolve, reject) => {
      try {
        const path = route.params['path'];
        if( ! path ) resolve( null ); // dont know why but its called when it shouldnt
        const id = route.params['id'];

        const parent = this.getParent( route.params );
        const entityView = this.adminConfig.getEntityView( path );
        if( ! entityView ) reject( `no such config '${path}'` );

        const load =
          route.component === IndexComponent ? this.loadItemsData( entityView, parent ) :
          route.component === ShowComponent ? this.loadItemData( entityView, id, parent ) :
          // route.component === EditComponent ? this.loadItemData( entityConfig, entityConfig.form, id, parent ) :
          // route.component === CreateComponent ? this.loadDataForCreate( entityConfig, entityConfig.form, parent ) :
          undefined;
        const adminData = await load;
        resolve( adminData );
      } catch (error) {
        this.router.navigate(['/admin/error'], {state: {error: JSON.stringify( error ) } } );
      }
    });
  }

  private getParent( params:any ):ParentType {
    const path = params['parent'];
    const id = params['parentId'];
    if( _.isNil( path ) || _.isNil( id) )  return undefined;
    const viewType = this.adminConfig.getEntityView( path );
    return { viewType, id }
}

  private async loadItemsData( entityView:EntityViewType, parent?:ParentType ):Promise<any> {
    let query = entityView.index.query({ parent });
    if( ! _.isString( query ) ) query = jsonToGraphQLQuery( query );
    const request = { query: gql(query), fetchPolicy: 'network-only' };
    return this.loadData( request );
  }

  private async loadItemData( entityView:EntityViewType, id:string, parent?:ParentType ):Promise<any> {
    let query = entityView.show.query({ id, parent });
    if( ! _.isString( query ) ) query = jsonToGraphQLQuery( query );
    const request = { query: gql(query), fetchPolicy: 'network-only' };
    return this.loadData( request );
  }

  // private async loadItemData(
  //     entityConfig:EntityConfigType,
  //     uiConfig:UiConfigType,
  //     id:string,
  //     parent?:AdminData ):Promise<any> {
  //   const expressions = [this.getItemLoadExpression( entityConfig, uiConfig )];
  //   expressions.push( ...
  //     _.compact( _.map( uiConfig.data, data => this.getDataLoadExpression( data, uiConfig ) ) ) );
  //   const expression = `query EntityQuery($id: ID!){ ${ _.join(expressions, '\n') } }`;
  //   const query = { query: gql(expression), variables: {id}, fetchPolicy: 'network-only' };
  //   const data = await this.loadData( query );
  //   return new AdminData( data, entityConfig, uiConfig, parent );
  // }


  // private async loadDataForCreate(
  //     entityConfig:EntityConfigType,
  //     uiConfig:UiConfigType,
  //     parent?:AdminData ):Promise<any> {
  //   const data = await this.loadOnlyExpressions( uiConfig );
  //   const item = parent ? _.set( {}, parent.entityConfig.typeQueryName, parent.item ) : {};
  //   _.set( data, uiConfig.query, item );
  //   return new AdminData( data, entityConfig, uiConfig, parent );
  // }

  // private async loadOnlyExpressions( uiConfig:UiConfigType ):Promise<any> {
  //   const expressions = _.compact( _.map( uiConfig.data, data => this.getDataLoadExpression( data, uiConfig ) ) );
  //   if( _.size( expressions ) == 0 ) return {};
  //   const expression = `query { ${ _.join(expressions, '\n') } }`;
  //   const query = { query: gql(expression), variables: {}, fetchPolicy: 'network-only' };
  //   return this.loadData( query );
  // }



  // private getItemLoadExpression( entityConfig:EntityConfigType, uiConfig:UiConfigType ) {
  //   const fields = this.buildFieldQuery( entityConfig, uiConfig );
  //   return `${uiConfig.query}(id: $id) ${fields}`;
  // }


  // private getDataLoadExpression( data:AssocConfigType, uiConfig:UiConfigType ):string {
  //   if( _.isString( data ) ) data = { path: data };
  //   const config = this.adminService.getEntityConfig( data.path );
  //   if( ! config ) return this.warn(`no such config '${data.path}'`, undefined );
  //   const fields = this.buildFieldQuery( config, config.show );
  //   return `${config.typesQueryName} ${fields}`;
  // }


  private async loadData( query:any ):Promise<any>{
    if( ! query ) return undefined;
    return new Promise( (resolve, reject) => {
      this.apollo.watchQuery<any>( query )
      .valueChanges
      .subscribe(({ data, loading }) => {
        if( loading ) return;
        resolve( data );
      }, error => reject( error ) );
    });
  }

  // private buildFieldQuery( entityConfig:EntityType, entityView:EntityViewConfig  ):string {
  //   const knownFields = _.keys( entityConfig.attributes );
  //   const queryFields = _(uiConfig.fields).
  //     filter( (field:FieldConfigType) => _.includes( knownFields, field.name ) ).
  //     filter( (field:FieldConfigType) => field.objectTypeField !== false ).
  //     map( (field:FieldConfigType) => this.getFieldInFieldQuery( field ) ).
  //     value();
  //   const assocs = _.compact( _.uniq( _.concat(
  //     uiConfig.assoc, _.map( uiConfig.fields, (field:FieldConfigType) => field.path ) ) ) );
  //   const assocFields = _.map( assocs, assoc =>
  //       this.getAssocFields( entityConfig, assoc)).join( ' ');
  //   return `{ id ${ _.join( _.concat( queryFields, assocFields ), ' ' ) } }`;
  // }

  // protected getFieldInFieldQuery( field:FieldConfigType ):string {
  //   return field.type === 'file' ? `${field.name} { filename encoding mimetype }` : field.name;
  // }

  // protected getAssocFields( entityConfig:EntityConfigType, assoc:AssocConfigType ):string|undefined {
  //   if( _.isString( assoc ) ) assoc = _.set( {}, 'path', assoc );
  //   const config = this.adminService.getEntityConfig( assoc.path );
  //   if( ! config ) return this.warn( `getAssocFields: no config for path '${assoc.path}' `, undefined);
  //   const query = _.get( entityConfig.assocs, [assoc.path, 'query']);
  //   if( ! query ) return this.warn( `getAssocFields: no query for path '${assoc.path}' `, undefined);
  //   if( ! assoc.fields ) assoc.fields = _.keys( config.fields );
  //   const fields = _(assoc.fields).
  //     map( field => config.fields[field] ).
  //     compact().
  //     map( field => this.getFieldInFieldQuery( field ) ).
  //     value();
  //   return _.concat(
  //     query, '{ id ', fields, _.map( assoc.assoc, assoc => this.getAssocFields( config, assoc ) ), '}'
  //   ).join( ' ' );
  // }

  // protected getParentCondition( parent?:AdminData ):string {
  //   if( ! parent ) return '';
  //   const config = this.adminService.getEntityConfig( parent.path );
  //   if( ! config ) return this.warn(`no such config '${parent.path}'`, '');
  //   return `(filter: {${config.foreignKey}: "${parent.id}"})`;
  // }

  protected warn<T>( message:string, type:T ):T {
    console.warn(message);
    return type;
  }

}
