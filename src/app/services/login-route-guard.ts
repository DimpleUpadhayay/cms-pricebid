import { CanActivate } from '@angular/router';
import { Injectable } from '@angular/core';
import { LoginService } from './login.service';
import { Router } from '@angular/router';
@Injectable()
export class LoginRouteGuard implements CanActivate {

  constructor(private loginService: LoginService,public router:Router) {}

  canActivate() {
    if(!this.loginService.isLoggedIn()){
      this.router.navigate(["/login"]);
    }else{
      return true;
    }
  }
}