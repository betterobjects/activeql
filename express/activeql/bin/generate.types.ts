import fs from 'fs';
import path from 'path';
import { exit } from 'process';

import { activeqlTypes } from './activeql-app';


(async () => {
  const file = path.join('activeql', 'impl', 'activeql.types.ts' )
  const types = await activeqlTypes();
  fs.writeFile( file, types, (err) => {
    if (err) throw err;
    console.info( `./${file} written`);
    exit();
  });
})();
