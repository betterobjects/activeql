import _ from 'lodash';
import { AdminConfig } from 'activeql-admin-ui';

export const adminConfig:AdminConfig = {
  locale: 'en',
  entities:  {
    Car: {
      asLookup: {
        query: () => ({id: true, licence:true } ),
        render: (item:any) => _.get(item, 'licence') },
    }
  },
  resources: {
    en: {
      label: {
        entities: {
          Car: {
            licence: "Licence Plate"
          }
        }
      }
    }
  }
}
