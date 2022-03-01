import { CanActivate } from '@angular/router';
import { Injectable } from '@angular/core';
import { PermissionService } from './permission.service';
import { Router } from '@angular/router';
@Injectable()
export class AdminRouteGuard implements CanActivate {

  constructor(private checkPermissionService: PermissionService,public router:Router) {}

  canActivate() {
    let validate;
    if(this.checkPermissionService.isAdminUser()){
      validate = true;
    }else{
      validate = false;
    }
    return validate;
  }
}