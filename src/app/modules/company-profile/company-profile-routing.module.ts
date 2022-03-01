import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CompanyViewComponent } from './company-view/company-view.component';
import { LoginRouteGuard } from '../../services/login-route-guard';
import { AdminRouteGuard } from '../../services/admin-route-guard';

const routes: Routes = [
  { path: '', component: CompanyViewComponent, canActivate: [LoginRouteGuard, AdminRouteGuard] },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CompanyProfileRoutingModule { }
