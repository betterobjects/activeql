import inflection from 'inflection';
import _ from 'lodash';
import { EntityViewConfig } from './admin-config.service';
import { EntityType } from './domain-configuration';



export class AdminData { 

  /**
   *
   */
  constructor(
    public readonly data:any,
    public readonly entityConfig:EntityType,
    public readonly uiConfig:EntityViewConfig,
    public readonly parent?:AdminData
  ){}

  // get item() { return _.isArray( this.data[this.uiConfig.query] ) ? undefined : this.data[this.uiConfig.query] }
  // get items() { return _.isArray( this.data[this.uiConfig.query] ) ? this.data[this.uiConfig.query] : undefined }
  // get path():string { return this.entityConfig.path }
  // get id():string { return _.get( this.item, 'id' ) }
  // get entitiesName() { return _.get(this.entityConfig, 'entitesName' ) || inflection.humanize( this.path ) }
  // get entityName() { return _.get(this.entityConfig, 'entityName' ) || inflection.humanize( inflection.singularize(this.path ) ) }


}
