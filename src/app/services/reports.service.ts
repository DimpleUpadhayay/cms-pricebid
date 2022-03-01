import { Injectable, EventEmitter } from '@angular/core';
import { HttpService } from './http.service';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

@Injectable()
export class ReportService {
	read: boolean = false;

	statusUpdated = new EventEmitter<object>();
	rfiUpdated = new EventEmitter<object>();
	searchUpdated = new EventEmitter<object>();
	disableHeader = new EventEmitter<object>();

	private messageSource = new BehaviorSubject<string>("default msg");
	currentMessage = this.messageSource.asObservable();

	constructor(private _httpService: HttpService, public route: Router) {

	}

	isLoggedIn() {
		if (localStorage.getItem('token')) {
			return true;
		} else {
			return false;
		}
	}

	getBidById(id) {
		return this._httpService.doPost("bid/getBidById", { bid_id: id })
	}

	valueTrendsGraphBid(data) {
		return this._httpService.doPost("bidAnalysis/valueTrendsGraphBidFilter", data)
	}

	sheetAssignment(bid_id, sheetIndex, sheetId, data) {
		return this._httpService.doPost("bid/sheetAssignment/" + bid_id + "/" + sheetId + "/" + sheetIndex, data);
	}

	getSheetAssignmentData(bid_id, sheetIndex, sheetId) {
		return this._httpService.doGet("bid/getSheetAssignmentData/" + bid_id + "/" + sheetId + "/" + sheetIndex);
	}

	getRfi(data) {
		return this._httpService.doPost("approvalComment/read", data)
	}

	changeMsg(msg: string) {
		this.messageSource.next(msg);
	}

}