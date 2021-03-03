import _ from 'lodash';
import { exit } from 'process';
import { activeqlUml } from './activeql-app';
import fs from 'fs';

const plantuml = require('node-plantuml');

(async () => {
  const uml = activeqlUml();

  const gen = plantuml.generate( uml, {format: 'png'});
  gen.out.pipe( fs.createWriteStream("domain.png") );
    
  // fs.writeFile('domain.plantuml', uml, (err) => {
  //   if (err) throw err;
  //   console.log( './domain.plantuml written');        
  //   // exit();
  // });

})();
