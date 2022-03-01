import { Injectable } from '@angular/core';
import { HttpService } from './http.service';

@Injectable()
export class PermissionService  {
	constructor(private _httpService: HttpService ) {}
	isAdminUser(){
		let userType = JSON.parse(localStorage.getItem('user')).data.user.user_role;
		if(userType == "COMPANY_ADMIN"){
			return true;
		}else{
			return false;
		}
	}

	isCustomUser(){
        let userType = JSON.parse(localStorage.getItem('user')).data.user.user_role;
		if(userType == "CUSTOM"){
			return true;
		}else{
			return false;
		}
	}

	isSupportUser(){
        let userType = JSON.parse(localStorage.getItem('user')).data.user.user_role;
		if(userType == "SUPPORT"){
			return true;
		}else{
			return false;
		}
	}
}