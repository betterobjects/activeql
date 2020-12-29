import { Component } from '@angular/core';

import { AdminConfigService } from '../../services/admin-config.service';

@Component({
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.scss']
})
export class IndexComponent //extends AdminEntityComponent {
{

  constructor( private adminConfigService:AdminConfigService ){
    const entityConfig = adminConfigService.getEntityView( 'Car' );
    console.log( entityConfig );
    console.log( adminConfigService.adminConfig, adminConfigService.entityViewTypes );
  }

}
