import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoginService } from 'src/app/services/login.service';

@Component({
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  failed = 0;

  constructor( private router:Router, private loginService:LoginService ) {}

  ngOnInit() {
  }

  async login( username:any, password:any ){
    if( await this.loginService.login( username.value, password.value ) ) return this.router.navigate(['/welcome']);
    this.failed++;
  }

}
