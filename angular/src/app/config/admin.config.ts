import _ from 'lodash';
import { AdminConfig } from 'activeql-admin-ui';

export const adminConfig:AdminConfig = {
  locale: 'en',
  entities:  {
    Car: {
      indication: 'licence'
    },
    User: {
      indication: 'username'
    },
    Driver: {
      indication: ['firstname','lastname']
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
