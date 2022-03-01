import { NgModule } from '@angular/core';
import { UserRoleRoutingModule } from './user-role-routing.module';
import { SharedModule } from '../shared/shared.module';
import { FormsModule } from '@angular/forms';

import { RoleListComponent } from './userRoleList/role_list.component';
import { UserRoleComponent } from './addUserRole/user_role.component';
import { RoleListViewComponent } from './viewUserRole/role-list-view.component';

@NgModule({
  imports: [
    UserRoleRoutingModule,
    SharedModule,
    FormsModule
  ],
  declarations: [RoleListComponent, UserRoleComponent, RoleListViewComponent]
})
export class UserRoleModule { }
