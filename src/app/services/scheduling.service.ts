import { Injectable } from '@angular/core';
import { HttpService } from './http.service';
import { Router } from '@angular/router';

@Injectable()
export class SchedulingService {
	constructor(private _httpService: HttpService, public route: Router) { }
	isLoggedIn() {
		if (localStorage.getItem('token')) {
			return true;
		} else {
			return false;
		}
	}

	getSchedulings() {
		return this._httpService.doGet("schedulerbid/list")
	}

	createScheduling(data) {
		return this._httpService.doPost("schedulerbid/create", { scheduling_payload: data });
	}

	updateScheduling(data) {
		return this._httpService.doPost("schedulerbid/update", { scheduling_payload: data });
	}

	getSchedulingById(id) {
		return this._httpService.doPost("schedulerbid/getSchedulingById", { bid_id: id })
	}
}