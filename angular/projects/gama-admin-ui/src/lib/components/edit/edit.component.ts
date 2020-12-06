import { Component } from '@angular/core';

import { AdminEntityComponent } from '../admin-entity.component';
import { Subject } from 'rxjs';

@Component({
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss']
})
export class EditComponent extends AdminEntityComponent {

  submit = new Subject<any>();

  onSave = () => this.submit.next();
  onSuccess = () => {
    this.snackBar.open('Alright', `This ${this.title() } was successfully updated!`, {
      duration: 1000, horizontalPosition: 'center', verticalPosition: 'top',
    });
    setTimeout( ()=> this.onShow(), 200 );
  }

}
