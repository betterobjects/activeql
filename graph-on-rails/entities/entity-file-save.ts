import inflection from 'inflection';
import fs from 'fs-extra';
import _ from 'lodash';
import path from 'path';

import { EntityModule } from './entity-module';


export type FileInfo = {
  name:string
  filename:string
  stream:any
  secret:string
}

//
//
export class EntityFileSave extends EntityModule {

  saveFile( id:string, fileInfo:FileInfo ):Promise<void> {
    return new Promise( async (resolve, reject) => {
      const dirname = [
        this.runtime.config.uploadRootDir as string,
        fileInfo.secret,
        this.entity.typeName,
        _.toString(id),
        fileInfo.name ];
      await fs.mkdirp( path.join(...dirname) );
      const filename = path.join( ...dirname, fileInfo.filename );
      const data = await this.getData( fileInfo.stream );
      fs.writeFile( filename, data, (error) => error ? reject( error ) : resolve() );
    });
  }

  deleteFiles( id:string ):Promise<void> {
    return new Promise( async (resolve, reject) => {
      const dirPath = path.join(
        this.runtime.config.uploadRootDir as string,
        this.entity.typeName,
        _.toString(id) );
      fs.remove( dirPath, err => err ? reject( err ) : resolve() );
    });

  }

  sanitizeFilename( filename:string ):string {
    if( ! filename ) return 'no-name-given';
    filename = filename.replace('#', '-' );
    return inflection.dasherize( filename );
  }

  getData( stream:any ):Promise<Buffer>{
    return new Promise(resolve => {
      const data:any[] = [];
      stream.on('data', (chunk:any) => data.push(chunk) );
      stream.on('end', () => resolve( Buffer.concat(data) ) );
    });
  }
}
