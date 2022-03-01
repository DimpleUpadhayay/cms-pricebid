import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { UserProfileComponent } from './userProfile/userProfile.component';
import { LoginRouteGuard } from '../../services/login-route-guard';

const routes: Routes = [
  { path: '', component: UserProfileComponent, canActivate: [LoginRouteGuard] }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserProfileRoutingModule { }
