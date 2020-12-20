import { Component } from '@angular/core';

import { AdminActionComponent } from '../admin-action.component';

@Component({
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.scss']
})
export class IndexComponent extends AdminActionComponent {

  onSelect( event:string ){
    const link = [this.adminConfigService.adminLinkPrefix, this.config.path, 'show', event];
    console.log( {link} )
    this.router.navigate( link );
  }
  onAction( event:any ){ console.log( 'onAction', event ) }
}
