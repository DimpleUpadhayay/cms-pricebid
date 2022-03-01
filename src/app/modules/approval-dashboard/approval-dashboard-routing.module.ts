import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { pocComponent } from './pocDashboard/poc.component';
import { LoginRouteGuard } from '../../services/login-route-guard';
import { CustomRouteGuard } from '../../services/custom-route-gaurd';

const routes: Routes = [
  { path: 'approvalDashboard/:id', component: pocComponent, canActivate: [LoginRouteGuard, CustomRouteGuard] },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ApprovalDashboardRoutingModule { }
