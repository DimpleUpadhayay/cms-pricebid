import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginRouteGuard } from '../../services/login-route-guard';
import { CustomRouteGuard } from '../../services/custom-route-gaurd';

import { SchedulingComponent } from './scheduling/scheduling.component';

const routes: Routes = [
  { path: ':id', component: SchedulingComponent, canActivate: [LoginRouteGuard, CustomRouteGuard] },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SchedulingRoutingModule { }
