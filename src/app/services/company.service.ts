import { Injectable } from '@angular/core';
import { HttpService } from './http.service';
import { Router } from '@angular/router';

@Injectable()
export class CompanyService {
	constructor(private _httpService: HttpService, public route: Router) { }
	isLoggedIn() {
		if (localStorage.getItem('token')) {
			return true;
		} else {
			return false;
		}
	}

	getCompanies(data) {
		return this._httpService.doPost("company/list", data)
	}

	createCompany(data) {
		return this._httpService.doPost("company/create", { company_payload: data });
	}

	getCompanyById(id) {
		return this._httpService.doPost("company/getcompanybyid", { company_id: id })
	}

	updateCompany(data) {
		return this._httpService.doPost("company/update", { company_payload: data });
	}
}