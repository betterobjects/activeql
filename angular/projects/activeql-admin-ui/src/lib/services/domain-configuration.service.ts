import _ from 'lodash';
import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';

const query = gql`
  query {
    domainConfiguration
  }
`;

@Injectable({ providedIn: 'root' })
export class DomainConfigurationService {

  private domainConfiguration:any;

  constructor( private apollo:Apollo ) {}

  async getDomainConfiguration():Promise<any> {
    if( ! this.domainConfiguration ) this.domainConfiguration = await this.loadDomainConfiguration();
    return this.domainConfiguration;
  }

  private async loadDomainConfiguration():Promise<any[]> {
    return new Promise( (resolve,reject) => this.apollo.query({ query, errorPolicy: 'all' }).subscribe(({data, errors}) => {
      if( errors ) reject( errors );
      resolve( _.get(data, 'domainConfiguration' ));
    }, error => {
      reject( error );
    }));
  }


}
