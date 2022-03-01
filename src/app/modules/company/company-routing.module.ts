import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { companyComponent } from './companyList/company.component';
import { LoginRouteGuard } from '../../services/login-route-guard';
import { SupportRouteGaurd } from '../../services/support-route-gaurd';
import { addCompanyComponent } from './addCompany/addCompany.component';
import { CompanyViewComponent } from '../company-profile/company-view/company-view.component';

const routes: Routes = [
  { path: 'list', component: companyComponent, canActivate: [LoginRouteGuard, SupportRouteGaurd] },
  { path: 'create', component: addCompanyComponent, canActivate: [LoginRouteGuard, SupportRouteGaurd] },
  { path: 'update/:id', component: addCompanyComponent, canActivate: [LoginRouteGuard, SupportRouteGaurd] },
  { path: 'view/:id', component: CompanyViewComponent, canActivate: [LoginRouteGuard, SupportRouteGaurd] },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CompanyRoutingModule { }
