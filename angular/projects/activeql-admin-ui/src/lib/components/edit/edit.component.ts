import { Component } from '@angular/core';
import { Subject } from 'rxjs';
import { AdminActionComponent } from '../admin-action.component';

@Component({
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss']
})
export class EditComponent extends AdminActionComponent {

  submit = new Subject<any>();

  onSave = () => this.submit.next();
  onSuccess = (event:any) => {
    this.snackBar.open('Alright', `${this.viewType.itemTitle() } ${this.viewType.itemName(this.item) } was successfully updated!`, {
      duration: 1000, horizontalPosition: 'center', verticalPosition: 'top',
    });
    setTimeout( ()=> this.onShow( this.viewType, event ), 200 );
  }

}
