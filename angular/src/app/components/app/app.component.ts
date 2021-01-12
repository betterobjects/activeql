import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Event, NavigationCancel, NavigationEnd, NavigationError, NavigationStart, Router } from '@angular/router';
import {
  AdminConfigService,
  AdminDataService,
  ConfirmDialogComponent,
  ConfirmDialogModel,
  EntityViewType,
} from 'activeql-admin-ui';
import _ from 'lodash';
import { LoginService } from 'src/app/services/login.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit{

  loading = false;
  entities:EntityViewType[] = [];
  networkError = false;
  user:any = undefined;

  constructor(
    private router:Router,
    protected dialog:MatDialog,
    protected snackBar:MatSnackBar,
    private adminConfig:AdminConfigService,
    private adminData:AdminDataService,
    private loginService:LoginService
  ) {}

  ngOnInit(){
    this.onLoginStatus();
    this.loginService.loginStatus.subscribe(()=> this.onLoginStatus() );
    this.router.events.subscribe((event:Event) => {
      switch (true) {
        case event instanceof NavigationStart: {
          this.loading = true;
          break;
        }
        case event instanceof NavigationEnd:
        case event instanceof NavigationCancel:
        case event instanceof NavigationError: {
          this.loading = false;
          break;
        }
      }
    });
  }

  logout(){
    const message = `Are you sure?`;
    const dialogData = new ConfirmDialogModel('Confirm Logout', message);
    this.dialog.open( ConfirmDialogComponent, { minWidth: '400px', maxWidth: '400px', data: dialogData } ).
      afterClosed().subscribe(dialogResult => {
        dialogResult ?
          this.doLogout() :
          this.snackBar.open('Alright', 'Logout aborted', {
            duration: 1000, horizontalPosition: 'center', verticalPosition: 'top',
          });
      });
  }

  seed(){
    const message = `Are you sure to delete all existing data and fill DataStore with Seed-Data?`;
    const dialogData = new ConfirmDialogModel('Confirm Seed', message);
    this.dialog.open( ConfirmDialogComponent, { minWidth: '400px', maxWidth: '400px', data: dialogData } ).
      afterClosed().subscribe(dialogResult => {
        dialogResult ?
          this.doSeed() :
          this.snackBar.open('Alright', 'Nothing was deleted or seeded', {
            duration: 1000, horizontalPosition: 'center', verticalPosition: 'top',
          });
      });
  }

  private async doSeed(){
    this.snackBar.open('Seed', 'Seed started', {
      duration: 1000, horizontalPosition: 'center', verticalPosition: 'top' });
    const messages = await this.adminData.seed();
    const dialogData = new ConfirmDialogModel('Seed executed', _.join(messages, '<br>'), 'ok');
    this.dialog.open( ConfirmDialogComponent, { minWidth: '400px', data: dialogData } );
  }

  private doLogout(){
    this.loginService.logout();
    this.snackBar.open('Alright', `You're logged out`, {
      duration: 1000, horizontalPosition: 'center', verticalPosition: 'top',
    });
}

  login(){
    this.router.navigate(['/login']);
  }

  private onLoginStatus(){
    this.user = this.loginService.user;
    this.networkError = this.adminConfig.networkError;
    this.entities = this.user ?
      this.adminConfig.getEntities() :
      _.filter( this.adminConfig.getEntities(), entity => _.isNil( entity.entity.permissions ) );
  }

}
