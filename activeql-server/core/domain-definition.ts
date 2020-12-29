import fs from 'fs-extra';
import _ from 'lodash';
import path from 'path';
import YAML from 'yaml';

import { Entity } from '../entities/entity';
import { DomainConfiguration, DomainConfigurationType } from './domain-configuration';
import { DomainConfigurationResolver } from './domain-configuration-resolver';
import { Runtime } from './runtime';

export class DomainDefinition {

  readonly entities:Entity[] = [];
  readonly extendSchemaFn:((runtime:Runtime) => void)[] = []
  readonly contextFn:((expressContext:any, apolloContext:any) => void)[] = [];
  private configuration:DomainConfiguration;

  constructor( configOrconfigFolder?:DomainConfiguration|string|string[] ){
    this.configuration = _.isUndefined( configOrconfigFolder ) ? {} :
      _.isString( configOrconfigFolder ) || _.isArray( configOrconfigFolder) ?
        new FileConfiguration( configOrconfigFolder ).getConfiguration() :
        configOrconfigFolder;
  }

  add( configuration:DomainConfiguration ):void {
    _.merge( this.configuration, configuration );
  }

  getConfiguration():DomainConfiguration {
    return this.configuration;
  }

  getResolvedConfiguration( seeds = true, customQueriesMutations:boolean|'src' = true ):DomainConfigurationType {
    const resolver = new DomainConfigurationResolver( this.configuration, seeds, customQueriesMutations );
    resolver.resolve();
    return resolver.resolvedConfiguration;
  }
}

class FileConfiguration {

  constructor( private configFolder?:string|string[] ){
    if( _.isString( configFolder) ) this.configFolder = [configFolder];
  }

  /**
   *
   */
  getConfiguration():DomainConfiguration {
    const configuration:DomainConfiguration = {};
    _.forEach( this.configFolder, folder => {
      const files = this.getConfigFiles( folder );
      _.forEach( files, file => _.merge( configuration, this.parseConfigFile( configuration, folder, file ) ) );
    });
    return configuration;
  }

  /**
   *
   */
  private getConfigFiles( folder:string ):string[] {
    try {
      return _.filter( fs.readdirSync( folder ), file => this.isConfigFile(file) );
    } catch (error) {
      console.error( `cannot read files from folder '${folder}'`, error );
      return [];
    }
  }

  /**
   *
   */
  private isConfigFile( file:string ):boolean {
    const extension = _.toLower( path.extname( file ));
    return _.includes( ['.yaml', '.yml'], extension );
  }

  /**
   *
   */
  private parseConfigFile( configs:any, folder:string, file:string ):any {
    try {
      file = path.join( folder, file );
      const content = fs.readFileSync( file).toString();
      const config = YAML.parse(content);
      return config;
    } catch ( error ){
      console.warn( `Error parsing file [${file}]:`, error );
    }
  }

}
