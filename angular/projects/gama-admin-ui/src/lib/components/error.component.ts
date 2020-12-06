import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  template: `
    <h1>Error</h1>
    <hr>
    {{ error }}
  `,
})
export class ErrorComponent implements OnInit {

  state$: Observable<any>;
  error:any;

  constructor( private activatedRoute:ActivatedRoute ){}

  ngOnInit() {
    this.state$ = this.activatedRoute.paramMap.pipe(map(() => window.history.state));
    this.state$.subscribe( data => this.error = data.error );
  }

}
