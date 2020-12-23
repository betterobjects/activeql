import { Component } from '@angular/core';
import _ from 'lodash';

import { FieldConfig, UiAssocFromConfig } from '../../services/admin-config.service';
import { AdminActionComponent } from '../admin-action.component';

@Component({
  templateUrl: './show.component.html',
  styleUrls: ['./show.component.scss']
})
export class ShowComponent extends AdminActionComponent  {

  action() { return 'show' }

  get fields() {
    return this.parent ?
      _.filter(this.viewType.show.fields, field =>
        ! (field.type === 'assocTo' && field.name === this.parent.viewType.name ) ) :
      this.viewType.show.fields
  }

  onSelect( assocFrom:UiAssocFromConfig ){
    const viewType = this.adminConfigService.getEntityViewByName( assocFrom.entity );
    return (id:string) => this.onShow( viewType, id, { viewType: this.viewType, id: this.id} );
  }

  onAction( assocFrom:UiAssocFromConfig ){
    return ({item,action}) => {
      const viewType = this.adminConfigService.getEntityViewByName( assocFrom.entity );
      if( action === 'edit') return this.onEdit( viewType, item.id, { viewType: this.viewType, id: this.id } );
      if( action === 'delete') return this.onDelete( viewType, item, { viewType: this.viewType, id: this.id } );
    }
  }

  assocFromFields( assocFrom:UiAssocFromConfig ){
    return _.filter( assocFrom.fields, (field:FieldConfig) => field.name !== this.viewType.name );
  }

  assocFromItems( assocFrom:UiAssocFromConfig ){
    const entity = _.get( this.adminConfigService.domainConfiguration, ['entity', assocFrom.entity] );
    return _.get( this.item, entity.typesQueryName );
  }

  assocFromTitle( assocFrom:UiAssocFromConfig ){
    const config = this.adminConfigService.getEntityViewByName( assocFrom.entity );
    return config.listTitle();
  }

  onAssocFromIndex( assocFrom:UiAssocFromConfig ){
    const viewType = this.adminConfigService.getEntityViewByName( assocFrom.entity );
    this.viewTypeLink( viewType, null, { viewType: this.viewType, id: this.id } );
  }

  onAssocFromNew( assocFrom:UiAssocFromConfig ) {
    const viewType = this.adminConfigService.getEntityViewByName( assocFrom.entity );
    this.goto( viewType, null, { viewType: this.viewType, id: this.id }, 'new' );
  }

  onAttributeClick( event:any ):void {
    const url = _.get( event, 'srcElement.currentSrc' );
    if( url ) window.open( url, '_blank' );
  }
}
