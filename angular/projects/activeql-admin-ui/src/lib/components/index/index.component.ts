import _ from 'lodash';
import { Component } from '@angular/core';
import { ActivatedRoute, ActivatedRouteSnapshot } from '@angular/router';

import { AdminConfigService, EntiyViewType } from '../../lib/admin-config.service';

@Component({
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.scss']
})
export class IndexComponent //extends AdminEntityComponent {
{
  config:EntiyViewType;
  items:any[] = []

  constructor(
    protected route:ActivatedRoute,
    private adminConfigService:AdminConfigService ){
    const entityConfig = adminConfigService.getEntityView( 'Car' );
    console.log( entityConfig );
    console.log( adminConfigService.adminConfig, adminConfigService.entityViewTypes );
  }

  ngOnInit() {
    this.route.params.subscribe( (params:any) => {
      const path = params.path;
      this.config = this.adminConfigService.getEntityView( path );
      this.route.data.subscribe( async (data:any) => {
        this.items = _.get( data, ['data', this.config.entity.typesQueryName]);
      });
    });
  }

  onSelect( event:any ){ console.log( 'onSelect', event ) }
  onAction( event:any ){ console.log( 'onAction', event ) }
}
