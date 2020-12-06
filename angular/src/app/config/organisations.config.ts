import _ from 'lodash';
import { EntityConfigType } from 'gama-admin-ui';

export const organisationsConfig:EntityConfigType = {
  index: {
    fields: [
      'name',
      {
        path: 'industries',
        label: 'Assigned Industries',
        filter: { multiple: true }
      },
      {
        path: 'clients',
      },
      {
        name: 'description',
        parent: null
      }
    ],
    defaultActions: ['edit', 'delete'],
    actions: {
      some: { icon: 'home', onAction: (item:any) => console.log('some action called', item.id ) }
    }
  },
  show: {
    assoc: [
      'organisational_units', 'processing_activities'
    ],
    fields: [
      'id',
      'name',
      'description',
      {
        path: 'industries',
        label: 'Assigned Industries'
      },
      {
        path: 'clients'
      }
    ],
    table: [
      {
        path: 'organisational_units',
        fields: [ 'name', 'description'],
      },
      {
        path: 'processing_activities',
        fields: [ 'name', 'description'],
      }
    ]
  },
  form: {
    data: ['clients', 'industries']
  }
}
