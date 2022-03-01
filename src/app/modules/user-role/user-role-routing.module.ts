import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { RoleListComponent } from './userRoleList/role_list.component';
import { LoginRouteGuard } from '../../services/login-route-guard';
import { UserRoleComponent } from './addUserRole/user_role.component';
import { RoleListViewComponent } from './viewUserRole/role-list-view.component';

const routes: Routes = [
  { path: 'list', component: RoleListComponent, canActivate: [LoginRouteGuard] },
  { path: 'create', component: UserRoleComponent, canActivate: [LoginRouteGuard] },
  { path: 'update/:id', component: UserRoleComponent, canActivate: [LoginRouteGuard] },
  { path: 'view/:id', component: RoleListViewComponent, canActivate: [LoginRouteGuard] }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserRoleRoutingModule { }
