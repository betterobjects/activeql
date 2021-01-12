import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { Apollo } from 'apollo-angular';
import { WatchQueryOptions } from 'apollo-client';
import gql from 'graphql-tag';
import { jsonToGraphQLQuery } from 'json-to-graphql-query';
import _ from 'lodash';

import { CreateComponent } from '../components/create/create.component';
import { EditComponent } from '../components/edit/edit.component';
import { IndexComponent } from '../components/index/index.component';
import { ShowComponent } from '../components/show/show.component';
import { AdminConfigService } from '../services/admin-config.service';
import { Action, EntityViewType, ParentType } from '../services/admin-config.types';

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
          route.component === IndexComponent ?  this.resolveData( 'index', entityView, parent ) :
          route.component === ShowComponent ?   this.resolveData( 'show', entityView, parent, id ) :
          route.component === CreateComponent ? this.resolveData( 'create', entityView, parent, id ) :
          route.component === EditComponent ?   this.resolveData( 'edit', entityView, parent, id ) :
          undefined;
        const adminData = await load;
        resolve( adminData );
      } catch (error) {
        error = error.networkError?.error?.errors ?
          _.map( error.networkError?.error?.errors, error => error.message ) : _.toString( error );
        this.router.navigate(['/admin/error'], {state: { error } } );
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

  private async resolveData( action:Action, entityView:EntityViewType, parent?:ParentType, id?:string ):Promise<any> {
    let query = entityView[action].query({ parent, id });
    if( ! _.isString( query ) ) query = jsonToGraphQLQuery( query );
    const request:WatchQueryOptions = { query: gql(query), fetchPolicy: 'network-only', errorPolicy: 'all' };
    return this.loadData( request );
  }

  private async loadData( queryOptions:WatchQueryOptions ):Promise<any>{
    if( ! queryOptions ) return undefined;
    return new Promise( (resolve, reject) => {
      this.apollo.watchQuery<any>( queryOptions )
      .valueChanges
      .subscribe(({ data, loading, errors }) => {
        if( errors ) console.log({errors})
        if( loading ) return;
        resolve( data );
      }, error => reject( error ) );
    });
  }

}
