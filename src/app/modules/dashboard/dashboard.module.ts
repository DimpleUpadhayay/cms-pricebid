import { NgModule } from '@angular/core';
import { DashboardRoutingModule } from './dashboard-routing.module';
import { FormsModule } from '@angular/forms';
import { SharedModule } from '../shared/shared.module';

import { DashboardComponent } from './dashboard/dashboard.component';

@NgModule({
  imports: [
    DashboardRoutingModule,
    FormsModule,
    SharedModule
  ],
  declarations: [DashboardComponent]
})
export class DashboardModule { }
