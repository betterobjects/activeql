import * as inflection from 'inflection';
import * as _ from 'lodash';

import { EntityConfigType, UiConfigType } from './admin-config';


export class AdminData { 

  /**
   *
   */
  constructor(
    public readonly data:any,
    public readonly entityConfig:EntityConfigType,
    public readonly uiConfig:UiConfigType,
    public readonly parent?:AdminData
  ){}

  get item() { return _.isArray( this.data[this.uiConfig.query] ) ? undefined : this.data[this.uiConfig.query] }
  get items() { return _.isArray( this.data[this.uiConfig.query] ) ? this.data[this.uiConfig.query] : undefined }
  get path():string { return this.entityConfig.path }
  get id():string { return _.get( this.item, 'id' ) }
  get entitiesName() { return _.get(this.entityConfig, 'entitesName' ) || inflection.humanize( this.path ) }
  get entityName() { return _.get(this.entityConfig, 'entityName' ) || inflection.humanize( inflection.singularize(this.path ) ) }


}
