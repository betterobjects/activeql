import fs from 'fs';

import { activeqlUml } from './activeql-app';

const plantuml = require('node-plantuml');

(async () => {
  const uml = activeqlUml();
  const gen = plantuml.generate( uml, {format: 'png'});
  gen.out.pipe( fs.createWriteStream("domain.png") );
})();
