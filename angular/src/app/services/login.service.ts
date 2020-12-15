import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import _ from 'lodash';


@Injectable({providedIn: 'root'})
export class LoginService {

  get user() {
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');
    if( ! token || ! username ) return this.logout();
    return username;
  }

  constructor( protected apollo:Apollo ){}

  login( username:string, password:string ):Promise<boolean> {
    const mutation = gql`mutation {  login ( username: "${username}", password: "${password}" )  }`;
    return new Promise( resolve => this.apollo.mutate({ mutation }).subscribe(({data}) => {
      const token = _.toString( _.get(data, 'login') );
      if( ! token ) return resolve( false );
      localStorage.setItem( 'token', token );
      localStorage.setItem( 'username', username );
      resolve( true );
    }));
  }

  logout() {
    localStorage.removeItem( 'username' );
    localStorage.removeItem( 'token' );
  }

}
