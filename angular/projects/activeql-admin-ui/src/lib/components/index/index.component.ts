import _ from 'lodash';
import { Component } from '@angular/core';

import { AdminActionComponent } from '../admin-action.component';

@Component({
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.scss']
})
export class IndexComponent extends AdminActionComponent {

  indexFields() {
    return this.parent ?
      _.filter( this.viewType.index.fields, field => field.name !== this.parent.viewType.name ) :
      this.viewType.index.fields;
  }

  onSelect( event:string ){
    const link = this.adminConfigService.itemLink( this.viewType.entity, event, this.parent )
    this.router.navigate( link );
  }

  onAction( event:any ){
    if( event.action === 'edit' ) return this.onEdit( this.viewType, event.item.id );
    if( event.action === 'delete' ) return this.onDelete( this.viewType, event.item );
  }
}
