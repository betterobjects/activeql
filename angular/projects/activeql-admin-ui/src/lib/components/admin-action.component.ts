import _ from 'lodash';
import { ActivatedRoute, Router } from "@angular/router";
import { AdminConfigService, EntityViewType } from "../lib/admin-config.service";
import { AdminComponent } from './admin.component';
import { config } from 'rxjs';

export class AdminActionComponent extends AdminComponent {

  data:any;
  config:EntityViewType;
  parentConfig:EntityViewType;

  get items() { return _.get( this.data, [this.config.entity.typesQueryName]) }
  get item() { return _.get( this.data, [this.config.entity.typeQueryName]) }

  constructor(
    protected route:ActivatedRoute,
    protected router:Router,
    protected adminConfigService:AdminConfigService ){ super() }

  ngOnInit() {
    this.route.params.subscribe( (params:any) => {
      const path = params.path;
      this.config = this.adminConfigService.getEntityView( path );
      this.route.data.subscribe( async (data:any) => this.data = data.data);
    });
  }

  onList() { this.router.navigate( this.adminConfigService.itemsLink( this.config.entity )) }
  onNew() { console.log( 'onNew' ) }
  onEdit() { console.log( 'onEdit' ) }
  onDelete() { console.log( 'onDelete' ) }


}
