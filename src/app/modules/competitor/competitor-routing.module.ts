import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CompetitorDetailComponent } from './competitorDetail/competitor-detail.component';
import { AddcompetitorDetailComponent } from './addCompetitorDetail/addcompetitor-detail.component';
import { ViewCompetitorDetailComponent } from './viewCompetitorDetail/view-competitor-detail.component';
import { LoginRouteGuard } from '../../services/login-route-guard';
import { AdminRouteGuard } from '../../services/admin-route-guard';

const routes: Routes = [
  { path: 'list', component: CompetitorDetailComponent, canActivate: [LoginRouteGuard, AdminRouteGuard] },
  { path: 'create', component: AddcompetitorDetailComponent, canActivate: [LoginRouteGuard, AdminRouteGuard] },
  { path: 'update/:id', component: AddcompetitorDetailComponent, canActivate: [LoginRouteGuard, AdminRouteGuard] },
  { path: 'view/:id', component: ViewCompetitorDetailComponent, canActivate: [LoginRouteGuard, AdminRouteGuard] },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CompetitorRoutingModule { }
