import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import _ from 'lodash';

import { AdminConfigService, EntityViewType, ParentType } from '../services/admin-config.service';
import { AdminDataService } from '../services/admin-data.service';
import { AdminComponent } from './admin.component';
import { ConfirmDialogComponent, ConfirmDialogModel } from './confirm-dialog/confirm-dialog.component';
import { MessageDialogComponent } from './message-dialog/message-dialog.component';

export class AdminActionComponent extends AdminComponent {

  data:any;
  viewType:EntityViewType;
  parent:ParentType;
  id:string;

  get path() { return this.viewType.path }
  get items() { return _.get( this.data, [this.viewType.entity.typesQueryName]) }
  get item() { return _.get( this.data, [this.viewType.entity.typeQueryName]) }
  get parentItem() { return _.get( this.data, [this.parent.viewType.entity.typeQueryName ]) }

  constructor(
    protected route:ActivatedRoute,
    protected router:Router,
    protected dialog:MatDialog,
    protected snackBar:MatSnackBar,
    private adminDataService:AdminDataService,
    protected adminConfigService:AdminConfigService ){ super() }

  ngOnInit() {
    this.route.params.subscribe( (params:any) => {
      const parentPath = params['parent'];
      const parentId = params['parentId'];
      if( parentPath && parentId ) this.parent = {
        viewType: this.adminConfigService.getEntityView( parentPath ), id: parentId };
      this.viewType = this.adminConfigService.getEntityView( params.path );
      this.id = params['id'];
      this.route.data.subscribe( async (data:any) => this.data = data.data);
    });
  }

  goto( viewType:EntityViewType, id?:string, parent?:ParentType, action?:string ){
    const link = this.viewTypeLink( viewType, id, parent, action );
    this.router.navigate( link );
  }

  viewTypeLink( viewType:EntityViewType, id?:string, parent?:ParentType, action?:string ){
    const link = [viewType.path ];
    if( action ) link.push( action );
    if( id ) link.push( id );
    if( parent ) link.unshift( parent.viewType.path, parent.id );
    link.unshift( this.adminConfigService.adminLinkPrefix );
    return link;
  }

  onShow( viewType = this.viewType, id = this.id, parent = this.parent ) { this.goto( viewType, id, parent, 'show') }
  onList(viewType = this.viewType, parent = this.parent ) { this.goto( viewType, null, parent ) }
  onNew( viewType = this.viewType, parent = this.parent ) { this.goto( viewType, null, parent, 'new') }
  onEdit( viewType = this.viewType, id = this.id, parent = this.parent ) { this.goto( viewType, id, parent, 'edit') }

  onDelete(viewType = this.viewType, item = this.item, parent = this.parent) {
    const message = `Are you sure to delete ${viewType.itemTitle()} "${viewType.itemName(item)}"?`;
    const dialogData = new ConfirmDialogModel('Confirm Delete', message);
    this.dialog.open( ConfirmDialogComponent, { maxWidth: '400px', data: dialogData } ).
      afterClosed().subscribe(dialogResult => {
        dialogResult ?
          this.doDelete( viewType, item.id ) :
          this.snackBar.open('Alright', 'Nothing was deleted', {
            duration: 1000, horizontalPosition: 'center', verticalPosition: 'top',
          });
      });
  }

  private async doDelete( viewType:EntityViewType, id:string ){
    const violations = await this.adminDataService.delete( id, this.viewType.entity );
    if( _.size( violations ) === 0 ) return this.onDeleteSuccess( viewType );
    const message = _.join(violations, '\n');
    const dialogData = new ConfirmDialogModel('Could not delete', message);
    this.dialog.open( MessageDialogComponent, { maxWidth: '600px', data: dialogData } );
  }

  private onDeleteSuccess( viewType:EntityViewType ){
    this.snackBar.open('Alright', `This ${viewType.itemTitle()} was deleted!`, {
      duration: 1000, horizontalPosition: 'center', verticalPosition: 'top',
    });
    setTimeout( ()=> this.onList(), 500 );
  }

}
