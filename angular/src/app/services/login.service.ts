import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import _ from 'lodash';
import { Subject } from 'rxjs';


@Injectable({providedIn: 'root'})
export class LoginService {

  loginStatus:Subject<string> = new Subject();

  get user() {
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');
    if( ! token || ! username ) return this.removeFromLocalStorage();
    return username;
  }

  constructor( protected apollo:Apollo ){
    this.jwtValid();
  }

  jwtValid(){
    const query = gql`query { jwtValid }`;
    return new Promise( (resolve,reject) => this.apollo.query({ query, errorPolicy: 'all' }).subscribe(({data, errors}) => {
      const valid = _.get(data, 'jwtValid');
      if( ! valid ) this.removeFromLocalStorage();
      resolve( valid );
      this.loginStatus.next('login');
    }, error => {
      this.loginStatus.next('network-error');
    }));
  }

  login( username:string, password:string ):Promise<boolean> {
    const mutation = gql`mutation {  login ( username: "${username}", password: "${password}" )  }`;
    return new Promise( (resolve,reject) => this.apollo.mutate({ mutation, errorPolicy: 'all' }).subscribe(({data, errors}) => {
      const token = _.toString( _.get(data, 'login') );
      if( ! token ) return reject( errors );
      localStorage.setItem( 'token', token );
      localStorage.setItem( 'username', username );
      resolve( true );
      this.loginStatus.next('login');
    }, error => {
      reject( error );
    }));
  }

  logout() {
    this.removeFromLocalStorage();
    this.loginStatus.next('logout');
  }

  private removeFromLocalStorage(){
    localStorage.removeItem( 'username' );
    localStorage.removeItem( 'token' );
  }

}
