import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LoginRouteGuard } from '../../services/login-route-guard';
import { CustomRouteGuard } from '../../services/custom-route-gaurd';
import { psComponent } from './ps/ps.component';

const routes: Routes = [
  { path: ':id', component: psComponent, canActivate: [LoginRouteGuard, CustomRouteGuard] },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProjectScopeRoutingModule { }
