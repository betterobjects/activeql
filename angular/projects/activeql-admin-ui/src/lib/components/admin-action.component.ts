import { ActivatedRoute, Router } from '@angular/router';
import _ from 'lodash';

import { AdminConfigService, EntityViewType, ParentType } from '../services/admin-config.service';
import { AdminComponent } from './admin.component';

export class AdminActionComponent extends AdminComponent {

  data:any;
  config:EntityViewType;
  parent:ParentType;
  id:string;

  get path() { return this.config.path }
  get items() { return _.get( this.data, [this.config.entity.typesQueryName]) }
  get item() { return _.get( this.data, [this.config.entity.typeQueryName]) }
  get parentItem() { return _.get( this.data, [this.parent.viewType.entity.typeQueryName ]) }

  constructor(
    protected route:ActivatedRoute,
    protected router:Router,
    protected adminConfigService:AdminConfigService ){ super() }

  ngOnInit() {
    this.route.params.subscribe( (params:any) => {
      const parentPath = params['parent'];
      const parentId = params['parentId'];
      if( parentPath && parentId ) this.parent = {
        viewType: this.adminConfigService.getEntityView( parentPath ), id: parentId };
      this.config = this.adminConfigService.getEntityView( params.path );
      this.id = params['id'];
      this.route.data.subscribe( async (data:any) => this.data = data.data);
    });
  }

  goto( viewType:EntityViewType, id?:string, parent?:ParentType ){
    const link = this.getViewTypeLink( viewType, id, parent );
    this.router.navigate( link );
  }

  getViewTypeLink( viewType:EntityViewType, id?:string, parent?:ParentType ){
    const link = [viewType.path ];
    if( id ) link.push( 'show', id)
    if( parent ) link.unshift( parent.viewType.path, parent.id );
    link.unshift( this.adminConfigService.adminLinkPrefix );
    return link;
  }

  onList() { this.router.navigate( this.adminConfigService.itemsLink( this.config.entity )) }
  onNew() { console.log( 'onNew' ) }
  onEdit() { console.log( 'onEdit' ) }
  onDelete() { console.log( 'onDelete' ) }


}
