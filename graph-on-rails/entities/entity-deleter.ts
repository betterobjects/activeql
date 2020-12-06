import _ from 'lodash';

import { AssocFromType } from '../core/domain-configuration';
import { EntityItem } from './entity-item';
import { EntityModule } from './entity-module';

//
//
export class DeletionError extends Error {

  constructor(message?: string) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype); // restore prototype chain
    this.name = DeletionError.name; // stack traces display correctly now
  }
}

//
//
export class EntityDeleter extends EntityModule {

  async deleteAssocFrom( id:string ) {
    const item = await this.entity.findById( id );
    // first check if any prevents - then delete
    for( const assocFrom of this.entity.assocFrom ){
      if( assocFrom.delete === 'prevent') await this.preventAssocFrom( item, assocFrom );
    }
    for( const assocFrom of this.entity.assocFrom ){
      if( assocFrom.delete === 'cascade') await this.cascadeAssocFrom( item, assocFrom );
    }
  }

  private async cascadeAssocFrom( item:EntityItem, assocFrom:AssocFromType ) {
    const items = await item.assocFrom( assocFrom.type );
    for( const i of items ) await i.delete();
  }

  private async preventAssocFrom( item:EntityItem, assocFrom:AssocFromType ) {
    const items = await item.assocFrom( assocFrom.type );
    const size = _.size( items);
    if( size > 0 ) throw new DeletionError(
      `${item.toString()} cannot be deleted - ${size} ${assocFrom.type} prevent it.`);
  }

}
