import { Injectable, EventEmitter } from '@angular/core';
import { HttpService } from './http.service';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

@Injectable()
export class SharedService {
    private messageSource = new BehaviorSubject<object>({ flag: true });
    currentMessage = this.messageSource.asObservable();

    private messageSource2 = new BehaviorSubject<object>({ flag: true });
    approval_flag = this.messageSource2.asObservable();

    read: boolean = true;

    searchUpdated = new EventEmitter<object>();
    changePassword = new EventEmitter<object>();
    disableHeader = new EventEmitter<object>();
    hideFooter = new EventEmitter<object>();
    onSaveAsDraft = new EventEmitter<object>();
    reloadSheet = new EventEmitter<object>();
    reviewType = new EventEmitter<object>();
    newData = new EventEmitter<object>();
    mainPlusButton = new EventEmitter<object>();
    headerEvent = new EventEmitter<object>();
    bidSearch = new EventEmitter<object>();
    submitForReview = new EventEmitter<object>();
    // showProposalReviewBtn = new EventEmitter<object>();

    constructor(private _httpService: HttpService, public route: Router) {

    }

    changeMessage(message: object) {
        this.messageSource.next(message);
    }

    changeApprovalFlag(message: object) {
        this.messageSource2.next(message);
    }

}