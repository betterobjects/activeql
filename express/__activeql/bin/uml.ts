import _ from 'lodash';
import { exit } from 'process';
import { activeqlUml } from './activeql-app';
import fs from 'fs';

(async () => {
  const uml = activeqlUml();

  fs.writeFile('domain.plantuml', uml, (err) => {
    if (err) throw err;
    console.log( './domain.plantuml written');
    exit();
  });

})();
