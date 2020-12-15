import _ from 'lodash';
import { exit } from 'process';
import { activeqlSeeed } from './activeql-app';

const truncate = true;

(async () => {
  console.log('Seeding datastore...');
  const runtime = await activeqlSeeed();
  const result = await runtime.seed( truncate );
  console.log( _.join(result, '\n') );
  exit();
})();
