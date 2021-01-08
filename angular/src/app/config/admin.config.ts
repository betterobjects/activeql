import _ from 'lodash';
import { AdminConfig } from 'activeql-admin-ui';

export const adminConfig:AdminConfig = {
  entities:  {
    Car: {
      asLookup: {
        query: () => ({id: true, licence:true } ),
        render: (item:any) => _.get(item, 'licence') },
      index: {
        fields: ['id', 'color', 'brand', 'createdAt'],
        search: true
      }
    }
  }
}
