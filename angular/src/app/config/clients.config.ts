import _ from 'lodash';
import { EntityConfigType } from 'gama-admin-ui';


export const clientsConfig:EntityConfigType = {
  action: (event:any) => event.action === 'some' ? console.log(`some ${event.id}`) : console.log('none'),
  index: {
    fields: [
      'name',
      {name: 'city', filter: true},
      'dsb',
      'logo'
    ]
  },
  show: {
    assoc: [ { path: 'organisations', assoc: ['industries']} ],
    table: [
      {
        path: 'organisations',
        fields: [
          'name',
          'industries'
        ]
      }
    ]
  }
}
