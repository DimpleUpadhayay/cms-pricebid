import { NgModule } from '@angular/core';

import { UserProfileRoutingModule } from './user-profile-routing.module';
import { SharedModule } from '../shared/shared.module';
import { UserProfileComponent } from './userProfile/userProfile.component';
import { FormsModule } from '@angular/forms';

@NgModule({
  imports: [
    UserProfileRoutingModule,
    SharedModule,
    FormsModule
  ],
  declarations: [UserProfileComponent]
})
export class UserProfileModule { }
