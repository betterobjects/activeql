import _ from 'lodash';
import { exit } from 'process';
import { activeqlSeeed } from './activeql-app';

const truncate = true;

(async () => {
  console.log('Seeding datastore...');
  const result = await activeqlSeeed( truncate );
  console.log( _.join(result, '\n'), '\n' );
  exit();
})();
