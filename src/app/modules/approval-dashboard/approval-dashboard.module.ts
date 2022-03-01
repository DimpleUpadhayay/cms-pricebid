import { NgModule } from '@angular/core';
import { ApprovalDashboardRoutingModule } from './approval-dashboard-routing.module';
import { SharedModule } from '../shared/shared.module';
import { FormsModule } from '@angular/forms';
import { pocComponent } from './pocDashboard/poc.component';
import { BidDevelopmentModule } from '../bid-development/bid-development.module';

@NgModule({
  imports: [
    ApprovalDashboardRoutingModule,
    BidDevelopmentModule,
    SharedModule,
    FormsModule
  ],
  declarations: [pocComponent]
})
export class ApprovalDashboardModule { }
