import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import _ from 'lodash';

import { FieldConfig } from '../services/admin-config.types';
import { AdminComponent } from './admin.component';

@Component({
  selector: 'admin-file-upload',
  template: `
    <div class="admin-file-upload">
      <label> {{ label( field ) }} </label>
      <div (click)="uploadFile()" class="current" *ngIf="item" [innerHTML]="field.render(item) | safe: 'html'"></div>
      <input type="file" #file (change)="onFileChange($event)" />
    </div>
  `,
  styles: [`
    .admin-file-upload { margin-top: 20px; }
    .current { margin-top: 20px; }
    label { color: rgba(0,0,0,.54); }
    :host ::ng-deep img.defaultImageRender { max-height: 100px; }
  `]
})
export class FileUploadComponent extends AdminComponent {

  @Input() item:any;
  @Input() field:FieldConfig;
  @Output() onLoad = new EventEmitter<any>();

  @ViewChild('file') file:ElementRef;

  onFileChange(event:any) {
    const file = _.get( event, 'target.files.[0]' )
    if( ! file ) return;
    this.item = undefined;
    this.onLoad.emit( {field: this.field, file: file } );
  }

  uploadFile() {
    this.file.nativeElement.click();
  }

}
