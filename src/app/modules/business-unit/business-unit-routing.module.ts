import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { businessUnitComponent } from './businessUnit-list/businessUnit.component';
import { LoginRouteGuard } from '../../services/login-route-guard';
import { AdminRouteGuard } from '../../services/admin-route-guard';
import { addBusinessUnitComponent } from './addBusinessUnit/addBU.component';
import { BusinessUnitViewComponent } from './viewBusinessUnit/business-unit-view.component';

const routes: Routes = [
  { path: 'list', component: businessUnitComponent, canActivate: [LoginRouteGuard, AdminRouteGuard] },
  { path: 'create', component: addBusinessUnitComponent, canActivate: [LoginRouteGuard, AdminRouteGuard] },
  { path: 'update/:id', component: addBusinessUnitComponent, canActivate: [LoginRouteGuard, AdminRouteGuard] },
  { path: 'view/:id', component: BusinessUnitViewComponent, canActivate: [LoginRouteGuard, AdminRouteGuard] },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BusinessUnitRoutingModule { }
