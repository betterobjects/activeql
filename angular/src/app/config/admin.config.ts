import _ from 'lodash';
import { AdminConfig } from 'activeql-admin-ui';

export const adminConfig:AdminConfig = {
  locale: 'en',
  entities:  {
    _Car: {
      asLookup: {
        query: () => ({id: true, licence:true } ),
        render: (item:any) => _.get(item, 'licence') },
      index: {
        fields: ['vin', 'licence', 'color', 'brand', 'createdAt'],
        search: true
      }
    }
  },
  resources: {
    en: {
      label: {
        entities: {
          Driver: {
            licenceValid: "Licence valid thru"
          }
        }
      }
    }
  }
}
