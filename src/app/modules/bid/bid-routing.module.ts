import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { BidComponent } from './bid/bid.component';
import { LoginRouteGuard } from '../../services/login-route-guard';
import { CustomRouteGuard } from '../../services/custom-route-gaurd';
import { ViewbidComponent } from './viewbid/viewbid.component';

const routes: Routes = [
  { path: '', component: BidComponent, canActivate: [LoginRouteGuard, CustomRouteGuard] },
  { path: ':id', component: BidComponent, canActivate: [LoginRouteGuard, CustomRouteGuard] },
  { path: 'viewbid/:id', component: ViewbidComponent, canActivate: [LoginRouteGuard, CustomRouteGuard] }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BidRoutingModule { }
