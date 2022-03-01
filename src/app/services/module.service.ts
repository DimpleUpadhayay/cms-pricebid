import { Injectable } from '@angular/core';
import { HttpService } from './http.service';
import { Router } from '@angular/router';

@Injectable()
export class AppModuleService {
	constructor(private _httpService: HttpService, public route: Router) { }
	isLoggedIn() {
		if (localStorage.getItem('token')) {
			return true;
		} else {
			return false;
		}
	}

	getModules(data) {
		return this._httpService.doPost("user/getModule", data)
	}

	getParentAppModules() {
		return this._httpService.doPost("user/getModule", {})
	}

	getRoleModuleMapping(data) {
		return this._httpService.doPost("user/getRoleModuleMapping", data)
	}

	createAppModule(data) {
		return this._httpService.doPost("user/createModule", data);
	}

	updateModule(data) {
		return this._httpService.doPost("user/updateModule", data);
	}

	getModuleById(id) {
		return this._httpService.doPost("user/getModuleByid", { modules_id: id })
	}
}