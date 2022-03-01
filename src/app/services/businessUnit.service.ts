import { Injectable } from '@angular/core';
import { HttpService } from './http.service';
import { Router } from '@angular/router';

@Injectable()
export class BusinessUnitService {
	constructor(private _httpService: HttpService, public route: Router) { }
	isLoggedIn() {
		if (localStorage.getItem('token')) {
			return true;
		} else {
			return false;
		}
	}

	getBusinessUnits(data) {
		return this._httpService.doPost("businessUnit/getBusinessunit", { business_unit_payload: data })
	}
	getBusinessUnitsChild(data) {
		return this._httpService.doPost("businessUnit/getBusinessunit", { business_unit_payload: data })
	}
	getBusinessUnitsParent(data) {
		return this._httpService.doPost("businessUnit/getBusinessunit", { business_unit_payload: data })
	}

	getParentUnits() {
		return this._httpService.doGet("businessUnit/getBusinessunit?parent=root")
	}

	createBusinessUnit(data) {
		return this._httpService.doPost("businessUnit/createBusinessUnit", { business_unit_payload: data });
	}

	getBusinessUnitById(id) {
		return this._httpService.doPost("businessUnit/getBusinessunitById", { business_unit_id: id })
	}
	updateBusinessUnit(data) {
		return this._httpService.doPost("businessUnit/updateBusinessUnit", { business_unit_payload: data });
	}
}