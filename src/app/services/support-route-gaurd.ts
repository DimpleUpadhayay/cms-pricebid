import { CanActivate } from '@angular/router';
import { Injectable } from '@angular/core';
import { PermissionService } from './permission.service';
import { Router } from '@angular/router';
@Injectable()

export class SupportRouteGaurd implements CanActivate {

    constructor(private checkPermissionService: PermissionService, public router: Router) { }

    canActivate() {
        let validate;
        if (this.checkPermissionService.isSupportUser()) {
            validate = true;
        } else {
            this.router.navigate(['/login'])
            validate = false
        }

        return validate;
        
    }
}