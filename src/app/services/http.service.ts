import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
// import { ResponseContentType } from '@angular/http';
import { shareReplay } from 'rxjs/operators/shareReplay';
import { take } from 'rxjs/operators/take';
import { environment } from '../../environments/environment';


const loginBaseUrl = environment.loginBaseUrl;
const baseUrl = environment.baseUrl


@Injectable()
export class HttpService {
	constructor(private _httpClient: HttpClient) { }

	doPost(url, data) {
		return this._httpClient.post((baseUrl + url), data).pipe(
			shareReplay(1),
			take(1)
		);
	}

	doLoginPost(url, data) {
		return this._httpClient.post((loginBaseUrl + url), data);
	}

	doGet(url) {
		return this._httpClient.get(baseUrl + url).pipe(
			shareReplay(1),
			take(1)
		);
	}

	upload(data) {
		return this._httpClient.post(baseUrl + "uploadfiles/upload", data);
	}

	downloadPDF(url): any {
		return this._httpClient
			.get(baseUrl + url, {
				responseType: "blob"
			});
	}

	accessControl(data) {
		return this._httpClient.post(baseUrl + "accesscontrol/accessControl", data);
	}

	userRoleBasedButtonAccessControl(data) {
		return this._httpClient.post(baseUrl + "accesscontrol/userRoleBasedButtonAccessControl", data);
	}
}
