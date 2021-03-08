import _ from 'lodash';
import { activeqlTypes, activeqlUml } from './activeql-app';
import { exit } from 'process';
import fs from 'fs';
import path from 'path';

const plantuml = require('node-plantuml');

const uml = async () => {
  const uml = activeqlUml();
  const gen = plantuml.generate( uml, {format: 'png'});
  gen.out.pipe( fs.createWriteStream("domain.png") );
}

const types = async () => {
  const file = path.join('activeql', 'impl', 'activeql-types.ts' )
  const types = await activeqlTypes();
  fs.writeFile( file, types, (err) => {
    if (err) throw err;
    console.info( `./${file} written`);
  });
}

(async () => {
  let commands = process.argv.slice(2);
  if( _.isEmpty( commands ) ) commands = ['uml', 'types'];
  for( let command of commands ){
    if( command === 'uml' ) await uml();
    if( command === 'types' ) await types();
  }
})();
