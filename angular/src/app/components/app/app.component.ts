import _ from 'lodash';
import inflection from 'inflection';
import { Component, OnInit } from '@angular/core';
// import { AdminService, EntityConfigType } from 'activeql-admin-ui';

import {Event,
NavigationCancel,
NavigationEnd,
NavigationError,
NavigationStart,
Router
} from '@angular/router';
import { LoginService } from 'src/app/services/login.service';
import { AdminConfigService, EntityViewType } from 'activeql-admin-ui';

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

  logout() {
    if( confirm('Are you sure, you want to log-out?') ) this.loginService.logout();
  }

  login(){
    this.router.navigate(['/login']);
  }

  private setEntities(){
    this.entities = _.values( this.adminConfig.entityViewTypes  );
    if( ! this.user ) this.entities = _.filter( this.entities, entity => _.isNil( entity.entity.permissions ) );
  }
}
