import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Event, NavigationCancel, NavigationEnd, NavigationError, NavigationStart, Router } from '@angular/router';
import { AdminConfigService, ConfirmDialogComponent, ConfirmDialogModel, EntityViewType } from 'activeql-admin-ui';
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

  get user() { return this.loginService.user }

  constructor(
    private router:Router,
    protected dialog:MatDialog,
    protected snackBar:MatSnackBar,
    private adminConfig:AdminConfigService,
    private loginService:LoginService
  ) {}

  ngOnInit(){
    this.setEntities();
    this.loginService.loginStatus.subscribe(()=> this.setEntities());
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

  logout1() {
    if( confirm('Are you sure, you want to log-out?') ) this.loginService.logout();
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

  private doLogout(){
    this.loginService.logout();
    this.snackBar.open('Alright', `You're logged out`, {
      duration: 1000, horizontalPosition: 'center', verticalPosition: 'top',
    });
}

  login(){
    this.router.navigate(['/login']);
  }

  private setEntities(){
    this.entities = _.values( this.adminConfig.entityViewTypes  );
    if( ! this.user ) this.entities = _.filter( this.entities, entity => _.isNil( entity.entity.permissions ) );
  }
}
