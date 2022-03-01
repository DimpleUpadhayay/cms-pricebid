import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UserManagementRoutingModule } from './user-management-routing.module';

import { UserListComponent } from './user_list/user_list.component';
import { UsersComponent } from './users/users.component';
import { UserViewComponent } from './user-view/user-view.component';


@NgModule({
  imports: [
    UserManagementRoutingModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule
  ],
  declarations: [UserListComponent, UsersComponent, UserViewComponent]
})
export class UserManagementModule { }
