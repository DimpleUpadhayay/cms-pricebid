import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AccountDetailComponent } from './account-detail/account-detail.component';
import { LoginRouteGuard } from '../../services/login-route-guard';
import { AdminRouteGuard } from '../../services/admin-route-guard';
import { AddaccountDetailComponent } from './addAccountDetail/addaccount-detail.component';
import { ViewAccountDetailComponent } from './viewAccountDetail/view-account-detail.component';

const routes: Routes = [
  { path: 'list', component: AccountDetailComponent, canActivate: [LoginRouteGuard, AdminRouteGuard] },
  { path: 'create', component: AddaccountDetailComponent, canActivate: [LoginRouteGuard, AdminRouteGuard] },
  { path: 'update/:id', component: AddaccountDetailComponent, canActivate: [LoginRouteGuard, AdminRouteGuard] },
  { path: 'view', component: ViewAccountDetailComponent, canActivate: [LoginRouteGuard, AdminRouteGuard] },
  { path: 'view/:id', component: ViewAccountDetailComponent, canActivate: [LoginRouteGuard, AdminRouteGuard] },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AccountRoutingModule { }
