import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import _ from 'lodash';

import { CreateComponent } from '../components/create/create.component';
import { EditComponent } from '../components/edit/edit.component';
import { IndexComponent } from '../components/index/index.component';
import { ShowComponent } from '../components/show/show.component';
import { AssocConfigType, EntityConfigType, FieldConfigType, UiConfigType } from '../lib/admin-config';
import { AdminData } from '../lib/admin-data';
import { AdminService } from './admin.service';



@Injectable({ providedIn: 'root' })
export class AdminDataResolver implements Resolve<AdminData> {

  constructor(
    private adminService:AdminService,
    protected apollo:Apollo,
    private router:Router
    ) {}

  resolve(route:ActivatedRouteSnapshot, state:RouterStateSnapshot):Promise<AdminData> {
    return new Promise( async (resolve, reject) => {
      try {
        const path = route.params['path'];
        if( ! path ) resolve( null ); // dont know why but its calles when it shouldnt
        const id = route.params['id'];
        const parentPath = route.params['parent'];
        const parentId = route.params['parentId'];

        const parent = await this.getParentData( parentPath, parentId );
        const entityConfig = this.adminService.getEntityConfig(path);
        if( ! entityConfig ) reject( `no such config '${path}'` );
        const load =
          route.component === IndexComponent ? this.loadItemsData( entityConfig, entityConfig.index, parent ) :
          route.component === ShowComponent ? this.loadItemData( entityConfig, entityConfig.show, id, parent ) :
          route.component === EditComponent ? this.loadItemData( entityConfig, entityConfig.form, id, parent ) :
          route.component === CreateComponent ? this.loadDataForCreate( entityConfig, entityConfig.form, parent ) :
          undefined;
        const adminData = await load;
        resolve( adminData );
      } catch (error) {
        this.router.navigate(['/admin/error'], {state: {error: JSON.stringify( error ) } } );
      }
    });
  }

  private async getParentData( path:string, id:string ):Promise<AdminData> {
    if( ! path ) return undefined;
    const config = this.adminService.getEntityConfig(path);
    if( ! config ) return this.warn( `no such config '${path}'`, undefined );
    return this.loadItemData( config, config.show, id );
  }

  private async loadItemsData( entityConfig:EntityConfigType, uiConfig:UiConfigType, parent?:AdminData ):Promise<AdminData> {
    const parentCondition = this.getParentCondition( parent );
    const expression = `query{ ${uiConfig.query}${parentCondition} ${ this.buildFieldQuery( entityConfig, uiConfig ) } }`;
    const query = { query: gql(expression), fetchPolicy: 'network-only' };
    const data = await this.loadData( query );
    return new AdminData( data, entityConfig, uiConfig, parent );
  }

  private async loadDataForCreate(
      entityConfig:EntityConfigType,
      uiConfig:UiConfigType,
      parent?:AdminData ):Promise<any> {
    const data = await this.loadOnlyExpressions( uiConfig );
    const item = parent ? _.set( {}, parent.entityConfig.typeQueryName, parent.item ) : {};
    _.set( data, uiConfig.query, item );
    return new AdminData( data, entityConfig, uiConfig, parent );
  }

  private async loadOnlyExpressions( uiConfig:UiConfigType ):Promise<any> {
    const expressions = _.compact( _.map( uiConfig.data, data => this.getDataLoadExpression( data, uiConfig ) ) );
    if( _.size( expressions ) == 0 ) return {};
    const expression = `query { ${ _.join(expressions, '\n') } }`;
    const query = { query: gql(expression), variables: {}, fetchPolicy: 'network-only' };
    return this.loadData( query );
  }

  private async loadItemData(
      entityConfig:EntityConfigType,
      uiConfig:UiConfigType,
      id:string,
      parent?:AdminData ):Promise<any> {
    const expressions = [this.getItemLoadExpression( entityConfig, uiConfig )];
    expressions.push( ...
      _.compact( _.map( uiConfig.data, data => this.getDataLoadExpression( data, uiConfig ) ) ) );
    const expression = `query EntityQuery($id: ID!){ ${ _.join(expressions, '\n') } }`;
    const query = { query: gql(expression), variables: {id}, fetchPolicy: 'network-only' };
    const data = await this.loadData( query );
    return new AdminData( data, entityConfig, uiConfig, parent );
  }

  private getItemLoadExpression( entityConfig:EntityConfigType, uiConfig:UiConfigType ) {
    const fields = this.buildFieldQuery( entityConfig, uiConfig );
    return `${uiConfig.query}(id: $id) ${fields}`;
  }


  private getDataLoadExpression( data:AssocConfigType, uiConfig:UiConfigType ):string {
    if( _.isString( data ) ) data = { path: data };
    const config = this.adminService.getEntityConfig( data.path );
    if( ! config ) return this.warn(`no such config '${data.path}'`, undefined );
    const fields = this.buildFieldQuery( config, config.show );
    return `${config.typesQueryName} ${fields}`;
  }


  protected async loadData( query:any ):Promise<any>{
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

  protected buildFieldQuery( entityConfig:EntityConfigType, uiConfig:UiConfigType ):string {
    const knownFields = _.keys( entityConfig.fields );
    const queryFields = _(uiConfig.fields).
      filter( (field:FieldConfigType) => _.includes( knownFields, field.name ) ).
      map( (field:FieldConfigType) => this.getFieldInFieldQuery( field ) ).
      value();
    const assocs = _.compact( _.uniq( _.concat(
      uiConfig.assoc, _.map( uiConfig.fields, (field:FieldConfigType) => field.path ) ) ) );
    const assocFields = _.map( assocs, assoc =>
        this.getAssocFields( entityConfig, assoc)).join( ' ');
    return `{ id ${ _.join( _.concat( queryFields, assocFields ), ' ' ) } }`;
  }

  protected getFieldInFieldQuery( field:FieldConfigType ):string {
    return field.type === 'file' ? `${field.name} { filename encoding mimetype }` : field.name;
  }

  protected getAssocFields( entityConfig:EntityConfigType, assoc:AssocConfigType ):string|undefined {
    if( _.isString( assoc ) ) assoc = _.set( {}, 'path', assoc );
    const config = this.adminService.getEntityConfig( assoc.path );
    if( ! config ) return this.warn( `getAssocFields: no config for path '${assoc.path}' `, undefined);
    const query = _.get( entityConfig.assocs, [assoc.path, 'query']);
    if( ! query ) return this.warn( `getAssocFields: no query for path '${assoc.path}' `, undefined);
    if( ! assoc.fields ) assoc.fields = _.keys( config.fields );
    const fields = _(assoc.fields).
      map( field => config.fields[field] ).
      compact().
      map( field => this.getFieldInFieldQuery( field ) ).
      value();
    return _.concat(
      query, '{ id ', fields, _.map( assoc.assoc, assoc => this.getAssocFields( config, assoc ) ), '}'
    ).join( ' ' );
  }

  protected getParentCondition( parent?:AdminData ):string {
    if( ! parent ) return '';
    const config = this.adminService.getEntityConfig( parent.path );
    if( ! config ) return this.warn(`no such config '${parent.path}'`, '');
    return `(filter: {${config.foreignKey}: "${parent.id}"})`;
  }

  protected warn<T>( message:string, type:T ):T {
    console.warn(message);
    return type;
  }

}
