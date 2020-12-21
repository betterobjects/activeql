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
      _.filter( this.config.index.fields, field => field.name !== this.parent.viewType.name ) :
      this.config.index.fields;
  }

  onSelect( event:string ){
    const link = this.adminConfigService.itemLink( this.config.entity, event, this.parent )
    this.router.navigate( link );
  }

  onAction( event:any ){ console.log( 'onAction', event ) }
}
