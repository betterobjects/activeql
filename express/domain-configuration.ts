import _ from 'lodash';
import { DomainConfiguration } from "graph-on-rails";

// you can add object based configuration here

const age = (item:any) => new Date().getFullYear() - item.manufacturedYear;

export const domainConfiguration:DomainConfiguration = {
  entity: {
    Car: {
      attributes: {
        brand: 'String!',
        mileage: 'Int!',
        manufacturedYear: 'Int!',
        age: {
          type: 'Int!',
          virtual: true,
          resolve: ({item}) => new Date().getFullYear() - item.manufacturedYear
        }
      }
    }
  }
}
