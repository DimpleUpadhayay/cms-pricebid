import { Injectable } from '@angular/core';
import { HttpService } from './http.service';
import { Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';

@Injectable()
export class LoginService {
	user;

	constructor(private _httpService: HttpService, public router: Router) {
		// this.isLoggedIn()
	}

	doLogin(data) {
		return this._httpService.doLoginPost("user/signin", data);
	}

	isLoggedIn() {
		if (localStorage.getItem('token')) {
			return true
			// this.user = JSON.parse(localStorage.getItem('user'))['data']['user'];
			// if (this.user.user_role == 'CUSTOM') {
			// 	this.router.navigate(["/dashboard"]);
			// } else if (this.user.user_role == 'SUPPORT') {
			// 	this.router.navigate(["/company"]);
			// } else {
			// 	this.router.navigate(["/businessUnit"]);
			// }

		} else {
			return false;
		}
	}

	verifyOtp(data) {
		return this._httpService.doLoginPost('user/verifyOtp', data);
	}

	resendOtp(data) {
		return this._httpService.doLoginPost('user/resendOtp', data);
	}
	doLogout() {
		// localStorage.removeItem('token');
		// localStorage.removeItem('user');
		localStorage.clear();
		this.router.navigate(["/login"]);
	}

	getUserData() {
		if (localStorage.getItem("user") && JSON.parse(localStorage.getItem("user"))) {
			return Observable.of(JSON.parse(localStorage.getItem("user")).data.user);
		}
		else {
			return Observable.of(null)
		}
	}

	doSignUp(data) {
		return this._httpService.doLoginPost("login/signup", data);
	}

	forgotPassword(data) {
		return this._httpService.doLoginPost("user/forgotPassword", data);
	}
	changePassword(data) {
		return this._httpService.doLoginPost("user/changePassword", data);
	}

	resetPassword(data) {
		return this._httpService.doLoginPost("user/resetPassword", data);
	}
}