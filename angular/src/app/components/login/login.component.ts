import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { LoginService } from 'src/app/services/login.service';

@Component({
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  failed = 0;
  error:any = undefined;

  constructor(
    protected snackBar:MatSnackBar,
    private router:Router,
    private loginService:LoginService ) {}

  ngOnInit() {
  }

  async login( username:any, password:any ){
    this.error = undefined;
    try {
      if( await this.loginService.login( username.value, password.value ) ) return this.router.navigate(['/welcome']);
    } catch (error) {
      this.error = error;
      this.snackBar.open('Error', 'Error while attempt to login', {
        duration: 2000, horizontalPosition: 'center', verticalPosition: 'top',
      });
    }
    this.failed++;
  }

}
