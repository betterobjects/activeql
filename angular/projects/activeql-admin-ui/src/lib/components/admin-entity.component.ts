import { OnInit, HostListener } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import * as _ from 'lodash';
import { ActionEventType, TitlePurposeType, EntityConfigType, FieldConfigType } from '../lib/admin-config';
import { AdminData } from '../lib/admin-data';
import { AdminService } from '../services/admin.service';

import { AdminComponent } from './admin.component';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogModel, ConfirmDialogComponent } from './confirm-dialog/confirm-dialog.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MessageDialogComponent } from './message-dialog/message-dialog.component';

export abstract class AdminEntityComponent extends AdminComponent implements OnInit {

  data:AdminData;
  breadcrumbs:any[] = [];

  constructor(
    protected adminService:AdminService,
    protected route:ActivatedRoute,
    protected router:Router,
    protected dialog:MatDialog,
    protected snackBar:MatSnackBar,
    protected fb:FormBuilder) { super() }


  ngOnInit() {
    this.route.data.subscribe( async (data:AdminData) => {
      this.data = _.get(data, 'data');
      this.buildBreadcrumbs();
      this.buildForm();
     });
  }

  onList = () => this.gotoList( this.data.path, this.data.parent );
  onNew = () => this.gotoNew( this.data.path, this.data.parent );
  onEdit = () =>  this.gotoEdit( this.data.path, this.data.id, this.data.parent )
  onShow = () => this.gotoShow( this.data.path, this.data.id, this.data.parent );
  onSelect = (id:string) => this.gotoShow( this.data.path, id, this.data.parent );
  onChildSelect = (id:string, path:string) => this.gotoShow( path, id, this.data );

  onChildAction = (event:ActionEventType, path:string) => {
    switch( event.action ){
      case 'edit': return this.gotoEdit( path, event.id, this.data );
      case 'delete': return this.onDelete( event.id );
    }
    if( _.isFunction( this.data.entityConfig.action ) ) this.data.entityConfig.action( event );

  }

  onAction = ( event:ActionEventType ) => {
    switch( event.action ){
      case 'edit': return this.gotoEdit( this.data.path, event.id );
      case 'delete': return this.onDelete( event.id );
    }
    if( _.isFunction( this.data.entityConfig.action ) ) this.data.entityConfig.action( event );
  }

  onDelete(id?:string) {
    if( ! id ) id = this.data.id;
    const message = `Are you sure delete this ${this.data.entityName}?`;
    const dialogData = new ConfirmDialogModel('Confirm Delete', message);
    this.dialog.open( ConfirmDialogComponent, { maxWidth: '400px', data: dialogData } ).
      afterClosed().subscribe(dialogResult => {
        dialogResult ?
          this.delete( id ) :
          this.snackBar.open('Alright', 'Nothing was deleted', {
            duration: 1000, horizontalPosition: 'center', verticalPosition: 'top',
          });
      });
  }

  private async delete( id:string ){
    const violations = await this.adminService.delete( id, this.data.entityConfig.deleteMutationName );
    if( _.size( violations ) === 0 ) return this.onDeleteSuccess();
    const message = _.join(violations, '\n');
    const dialogData = new ConfirmDialogModel('Could not delete', message);
    this.dialog.open( MessageDialogComponent, { maxWidth: '600px', data: dialogData } );
  }

  private onDeleteSuccess(){
    this.snackBar.open('Alright', `This ${this.title('show')} was deleted!`, {
      duration: 1000, horizontalPosition: 'center', verticalPosition: 'top',
    });
    setTimeout( ()=> this.onList(), 500 );
  }

  gotoList( path:string, parent?:AdminData ){
    const commands = [ path ];
    if( parent ) commands.unshift( parent.path, parent.id );
    commands.unshift( 'admin' );
    this.router.navigate( commands );
  }

  gotoShow( path:string, id:string, parent?:{id:string, path:string} ){
    const commands = [ path, 'show', id ];
    if( parent ) commands.unshift( parent.path, parent.id );
    commands.unshift( 'admin' );
    this.router.navigate( commands );
  }

  gotoEdit( path:string, id:string, parent?:AdminData ){
    const commands = [path, 'edit', id ];
    if( parent ) commands.unshift( parent.path, parent.id );
    commands.unshift( 'admin' );
    this.router.navigate( commands );
  }

  gotoNew( path:string, parent?:AdminData ){
    const commands = [path, 'new' ];
    if( parent ) commands.unshift( parent.path, parent.id );
    commands.unshift( 'admin' );
    this.router.navigate( commands );
  }

  protected buildBreadcrumbs(){
    const config = this.data.entityConfig;
    if( this.data.parent ) {
      const parentConfig = this.data.parent.entityConfig;
      this.breadcrumbs = [{
        text: this.title( 'index', parentConfig ),
        link: ['/admin', parentConfig.path]
      }, {
        text: this.name( this.data.parent.item, parentConfig ),
        link: ['/admin', parentConfig.path, 'show', this.data.parent.item.id ],
        class: 'item'
      }, {
        text: this.title( 'index', config ),
        link: ['/admin', parentConfig.path, this.data.parent.item.id, config.path]
      }];
      if( this.data.item ) {
        if( this.data.item.id ) { this.breadcrumbs.push({
          text: this.name(),
          class: 'item',
          link: [
            '/admin',
            parentConfig.path,
            this.data.parent.item.id,
            config.path,
            'show',
            this.data.item.id ]
        });
      } else {
        this.breadcrumbs.push({ text: 'New' } );
      }
    }
    } else {
      this.breadcrumbs = [
        { text: this.title('index'), link: ['/admin', config.path] }
      ];
      if( this.data.item ) {
        if( this.data.item.id ) {
          this.breadcrumbs.push({
            text: this.name(),
            class: 'item',
            link: [ '/admin', config.path, 'show', this.data.item.id ]
          });
        } else {
          this.breadcrumbs.push({ text: 'New' } );
        }
      }
    }
  }

  protected buildForm() { /* to be overwritten in create / edit */ }

  title( purpose?:TitlePurposeType, config?:EntityConfigType ):string {
    if( ! config ) config = this.data.entityConfig;
    return super.title( purpose, config );
  }

  name( item?:any, config?:EntityConfigType ){
    if( ! item ) item = this.data.item;
    if( ! config ) config = this.data.entityConfig;
    return super.name( item, config );
  }

  value( field:FieldConfigType, item?:any ){
    if( ! item ) item = this.data.item;
    return super.value( field, item );
  }

  render( field:FieldConfigType, item?:any ){
    if( ! item ) item = this.data.item;
    return super.render( field, item );
  }

  @HostListener('click', ['$event'])
  public onClick(event:any) {
    if (event.target.tagName === 'A' && _.includes(event.target.classList, 'router-link')) {
      this.router.navigate([event.target.getAttribute('href')]);
      event.preventDefault();
    }
  }

}
