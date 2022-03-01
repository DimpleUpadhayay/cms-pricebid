import { Injectable } from '@angular/core';
import { HttpService } from './http.service';
import { Router } from '@angular/router';

@Injectable()
export class PocDashboardService {
	constructor(private _httpService: HttpService, public route: Router) { }
	isLoggedIn() {
		if (localStorage.getItem('token')) {
			return true;
		} else {
			return false;
		}
	}

	getPocDashboards(data) {
		return this._httpService.doPost("pocDashboard/list", data)
	}

	updatePocDashboard(data) {
		return this._httpService.doPost("pocDashboard/update", data)
	}

	createApprovalComments(data) {
		return this._httpService.doPost("approvalComment/create", data)
	}

	createPocDashboard(data) {
		return this._httpService.doPost("pocDashboard/create", data);
	}
}