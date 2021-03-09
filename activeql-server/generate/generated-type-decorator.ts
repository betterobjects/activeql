import { Entity } from '../entities/entity';
import _ from 'lodash';
import { ActiveQLServer } from '../activeql-server';

export class GeneratedTypeDecorator { 

  static decorateAssocs( entity:Entity, items:any ){
    if( _.isNil( items ) ) return undefined;
    const isArray = _.isArray( items );
    if( ! isArray ) items = [items];

    _.forEach( items, item => {
      _.forEach( entity.assocTo, assocTo => {
        const assocEntity:Entity = ActiveQLServer.runtime?.entity( assocTo.type ) as Entity;
        const foreignKey = _.get( item, assocEntity?.foreignKey );
        _.set( item, assocEntity?.typeQueryName, () => assocEntity?.findById( foreignKey ));
      });

      _.forEach( entity.assocToMany, assocToMany => {
        const assocEntity:Entity = ActiveQLServer.runtime?.entity( assocToMany.type ) as Entity;
        const foreignKeys = _.get( item, assocEntity?.foreignKeys );
        _.set( item, assocEntity?.typesQueryName, () => assocEntity?.findByIds( foreignKeys ));
      });

      _.forEach( entity.assocFrom, assocFrom => {
        const assocEntity:Entity = ActiveQLServer.runtime?.entity( assocFrom.type ) as Entity;
        const query = _.set( {}, entity.foreignKey, item.id );
        _.set( item, assocEntity?.typesQueryName, () => assocEntity?.findByAttribute( query ));
      });

      _.set( item, 'save', async () => this.decorateAssocs( entity, await entity.accessor.save( item )) );
    });

    return isArray ? items : _.first( items );
  }
}
