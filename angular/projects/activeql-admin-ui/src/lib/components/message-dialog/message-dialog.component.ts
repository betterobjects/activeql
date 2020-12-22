import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Component, Inject } from '@angular/core';

@Component({
  templateUrl: './message-dialog.component.html',
  styleUrls: ['./message-dialog.component.scss']
})
export class MessageDialogComponent {

  title:string;
  message:string;

  constructor(
      public dialogRef:MatDialogRef<MessageDialogComponent>,
      @Inject(MAT_DIALOG_DATA) public data:MessageDialogModel) {
    this.title = data.title;
    this.message = data.message;
  }

  onClose():void {
    this.dialogRef.close(true);
  }

}

/**
 * Class to represent message dialog model.
 *
 * It has been kept here to keep it as part of shared component.
 */
export class MessageDialogModel {

  constructor(public title:string, public message:string) {
  }
}
