import _ from 'lodash';
import { Runtime } from 'activeql-server';
import { exit } from 'process';

const domainConfiguration = './config-types/d2prom';
const truncate = true;

(async () => {
  console.log('Seeding datastore...');
  const runtime = await Runtime.create( domainConfiguration );
  const result = await runtime.seed( truncate );
  console.log( _.join(result, '\n') );
  exit();
})();
