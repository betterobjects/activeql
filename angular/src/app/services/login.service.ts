import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import * as _ from 'lodash';

export type User = {
  token:string
  username:string
}

@Injectable({providedIn: 'root'})
export class LoginService {

  private _user:User;

  get user() { return this._user }

  constructor( protected apollo:Apollo ){}

  login( username:string, password:string ):Promise<boolean> {
    const mutation = gql`mutation {  login ( username: "${username}", password: "${password}" )  }`;
    return new Promise( resolve => this.apollo.mutate({ mutation }).subscribe(({data}) => {
      const token = _.get(data, 'login');
      this._user = token ? { token, username } : undefined;
      resolve( this._user !== undefined );
    }));
  }

  logout():Promise<void> {
    this._user = undefined;
    const mutation = gql`mutation {  logout  }`;
    return new Promise( resolve => this.apollo.mutate({ mutation }).subscribe(({data}) => {
      resolve();
    }));
  }

}
