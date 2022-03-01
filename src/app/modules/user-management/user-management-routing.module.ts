import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { UserListComponent } from './user_list/user_list.component';
import { LoginRouteGuard } from '../../services/login-route-guard';
import { UsersComponent } from './users/users.component';
import { UserViewComponent } from './user-view/user-view.component';

const routes: Routes = [
  { path: 'list', component: UserListComponent, canActivate: [LoginRouteGuard] },
  { path: 'create', component: UsersComponent, canActivate: [LoginRouteGuard] },
  { path: 'update/:id', component: UsersComponent, canActivate: [LoginRouteGuard] },
  { path: 'view/:id', component: UserViewComponent, canActivate: [LoginRouteGuard] },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserManagementRoutingModule { }
