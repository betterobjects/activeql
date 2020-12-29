import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';

const query = gql`
  query {
    metaData
  }
`;

@Injectable({ providedIn: 'root' })
export class MetaDataService {

  private metaData:any[];

  constructor(private apollo:Apollo) {}

  async getMetaData():Promise<any> {
    if( ! this.metaData ) this.metaData = await this.loadMetaData();
    return this.metaData;
  }

  private loadMetaData():Promise<any[]>{
    return new Promise( (resolve, reject) => {
      this.apollo.watchQuery<any>({ query }).valueChanges.subscribe(({ data, loading }) => {
        if( loading ) return;
        resolve(data.metaData);
      }, error => {
        console.error( 'could not load metaData', error );
        resolve( [] );
      });
    });
  }


}
