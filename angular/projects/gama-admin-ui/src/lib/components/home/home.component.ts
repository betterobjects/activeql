import { Component, Input } from '@angular/core';
import { AdminService } from '../../services/admin.service';
import { EntityConfigType } from '../../lib/admin-config';
import { AdminComponent } from '../admin.component';
import { ConfirmDialogModel } from '../confirm-dialog/confirm-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { MessageDialogComponent } from '../message-dialog/message-dialog.component';

@Component({
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent extends AdminComponent {

  entities:EntityConfigType[]

  constructor( private adminService:AdminService, private dialog:MatDialog ) { super() }

  ngOnInit(){
    this.entities = this.adminService.getMenuEntities();
  }

  async onSeed(){
    const result = await this.adminService.seed();
    const message = `Seeded: ${result}`;
    const dialogData = new ConfirmDialogModel('Seed', message);
    this.dialog.open( MessageDialogComponent, { maxWidth: '600px', data: dialogData } );
  }

  fields = ( entity:EntityConfigType ) => Object.values( entity.fields )
}
