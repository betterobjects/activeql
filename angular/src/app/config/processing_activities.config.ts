import _ from 'lodash';
import { EntityConfigType } from 'gama-admin-ui';

export const processingActivitiesConfig:EntityConfigType = {
  index: {
    assoc: [{path: 'organisational_units', assoc: ['organisations']}],
    fields: [
      'name',
      {
        path: 'organisations',
        value: (processingActivity) =>
        _.get( _.first( processingActivity.organisationalUnits ), 'organisation.name' )
      },
      'organisational_units'
    ]
  }
}
