import { organisationsConfig } from './organisations.config';
import { processingActivitiesConfig } from './processing_activities.config';
import { AdminConfigType } from 'activeql-admin-ui';

export const adminConfig:AdminConfigType = {
  entities:{
    clients: {
      show: {
        assoc: [ { path: 'phv_offers', assoc: ['versicherers']} ],
        table: [{path: 'phv_offers'}]
      }
    },
    organisations: organisationsConfig,
    processing_activities: processingActivitiesConfig
  }
}
