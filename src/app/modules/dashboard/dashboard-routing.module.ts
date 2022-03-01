import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DashboardComponent } from './dashboard/dashboard.component';
import { LoginRouteGuard } from '../../services/login-route-guard';
import { CustomRouteGuard } from '../../services/custom-route-gaurd';

const routes: Routes = [
  { path: '', component: DashboardComponent, canActivate: [LoginRouteGuard, CustomRouteGuard] }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardRoutingModule { }
