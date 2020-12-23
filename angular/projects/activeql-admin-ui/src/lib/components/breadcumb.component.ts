import { Component, Input } from '@angular/core';

@Component({
  selector: 'admin-breadcrumb',
  template: `
    <admin-dyn-content selector="#breadcrumb">
      <div class="breadcrumb">
        <a [routerLink]="['/']">Home</a>
        <ng-container *ngFor="let item of items">
          &nbsp;/
          <a *ngIf="item.link" [ngClass]="item.class" [routerLink]="item.link">{{item.text}}</a>
          <span *ngIf="! item.link" [ngClass]="item.class">{{item.text}}</span>
        </ng-container>
      </div>
    </admin-dyn-content>
  `,
  styles: [`
    .breadcrumb { padding: 1em; }
    .name { font-style: italic; }
    .item { font-weight: bolder; }
    a { text-decoration: none; }
  `]
})
export class BreadcrumComponent {

  @Input() items:any = [];
}
