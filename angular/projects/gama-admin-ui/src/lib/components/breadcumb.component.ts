import { Component, Input } from '@angular/core';

@Component({
  selector: 'admin-breadcrumb',
  template: `
    <admin-dyn-content selector="#breadcrumb">
      &nbsp; /
      <a [routerLink]="['/admin/home']">Admin</a>
      <ng-container *ngFor="let item of items">
        &nbsp;/
        <a *ngIf="item.link" [ngClass]="item.class" [routerLink]="item.link">{{item.text}}</a>
        <span *ngIf="! item.link" [ngClass]="item.class">{{item.text}}</span>
      </ng-container>
    </admin-dyn-content>
  `,
  styles: [`
    .item { font-weight: bolder; }
  `]
})
export class BreadcrumComponent {

  @Input() items:any = [];
}
