import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Component, Inject } from '@angular/core';

@Component({
  templateUrl: './confirm-dialog.component.html',
  styleUrls: ['./confirm-dialog.component.scss']
})
export class ConfirmDialogComponent {

  title:string;
  message:string;
  kind:ConfirmKind;


  constructor(
      public dialogRef:MatDialogRef<ConfirmDialogComponent>,
      @Inject(MAT_DIALOG_DATA) public data:ConfirmDialogModel) {
    this.title = data.title;
    this.message = data.message;
    this.kind = data.kind;
  }

  onConfirm():void {
    this.dialogRef.close(true);
  }

  onDismiss():void {
    this.dialogRef.close(false);
  }
}

export type ConfirmKind = 'yesno'|'ok';

/**
 * Class to represent confirm dialog model.
 *
 * It has been kept here to keep it as part of shared component.
 */
export class ConfirmDialogModel {

  constructor( public title:string, public message:string, public kind:ConfirmKind = 'yesno' ) { }
}
