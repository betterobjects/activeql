import _ from 'lodash';
import inflection from 'inflection';
import { Component, OnInit } from '@angular/core';
import { AdminService, EntityConfigType } from 'activeql-admin-ui';

import {Event,
NavigationCancel,
NavigationEnd,
NavigationError,
NavigationStart,
Router
} from '@angular/router';
import { LoginService } from 'src/app/services/login.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit{

  loading = false;
  isCollapsed = false;
  entities:EntityConfigType[]

  get user() { return this.loginService.user }

  constructor(
    private router:Router,
    private adminService:AdminService,
    private loginService:LoginService
  ) {}

  ngOnInit(){
    this.entities = this.adminService.getMenuEntities();
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
        default: {
          break;
        }
      }
    });
  }

  login(){
    this.router.navigate(['/login']);
  }

  title( entity:EntityConfigType ):string {
    if( _.isFunction( entity.title ) ) return entity.title();
    if( _.isString( entity.title ) ) return entity.title;
    return inflection.humanize( entity.path );
  }
}
