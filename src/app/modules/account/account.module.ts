import { NgModule } from '@angular/core';
import { AccountRoutingModule } from './account-routing.module';
import { SharedModule } from '../shared/shared.module';
import { FormsModule } from '@angular/forms';

import { AccountDetailComponent } from './account-detail/account-detail.component';
import { AddaccountDetailComponent } from './addAccountDetail/addaccount-detail.component';
import { ViewAccountDetailComponent } from './viewAccountDetail/view-account-detail.component';


@NgModule({
  imports: [
    AccountRoutingModule,
    SharedModule,
    FormsModule
  ],
  declarations: [AccountDetailComponent, AddaccountDetailComponent, ViewAccountDetailComponent]
})
export class AccountModule { }
