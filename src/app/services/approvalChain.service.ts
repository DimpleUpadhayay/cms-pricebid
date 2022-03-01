import { Injectable } from '@angular/core';
import { HttpService } from './http.service';
import { Router } from '@angular/router';

@Injectable()
export class ApprovalChainService {
	constructor(private _httpService: HttpService, public route: Router) { }
	isLoggedIn() {
		if (localStorage.getItem('token')) {
			return true;
		} else {
			return false;
		}
	}

	getApprovalChain(data) {
		return this._httpService.doPost("approvalchain/list", data)
	}

	createApprovalChain(data) {
		return this._httpService.doPost("approvalchain/create", data);
	}

	updateApprovalChain(data) {
		return this._httpService.doPost("approvalchain/update", data);
	}

	getApprovalChainById(id) {
		return this._httpService.doPost("approvalchain/getApprovalChainById", { approval_chain_id: id })
	}

}