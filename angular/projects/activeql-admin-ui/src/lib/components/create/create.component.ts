import { Component } from '@angular/core';
import { Subject } from 'rxjs';
import { AdminActionComponent } from '../admin-action.component';


@Component({
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.scss']
})
export class CreateComponent extends AdminActionComponent {

  submit = new Subject<any>();

  onSave = () => this.submit.next();
  onSuccess = ( id:string ) => {
    // this.snackBar.open('Alright', `This ${this.title() } was successfully created!`, {
    //   duration: 1000, horizontalPosition: 'center', verticalPosition: 'top',
    // });
    // setTimeout( ()=> this.gotoShow( this.data.path, id, this.data.parent ), 200 );
  }

}
