import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs/Rx'
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  public user;

  constructor(public router: Router) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (localStorage.getItem('user') && JSON.parse(localStorage.getItem('user'))['data']['user']) {
      this.user = JSON.parse(localStorage.getItem('user'))['data']['user'];
    }

    req = req.clone({
      headers: req.headers.set('Authorization', localStorage.getItem('token') ? localStorage.getItem('token') : '')
    });
    req = req.clone({ headers: req.headers.set('company_id', this.user && this.user.company_id ? this.user.company_id : '0') });
    //return next.handle(req);

    return next.handle(req).catch(err => {
      // // console.log(err);
      if (err instanceof HttpErrorResponse) {
        if (err.status === 401) {
          // // console.log("Session expired")
          localStorage.clear();
          this.router.navigateByUrl('/login');
        }
      }
      return Observable.throw(err);
    }) as any;
  }
}