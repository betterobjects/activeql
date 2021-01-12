import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import _ from 'lodash';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  template: `
    <h1>Error</h1>
    <hr>
    <ul><li *ngFor="let message of messages">{{ message }}</li></ul>
  `,
})
export class ErrorComponent implements OnInit {

  state$: Observable<any>;
  messages:string[] = [];

  constructor(
    private activatedRoute:ActivatedRoute,
    private router:Router
     ){}

  ngOnInit() {
    this.state$ = this.activatedRoute.paramMap.pipe(map(() => window.history.state));
    this.state$.subscribe( data => data.error ?
      this.messages = _.isArray( data.error ) ? data.error : [data.error] :
      this.router.navigateByUrl('/') );
  }


}
