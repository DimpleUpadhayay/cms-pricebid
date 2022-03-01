import { Injectable } from '@angular/core';
import { HttpService } from './http.service';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

@Injectable()
export class ProjectScopeService {
	// parsedData = new EventEmitter<string>();
	private messageSource = new BehaviorSubject<string>("default msg");
	currentMessage = this.messageSource.asObservable();

	constructor(private _httpService: HttpService, public route: Router) { }
	isLoggedIn() {
		if (localStorage.getItem('token')) {
			return true;
		} else {
			return false;
		}
	}

	getProjectScopes(bid_id, user_type) {
		return this._httpService.doPost("projectscope/getprojectscope", { "bid_id": bid_id, "user_type": user_type })
	}


	updateProjectScope(data) {
		return this._httpService.doPost("projectscope/updateprojectscope", data)
	}

	createProjectScope(data) {
		return this._httpService.doPost("projectscope/createprojectscope", { projectScope_payload: data });
	}

	uploadParsing(data) {
		return this._httpService.doPost("RFP_process/rfpupload", data);
	}

	extractText(data) {
		return this._httpService.doPost("RFP_process/extracttext", { "rfp_data": data });
	}

	readText(data) {
		return this._httpService.doPost("RFP_process/readrfptext", data);
	}

	changeMsg(msg: string) {
		this.messageSource.next(msg);
	}
}