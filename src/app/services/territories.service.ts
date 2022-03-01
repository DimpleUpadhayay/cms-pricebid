import { Injectable } from '@angular/core';
import { HttpService } from './http.service';
import { Router } from '@angular/router';

@Injectable()
export class TerritoryService {
	constructor(private _httpService: HttpService, public route: Router) {
		this.getParentTerritories();
	}

	isLoggedIn() {
		if (localStorage.getItem('token')) {
			return true;
		} else {
			return false;
		}
	}

	getParentTerritories() {
		return this._httpService.doGet("territory/getTerritory?parent=root")
	}

	getTerritories(data) {
		return this._httpService.doPost("territory/getTerritory", data)
	}
	getTerritoriesChild(data) {
		return this._httpService.doPost("territory/getTerritory", data)
	}
	getTerritoriesParent(data) {
		return this._httpService.doPost("territory/getTerritory", data)
	}

	createTerritory(data) {
		return this._httpService.doPost("territory/createTerritory", { territory_payload: data });
	}

	updateTerritory(data) {
		return this._httpService.doPost("territory/updateTerritory", { territory_payload: data });
	}

	getTerritoryById(id) {
		return this._httpService.doPost("territory/getTerritoryById", { territory_id: id })
	}

	getTerritoryByName(data) {
		return this._httpService.doPost("territory/getSelectedTerritory", data)
	}
	
}