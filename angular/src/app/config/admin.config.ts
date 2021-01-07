import _ from 'lodash';
import { AdminConfig } from 'activeql-admin-ui';

export const adminConfig:AdminConfig = {
  entities:  {
    Car: {
      index: {
        fields: ['id', 'color', 'brand', 'createdAt'],
        search: true
      }
    }
  }
}
